/* Offline behavior tests: no browser, requests, form submission or dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag = 'div') {
    this.tagName = tag; this.hidden = true; this.children = []; this.attrs = {};
    this.events = {}; this.dataset = {}; this.textContent = ''; this.focused = false;
    this.classList = { toggle() {}, add() {} };
  }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name]; }
  addEventListener(name, callback) { (this.events[name] ||= []).push(callback); }
  fire(name, extra = {}) { return Promise.all((this.events[name] || []).map(fn => fn(extra))); }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); return child; }
  querySelectorAll() { return []; }
  focus() { this.focused = true; }
}

function boot(config = {}, response = async () => { throw new Error('unexpected request'); }, formValues = null) {
  const ids = Object.fromEntries(['mobile-nav', 'media-gallery', 'gallery-grid', 'demo-card'].map(id => [id, new Element()]));
  if (formValues) {
    for (const id of ['beta-form', 'submit-btn', 'submit-label', 'form-mode', 'form-message', 'website-field', 'request-type']) ids[id] = new Element();
    ids['beta-form'].values = formValues;
    ids['beta-form'].reportValidity = () => true;
    ids['beta-form'].reset = () => { ids['beta-form'].wasReset = true; };
    ids['website-field'].value = '';
    ids['request-type'].value = formValues.request_type || 'early_access';
  }
  const demoLink = new Element('a');
  const menu = new Element('button'); menu.setAttribute('aria-expanded', 'false');
  const mediaLink = new Element('a'); const created = []; const requests = [];
  const document = new Element('document');
  document.getElementById = id => ids[id] || null;
  document.querySelector = sel => sel === '.menu-toggle' ? menu : null;
  document.querySelectorAll = sel => sel === '[data-media-link]' ? [mediaLink] : sel === '[data-demo-request]' ? [demoLink] : [];
  document.createElement = tag => { const el = new Element(tag); created.push(el); return el; };
  const window = new Element('window'); window.innerWidth = 850; window.GAGE_CONFIG = config; window.location = { href: '' };
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'script.js'), 'utf8'), {
    window, document, console, URL, Promise,
    FormData: class {
      constructor(form) { this.values = new Map(Object.entries(form.values)); }
      get(key) { return this.values.get(key); }
      delete(key) { this.values.delete(key); }
      append(key, value) { this.values.set(key, value); }
    },
    fetch: async (...args) => { requests.push(args); return response(...args); }
  });
  return { window, document, menu, ids, mediaLink, demoLink, created, requests };
}

test('tablet navigation stays open at the actual CSS breakpoint', () => {
  const app = boot(); app.menu.fire('click'); app.window.fire('resize');
  assert.equal(app.menu.getAttribute('aria-expanded'), 'true');
  assert.equal(app.ids['mobile-nav'].hidden, false);
});

test('Escape dismisses an open menu and returns focus to its trigger', () => {
  const app = boot(); app.menu.fire('click'); app.document.fire('keydown', { key: 'Escape' });
  assert.equal(app.ids['mobile-nav'].hidden, true); assert.equal(app.menu.focused, true);
});

test('Escape outside an open menu does not steal focus', () => {
  const app = boot(); app.document.fire('keydown', { key: 'Escape' });
  assert.equal(app.menu.focused, false);
});

test('unconfigured media stays hidden and makes no requests', () => {
  const app = boot(); assert.equal(app.ids['media-gallery'].hidden, true);
  assert.equal(app.mediaLink.hidden, true); assert.equal(app.requests.length, 0);
});

const screenshot = { reviewed: true, src: 'assets/media/assembly.webp', title: 'Assembly workflow',
  alt: 'Five-part table in the SOLIDWORKS viewport', caption: 'Authentic preview capture; native qualification pending.',
  width: 1600, height: 1000 };

test('reviewed screenshot is revealed only after its actual image loads', () => {
  const app = boot({ media: { gallery: [screenshot] } });
  const img = app.created.find(el => el.tagName === 'img'); assert.ok(img);
  assert.equal(img.src, screenshot.src); assert.equal(img.alt, screenshot.alt);
  assert.equal(app.ids['media-gallery'].hidden, true);
  img.fire('load');
  assert.equal(app.ids['media-gallery'].hidden, false); assert.equal(app.mediaLink.hidden, false);
  assert.equal(app.ids['gallery-grid'].children.length, 1);
});

test('missing image is not promoted to a finished gallery item', () => {
  const app = boot({ media: { gallery: [screenshot] } });
  app.created.find(el => el.tagName === 'img').fire('error');
  assert.equal(app.ids['media-gallery'].hidden, true); assert.equal(app.mediaLink.hidden, true);
});

test('unreviewed, incomplete and remote media never create gallery entries', () => {
  const app = boot({ media: { gallery: [
    { ...screenshot, reviewed: false }, { ...screenshot, caption: '' },
    { ...screenshot, src: 'https://example.com/photo.webp' },
    { ...screenshot, src: 'assets/media/../cad-part.svg' }
  ] } });
  assert.equal(app.created.filter(el => el.tagName === 'img').length, 0);
  assert.equal(app.requests.length, 0);
});

const demo = { reviewed: true, src: 'assets/media/demo.mp4', poster: 'assets/media/demo-poster.webp',
  captions: 'assets/media/demo.en.vtt', transcript: 'assets/media/demo-transcript.txt',
  title: 'Recorded preview walkthrough', caption: 'Authentic recording, scope described in transcript.', width: 1920, height: 1080 };
const tick = () => new Promise(resolve => setImmediate(resolve));

test('demo needs real metadata, poster, captions and transcript before display', async () => {
  const app = boot({ media: { demo } }, async path => ({ ok: true,
    text: async () => path.endsWith('.vtt') ? 'WEBVTT\n\n00:00.000 --> 00:02.000\nA recorded preview.' : 'Preview transcript.' }));
  await tick();
  const video = app.created.find(el => el.tagName === 'video'); assert.ok(video);
  assert.equal(video.controls, true); assert.notEqual(video.autoplay, true);
  assert.equal(video.muted, true);
  video.fire('loadedmetadata');
  assert.equal(app.ids['demo-card'].hidden, true);
  app.created.find(el => el.tagName === 'img').fire('load'); await tick();
  assert.equal(app.ids['demo-card'].hidden, false); assert.equal(app.ids['media-gallery'].hidden, false);
  assert.ok(app.created.some(el => el.tagName === 'track' && el.src === demo.captions));
  assert.ok(app.created.some(el => el.tagName === 'a' && el.href === demo.transcript));
});

test('absent captions or transcript keep the demo hidden', async () => {
  const app = boot({ media: { demo } }, async () => ({ ok: false, text: async () => '' }));
  await tick();
  app.created.find(el => el.tagName === 'video')?.fire('loadedmetadata');
  app.created.find(el => el.tagName === 'img')?.fire('load'); await tick();
  assert.equal(app.ids['demo-card'].hidden, true); assert.equal(app.ids['media-gallery'].hidden, true);
});

test('configured authentic gallery assets exist with the stated original PNG dimensions', () => {
  const { existsSync } = require('node:fs'); const context = { window: {} };
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'config.js'), 'utf8'), context);
  const media = context.window.GAGE_CONFIG.media;
  assert.ok(media.gallery.length >= 2 && media.gallery.length <= 6);
  if (media.demo !== null) {
    assert.equal(typeof media.demo.reviewed, 'boolean');
    for (const key of ['src', 'poster', 'captions', 'transcript']) {
      assert.ok(existsSync(join(__dirname, '..', media.demo[key])));
    }
  }
  for (const item of media.gallery) {
    const path = join(__dirname, '..', item.src); assert.ok(existsSync(path));
    const bytes = readFileSync(path);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), item.width); assert.equal(bytes.readUInt32BE(20), item.height);
    assert.equal(item.reviewed, true); assert.ok(item.alt && item.caption && item.title);
    if (!item.src.endsWith('gage-native-plate.png')) assert.match(item.alt, /watermark/i);
  }
});

test('complete gallery exposes only captioned original-size links after load', () => {
  const app = boot({ media: { gallery: [screenshot] } });
  app.created.find(el => el.tagName === 'img').fire('load');
  const full = app.created.find(el => el.tagName === 'a' && el.textContent.includes('full-size'));
  assert.equal(full.href, screenshot.src); assert.equal(full.target, '_blank');
  assert.equal(full.rel, 'noopener noreferrer');
});

test('video failure after metadata never exposes a finished demo', async () => {
  const app = boot({ media: { demo } }, async path => ({ ok: true,
    text: async () => path.endsWith('.vtt') ? 'WEBVTT\n\n00:00.000 --> 00:02.000\nPreview.' : 'Transcript.' }));
  await tick();
  const video = app.created.find(el => el.tagName === 'video');
  video.fire('loadedmetadata'); video.fire('error');
  app.created.find(el => el.tagName === 'img').fire('load'); await tick();
  assert.equal(app.ids['demo-card'].hidden, true);
});

 test('reviewed v2 video is enabled while all three gallery captures remain enabled', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'config.js'), 'utf8'), context);
  const media = context.window.GAGE_CONFIG.media;
  assert.equal(media.demo?.reviewed, true);
  assert.equal(media.gallery.length, 3);
  assert.ok(media.gallery.every(item => item.reviewed === true));

  assert.equal(media.demo.title, 'Native CAD model inspection');
  assert.match(media.demo.caption, /No chat conversion filmed/);
  assert.equal(media.demo.width, 1280); assert.equal(media.demo.height, 960);
  assert.ok(media.gallery.some(item => item.src.endsWith('gage-native-plate.png')));
 });

const contactValues = { name: 'Alex Ångström', email: 'alex@example.com', company: 'A&B Works',
  role: 'Mechanical engineer', industry: 'Manufacturing', request_type: 'demo',
  cad_tool: 'SOLIDWORKS', primary_interest: 'Drawings and exports', use_case: 'A4 + A3 drawings & revisions', consent: 'on' };
const submit = app => app.ids['beta-form'].fire('submit', { preventDefault() {} });

test('demo mail draft preserves optional context, Unicode and intent without sending', async () => {
  const app = boot({}, undefined, contactValues); await submit(app);
  const draft = new URL(app.window.location.href);
  assert.equal(draft.protocol, 'mailto:'); assert.match(draft.searchParams.get('subject'), /demo request/i);
  const body = draft.searchParams.get('body');
  for (const value of Object.values(contactValues).filter(v => v !== 'on')) {
    if (value !== 'demo') assert.ok(body.includes(value), value);
  }
  assert.match(body, /arrange a time/i); assert.equal(app.requests.length, 0);
  assert.notEqual(app.ids['beta-form'].wasReset, true);
});

test('schedule CTA selects a demo request without submitting or promising a booking', () => {
  const app = boot({}, undefined, { ...contactValues, request_type: 'early_access' });
  app.demoLink.fire('click'); assert.equal(app.ids['request-type'].value, 'demo');
  assert.match(app.ids['submit-label'].textContent, /demo/i);
  assert.equal(app.requests.length, 0); assert.equal(app.window.location.href, '');
});

test('Formspree submission preserves every field and identifies a demo request', async () => {
  const app = boot({ formEndpoint: 'https://formspree.io/f/test123' }, async () => ({ ok: true }), contactValues);
  await submit(app); assert.equal(app.requests.length, 1);
  const [url, options] = app.requests[0]; assert.equal(url, 'https://formspree.io/f/test123');
  for (const [key, value] of Object.entries(contactValues)) {
    if (key !== 'consent') assert.equal(options.body.get(key), value);
  }
  assert.equal(options.body.get('permission_to_contact'), 'Yes');
  assert.match(options.body.get('_subject'), /demo request/i);
  assert.match(app.ids['form-message'].textContent, /arrange a time/i);
  assert.match(app.ids['form-message'].textContent, /not.*booking/i);
  assert.equal(app.ids['beta-form'].wasReset, true);
});

test('failed form submission retains answers and re-enables the selected request action', async () => {
  const app = boot({ formEndpoint: 'https://formspree.io/f/test123' }, async () => ({ ok: false, json: async () => ({}) }), contactValues);
  await submit(app); assert.notEqual(app.ids['beta-form'].wasReset, true);
  assert.equal(app.ids['submit-btn'].disabled, false);
  assert.match(app.ids['submit-label'].textContent, /demo/i);
  assert.match(app.ids['form-message'].textContent, /try again|email/i);
});

test('early access and question emails keep their separate request intent', async () => {
  for (const request_type of ['early_access', 'question']) {
    const app = boot({}, undefined, { ...contactValues, request_type }); await submit(app);
    const subject = new URL(app.window.location.href).searchParams.get('subject');
    assert.match(subject, request_type === 'question' ? /question/i : /early.access/i);
    assert.doesNotMatch(subject, /demo/i);
  }
});

test('invalid form and honeypot never create a draft or a network submission', async () => {
  for (const invalid of [true, false]) {
    const app = boot({}, undefined, contactValues);
    app.ids['beta-form'].reportValidity = () => !invalid;
    if (!invalid) app.ids['website-field'].value = 'bot';
    await submit(app); assert.equal(app.window.location.href, ''); assert.equal(app.requests.length, 0);
  }
});


test('omitted optional profile fields remain optional in the email draft', async () => {
  const app = boot({}, undefined, { name: 'Alex', email: 'alex@example.com', request_type: 'demo', consent: 'on' });
  await submit(app);
  const body = new URL(app.window.location.href).searchParams.get('body');
  for (const label of ['Company / employer', 'Role', 'Industry']) assert.ok(body.includes(`${label}: Not specified`));
});

test('request choice changes the action label and never submits on change', () => {
  const app = boot({}, undefined, contactValues);
  app.ids['request-type'].value = 'question'; app.ids['request-type'].fire('change');
  assert.match(app.ids['submit-label'].textContent, /question/i);
  assert.equal(app.requests.length, 0); assert.equal(app.window.location.href, '');
});

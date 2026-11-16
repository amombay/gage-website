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
  insertBefore(child, reference) {
    const index = reference ? this.children.indexOf(reference) : this.children.length;
    assert.ok(index >= 0);
    this.children.splice(index, 0, child);
  }
  querySelectorAll() { return []; }
  focus() { this.focused = true; }
}

function boot(config = {}, response = async () => { throw new Error('unexpected request'); }, formValues = null, heroMotion = null, visuals = {}) {
  const ids = Object.fromEntries(['mobile-nav', 'media-gallery', 'gallery-grid', 'demo-card'].map(id => [id, new Element()]));
  if (formValues) {
    for (const id of ['contact-form', 'submit-btn', 'submit-label', 'form-mode', 'form-message', 'website-field', 'request-type']) ids[id] = new Element();
    ids['contact-form'].values = formValues;
    ids['contact-form'].reportValidity = () => true;
    ids['contact-form'].reset = () => { ids['contact-form'].wasReset = true; };
    ids['website-field'].value = '';
    ids['request-type'].value = formValues.request_type || 'demo';
  }
  Object.assign(ids, visuals.ids);
  const demoLink = new Element('a');
  const menu = new Element('button'); menu.setAttribute('aria-expanded', 'false');
  const mediaLink = new Element('a'); const created = []; const requests = [];
  const document = new Element('document');
  document.getElementById = id => ids[id] || null;
  document.querySelector = sel => sel === '.menu-toggle' ? menu : null;
  document.querySelectorAll = sel => sel === '[data-media-link]' ? [mediaLink]
    : sel === '[data-demo-request]' ? [demoLink] : visuals.selectors?.[sel] || [];
  document.createElement = tag => { const el = new Element(tag); created.push(el); return el; };
  const window = new Element('window'); window.innerWidth = 850; window.GAGE_CONFIG = config; window.location = { href: '' };
  window.requestAnimationFrame = callback => callback();
  window.IntersectionObserver = visuals.observer;
  if (heroMotion) {
    window.matchMedia = query => {
      assert.equal(query, '(prefers-reduced-motion: reduce)');
      return heroMotion.preference;
    };
    ids['factory-cycle'] = heroMotion.video;
  }
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

test('the hero autoplays with motion enabled and pauses when reduced motion is requested', async () => {
  const preference = new Element(); preference.matches = false;
  const video = new Element('video');
  let played = 0; let paused = 0;
  video.play = () => { played += 1; return Promise.resolve(); };
  video.pause = () => { paused += 1; };
  boot({}, undefined, null, { preference, video });
  assert.equal(played, 1);
  await preference.fire('change', { matches: true });
  assert.equal(paused, 1);
  preference.matches = true;
  boot({}, undefined, null, { preference, video });
  assert.equal(played, 1);
});

test('workflow selection changes the CAD image and skips motion when requested', async () => {
  const preference = new Element(); preference.matches = false;
  const names = ['workflow-scene', 'workflow-prompt', 'workflow-operation', 'workflow-detail', 'workflow-image', 'workflow-result'];
  const ids = Object.fromEntries(names.map(name => [name, new Element()]));
  const buttons = [0, 1, 2].map(index => {
    const button = new Element('button');
    button.dataset.example = String(index);
    button.setAttribute('aria-pressed', String(index === 0));
    return button;
  });
  let started = 0, canceled = 0;
  ids['workflow-scene'].animate = () => { started += 1; return { cancel() { canceled += 1; } }; };
  boot({}, undefined, null, { preference }, { ids, selectors: { '[data-example]': buttons } });
  await buttons[1].fire('click');
  assert.match(ids['workflow-image'].src, /gage-roller-cassette[.]png$/);
  assert.match(ids['workflow-image'].alt, /roller/i);
  assert.equal(ids['workflow-operation'].textContent, 'Insert components and constrain mates');
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
  assert.equal(started, 1);
  await buttons[1].fire('click');
  assert.equal(started, 1);
  preference.matches = true;
  await preference.fire('change', { matches: true });
  assert.equal(canceled, 1);
  await buttons[2].fire('click');
  assert.match(ids['workflow-image'].src, /gage-gripper-jaw-stress[.]png$/);
  assert.equal(started, 1);
});

test('scroll motion runs once for an entering card and leaves reduced-motion cards static', () => {
  const preference = new Element(); preference.matches = false;
  const cards = [new Element(), new Element()];
  const observed = new Set(), revealed = [];
  cards.forEach(card => card.classList.add = name => revealed.push([card, name]));
  let observer;
  const IntersectionObserver = class {
    constructor(callback) { this.report = entries => callback(entries, this); observer = this; }
    observe(node) { observed.add(node); }
    unobserve(node) { observed.delete(node); }
  };
  boot({}, undefined, null, { preference }, {
    observer: IntersectionObserver,
    selectors: { '.section-heading, .capability-card, .workflow-shell, .founder-photo, .contact-copy': cards }
  });
  assert.equal(observed.size, 2);
  observer.report([{ isIntersecting: false, target: cards[0] }]);
  assert.equal(revealed.length, 0);

  observer.report([{ isIntersecting: true, target: cards[0] }]);
  assert.deepEqual(revealed, [[cards[0], 'has-entered']]);
  assert.equal(observed.has(cards[0]), false);

  preference.matches = true;
  observer.report([{ isIntersecting: true, target: cards[1] }]);
  assert.equal(revealed.length, 1);
  assert.equal(observed.size, 0);
});

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

test('gallery keeps its configured order when images load out of order', () => {
  const later = { ...screenshot, src: 'assets/media/faster.webp', title: 'Second example' };
  const app = boot({ media: { gallery: [screenshot, later] } });
  const images = app.created.filter(el => el.tagName === 'img');
  images[1].fire('load');
  images[0].fire('load');
  assert.deepEqual(app.ids['gallery-grid'].children.map(figure => figure.children[0].href),
    [screenshot.src, later.src]);
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
  assert.ok(media.gallery.length >= 2);
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
    for (const key of ['video', 'pdf']) {
      if (item[key]) assert.ok(existsSync(join(__dirname, '..', item[key])));
    }
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

test('public media contains only the reviewed factory gallery', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'config.js'), 'utf8'), context);
  const media = context.window.GAGE_CONFIG.media;
  assert.equal(media.demo, null);
  assert.deepEqual(Array.from(media.gallery, item => item.src), [
    'assets/media/gage-factory-one-shot-poster.png',
    'assets/media/gage-roller-conveyor-transfer-poster.png',
    'assets/media/gage-factory-assembly-exploded.png',
    'assets/media/gage-factory-assembly-bom.png',
    'assets/media/gage-inspection-cell-drawing.png',
    'assets/media/gage-gripper-jaw-drawing.png',
    'assets/media/gage-gripper-jaw-stress.png',
    'assets/media/gage-roller-cassette.png',
    'assets/media/gage-pallet-inspection-nest.png'

  ]);
  assert.deepEqual(Array.from(media.gallery, item => item.video).filter(Boolean), [
    'assets/media/gage-factory-one-shot-loop.mp4',
    'assets/media/gage-roller-conveyor-transfer.mp4'
  ]);
  assert.deepEqual(Array.from(new Set(media.gallery.map(item => item.pdf).filter(Boolean))), [
    'assets/media/gage-factory-assembly-bom.pdf'
  ]);
  assert.ok(media.gallery.every(item => item.reviewed === true));
});

const contactValues = { name: 'Alex Ångström', email: 'alex@example.com', company: 'A&B Works',
  role: 'Mechanical engineer', industry: 'Manufacturing', request_type: 'demo',
  cad_tool: 'SOLIDWORKS', primary_interest: 'Drawings and exports', use_case: 'A4 + A3 drawings & revisions', consent: 'on' };
const submit = app => app.ids['contact-form'].fire('submit', { preventDefault() {} });

test('demo mail draft preserves optional context, Unicode and intent without sending', async () => {
  const app = boot({}, undefined, contactValues); await submit(app);
  const draft = new URL(app.window.location.href);
  assert.equal(draft.protocol, 'mailto:'); assert.match(draft.searchParams.get('subject'), /demo request/i);
  const body = draft.searchParams.get('body');
  for (const value of Object.values(contactValues).filter(v => v !== 'on')) {
    if (value !== 'demo') assert.ok(body.includes(value), value);
  }
  assert.match(body, /arrange a time/i); assert.equal(app.requests.length, 0);
  assert.notEqual(app.ids['contact-form'].wasReset, true);
});

test('schedule CTA selects a demo request without submitting or promising a booking', () => {
  const app = boot({}, undefined, { ...contactValues, request_type: 'question' });
  app.demoLink.fire('click', { ctrlKey: true });
  assert.equal(app.ids['request-type'].value, 'question');
  app.demoLink.fire('click'); assert.equal(app.ids['request-type'].value, 'demo');
  assert.equal(app.ids['request-type'].focused, true);
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
  assert.equal(app.ids['contact-form'].wasReset, true);
});

test('failed form submission retains answers and re-enables the selected request action', async () => {
  const app = boot({ formEndpoint: 'https://formspree.io/f/test123' }, async () => ({ ok: false, json: async () => ({}) }), contactValues);
  await submit(app); assert.notEqual(app.ids['contact-form'].wasReset, true);
  assert.equal(app.ids['submit-btn'].disabled, false);
  assert.match(app.ids['submit-label'].textContent, /demo/i);
  assert.match(app.ids['form-message'].textContent, /try again|email/i);
});

test('a question opens a separate email draft using the question subject', async () => {
  const app = boot({}, undefined, { ...contactValues, request_type: 'question' });
  await submit(app);
  const subject = new URL(app.window.location.href).searchParams.get('subject');
  assert.match(subject, /question/i);
  assert.doesNotMatch(subject, /demo/i);
});

test('invalid form and honeypot never create a draft or a network submission', async () => {
  for (const invalid of [true, false]) {
    const app = boot({}, undefined, contactValues);
    app.ids['contact-form'].reportValidity = () => !invalid;
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

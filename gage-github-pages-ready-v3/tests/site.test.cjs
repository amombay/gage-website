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
  fire(name, extra = {}) { for (const fn of this.events[name] || []) fn(extra); }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); return child; }
  querySelectorAll() { return []; }
  focus() { this.focused = true; }
}

function boot(config = {}, response = async () => { throw new Error('unexpected request'); }) {
  const ids = Object.fromEntries(['mobile-nav', 'media-gallery', 'gallery-grid', 'demo-card'].map(id => [id, new Element()]));
  const menu = new Element('button'); menu.setAttribute('aria-expanded', 'false');
  const mediaLink = new Element('a'); const created = []; const requests = [];
  const document = new Element('document');
  document.getElementById = id => ids[id] || null;
  document.querySelector = sel => sel === '.menu-toggle' ? menu : null;
  document.querySelectorAll = sel => sel === '[data-media-link]' ? [mediaLink] : [];
  document.createElement = tag => { const el = new Element(tag); created.push(el); return el; };
  const window = new Element('window'); window.innerWidth = 850; window.GAGE_CONFIG = config;
  vm.runInNewContext(readFileSync(join(__dirname, '..', 'script.js'), 'utf8'), {
    window, document, console, URL, Promise,
    fetch: async (...args) => { requests.push(args); return response(...args); }
  });
  return { window, document, menu, ids, mediaLink, created, requests };
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

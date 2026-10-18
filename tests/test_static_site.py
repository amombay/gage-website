"""Static structure/assets checks. No browser, network, submission or installs."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import urlsplit, unquote
import unittest

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids, self.elements, self.stack, self.errors, self.words = {}, [], [], [], []
        self.feed(path.read_text(encoding='utf-8'))
        self.close()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.elements.append((tag, attrs))
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append('duplicate id: ' + attrs['id'])
            self.ids[attrs['id']] = (tag, attrs)
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append('unbalanced closing tag: ' + tag)
        else:
            self.stack.pop()

    def handle_data(self, text):
        self.words.append(text)


class StaticSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pages = {name: Page(ROOT / name) for name in ('index.html', 'privacy.html')}

    def test_documents_have_balanced_structure_and_unique_ids(self):
        for name, page in self.pages.items():
            with self.subTest(page=name):
                self.assertEqual(page.errors, [])
                self.assertEqual(page.stack, [])
                self.assertEqual(sum(tag == 'h1' for tag, _ in page.elements), 1)
                self.assertEqual(sum(tag == 'main' for tag, _ in page.elements), 1)

    def test_internal_links_and_existing_resources_resolve(self):
        for name, page in self.pages.items():
            for tag, attrs in page.elements:
                for attribute in ('href', 'src'):
                    url = urlsplit(attrs.get(attribute, ''))
                    if not attrs.get(attribute) or url.scheme or url.netloc:
                        continue
                    target = ROOT / unquote(url.path or name)
                    with self.subTest(page=name, target=str(target), fragment=url.fragment):
                        self.assertTrue(target.is_file())
                        if url.fragment and target.name in self.pages:
                            self.assertIn(unquote(url.fragment), self.pages[target.name].ids)

    def test_labels_images_and_skip_links_have_accessible_targets(self):
        for name, page in self.pages.items():
            self.assertIn('main', page.ids)
            self.assertTrue(any(tag == 'a' and attrs.get('href') == '#main'
                                for tag, attrs in page.elements))
            for tag, attrs in page.elements:
                if tag == 'label' and 'for' in attrs:
                    self.assertIn(attrs['for'], page.ids)
                if tag == 'img':
                    self.assertTrue(attrs.get('alt'))
                    self.assertTrue(attrs.get('width') and attrs.get('height'))
                for relationship in ('aria-labelledby', 'aria-describedby', 'aria-controls'):
                    for reference in attrs.get(relationship, '').split():
                        self.assertIn(reference, page.ids)

    def test_workflow_buttons_identify_the_live_preview_they_update(self):
        page = self.pages['index.html']
        buttons = [attrs for tag, attrs in page.elements if tag == 'button' and 'data-example' in attrs]
        self.assertEqual(len(buttons), 3)
        for button in buttons:
            self.assertEqual(button.get('aria-controls'), 'workflow-preview')
        self.assertEqual(page.ids['workflow-preview'][1]['aria-live'], 'polite')

    def test_unconfigured_gallery_and_media_navigation_are_hidden(self):
        page = self.pages['index.html']
        for key in ('media-gallery', 'gallery-grid', 'demo-card'):
            self.assertIn('hidden', page.ids[key][1])
        links = [a for tag, a in page.elements if tag == 'a' and 'data-media-link' in a]
        self.assertGreaterEqual(len(links), 2)
        self.assertTrue(all('hidden' in attrs for attrs in links))
        self.assertFalse(any(tag == 'video' for tag, _ in page.elements))

    def test_form_cannot_send_without_its_javascript_handler(self):
        attrs = self.pages['index.html'].ids['submit-btn'][1]
        self.assertIn('disabled', attrs)
        self.assertEqual(self.pages['index.html'].ids['beta-form'][1]['method'], 'post')

    def test_copy_preserves_preview_and_usage_boundaries(self):
        text = ' '.join(self.pages['index.html'].words).lower()
        for phrase in ('codex usage', 'mit open source', 'unsigned', 'native qualification', '7,149', '848', '9', 'simulation', 'crash'):
            self.assertIn(phrase, text)
        self.assertNotIn('unlimited cad automation for free', text)
        self.assertNotIn('not a live gage feature yet', text)

    def test_authentic_asset_hashes_match_provenance(self):
        directory = ROOT / 'assets' / 'media'
        manifest = json.loads((directory / 'provenance.json').read_text(encoding='utf-8'))
        self.assertGreaterEqual(len(manifest['assets']), 2)
        for item in manifest['assets']:
            path = directory / item['file']
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), item['sha256'])
            self.assertIs(item['source_pixels_unchanged'], True)
            self.assertIs(item['watermarks_and_full_frame_preserved'], True)

    def test_delivered_native_package_hashes_and_review_metadata(self):
        directory = ROOT / 'assets' / 'media'
        native = json.loads((directory / 'native-demo-provenance.json').read_text())
        reviewed = json.loads((ROOT / 'media-review/native-turntable.reviewed.json').read_text(encoding='utf-8'))
        self.assertIs(reviewed['reviewed'], True)
        self.assertEqual(native['status'], 'parent_browser_review_passed')
        self.assertTrue(native['source_artifact'].endswith('gage-native-turntable-v2.mp4'))
        self.assertEqual((native['native_frame_count'], native['unique_native_frames_per_second'], native['playback_fps']), (120, 4, 24))
        self.assertEqual(reviewed['verifiedGeometry']['plateDimensions'], [100, 60, 5])
        for name, record in native['files'].items():
            data = (directory / name).read_bytes()
            self.assertEqual(len(data), record['bytes'])
            self.assertEqual(hashlib.sha256(data).hexdigest(), record['sha256'])
        for key in ('video', 'poster', 'captions', 'transcript'):
            field = 'src' if key == 'video' else key
            self.assertEqual(reviewed['sha256'][key], native['files'][Path(reviewed[field]).name]['sha256'])
        transcript = (directory / 'gage-demo-transcript.txt').read_text(encoding='utf-8')
        self.assertIn('Academic Use Only', transcript)
        self.assertIn('120 actual native viewport images', transcript)
        public = (directory / 'native-demo-provenance.json').read_text()
        self.assertNotRegex(public, r'(?i)[a-z]:[\\/]|users[\\/]|"pid"')

    def test_video_height_is_bounded_without_cropping_or_mobile_fixed_height(self):
        css = (ROOT / 'styles.css').read_text(encoding='utf-8')
        rule = re.search(r'\.demo-video\s*\{([^}]+)\}', css).group(1)
        declarations = dict((key.strip(), value.strip()) for key, value in
                            (item.split(':', 1) for item in rule.split(';') if ':' in item))
        self.assertEqual(declarations['max-height'], '70vh')
        self.assertEqual(declarations['width'], '100%')
        self.assertEqual(declarations['height'], 'auto')
        self.assertEqual(declarations['object-fit'], 'contain')
        self.assertEqual(declarations['object-position'], 'center')
        self.assertEqual(declarations['background'], '#04101f')

    def test_local_assets_use_current_release_urls(self):
        for name, expected in (('index.html', {'styles.css', 'config.js', 'script.js'}),
                               ('privacy.html', {'styles.css'})):
            found = set()
            for tag, attrs in self.pages[name].elements:
                raw = attrs.get('src') if tag == 'script' else attrs.get('href') if tag == 'link' else None
                if raw:
                    url = urlsplit(raw)
                    if url.path in expected:
                        self.assertEqual(url.query, 'v=20261018-preview4')
                        found.add(url.path)
            self.assertEqual(found, expected)



    def test_demo_and_optional_profile_fields_are_labelled_and_not_required(self):
        page = self.pages['index.html']
        for key, field_name in [('company', 'company'), ('role', 'role'), ('industry', 'industry')]:
            tag, attrs = page.ids[key]
            self.assertEqual(attrs['name'], field_name)
            self.assertNotIn('required', attrs)
            self.assertTrue(any(t == 'label' and a.get('for') == key for t, a in page.elements))
        self.assertEqual(page.ids['industry'][0], 'select')
        self.assertEqual(page.ids['request-type'][1]['name'], 'request_type')
        self.assertIn('required', page.ids['consent'][1])
        self.assertGreaterEqual(sum(t == 'a' and 'data-demo-request' in a for t, a in page.elements), 3)

    def test_privacy_explains_optional_context_and_unconfirmed_demo(self):
        text = ' '.join(self.pages['privacy.html'].words).lower()
        for term in ['company / employer', 'industry', 'role', 'email draft', 'formspree', 'does not confirm a booking', 'not automatic newsletter']:
            self.assertIn(term, text)
        self.assertIn('not production-ready', ' '.join(self.pages['index.html'].words).lower())

    def test_founder_education_current_roles_and_real_portrait_are_explicit(self):
        page = self.pages['index.html']; text = ' '.join(page.words)
        for fact in ['Mechanical Engineering (B.Sc.)', 'Business Economics (B.A.)', 'Brown University',
                     'Associate of Arts and Sciences', 'Carroll Community College',
                     'Industrial Digital Strategist Intern', 'Siemens Digital Industries Software', 'Co-Founder & CEO', 'Vastro']:
            self.assertIn(fact, text)
        images = [a for t, a in page.elements if t == 'img' and a.get('class') == 'founder-photo']
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0]['src'], 'assets/andrew-mombay.jpg')
        self.assertEqual((images[0]['width'], images[0]['height']), ('800', '800'))
        self.assertEqual(images[0]['loading'], 'lazy')
        self.assertIn('do not imply endorsement', text)
if __name__ == '__main__':
    unittest.main()

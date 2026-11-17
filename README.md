# Gage website

The Gage website presents editable SOLIDWORKS CAD, the factory gallery, and email-based demo requests. Gage runs with a compatible local SOLIDWORKS installation and supports either Codex usage or an OpenAI project API key for planning. The website has no public app installer.

## Publish with GitHub Pages

Use **Settings → Pages → Deploy from a branch** and select **main** and **/(root)**. Keep index.html at the repository root next to privacy.html, styles.css, config.js, script.js, and assets/. A push to main updates the [live Gage site](https://amombay.github.io/gage-website/).

## Contact and demos

By default the form opens a draft in Gmail or Outlook on the web. The visitor must send the message to submit their request. Company, role, industry, CAD software, and workflow information are optional. Demo times are arranged by email.

To accept online submissions, set formEndpoint in config.js to a public Formspree form URL such as https://formspree.io/f/YOUR_FORM_ID. Keep credentials and private tokens out of this public file. The form explains which submission method it uses.

## Gallery and typography

The gallery uses reviewed factory CAD captures, motion replays, drawings, a bill of materials, and a 100 N static jaw study. The continuous hero loop combines the robot CAD replay with illustrated conveyor transfers and empty return. The hero loop and the rotating prompts respect reduced-motion settings. See [media provenance](assets/media/provenance.json) for references to the source files.

The website self-hosts [Inter 4.1](https://rsms.me/inter/) under the included [SIL Open Font License 1.1](assets/fonts/Inter-OFL.txt).

## Run locally

From the checkout root, run:

    python -m http.server 8000

Open http://localhost:8000/. Run the website tests from the same directory:

    node --test tests/site.test.cjs
    python -B -m unittest discover -s tests -p test_static_site.py

The [website QA record](QA-RECORD.md) and [media handoff](MEDIA-HANDOFF.md) preserve earlier release and capture evidence.

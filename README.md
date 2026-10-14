# Gage — Digital Blueprint website

**Built by engineers, for engineers.** An AI-powered CAD project for part creation, complete assemblies, and simulation workflows. Includes a modern dark-blue blueprint landing page, About, Contact, interactive concept demo, roadmap, FAQs, early-access signup, and privacy notice.

This package is optimized for **simple GitHub Pages deployment**. Unlike the original v2 ZIP, **`index.html` is at the repository root**. GitHub can now publish directly from your `main` branch even when a hidden workflow folder is missed during browser upload.

> Working name and product claims: Gage is a working brand name. Part / assembly / simulation descriptions refer to the product vision and ongoing development, not independently verified, generally available features. ChatGPT and Claude account connections are planned, not active: a consumer subscription does **not** necessarily authorize access to third-party apps or remove API costs. Simulation work requires a compatible solver/license and engineering validation. Gage is not affiliated with SOLIDWORKS/Dassault Systèmes, OpenAI, or Anthropic.

## Files

```text
index.html                   <- Main landing page (AT REPO ROOT)
privacy.html                 <- Privacy statement
styles.css                   <- Layout and theme
script.js                    <- Navigation, concept demo, beta form
config.js                    <- Public Formspree endpoint & contact email
assets/                      <- CAD artwork, social sharing, icons
.nojekyll                    <- Serve directly (may be hidden on some PCs)
.github/workflows/deploy.yml <- OPTIONAL GitHub Actions deployment
START-HERE.txt               <- Short deployment instructions
README.md                    <- This guide
```

## Recommended publishing method — no workflow required

1. Extract this ZIP to a folder on your computer.
2. Open your GitHub repository: https://github.com/amombay/gage-website
3. Upload **the contents** of the extracted folder to your repository's **`main` branch**, overwriting the old files if prompted. Make sure `index.html` is visible on the **top level** of the repository, next to `README.md` and `assets/`. If the original `site/` folder is still present from v2, you may delete it afterward; the new website does not use it.
4. Go to **Settings → Pages → Build and deployment**.
5. Set **Source = Deploy from a branch**, **Branch = main**, **Folder = /(root)** and click **Save**. This is the best option if GitHub never showed the custom workflow under Actions.
6. After GitHub publishes, open **https://amombay.github.io/gage-website/**. Under **Settings → Pages**, GitHub shows the published URL/status. A new commit triggers a new deployment automatically.

**Do not choose `/(docs)`**, and do not leave the source as `GitHub Actions` unless you uploaded the optional workflow file. If you see a 404, double-check `index.html` is at repository root and Pages is publishing `main` `/(root)`.

### Alternative: use the included GitHub Actions workflow

This ZIP also includes `.github/workflows/deploy.yml`. If it is in GitHub at exactly that path, you can use **Source = GitHub Actions**. The action deploys the repository root (`path: .`) and will run on pushes to the `main` branch or from the **Actions** tab. If it doesn't appear in GitHub, your uploader omitted the hidden `.github` folder. Either upload that path explicitly via GitHub Desktop / Git, or switch to **Deploy from a branch** as above.

## Beta signup configuration

GitHub Pages is static hosting; it **does not store submitted forms** by itself.

- **Default mode, no setup:** the form opens a drafted email with the visitor's answers. **They must explicitly send the email**, and no lead is saved automatically.
- **Recommended:** create a form at [Formspree](https://formspree.io/), then edit **`config.js`** in your GitHub repository:

```js
window.GAGE_CONFIG = {
  formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
  contactEmail: 'andrew_mombay@brown.edu'
};
```

Commit the file. Once redeployed, submit a test signup and **verify its receipt** in your Formspree dashboard. Keep all real secrets out of `config.js` (it is public). Review the [privacy page](privacy.html) to ensure it accurately reflects your form vendor and use of data.

## Customize the website

| What | File |
|---|---|
| Tagline, capabilities, About, Contact, FAQ | `index.html` |
| Colors, font/layout and responsive styles | `styles.css` |
| CAD demo examples and form functionality | `script.js` |
| Contact email and beta submission endpoint | `config.js` |
| Privacy policy | `privacy.html` |
| Blueprint illustration and branding graphics | `assets/` |

The sample email address is `andrew_mombay@brown.edu`. Verify any social profile URLs before launch.

## Preview locally

From the extracted folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ . All assets use relative paths so they work in the GitHub Pages `/gage-website/` subdirectory.

## Launch checklist

- [ ] Repository root displays `index.html` directly.
- [ ] Settings → Pages is set to `main` `/(root)` (recommended).
- [ ] The published page displays correctly on desktop and mobile.
- [ ] About, Contact, FAQ and anchor links work.
- [ ] Formspree is connected and a test submission has arrived, **if** collecting signups online.
- [ ] Contact and links are accurate, privacy text reviewed.
- [ ] Trademark and domain checks completed if launching Gage as a commercial brand.

All artwork included is original concept illustration. This is a static marketing site, not a functioning CAD engine or released simulation product.

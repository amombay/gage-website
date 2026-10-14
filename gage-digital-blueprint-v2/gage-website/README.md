# Gage — Digital Blueprint landing page

A polished, responsive, **ready-to-deploy static website** for Gage, an independent AI-assisted CAD project. Navy-and-cyan Digital Blueprint design with an original SVG CAD illustration, dedicated parts / assemblies / simulations capabilities, interactive workflow examples, provider integration overview, roadmap, About and Contact sections, expanded FAQ, accessible beta application, and privacy page.

> **Working brand name:** Gage has not been cleared for trademark or domain use. Check legal and domain availability before publicly branding a commercial product.

## Folder structure

```text
gage-website/
├── .github/workflows/deploy.yml  # Automatic GitHub Pages deployment
├── .gitignore
├── README.md                     # This guide
└── site/
    ├── index.html                # Main landing page
    ├── privacy.html              # Privacy note
    ├── styles.css                # Styles and breakpoints
    ├── script.js                 # Mobile nav, interactive demo, beta form
    ├── config.js                 # Public email + Formspree configuration
    ├── .nojekyll                 # Serve files directly
    ├── robots.txt
    └── assets/
        ├── cad-part.svg          # Original, illustrative CAD render
        ├── favicon.svg
        ├── favicon-32.png
        ├── apple-touch-icon.png
        └── social-preview.png
```

No Node, bundlers, paid hosting, API keys, fonts, or external JavaScript libraries are needed.

## Claims and provider authentication (important)

The messaging **“Built by engineers, for engineers”** and **“Design parts. Build assemblies. Run simulations.”** describes Gage’s intended CAD-agent scope. Assembly and simulation functionality is presented as **development targets**, not as publicly available, certified features. Demo prompts and illustrations are illustrative only.

**ChatGPT and Claude** are listed as **intended integration pathways**, not functional account-login buttons. In particular:

- OpenAI offers account-connected partner tool support to **participating apps**, subject to plan eligibility and enrollment: https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites
- Anthropic recommends **API authentication for independent third-party apps**, so a Claude subscription does not automatically cover Gage: https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account
- Do not claim that users can authenticate directly with either subscription until an authorized integration is implemented and tested. Usage limits, charges, and terms can change.
- Simulation studies also require supported software/solver licenses and independent engineering validation.

## 1. Preview locally

From the root of this folder:

```bash
python -m http.server 8000 --directory site
```

Open **http://localhost:8000/**.

You can also open `site/index.html` directly in a browser, although a local server is recommended for testing.

## 2. Deploy to GitHub Pages

1. Create a new repository on GitHub, for example `gage-website`. Use the **main** branch.
2. Put **the contents of `gage-website/`** at your repository root. Your GitHub repository should have `.github/`, `README.md`, and `site/` at its root, not an extra parent folder.
3. Commit and push to `main`. If you prefer the terminal, from inside `gage-website/`:

```bash
git init
git branch -M main
git add .
git commit -m "Launch Gage landing page"
git remote add origin https://github.com/YOUR-USERNAME/gage-website.git
git push -u origin main
```

If Git tells you to set an identity or authenticate, follow its account instructions.

4. Open your repo **Settings → Pages → Build and deployment**, and set **Source: GitHub Actions**.
5. The included workflow publishes the contents of `site/`. Under **Actions**, confirm the deploy job succeeds. Your site URL will be shown in the Pages settings / deploy log; a typical project URL is:

   `https://YOUR-USERNAME.github.io/gage-website/`

The page uses **relative asset paths**, so it works under a GitHub repository subpath as well as at a custom-domain root. There is no need to change a Vite `base` option.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 3. Make beta signups work (important)

**GitHub Pages cannot save form submissions by itself.** The included form works in two explicitly different modes:

### Default: prefilled email (no setup)

If `formEndpoint` in `site/config.js` is empty, completing the form and clicking **Prepare beta request** opens the user's email program with their answers. The user must send the email. **Nothing is collected automatically, and the form does not claim success.** Some browsers and computers have no email app configured; visitors can always email the address shown in the contact section.

### Recommended: Formspree (actual online submissions)

1. Sign up at https://formspree.io/ and create a form to collect beta applications.
2. Complete any email verification steps Formspree requires.
3. Copy the form endpoint, typically `https://formspree.io/f/abcdefgh`.
4. Open `site/config.js` and replace the empty value:

```javascript
window.GAGE_CONFIG = {
  formEndpoint: 'https://formspree.io/f/abcdefgh',
  contactEmail: 'andrew_mombay@brown.edu'
};
```

5. Commit the file. GitHub Pages redeploys automatically.
6. Submit a **real test application** and check the Formspree dashboard/notification email. Verify that Formspree handles spam, consent, and any applicable privacy/legal obligations for your situation.

Once configured, the site sends a `POST` to Formspree and shows genuine success/error feedback based on the service response. It doesn't claim completion on a failed request. An `Accept: application/json` header is used for form service errors and success responses. The honeypot reduces some automated spam but does not guarantee protection. A public endpoint is normal; **never put API secrets into `config.js` or public GitHub code**.

Formspree reference: https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax

## 4. Customize the site

| What to update | Where |
|---|---|
| Site title, positioning, capability cards, About, Contact, FAQ, brand text | `site/index.html` |
| Palette, responsive layout and spacing | `site/styles.css` (`:root` variables) |
| Owner email and form endpoint | `site/config.js`, `site/index.html`, `site/privacy.html` |
| Three illustrative part / assembly / simulation examples | `examples` array in `site/script.js` |
| Privacy policy before production | `site/privacy.html` |
| CAD illustration | `site/assets/cad-part.svg` |
| Favicon/social preview | `site/assets/` |

**Important content accuracy:** The hero and workflow mockups are **illustrative concepts**, not screenshots from a shipped product. The copy describes the project as a prototype, not a generally available application. Early development discusses SolidWorks-related workflows but doesn't promise full compatibility. This is an independent project and is not affiliated with Dassault Systèmes / SOLIDWORKS.

For a custom domain: use **Settings → Pages → Custom domain**, then add the DNS records recommended by GitHub. Configure HTTPS. Domain registration is separate from website hosting.

## 5. Launch checklist

- [ ] Verify the project and contact email are correct.
- [ ] Verify the Gage name and selected domain are available for your intended use.
- [ ] Configure and **test** Formspree if you want beta signups collected online.
- [ ] Review the privacy text to ensure it accurately reflects your chosen services.
- [ ] Preview at desktop and mobile sizes.
- [ ] Confirm the GitHub Actions deployment succeeds and all links work on the live Pages URL.
- [ ] Swap the concept CAD graphic for approved screenshots/video when available.

## Design and technical notes

- 100% hand-coded HTML, CSS, and vanilla JS; no tracking or external asset dependencies.
- Responsive at mobile/tablet/desktop breakpoints; system fonts for fast page loads.
- Keyboard-friendly menu, form labels, visible focus rings, reduced-motion support, semantic headings, meaningful image alt text.
- Client-side form validation and an opt-in contact checkbox; third-party form data is handled by the chosen service.
- Compatible with a normal static host beyond GitHub Pages (Netlify, Cloudflare Pages, etc.).

© 2026 Gage project. All rights reserved; no open-source license is granted by this template.

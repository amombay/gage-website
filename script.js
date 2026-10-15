/* Gage website — lightweight behavior, no analytics or framework dependencies. */
(() => {
  'use strict';

  const config = window.GAGE_CONFIG || {};
  const emailAddress = typeof config.contactEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)
    ? config.contactEmail
    : 'andrew_mombay@brown.edu';
  const endpoint = typeof config.formEndpoint === 'string' && /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(config.formEndpoint.trim())
    ? config.formEndpoint.trim()
    : '';

  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menu && mobileNav) {
    const closeNav = (restoreFocus = false) => {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
      mobileNav.hidden = true;
      if (restoreFocus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mobileNav.hidden = isOpen;
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNav()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeNav(true);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1060) closeNav();
    });
  }

  // Authentic local media is opt-in. Empty config creates no requests or slots.
  // Captions are supplied by the parent; illustration artwork is never evidence.
  const media = config.media || {};
  const mediaSection = document.getElementById('media-gallery');
  const gallery = document.getElementById('gallery-grid');
  const demoCard = document.getElementById('demo-card');
  const mediaLinks = document.querySelectorAll('[data-media-link]');
  let loadedImages = 0;
  let loadedDemo = false;
  const syncMedia = () => {
    const visible = loadedImages > 0 || loadedDemo;
    if (mediaSection) mediaSection.hidden = !visible;
    if (gallery) gallery.hidden = loadedImages === 0;
    mediaLinks.forEach(link => { link.hidden = !visible; });
  };
  const localAsset = (path, extensions) => typeof path === 'string'
    && /^assets\/media\/[a-zA-Z0-9][a-zA-Z0-9/_\-.]*$/.test(path)
    && !path.includes('..') && new RegExp(`\\.(${extensions})$`, 'i').test(path);
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const described = item => item && item.reviewed === true && text(item.title) && text(item.caption)
    && Number.isInteger(item.width) && item.width > 0 && Number.isInteger(item.height) && item.height > 0;
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  if (mediaSection && gallery && Array.isArray(media.gallery)) {
    media.gallery.slice(0, 6).forEach(item => {
      if (!described(item) || !text(item.alt) || !localAsset(item.src, 'png|jpe?g|webp')) return;
      const image = element('img');
      image.alt = item.alt; image.width = item.width; image.height = item.height; image.decoding = 'async';
      const figure = element('figure', 'media-card');
      const link = element('a', 'media-image-link');
      link.href = item.src; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Open original image: ${item.title} (new tab)`);
      const caption = element('figcaption', 'media-caption');
      const fullSize = element('a', 'text-link media-fullsize', 'View full-size capture (new tab)');
      fullSize.href = item.src; fullSize.target = '_blank'; fullSize.rel = 'noopener noreferrer';
      caption.append(element('h3', '', item.title), element('p', '', item.caption), fullSize);
      link.append(image); figure.append(link, caption);
      let added = false;
      image.addEventListener('load', () => {
        if (added) return;
        added = true; gallery.append(figure); loadedImages += 1; syncMedia();
      });
      // A missing image remains absent; no broken-image placeholder is shown.
      image.addEventListener('error', () => {});
      image.src = item.src;
    });
  }

  const demo = media.demo;
  if (mediaSection && demoCard && described(demo) && localAsset(demo.src, 'mp4|webm')
      && localAsset(demo.poster, 'png|jpe?g|webp') && localAsset(demo.captions, 'vtt')
      && localAsset(demo.transcript, 'txt')) {
    const video = element('video', 'demo-video');
    video.controls = true; video.muted = true; video.playsInline = true; video.preload = 'metadata';
    video.width = demo.width; video.height = demo.height; video.poster = demo.poster;
    video.setAttribute('aria-label', demo.title);
    const track = element('track');
    track.kind = 'captions'; track.srclang = 'en'; track.label = 'English captions';
    track.default = true; track.src = demo.captions;
    video.append(track, element('p', '', 'Use the recording link or read the transcript if video playback is unavailable.'));
    const caption = element('figcaption', 'media-caption');
    const transcript = element('a', 'text-link', 'Read the demo transcript');
    transcript.href = demo.transcript;
    const download = element('a', 'text-link', 'Open the recording');
    download.href = demo.src;
    const links = element('div', 'media-text-links'); links.append(transcript, download);
    caption.append(element('h3', '', demo.title), element('p', '', demo.caption), links);
    demoCard.append(video, caption);
    const poster = element('img');
    let metadataReady = false, posterReady = false, textReady = false, failed = false;
    const reveal = () => {
      loadedDemo = !failed && metadataReady && posterReady && textReady;
      demoCard.hidden = !loadedDemo; syncMedia();
    };
    const fail = () => { failed = true; reveal(); };
    video.addEventListener('loadedmetadata', () => { metadataReady = true; reveal(); });
    video.addEventListener('error', fail);
    poster.addEventListener('load', () => { posterReady = true; reveal(); });
    poster.addEventListener('error', fail);
    const fetchText = async path => {
      const response = await fetch(path, { credentials: 'omit', cache: 'no-cache' });
      if (!response.ok) throw new Error('Media text unavailable');
      return response.text();
    };
    Promise.all([fetchText(demo.captions), fetchText(demo.transcript)]).then(([captions, transcriptText]) => {
      if (!/^WEBVTT(?:\s|$)/.test(captions) || !captions.includes('-->') || !transcriptText.trim()) {
        fail(); return;
      }
      textReady = true; reveal();
    }).catch(fail);
    poster.src = demo.poster; video.src = demo.src;
  }

  const examples = [
    {
      prompt: '“Create a 100 × 60 mm base plate with four mounting holes.”',
      operation: 'Sketch, extrude, and add features',
      detail: 'Build an editable base plate with a dimensioned hole pattern.',
      path: 'SKETCH → EXTRUDE → HOLE PATTERN'
    },
    {
      prompt: '“Assemble the bracket, base plate, and fasteners with the correct mates.”',
      operation: 'Insert components and constrain mates',
      detail: 'Position parts, define assembly relationships, and check the structure.',
      path: 'COMPONENTS → MATES → REBUILD'
    },
    {
      prompt: '“Run a static study on the bracket under a 500 N downward load.”',
      operation: 'Configure and run a supported study',
      detail: 'Define material, fixtures, loads, and mesh; run the solver and review results.',
      path: 'SETUP → SOLVER → ENGINEER REVIEW'
    }
  ];

  const workflowButtons = [...document.querySelectorAll('[data-example]')];
  const workflowPrompt = document.getElementById('workflow-prompt');
  const workflowOperation = document.getElementById('workflow-operation');
  const workflowDetail = document.getElementById('workflow-detail');
  const workflowCode = document.getElementById('workflow-code');
  const workflowState = document.getElementById('workflow-state');
  workflowButtons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.example);
    const example = examples[index];
    if (!example) return;
    workflowButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    workflowPrompt.textContent = example.prompt;
    workflowOperation.textContent = example.operation;
    workflowDetail.textContent = example.detail;
    workflowCode.textContent = example.path;
    workflowState.textContent = `STEP 0${index + 1}/03`;
  }));

  const form = document.getElementById('beta-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitLabel = document.getElementById('submit-label');
  const formMode = document.getElementById('form-mode');
  const message = document.getElementById('form-message');
  const showMessage = (value, error = false) => {
    message.hidden = false;
    message.textContent = value;
    message.classList.toggle('error', error);
  };

  if (form && submitBtn && submitLabel && message) {
    submitBtn.disabled = false;
    if (endpoint) {
      submitLabel.textContent = 'Request beta access';
      formMode.textContent = 'We’ll use your details only to review beta interest and contact you about Gage.';
    } else {
      submitLabel.textContent = 'Prepare beta request';
      formMode.textContent = 'The form opens a prefilled email for you to review and send. Nothing is submitted automatically.';
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      message.hidden = true;
      if (!form.reportValidity()) {
        showMessage('Please complete the required fields and enter a valid email address.', true);
        return;
      }
      if (document.getElementById('website-field').value.trim()) {
        showMessage('Unable to process this submission. Please contact us by email.', true);
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const role = String(data.get('role') || '').trim();
      const cadTool = String(data.get('cad_tool') || '').trim();
      const interest = String(data.get('primary_interest') || '').trim();
      const useCase = String(data.get('use_case') || '').trim();

      if (!endpoint) {
        const body = [
          'Hello,',
          '',
          "I'd like to express interest in the Gage private beta.",
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          `Role: ${role || 'Not specified'}`,
          `Primary CAD software: ${cadTool || 'Not specified'}`,
          `Primary interest: ${interest || 'Not specified'}`,
          `What I would use Gage for: ${useCase || 'Not specified'}`,
          '',
          'I agree to be contacted about beta testing and Gage product updates.',
          '',
          'Thank you!'
        ].join('\n');
        const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent('Gage — private beta interest')}&body=${encodeURIComponent(body)}`;
        showMessage('Your email app should open with a prepared request. Please send that email to complete your submission. If nothing opens, email us directly.');
        window.location.href = mailto;
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Sending request…';
      try {
        data.delete('consent');
        data.append('permission_to_contact', 'Yes');
        data.append('_subject', 'Gage — new beta request');
        const response = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
          let errorDetails = '';
          try {
            const result = await response.json();
            if (Array.isArray(result.errors)) errorDetails = result.errors.map(item => item.message).filter(Boolean).join(' ');
          } catch (_) { /* service returned non-JSON error */ }
          throw new Error(errorDetails || 'The form service could not accept your request.');
        }
        showMessage('Request received! Thanks for your interest in Gage. We’ll be in touch if an opportunity to test opens up.');
        form.reset();
      } catch (err) {
        showMessage(`${err.message || 'Could not submit your request.'} Please try again or email ${emailAddress}.`, true);
      } finally {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Request beta access';
      }
    });
  }

  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();

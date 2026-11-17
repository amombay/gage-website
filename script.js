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
      if (window.innerWidth > 920) closeNav();
    });
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const factoryCycle = document.getElementById('factory-cycle');
  if (factoryCycle && reducedMotion) {
    if (!reducedMotion.matches) factoryCycle.play().catch(() => {});
    reducedMotion.addEventListener('change', event => {
      if (event.matches) factoryCycle.pause();
    });
  }

  const capabilityPrompts = document.querySelector('.capability-prompts');
  if (capabilityPrompts && reducedMotion) {
    const line = capabilityPrompts.querySelector('.capability-prompt-line');
    const output = line.querySelector('[data-prompt-text]');
    const examples = capabilityPrompts.querySelector('.capability-prompt-examples');
    const phrases = Array.from(examples.querySelectorAll('li'), item => item.textContent);
    const hold = 3200;
    const observeVisibility = typeof window.IntersectionObserver === 'function';
    let inView = !observeVisibility;
    let index = 0, length = phrases[0].length, erasing = true, timer;

    // Reserve space for wrapped prompts so the cards below stay in place.
    phrases.forEach(phrase => {
      const reserve = document.createElement('span');
      reserve.className = 'capability-prompt-reserve';
      reserve.textContent = phrase;
      line.append(reserve);
    });
    output.textContent = phrases[0];

    const schedule = delay => {
      window.clearTimeout(timer);
      if (inView && !reducedMotion.matches && !document.hidden) timer = window.setTimeout(tick, delay);
    };
    const tick = () => {
      const phrase = phrases[index];
      length += erasing ? -1 : 1;
      output.textContent = phrase.slice(0, length);
      if (length === 0) {
        index = (index + 1) % phrases.length;
        erasing = false;
        schedule(220);
      } else if (length === phrase.length) {
        erasing = true;
        schedule(hold);
      } else {
        schedule(erasing ? 24 : 45);
      }
    };
    const restartTimer = () => schedule(length === phrases[index].length ? hold : 120);
    const syncMotion = () => {
      line.hidden = reducedMotion.matches;
      examples.classList.toggle('sr-only', !reducedMotion.matches);
      restartTimer();
    };
    if (observeVisibility) {
      new window.IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        restartTimer();
      }).observe(capabilityPrompts);
    }
    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', restartTimer);
    syncMotion();
  }

  const entranceObserver = typeof window.IntersectionObserver === 'function'
    ? new window.IntersectionObserver((entries, observer) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          if (!reducedMotion?.matches) target.classList.add('has-entered');
          observer.unobserve(target);
        });
      }, { threshold: .08 })
    : null;

  if (entranceObserver) {
    document.querySelectorAll('.section-heading, .capability-card, .workflow-shell, .founder-photo, .contact-copy')
      .forEach(item => entranceObserver.observe(item));
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
    const visibleCards = [];
    media.gallery.forEach((item, index) => {
      if (!described(item) || !text(item.alt) || !localAsset(item.src, 'png|jpe?g|webp')) return;
      const revision = typeof item.revision === 'string' && /^[a-z0-9-]+$/.test(item.revision)
        ? '?v=' + item.revision : '';
      const imageUrl = item.src + revision;
      const image = element('img');
      image.alt = item.alt; image.width = item.width; image.height = item.height; image.decoding = 'async';
      const figure = element('figure', 'media-card');
      const link = element('a', 'media-image-link');
      link.href = imageUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Open original image: ${item.title} (new tab)`);
      const caption = element('figcaption', 'media-caption');
      const fullSize = element('a', 'text-link media-fullsize', 'View full-size capture (new tab)');
      fullSize.href = imageUrl; fullSize.target = '_blank'; fullSize.rel = 'noopener noreferrer';
      caption.append(element('h3', '', item.title), element('p', '', item.caption), fullSize);
      if (localAsset(item.video, 'mp4|webm')) {
        const motion = element('a', 'text-link media-fullsize', 'Watch motion replay (new tab)');
        motion.href = item.video + revision; motion.target = '_blank'; motion.rel = 'noopener noreferrer';
        caption.append(motion);
      }
      if (localAsset(item.pdf, 'pdf')) {
        const pdf = element('a', 'text-link media-fullsize', 'Open printable PDF (new tab)');
        pdf.href = item.pdf; pdf.target = '_blank'; pdf.rel = 'noopener noreferrer';
        caption.append(pdf);
      }
      link.append(image); figure.append(link, caption);
      let added = false;
      image.addEventListener('load', () => {
        if (added) return;
        added = true;
        const position = visibleCards.findIndex(card => card.index > index);
        if (position === -1) {
          gallery.append(figure);
          visibleCards.push({ index, figure });
        } else {
          gallery.insertBefore(figure, visibleCards[position].figure);
          visibleCards.splice(position, 0, { index, figure });
        }
        loadedImages += 1;
        syncMedia();
        entranceObserver?.observe(figure);
      });
      // A missing image remains absent; no broken-image placeholder is shown.
      image.addEventListener('error', () => {});
      image.src = imageUrl;
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
      prompt: '“Design a pallet inspection fixture with three seating pads.”',
      operation: 'Model the plate and locating features',
      detail: 'Set the plate dimensions, then add the seating pads and locating shoulders.',
      image: 'gage-pallet-inspection-nest.png',
      alt: 'Blue inspection fixture with three circular seating pads and two locating shoulders',
      result: 'Pallet inspection fixture',
      height: 1200
    },
    {
      prompt: '“Assemble the conveyor frame and rollers in the transfer station.”',
      operation: 'Insert components and constrain mates',
      detail: 'Locate each roller in the frame and check its alignment.',
      image: 'gage-roller-cassette.png',
      alt: 'Five steel rollers mounted in a blue conveyor frame',
      result: 'Roller conveyor cassette',
      height: 1200
    },
    {
      prompt: '“Set up a static study for a gripper jaw under 100 N.”',
      operation: 'Set up a static part study',
      detail: 'Fix the mounting face, assign the material, and distribute the load.',
      image: 'gage-gripper-jaw-stress.png',
      alt: 'SOLIDWORKS stress plot of a gripper jaw under a 100 newton load',
      result: '100 N gripper jaw study',
      height: 1000
    }
  ];

  const workflowButtons = [...document.querySelectorAll('[data-example]')];
  const workflowPrompt = document.getElementById('workflow-prompt');
  const workflowOperation = document.getElementById('workflow-operation');
  const workflowDetail = document.getElementById('workflow-detail');
  const workflowImage = document.getElementById('workflow-image');
  const workflowResult = document.getElementById('workflow-result');
  const workflowScene = document.getElementById('workflow-scene');
  let workflowAnimation;
  if (workflowScene) {
    reducedMotion?.addEventListener('change', event => {
      if (event.matches) workflowAnimation?.cancel();
    });
  }
  workflowButtons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.example);
    const example = examples[index];
    if (!example || button.getAttribute('aria-pressed') === 'true') return;
    workflowButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    workflowPrompt.textContent = example.prompt;
    workflowOperation.textContent = example.operation;
    workflowDetail.textContent = example.detail;
    workflowImage.alt = example.alt;
    workflowImage.height = example.height;
    workflowImage.src = 'assets/media/' + example.image;
    workflowResult.textContent = example.result;

    workflowAnimation?.cancel();
    if (!reducedMotion?.matches && workflowScene.animate) {
      workflowAnimation = workflowScene.animate(
        [{ opacity: .55, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 330, easing: 'cubic-bezier(.2,.72,.25,1)' }
      );
    }
  }));

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitLabel = document.getElementById('submit-label');
  const formMode = document.getElementById('form-mode');
  const message = document.getElementById('form-message');
  const openEmailDraft = document.getElementById('open-email-draft');
  const webmailChoice = document.getElementById('webmail-choice');
  const webmailProvider = document.getElementById('webmail-provider');
  const showMessage = (value, error = false) => {
    message.hidden = false;
    message.textContent = value;
    message.classList.toggle('error', error);
  };

  if (form && submitBtn && submitLabel && message) {
    submitBtn.disabled = false;
    if (webmailChoice) webmailChoice.hidden = Boolean(endpoint);
    const requestType = document.getElementById('request-type');
    const requestDetails = () => {
      if (requestType?.value === 'question') {
        return { label: 'question', subject: 'Gage — project question',
          intro: "I have a question about Gage.", received: 'Question received. We’ll reply by email.' };
      }
      return { label: 'demo request', subject: 'Gage — demo request',
        intro: "I'd like to arrange a time for a Gage demo.",
        received: 'Demo request received. We’ll email you to arrange a time. This is not a confirmed booking.' };
    };
    const syncRequest = () => {
      submitLabel.textContent = `${endpoint ? 'Send' : 'Prepare'} ${requestDetails().label}`;
      formMode.textContent = endpoint
        ? 'Your details will be sent through Formspree to reply to this request. A demo request is not a confirmed booking.'
        : 'Opens a draft in your selected email service. Review and send it there.';
    };
    requestType?.addEventListener('change', syncRequest);
    document.querySelectorAll('[data-demo-request]').forEach(link => link.addEventListener('click', event => {
      if (!requestType || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      requestType.value = 'demo';
      syncRequest();
      window.requestAnimationFrame(() => requestType.focus({ preventScroll: true }));
    }));
    syncRequest();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      message.hidden = true;
      if (openEmailDraft) openEmailDraft.hidden = true;
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
      const company = String(data.get('company') || '').trim();
      const role = String(data.get('role') || '').trim();
      const industry = String(data.get('industry') || '').trim();
      const request = requestDetails();
      const cadTool = String(data.get('cad_tool') || '').trim();
      const interest = String(data.get('primary_interest') || '').trim();
      const useCase = String(data.get('use_case') || '').trim();

      if (!endpoint) {
        const body = [
          'Hello,',
          '',
          request.intro,
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          `Company / employer: ${company || 'Not specified'}`,
          `Role: ${role || 'Not specified'}`,
          `Industry: ${industry || 'Not specified'}`,
          `Primary CAD software: ${cadTool || 'Not specified'}`,
          `Primary interest: ${interest || 'Not specified'}`,
          `What I would use Gage for: ${useCase || 'Not specified'}`,
          '',
          'I agree to be contacted about this request.',
          '',
          'Thank you!'
        ].join('\n');
        const outlookWork = webmailProvider?.value === 'outlook-work';
        const outlook = outlookWork || webmailProvider?.value === 'outlook';
        const serviceName = outlook ? 'Outlook' : 'Gmail';
        const outlookHost = outlookWork ? 'outlook.office.com' : 'outlook.live.com';
        const compose = outlook ? 'https://' + outlookHost + '/mail/deeplink/compose'
          : 'https://mail.google.com/mail/';
        const fields = outlook
          ? { to: emailAddress, subject: request.subject, body }
          : { view: 'cm', fs: '1', to: emailAddress, su: request.subject, body };
        const query = Object.entries(fields).map(([key, value]) => key + '=' + encodeURIComponent(value)).join('&');
        const draftUrl = compose + '?' + query;
        if (openEmailDraft) {
          openEmailDraft.href = draftUrl;
          openEmailDraft.textContent = 'Open in ' + serviceName;
          openEmailDraft.hidden = false;
        }
        showMessage('Draft ready for ' + serviceName + '. Use the link below if the new tab did not open.');
        window.open(draftUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Sending request…';
      try {
        data.delete('consent');
        data.append('permission_to_contact', 'Yes');
        data.append('_subject', request.subject);
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
        showMessage(request.received);
        form.reset();
      } catch (err) {
        showMessage(`${err.message || 'Could not submit your request.'} Please try again or email ${emailAddress}.`, true);
      } finally {
        submitBtn.disabled = false;
        syncRequest();
      }
    });
  }

  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();

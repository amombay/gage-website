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
    const closeNav = () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
      mobileNav.hidden = true;
    };
    menu.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mobileNav.hidden = isOpen;
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) closeNav();
    });
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

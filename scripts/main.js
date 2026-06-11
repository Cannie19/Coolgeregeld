// Lucide icons
if (typeof lucide !== 'undefined') lucide.createIcons();

// Active nav link
const currentFile = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
  const href = a.getAttribute('href').split('#')[0];
  if (href === currentFile) a.classList.add('is-active');
});

// Mobile nav burger
const burger = document.querySelector('.nav__burger');
const mobileNav = document.getElementById('mobile-nav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.classList.toggle('is-open', !isOpen);
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
      burger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
    }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-item__question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const a = document.getElementById(b.getAttribute('aria-controls'));
      if (a) a.classList.remove('is-open');
    });
    // Toggle clicked
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      if (answer) answer.classList.add('is-open');
    }
  });
});

// Reveal on scroll
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form (Formspree)
const form = document.querySelector('.js-contact-form');
if (form) {
  const feedback = form.querySelector('.js-form-feedback');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Verzenden…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        feedback.textContent = '✓ Bericht ontvangen. We nemen binnen 24 uur contact op.';
        feedback.className = 'js-form-feedback form-feedback form-feedback--success';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      feedback.textContent = '⚠ Er ging iets mis. Stuur een e-mail naar info@coolgeregeld.nl';
      feedback.className = 'js-form-feedback form-feedback form-feedback--error';
    }
    btn.disabled = false;
    btn.textContent = 'Verstuur bericht';
  });
}

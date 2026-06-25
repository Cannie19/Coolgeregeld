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

// Interactive AC dial
(function () {
  var TEMP_MIN = 16, TEMP_MAX = 30;
  var ARC_START = 135, ARC_SWEEP = 270;
  var R = 78, CX = 110, CY = 110;
  var ARC_LEN = 2 * Math.PI * R * ARC_SWEEP / 360; // ~367.6

  var MODES = [
    { label: 'KOELEN',     name: 'Koelen ❄️',   color: '#1a54d2' },
    { label: 'VERWARMEN',  name: 'Verwarmen 🔥', color: '#f97316' },
    { label: 'VENTILEREN', name: 'Ventileren 💨',color: '#6b7280' }
  ];

  var temp = 21, modeIdx = 0, dragging = false;

  var svg      = document.getElementById('acDialSvg');
  if (!svg) return;
  var arcFill  = document.getElementById('acArcFill');
  var thumb    = document.getElementById('acThumb');
  var tempVal  = document.getElementById('acTempVal');
  var modeLabel= document.getElementById('acModeLabel');
  var modeName = document.getElementById('acModeName');

  function render() {
    var m = MODES[modeIdx];
    var frac = (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
    var fill = (frac * ARC_LEN).toFixed(1);

    arcFill.setAttribute('stroke', m.color);
    arcFill.setAttribute('stroke-dasharray', fill + ' 999');

    var rad = (ARC_START + frac * ARC_SWEEP) * Math.PI / 180;
    thumb.setAttribute('cx', (CX + R * Math.cos(rad)).toFixed(2));
    thumb.setAttribute('cy', (CY + R * Math.sin(rad)).toFixed(2));
    thumb.setAttribute('stroke', m.color);

    tempVal.textContent = temp;
    modeLabel.textContent = m.label;
    modeLabel.style.color = m.color;
    if (modeName) modeName.textContent = m.name;
  }

  function clientToTemp(cx, cy) {
    var rect = svg.getBoundingClientRect();
    var x = (cx - rect.left) / rect.width * 220 - CX;
    var y = (cy - rect.top) / rect.height * 220 - CY;
    var deg = Math.atan2(y, x) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    var norm = (deg - ARC_START + 360) % 360;
    // snap to nearest arc end if in the gap
    if (norm > ARC_SWEEP) norm = (norm < ARC_SWEEP + (360 - ARC_SWEEP) / 2) ? ARC_SWEEP : 0;
    return Math.round(TEMP_MIN + (norm / ARC_SWEEP) * (TEMP_MAX - TEMP_MIN));
  }

  function nearArc(cx, cy) {
    var rect = svg.getBoundingClientRect();
    var x = (cx - rect.left) / rect.width * 220 - CX;
    var y = (cy - rect.top) / rect.height * 220 - CY;
    var d = Math.sqrt(x * x + y * y);
    return d > R - 22 && d < R + 22;
  }

  svg.addEventListener('pointerdown', function (e) {
    if (!nearArc(e.clientX, e.clientY)) return;
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    temp = clientToTemp(e.clientX, e.clientY);
    render();
  });
  svg.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    temp = clientToTemp(e.clientX, e.clientY);
    render();
  });
  svg.addEventListener('pointerup', function () { dragging = false; });
  svg.addEventListener('pointercancel', function () { dragging = false; });

  var minBtn = document.getElementById('acMinus');
  var plusBtn = document.getElementById('acPlus');
  var modeRow = document.getElementById('acModeRow');

  if (minBtn) minBtn.addEventListener('click', function () { if (temp > TEMP_MIN) { temp--; render(); } });
  if (plusBtn) plusBtn.addEventListener('click', function () { if (temp < TEMP_MAX) { temp++; render(); } });
  if (modeRow) modeRow.addEventListener('click', function () { modeIdx = (modeIdx + 1) % MODES.length; render(); });

  render();
})();

// Transparent nav when hero is visible behind sticky nav
(function () {
  const nav    = document.querySelector('.nav');
  const hero   = document.querySelector('.hero-v2');
  const topbar = document.querySelector('.topbar');
  if (!nav || !hero) return;

  function update() {
    const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : 0;
    const heroBottom   = hero.getBoundingClientRect().bottom;
    // Transparent only after topbar scrolled away AND hero still behind nav
    const transparent  = topbarBottom <= 0 && heroBottom > nav.offsetHeight + 10;

    nav.classList.toggle('nav--top', transparent);
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

// Hero parallax
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero    = document.querySelector('.hero-v2');
  const heroImg = document.querySelector('.hero-v2__bg img');
  if (!hero || !heroImg) return;

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (window.scrollY > hero.offsetHeight) return;
    if (!ticking) {
      requestAnimationFrame(function () {
        heroImg.style.transform = 'translateY(' + (window.scrollY * 0.25) + 'px)';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

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

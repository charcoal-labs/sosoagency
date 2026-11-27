/* =========================================================
   SOSO — light interactions for service & case-study pages
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;

  $$('[data-copyright-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  const clocks = $$('[data-clock]');
  const tick = () => {
    const t = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' });
    clocks.forEach(c => (c.textContent = t));
  };
  tick();
  setInterval(tick, 15000);

  $$('[data-roll]').forEach(el => {
    const text = el.textContent.trim();
    const inner = document.createElement('span');
    inner.className = 'roll__inner';
    inner.dataset.text = text;
    inner.textContent = text;
    el.textContent = '';
    el.classList.add('roll');
    el.appendChild(inner);
  });

  // Nav shrinks once the page scrolls
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const label = $('.nav__toggle-label');
  let open = false;
  const setMenu = (next, restoreFocus = true) => {
    open = next;
    html.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.toggleAttribute('inert', !open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) setTimeout(() => $('a', menu).focus({ preventScroll: true }), 350);
    else if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', e => { if (open && e.key === 'Escape') setMenu(false); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false, false)));
  addEventListener('resize', () => { if (open && innerWidth > 860) setMenu(false, false); });
})();

/* =========================================================
   SOSO CREATIVE AGENCY — interactions
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  const curtain = $('.curtain');
  curtain.style.animation = 'none'; // JS is alive — disable the CSS safety net

  /* ---------------- Utilities ---------------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Split text nodes into spans (chars or words), leaving child elements intact.
  function splitText(el, type) {
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = type === 'chars' ? [...node.textContent] : node.textContent.split(/(\s+)/);
        parts.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = type === 'chars' ? 'ch' : 'word';
          s.textContent = p;
          frag.appendChild(s);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && type === 'words') {
        splitText(node, type);
      }
    });
  }

  // Wrap each <br>-separated line in a mask for reveal.
  function splitLines(el) {
    el.innerHTML = el.innerHTML
      .split(/<br\s*\/?>/i)
      .map(l => `<span class="line"><span>${l.trim()}</span></span>`)
      .join('');
  }

  /* ---------------- Static bits ---------------- */
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

  $$('.hero [data-weight]').forEach(el => splitText(el, 'chars'));

  // Hero pill: a looping reel of the project covers (first two repeated for a seamless loop)
  (() => {
    const track = $('[data-pill]');
    const slugs = $$('.project').slice(0, 4).map(c => c.dataset.img);
    [...slugs, slugs[0], slugs[1]].forEach(slug => {
      const img = new Image();
      img.src = `assets/work/${slug}-1-800.webp`;
      img.alt = '';
      img.decoding = 'async';
      track.appendChild(img);
    });
  })();

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(hash, immediate) {
    const target = hash === '#top' ? 0 : $(hash);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { immediate, force: true });
    else if (target === 0) scrollTo({ top: 0, behavior: immediate || reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: immediate || reduce ? 'auto' : 'smooth' });
  }

  /* ---------------- Nav state ---------------- */
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const toggleLabel = $('.nav__toggle-label');
  let menuOpen = false;

  function setMenu(open, { restoreFocus = true } = {}) {
    menuOpen = open;
    html.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.toggleAttribute('inert', !open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Close' : 'Menu';
    if (open) { lenis?.stop(); setTimeout(() => $('a', menu).focus({ preventScroll: true }), 350); }
    else { lenis?.start(); if (restoreFocus) toggle.focus({ preventScroll: true }); }
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));

  document.addEventListener('keydown', e => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') {
      const items = [toggle, ...$$('a', menu)];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    }
  });
  addEventListener('resize', () => { if (menuOpen && innerWidth > 860) setMenu(false, { restoreFocus: false }); });

  /* ---------------- Curtain transitions ---------------- */
  let busy = false;
  const curtainLabel = $('.curtain__label');

  function transitionTo(hash, label) {
    const finish = () => {
      if (menuOpen) setMenu(false, { restoreFocus: false });
      scrollToTarget(hash, true);
      if (hash !== '#top') history.replaceState(null, '', hash);
    };
    if (!motion) { finish(); return; }
    if (busy) return;
    busy = true;
    curtain.classList.add('is-transition', 'is-active');
    curtainLabel.textContent = label;

    gsap.timeline({
      onComplete: () => { busy = false; curtain.classList.remove('is-active'); }
    })
      .set(curtain, { visibility: 'visible', opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' })
      .to(curtain, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' })
      .fromTo(curtainLabel, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, 0.25)
      .add(finish)
      .to(curtainLabel, { yPercent: -40, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0.12')
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut' }, '-=0.2')
      .set(curtain, { visibility: 'hidden' });
  }

  $$('a[data-transition]').forEach(a =>
    a.addEventListener('click', e => {
      e.preventDefault();
      transitionTo(a.getAttribute('href'), a.dataset.transition);
    })
  );
  // plain in-page anchors (hero, footer, cards) get smooth scroll
  $$('a[href^="#"]:not([data-transition]):not(.project):not([data-case-cta])').forEach(a =>
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      e.preventDefault();
      scrollToTarget(hash, false);
    })
  );

  /* ---------------- Work: category filters ---------------- */
  const cards = $$('.project');
  const grid = $('[data-grid]');
  const filterBtns = $$('.filter');
  let afterFilter = () => {}; // replaced by the GSAP section

  function layoutWork(cat) {
    // a project can sit in several disciplines (data-cat="brand web")
    cards.forEach(c => { c.hidden = !(cat === 'all' || c.dataset.cat.split(' ').includes(cat)); });
  }

  // Hover preview: short description + prompt over each card's image
  cards.forEach(c => {
    const pv = document.createElement('div');
    pv.className = 'project__preview';
    pv.setAttribute('aria-hidden', 'true');
    const p = document.createElement('p');
    p.textContent = c.dataset.desc;
    const cta = document.createElement('span');
    cta.className = 'mono';
    cta.textContent = 'View case →';
    pv.append(p, cta);
    $('.project__media', c).appendChild(pv);
  });

  filterBtns.forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return;
      filterBtns.forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const cat = btn.dataset.filter;

      if (motion && window.Flip) {
        const state = Flip.getState(cards);
        const h0 = grid.offsetHeight;
        layoutWork(cat);
        afterFilter();
        const h1 = grid.offsetHeight;
        gsap.fromTo(grid, { height: h0 }, { height: h1, duration: 0.9, ease: 'expo.inOut', clearProps: 'height' });
        Flip.from(state, {
          duration: 0.9, ease: 'expo.inOut', absolute: true,
          onEnter: els => gsap.fromTo(els, { opacity: 0, y: 80, scale: 1 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.3, stagger: 0.06, ease: 'expo.out' }),
          onLeave: els => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.4, ease: 'power2.in' }),
          onComplete: () => ScrollTrigger.refresh()
        });
      } else {
        layoutWork(cat);
        afterFilter();
        if (hasGsap) ScrollTrigger.refresh();
      }
    })
  );

  /* ---------------- Work: discipline panels -> project grid ---------------- */
  const discWrap = $('[data-disciplines]');
  const discAll = $('.disciplines__all');
  const results = $('[data-results]');
  const workTop = el => {
    const y = el.getBoundingClientRect().top + scrollY - 110; // clear the fixed nav
    if (lenis) lenis.scrollTo(y);
    else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };

  function showDiscipline(btn) {
    layoutWork(btn.dataset.cat);
    afterFilter();
    const count = cards.filter(c => !c.hidden).length;
    $('[data-results-num]').textContent = btn.dataset.num === '00' ? 'All' : btn.dataset.num;
    $('[data-results-title]').textContent = btn.dataset.name;
    $('[data-results-count]').textContent = count ? `${count} project${count === 1 ? '' : 's'}` : 'Coming soon';
    $('[data-results-empty]').hidden = count > 0;

    const reveal = () => {
      discWrap.hidden = discAll.hidden = true;
      results.hidden = false;
      if (hasGsap) ScrollTrigger.refresh();
      workTop(results);
      if (motion) {
        gsap.fromTo('.results__head', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(cards.filter(c => !c.hidden), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, delay: 0.1, ease: 'expo.out', clearProps: 'opacity,transform' });
      }
      $('[data-results-back]').focus({ preventScroll: true });
    };
    if (motion) {
      gsap.to([discWrap, discAll], {
        opacity: 0, y: -30, duration: 0.45, ease: 'power2.in',
        onComplete: () => { gsap.set([discWrap, discAll], { clearProps: 'opacity,transform' }); reveal(); }
      });
    } else reveal();
  }

  function showDisciplines() {
    const back = () => {
      results.hidden = true;
      discWrap.hidden = discAll.hidden = false;
      if (hasGsap) ScrollTrigger.refresh();
      workTop(discWrap);
      if (motion) gsap.fromTo($$('.cat'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', clearProps: 'opacity,transform' });
    };
    if (motion) {
      gsap.to(results, {
        opacity: 0, y: 30, duration: 0.4, ease: 'power2.in',
        onComplete: () => { gsap.set(results, { clearProps: 'opacity,transform' }); back(); }
      });
    } else back();
  }

  if (discWrap && results) {
    $$('.cat, .disciplines__all button').forEach(btn => btn.addEventListener('click', () => showDiscipline(btn)));
    $('[data-results-back]').addEventListener('click', showDisciplines);
  }

  /* ---------------- Work: case study viewer ---------------- */
  const caseEl = $('.case');
  const casePanel = $('.case__panel', caseEl);
  const caseParts = () => $$('.case__title, .case__media, .case__body', caseEl);
  let caseList = [], caseIdx = 0, caseOpener = null;

  function fillCase(card) {
    const d = card.dataset;
    $('.case__meta', caseEl).textContent = `${$('.tags__cat', card).textContent} — ${d.sector}`;
    $('.case__title', caseEl).textContent = d.title;
    // Gallery: every image for this project (assets/work/<slug>-<n>-<w>.webp)
    const media = $('.case__media', caseEl);
    media.textContent = '';
    d.alts.split('|').forEach((alt, i) => {
      const base = `assets/work/${d.img}-${i + 1}`;
      const img = document.createElement('img');
      img.srcset = `${base}-800.webp 800w, ${base}-1600.webp 1600w`;
      img.sizes = '(max-width: 860px) 100vw, 90vw';
      img.src = `${base}-1600.webp`;
      img.alt = alt;
      img.width = 1600;
      img.height = 900;
      img.decoding = 'async';
      if (i > 0) img.loading = 'lazy';
      media.appendChild(img);
    });
    $('.case__desc', caseEl).textContent = d.desc;
    $('.case__client', caseEl).textContent = d.client;
    $('.case__sector', caseEl).textContent = d.sector;
    const list = $('.case__services', caseEl);
    list.textContent = '';
    d.services.split('|').forEach(sv => {
      const li = document.createElement('li');
      li.textContent = sv;
      list.appendChild(li);
    });
    casePanel.scrollTop = 0;
  }

  function openCase(card) {
    caseOpener = card;
    caseList = cards.filter(c => !c.hidden);
    caseIdx = caseList.indexOf(card);
    fillCase(card);
    caseEl.hidden = false;
    html.classList.add('case-open');
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    if (motion) {
      gsap.fromTo('.case__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.5 });
      gsap.fromTo(casePanel, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
      gsap.fromTo(caseParts(), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, delay: 0.25, ease: 'expo.out' });
    }
    $('.case__close', caseEl).focus({ preventScroll: true });
  }

  function closeCase(instant = false) {
    const done = () => {
      caseEl.hidden = true;
      html.classList.remove('case-open');
      if (lenis) lenis.start(); else document.body.style.overflow = '';
      if (!instant) caseOpener?.focus({ preventScroll: true });
    };
    if (motion && !instant) {
      gsap.timeline({ onComplete: done })
        .to(casePanel, { yPercent: 100, duration: 0.6, ease: 'expo.in' })
        .to('.case__backdrop', { opacity: 0, duration: 0.3 }, '-=0.3');
    } else done();
  }

  function stepCase(dir) {
    if (caseList.length < 2) return;
    caseIdx = (caseIdx + dir + caseList.length) % caseList.length;
    const card = caseList[caseIdx];
    caseOpener = card;
    if (!motion) { fillCase(card); return; }
    gsap.timeline()
      .to(caseParts(), { opacity: 0, y: -24 * dir, duration: 0.25, stagger: 0.03, ease: 'power2.in' })
      .add(() => fillCase(card))
      .fromTo(caseParts(), { opacity: 0, y: 40 * dir }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out' });
  }

  cards.forEach(card => card.addEventListener('click', e => { e.preventDefault(); openCase(card); }));
  $$('[data-case-close]', caseEl).forEach(b => b.addEventListener('click', () => closeCase()));
  $('[data-case-prev]', caseEl).addEventListener('click', () => stepCase(-1));
  $('[data-case-next]', caseEl).addEventListener('click', () => stepCase(1));
  $('[data-case-cta]', caseEl).addEventListener('click', e => {
    e.preventDefault();
    closeCase(true);
    transitionTo('#contact', 'Contact');
  });
  document.addEventListener('keydown', e => {
    if (caseEl.hidden) return;
    if (e.key === 'Escape') closeCase();
    else if (e.key === 'ArrowRight') stepCase(1);
    else if (e.key === 'ArrowLeft') stepCase(-1);
    else if (e.key === 'Tab') {
      const items = $$('button, a[href]', casePanel);
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    }
  });

  /* ---------------- Hero: rotating word ---------------- */
  const words = $$('.rotator__word');
  let measureHero = () => {};

  if (motion) {
    gsap.set(words, { y: 0, yPercent: i => (i === 0 ? 0 : 105) });
    let wi = 0;
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[wi];
      wi = (wi + 1) % words.length;
      const nxt = words[wi];
      gsap.to(cur, { yPercent: -105, duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo(nxt, { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: 'expo.inOut', onComplete: () => measureHero() });
    }, 2600);
  }

  /* ---------------- Hero: cursor-driven variable weight ---------------- */
  if (motion && fine) {
    const hero = $('.hero');
    const chars = $$('.hero__title .ch');
    const MIN = 160, MAX = 800;
    let rects = [];
    const state = chars.map(() => ({ w: MAX, t: MAX }));
    let px = -9999, py = -9999, active = false, fontSize = 100;

    measureHero = () => {
      fontSize = parseFloat(getComputedStyle($('.hero__title')).fontSize);
      rects = chars.map(ch => {
        const r = ch.getBoundingClientRect();
        return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
      });
    };

    hero.addEventListener('pointermove', e => { px = e.pageX; py = e.pageY; active = true; });
    hero.addEventListener('pointerleave', () => { active = false; });

    gsap.ticker.add(() => {
      if (!rects.length) return;
      const radius = fontSize * 1.6;
      let moving = false;
      for (let i = 0; i < chars.length; i++) {
        const s = state[i];
        if (active) {
          const d = Math.hypot(px - rects[i].x, py - rects[i].y);
          const k = clamp(d / radius, 0, 1);
          s.t = MIN + (MAX - MIN) * (k * k * (3 - 2 * k)); // smoothstep
        } else s.t = MAX;
        const diff = s.t - s.w;
        if (Math.abs(diff) > 0.5) {
          s.w += diff * 0.12;
          chars[i].style.setProperty('--w', s.w.toFixed(0));
          moving = true;
        }
      }
      return moving;
    });
    addEventListener('resize', () => measureHero());
  }

  /* ---------------- Custom cursor ---------------- */
  if (motion && fine) {
    html.classList.add('has-cursor');
    const c = $('.cursor');
    c.classList.add('is-hidden'); // until the first pointer move
    const lab = $('.cursor__label');
    const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });

    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); c.classList.remove('is-hidden'); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => c.classList.add('is-hidden'));

    const update = t => {
      c.classList.remove('is-hover', 'is-label', 'is-hidden');
      if (!t) return;
      if (t.matches('input:not([type="checkbox"]):not([type="radio"]), textarea')) { c.classList.add('is-hidden'); return; }
      const label = t.dataset.cursor;
      if (label) {
        lab.textContent = t.matches('.svc__row') ? (t.getAttribute('aria-expanded') === 'true' ? 'Close' : 'Open') : label;
        c.classList.add('is-label');
      } else c.classList.add('is-hover');
    };
    let current = null;
    document.addEventListener('pointerover', e => {
      current = e.target.closest('[data-cursor], a, button, label, input, textarea');
      update(current);
    });
    document.addEventListener('click', () => requestAnimationFrame(() => update(current)));
  }

  /* ---------------- Magnetic elements ---------------- */
  if (motion && fine) {
    $$('[data-magnetic]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      const strength = el.classList.contains('contact__circle') ? 0.45 : 0.3;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------- Services accordion ---------------- */
  $$('.svc__row').forEach(row => {
    row.addEventListener('click', () => {
      const item = row.closest('.svc__item');
      const open = !item.classList.contains('is-open');
      $$('.svc__item.is-open').forEach(it => {
        it.classList.remove('is-open');
        $('.svc__row', it).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      row.setAttribute('aria-expanded', String(open));
    });
  });
  // layout below changes height → keep scroll triggers accurate
  let refreshT;
  $('.svc').addEventListener('transitionend', e => {
    if (!hasGsap || !e.target.classList.contains('svc__panel')) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(() => ScrollTrigger.refresh(), 60);
  });

  /* ---------------- Testimonials ---------------- */
  (() => {
    const root = $('[data-quotes]');
    const quotes = $$('.quote', root);
    const count = $('.quotes__count b', root);
    let qi = 0, timer;
    const show = i => {
      qi = (i + quotes.length) % quotes.length;
      quotes.forEach((q, j) => q.classList.toggle('is-active', j === qi));
      count.textContent = String(qi + 1).padStart(2, '0');
    };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(qi + 1), 6500); };
    $('[data-prev]', root).addEventListener('click', () => { show(qi - 1); auto(); });
    $('[data-next]', root).addEventListener('click', () => { show(qi + 1); auto(); });
    root.addEventListener('pointerenter', () => clearInterval(timer));
    root.addEventListener('pointerleave', auto);
    auto();
  })();

  /* ---------------- Contact form → email (via FormSubmit) ---------------- */
  (() => {
    const EMAIL_TO = 'info@sosocreativeagency.co.za';
    const ENDPOINT = `https://formsubmit.co/ajax/${EMAIL_TO}`;
    const HINT = 'Add your name, email and project details to send.';
    const form = $('.form');
    const f = form.elements;
    const status = $('.form__status');
    const submit = $('.form__submit');
    const label = $('.roll__inner', submit);
    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const ready = () => !!(f.name.value.trim() && isEmail(f.email.value.trim()) && f.message.value.trim());
    let sending = false;

    const setStatus = (text, type = '') => {
      status.className = 'form__status mono' + (type ? ` is-${type}` : '');
      status.textContent = text;
    };
    const setLabel = text => { label.textContent = text; label.dataset.text = text; };
    const sync = () => {
      const ok = ready();
      submit.disabled = !ok || sending;
      if (!status.classList.contains('is-ok') && !status.classList.contains('is-error')) setStatus(ok ? '' : HINT);
    };

    form.addEventListener('input', () => {
      if (status.classList.contains('is-ok') || status.classList.contains('is-error')) setStatus('');
      sync();
    });
    // flag a bad email once the visitor leaves the field
    f.email.addEventListener('blur', () => {
      const v = f.email.value.trim();
      f.email.closest('.field').classList.toggle('is-invalid', !!v && !isEmail(v));
    });
    f.email.addEventListener('input', () => f.email.closest('.field').classList.remove('is-invalid'));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!ready() || sending) return;
      if (f._honey.value) return; // bot trap

      const data = new FormData(form);
      const name = f.name.value.trim();
      const email = f.email.value.trim();
      const payload = {
        name,
        email,
        company: f.company.value.trim() || '—',
        interests: data.getAll('interest').join(', ') || '—',
        budget: data.get('budget') || '—',
        message: f.message.value.trim(),
        _subject: `New project enquiry — ${name}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false'
      };

      sending = true;
      submit.disabled = true;
      submit.classList.add('is-sending');
      setLabel('Sending…');
      setStatus('');

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || `HTTP ${res.status}`);
        form.reset();
        setStatus(`Thanks, ${name.split(' ')[0]} — your message is on its way. We’ll be in touch within 24 hours.`, 'ok');
      } catch (err) {
        const reason = String(err?.message || err);
        console.warn('Contact form failed:', reason);
        if (/activat/i.test(reason)) {
          // FormSubmit's one-time setup: the first submission sends an "Activate Form" email to EMAIL_TO
          setStatus(`Almost there — this form needs a one-time activation. Check ${EMAIL_TO} (and spam) for an “Activate Form” email from FormSubmit, click the link, then send again.`, 'error');
          return;
        }
        if (location.protocol === 'file:' || /web server/i.test(reason)) {
          setStatus('This page was opened as a local file, so the form can’t send. Open it through a web server (e.g. http://localhost) or the live site. You can also email us at ', 'error');
        } else {
          setStatus('Something went wrong sending your message. Please email us at ', 'error');
        }
        const a = document.createElement('a');
        a.href = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nCompany: ${payload.company}\nInterested in: ${payload.interests}\nBudget: ${payload.budget}\n\n${payload.message}`
        )}`;
        a.textContent = EMAIL_TO;
        status.appendChild(a);
      } finally {
        sending = false;
        submit.classList.remove('is-sending');
        setLabel('Send it');
        sync();
      }
    });

    sync();
  })();

  /* =========================================================
     GSAP-only from here
     ========================================================= */
  if (!hasGsap) { curtain.style.display = 'none'; return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);

  // Split headings + manifesto
  $$('[data-split]').forEach(splitLines);
  const manifesto = $('[data-scrub-words]');
  splitText(manifesto, 'words');

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => setTimeout(r, 2500))
  ]);

  if (!motion) {
    curtain.style.display = 'none';
    fontsReady.then(() => ScrollTrigger.refresh());
    return;
  }

  /* ---------------- Initial states ---------------- */
  const heroLines = $$('.hero__line-inner');
  const heroFade = $$('.hero__meta, .hero [data-reveal]');
  gsap.set(heroLines, { yPercent: 115 });
  gsap.set('.hero__pill', { scale: 0 });
  gsap.set(heroFade, { opacity: 0, y: 24 });

  /* ---------------- Preloader ---------------- */
  lenis?.stop();
  const num = $('.curtain__num');
  const counter = { v: 0 };

  const intro = () =>
    gsap.timeline()
      .to(heroLines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' })
      .to('.hero__pill', { scale: 1, duration: 1.1, ease: 'elastic.out(1, 0.6)' }, 0.5)
      .to(heroFade, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.45)
      .add(() => measureHero());

  const pre = gsap.timeline();
  pre
    .from('.curtain__mark', { yPercent: 40, opacity: 0, duration: 0.9, ease: 'expo.out' })
    .to(counter, {
      v: 100, duration: 1.5, ease: 'power3.inOut',
      onUpdate: () => (num.textContent = Math.round(counter.v))
    }, 0)
    .add(() => {
      pre.pause();
      fontsReady.then(() => pre.resume());
    })
    .to('.curtain__mark, .curtain__count', { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' })
    .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' })
    .add(intro, '-=0.6')
    .add(() => {
      gsap.set(curtain, { visibility: 'hidden' });
      gsap.set('.curtain__mark, .curtain__count', { clearProps: 'all' });
      curtain.classList.add('is-transition');
      lenis?.start();
      ScrollTrigger.refresh();
    });

  /* ---------------- Section reveals ---------------- */
  $$('[data-split]').forEach(el => {
    const lines = $$('.line > span', el);
    gsap.set(lines, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.3, stagger: 0.09, ease: 'expo.out' })
    });
  });

  $$('[data-reveal]').filter(el => !el.closest('.hero')).forEach(el => {
    gsap.set(el, { opacity: 0, y: 40 });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' })
    });
  });

  // Manifesto: words light up with scroll
  const mWords = $$('.word', manifesto);
  gsap.set(mWords, { opacity: 0.12 });
  gsap.set($('em', manifesto), { '--u': 0 });
  gsap.timeline({
    scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 50%', scrub: 0.6 }
  })
    .to(mWords, { opacity: 1, stagger: 0.1, duration: 0.3, ease: 'none' })
    .to($('em', manifesto), { '--u': 1, duration: 0.6, ease: 'power2.out' }, '>-1');

  // Work: clip reveal + parallax (reveals are finished instantly once the user filters)
  const reveals = [];
  afterFilter = () => {
    reveals.forEach(t => { t.scrollTrigger?.kill(); t.progress(1); });
    reveals.length = 0;
  };
  cards.forEach(card => {
    const media = $('.project__media', card);
    const img = $('img', card);
    reveals.push(gsap.fromTo(media,
      { clipPath: 'inset(100% 0% 0% 0% round 16px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true }
      }));
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    reveals.push(gsap.from($('.project__info', card), {
      opacity: 0, y: 24, duration: 1, ease: 'expo.out', delay: 0.4,
      scrollTrigger: { trigger: card, start: 'top 85%', once: true }
    }));
  });

  // Services rows stagger in
  ScrollTrigger.batch('.svc__item', {
    start: 'top 92%', once: true,
    onEnter: b => gsap.from(b, { opacity: 0, y: 40, duration: 1, stagger: 0.07, ease: 'expo.out' })
  });

  // Process: horizontal pin on desktop
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const track = $('.process__track');
    const gutter = () => parseFloat(getComputedStyle($('.process__pin')).paddingLeft);
    const dist = () => Math.max(0, track.scrollWidth - (innerWidth - gutter() * 2));
    const st = { trigger: '.process__pin', start: 'top top', end: () => '+=' + dist() * 1.1, scrub: 1, invalidateOnRefresh: true };
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { ...st, pin: true } });
    gsap.to('.process__progress span', { scaleX: 1, ease: 'none', scrollTrigger: st });
  });
  mm.add('(max-width: 860px)', () => {
    $$('.step').forEach(step =>
      gsap.from(step, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 88%', once: true } })
    );
  });

  // Counters
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) })
    });
  });

  // Clients grid
  ScrollTrigger.batch('.clients__grid li', {
    start: 'top 92%', once: true,
    onEnter: b => gsap.from(b, { opacity: 0, y: 20, duration: 0.9, stagger: 0.06, ease: 'expo.out' })
  });

  // Marquee: velocity-reactive
  (() => {
    const track = $('[data-marquee]');
    const group = track.children[0];
    let w = group.offsetWidth, x = 0, dir = -1;
    addEventListener('resize', () => (w = group.offsetWidth));
    fontsReady.then(() => (w = group.offsetWidth));
    gsap.ticker.add((t, dt) => {
      const v = lenis ? lenis.velocity : 0;
      if (Math.abs(v) > 0.2) dir = v > 0 ? -1 : 1;
      const speed = 0.7 + Math.min(Math.abs(v) * 0.35, 14);
      x += dir * speed * (dt / 16.67);
      x = ((x % w) + w) % w - w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  })();

  // Footer word rises in
  gsap.from('.footer__word', {
    yPercent: 35, opacity: 0, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer__word', start: 'top 95%', once: true }
  });

  // Nav flips to a dark frosted bar over dark sections
  $$('.services, .process, .footer').forEach(sec =>
    ScrollTrigger.create({
      trigger: sec, start: 'top 40px', end: 'bottom 40px',
      onToggle: st => nav.classList.toggle('is-dark', st.isActive)
    })
  );

  // Active nav link
  ['work', 'services', 'about', 'contact'].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    ScrollTrigger.create({
      trigger: '#' + id, start: 'top 50%', end: 'bottom 50%',
      onToggle: s => link.classList.toggle('is-current', s.isActive)
    });
  });

  fontsReady.then(() => { ScrollTrigger.refresh(); measureHero(); });
})();

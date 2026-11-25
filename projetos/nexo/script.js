(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const shot = /[?&]shot\b/.test(location.search);
  if (shot) { doc.classList.add('shot'); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); }
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* dropdowns */
  const drops = $$('.nx-drop');
  const closeDrops = ex => drops.forEach(d => { if (d !== ex) { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); } });
  drops.forEach(d => {
    const b = d.querySelector('button');
    b.addEventListener('click', () => { const o = !d.classList.contains('open'); closeDrops(d); d.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); });
    d.addEventListener('focusout', e => { if (!d.contains(e.relatedTarget)) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nx-drop')) closeDrops(); });

  /* mobile overlay */
  const burger = $('.nx-burger'), overlay = $('#nx-overlay');
  const setMenu = o => {
    overlay.hidden = !o; burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = o ? 'hidden' : '';
    if (o) overlay.querySelector('a').focus();
  };
  burger.addEventListener('click', () => setMenu(overlay.hidden));
  $$('a', overlay).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!overlay.hidden) { setMenu(false); burger.focus(); }
    const d = drops.find(x => x.classList.contains('open')); if (d) { closeDrops(); d.querySelector('button').focus(); }
  });
  addEventListener('resize', () => { if (innerWidth > 980 && !overlay.hidden) setMenu(false); });

  /* word reveal */
  const reveals = $$('.nx-reveal-words').map(el => {
    const t = el.textContent.trim();
    el.innerHTML = `<span class="sr">${t}</span>` + t.split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    return { el, words: $$('.w', el), lit: -1 };
  });

  /* scroll-linked */
  const nav = $('.nx-nav'), badge = $('.concept-badge');
  const built = $('.nx-built-track'), screen = $('.nx-screen'), shotImg = $('.nx-screen img');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    nav.classList.toggle('scrolled', scrollY > 20);
    badge?.classList.toggle('show', scrollY > vh * .6);
    reveals.forEach(r => {
      const b = r.el.getBoundingClientRect();
      const p = reduce.matches || shot ? 1 : clamp((vh * .88 - b.top) / (b.height + vh * .38));
      const n = Math.round(p * r.words.length);
      if (n !== r.lit) { r.lit = n; r.words.forEach((w, i) => w.classList.toggle('on', i < n)); }
    });
    if (built && screen && shotImg) {
      const b = built.getBoundingClientRect();
      const span = built.offsetHeight - vh;
      const p = reduce.matches ? 0 : clamp(-b.top / Math.max(1, span));
      const max = Math.max(0, shotImg.offsetHeight - screen.clientHeight);
      screen.style.setProperty('--sy', (-p * max).toFixed(1) + 'px');
      if (reduce.matches) screen.style.overflowY = 'auto';
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  shotImg?.addEventListener('load', req);
  update();

  /* mini carousel */
  const mini = $('.nx-mini');
  if (mini) {
    const [prev, next] = $$('.nx-arrows button');
    const step = () => mini.children[1].offsetLeft - mini.children[0].offsetLeft;
    const upd = () => { prev.disabled = mini.scrollLeft < 4; next.disabled = mini.scrollLeft + mini.clientWidth > mini.scrollWidth - 4; };
    prev.addEventListener('click', () => mini.scrollBy({ left: -step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => mini.scrollBy({ left: step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    mini.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* how steps */
  const steps = $$('.nx-how-steps li'), num = $('.nx-num');
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(en => en.forEach(x => {
      if (!x.isIntersecting) return;
      const i = steps.indexOf(x.target);
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      const t = String(i + 1).padStart(2, '0');
      if (num && num.textContent !== t) { num.classList.add('swap'); setTimeout(() => { num.textContent = t; num.classList.remove('swap'); }, 200); }
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  /* cookie banner (simulated) */
  const ck = $('.nx-cookie');
  let saved = null; try { saved = localStorage.getItem('nexo-cookies'); } catch (e) {}
  if (ck && !saved && !shot) setTimeout(() => { ck.hidden = false; }, 1400);
  $$('[data-cookie]').forEach(b => b.addEventListener('click', () => { ck.hidden = true; try { localStorage.setItem('nexo-cookies', b.dataset.cookie); } catch (e) {} }));
  $('.nx-cookie-open')?.addEventListener('click', () => { ck.hidden = false; ck.querySelector('button').focus(); });
})();

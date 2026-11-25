(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (/[?&]shot\b/.test(location.search)) { doc.classList.add('shot'); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* menu */
  const nav = document.querySelector('.fm-nav');
  const burger = nav.querySelector('.fm-burger');
  const setMenu = open => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* words */
  document.querySelectorAll('.js-words').forEach(el => {
    const text = el.textContent.trim();
    el.innerHTML = `<span class="sr">${text}</span>` + text.split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  });

  /* scroll scenes */
  const hero = document.querySelector('.fm-hero');
  const why = document.querySelector('.fm-why');
  const words = why ? [...why.querySelectorAll('.w')] : [];
  const badge = document.querySelector('.concept-badge');
  let lit = -1, ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const sc = scrollY > vh * .7;
    doc.classList.toggle('is-scrolled', sc);
    if (badge) badge.classList.toggle('show', sc);
    if (hero) hero.style.setProperty('--hp', reduce.matches ? 0 : clamp(-hero.getBoundingClientRect().top / (vh * .9)).toFixed(3));
    if (why && words.length) {
      const r = why.getBoundingClientRect();
      const span = Math.max(1, why.offsetHeight - vh);
      const p = reduce.matches ? 1 : clamp((-r.top + vh * .35) / (span + vh * .1));
      const n = Math.round(p * words.length);
      if (n !== lit) { lit = n; words.forEach((w, i) => w.classList.toggle('on', i < n)); }
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  reduce.addEventListener?.('change', update);
  update();

  /* timeline chip */
  const chip = document.querySelector('.fm-hero .fm-tl-chip');
  const times = [['Luz da manhã · 08:40', 14], ['Sol na sala · 10:24', 28], ['Sombra no deck · 15:10', 70], ['Fim de tarde · 17:35', 90]];
  let ti = 1, timer;
  const tick = () => {
    ti = (ti + 1) % times.length;
    chip.classList.add('swap');
    chip.style.setProperty('--cx', times[ti][1] + '%');
    setTimeout(() => { chip.querySelector('b').textContent = times[ti][0]; chip.classList.remove('swap'); }, 380);
  };
  const startTimer = () => { clearInterval(timer); if (!reduce.matches && !document.hidden) timer = setInterval(tick, 3400); };
  if (chip) { chip.style.setProperty('--cx', times[ti][1] + '%'); startTimer(); document.addEventListener('visibilitychange', startTimer); reduce.addEventListener?.('change', startTimer); }

  /* carousel */
  const track = document.querySelector('.fm-track');
  if (track) {
    const cards = [...track.querySelectorAll('.fm-card')];
    const [prev, next] = document.querySelectorAll('.fm-arrow');
    const count = document.querySelector('.fm-count b');
    let active = 0;
    const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
    const set = i => {
      active = clamp(i, 0, cards.length - 1);
      cards.forEach((c, k) => c.classList.toggle('is-active', k === active));
      prev.disabled = active === 0; next.disabled = active === cards.length - 1;
      count.textContent = String(active + 1).padStart(2, '0');
    };
    let raf;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => set(Math.round(track.scrollLeft / step()))); }, { passive: true });
    const go = d => track.scrollTo({ left: clamp(active + d, 0, cards.length - 1) * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    cards.forEach((c, k) => c.addEventListener('click', () => { if (k !== active) go(k - active); }));
    set(0);
  }

  /* steps */
  const steps = [...document.querySelectorAll('.fm-step')];
  const figs = [...document.querySelectorAll('.fm-how-media figure')];
  const mchip = document.querySelector('.fm-media-chip');
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const i = steps.indexOf(en.target);
        steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
        figs.forEach((f, k) => f.classList.toggle('on', k === i));
        if (mchip) { mchip.querySelector('b').textContent = en.target.dataset.date; mchip.querySelector('em').textContent = en.target.dataset.note; }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
    const sign = document.querySelector('.fm-sign');
    if (sign) new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { sign.classList.add('on'); o.disconnect(); } }, { threshold: .6 }).observe(sign);
  } else document.querySelector('.fm-sign')?.classList.add('on');
})();

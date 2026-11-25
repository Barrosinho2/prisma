/* Nosso jeito de construir: brilho que acompanha o cursor nos cards e lente de raio-x. */
(() => {
  const section = document.querySelector('.craft');
  if (!section) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  const grid = section.querySelector('.craft-grid');
  const cards = [...section.querySelectorAll('.craft-card')];
  grid?.addEventListener('pointermove', event => {
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - r.left}px`);
      card.style.setProperty('--my', `${event.clientY - r.top}px`);
    }
  });

  const xray = section.querySelector('.xray');
  if (!xray) return;
  const lens = { x: .64, y: .44, tx: .64, ty: .44 };
  let raf = 0, last = 0, clock = 0, visible = false, lastPointer = -1e9;
  const apply = () => {
    xray.style.setProperty('--lx', `${(lens.x * 100).toFixed(2)}%`);
    xray.style.setProperty('--ly', `${(lens.y * 100).toFixed(2)}%`);
  };
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60;
    last = now; clock += dt;
    const following = finePointer.matches && now - lastPointer < 2200;
    if (!following) {
      // Without a cursor the lens tours the screen on its own.
      lens.tx = .5 + .3 * Math.sin(clock * .5);
      lens.ty = .5 + .26 * Math.sin(clock * .34 + 1.2);
    }
    const k = 1 - Math.exp(-dt * (following ? 14 : 2.2));
    lens.x += (lens.tx - lens.x) * k;
    lens.y += (lens.ty - lens.y) * k;
    apply();
    request();
  }
  function request() { if (!raf && visible && !reduce.matches && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  xray.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const r = xray.getBoundingClientRect();
    lens.tx = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
    lens.ty = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
    lastPointer = performance.now();
    request();
  });
  xray.addEventListener('pointerleave', () => { lastPointer = -1e9; });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); else stop(); }).observe(xray);
  else visible = true;
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else request(); });
  const sync = () => { xray.classList.toggle('is-static', reduce.matches); if (reduce.matches) stop(); else request(); };
  reduce.addEventListener('change', sync);
  apply(); sync();
})();

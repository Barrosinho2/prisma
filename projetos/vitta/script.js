(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (/[?&]shot\b/.test(location.search)) { doc.classList.add('shot'); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); }
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* header + badge */
  const header = $('.vt-header'), badge = $('.concept-badge');
  const onScroll = () => { header.classList.toggle('scrolled', scrollY > 8); badge?.classList.toggle('show', scrollY > innerHeight * .6); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* dropdowns */
  const drops = $$('.vt-drop');
  const closeDrops = except => drops.forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); } });
  drops.forEach(d => {
    const b = d.querySelector('button');
    b.addEventListener('click', () => { const o = !d.classList.contains('open'); closeDrops(d); d.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); });
    d.addEventListener('focusout', e => { if (!d.contains(e.relatedTarget)) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.vt-drop')) closeDrops(); });

  /* mobile menu */
  const burger = $('.vt-burger');
  const setMenu = o => { header.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!header.classList.contains('open')));
  $$('.vt-nav a').forEach(a => a.addEventListener('click', () => { setMenu(false); closeDrops(); }));
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (header.classList.contains('open')) { setMenu(false); burger.focus(); } const d = drops.find(x => x.classList.contains('open')); if (d) { closeDrops(); d.querySelector('button').focus(); } });

  /* reveal */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(r => io.observe(r));
  } else reveals.forEach(r => r.classList.add('in'));

  /* before / after */
  $$('.vt-ba').forEach(t => { const i = t.querySelector('input'); const set = () => t.style.setProperty('--s', i.value + '%'); i.addEventListener('input', set); set(); });

  /* reviews */
  const track = $('.vt-rev-track');
  if (track) {
    const [prev, next] = $$('.vt-rev-arrow');
    const card = () => track.children[1].offsetLeft - track.children[0].offsetLeft;
    const upd = () => { prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4; };
    prev.addEventListener('click', () => track.scrollBy({ left: -card(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: card(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* simple forms */
  const okMail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const contact = $('.vt-form');
  contact?.addEventListener('submit', e => {
    e.preventDefault();
    const f = contact.elements, msg = contact.querySelector('.vt-form-msg');
    if (!f.nome.value.trim() || !okMail(f.email.value) || f.tel.value.replace(/\D/g, '').length < 10) { msg.textContent = 'Preencha nome, e-mail válido e telefone com DDD.'; return; }
    msg.textContent = `Obrigado, ${f.nome.value.trim().split(' ')[0]}! Pedido simulado: em um site real, a recepção responderia em instantes.`;
    contact.reset();
  });
  const news = $('.vt-news-form');
  news?.addEventListener('submit', e => { e.preventDefault(); const m = news.querySelector('.vt-form-msg'); m.textContent = okMail(news.elements.news.value) ? 'Inscrição simulada com sucesso.' : 'Digite um e-mail válido.'; });

  /* booking */
  const dlg = $('#vt-book');
  if (dlg && dlg.showModal) {
    const panes = $$('.vt-pane', dlg), marks = $$('.vt-book-steps li', dlg);
    const back = $('[data-back]', dlg), nextB = $('[data-next]', dlg), err = $('.vt-book-err', dlg);
    const days = $('.vt-days', dlg), slots = $('.vt-slots', dlg);
    const wd = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], mo = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const list = []; const d0 = new Date();
    for (let d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1); list.length < 6; d.setDate(d.getDate() + 1)) if (d.getDay()) list.push(new Date(d));
    days.innerHTML = list.map((d, i) => `<label class="vt-chip"><input type="radio" name="b-dia" value="${wd[d.getDay()]}, ${d.getDate()} ${mo[d.getMonth()]}"${i ? '' : ' checked'}><span><small>${wd[d.getDay()]}</small>${d.getDate()} ${mo[d.getMonth()]}</span></label>`).join('');
    const times = ['08:30', '09:20', '10:40', '11:30', '14:00', '15:10', '16:30', '17:20', '18:40'];
    const fillSlots = seed => { slots.innerHTML = times.map((t, i) => { const off = (i * 7 + seed * 3) % 5 === 0; return `<label class="vt-chip"><input type="radio" name="b-hora" value="${t}"${off ? ' disabled' : ''}><span>${t}</span></label>`; }).join(''); };
    let step = 0;
    const val = n => (dlg.querySelector(`[name="${n}"]:checked`) || {}).value;
    const show = s => {
      step = s; err.textContent = '';
      panes.forEach((p, i) => p.classList.toggle('on', i === s));
      marks.forEach((m, i) => m.classList.toggle('on', i <= Math.min(s, 3)));
      back.hidden = s === 0 || s === 4;
      nextB.textContent = s === 3 ? 'Confirmar agendamento' : s === 4 ? 'Fechar' : 'Continuar';
      if (s === 2) fillSlots(list.findIndex(d => `${wd[d.getDay()]}, ${d.getDate()} ${mo[d.getMonth()]}` === val('b-dia')) + 1);
      if (s === 3) $('.vt-summary', dlg).textContent = `${val('b-esp')} · ${val('b-dia')} às ${val('b-hora')}`;
      const first = panes[s].querySelector('input:not([disabled]),button'); if (first && s < 4) first.focus({ preventScroll: true });
    };
    nextB.addEventListener('click', () => {
      if (step === 4) return dlg.close();
      if (step === 2 && !val('b-hora')) { err.textContent = 'Escolha um horário.'; return; }
      if (step === 3) {
        const n = dlg.querySelector('[name="b-nome"]').value.trim(), t = dlg.querySelector('[name="b-tel"]').value.replace(/\D/g, '');
        if (!n || t.length < 10) { err.textContent = 'Informe nome e celular com DDD.'; return; }
        $('.vt-done-text', dlg).textContent = `${n.split(' ')[0]}, sua avaliação de ${val('b-esp').toLowerCase()} ficou para ${val('b-dia')} às ${val('b-hora')}. Você receberia a confirmação e um lembrete no celular.`;
      }
      show(step + 1);
      if (step === 4) nextB.focus();
    });
    back.addEventListener('click', () => show(Math.max(0, step - 1)));
    $('.vt-x', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    let opener;
    $$('[data-book]').forEach(b => b.addEventListener('click', () => { opener = b; setMenuSafe(); dlg.querySelector('form').reset(); show(0); dlg.showModal(); }));
    dlg.addEventListener('close', () => opener?.focus());
    function setMenuSafe() { if (header.classList.contains('open')) setMenu(false); }
  } else $$('[data-book]').forEach(b => b.addEventListener('click', () => { location.hash = 'contato'; }));
})();

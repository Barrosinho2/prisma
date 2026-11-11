document.documentElement.classList.add('js');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu')}menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus()}});matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
document.querySelectorAll('.whatsapp').forEach(a=>a.href='https://wa.me/5513985990880?text='+encodeURIComponent('Olá, Prisma! Quero conversar sobre um projeto para minha empresa.'));
document.querySelectorAll('.plan-cta').forEach(a=>a.href='https://wa.me/5513985990880?text='+encodeURIComponent('Olá, Prisma! Tenho interesse no plano '+a.dataset.plan+'. Podemos conversar?'));
document.querySelector('#year').textContent=new Date().getFullYear();

// Keep the section indication useful as people explore the page.
const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
const navSections = sectionLinks.map(link => ({ link, section: document.querySelector(link.hash) })).filter(item => item.section);
let navFrame = 0;
function updateCurrentSection() {
  navFrame = 0;
  const marker = Math.min(220, innerHeight * .3);
  let current = navSections[0];
  for (const item of navSections) if (item.section.getBoundingClientRect().top <= marker) current = item;
  for (const item of navSections) {
    if (item === current) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  }
}
addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateCurrentSection); }, { passive: true });
addEventListener('resize', updateCurrentSection);
updateCurrentSection();

// One scheduled update at a time; keyboard focus gets the same illuminated state.
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.price-card').forEach(card => {
  let frame = 0, x = 50, y = 0;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    x = (event.clientX - rect.left) / rect.width * 100;
    y = (event.clientY - rect.top) / rect.height * 100;
    if (!frame) frame = requestAnimationFrame(() => {
      card.style.setProperty('--light-x', `${x}%`);
      card.style.setProperty('--light-y', `${y}%`);
      frame = 0;
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame); frame = 0;
    card.style.removeProperty('--light-x'); card.style.removeProperty('--light-y');
  });
});

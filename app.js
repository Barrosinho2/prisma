document.documentElement.classList.add('js');
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
const reveals = [...document.querySelectorAll('.reveal')];
// Reveal once on entry, even for a card taller than the viewport. Only items
// entering together on the same row are staggered, so mobile never has to wait.
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  const entering = entries.filter(entry => entry.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
  let rowTop = -Infinity, rowIndex = 0;
  entering.forEach(entry => {
    if (Math.abs(entry.boundingClientRect.top - rowTop) > 36) rowIndex = 0;
    rowTop = entry.boundingClientRect.top;
    entry.target.style.setProperty('--reveal-delay', `${reducedMotion.matches ? 0 : Math.min(rowIndex++ * 80, 160)}ms`);
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, {threshold:0, rootMargin:'0px 0px -36px 0px'}) : null;
reveals.forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));
document.addEventListener('focusin', event => {
  const reveal = event.target.closest('.reveal');
  if (reveal) { reveal.classList.add('visible'); observer?.unobserve(reveal); }
});
const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu')}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()});
matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
// The links precede the button in the markup: Tab from the open menu enters the links,
// Shift+Tab from the first link returns to the button, and leaving the menu closes it.
const navLinks=[...nav.querySelectorAll('a')];
const menuOpen=()=>menu.getAttribute('aria-expanded')==='true';
menu.addEventListener('keydown',e=>{if(e.key==='Tab'&&!e.shiftKey&&menuOpen()&&navLinks[0]){e.preventDefault();navLinks[0].focus()}});
nav.addEventListener('keydown',e=>{if(e.key==='Tab'&&e.shiftKey&&menuOpen()&&e.target===navLinks[0]){e.preventDefault();menu.focus()}});
nav.addEventListener('focusout',e=>{if(menuOpen()&&e.relatedTarget&&!nav.contains(e.relatedTarget)&&e.relatedTarget!==menu)closeMenu()});
document.querySelectorAll('.whatsapp').forEach(a=>a.href='https://wa.me/5513985990880?text='+encodeURIComponent('Olá, Prisma! Quero conversar sobre um projeto para minha empresa.'));
document.querySelectorAll('.plan-cta').forEach(a=>a.href='https://wa.me/5513985990880?text='+encodeURIComponent('Olá, Prisma! Tenho interesse no plano '+a.dataset.plan+'. Podemos conversar?'));
document.querySelector('#year').textContent=new Date().getFullYear();

// Keep the section indication useful as people explore the page.
const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
const navSections = sectionLinks.map(link => ({ link, section: document.querySelector(link.hash) })).filter(item => item.section);
let navFrame = 0;
const header = document.querySelector('.header');
const processSteps = [...document.querySelectorAll('.steps article')];
const processTrack = document.querySelector('.steps');
function updateCurrentSection() {
  navFrame = 0;
  const marker = Math.min(220, innerHeight * .3);
  let current = navSections[0];
  for (const item of navSections) if (item.section.getBoundingClientRect().top <= marker) current = item;
  for (const item of navSections) {
    if (item === current) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  }
  const total = document.documentElement.scrollHeight - innerHeight;
  header.style.setProperty('--reading-progress', total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0);
  header.classList.toggle('is-scrolled', scrollY > 32);
  // A separate reading cue for the process: no pinning, wheel interception or
  // connection to the WebGL scene. The document always scrolls naturally.
  if (processTrack) {
    const rect = processTrack.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight * .8 - rect.top) / (rect.height + innerHeight * .25)));
    processTrack.style.setProperty('--step-progress', reducedMotion.matches ? 1 : progress);
    processSteps.forEach((step, index) => step.classList.toggle('step-active', reducedMotion.matches || progress >= index / processSteps.length));
  }
}
addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateCurrentSection); }, { passive: true });
addEventListener('resize', updateCurrentSection);
document.fonts.ready.then(updateCurrentSection);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) reveals.forEach(el => { el.classList.add('visible'); observer?.unobserve(el); });
  updateCurrentSection();
});
updateCurrentSection();

// One scheduled update at a time; keyboard focus gets the same illuminated state.
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.price-card').forEach(card => {
  let frame = 0, x = 50, y = 0;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
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

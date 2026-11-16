/* Local concept previews; no personal data or external services are used. */
(() => {
  const dialog=document.querySelector('#project-dialog');
  if(!dialog)return;
  const body=dialog.querySelector('#demo-body'),title=dialog.querySelector('#demo-title');
  const contact=dialog.querySelector('#demo-contact');
  let trigger=null,oldOverflow='',timers=[];
  const concepts={
    forma:{name:'Forma Arquitetura',category:'Site institucional',content:`<p class="demo-caption">Uma direção visual editorial, com tons naturais e espaço para o trabalho falar. Experimente as categorias abaixo.</p><div class="demo-surface demo-forma"><div class="demo-brandbar"><b>forma.</b><span>ARQUITETURA ESSENCIAL</span></div><div class="demo-forma-grid"><div><small>ESPAÇOS COM PROPÓSITO</small><h3>O lugar de<br>uma nova vida.</h3><p>Arquitetura que encontra beleza no essencial. Um conceito de estúdio que aproxima pessoas, materiais e natureza.</p><div class="demo-filter" role="group" aria-label="Categorias de projetos"><button aria-pressed="true" data-category="residencial">Residencial</button><button aria-pressed="false" data-category="comercial">Comercial</button></div></div><div class="architecture" role="img" aria-label="Ilustração arquitetônica de uma casa com materiais naturais"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#fm-house"/></svg></div></div><p class="demo-project-description" role="status">Casa Horizonte — um estudo residencial com volumes simples, luz natural e integração entre os ambientes.</p></div>`},
    vitta:{name:'Vitta Saúde',category:'Agendamentos e sistemas',content:`<p class="demo-caption">Uma agenda simples de entender e rápida de usar. Escolha um serviço e um horário para experimentar a confirmação.</p><div class="demo-surface demo-vitta"><div class="demo-brandbar"><b>VITTA</b><span>SEU TEMPO. SEU CUIDADO.</span></div><div class="demo-booking"><div><h3>Cuidar de você<br>começa aqui.</h3><p>Encontre o melhor momento para uma pausa na rotina. Esta agenda é uma demonstração, com horários ilustrativos.</p><div class="demo-doctor"><div class="doctor-dot" aria-hidden="true"></div><div><b>Equipe Vitta</b><span>Atendimento humanizado</span></div></div></div><div><label for="demo-service">Escolha o atendimento</label><select id="demo-service"><option>Consulta inicial</option><option>Acompanhamento</option><option>Orientação online</option></select><div class="demo-day">Quarta-feira · dia demonstrativo</div><div class="demo-times" role="group" aria-label="Horários disponíveis">${['09:00','10:30','11:00','14:00','15:30','16:00'].map((t,i)=>`<button type="button" data-time="${t}" aria-pressed="${i===0}">${t}</button>`).join('')}</div><button type="button" class="demo-book-button">Simular agendamento →</button><div class="demo-book-status" role="status" aria-live="polite">Horário escolhido: 09:00. Pronto para simular.</div></div></div></div>`},
    nexo:{name:'Nexo Operações',category:'Site e automação',content:`<p class="demo-caption">Do interesse ao atendimento, sem perder o contexto. Execute o fluxo para ver um contato percorrer as etapas da operação.</p><div class="demo-surface demo-nexo"><div class="demo-brandbar"><b>nexo /</b><span>● AMBIENTE DEMONSTRATIVO</span></div><div class="demo-automation"><h3>Seu próximo contato.<br>O próximo passo, pronto.</h3><p>Um exemplo de como conectar formulário, organização comercial e atendimento em um único fluxo.</p><div class="demo-flow"><div class="demo-node"><i aria-hidden="true">↗</i><strong>Receber contato</strong><small>Formulário do site</small></div><span aria-hidden="true">→</span><div class="demo-node"><i aria-hidden="true">◇</i><strong>Organizar no CRM</strong><small>Cadastro e interesse</small></div><span aria-hidden="true">→</span><div class="demo-node"><i aria-hidden="true">✓</i><strong>Iniciar atendimento</strong><small>Resposta automática</small></div></div><button type="button" class="demo-run">▶ Simular novo contato</button><div class="demo-run-status" role="status" aria-live="polite">Fluxo pronto para simulação.</div><div class="demo-activity"><div><b>Atividade do fluxo</b><span id="demo-activity-text">Aguardando o primeiro contato de exemplo</span></div></div></div></div>`}
  };
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}
  function connectDemo(id){
    if(id==='forma')body.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{
      body.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const commercial=button.dataset.category==='comercial';
      body.querySelector('.demo-project-description').textContent=commercial?'Estúdio Jardim — um estudo comercial com áreas de encontro, materiais acolhedores e espaço para novas ideias.':'Casa Horizonte — um estudo residencial com volumes simples, luz natural e integração entre os ambientes.';
      body.querySelector('.architecture').style.filter=commercial?'hue-rotate(20deg) saturate(.75)':'';
    }));
    if(id==='vitta'){
      let time='09:00';const status=body.querySelector('.demo-book-status');
      body.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{
        time=button.dataset.time;body.querySelectorAll('[data-time]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));status.textContent=`Horário escolhido: ${time}. Pronto para simular.`;
      }));
      body.querySelector('#demo-service').addEventListener('change',()=>{status.textContent='Atendimento alterado. Confirme sua escolha para simular.';});
      body.querySelector('.demo-book-button').addEventListener('click',()=>{status.textContent=`Simulação concluída: ${body.querySelector('#demo-service').value.toLowerCase()} às ${time}. Nenhum horário real foi reservado.`;});
    }
    if(id==='nexo')body.querySelector('.demo-run').addEventListener('click',event=>{
      // aria-disabled keeps keyboard focus on the button while the example runs.
      const button=event.currentTarget;if(button.getAttribute('aria-disabled')==='true')return;
      clearTimers();const nodes=[...body.querySelectorAll('.demo-node')],status=body.querySelector('.demo-run-status'),activity=body.querySelector('#demo-activity-text');
      nodes.forEach(n=>n.classList.remove('done'));button.setAttribute('aria-disabled','true');status.textContent='Recebendo um contato de exemplo…';
      const steps=['Contato recebido: Marina · interesse em um novo site.','Cadastro de exemplo organizado no CRM.','Simulação concluída. Atendimento iniciado, sem envio de mensagem real.'];
      const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
      steps.forEach((text,i)=>timers.push(setTimeout(()=>{nodes[i].classList.add('done');status.textContent=text;activity.textContent=`${i+1} de 3 etapas concluídas`;if(i===2){button.removeAttribute('aria-disabled');button.textContent='↻ Simular novamente';}},reduced?0:450+i*650)));
    });
  }
  document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.project,c=concepts[id];if(!c)return;
    clearTimers();trigger=button;title.textContent=c.name;body.innerHTML=c.content;
    contact.href='https://wa.me/5513985990880?text='+encodeURIComponent(`Olá, Prisma! Gostei do conceito ${c.name} e quero conversar sobre um projeto de ${c.category.toLowerCase()} para minha empresa.`);
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;connectDemo(id);
  }));
  dialog.querySelector('.demo-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{clearTimers();document.body.style.overflow=oldOverflow;trigger?.focus({preventScroll:true});});
})();

/* v15 — explicação em etapas. Sem bibliotecas, APIs, envio de dados ou dependência de login. */
(() => {
  const box = document.querySelector('[data-lesson-stepper]');
  if (!box) return;
  const dataEl = box.querySelector('.lesson-stages-data');
  let stages;
  try { stages = JSON.parse(dataEl.textContent); } catch { return; }
  if (!Array.isArray(stages) || !stages.length) return;
  let index = 0;
  const progress = box.querySelector('.lesson-stepper-progress');
  const content = box.querySelector('.lesson-stepper-content');
  const count = box.querySelector('.stepper-count');
  const prev = box.querySelector('.stepper-prev');
  const next = box.querySelector('.stepper-next');
  const present = box.querySelector('.stepper-present');
  const dialog = document.createElement('dialog');
  dialog.className = 'lesson-presentation';
  dialog.setAttribute('aria-label', 'Explicação em modo apresentação');
  dialog.innerHTML = `<div class="lesson-presentation-shell"><div class="lesson-presentation-top"><strong>IA PARA EMPREENDEDORES</strong><span class="lesson-presentation-current" aria-live="polite"></span><button type="button" class="lesson-presentation-close">✕ Sair</button></div><div class="lesson-presentation-slide"></div><div class="lesson-presentation-bottom"><button type="button" class="btn btn-outline present-prev">← Voltar</button><span>Use as setas do teclado para navegar</span><button type="button" class="btn btn-primary present-next">Avançar →</button></div></div>`;
  document.body.append(dialog);
  const slide = dialog.querySelector('.lesson-presentation-slide');
  const current = dialog.querySelector('.lesson-presentation-current');
  const dPrev = dialog.querySelector('.present-prev');
  const dNext = dialog.querySelector('.present-next');
  const close = dialog.querySelector('.lesson-presentation-close');
  let restoreFocus = null;

  function element(tag, cls, value) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (value !== undefined) e.textContent = value;
    return e;
  }
  async function copyPrompt(raw, button) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(raw);
      else {
        const area = document.createElement('textarea'); area.value = raw;
        area.style.position = 'fixed';area.style.opacity = '0';
        document.body.append(area);area.select();
        const success = document.execCommand('copy');area.remove();
        if (!success) throw new Error('copy-failed');
      }
      button.textContent = 'Copiado!';
    } catch {
      button.textContent = 'Selecione o texto e copie';
      const text = button.parentElement.querySelector('pre');
      if (text) {const sel = window.getSelection();const range=document.createRange(); range.selectNodeContents(text);sel.removeAllRanges();sel.addRange(range);}
    }
  }
  function makeCard(stage, full) {
    const card = element('article','lesson-step-card');
    card.append(element('span','lesson-step-eyebrow', 'PASSO '+(index+1)+' DE '+stages.length));
    card.append(element(full?'h2':'h3','lesson-step-title',stage.titulo));
    card.append(element('p','lesson-step-body',stage.explicacao));
    if (stage.prompt) {
      const wrap = element('div','lesson-step-prompt');
      wrap.append(element('strong','', 'Faça junto no Gemini'));
      const pre = element('pre','',stage.prompt);
      const b = element('button','btn btn-outline lesson-prompt-copy','Copiar pedido');
      b.type='button';b.addEventListener('click',()=>copyPrompt(stage.prompt,b));
      wrap.append(pre,b);card.append(wrap);
      const link=element('a','lesson-gemini-link','Abrir Gemini em outra aba ↗');
      link.href='https://gemini.google.com/';link.target='_blank';link.rel='noopener noreferrer';card.append(link);
    }
    const cue = element('div','lesson-step-check');
    cue.append(element('strong','', 'O que observar'));
    cue.append(element('p','',stage.olhar));card.append(cue);
    return card;
  }
  function render() {
    const stage = stages[index];
    content.replaceChildren(makeCard(stage,false));
    progress.replaceChildren();
    stages.forEach((_,i)=>{ const dot=element('span','lesson-step-dot'+(i<=index?' is-done':'')); dot.style.flex='1';progress.append(dot);});
    count.textContent = 'Passo '+(index+1)+' de '+stages.length;
    prev.disabled = index===0;next.disabled=index===stages.length-1;
    current.textContent = 'Passo '+(index+1)+' de '+stages.length;
    dPrev.disabled=prev.disabled;dNext.disabled=next.disabled;
    slide.replaceChildren(makeCard(stage,true));
  }
  function go(delta) { index=Math.max(0,Math.min(stages.length-1,index+delta));render(); }
  prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
  dPrev.addEventListener('click',()=>go(-1));dNext.addEventListener('click',()=>go(1));
  present.addEventListener('click',()=>{restoreFocus=document.activeElement;render(); if(dialog.showModal) dialog.showModal();else dialog.setAttribute('open','');close.focus();});
  close.addEventListener('click',()=>{ if(dialog.close) dialog.close();else dialog.removeAttribute('open'); });
  dialog.addEventListener('close',()=>{if(restoreFocus?.focus) restoreFocus.focus();});
  dialog.addEventListener('click',(ev)=>{ if(ev.target===dialog){ if(dialog.close) dialog.close();}});
  dialog.addEventListener('keydown',(ev)=>{if(ev.key==='ArrowRight'){ev.preventDefault();go(1);}else if(ev.key==='ArrowLeft'){ev.preventDefault();go(-1);}});
  render();
})();

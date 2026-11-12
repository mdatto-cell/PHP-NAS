/* ===== Мобильная версия (ширина до 800px): компактные строки, плитки на всю ширину, шкала дат, кнопка закрытия меню ===== */
document.head.append(Object.assign(document.createElement('style'), {textContent: `
#sideBurger { display: none; position: absolute; z-index: 2; align-items: center; justify-content: center; border: 0; border-radius: 10px; background: transparent; color: var(--fg, #e6e6ea); cursor: pointer; padding: 0; }
@media (hover: hover) { #sideBurger:hover { background: rgba(255, 255, 255, .08); } }
#sideBurger .ic-svg { width: 22px; height: 22px; }
@media (max-width: 800px) {
  /* строки списка во всех разделах: меньше иконка, чек-бокс и кнопки; размер прижат к кнопкам */
  :is(#list, #favv, #sharev, #trashv):not(.grid) { padding-left: 6px; padding-right: 16px; box-sizing: border-box; }
  #list:not(.grid) #newBar { box-sizing: border-box; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row { position: relative; gap: 4px !important; padding: 5px 0 5px 28px !important; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row > .ck { position: absolute !important; left: 0 !important; top: 50% !important; transform: translateY(-50%) !important; width: 26px; height: 26px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .ck .bx { width: 18px; height: 18px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .ic { width: 32px; height: 32px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .ic.vid .pv { width: 14px; height: 14px; right: 0; bottom: 0; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .ic.vid .pv .ic-svg { width: 8px; height: 8px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .nm { min-width: 0; font-size: 14px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row .sz { width: auto !important; min-width: 0; margin: 0 2px 0 0 !important; font-size: 11px; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row :is(.ract, .fact) { position: static !important; transform: none !important; flex: none; gap: 0 !important; opacity: 1 !important; }
  #favv:not(.grid) .row > .flnk { position: static !important; transform: none !important; flex: none; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row :is(.ract button, .fact button), :is(#list, #favv, #sharev, #trashv):not(.grid) .row > :is(.flnk, .more) { width: 26px !important; height: 28px !important; padding: 0 !important; margin: 0 !important; flex: none; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row > .more { width: 22px !important; margin-left: -2px !important; }
  :is(#list, #favv, #sharev, #trashv):not(.grid) .row :is(.ract, .fact, .flnk, .more) .ic-svg { width: 17px; height: 17px; flex: none; }
  /* «Файлы»: наведения нет — скачать, звезда и ссылка видны всегда, на них можно нажать */
  #list:not(.grid) .row .ract button { opacity: 1 !important; visibility: visible !important; }
  /* «Избранное»: у строки без ссылки оставляем место под иконку ссылки, чтобы столбцы не съезжали */
  #favv:not(.grid) .row:not(:has(> .flnk)) > .more { margin-left: 28px !important; }   /* 26px иконка + 4px промежуток − 2px */

  /* плитки: колонки растягиваются на всю ширину, без пустого места справа */
  :is(#list, #favv, #sharev, #trashv).grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; justify-content: stretch !important; gap: 8px !important; padding-left: 8px !important; padding-right: 8px !important; }

  /* шапка раздела плотнее — больше места под название */
  #top { gap: 4px !important; padding-left: 8px !important; padding-right: 14px !important; }
  /* «Очистить корзину» и «Отозвать всё» — только иконка, чтобы было видно название раздела */
  #topx :is(#btnEmpty, #btnShAll) { font-size: 0 !important; gap: 0 !important; width: 38px; height: 38px; padding: 0 !important; justify-content: center; flex: none; }
  #topx :is(#btnEmpty, #btnShAll) .ic-svg { width: 20px; height: 20px; margin: 0 !important; }

  /* галерея: узкая шкала дат справа */
  body.mode-photos #prail { display: flex !important; right: 0; width: 38px; top: 64px; bottom: 12px; font-size: 10px; }
  #prail .ry b { font-size: 10px; padding: 0 4px 0 0; }
  #prail .ry.ex b { font-size: 11px; }
  #prail .ry.ex .rm { font-size: 10px; margin-right: 4px; }
  #prail .rm { margin: 2px 4px 2px 0; }
  body.mode-photos #photos { padding-left: 6px !important; padding-right: 40px !important; }
  #pbub { right: 46px; }

  /* кнопка «меню» внутри открытого левого меню — на месте кнопки, которой меню открыли */
  #sideBurger { display: inline-flex; }
}
`}));

{
  const side = $('#side'), burger = $('#burger');
  if (side && burger && !$('#sideBurger')) {
    const b = document.createElement('button');
    b.id = 'sideBurger'; b.type = 'button'; b.title = 'Закрыть меню';
    b.innerHTML = burger.innerHTML || ico('menu');
    side.prepend(b);
    // ставим кнопку ровно туда, где на экране была кнопка «меню» в шапке раздела, «Диск» сдвигаем правее
    const place = () => {
      const r = burger.getBoundingClientRect(), s = side.getBoundingClientRect();
      if (!r.width) return;
      Object.assign(b.style, {left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px'});
      const row = side.querySelector('.logo-row') || side.querySelector('.logo');
      if (row) {
        row.style.paddingLeft = ''; row.style.marginTop = '';
        const lr = row.getBoundingClientRect(), shift = r.right + 8 - (lr.left - s.left);
        row.style.paddingLeft = Math.max(0, shift) + 'px';
        row.style.minHeight = r.height + 'px';
        row.style.marginTop = Math.max(0, r.top - (lr.top - s.top)) + 'px';
      }
    };
    burger.addEventListener('click', place, true);
    // вернулись к широкому экрану — убираем сдвиг «Диск»
    matchMedia('(max-width: 800px)').addEventListener('change', m => { if (m.matches) return; const row = side.querySelector('.logo-row') || side.querySelector('.logo'); if (row) row.style.paddingLeft = row.style.marginTop = row.style.minHeight = ''; });
    b.addEventListener('click', e => { e.stopPropagation(); side.classList.remove('open'); });
    // «Избранное» и «Общий доступ» гасят всплытие клика — закрываем меню на этапе перехвата
    side.addEventListener('click', e => { if (e.target.closest('#navFav, #navShare')) side.classList.remove('open'); }, true);
  }
}

// у кнопок-иконок остаётся подсказка с полным названием
{
  const tx = $('#topx');
  if (tx) new MutationObserver(() => tx.querySelectorAll('#btnEmpty, #btnShAll').forEach(b => { if (!b.title) b.title = b.textContent.trim(); b.setAttribute('aria-label', b.title); })).observe(tx, {childList: true, subtree: true});
}

/* iOS иногда всё равно масштабирует по двойному тапу (если между тапами перерисовался DOM).
   Второй быстрый тап рядом с первым гасим (preventDefault) и сами отдаём click — двойное нажатие
   в списках продолжает работать, а страница не масштабируется. Только в списках разделов; остальное защищает touch-action в ui3.css. */
{
  let t0 = 0, x0 = 0, y0 = 0;
  document.addEventListener('touchend', e => {
    if (e.touches.length || e.changedTouches.length !== 1) { t0 = 0; return; }
    const t = e.changedTouches[0], now = Date.now();
    const dbl = now - t0 < 450 && Math.abs(t.clientX - x0) < 40 && Math.abs(t.clientY - y0) < 40;
    t0 = dbl ? 0 : now; x0 = t.clientX; y0 = t.clientY;
    if (!dbl) return;
    const el = e.target;
    if (!el || !el.closest || !el.closest('#list, #favv, #sharev, #trashv') || el.closest('input, textarea, select')) return;   // только списки разделов
    e.preventDefault();
    // не el.click(): у SVG-иконок (папки, документы в плитках) этого метода нет
    el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window, clientX: t.clientX, clientY: t.clientY, screenX: t.screenX, screenY: t.screenY}));
  }, {passive: false, capture: true});
}

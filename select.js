/* ===== Выбор чекбоксами в разделах «Избранное», «Общий доступ», «Корзина» =====
   Как в «Файлах»: чекбокс у строки/плитки, Ctrl+клик, Ctrl+A, Esc; вверху — «Выбрано: N», «Выделить все» и действия.
   «Файлы» — viewer.js (#selBar). Галерея и История выбора не имеют. */
(() => {
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const P = ['#favv', '#sharev', '#trashv'];
const css = (f) => P.map(f).join(',\n');
document.head.append(Object.assign(document.createElement('style'), {textContent: `
${css(p => `${p} .row .ck`)} { flex: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .12s; z-index: 3; }
${css(p => `${p} .row .ck .bx`)} { width: 20px; height: 20px; border-radius: 5px; border: 2px solid #8e8e99; background: rgba(20, 20, 24, .55); box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: background .12s, border-color .12s; }
${css(p => `${p} .row .ck svg`)} { width: 13px; height: 13px; opacity: 0; }
${css(p => `${p} .row .ck:hover .bx`)} { border-color: #fff; }
${css(p => `${p} .row .ck[aria-checked=true] .bx`)} { background: #0a84ff; border-color: #0a84ff; }
${css(p => `${p} .row .ck[aria-checked=true] svg`)} { opacity: 1; }
${css(p => `${p} .row:hover .ck, ${p} .row .ck[aria-checked=true], ${p}.selon .row .ck`)} { opacity: 1; }
/* список: чекбокс в свободном поле слева (место под него уже отведено отступом строки) */
#trashv:not(.grid) .row { position: relative; }
${css(p => `${p}:not(.grid) .row > .ck`)} { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }
/* плитки: в круглой подложке в правом нижнем углу превью, как в «Файлах» */
${css(p => `${p}.grid .row .ic`)} { position: relative; }
${css(p => `${p}.grid .row .ic > .ck`)} { position: absolute; right: 4px; bottom: 4px; width: 32px; height: 32px; border-radius: 50%; background: rgba(32, 32, 38, .82); }
${css(p => `${p}.grid .row .ic > .ck .bx`)} { width: 18px; height: 18px; }
@media (hover: none) { ${css(p => `${p} .row .ck`)} { opacity: 1; } }
/* видео: значок «play» по центру плитки (в списке — маленький в углу) */
.grid .row .ic.vid .pv { right: auto; bottom: auto; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 34px; height: 34px; }
.grid .row .ic.vid .pv .ic-svg { width: 16px; height: 16px; }
/* панель выбранного */
#top.selon2 > #filter, #top.selon2 > #sort, #top.selon2 > #sortBtn, #top.selon2 > #viewBtn { display: none !important; }
.selbar2 { display: none; align-items: center; gap: 4px; margin-left: auto; }
#top.selon2 .selbar2 { display: flex; }
.selbar2 .cnt { color: #cfcfd8; font-size: 14px; margin-right: 8px; white-space: nowrap; }
.selbar2 button { width: 38px; height: 38px; border: 0; border-radius: 10px; background: #2a2a31; color: #e6e6ea; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.selbar2 button:hover { background: #35353d; color: #fff; }
.selbar2 button .ic-svg { width: 20px; height: 20px; }
.selbar2 button.danger { color: #ff6b6b; }
.selbar2 button.danger:hover { background: #4a2a2e; color: #ff8a8a; }
`}));

const wait = ms => new Promise(r => setTimeout(r, ms));
const dlAll = async its => {
  for (let i = 0; i < its.length; i++) {
    if (i) await wait(700);
    if (its[i].d) zipDownload(its[i].p); else dlFile(fileUrl(its[i].p, true));
  }
};
const many = n => n > 1 ? ` (${n})` : '';

// описание разделов: панель, строки, список объектов в порядке отрисовки, ключ объекта, действия
const SECT = {
  fav: {
    el: '#favv', row: '.frow', idx: r => +r.dataset.k, items: () => $('#favv')._items || [], key: i => i.p, sel: new Set(),
    acts: [
      ['dl', 'Скачать', 'download', '', its => dlAll(its)],
      ['unfav', 'Убрать из избранного', 'starFill', '', async its => { await api('fav_del', {items: its.map(i => i.p)}); return 'reload'; }],
    ],
    reload: () => load(),
  },
  shares: {
    el: '#sharev', row: '.srow', idx: r => +r.dataset.k, items: () => $('#sharev')._items || [], key: i => i.p, sel: new Set(),
    acts: [
      ['dl', 'Скачать', 'download', '', its => dlAll(its)],
      ['copy', 'Скопировать ссылки', 'copy', '', its => window.SHX && SHX.copy(its)],
      ['rv', 'Отозвать доступ', 'unlink', 'danger', async its => (window.SHX && await SHX.revoke(its)) ? 'clear' : ''],
    ],
    reload: () => {},
  },
  trash: {
    el: '#trashv', row: '.trow', idx: r => +r.dataset.i, items: () => T.L || [], key: i => i.id, get sel() { return T.sel; }, set sel(v) { T.sel = v; },
    acts: [
      ['restore', 'Восстановить', 'restore', '', async its => { await api('restore', {ids: its.map(i => i.id)}); return 'reload'; }],
      ['purge', 'Удалить навсегда', 'flame', 'danger', async its => {
        if (!await uiConfirm(objTitle('Удаление', its.map(i => ({n: i.name, d: i.d}))), 'Объекты будут удалены навсегда. Это действие необратимо.', 'Удалить навсегда', true)) return '';
        await api('purge', {ids: its.map(i => i.id)}); return 'reload';
      }],
    ],
    reload: () => load(),
  },
};
const cur = () => (SECT[mode] && SECT[mode].el && $(SECT[mode].el) && !$(SECT[mode].el).hidden) ? SECT[mode] : null;

const top = $('#top');
const cntTxt = n => { const a = n % 10, b = n % 100; return 'Выбрано: ' + n + ' ' + (a === 1 && b !== 11 ? 'объект' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'объекта' : 'объектов'); };
const bars = {};
for (const [k, s] of Object.entries(SECT)) {
  const b = document.createElement('div'); b.className = 'selbar2'; b.dataset.s = k; b.hidden = true;
  b.innerHTML = `<span class="cnt"></span><button data-x="all" class="all" title="Выделить все (Ctrl+A)">${ico('selAll')}</button>` +
    s.acts.map(([id, t, ic, cls]) => `<button data-x="${id}"${cls ? ` class="${cls}"` : ''} title="${t}">${ico(ic)}</button>`).join('') +
    `<button data-x="cancel" title="Отменить выбор (Esc)">${ico('close')}</button>`;
  top.append(b); bars[k] = b;
}

let lastMode = mode, busy = false;
function sync() {
  if (busy) return; busy = true;
  try {
    if (mode !== lastMode) {   // переход в другой раздел — выбор сбрасывается
      for (const [k, s] of Object.entries(SECT)) if (k !== 'trash' && k !== mode) s.sel = new Set();
      lastMode = mode;
    }
    const s = cur(), k = s ? mode : '';
    if (s) {   // убрать из выбора то, чего больше нет (с учётом скрытого поиском)
      const pool = mode === 'trash' ? (T.items || []) : ($(s.el)._all || s.items());
      const keys = new Set(pool.map(s.key));
      for (const x of [...s.sel]) if (!keys.has(x)) s.sel.delete(x);
    }
    const on = !!s && s.sel.size > 0;
    if (on && !top.classList.contains('selon2')) { top.style.height = top.offsetHeight + 'px'; top.classList.add('lockh'); }
    if (!on && top.classList.contains('selon2')) { top.style.height = ''; top.classList.remove('lockh'); }
    top.classList.toggle('selon2', on);
    for (const [bk, b] of Object.entries(bars)) {
      b.hidden = !(on && bk === k);
      b.style.display = b.hidden ? 'none' : '';
    }
    if (on) bars[k].querySelector('.cnt').textContent = cntTxt(s.sel.size);
    for (const [sk, sx] of Object.entries(SECT)) { const el = $(sx.el); if (el) el.classList.toggle('selon', sk === k && on); }
    if (!s) return;
    const el = $(s.el), grid = el.classList.contains('grid'), items = s.items();
    el.querySelectorAll(s.row).forEach(r => {
      const it = items[s.idx(r)]; if (!it) return;
      let ck = r.querySelector(':scope > .ck, .ic > .ck');
      if (!ck) { ck = document.createElement('span'); ck.className = 'ck'; ck.setAttribute('role', 'checkbox'); ck.title = 'Выбрать'; ck.innerHTML = '<span class="bx">' + CHECK + '</span>'; }
      const ic = r.querySelector('.ic');
      if (grid && ic && ck.parentNode !== ic) ic.append(ck);
      else if (!grid && ck.parentNode !== r) r.prepend(ck);
      const v = s.sel.has(s.key(it));
      if (ck.getAttribute('aria-checked') !== String(v)) ck.setAttribute('aria-checked', String(v));
      if (r.classList.contains('sel') !== v) r.classList.toggle('sel', v);
    });
  } finally { busy = false; }
}
let q = 0;
const later = () => { if (!q) q = requestAnimationFrame(() => { q = 0; sync(); }); };
P.forEach(id => { const el = $(id); if (el) new MutationObserver(later).observe(el, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden']}); });
addEventListener('hashchange', later);
document.addEventListener('click', later);

const toggle = (s, it) => { const k = s.key(it); s.sel.has(k) ? s.sel.delete(k) : s.sel.add(k); if (mode === 'trash') drawTrash(); sync(); };
const clear = s => { s.sel = new Set(); if (mode === 'trash') drawTrash(); sync(); };
const selectAll = s => { s.items().forEach(i => s.sel.add(s.key(i))); if (mode === 'trash') drawTrash(); sync(); };

// клик по чекбоксу — только выбор; Ctrl+клик по строке — тоже выбор (в «Корзине» обрабатывает trash.js)
for (const [k, s] of Object.entries(SECT)) {
  const el = $(s.el); if (!el) continue;
  el.addEventListener('click', e => {
    if (mode !== k) return;
    const r = e.target.closest(s.row); if (!r) return;
    const ck = e.target.closest('.ck');
    if (!ck && !(k !== 'trash' && (e.ctrlKey || e.metaKey) && !e.target.closest('button'))) return;
    e.stopPropagation(); e.preventDefault();
    const it = s.items()[s.idx(r)]; if (it) toggle(s, it);
  }, true);
  el.addEventListener('contextmenu', e => { if (e.target.closest('.ck')) { e.preventDefault(); e.stopPropagation(); } }, true);
}

// кнопки панели
Object.values(bars).forEach(b => b.addEventListener('click', async e => {
  const x = e.target.closest('[data-x]'); if (!x) return;
  e.stopPropagation();
  const s = cur(); if (!s) return;
  if (x.dataset.x === 'cancel') return clear(s);
  if (x.dataset.x === 'all') return selectAll(s);
  const pool = mode === 'trash' ? (T.items || []) : (($(s.el)._all) || s.items());
  const its = pool.filter(i => s.sel.has(s.key(i)));
  if (!its.length) return clear(s);
  const a = s.acts.find(a => a[0] === x.dataset.x); if (!a) return;
  try {
    const r = await a[4](its);
    if (r === 'reload') { s.sel = new Set(); await s.reload(); }
    else if (r === 'clear') s.sel = new Set();
  } catch (err) { console.error(err); }
  sync();
}));

// клавиатура: Ctrl+A — выделить все, Esc — снять выбор
document.addEventListener('keydown', e => {
  const s = cur(); if (!s || hasOvl() || !$('#viewer').hidden) return;
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); selectAll(s); }
  else if (e.key === 'Escape' && s.sel.size) { clear(s); }
});
// для меню «⋮» / правой кнопки в «Избранном» и «Общем доступе» (viewer.js, share.js):
// если объект среди выбранных — действие для всех выбранных, иначе только для него; выбор не меняется
const selPool = s => (($(s.el)._all) || s.items()).filter(i => s.sel.has(s.key(i)));
window.SELX = {
  multi: (k, it) => { const s = SECT[k]; return !!s && s.sel.size > 1 && s.sel.has(s.key(it)); },
  targets: (k, it) => { const s = SECT[k]; return (s && s.sel.has(s.key(it))) ? selPool(s) : [it]; },
  clear: k => { const s = SECT[k]; if (s) { s.sel = new Set(); sync(); } },
  dl: its => dlAll(its),
};
// кнопка «Загрузить» — только в «Файлах»: после загрузки любого раздела (в т.ч. при открытии #trash по F5)
{ const baseLoad = load; load = async function () { try { return await baseLoad.apply(this, arguments); } finally { updateFab(); } }; }
updateFab();
sync();
})();

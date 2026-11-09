/* ===== Общий доступ по ссылке («Поделиться») =====
   Включается в config.php: 'share' => true. Внешний адрес ссылок — 'share_url'.
   Синяя иконка ссылки — одноразовая, зелёная — постоянная. */
(() => {
if ((document.querySelector('meta[name=share]') || {}).content !== '1') return;
const SHARE_URL = ((document.querySelector('meta[name=share-url]') || {}).content || '').trim();

Object.assign(IC, {
  link:   SV('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>'),
  unlink: SV('<path d="M15.5 13.5l3.5-3.5a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M8.5 10.5L5 14a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/><path d="M4 4l16 16"/>'),
  check:  SV('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
});

document.head.append(Object.assign(document.createElement('style'), {textContent: `
:root { --sh-once: #0a84ff; --sh-perm: #30d158; }
/* место под третью кнопку (ссылка) слева от «⋮» — одинаково в «Файлах», «Избранном», «Корзине» и «Общем доступе» */
#list:not(.grid) .row .sz, #favv .row .sz, #trashv:not(.grid) .row .sz, #sharev .row .sz { margin-right: 118px; }
#favv .fact { right: 90px; }
#favv.grid .row .sz, #sharev.grid .row .sz { margin-right: 0; }
/* список: кнопки видимы по отдельности — активная ссылка видна всегда */
#list:not(.grid) .row .ract { opacity: 1; }
#list:not(.grid) .row .ract button { opacity: 0; transition: opacity .12s; }
#list:not(.grid) .row:hover .ract button, #list:not(.grid) .row .ract.on button[data-fa], #list:not(.grid) .row .ract button.sh { opacity: 1; }
.ract button.sh.once, #list.grid .ic > button.sh.once, #sharev .lnk.once { color: var(--sh-once); }
.ract button.sh.perm, #list.grid .ic > button.sh.perm, #sharev .lnk.perm { color: var(--sh-perm); }
/* плитки: ссылка внутри иконки слева снизу; если объект в избранном — над звёздочкой */
#list.grid .row .ic > button[data-sh] { position: absolute; left: 4px; bottom: 4px; z-index: 3; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: rgba(32, 32, 38, .82); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
#list.grid .row .ic > button[data-sh]:not(.sh) { display: none; }
#list.grid .row .ic > button[data-sh]:hover { background: rgba(60, 60, 68, .95); }
#list.grid .row .ic > button[data-sh] .ic-svg { width: 20px; height: 20px; }
#list.grid .row:has(.ic > button.sh):not(:has(.ic > button[data-fa=star].fv)) .ic > button[data-fa=star] { bottom: 40px; }
#list.grid .row:has(.ic > button[data-fa=star].fv) .ic > button.sh { bottom: 40px; }

/* окно «Поделиться» */
.shck { display: flex; align-items: flex-start; gap: 10px; margin: 0 8px 16px; font-size: 14px; cursor: pointer; user-select: none; }
.shck input { width: 18px; height: 18px; margin: 1px 0 0; accent-color: var(--sh-once); flex: none; cursor: pointer; }
.shck small { display: block; color: var(--mut); font-size: 12px; margin-top: 2px; }
.shl { display: flex; gap: 6px; align-items: center; margin: 0 4px 14px; }
.shl .dinp { flex: 1; min-width: 0; margin: 0; font-size: 13px; }
.shl button { flex: none; width: 40px; height: 40px; border: 0; border-radius: 10px; background: #34343c; color: #e6e6ea; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.shl button:hover { background: #3e3e47; color: #fff; }
.shl button.ok { color: var(--sh-perm); }
.shl button .ic-svg { width: 20px; height: 20px; }
.shtag { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
.shtag .ic-svg { width: 18px; height: 18px; }
.shtag.once { color: var(--sh-once); } .shtag.perm { color: var(--sh-perm); }
#shToast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 100; background: #34343c; color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 14px; box-shadow: 0 6px 24px #0007; pointer-events: none; transition: opacity .2s; }

/* раздел «Общий доступ» — как «Избранное» */
#btnShAll { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
#btnShAll .ic-svg { width: 18px; height: 18px; }
#sharev { flex: 1; overflow: auto; padding: 0 10px 30px; }
#sharev[hidden] { display: none !important; }
#sharev .row { position: relative; padding-left: 38px; }
#sharev .nm small { display: block; color: var(--mut); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
#sharev .nm small b { font-weight: 500; }
#sharev .nm small b.once { color: var(--sh-once); } #sharev .nm small b.perm { color: var(--sh-perm); }
#sharev .fact { position: absolute; right: 56px; top: 50%; transform: translateY(-50%); display: flex; gap: 2px; }
#sharev .fact button, #sharev .ic > button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #9a9aa6; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
#sharev .fact button:hover { background: #ffffff14; color: #fff; }
/* цветная иконка ссылки: при наведении — «Отозвать доступ» (красная, перечёркнутая) */
#sharev .lnk .ic-svg + .ic-svg, #sharev .lnk:hover .ic-svg:first-child { display: none; }
#sharev .lnk:hover .ic-svg + .ic-svg { display: block; }
#sharev .fact button.lnk:hover, #sharev .ic > button.lnk:hover { color: #ff6b6b !important; }
#sharev .fact button .ic-svg, #sharev .ic > button .ic-svg { width: 20px; height: 20px; }
#sharev .fact button.lnk.once, #sharev .ic > button.lnk.once { color: var(--sh-once); }
#sharev .fact button.lnk.perm, #sharev .ic > button.lnk.perm { color: var(--sh-perm); }
#sharev.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 170px)); justify-content: start; align-content: start; grid-auto-rows: max-content; gap: 8px; padding: 0 10px 30px; }
#sharev.grid .row { padding: 8px; }
#sharev.grid .row .nm small { display: none; }
#sharev.grid .row .ic { position: relative; }
#sharev.grid .fact { display: contents; }
#sharev.grid .fact button, #sharev.grid .ic > button { position: absolute; z-index: 3; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; }
#sharev.grid .fact button { opacity: 0; transition: opacity .12s; }
#sharev.grid .fact button[data-c] { top: 12px; left: 12px; }
#sharev.grid .ic > button { left: 4px; bottom: 4px; }
#sharev.grid .row:hover .fact button { opacity: 1; }
@media (hover: none) { #sharev.grid .fact button { opacity: 1; } }
`}));

/* ---------- данные ---------- */
const SH = new Map();   // путь -> {t, once, ...}
const qa = s => [...document.querySelectorAll(s)];
const shUrl = t => (SHARE_URL || new URL('share.php', location.href).href) + (SHARE_URL.includes('?') ? '&' : '?') + 't=' + t;
const kindTxt = once => once ? 'Одноразовая' : 'Постоянная';
async function shLoad() {
  try { const j = await api('share_list', null, {}, true); SH.clear(); (j.items || []).forEach(i => SH.set(i.p, i)); return j.items || []; }
  catch (e) { console.error('share_list', e); return []; }
}
function refreshAll() { markShares(); markFavShares(); vMarkShare(); if (!panel.hidden) shShow(); }

/* ---------- буфер обмена (в локальной сети по HTTP navigator.clipboard недоступен) ---------- */
async function copyText(s) {
  try { if (navigator.clipboard && isSecureContext) { await navigator.clipboard.writeText(s); return true; } } catch (_) {}
  const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.append(ta); ta.select(); ta.setSelectionRange(0, s.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
  ta.remove(); return ok;
}
let toastT = 0;
function toast(msg) {
  let t = $('#shToast'); if (!t) { t = document.createElement('div'); t.id = 'shToast'; document.body.append(t); }
  t.textContent = msg; t.style.opacity = '1'; clearTimeout(toastT); toastT = setTimeout(() => { t.style.opacity = '0'; }, 1800);
}
async function copyLink(t) {
  if (await copyText(shUrl(t))) toast('Ссылка скопирована');
  else uiAlert('Не удалось скопировать автоматически. Ссылка:\n' + shUrl(t), 'Ссылка');
}

/* ---------- окно «Поделиться» ---------- */
function shareDialog(p, n, d) {
  let ov;
  const close = () => ov.close();
  ov = mkOvl(`<button class="dx" data-x="c">${ico('close')}</button><h3>Поделиться</h3><div class="shb"></div>`, close);
  const box = ov.querySelector('.shb');
  const what = d ? `папки «${esc(n)}» (архивом ZIP)` : `файла «${esc(n)}»`;
  const result = sh => {
    box.innerHTML = `<p class="dtext"><span class="shtag ${sh.once ? 'once' : 'perm'}">${ico('link')}${kindTxt(sh.once)} ссылка</span><br>` +
      (sh.once ? 'Перестанет работать после первого успешного скачивания.' : 'Работает, пока вы не отзовёте доступ.') + `</p>` +
      `<div class="shl"><input class="dinp" type="text" readonly value="${esc(shUrl(sh.t))}"><button data-x="copy" title="Скопировать ссылку">${ico('copy')}</button></div>` +
      `<div class="dbtns"><button class="dbtn primary" data-x="c">Готово</button><button class="dbtn danger" data-x="rv">Отозвать доступ</button></div>`;
    const inp = box.querySelector('.dinp');
    inp.addEventListener('focus', () => inp.select());
    box.querySelector('[data-x=copy]').focus();
  };
  const ex = SH.get(p);
  if (ex) result(ex);
  else {
    box.innerHTML = `<p class="dtext">Будет создана ссылка для скачивания ${what} без входа в Диск.</p>` +
      `<label class="shck"><input type="checkbox" checked><span>Одноразовая<small>Ссылка удалится после первого успешного скачивания</small></span></label>` +
      `<div class="dbtns"><button class="dbtn primary" data-x="ok">Создать ссылку</button><button class="dbtn" data-x="c">Отмена</button></div>`;
    box.querySelector('[data-x=ok]').focus();
  }
  ov.addEventListener('click', async e => {
    const x = e.target.closest('[data-x]'); if (!x) return;
    const k = x.dataset.x;
    if (k === 'c') return close();
    if (k === 'ok') {
      x.disabled = true;
      try {
        const once = box.querySelector('.shck input').checked;
        const j = await api('share_add', {p, once});
        const sh = {t: j.t, once: !!j.once, p, n, d};
        SH.set(p, sh); refreshAll(); result(sh);
      } catch (_) { x.disabled = false; }
      return;
    }
    if (k === 'copy') {
      const sh = SH.get(p); if (!sh) return;
      const ok = await copyText(shUrl(sh.t));
      if (ok) { x.classList.add('ok'); x.innerHTML = ico('check'); toast('Ссылка скопирована'); setTimeout(() => { x.classList.remove('ok'); x.innerHTML = ico('copy'); }, 1500); }
      else { const inp = box.querySelector('.dinp'); inp.focus(); inp.select(); }
      return;
    }
    if (k === 'rv') { close(); revoke(p); }
  });
}
async function revoke(p) {
  const sh = SH.get(p); if (!sh) return;
  const n = sh.n || base(p);
  if (!await uiConfirm('Отозвать доступ', `Ссылка на «${n}» перестанет работать.`, 'Отозвать', true)) return;
  await api('share_del', {tokens: [sh.t]});
  SH.delete(p); refreshAll(); toast('Доступ отозван');
}
const linkMenu = (e, p) => popMenu(e, [['Скопировать ссылку', () => copyLink(SH.get(p).t), 'copy'], ['Отозвать доступ', () => revoke(p), 'unlink']]);

/* ---------- кнопка «Поделиться» в просмотрщике (Файлы, Галерея, Избранное) ---------- */
document.head.append(Object.assign(document.createElement('style'), {textContent: `#vshare.once { color: var(--sh-once); } #vshare.perm { color: var(--sh-perm); }`}));
$('#vfav').insertAdjacentHTML('afterend', `<button id="vshare" class="icon" title="Поделиться">${ico('link')}</button>`);
function vMarkShare() {
  const b = $('#vshare'), it = vlist[vi]; if (!b || !it) return;
  const sh = SH.get(vPath(it));
  b.classList.toggle('once', !!sh && !!sh.once); b.classList.toggle('perm', !!sh && !sh.once);
  b.title = sh ? `Поделиться · ${kindTxt(sh.once).toLowerCase()} ссылка` : 'Поделиться';
}
$('#vshare').onclick = () => { const it = vlist[vi]; if (it) shareDialog(vPath(it), it.n, false); };
{ const baseShowV = showV; showV = function () { const r = baseShowV.apply(this, arguments); vMarkShare(); return r; }; }

/* ---------- иконка ссылки в строках и плитках «Файлов» ---------- */
function markShares() {
  if (mode !== 'files') return;
  let list; try { list = sorted(); } catch (e) { return; }
  const grid = $('#list').classList.contains('grid');
  qa('#list .row[data-i]').forEach(r => {
    const it = list[+r.dataset.i]; if (!it) return;
    const sh = SH.get(join(cwd, it.n));
    let b = r.querySelector('[data-sh]');
    if (!b) { b = document.createElement('button'); b.dataset.sh = '1'; }
    const host = grid ? r.querySelector('.ic') : r.querySelector('.ract');
    if (host && b.parentNode !== host) host.append(b);
    else if (!host && !b.parentNode) { const more = r.querySelector('.more'); if (more) more.before(b); else r.append(b); }
    b.className = sh ? 'sh ' + (sh.once ? 'once' : 'perm') : '';
    b.title = sh ? `${kindTxt(sh.once)} ссылка — скопировать или отозвать` : 'Поделиться';
    if (!b.innerHTML) b.innerHTML = ico('link');
  });
}
// строки/иконки могут перерисовываться без render() (превью, чекбоксы) — вернуть потерянную кнопку
{
  let qd = false;
  new MutationObserver(() => {
    if (qd || mode !== 'files') return; qd = true;
    queueMicrotask(() => { qd = false; if (qa('#list .row[data-i]').some(r => !r.querySelector('[data-sh]') || ($('#list').classList.contains('grid') && !r.querySelector('.ic > [data-sh]')))) markShares(); });
  }).observe($('#list'), {childList: true, subtree: true});
}
$('#list').addEventListener('click', e => {
  const b = e.target.closest('.row [data-sh]'); if (!b) return;
  e.stopPropagation(); e.preventDefault();
  const r = b.closest('.row[data-i]'); let it; try { it = sorted()[+r.dataset.i]; } catch (_) {}
  if (!it) return;
  const p = join(cwd, it.n);
  if (SH.has(p)) linkMenu(e, p); else shareDialog(p, it.n, it.d);
}, true);

/* ---------- иконка ссылки в «Избранном» у объектов с общим доступом ---------- */
document.head.append(Object.assign(document.createElement('style'), {textContent: `
#favv .row > .flnk, #favv .ic > .flnk { width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; z-index: 3; }
#favv .flnk .ic-svg { width: 20px; height: 20px; }
#favv .flnk.once { color: var(--sh-once); } #favv .flnk.perm { color: var(--sh-perm); }
#favv:not(.grid) .row > .flnk { position: absolute; right: 56px; top: 50%; transform: translateY(-50%); }
#favv:not(.grid) .row > .flnk:hover { background: #ffffff14; }
/* плитки: над звёздочкой слева снизу */
#favv.grid .ic > .flnk { position: absolute; left: 4px; bottom: 40px; border-radius: 50%; background: rgba(32, 32, 38, .82); }
#favv.grid .ic > .flnk:hover { background: rgba(60, 60, 68, .95); }
`}));
function markFavShares() {
  const fp = $('#favv'); if (!fp || fp.hidden) return;
  const items = fp._items || [], grid = fp.classList.contains('grid');
  qa('#favv .frow').forEach(r => {
    const it = items[+r.dataset.k]; if (!it) return;
    const sh = SH.get(it.p);
    let b = r.querySelector('.flnk');
    if (!sh) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('button'); b.innerHTML = ico('link'); }
    b.className = 'flnk ' + (sh.once ? 'once' : 'perm'); b.dataset.fl = it.p;
    b.title = `${kindTxt(sh.once)} ссылка — скопировать или отозвать`;
    const host = grid ? r.querySelector('.ic') : r;
    if (host && b.parentNode !== host) { const more = r.querySelector(':scope > .more'); if (!grid && more) more.before(b); else host.append(b); }
  });
}
if ($('#favv')) {
  let qd = false;
  new MutationObserver(() => { if (qd) return; qd = true; queueMicrotask(() => { qd = false; markFavShares(); }); }).observe($('#favv'), {childList: true});
  $('#favv').addEventListener('click', e => {
    const b = e.target.closest('.flnk'); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    if (SH.has(b.dataset.fl)) linkMenu(e, b.dataset.fl);
  }, true);
}

/* ---------- «Поделиться» в меню «⋮» / правой кнопки и в меню папки ---------- */
let target = null;
const pick = e => {
  target = null;
  const r = e.target.closest('#list [data-i]'); if (r && mode === 'files') { try { target = sorted()[+r.dataset.i]; } catch (_) {} }
  const t = e.target.closest('#pgrid .pt'); if (t && mode === 'photos' && typeof P !== 'undefined') { const it = P.items[+t.dataset.i]; if (it) target = {n: it.n, p: it.p, d: false}; }   // галерея: правая кнопка
  const f = e.target.closest('#favv .frow'); if (f && mode === 'fav' && !e.target.closest('.ck')) {   // «Избранное» (меню для нескольких выбранных — без «Поделиться»)
    const it = ($('#favv')._items || [])[+f.dataset.k];
    if (it && !(window.SELX && SELX.multi('fav', it))) target = {n: it.n, p: it.p, d: it.d};
  }
};
document.addEventListener('contextmenu', pick, true);
document.addEventListener('click', e => { if (e.target.closest('#list [data-i] .more, #favv .frow .more')) pick(e); else target = null; }, true);
{
  const m = $('#menu'); let busy = false;
  new MutationObserver(() => {
    if (busy || m.hidden || !target || m.querySelector('[data-shr]') || !m.children.length) return;
    if (mode === 'files' && sel.size > 1 && sel.has(target.n)) return;   // меню для нескольких выбранных — «Поделиться» только для одного объекта
    busy = true;
    const it = target, p = it.p ?? join(cwd, it.n), on = SH.has(p);
    const d = document.createElement('div'); d.dataset.shr = '1';
    d.innerHTML = ico('link') + `<span>${on ? 'Поделиться (доступ открыт)' : 'Поделиться'}</span>`;
    d.onclick = ev => { ev.stopPropagation(); m.hidden = true; shareDialog(p, it.n, it.d); };
    const fav = m.querySelector('[data-fav]:not(hr)');
    const last = [...m.querySelectorAll('[data-fav]')].pop();
    if (fav && last) last.after(d); else { const hr = document.createElement('hr'); hr.dataset.shr = '1'; m.append(hr); m.append(d); }
    // меню выросло после позиционирования — не даём ему уйти за нижний край окна
    const top = parseFloat(m.style.top) || 0;
    if (top + m.offsetHeight > innerHeight - 8) m.style.top = Math.max(8, innerHeight - m.offsetHeight - 8) + 'px';
    busy = false;
  }).observe(m, {childList: true});
}
{
  const baseFA = folderActions;
  folderActions = function (p) {
    const acts = baseFA(p);
    if (!p) return acts;
    const i = acts.indexOf('-'), it = [SH.has(p) ? 'Поделиться (доступ открыт)' : 'Поделиться', () => shareDialog(p, base(p), true), 'link'];
    if (i >= 0) acts.splice(i, 0, it); else acts.unshift(it, '-');
    return acts;
  };
}

/* ---------- раздел «Общий доступ» (#shares) ---------- */
const panel = document.createElement('section'); panel.id = 'sharev'; panel.hidden = true;
($('#favv') || $('#histv') || $('#list')).after(panel);
const nav = document.createElement('a');
nav.id = 'navShare'; nav.className = 'navitem'; nav.href = '#shares'; nav.innerHTML = ico('link') + '<span>Общий доступ</span>';
($('#navFav') || $('#ftree') || $('#navFiles')).after(nav);

async function shShow() {
  panel.hidden = false; fab.hidden = true;
  qa('#side .navitem').forEach(n => n.classList.toggle('active', n === nav));
  panel._all = await shLoad();
  shDraw();
}
function shDraw() {
  if (mode !== 'shares') return;
  const all = panel._all || [], f = filter.toLowerCase(), dir = sortOrder === 'desc' ? -1 : 1;
  const cmp = {name: (x, y) => dir * x.n.localeCompare(y.n, 'ru', {numeric: true}), date: (x, y) => dir * ((x.ts || 0) - (y.ts || 0)), size: (x, y) => dir * ((x.s || 0) - (y.s || 0))}[sort] || (() => 0);
  const items = all.filter(i => !f || i.n.toLowerCase().includes(f)).sort((x, y) => (y.d - x.d) || cmp(x, y));
  const grid = view === 'grid';
  panel.className = grid ? 'grid' : '';
  $('#viewBtn').innerHTML = ico(grid ? 'list' : 'grid');
  const ra = $('#btnShAll'); if (ra) ra.style.display = all.length ? '' : 'none';
  const cls = i => i.once ? 'once' : 'perm';
  const lnk = (i, k) => `<button class="lnk ${cls(i)}" data-l="${k}" title="${kindTxt(i.once)} ссылка — нажмите, чтобы отозвать доступ">${ico('link')}${ico('unlink')}</button>`;
  panel.innerHTML = !all.length ? '<div class="tinfo">Здесь появятся файлы и папки, к которым открыт доступ по ссылке</div>'
    : !items.length ? '<div class="tinfo">Ничего не найдено</div>'
    : items.map((i, k) =>
    `<div class="row srow" data-k="${k}">${rowIcon(i, i.p, grid ? lnk(i, k) : '')}` +
    `<div class="nm">${esc(i.n)}<small>${esc(['Файлы', ...(dirOf(i.p) ? dirOf(i.p).split('/') : [])].join(' › '))} · <b class="${cls(i)}">${kindTxt(i.once)}</b>` +
    (!i.once && i.hits ? ` · скачиваний: ${i.hits}` : '') + `</small></div>` +
    `<div class="dt" title="Доступ открыт">${i.ts ? fmtDate(i.ts) : ''}</div><div class="sz">${i.d ? '' : fmtSize(i.s)}</div>` +
    `<span class="fact">${grid ? '' : lnk(i, k)}<button data-c="${k}" title="Скопировать ссылку">${ico('copy')}</button></span>` +
    `<button class="icon more" title="Действия">${ico('kebab')}</button></div>`).join('');
  panel._items = items;
}
function shHide() {
  if (panel.hidden) return;
  panel.hidden = true; nav.classList.remove('active');
  for (const [m, id] of [['files', 'navFiles'], ['photos', 'navPhotos'], ['trash', 'navTrash'], ['history', 'navHistory']]) { const n = $('#' + id); if (n) n.classList.toggle('active', m === mode); }
  updateFab();
}
$('#filter').addEventListener('input', () => { if (mode === 'shares') shDraw(); });
$('#viewBtn').addEventListener('click', () => { if (mode === 'shares') shDraw(); });
{
  const baseSelectSort = selectSort;
  selectSort = function (k) { baseSelectSort(k); if (mode === 'shares') shDraw(); };
}
nav.addEventListener('click', e => {
  e.preventDefault(); e.stopPropagation();
  if (location.hash === '#shares') shShow(); else location.hash = '#shares';
});
{
  const baseLoad = load;
  load = async function () {
    if (location.hash !== '#shares') { shHide(); return baseLoad(); }
    mode = 'shares'; sel = new Set();
    document.body.className = 'mode-shares';
    ['#list', '#photos', '#trashv', '#histv', '#favv', '#empty', '#cal', '#ptop', '#pbub'].forEach(x => { const n = $(x); if (n) n.hidden = true; });
    const nf = $('#navFav'); if (nf) nf.classList.remove('active');
    $('#topx').innerHTML = `<button class="btn danger sm" id="btnShAll" style="display:none">${ico('unlink')}Отозвать всё</button>`;
    $('#crumbs').innerHTML = '<a>Общий доступ</a>';
    document.title = 'Общий доступ — Диск';
    panel.hidden = false; qa('#side .navitem').forEach(n => n.classList.toggle('active', n === nav));
    updateFab(); treeRender();
    await shShow();
  };
}
$('#side').addEventListener('click', e => { if (e.target.closest('a, .navitem') && !e.target.closest('#navShare')) shHide(); }, true);
addEventListener('hashchange', () => { if (location.hash !== '#shares') shHide(); });
$('#topx').addEventListener('click', async e => {
  if (!e.target.closest('#btnShAll')) return;
  const n = (panel._all || []).length; if (!n) return;
  if (!await uiConfirm('Отозвать всё', `Все ссылки (${n}) перестанут работать. Отменить это действие нельзя.`, 'Отозвать всё', true)) return;
  await api('share_del', {all: true});
  SH.clear(); refreshAll(); toast('Доступ ко всем объектам отозван');
});
panel.addEventListener('click', async e => {
  const items = panel._items || [], g = a => e.target.closest(`[${a}]`);
  let x;
  if ((x = g('data-l'))) { e.stopPropagation(); revoke(items[+x.dataset.l].p); return; }
  if ((x = g('data-c'))) { e.stopPropagation(); copyLink(items[+x.dataset.c].t); return; }
  const row = e.target.closest('.srow'); if (!row) return;
  const it = items[+row.dataset.k];
  if (e.target.closest('.more')) { e.stopPropagation(); shMenu(e, it); return; }
  shOpen(it);
});
panel.addEventListener('contextmenu', e => {
  const row = e.target.closest('.srow'); if (!row || e.target.closest('.ck')) return;
  const it = (panel._items || [])[+row.dataset.k]; if (it) shMenu(e, it);
});
function shOpen(it) {
  if (it.d) { shHide(); location.hash = hashFor(it.p); return; }
  vlist.length = 0; vlist.push({n: it.n, p: it.p, s: it.s}); vi = 0;
  $('#viewer').classList.add('overshare'); $('#viewer').hidden = false; showV();
}
// меню «⋮» / правой кнопки в «Общем доступе»: для выбранных, если объект среди них, иначе — для этого объекта
function shMenu(e, it) {
  const its = window.SELX ? SELX.targets('shares', it) : [it], n = its.length;
  if (n > 1) return popMenu(e, [
    [`Скачать (${n})`, () => SELX.dl(its), 'download'],
    [`Скопировать ссылки (${n})`, () => SHX.copy(its), 'copy'],
    '-',
    [`Отозвать доступ (${n})`, async () => { if (await SHX.revoke(its)) SELX.clear('shares'); }, 'unlink'],
  ]);
  popMenu(e, [
    [it.d ? 'Открыть папку' : 'Открыть', () => shOpen(it), 'eye'],
    ['Показать в папке', () => { shHide(); location.hash = hashFor(dirOf(it.p)); }, 'folder'],
    it.d ? ['Скачать папку (ZIP)', () => zipDownload(it.p), 'zip'] : ['Скачать', () => dlFile(fileUrl(it.p, true)), 'download'],
    '-',
    ['Скопировать ссылку', () => copyLink(it.t), 'copy'],
    ['Отозвать доступ', () => revoke(it.p), 'unlink'],
  ]);   // «В избранное» добавит общий обработчик меню (viewer.js)
}
new MutationObserver(() => {
  const v = $('#viewer');
  if (v.hidden && v.classList.contains('overshare')) { v.classList.remove('overshare'); if (!panel.hidden) shShow(); }
}).observe($('#viewer'), {attributes: true, attributeFilter: ['hidden']});

/* ---------- обвязка ---------- */
{
  const baseUF = updateFab;
  updateFab = function () { baseUF(); if (!panel.hidden) fab.hidden = true; };
  const baseRender = render;
  render = function () { baseRender(); markShares(); };
  // после переименования/перемещения/удаления пути ссылок меняются на сервере — перечитать
  const baseApi = api;
  api = async function (a, ...rest) {
    const j = await baseApi(a, ...rest);
    if (MUT.has(a)) shLoad().then(() => { markShares(); markFavShares(); });
    return j;
  };
}

/* ---------- История ---------- */
Object.assign(HV, {share: ['открыли доступ к', 'открыл доступ к'], unshare: ['закрыли доступ к', 'закрыл доступ к']});
Object.assign(HACT, {share: 'Открытие доступа', unshare: 'Закрытие доступа', share_dl: 'Скачивания по ссылке'});
{
  const baseHT = hText;
  hText = function (g) {
    if (!['share', 'unshare', 'share_dl'].includes(g.act)) return baseHT(g);
    const ev = g.ev, n = ev.length, you = g.u === ME, who = you ? 'Вы' : esc(g.u || 'Кто-то');
    const lk = e => e.p ? `<a href="${hashFor(dirOf(e.p))}">${esc(e.nm)}</a>` : esc(e.nm);
    if (g.act === 'share_dl') {
      if (n === 1) { const e = ev[0]; return `По ссылке скачали ${e.k === 'd' ? 'папку' : 'файл'} «${lk(e)}»${e.k === 'd' ? ' (ZIP)' : ''}`; }
      return `По ссылке скачали ${n} ${plural(n, 'объект', 'объекта', 'объектов')}`;
    }
    const verb = HV[g.act][you ? 0 : 1];
    if (n === 1 && !ev[0].nm && ev[0].n > 1) return `${who} ${you ? 'отозвали' : 'отозвал'} доступ по всем ссылкам (${ev[0].n})`;
    if (n === 1) { const e = ev[0]; return `${who} ${verb} ${e.k === 'd' ? 'папке' : 'файлу'} «${lk(e)}»`; }
    return `${who} ${verb} ${n} ${plural(n, 'объекту', 'объектам', 'объектам')}`;
  };
}

/* ---------- для выбора нескольких объектов в разделе «Общий доступ» (select.js) ---------- */
window.SHX = {
  async copy(its) {
    const txt = its.map(i => shUrl(i.t)).join('\n');
    if (await copyText(txt)) toast(its.length > 1 ? `Скопировано ссылок: ${its.length}` : 'Ссылка скопирована');
    else uiAlert('Не удалось скопировать автоматически. Ссылки:\n' + txt, 'Ссылки');
  },
  async revoke(its) {
    const n = its.length; if (!n) return false;
    const msg = n === 1 ? `Ссылка на «${its[0].n}» перестанет работать.` : `Ссылки (${n}) перестанут работать.`;
    if (!await uiConfirm('Отозвать доступ', msg, 'Отозвать', true)) return false;
    await api('share_del', {tokens: its.map(i => i.t)});
    its.forEach(i => SH.delete(i.p)); refreshAll(); toast(n === 1 ? 'Доступ отозван' : `Доступ отозван: ${n}`);
    return true;
  },
};

updateFab();
shLoad().then(() => { markShares(); markFavShares(); });
})();

document.head.append(Object.assign(document.createElement('style'), {textContent: `
/* ---- модальные окна ---- */
.ovl { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,.62); display: flex; align-items: center; justify-content: center; padding: 16px; animation: ovin .12s ease-out; }
@keyframes ovin { from { opacity: 0; } to { opacity: 1; } }
.dlg2 { position: relative; width: min(540px, 100%); max-height: calc(100vh - 32px); display: flex; flex-direction: column; background: #26262b; border: 1px solid #33333a; border-radius: 20px; padding: 28px 24px 24px; box-shadow: 0 20px 60px #000a; color: #f2f2f5; }
.dlg2 h3 { margin: 0 44px 20px 8px; font-size: 26px; font-weight: 600; line-height: 1.25; word-break: break-word; }
.dlg2 .dx { position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 50%; background: transparent; border: 0; color: #cfcfd8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dlg2 .dx:hover { background: #ffffff14; }
.dtext { margin: -6px 8px 20px; color: #b4b4bf; font-size: 15px; line-height: 1.45; white-space: pre-line; word-break: break-word; }
.dinp { margin: 0 4px 20px; height: 48px; border-radius: 12px; border: 2px solid #3a3a42; background: #1d1d21; color: #fff; font-size: 16px; padding: 0 14px; outline: none; font-family: inherit; }
.dinp:focus { border-color: #2f6bff; }
.dbtns { display: flex; gap: 12px; margin-top: 4px; padding: 0 4px; flex-wrap: wrap; }
.dbtn { height: 50px; padding: 0 26px; border-radius: 12px; border: 0; background: #3a3a40; color: #f2f2f5; font-size: 16px; cursor: pointer; font-family: inherit; }
.dbtn:hover { background: #46464d; }
.dbtn.primary { background: #1f5fd6; color: #fff; } .dbtn.primary:hover { background: #2a6cea; }
.dbtn.danger { background: #d23d3d; color: #fff; } .dbtn.danger:hover { background: #e24b4b; }
.dbtn:disabled, .dbtn:disabled:hover { opacity: .45; cursor: default; background: #1f5fd6; }
.tree { overflow: auto; max-height: min(360px, 50vh); margin: 0 0 20px; scrollbar-width: thin; }
.prow { display: flex; align-items: center; gap: 10px; height: 54px; padding-right: 12px; border-radius: 12px; cursor: pointer; flex: none; }
.prow:hover { background: #2e2e34; } .prow.on { background: #404046; }
.tch { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; flex: none; color: #cfcfd8; border-radius: 6px; }
.tch .ic-svg { width: 18px; height: 18px; transition: transform .12s; } .tch.open .ic-svg { transform: rotate(90deg); }
.pfi { width: 28px; height: 28px; display: inline-flex; flex: none; } .pfi svg { width: 100%; height: 100%; } .pfi .ic-svg { width: 26px; height: 26px; }
.pn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 17px; }
/* ---- дерево папок в левом меню ---- */
#side nav { overflow-y: auto; min-height: 0; }
#ftree { display: flex; flex-direction: column; margin: 2px 0 6px; }
#ftree[hidden] { display: none; }
.trw { display: flex; align-items: center; gap: 8px; height: 38px; padding-right: 10px; border-radius: 10px; color: #e6e6ea; text-decoration: none; font-size: 15px; flex: none; }
.trw:hover { background: #ffffff10; } .trw.on { background: #3a3a40; }
.trw .tch { width: 20px; height: 20px; } .trw .tch .ic-svg { width: 15px; height: 15px; }
.trw .pfi { width: 22px; height: 22px; }
.trw .tn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#navFiles .tch { margin-left: auto; }
`}));

const $ = s => document.querySelector(s);
const CSRF = $('meta[name=csrf]').content;
const ME = $('meta[name=user]').content;
$('#uname').textContent = ME;
const NATIVE = new Set(['jpg','jpeg','png','gif','webp','avif']);
const IMG = new Set([...NATIVE,'bmp','heic','heif','tif','tiff']);
const VID = new Set(['mp4','m4v','mov','webm','mkv','avi']);
const AUD = new Set(['mp3','m4a','flac','ogg','wav','opus']);
const TXT = new Set(['txt','log','md','csv','json']);
let cwd = '', items = [], L = [], view = localStorage.view || 'list', sort = localStorage.sort || 'name', filter = '';
let vlist = [], vi = 0, mode = 'files', sel = new Set();
let lastPath = sessionStorage.getItem('lastPath') || '';
let TREE = {}, treeTok = 0;
const TOPEN = new Set(JSON.parse(localStorage.ftOpen || '[""]'));
const MUT = new Set(['mkdir','rename','delete','move','copy','restore','purge','empty']);

const ext = n => (n.includes('.') ? n.split('.').pop() : '').toLowerCase();
const enc = encodeURIComponent;
const join = (a, b) => a ? a + '/' + b : b;
const dirOf = p => p && p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
const base = p => p ? p.slice(p.lastIndexOf('/') + 1) : '';
const hashFor = p => '#/' + enc(p).replace(/%2F/g, '/');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtSize = b => { if (!b) return '—'; const u = ['Б','КБ','МБ','ГБ','ТБ']; let i = 0; while (b >= 1024 && i < 4) { b /= 1024; i++; } return b.toFixed(i && b < 10 ? 1 : 0) + ' ' + u[i]; };
const fmtDate = t => new Date(t * 1000).toLocaleString('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fileUrl = (p, dl) => `file.php?p=${enc(p)}${dl ? '&dl=1' : ''}`;
const thumbUrl = (it, p, w) => `thumb.php?p=${enc(p)}&w=${w}&v=${it.m || 0}`;
const kindOf = n => { const e = ext(n); return IMG.has(e) ? 'image' : VID.has(e) ? 'video' : AUD.has(e) ? 'audio' : e === 'pdf' ? 'pdf' : 'doc'; };
const sortNames = a => a.sort((x, y) => x.localeCompare(y, 'ru', {numeric: true}));
const hasOvl = () => !!document.querySelector('.ovl');

function objTitle(verb, ts) {
  const n = ts.length, d = ts.filter(t => t.d).length, one = n % 10 === 1 && n % 100 !== 11;
  const w = d === n ? (one ? 'папки' : 'папок') : d === 0 ? (one ? 'файла' : 'файлов') : (one ? 'объекта' : 'объектов');
  return `${verb} ${n} ${w}`;
}

/* ---------- модальные окна в одном стиле ---------- */
function mkOvl(inner, onCancel) {
  const o = document.createElement('div'); o.className = 'ovl';
  o.innerHTML = `<div class="dlg2" role="dialog">${inner}</div>`;
  const key = e => {
    if (e.key === 'Escape' && [...document.querySelectorAll('.ovl')].pop() === o) { e.stopImmediatePropagation(); e.preventDefault(); onCancel(); }
  };
  document.addEventListener('keydown', key, true);
  o.addEventListener('mousedown', e => { if (e.target === o) onCancel(); });
  o.close = () => { document.removeEventListener('keydown', key, true); o.remove(); };
  document.body.append(o);
  return o;
}
function uiDialog(o) {
  return new Promise(resolve => {
    let ov;
    const done = v => { ov.close(); resolve(v); };
    const inputHtml = o.input != null ? `<input class="dinp" type="text" value="${esc(o.input)}" placeholder="${esc(o.placeholder || '')}" spellcheck="false">` : '';
    ov = mkOvl(`<button class="dx" data-x="c">${ico('close')}</button><h3>${esc(o.title)}</h3>` +
      (o.text ? `<p class="dtext">${esc(o.text)}</p>` : '') + inputHtml +
      `<div class="dbtns"><button class="dbtn ${o.danger ? 'danger' : 'primary'}" data-x="ok">${esc(o.ok || 'ОК')}</button>` +
      (o.single ? '' : `<button class="dbtn" data-x="c">${esc(o.cancel || 'Отмена')}</button>`) + `</div>`, () => done(null));
    const inp = ov.querySelector('.dinp');
    const submit = () => { if (inp) { const v = inp.value.trim(); if (!v) { inp.focus(); return; } done(v); } else done(true); };
    ov.addEventListener('click', e => { const x = e.target.closest('[data-x]'); if (!x) return; x.dataset.x === 'ok' ? submit() : done(null); });
    if (inp) {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      inp.focus();
      const dot = o.input.lastIndexOf('.');
      inp.setSelectionRange(0, o.selectName && dot > 0 ? dot : o.input.length);
    } else ov.querySelector('[data-x=ok]').focus();
  });
}
const uiConfirm = (title, text, ok, danger) => uiDialog({title, text, ok, danger}).then(v => v === true);
const uiPrompt = (title, value, ok, extra = {}) => uiDialog({title, input: value, ok, ...extra});
const uiAlert = (text, title = 'Ошибка') => uiDialog({title, text, ok: 'Понятно', single: true});

async function api(a, body, q, silent) {
  let url = 'api.php?a=' + a; if (q) url += '&' + new URLSearchParams(q);
  const r = await fetch(url, body ? {method:'POST', headers:{'Content-Type':'application/json','X-CSRF':CSRF}, body:JSON.stringify(body)} : {});
  if (r.status === 401) { location = 'login.php'; throw 0; }
  let j; try { j = await r.json(); } catch (e) { if (!silent) uiAlert('Ошибка сервера (см. error.log)'); throw e; }
  if (!r.ok) { if (!silent) uiAlert(j.error || 'Ошибка'); throw j; }
  if (MUT.has(a)) treeClear();
  return j;
}

/* ---------- дерево папок в левом меню ---------- */
$('#navFiles').insertAdjacentHTML('beforeend', `<span class="tch" data-t="">${ico('chevR')}</span>`);
$('#navFiles').insertAdjacentHTML('afterend', '<div id="ftree"></div>');
{ const t = [...$('#navPhotos').childNodes].find(n => n.nodeType === 3); if (t) t.textContent = 'Галерея'; }

async function treeKids(p) {
  if (!TREE[p]) {
    try { const j = await api('list', null, {p}, true); TREE[p] = sortNames(j.items.filter(i => i.d).map(i => i.n)); }
    catch (e) { TREE[p] = []; }
  }
  return TREE[p];
}
async function treeRender() {
  const tok = ++treeTok, rows = [];
  const walk = async (p, depth) => {
    for (const n of await treeKids(p)) {
      if (tok !== treeTok) throw 0;
      const cp = join(p, n); rows.push([cp, n, depth]);
      if (TOPEN.has(cp)) await walk(cp, depth + 1);
    }
  };
  try { if (TOPEN.has('')) await walk('', 0); } catch (e) { return; }
  if (tok !== treeTok) return;
  $('#navFiles .tch').classList.toggle('open', TOPEN.has(''));
  const box = $('#ftree'); box.hidden = !TOPEN.has('');
  box.innerHTML = rows.map(([cp, n, d]) => {
    const has = TREE[cp] === undefined || TREE[cp].length;
    return `<a class="trw${mode === 'files' && cwd === cp ? ' on' : ''}" href="${hashFor(cp)}" title="${esc(n)}" style="padding-left:${10 + d * 18}px">` +
      `<span class="tch${TOPEN.has(cp) ? ' open' : ''}" data-t="${esc(cp)}">${has ? ico('chevR') : ''}</span><span class="pfi">${FOLDER}</span><span class="tn">${esc(n)}</span></a>`;
  }).join('');
}
function treeClear() { TREE = {}; treeRender(); }
function treeToggle(p) {
  TOPEN.has(p) ? TOPEN.delete(p) : TOPEN.add(p);
  localStorage.ftOpen = JSON.stringify([...TOPEN]); treeRender();
}
let treeLast = null;
function treeReveal(path) {
  // переход выше по пути (хлебные крошки, «Вверх», дерево) — свернуть папки ниже новой текущей
  if (treeLast !== null && treeLast !== path && (path === '' || treeLast.startsWith(path + '/')))
    for (const p of [...TOPEN]) if (p && (path === '' || p.startsWith(path + '/'))) TOPEN.delete(p);
  treeLast = path;
  let acc = ''; TOPEN.add('');
  for (const s of path ? path.split('/') : []) { TOPEN.add(acc); acc = join(acc, s); }
  localStorage.ftOpen = JSON.stringify([...TOPEN]);
}
$('#ftree').addEventListener('click', e => {
  const t = e.target.closest('.tch'); if (!t) return;
  e.preventDefault(); e.stopPropagation(); treeToggle(t.dataset.t);
});

async function load() {
  const h = location.hash;
  mode = h === '#photos' ? 'photos' : h === '#trash' ? 'trash' : h === '#history' ? 'history' : 'files';
  document.body.className = 'mode-' + mode + (mode === 'photos' ? ' photomode' : '');
  for (const [m, id] of [['files','navFiles'],['photos','navPhotos'],['trash','navTrash'],['history','navHistory']]) $('#' + id).classList.toggle('active', m === mode);
  ['#list','#photos','#trashv','#histv','#empty','#cal','#ptop','#pbub'].forEach(s => $(s).hidden = true);
  $('#topx').innerHTML = '';
  if (mode !== 'files') {
    treeRender();
    if (mode === 'photos') { showPhotos(); $('#crumbs').innerHTML = '<a>Галерея</a>'; document.title = 'Галерея — Диск'; return; }
    return mode === 'trash' ? showTrash() : showHistory();
  }
  $('#list').hidden = false;
  cwd = decodeURIComponent(h.replace(/^#\/?/, ''));
  sel = new Set();
  try {
    const j = await api('list', null, {p: cwd}, true);
    cwd = j.path; items = j.items;
    lastPath = cwd; sessionStorage.setItem('lastPath', cwd);
    TREE[cwd] = sortNames(items.filter(i => i.d).map(i => i.n));
    treeReveal(cwd); treeRender();
  } catch (e) {
    if (cwd) { lastPath = ''; sessionStorage.removeItem('lastPath'); location.hash = '#/'; return; }
    items = [];
  }
  render();
}
const refresh = () => mode === 'photos' ? pRefresh() : load();
const redraw = () => { if (mode === 'files') render(); else if (mode === 'trash') drawTrash(); };

function sorted() {
  const f = filter.toLowerCase();
  const a = items.filter(i => !f || i.n.toLowerCase().includes(f));
  const cmp = {name:(x,y)=>x.n.localeCompare(y.n,'ru',{numeric:true}), date:(x,y)=>y.m-x.m, size:(x,y)=>y.s-x.s}[sort];
  return a.sort((x, y) => (y.d - x.d) || cmp(x, y));
}
// иконка строки/плитки: превью фото (создаётся при необходимости) и видео (только если уже есть в кэше), иначе значок типа.
// extra — дополнительная разметка внутри .ic (звёздочка, ссылка); src — свой адрес превью (корзина).
/* превью без «мигания» при перерисовке (смена вида, сортировка, поиск):
   превью, которого нет (404), запоминается до обновления страницы и сразу рисуется значком,
   а уже загруженные картинки переносятся в новую разметку вместо повторной загрузки */
const THUMB_BAD = new Set();
function thumbFail(img, k) { THUMB_BAD.add(img.getAttribute('src')); img.outerHTML = fileSvg(k); }
function setHTML(el, html) {
  const old = new Map();
  el.querySelectorAll('.ic > img').forEach(i => { if (i.complete && i.naturalWidth) old.set(i.getAttribute('src'), i); });
  el.innerHTML = html;
  if (old.size) el.querySelectorAll('.ic > img').forEach(i => { const o = old.get(i.getAttribute('src')); if (o) { old.delete(i.getAttribute('src')); i.replaceWith(o); } });
}
function rowIcon(it, p, extra = '', src = '') {
  if (it.d) return `<div class="ic"${it.l ? ' title="Папка-ссылка"' : ''}>${it.l ? FOLDER_LNK : FOLDER}${extra}</div>`;
  const k = kindOf(it.n);
  const u = src || (k === 'image' ? thumbUrl(it, p, 320) : k === 'video' ? thumbUrl(it, p, 320) + '&c=1' : '');
  if (u && THUMB_BAD.has(u)) return `<div class="ic${k === 'video' ? ' vid' : ''}">${fileSvg(k)}${k === 'video' ? `<span class="pv">${ico('play')}</span>` : ''}${extra}</div>`;
  if (k === 'image') return `<div class="ic"><img loading="lazy" src="${src || thumbUrl(it, p, 320)}" alt="" onerror="thumbFail(this,'image')">${extra}</div>`;
  if (k === 'video') return `<div class="ic vid"><img loading="lazy" src="${src || thumbUrl(it, p, 320) + '&c=1'}" alt="" onerror="thumbFail(this,'video')"><span class="pv">${ico('play')}</span>${extra}</div>`;
  return `<div class="ic">${fileSvg(k)}${extra}</div>`;
}
function render() {
  if (mode !== 'files') return;
  const parts = cwd ? cwd.split('/') : [];
  let acc = '', h = `<a href="#/">Файлы</a>`;
  parts.forEach(s => { acc = join(acc, s); h += `<span>›</span><a href="${hashFor(acc)}">${esc(s)}</a>`; });
  $('#crumbs').innerHTML = h;
  $('#sort').value = sort; $('#viewBtn').innerHTML = ico(view === 'grid' ? 'list' : 'grid');
  L = sorted();
  const el = $('#list'); el.className = view === 'grid' ? 'grid' : '';
  setHTML(el, L.map((it, i) => {
    const p = join(cwd, it.n);
    return `<div class="row${sel.has(it.n) ? ' sel' : ''}" data-i="${i}">${rowIcon(it, p)}<div class="nm">${esc(it.n)}</div>` +
      `<div class="dt">${fmtDate(it.m)}</div><div class="sz">${it.d ? '' : fmtSize(it.s)}</div><button class="icon more">${ico('kebab')}</button></div>`;
  }).join(''));
  $('#empty').hidden = L.length > 0;
  document.title = (cwd.split('/').pop() || 'Файлы') + ' — Диск';
}
const markSel = () => document.querySelectorAll('#list .row').forEach(r => r.classList.toggle('sel', sel.has(L[+r.dataset.i].n)));
const targetsOf = () => L.filter(i => sel.has(i.n)).map(it => ({p: join(cwd, it.n), n: it.n, d: it.d, it}));
const menuTargets = it => sel.has(it.n) ? targetsOf() : [{p: join(cwd, it.n), n: it.n, d: it.d, it}];

$('#list').addEventListener('click', e => {
  const row = e.target.closest('.row'); if (!row) return;
  const it = L[+row.dataset.i];
  // «⋮» не меняет выбор: меню для всех выбранных, если объект среди них, иначе только для этого объекта
  if (e.target.closest('.more')) return popMenu(e, menuFor(menuTargets(it)));
  if (e.ctrlKey || e.metaKey) { sel.has(it.n) ? sel.delete(it.n) : sel.add(it.n); return markSel(); }
  if (sel.size) { sel = new Set(); markSel(); }
  openIt(it);
});
$('#list').addEventListener('contextmenu', e => {
  const row = e.target.closest('.row'); if (!row) return;
  const it = L[+row.dataset.i];
  popMenu(e, menuFor(menuTargets(it)));
});

function openIt(it) {
  if (it.d) { location.hash = hashFor(join(cwd, it.n)); return; }
  const e = ext(it.n);
  if (IMG.has(e) || VID.has(e) || AUD.has(e) || TXT.has(e) || e === 'pdf') return openViewer(it);
  location = fileUrl(join(cwd, it.n), true);
}

/* ---------- контекстное меню: пункт = [текст, действие, иконка] ---------- */
function popMenu(e, acts) {
  if (e.preventDefault) e.preventDefault();
  const m = $('#menu'); m.innerHTML = '';
  acts.forEach(a => {
    if (a === '-') { m.append(document.createElement('hr')); return; }
    const d = document.createElement('div'); d.innerHTML = (a[2] ? ico(a[2]) : '') + `<span>${esc(a[0])}</span>`;
    d.onclick = ev => { ev.stopPropagation(); m.hidden = true; a[1](); };
    m.append(d);
  });
  m.hidden = false;
  const ctx = e.type === 'contextmenu', r = (e.target.closest('button') || e.target).getBoundingClientRect();
  const x = ctx ? e.clientX : r.left, y = ctx ? e.clientY : r.bottom;
  m.style.left = Math.max(8, Math.min(x, innerWidth - m.offsetWidth - 8)) + 'px';
  m.style.top = Math.max(8, Math.min(y, innerHeight - m.offsetHeight - 8)) + 'px';
  e.stopPropagation();
}
document.addEventListener('click', () => $('#menu').hidden = true);
document.addEventListener('contextmenu', () => $('#menu').hidden = true);
addEventListener('scroll', () => $('#menu').hidden = true, true);

function menuFor(ts, o = {}) {
  const one = ts.length === 1, t = ts[0], acts = [];
  const opn = o.open || (x => openIt(x.it));
  if (one) acts.push(t.d ? ['Открыть', () => opn(t), 'folder'] : ['Просмотреть', () => opn(t), 'eye']);
  (o.before || []).forEach(a => acts.push(a));
  if (one && !t.d) acts.push(['Скачать', () => location = fileUrl(t.p, true), 'download']);
  acts.push('-');
  if (one && !o.noRename) acts.push(['Переименовать', () => doRename(t), 'rename']);
  acts.push(['Переместить', () => doMove(ts, false), 'move'], ['Копировать', () => doMove(ts, true), 'copy'], '-', ['Удалить', () => doDelete(ts), 'trash']);
  return acts;
}
async function doRename(t) {
  const n = await uiPrompt('Переименование', t.n, 'Переименовать', {selectName: !t.d});
  if (n && n !== t.n) { await api('rename', {p: t.p, name: n}); refresh(); }
}
async function doDelete(ts) {
  const text = ts.length === 1 ? `Переместить «${ts[0].n}» в корзину?` : 'Выбранные объекты будут перемещены в корзину.';
  if (!await uiConfirm(objTitle('Удаление', ts), text, 'Удалить', true)) return;
  const j = await api('delete', {items: ts.map(t => t.p)});
  if (j.errors && j.errors.length) uiAlert(j.errors.join('\n'));
  if (mode === 'photos') pRemove(new Set(ts.map(t => t.p))); else load();
}
async function doMove(ts, copy) {
  const dest = await pickFolder(dirOf(ts[0].p), objTitle(copy ? 'Копирование' : 'Перемещение', ts), ts, copy ? 'Копировать' : 'Переместить', copy);
  if (dest === null) return;
  const j = await api(copy ? 'copy' : 'move', {items: ts.map(t => t.p), to: dest});
  if (j.errors && j.errors.length) uiAlert(j.errors.join('\n'));
  if (mode === 'photos' && !copy) pRemove(new Set(ts.map(t => t.p))); else if (mode !== 'photos') load();
}

/* ---------- выбор папки: дерево, как в Облаке ---------- */
function pickFolder(start, title, targets, okLabel = 'Переместить', sameOk = false) {
  return new Promise(resolve => {
    const skip = (targets || []).map(t => t.p);
    const skipped = p => skip.some(s => p === s || p.startsWith(s + '/'));
    let cur = start, first = true; const open = new Set(['']), cache = {};
    for (let acc = '', parts = start ? start.split('/') : []; parts.length;) { acc = join(acc, parts.shift()); if (parts.length) open.add(acc); }
    open.add(dirOf(start));
    const done = v => { ov.close(); resolve(v); };
    const ov = mkOvl(`<button class="dx" data-x="c">${ico('close')}</button><h3>${esc(title)}</h3><div class="tree"></div>` +
      `<div class="dbtns"><button class="dbtn primary" data-x="ok">${esc(okLabel)}</button><button class="dbtn" data-x="new">Создать папку</button></div>`, () => done(null));
    const tree = ov.querySelector('.tree'), okBtn = ov.querySelector('[data-x=ok]');
    const kids = async p => {
      if (!cache[p]) { try { const j = await api('list', null, {p}, true); cache[p] = sortNames(j.items.filter(i => i.d).map(i => i.n)); } catch (e) { cache[p] = []; } }
      return cache[p];
    };
    async function draw() {
      const rows = [];
      const walk = async (p, d) => {
        for (const n of await kids(p)) {
          const cp = join(p, n); if (skipped(cp)) continue;
          rows.push([cp, n, d]); if (open.has(cp)) await walk(cp, d + 1);
        }
      };
      if (open.has('')) await walk('', 1);
      const row = (cp, name, d, root) => {
        const has = root || cache[cp] === undefined || cache[cp].length;
        return `<div class="prow${cur === cp ? ' on' : ''}" data-p="${esc(cp)}" style="padding-left:${10 + d * 28}px">` +
          `<span class="tch${open.has(cp) ? ' open' : ''}" data-t="${esc(cp)}">${has ? ico('chevR') : ''}</span>` +
          `<span class="pfi">${root ? ico('folder') : FOLDER}</span><span class="pn">${esc(name)}</span></div>`;
      };
      tree.innerHTML = row('', 'Файлы', 0, true) + rows.map(r => row(r[0], r[1], r[2])).join('');
      okBtn.disabled = !sameOk && cur === start;
      if (first) { first = false; const on = tree.querySelector('.on'); if (on) on.scrollIntoView({block: 'nearest'}); }
    }
    ov.addEventListener('click', async e => {
      const x = e.target.closest('[data-x]');
      if (x) {
        if (x.dataset.x === 'c') return done(null);
        if (x.dataset.x === 'ok') { if (!okBtn.disabled) done(cur); return; }
        if (x.dataset.x === 'new') {
          const n = await uiPrompt('Новая папка', '', 'Создать', {placeholder: 'Название папки'});
          if (n) { try { await api('mkdir', {p: cur, name: n}); delete cache[cur]; open.add(cur); cur = join(cur, n); draw(); } catch (er) {} }
        }
        return;
      }
      const t = e.target.closest('.tch'), row = e.target.closest('.prow');
      if (t) { const p = t.dataset.t; open.has(p) ? open.delete(p) : open.add(p); draw(); }
      else if (row) { cur = row.dataset.p; draw(); }
    });
    draw();
  });
}

/* ---------- просмотрщик ---------- */
function openViewer(it, list) {
  vlist = list || L.filter(i => { const e = ext(i.n); return !i.d && (IMG.has(e) || VID.has(e) || AUD.has(e) || TXT.has(e) || e === 'pdf'); });
  vi = vlist.indexOf(it); if (vi < 0) vi = vlist.findIndex(i => i.n === it.n);
  showV(); $('#viewer').hidden = false;
}
async function showV() {
  const it = vlist[vi], p = it.p ?? join(cwd, it.n), e = ext(it.n), b = $('#vbody');
  $('#vname').textContent = it.n; $('#vdl').href = fileUrl(p, true);
  b.innerHTML = '';
  if (IMG.has(e)) { const i = new Image(); i.src = NATIVE.has(e) ? fileUrl(p) : thumbUrl(it, p, 1600); b.append(i); }
  else if (VID.has(e)) b.innerHTML = `<video src="${fileUrl(p)}" controls autoplay playsinline></video>`;
  else if (AUD.has(e)) b.innerHTML = `<audio src="${fileUrl(p)}" controls autoplay></audio>`;
  else if (e === 'pdf') b.innerHTML = `<iframe src="${fileUrl(p)}"></iframe>`;
  else { const pre = document.createElement('pre'); pre.textContent = await (await fetch(fileUrl(p))).text(); b.append(pre); }
}
const step = d => { if (vlist.length) { vi = (vi + d + vlist.length) % vlist.length; showV(); } };
const closeV = () => { $('#viewer').hidden = true; $('#vbody').innerHTML = ''; };
$('#vprev').onclick = () => step(-1); $('#vnext').onclick = () => step(1); $('#vclose').onclick = closeV;
let tx = 0;
$('#vbody').addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
$('#vbody').addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 70 && e.target.tagName !== 'VIDEO') step(d > 0 ? -1 : 1); });

document.addEventListener('keydown', e => {
  if (hasOvl()) return;
  if (!$('#viewer').hidden) { if (e.key === 'Escape') closeV(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); return; }
  if (mode !== 'files' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'Delete' && sel.size) doDelete(targetsOf());
  else if (e.key === 'F2' && sel.size === 1) doRename(targetsOf()[0]);
  else if (e.key === 'Escape') { sel = new Set(); markSel(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); L.forEach(i => sel.add(i.n)); markSel(); }
});

/* ---------- загрузка ---------- */
function uploadFiles(files) {
  const box = $('#uploads'); box.hidden = false;
  const dest = mode === 'files' ? cwd : ''; let chain = Promise.resolve();
  [...files].forEach(f => {
    const d = document.createElement('div'); d.className = 'up';
    d.innerHTML = `<div>${esc(f.name)}</div><div class="bar"><i></i></div>`; box.append(d);
    chain = chain.then(() => new Promise(res => {
      const x = new XMLHttpRequest(), fd = new FormData(); fd.append('f', f);
      x.open('POST', 'upload.php?p=' + enc(dest)); x.setRequestHeader('X-CSRF', CSRF);
      x.upload.onprogress = e => d.querySelector('i').style.width = (e.loaded / e.total * 100) + '%';
      x.onload = () => { d.querySelector('i').style.width = '100%'; if (x.status !== 200) d.firstChild.textContent += ' — ошибка'; res(); };
      x.onerror = () => { d.firstChild.textContent += ' — ошибка сети'; res(); };
      x.send(fd);
    }));
  });
  chain.then(() => { treeClear(); if (mode === 'files' && cwd === dest) load(); setTimeout(() => { box.hidden = true; box.innerHTML = ''; }, 3000); });
}
$('#btnUpload').onclick = () => $('#fileInput').click();
$('#fileInput').onchange = e => { uploadFiles(e.target.files); e.target.value = ''; };
$('#btnMkdir').onclick = async () => {
  const n = await uiPrompt('Новая папка', '', 'Создать', {placeholder: 'Название папки'});
  if (n) { await api('mkdir', {p: mode === 'files' ? cwd : '', name: n}); if (mode === 'files') load(); }
};
let dc = 0;
addEventListener('dragenter', e => { e.preventDefault(); dc++; $('#drop').hidden = false; });
addEventListener('dragleave', () => { if (--dc <= 0) { dc = 0; $('#drop').hidden = true; } });
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); dc = 0; $('#drop').hidden = true; if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); });

$('#filter').oninput = e => { filter = e.target.value; redraw(); };
$('#sort').onchange = e => { sort = localStorage.sort = e.target.value; redraw(); };
$('#viewBtn').onclick = () => { view = localStorage.view = view === 'grid' ? 'list' : 'grid'; redraw(); };
$('#burger').onclick = e => { $('#side').classList.toggle('open'); e.stopPropagation(); };
$('#main').addEventListener('click', () => $('#side').classList.remove('open'));
$('#side').addEventListener('click', e => { if (e.target.closest('a') && !e.target.closest('.tch')) $('#side').classList.remove('open'); });
// шеврон разворачивает дерево; из другого раздела «Файлы» возвращают в последнюю открытую папку
$('#navFiles').addEventListener('click', e => {
  if (e.target.closest('.tch')) { e.preventDefault(); e.stopPropagation(); return treeToggle(''); }
  if (mode !== 'files' && lastPath) { e.preventDefault(); location.hash = hashFor(lastPath); }
});
addEventListener('hashchange', () => { filter = ''; $('#filter').value = ''; load(); });
api('space').then(s => {
  const used = s.total - s.free; $('#spaceBar').style.width = (used / s.total * 100) + '%';
  $('#spaceTxt').textContent = `Занято ${fmtSize(used)} из ${fmtSize(s.total)}`;
}).catch(() => {});

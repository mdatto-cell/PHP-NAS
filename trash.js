document.head.append(Object.assign(document.createElement('style'), {textContent: `
body.mode-history #filter, body.mode-history #sort, body.mode-history #viewBtn { display: none; }
#trashv.grid { align-content: start; }
#trashv.grid .tinfo { grid-column: 1 / -1; }
`}));

const T = {items: [], L: [], sel: new Set()};
const H = {items: [], done: false, act: '', until: '', loading: false};

async function showTrash() {
  $('#trashv').hidden = false; $('#crumbs').innerHTML = '<a>Корзина</a>'; document.title = 'Корзина — Диск';
  $('#topx').innerHTML = `<button class="btn danger sm" id="btnEmpty">${ico('flame')}Очистить корзину</button>`;
  $('#btnEmpty').onclick = async () => {
    if (!T.items.length) return uiAlert('Корзина пуста', 'Очистка корзины');
    if (await uiConfirm('Очистка корзины', `Удалить навсегда все объекты (${T.items.length})? Это действие необратимо.`, 'Очистить', true)) { await api('empty', {}); showTrash(); }
  };
  const j = await api('trash'); T.items = j.items; T.sel = new Set(); drawTrash();
}
function drawTrash() {
  if (mode !== 'trash') return;
  const el = $('#trashv');
  $('#sort').value = sort; $('#viewBtn').innerHTML = ico(view === 'grid' ? 'list' : 'grid');
  el.className = view === 'grid' ? 'grid' : '';
  const f = filter.toLowerCase();
  const cmp = {name: (x, y) => x.name.localeCompare(y.name, 'ru', {numeric: true}), date: (x, y) => y.t - x.t, size: (x, y) => y.s - x.s}[sort];
  T.L = T.items.filter(i => !f || i.name.toLowerCase().includes(f)).sort((x, y) => sort === 'date' ? cmp(x, y) : ((y.d - x.d) || cmp(x, y)));
  if (!T.items.length) { el.innerHTML = '<div class="tinfo">Корзина пуста</div>'; return; }
  if (!T.L.length) { el.innerHTML = '<div class="tinfo">Ничего не найдено</div>'; return; }
  el.innerHTML = '<div class="tinfo">Объекты хранятся в корзине, пока вы не очистите её (или пока не истечёт срок trash_days, если он задан).</div>' +
    T.L.map((it, i) => `<div class="row trow${T.sel.has(it.id) ? ' sel' : ''}" data-i="${i}"><div class="ic">${it.d ? FOLDER : fileSvg(kindOf(it.name))}</div>` +
      `<div class="nm">${esc(it.name)}<small>${it.orig ? 'из: ' + esc(dirOf(it.orig) || 'Файлы') : 'исходное место неизвестно'}</small></div>` +
      `<div class="dt">${fmtDate(it.t)}</div><div class="sz">${it.d ? '' : fmtSize(it.s)}</div><button class="icon more">${ico('kebab')}</button></div>`).join('');
}
const tSelItems = () => T.items.filter(i => T.sel.has(i.id));
function tMenu(e) {
  const its = tSelItems(), ids = its.map(i => i.id), n = ids.length;
  popMenu(e, [
    ['Восстановить' + (n > 1 ? ` (${n})` : ''), async () => { await api('restore', {ids}); showTrash(); }, 'restore'],
    '-',
    ['Удалить навсегда' + (n > 1 ? ` (${n})` : ''), async () => {
      if (await uiConfirm(objTitle('Удаление', its), 'Объекты будут удалены навсегда. Это действие необратимо.', 'Удалить навсегда', true)) { await api('purge', {ids}); showTrash(); }
    }, 'flame'],
  ]);
}
$('#trashv').addEventListener('click', e => {
  const row = e.target.closest('.trow'); if (!row) return;
  const it = T.L[+row.dataset.i];
  if (e.target.closest('.more')) {
    T.sel = new Set([it.id]); drawTrash();
    const nb = document.querySelector(`#trashv .trow[data-i="${row.dataset.i}"] .more`);
    return tMenu({type: 'click', target: nb, stopPropagation: () => e.stopPropagation(), preventDefault: () => {}});
  }
  if (e.ctrlKey || e.metaKey) T.sel.has(it.id) ? T.sel.delete(it.id) : T.sel.add(it.id); else T.sel = new Set([it.id]);
  drawTrash();
});
$('#trashv').addEventListener('contextmenu', e => {
  const row = e.target.closest('.trow'); if (!row) return;
  const it = T.L[+row.dataset.i];
  if (!T.sel.has(it.id)) { T.sel = new Set([it.id]); drawTrash(); }
  tMenu(e);
});

/* ---------- История ---------- */
const HV = {
  upload: ['загрузили', 'загрузил'], mkdir: ['создали', 'создал'], rename: ['переименовали', 'переименовал'],
  move: ['переместили', 'переместил'], copy: ['скопировали', 'скопировал'], delete: ['удалили', 'удалил'],
  restore: ['восстановили', 'восстановил'], purge: ['удалили навсегда', 'удалил навсегда'], download: ['скачали', 'скачал'],
};
const HACT = {'': 'Все события', upload: 'Загрузки', download: 'Скачивания', mkdir: 'Создание папок', rename: 'Переименования', move: 'Перемещения', copy: 'Копирования', delete: 'Удаления', restore: 'Восстановления', purge: 'Удаления навсегда'};
const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return (m > 10 && m < 15) ? c : k === 1 ? a : (k > 1 && k < 5) ? b : c; };

async function showHistory() {
  $('#histv').hidden = false; $('#crumbs').innerHTML = '<a>История</a>'; document.title = 'История — Диск';
  $('#histv').innerHTML = `<div class="hctl">До <input type="date" id="hUntil" value="${H.until}"><select id="hAct">` +
    Object.entries(HACT).map(([k, v]) => `<option value="${k}"${k === H.act ? ' selected' : ''}>${v}</option>`).join('') +
    '</select></div><div id="hlist"></div><div id="hmoreBox"></div>';
  $('#hUntil').onchange = e => { H.until = e.target.value; hReload(); };
  $('#hAct').onchange = e => { H.act = e.target.value; hReload(); };
  hReload();
}
function hReload() { H.items = []; H.done = false; $('#hlist').innerHTML = ''; hMore(); }
async function hMore() {
  if (H.loading || H.done) return; H.loading = true;
  try {
    const q = {limit: 100};
    if (H.items.length) q.bid = H.items[H.items.length - 1].id;
    if (H.until) q.ut = Math.floor(new Date(H.until + 'T23:59:59').getTime() / 1000);
    if (H.act) q.act = H.act;
    const j = await api('history', null, q);
    H.items = H.items.concat(j.items);
    if (j.items.length < 100) H.done = true;
  } finally { H.loading = false; }
  hDraw();
}
function hGroups(list) {
  const out = [];
  for (const e of list) {
    const dir = dirOf((e.act === 'move' || e.act === 'copy' || e.act === 'restore') ? (e.p2 || '') : (e.p || ''));
    const g = out[out.length - 1];
    if (g && g.u === e.u && g.act === e.act && g.dir === dir && e.act !== 'rename' && Math.abs(g.last - e.ts) <= 300) { g.ev.push(e); g.last = e.ts; }
    else out.push({u: e.u, act: e.act, dir, ts: e.ts, last: e.ts, ev: [e], dev: e.dev, ip: e.ip});
  }
  return out;
}
function hText(g) {
  const ev = g.ev, n = ev.length, you = g.u === ME, who = you ? 'Вы' : esc(g.u || 'Кто-то'), verb = HV[g.act] ? HV[g.act][you ? 0 : 1] : g.act;
  const lk = (p, t) => `<a href="${hashFor(p)}">${esc(t)}</a>`;
  const cur = e => (e.act === 'move' || e.act === 'copy' || e.act === 'restore' || e.act === 'rename') ? (e.p2 || '') : (e.p || '');
  const folder = `«${lk(g.dir, base(g.dir) || 'Файлы')}»`;
  const nameLink = e => (g.act === 'delete' || g.act === 'purge') ? esc(e.nm) : lk(dirOf(cur(e)), e.nm);
  if (g.act === 'purge' && n === 1 && !ev[0].nm) return `${who} ${verb} объектов: ${ev[0].n} (очистка корзины)`;
  if (n === 1) {
    const e = ev[0], noun = e.k === 'd' ? 'папку' : 'файл';
    if (g.act === 'rename') return `${who} ${verb} «${esc(e.nm)}» в «${lk(dirOf(e.p2), base(e.p2))}»`;
    if (g.act === 'mkdir') return `${who} ${verb} папку «${nameLink(e)}» в папке ${folder}`;
    if (g.act === 'delete' || g.act === 'purge') return `${who} ${verb} ${noun} «${nameLink(e)}»` + (e.p ? ` из папки «${lk(dirOf(e.p), base(dirOf(e.p)) || 'Файлы')}»` : '');
    if (g.act === 'download') return `${who} ${verb} ${noun} «${nameLink(e)}»`;
    return `${who} ${verb} ${noun} «${nameLink(e)}» в папку ${folder}`;
  }
  const allD = ev.every(e => e.k === 'd'), allF = ev.every(e => e.k !== 'd');
  const noun = allD ? plural(n, 'папку', 'папки', 'папок') : allF ? plural(n, 'файл', 'файла', 'файлов') : plural(n, 'объект', 'объекта', 'объектов');
  const tail = (g.act === 'delete' || g.act === 'purge') ? ` из папки ${folder}` : g.act === 'download' ? '' : g.act === 'mkdir' ? ` в папке ${folder}` : ` в папку ${folder}`;
  return `${who} ${verb} ${n} ${noun}${tail}`;
}
function hDraw() {
  let html = '', day = '';
  for (const g of hGroups(H.items)) {
    const d = new Date(g.ts * 1000), dk = d.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric'});
    if (dk !== day) { day = dk; html += `<div class="hday">${esc(dk)}</div>`; }
    const cur = e => (e.act === 'move' || e.act === 'copy' || e.act === 'restore' || e.act === 'rename') ? (e.p2 || '') : (e.p || '');
    let extra = '';
    if (g.ev.length > 1) {
      extra = '<div class="hnames">' + g.ev.slice(0, 6).map(e => `<div>${esc(e.nm)}</div>`).join('') + (g.ev.length > 6 ? `<div>… и ещё ${g.ev.length - 6}</div>` : '') + '</div>';
    }
    const th = ['upload', 'copy', 'move', 'restore', 'rename'].includes(g.act)
      ? g.ev.filter(e => e.k !== 'd' && (IMG.has(ext(e.nm)) || VID.has(ext(e.nm)))).slice(0, 6) : [];
    const thumbs = th.length ? '<div class="hth">' + th.map(e => `<img loading="lazy" alt="" src="thumb.php?p=${enc(cur(e))}&w=320&v=0" onerror="this.remove()">`).join('') + '</div>' : '';
    html += `<div class="hrow"><time>${d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</time>` +
      `<div class="htxt"><div>${hText(g)}</div>${extra}${thumbs}</div><span class="hdev">Веб-интерфейс · ${esc(g.dev || '')}${g.ip ? ' · ' + esc(g.ip) : ''}</span></div>`;
  }
  $('#hlist').innerHTML = html || '<div class="tinfo">Событий пока нет</div>';
  $('#hmoreBox').innerHTML = H.done ? '' : '<button class="btn hmore" id="hmore">Показать ещё</button>';
  const b = $('#hmore'); if (b) b.onclick = hMore;
}

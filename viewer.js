/* ===== Компактный размер шрифтов и отступов: меню, список, модальные окна ===== */
document.head.append(Object.assign(document.createElement('style'), {textContent: `
.navitem { font-size: 15px; }
.row .nm { font-size: 15px; }
.row .dt, .row .sz { font-size: 13px; }

.dlg2 { width: min(440px, 100%); padding: 20px 16px 16px; border-radius: 16px; }
.dlg2 h3 { font-size: 18px; margin: 0 34px 12px 8px; font-weight: 600; }
.dlg2 .dx { top: 14px; right: 14px; width: 30px; height: 30px; }
.dlg2 .dx .ic-svg { width: 18px; height: 18px; }
.dtext { font-size: 14px; margin: -2px 8px 14px; }
.dinp { height: 40px; font-size: 14px; margin: 0 4px 14px; border-radius: 10px; }
.dbtns { gap: 8px; padding: 0 4px; margin-top: 2px; }
.dbtn { height: 40px; padding: 0 18px; font-size: 14px; border-radius: 10px; }
.tree { max-height: min(300px, 50vh); margin: 0 0 14px; }
.prow { height: 38px; gap: 8px; border-radius: 10px; padding-right: 10px; }
.prow .tch { width: 20px; height: 20px; }
.prow .tch .ic-svg { width: 15px; height: 15px; }
.prow .pfi { width: 22px; height: 22px; }
.prow .pfi .ic-svg { width: 20px; height: 20px; }
.pn { font-size: 14px; }

/* просмотрщик */
.vbar { display: flex; align-items: center; gap: 6px; }
#vname { font-weight: 600; max-width: 28%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#vmeta { flex: 1; min-width: 0; text-align: center; color: #9a9aa6; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 16px; }
#vmeta a { color: #cfcfd8; cursor: pointer; text-decoration: none; }
#vmeta a:hover { text-decoration: underline; }
/* телефон: кнопки в первой строке, имя и путь — под ними */
@media (max-width: 600px) {
  .vbar { flex-wrap: wrap; justify-content: flex-end; gap: 2px; row-gap: 2px; }
  #vname { order: 1; flex: 1 1 100%; max-width: none; padding: 0 6px; }
  #vmeta { order: 2; flex: 1 1 100%; text-align: left; padding: 0 6px; }
}
#vdel { color: #ff5b5b; }
body:has(#viewer:not([hidden])) #fabUp { display: none; }   /* кнопка «Загрузить» не поверх просмотрщика */
#vdel:hover { background: rgba(255, 91, 91, .16); }

/* «Создать или загрузить»: в таблице — полоса, в плитках — плитка обычного размера */
#newBar { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 46px; margin: 0 0 10px; border: 2px dashed #3a3a44; border-radius: 12px; background: transparent; color: #8e8e99; font: inherit; font-size: 14px; cursor: pointer; }
#newBar:hover { background: #ffffff0a; color: #cfcfd8; border-color: #4a4a55; }
#newBar .plus { width: 26px; height: 26px; border-radius: 8px; background: #34343b; display: flex; align-items: center; justify-content: center; color: #e6e6ea; }
#newBar .plus .ic-svg { width: 16px; height: 16px; }
#list.grid #newBar { grid-column: auto; flex-direction: column; justify-content: center; gap: 8px; width: auto; height: auto; min-height: 140px; align-self: stretch; margin: 0; padding: 12px 26px; border-radius: 14px; text-align: center; line-height: 1.3; }
#list.grid #newBar .plus { width: 44px; height: 44px; border-radius: 12px; }
#list.grid #newBar .plus .ic-svg { width: 22px; height: 22px; }
#menu kbd { margin-left: auto; padding-left: 28px; color: #8b8b96; font: inherit; font-size: 13px; }
#side nav { margin-top: 6px; }

/* Шапка сайдбара: «Диск» слева, иконка «Выйти» справа */
.logo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 4px; }
.logo-row .logo { margin: 0; padding: 0; }
#topLogout {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  color: var(--mut); text-decoration: none; cursor: pointer;
  transition: background .12s, color .12s;
}
#topLogout:hover { background: rgba(255, 255, 255, .08); color: var(--fg); }
#topLogout .ic-svg { width: 22px; height: 22px; }

/* Нижняя кнопка «Выйти» скрыта */
.logout { display: none !important; }

/* Плавающая синяя кнопка «Загрузить» — видна ВСЕГДА в разделе Файлы */
#fabUp {
  position: fixed; right: 36px; bottom: 32px; z-index: 40;
  display: flex; align-items: center; justify-content: center;
  height: 50px; padding: 0 28px; border-radius: 25px;
  background: #0077ff; color: #fff; font-size: 16px; font-weight: 500; font-family: inherit;
  border: 0; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 119, 255, .45);
  transition: transform .15s ease, opacity .15s ease, background .15s ease;
  user-select: none;
}
#fabUp:hover { background: #1a85ff; transform: translateY(-1px); }
#fabUp:active { transform: translateY(0); }
#fabUp[hidden] { display: none !important; }
#menu { z-index: 45; }   /* меню поверх кнопки «Загрузить» */
@media (max-width: 600px) {
  #fabUp { right: 20px; bottom: 20px; height: 44px; padding: 0 22px; font-size: 15px; }
}

/* Новая кнопка сортировки в стиле Облака Mail.ru */
#sort { display: none !important; }
#sortBtn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  height: 38px; padding: 0 10px; border-radius: 10px; border: 0;
  background: #2a2a30; color: #cfcfd8; cursor: pointer; font: inherit; font-size: 14px;
  transition: background .12s, color .12s;
}
#sortBtn:hover { background: #35353d; color: #fff; }
#sortBtn .ic-svg { width: 18px; height: 18px; }
#sortBtn .dir { width: 14px; height: 14px; transition: transform .15s; }
body.mode-history #sortBtn { display: none; }
body.mode-photos #sortBtn { display: none; }

/* Стрелочка направления внутри пунктов меню сортировки */
.sdir-icon { margin-left: auto; padding-left: 20px; display: inline-flex; align-items: center; color: #0077ff; }
.sdir-icon .ic-svg { width: 16px; height: 16px; }

/* Кнопка действий над текущей папкой в хлебных крошках */
.folder-more-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; margin-left: 6px; border-radius: 6px;
  border: 0; background: transparent; color: #8e8e99; cursor: pointer;
  vertical-align: middle; transition: background .12s, color .12s;
}
.folder-more-btn:hover { background: rgba(255, 255, 255, .08); color: #fff; }
.folder-more-btn .ic-svg { width: 16px; height: 16px; }
`}));

/* ===== Перемещение иконки «Выйти» в шапку сайдбара ===== */
{
  const logo = $('#side .logo');
  if (logo && !$('#topLogout')) {
    const row = document.createElement('div');
    row.className = 'logo-row';
    logo.replaceWith(row);
    row.append(logo);
    const a = document.createElement('a');
    a.id = 'topLogout';
    a.href = 'logout.php?t=' + encodeURIComponent($('meta[name=csrf]')?.content || '');
    const uname = $('meta[name=user]')?.content || '';
    a.title = uname ? `Выйти (${uname})` : 'Выйти';
    a.innerHTML = ico('logout');
    row.append(a);
  }
}

/* ===== Действия над текущей папкой (из хлебных крошек и левого меню) ===== */
function folderActions(p) {
  const nm = base(p) || p;
  const parent = dirOf(p);
  const target = {p, n: nm, d: true};
  return [
    ['Переименовать', async () => {
      const n = await uiPrompt('Переименование папки', nm, 'Переименовать');
      if (n && n !== nm) {
        await api('rename', {p, name: n});
        const newPath = join(parent, n);
        treeClear();
        location.hash = hashFor(newPath);
      }
    }, 'rename'],
    ['Переместить', async () => {
      const dest = await pickFolder(parent, 'Перемещение 1 папки', [target], 'Переместить');
      if (dest === null || dest === parent) return;
      const j = await api('move', {items: [p], to: dest});
      if (j.errors && j.errors.length) return uiAlert(j.errors.join('\n'));
      treeClear();
      location.hash = hashFor(join(dest, nm));
    }, 'move'],
    ['Копировать', async () => {
      const dest = await pickFolder(parent, 'Копирование 1 папки', [target], 'Копировать', true);
      if (dest === null) return;
      const j = await api(copy ? 'copy' : 'move', {items: [p], to: dest});
      if (j.errors && j.errors.length) return uiAlert(j.errors.join('\n'));
      treeClear();
      load();
    }, 'copy'],
    '-',
    ['Удалить', async () => {
      if (!await uiConfirm('Удаление 1 папки', `Переместить папку «${nm}» в корзину?`, 'Удалить', true)) return;
      const j = await api('delete', {items: [p]});
      if (j.errors && j.errors.length) return uiAlert(j.errors.join('\n'));
      treeClear();
      // После удаления текущей папки переходим на уровень выше
      location.hash = hashFor(parent);
    }, 'trash'],
  ];
}

// 1) Кнопка «⋮» в хлебных крошках рядом с текущей папкой + клик
function patchCrumbs() {
  if (mode !== 'files' || !cwd) return;
  const crumbs = $('#crumbs');
  if (!crumbs || crumbs.querySelector('.folder-more-btn')) return;
  const lastLink = crumbs.querySelector('a:last-of-type');
  if (!lastLink) return;
  const btn = document.createElement('button');
  btn.className = 'folder-more-btn';
  btn.title = 'Действия с папкой';
  btn.innerHTML = ico('kebab');
  btn.onclick = e => {
    e.stopPropagation();
    popMenu(e, folderActions(cwd));
  };
  lastLink.after(btn);
}

// 2) Правый клик по строке папки в левом дереве
$('#ftree').addEventListener('contextmenu', e => {
  const trw = e.target.closest('.trw');
  if (!trw) return;
  const hash = trw.getAttribute('href') || '';
  const p = decodeURIComponent(hash.replace(/^#\/?/, ''));
  if (!p) return;
  e.preventDefault();
  e.stopPropagation();
  popMenu(e, folderActions(p));
});

/* ===== Новая кнопка сортировки в шапке (левее кнопки вида) ===== */
Object.assign(IC, {
  sortLines: SV('<path d="M4 6h10M4 12h7M4 18h4"/><path d="M15 15l3-3 3 3M18 18V12"/>'),
  fileText:  SV('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  sortAa:    SV('<text x="2" y="16" font-size="14" font-family="sans-serif" font-weight="700" fill="currentColor" stroke="none">A</text><text x="13" y="17" font-size="11" font-family="sans-serif" font-weight="600" fill="currentColor" stroke="none">a</text>'),
  upDown:    SV('<path d="M8 7v10M8 7l-3 3M8 7l3 3M16 17V7M16 17l-3-3M16 17l3-3"/>'),
  arrowUp:   SV('<path d="M12 19V5m0 0l-5 5m5-5 5 5"/>'),
  arrowDown: SV('<path d="M12 5v14m0 0l-5-5m5 5 5-5"/>'),
});

let sortOrder = localStorage.sortOrder || 'asc';
if (!localStorage.sortOrder && sort === 'date') sortOrder = 'desc';

let sortBtn = $('#sortBtn');
if (!sortBtn && $('#viewBtn')) {
  sortBtn = document.createElement('button');
  sortBtn.id = 'sortBtn';
  sortBtn.title = 'Сортировка';
  $('#viewBtn').before(sortBtn);
}

function updateSortBtn() {
  if (!sortBtn) return;
  const isDesc = (sortOrder === 'desc');
  sortBtn.innerHTML = `${ico('sortLines')}<span class="dir" style="transform:${isDesc ? 'rotate(180deg)' : 'none'}">${ico('chevR')}</span>`;
}
updateSortBtn();

sorted = function() {
  const f = filter.toLowerCase();
  const a = items.filter(i => !f || i.n.toLowerCase().includes(f));
  const dir = (sortOrder === 'desc') ? -1 : 1;
  const cmp = {
    name: (x, y) => dir * x.n.localeCompare(y.n, 'ru', {numeric: true}),
    date: (x, y) => dir * (x.m - y.m),
    size: (x, y) => dir * (x.s - y.s),
  }[sort] || ((x, y) => 0);
  return a.sort((x, y) => (y.d - x.d) || cmp(x, y));
};

{
  const origDrawTrash = (typeof drawTrash === 'function') ? drawTrash : null;
  if (origDrawTrash) {
    drawTrash = function() {
      if (mode !== 'trash') return;
      const el = $('#trashv');
      $('#viewBtn').innerHTML = ico(view === 'grid' ? 'list' : 'grid');
      el.className = view === 'grid' ? 'grid' : '';
      const f = filter.toLowerCase();
      const dir = (sortOrder === 'desc') ? -1 : 1;
      const cmp = {
        name: (x, y) => dir * x.name.localeCompare(y.name, 'ru', {numeric: true}),
        date: (x, y) => dir * (x.t - y.t),
        size: (x, y) => dir * (x.s - y.s),
      }[sort] || ((x, y) => 0);
      T.L = T.items.filter(i => !f || i.name.toLowerCase().includes(f)).sort((x, y) => {
        return sort === 'date' ? cmp(x, y) : ((y.d - x.d) || cmp(x, y));
      });
      const be = $('#btnEmpty'); if (be) be.style.display = T.items.length ? '' : 'none';   // «Очистить корзину» — только если есть что очищать
      if (!T.items.length) { el.innerHTML = '<div class="tinfo">Корзина пуста</div>'; return; }
      if (!T.L.length) { el.innerHTML = '<div class="tinfo">Ничего не найдено</div>'; return; }
      setHTML(el, T.L.map((it, i) => `<div class="row trow${T.sel.has(it.id) ? ' sel' : ''}" data-i="${i}">${rowIcon({n: it.name, d: it.d}, '', '', 'thumb.php?t=' + enc(it.id) + '&w=320')}` +
          `<div class="nm">${esc(it.name)}<small>${it.orig ? 'из: ' + esc(dirOf(it.orig) || 'Файлы') : 'исходное место неизвестно'}</small></div>` +
          `<div class="dt">${fmtDate(it.t)}</div><div class="sz">${it.d ? '' : fmtSize(it.s)}</div><button class="icon more">${ico('kebab')}</button></div>`).join(''));
    };
  }
}

// кнопка «Очистить корзину» скрыта, пока список корзины не загружен
{
  const baseShowTrash = showTrash;
  showTrash = function () { const r = baseShowTrash(); const be = $('#btnEmpty'); if (be && !T.items.length) be.style.display = 'none'; return r; };
}

function selectSort(modeKey) {
  if (sort === modeKey) {
    sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
  } else {
    sort = modeKey;
    sortOrder = (modeKey === 'date') ? 'desc' : 'asc';
  }
  localStorage.sort = sort;
  localStorage.sortOrder = sortOrder;
  updateSortBtn();
  redraw();
}

if (sortBtn) {
  sortBtn.onclick = e => {
    e.stopPropagation();
    const r = sortBtn.getBoundingClientRect();
    const m = $('#menu');
    m.innerHTML = '';
    const arrowHtml = `<span class="sdir-icon" title="${sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}">${ico(sortOrder === 'asc' ? 'arrowUp' : 'arrowDown')}</span>`;
    const opts = [
      {k: 'date', label: 'По дате создания', icon: 'calendar'},
      {k: 'size', label: 'По размеру файла', icon: 'fileText'},
      {k: 'name', label: 'По алфавиту',     icon: 'sortAa'},
    ];
    opts.forEach(it => {
      const d = document.createElement('div');
      d.innerHTML = ico(it.icon) + `<span>${esc(it.label)}</span>` + (sort === it.k ? arrowHtml : '');
      d.onclick = ev => {
        ev.stopPropagation();
        m.hidden = true;
        selectSort(it.k);
      };
      m.append(d);
    });
    m.style.minWidth = '220px';
    m.hidden = false;
    const mw = m.offsetWidth || 220;
    m.style.left = Math.max(8, Math.min(r.left, innerWidth - mw - 8)) + 'px';
    m.style.top = (r.bottom + 6) + 'px';
  };
}

/* ===== Подпапки с признаком «есть вложенные папки» (шеврон только там, где он нужен) ===== */
const TD = {};
async function dirsOf(p) {
  if (!TD[p]) {
    let r;
    try { r = (await api('dirs', null, {p}, true)).dirs; }
    catch (e) {
      try { r = (await api('list', null, {p}, true)).items.filter(i => i.d).map(i => ({n: i.n})); } catch (e2) { r = []; }
    }
    TD[p] = r.sort((a, b) => a.n.localeCompare(b.n, 'ru', {numeric: true}));
  }
  return TD[p];
}

/* Дерево в левом меню (переопределяет версию из app.js) */
async function treeRender() {
  const tok = ++treeTok, rows = [];
  const walk = async (p, depth) => {
    for (const k of await dirsOf(p)) {
      if (tok !== treeTok) throw 0;
      const cp = join(p, k.n); rows.push([cp, k, depth]);
      if (k.h !== false && TOPEN.has(cp)) await walk(cp, depth + 1);
    }
  };
  try { if (TOPEN.has('')) await walk('', 0); } catch (e) { return; }
  if (tok !== treeTok) return;
  $('#navFiles .tch').classList.toggle('open', TOPEN.has(''));
  const box = $('#ftree'); box.hidden = !TOPEN.has('');
  box.innerHTML = rows.map(([cp, k, d]) =>
    `<a class="trw${mode === 'files' && cwd === cp ? ' on' : ''}" href="${hashFor(cp)}" title="${esc(k.n)}" style="padding-left:${10 + d * 18}px">` +
    `<span class="tch${k.h !== false && TOPEN.has(cp) ? ' open' : ''}" data-t="${esc(cp)}">${k.h !== false ? ico('chevR') : ''}</span>` +
    `<span class="pfi">${k.l ? FOLDER_LNK : FOLDER}</span><span class="tn">${esc(k.n)}</span></a>`).join('');
}
function treeClear() { for (const k in TD) delete TD[k]; treeRender(); }

/* Выбор папки — компактная версия (переопределяет pickFolder из app.js) */
function pickFolder(start, title, targets, okLabel = 'Переместить', sameOk = false) {
  return new Promise(resolve => {
    const skip = (targets || []).map(t => t.p);
    const skipped = p => skip.some(s => p === s || p.startsWith(s + '/'));
    let cur = start, first = true; const open = new Set(['']), cache = {};
    for (let acc = '', parts = start ? start.split('/') : []; parts.length;) { acc = join(acc, parts.shift()); if (parts.length) open.add(acc); }
    const done = v => { ov.close(); resolve(v); };
    const ov = mkOvl(`<button class="dx" data-x="c">${ico('close')}</button><h3>${esc(title)}</h3><div class="tree"></div>` +
      `<div class="dbtns"><button class="dbtn primary" data-x="ok">${esc(okLabel)}</button><button class="dbtn" data-x="new">Создать папку</button></div>`, () => done(null));
    const tree = ov.querySelector('.tree'), okBtn = ov.querySelector('[data-x=ok]');
    const kids = async p => cache[p] || (cache[p] = await dirsOf(p));
    async function draw() {
      const rows = [];
      const walk = async (p, d) => {
        for (const k of await kids(p)) {
          const cp = join(p, k.n); if (skipped(cp)) continue;
          rows.push([cp, k, d]); if (k.h !== false && open.has(cp)) await walk(cp, d + 1);
        }
      };
      if (open.has('')) await walk('', 1);
      const row = (cp, name, d, h, root, l) =>
        `<div class="prow${cur === cp ? ' on' : ''}" data-p="${esc(cp)}" style="padding-left:${8 + d * 20}px">` +
        `<span class="tch${open.has(cp) ? ' open' : ''}" data-t="${esc(cp)}">${h ? ico('chevR') : ''}</span>` +
        `<span class="pfi">${root ? ico('folder') : l ? FOLDER_LNK : FOLDER}</span><span class="pn">${esc(name)}</span></div>`;
      tree.innerHTML = row('', 'Файлы', 0, true, true) + rows.map(r => row(r[0], r[1].n, r[2], r[1].h !== false, false, r[1].l)).join('');
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
          if (n) {
            try {
              await api('mkdir', {p: cur, name: n});
              delete cache[cur]; delete cache[dirOf(cur)]; delete TD[cur]; delete TD[dirOf(cur)];
              open.add(cur); cur = join(cur, n); draw();
            } catch (er) {}
          }
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
treeRender();

/* ===== «Создать или загрузить»: меню вместо кнопок «Загрузить» и «Папку» ===== */
Object.assign(IC, {
  folderPlus: SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10v5M9.5 12.5h5"/>'),
  fileUp:     SV('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 17v-5m0 0-2.5 2.5M12 12l2.5 2.5"/>'),
  folderUp:   SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 16v-5m0 0-2.5 2.5M12 11l2.5 2.5"/>'),
});
$('#btnUpload').remove(); $('#btnMkdir').remove();
const dirInput = Object.assign(document.createElement('input'), {type: 'file', multiple: true, hidden: true});
dirInput.setAttribute('webkitdirectory', ''); document.body.append(dirInput);

// контекстное меню с подсказками клавиш (4-й элемент пункта)
function popMenu(e, acts) {
  if (e.preventDefault) e.preventDefault();
  const m = $('#menu');
  // повторное нажатие на ту же кнопку («⋮», ссылка, «Создать или загрузить») закрывает меню
  const opener = (e.target && e.target.closest) ? e.target.closest('button, .more, #newBar') : null;
  const rclick = typeof MouseEvent !== 'undefined' && e instanceof MouseEvent && e.type === 'contextmenu';
  if (!rclick && opener && !m.hidden && m._opener === opener) { m.hidden = true; m._opener = null; if (e.stopPropagation) e.stopPropagation(); return; }
  m._opener = rclick ? null : opener;
  m.innerHTML = '';
  acts.forEach(a => {
    if (a === '-') { m.append(document.createElement('hr')); return; }
    const d = document.createElement('div');
    d.innerHTML = (a[2] ? ico(a[2]) : '') + `<span>${esc(a[0])}</span>` + (a[3] ? `<kbd>${esc(a[3])}</kbd>` : '');
    d.onclick = ev => { ev.stopPropagation(); m.hidden = true; a[1](); };
    m.append(d);
  });
  m.style.minWidth = acts.some(a => a[3]) ? '290px' : '';
  m.hidden = false;
  const ctx = e.type === 'contextmenu', r = (e.target.closest('button') || e.target).getBoundingClientRect();
  const x = ctx ? e.clientX : r.left, y = ctx ? e.clientY : r.bottom;
  // если снизу не помещается — открыть над кнопкой, а не поверх неё (иначе повторно нажать «⋮» нельзя)
  const place = () => {
    const h = m.offsetHeight, w = m.offsetWidth;
    let top = y, left = x;
    if (!ctx && y + h > innerHeight - 8) {
      if (r.top - h >= 8) top = r.top - h;                     // над кнопкой
      else left = r.left - w - 6 >= 8 ? r.left - w - 6 : r.right + 6;   // нигде не помещается по высоте — сбоку от кнопки
    }
    m.style.left = Math.max(8, Math.min(left, innerWidth - w - 8)) + 'px';
    m.style.top = Math.max(8, Math.min(top, innerHeight - h - 8)) + 'px';
  };
  place();
  requestAnimationFrame(() => { if (!m.hidden) place(); });   // пункты «Избранное»/«Поделиться» добавляются чуть позже
  e.stopPropagation();
}

// повторное нажатие правой кнопкой при открытом меню закрывает его (и не показывает меню браузера)
document.addEventListener('contextmenu', e => {
  const m = $('#menu'); if (m.hidden) return;
  e.preventDefault(); e.stopImmediatePropagation();
  m.hidden = true; m._opener = null;
}, true);

async function newFolderHere() {
  const n = await uiPrompt('Новая папка', '', 'Создать', {placeholder: 'Название папки'});
  if (n) { await api('mkdir', {p: cwd, name: n}); load(); }
}
const pickFiles = () => $('#fileInput').click();
const pickDir = () => dirInput.click();
const NEW_ACTS = () => [
  ['Создать папку', newFolderHere, 'folderPlus', 'Shift + F'],
  '-',
  ['Загрузить файлы', pickFiles, 'fileUp', 'Shift + I'],
  ['Загрузить папку', pickDir, 'folderUp', 'Shift + U'],
];
const UPLOAD_ONLY_ACTS = () => [
  ['Загрузить папку', pickDir, 'folderUp', 'Shift + U'],
  ['Загрузить файлы', pickFiles, 'fileUp', 'Shift + I'],
];

// «Создать или загрузить» первым элементом списка + добавление кнопки действий в крошки
{
  const origRender = render;
  render = function () {
    origRender();
    if (mode !== 'files') return;
    patchCrumbs();
    $('#list').insertAdjacentHTML('afterbegin', `<button id="newBar"><span class="plus">${ico('plus')}</span>Создать или загрузить</button>`);
    updateFab();
  };
}
$('#list').addEventListener('click', e => {
  const b = e.target.closest('#newBar'); if (!b) return;
  const r = b.getBoundingClientRect(), grid = $('#list').classList.contains('grid');
  popMenu({type: 'contextmenu', clientX: grid ? r.left : r.left + r.width / 2 - 145, clientY: r.bottom - 6, target: b, stopPropagation() {}, preventDefault() {}}, NEW_ACTS());
  e.stopPropagation();
});

/* ===== Плавающая синяя кнопка «Загрузить» — видна ВСЕГДА в разделе Файлы ===== */
let fab = $('#fabUp');
if (!fab) {
  fab = document.createElement('button');
  fab.id = 'fabUp';
  fab.textContent = 'Загрузить';
  document.body.append(fab);
}

function updateFab() {
  fab.hidden = (mode !== 'files');
}

// При клике на синюю кнопку всплывает меню над ней: «Загрузить папку» и «Загрузить файлы»
fab.addEventListener('click', e => {
  const acts = UPLOAD_ONLY_ACTS();
  const m = $('#menu');
  if (!m.hidden && m._opener === fab) { m.hidden = true; m._opener = null; e.stopPropagation(); return; }   // повторное нажатие закрывает
  m._opener = fab; m.innerHTML = '';
  acts.forEach(a => {
    const d = document.createElement('div');
    d.innerHTML = (a[2] ? ico(a[2]) : '') + `<span>${esc(a[0])}</span>` + (a[3] ? `<kbd>${esc(a[3])}</kbd>` : '');
    d.onclick = ev => { ev.stopPropagation(); m.hidden = true; a[1](); };
    m.append(d);
  });
  m.style.minWidth = '260px';
  m.hidden = false;
  const fr = fab.getBoundingClientRect();
  const mw = m.offsetWidth || 260, mh = m.offsetHeight || 90;
  m.style.left = Math.max(8, fr.right - mw) + 'px';
  m.style.top = Math.max(8, fr.top - mh - 10) + 'px';
  e.stopPropagation();
});

addEventListener('hashchange', () => setTimeout(() => { updateFab(); patchCrumbs(); }, 20));
updateFab();

document.addEventListener('keydown', e => {
  if (mode !== 'files' || !e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || hasOvl() || !$('#viewer').hidden) return;
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const act = {KeyF: newFolderHere, KeyI: pickFiles, KeyU: pickDir}[e.code];
  if (act) { e.preventDefault(); act(); }
});

/* загрузка с отдельной папкой назначения для каждого файла (нужна для загрузки папок) */
function uploadList(list) {
  const box = $('#uploads'); box.hidden = false; let chain = Promise.resolve();
  list.forEach(({file: f, dest}) => {
    const d = document.createElement('div'); d.className = 'up';
    d.innerHTML = `<div>${esc(f.name)}</div><div class="bar"><i></i></div>`; box.append(d);
    chain = chain.then(() => new Promise(res => {
      const x = new XMLHttpRequest(), fd = new FormData(); fd.append('f', f);
      x.open('POST', 'upload.php?p=' + enc(dest)); x.setRequestHeader('X-CSRF', CSRF);
      x.upload.onprogress = ev => d.querySelector('i').style.width = (ev.loaded / ev.total * 100) + '%';
      x.onload = () => { d.querySelector('i').style.width = '100%'; if (x.status !== 200) d.firstChild.textContent += ' — ошибка'; res(); };
      x.onerror = () => { d.firstChild.textContent += ' — ошибка сети'; res(); };
      x.send(fd);
    }));
  });
  chain.then(() => { treeClear(); if (mode === 'files') load(); setTimeout(() => { box.hidden = true; box.innerHTML = ''; }, 3000); });
}
async function rawMkdir(p, name) {
  try { await fetch('api.php?a=mkdir', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF': CSRF}, body: JSON.stringify({p, name})}); } catch (e) {}
}
dirInput.onchange = async e => {
  const files = [...e.target.files]; e.target.value = '';
  if (!files.length) return;
  const dest = mode === 'files' ? cwd : '', dirs = new Set();
  for (const f of files) {
    const parts = (f.webkitRelativePath || f.name).split('/'); parts.pop();
    for (let i = 1; i <= parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  for (const d of [...dirs].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))) await rawMkdir(join(dest, dirOf(d)), base(d));
  uploadList(files.map(f => ({file: f, dest: join(dest, dirOf(f.webkitRelativePath || f.name))})));
};

/* ===== Просмотрщик: путь, размер, переименовать / переместить / удалить ===== */
$('.vbar').innerHTML =
  `<span id="vname"></span><span id="vmeta"></span>` +
  `<button id="vfav" class="icon" title="В избранное"></button>` +
  `<button id="vren" class="icon" title="Переименовать (F2)">${ico('rename')}</button>` +
  `<button id="vmove" class="icon" title="Переместить">${ico('move')}</button>` +
  `<a id="vdl" class="icon" title="Скачать">${ico('download')}</a>` +
  `<button id="vdel" class="icon" title="Удалить (Del)">${ico('trash')}</button>` +
  `<button id="vclose" class="icon" title="Закрыть">${ico('close')}</button>`;

const vPath = it => it.p ?? join(cwd, it.n);
let vTok = 0;

function setMeta(it) {
  const d = dirOf(vPath(it)), parts = ['Файлы', ...(d ? d.split('/') : [])];
  const size = it.s != null ? ` · <span title="${Number(it.s).toLocaleString('ru-RU')} байт">${fmtSize(it.s)}</span>` : '';
  $('#vmeta').innerHTML = `<a href="${hashFor(d)}" title="Открыть папку">${esc(parts.join(' › '))}</a>` + size;
}

async function showV() {
  const it = vlist[vi], p = vPath(it), e = ext(it.n), b = $('#vbody'), tok = ++vTok;
  $('#vname').textContent = it.n; $('#vname').title = it.n;
  $('#vdl').href = fileUrl(p, true);
  setMeta(it);
  if (it.s == null) {
    api('stat', null, {p}, true).then(j => {
      if (j && j.s != null) { it.s = j.s; if (vlist[vi] === it) setMeta(it); }
    }).catch(() => {});
  }
  b.innerHTML = '';
  if (IMG.has(e)) { const i = new Image(); i.src = NATIVE.has(e) ? fileUrl(p) : thumbUrl(it, p, 1600); b.append(i); }
  else if (VID.has(e)) b.innerHTML = `<video src="${fileUrl(p)}" controls autoplay playsinline></video>`;
  else if (AUD.has(e)) b.innerHTML = `<audio src="${fileUrl(p)}" controls autoplay></audio>`;
  else if (e === 'pdf') b.innerHTML = `<iframe src="${fileUrl(p)}"></iframe>`;
  else if (typeof OFFICE_ON !== 'undefined' && OFFICE_ON && (OFF_WORD.has(e) || OFF_XLS.has(e))) await showOffice(it, p, e, b, tok);
  else {
    const buf = await (await fetch(fileUrl(p))).arrayBuffer();
    if (tok !== vTok) return;
    let txt;
    try { txt = new TextDecoder('utf-8', {fatal: true}).decode(buf); }
    catch (_) { txt = new TextDecoder('windows-1251').decode(buf); }
    const pre = document.createElement('pre'); pre.textContent = txt; b.append(pre);
  }
}

function vDrop(p) {
  vlist.splice(vi, 1);
  if (mode === 'photos') pRemove(new Set([p])); else load();
  if (!vlist.length) return closeV();
  vi = Math.min(vi, vlist.length - 1); showV();
}
async function vRename() {
  const it = vlist[vi], p = vPath(it);
  const n = await uiPrompt('Переименование', it.n, 'Переименовать', {selectName: true});
  if (!n || n === it.n) return;
  const j = await api('rename', {p, name: n});
  it.n = (j && j.name) || n; if (it.p) it.p = join(dirOf(p), it.n);
  if (mode === 'files') load();
  showV();
}
async function vMove() {
  const it = vlist[vi], p = vPath(it);
  const dest = await pickFolder(dirOf(p), 'Перемещение 1 файла', [{p}], 'Переместить');
  if (dest === null) return;
  const j = await api('move', {items: [p], to: dest});
  if (j.errors && j.errors.length) return uiAlert(j.errors.join('\n'));
  vDrop(p);
}
async function vDelete() {
  const it = vlist[vi], p = vPath(it);
  if (!await uiConfirm('Удаление 1 файла', `Переместить «${it.n}» в корзину?`, 'Удалить', true)) return;
  const j = await api('delete', {items: [p]});
  if (j.errors && j.errors.length) return uiAlert(j.errors.join('\n'));
  vDrop(p);
}
$('#vclose').onclick = closeV;
$('#vren').onclick = vRename; $('#vmove').onclick = vMove; $('#vdel').onclick = vDelete;
$('#vmeta').addEventListener('click', e => { if (e.target.closest('a')) closeV(); });
document.addEventListener('keydown', e => {
  if ($('#viewer').hidden || hasOvl()) return;
  if (e.key === 'Delete') vDelete(); else if (e.key === 'F2') { e.preventDefault(); vRename(); }
});

/* ===== Избранное, ZIP-скачивание, иконки в строках и плитках ===== */
try {
Object.assign(IC, {
  selAll:   SV('<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="M8 12.2l2.8 2.8L16.2 9.5"/>'),
  star:     SV('<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z"/>'),
  starFill: SV('<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" fill="currentColor"/>'),
  zip:      SV('<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M12 10v6m0 0-2.5-2.5M12 16l2.5-2.5"/>'),
});
document.head.append(Object.assign(document.createElement('style'), {textContent: `
/* «Избранное» — обычный раздел внутри #main, вёрстка строк как в «Файлах» */
#favv { flex: 1; overflow: auto; padding: 0 10px 30px; }
#favv[hidden] { display: none !important; }
#favv .nm small { display: block; color: var(--mut); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
#favv .row { position: relative; }
#favv .fact { position: absolute; right: 56px; top: 50%; transform: translateY(-50%); display: flex; gap: 2px; }
/* колонки как в «Файлах»: место под чекбокс слева и под кнопки «Скачать/Избранное» справа */
#favv .row, #trashv:not(.grid) .row { padding-left: 38px; }
#favv .row .sz, #trashv:not(.grid) .row .sz { margin-right: 84px; }
#favv .fact button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #9a9aa6; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
#favv .fact button:hover { background: #ffffff14; color: #fff; }
#favv .fact button .ic-svg { width: 20px; height: 20px; }
#favv .fact button[data-u] { color: #ffc933; }
#favv.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 170px)); justify-content: start; align-content: start; grid-auto-rows: max-content; gap: 8px; padding: 0 10px 30px; }
#favv.grid .row { padding: 8px; position: relative; }
#favv.grid .row .nm small { display: none; }
/* «⋮» в плитке — справа сверху, как в «Файлах» */
#favv.grid .row .more, #sharev.grid .row .more { top: 12px; right: 12px; width: 32px; height: 32px; padding: 0; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; display: inline-flex; align-items: center; justify-content: center; z-index: 3; }
#favv.grid .row .sz { margin-right: 0; }
#favv.grid .row .ic { position: relative; }
#favv.grid .fact { display: contents; }
#favv.grid .fact button, #favv.grid .ic > button[data-u] { position: absolute; z-index: 3; width: 32px; height: 32px; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; opacity: 0; transition: opacity .12s; }
#favv.grid .fact button { top: 12px; left: 12px; }
#favv.grid .ic > button[data-u] { left: 4px; bottom: 4px; color: #ffc933; opacity: 1; border: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
#favv.grid .ic > button[data-u] .ic-svg { width: 20px; height: 20px; }
#favv.grid .row:hover .fact button { opacity: 1; }
@media (hover: none) { #favv.grid .fact button { opacity: 1; } }
/* единая шапка во всех разделах: высота как в «Файлах» (с полем поиска), чтобы заголовок не прыгал */
#top { box-sizing: border-box; min-height: 65px; }
/* отступы контента как в «Файлах»: текст с 12px внутри области 10px */
#photos { padding-left: 10px; }
#pinfo { padding: 4px 12px 6px; }

/* иконки «Избранное» и «Скачать» — режим списка: слева от «⋮» */
#list:not(.grid) .row { position: relative; }
#list:not(.grid) .row .sz { margin-right: 84px; }
#list:not(.grid) .row .ract { position: absolute; right: 56px; top: 50%; transform: translateY(-50%); display: flex; gap: 2px; opacity: 0; transition: opacity .12s; }
#list:not(.grid) .row:hover .ract, #list:not(.grid) .row .ract.on { opacity: 1; }
.ract button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #9a9aa6; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.ract button:hover { background: #ffffff14; color: #fff; }
.ract button .ic-svg { width: 20px; height: 20px; }
.ract [data-fa=star].fv { color: #ffc933; }

/* режим плиток: «Скачать» — слева сверху, «Избранное» — слева снизу */
#list.grid .row { position: relative; }
#list.grid .row .ract { display: contents; }
#list.grid .row .ract button { position: absolute; left: 8px; z-index: 3; width: 32px; height: 32px; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; opacity: 0; transition: opacity .12s, background .12s; }
#list.grid .row .ract button[data-fa=dl] { top: 12px; left: 12px; }
#list.grid .row .more { top: 12px; right: 12px; width: 32px; height: 32px; padding: 0; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; display: inline-flex; align-items: center; justify-content: center; z-index: 3; }
#list.grid .row .ract button:hover, #list.grid .row .ic > button[data-fa=star]:hover { background: rgba(60, 60, 68, .95); }
#list.grid .row:hover .ract button, #list.grid .row .ract button.fv { opacity: 1; }
/* «Избранное» в плитке — внутри области иконки, слева снизу (не наезжает на название) */
#list.grid .row .ic { position: relative; }
#list.grid .row .ic > button[data-fa=star] { position: absolute; left: 4px; bottom: 4px; z-index: 3; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: rgba(32, 32, 38, .82); color: #e6e6ea; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .12s, background .12s; }
#list.grid .row .ic > button[data-fa=star] .ic-svg { width: 20px; height: 20px; }
#list.grid .row:hover .ic > button[data-fa=star], #list.grid .row .ic > button[data-fa=star].fv { opacity: 1; }
#list.grid .row .ic > button[data-fa=star].fv { color: #ffc933; }
@media (hover: none) { #list.grid .row .ract button, #list.grid .row .ic > button[data-fa=star] { opacity: 1; } }
`}));

const FAVS = new Set();
const favPath = it => it.p ?? join(cwd, it.n);   // у объектов галереи полный путь в it.p
const qa = s => [...document.querySelectorAll(s)];
async function favLoad() {
  try { const j = await api('fav_list', null, {}, true); FAVS.clear(); (j.items || []).forEach(i => FAVS.add(i.p)); return j.items || []; }
  catch (e) { console.error('fav_list', e); return []; }
}
async function favToggle(p) {
  if (FAVS.has(p)) { await api('fav_del', {items: [p]}); FAVS.delete(p); }
  else { await api('fav_add', {items: [p]}); FAVS.add(p); }
  markFavs();
  vMarkFav();
  if (!favPanel.hidden) favShow();
}
/* звёздочка в просмотрщике (Файлы, Галерея, Избранное) */
document.head.append(Object.assign(document.createElement('style'), {textContent: `#vfav.fv { color: #ffc933; }`}));
function vMarkFav() {
  const b = $('#vfav'), it = vlist[vi]; if (!b || !it) return;
  const on = FAVS.has(vPath(it));
  b.classList.toggle('fv', on); b.innerHTML = ico(on ? 'starFill' : 'star');
  b.title = on ? 'Убрать из избранного' : 'В избранное';
}
$('#vfav').onclick = async () => { const it = vlist[vi]; if (it) { try { await favToggle(vPath(it)); } catch (_) {} } };
{ const baseShowV = showV; showV = function () { const r = baseShowV.apply(this, arguments); vMarkFav(); return r; }; }
function dlFile(url) { const a = document.createElement('a'); a.href = url; a.download = ''; document.body.append(a); a.click(); a.remove(); }
function zipDownload(p) { dlFile('download.php?p=' + enc(p)); }

function markFavs() {
  if (mode !== 'files') return;
  let list; try { list = sorted(); } catch (e) { return; }
  qa('#list .row[data-i]').forEach(r => {
    const it = list[+r.dataset.i]; if (!it) return;
    const on = FAVS.has(favPath(it));
    let box = r.querySelector('.ract');
    if (!box) {
      box = document.createElement('span'); box.className = 'ract';
      box.innerHTML = `<button data-fa="dl" title="${it.d ? 'Скачать папку (ZIP)' : 'Скачать'}">${ico('download')}</button><button data-fa="star"></button>`;
      const more = r.querySelector('.more');
      if (more) more.before(box); else r.append(box);
    }
    let sb = r.querySelector('[data-fa=star]');
    if (!sb) { sb = document.createElement('button'); sb.dataset.fa = 'star'; box.append(sb); }
    const ic = r.querySelector('.ic'), grid = $('#list').classList.contains('grid');
    if (grid && ic && sb.parentNode !== ic) ic.append(sb);
    else if (!grid && sb.parentNode !== box) box.append(sb);
    sb.className = on ? 'fv' : ''; sb.title = on ? 'Убрать из избранного' : 'В избранное';
    sb.innerHTML = ico(on ? 'starFill' : 'star');
    box.classList.toggle('on', on);
  });
}
document.getElementById('list').addEventListener('click', e => {
  const b = e.target.closest('.row [data-fa]'); if (!b) return;
  e.stopPropagation(); e.preventDefault();
  const r = b.closest('.row[data-i]'); let it; try { it = sorted()[+r.dataset.i]; } catch (_) {}
  if (!it) return;
  const p = favPath(it);
  if (b.dataset.fa === 'star') favToggle(p);
  else if (it.d) zipDownload(p); else dlFile(fileUrl(p, true));
}, true);

{
  const baseFA = folderActions;
  folderActions = function (p) {
    const acts = baseFA(p), on = FAVS.has(p);
    return [[on ? 'Убрать из избранного' : 'В избранное', () => favToggle(p), on ? 'starFill' : 'star'],
            ['Скачать папку (ZIP)', () => zipDownload(p), 'zip'], '-', ...acts];
  };
}

let favTarget = null;
document.addEventListener('contextmenu', e => {
  favTarget = null;
  const r = e.target.closest('#list [data-i]'); if (r && mode === 'files') { try { favTarget = sorted()[+r.dataset.i]; } catch (_) {} }
  const t = e.target.closest('#pgrid .pt'); if (t && mode === 'photos' && typeof P !== 'undefined') { const it = P.items[+t.dataset.i]; if (it) favTarget = {n: it.n, p: it.p, d: false}; }   // галерея
  if (!e.target.closest('.ck')) favTarget = favTarget || secTarget(e);
}, true);
document.addEventListener('click', e => {
  favTarget = null;
  const r = e.target.closest('#list [data-i]');
  if (r && mode === 'files' && e.target.closest('.more')) { try { favTarget = sorted()[+r.dataset.i]; } catch (_) {} }
  if (e.target.closest('#favv .more, #sharev .more')) favTarget = secTarget(e);
}, true);
// «Общий доступ»: объект строки для пунктов «В избранное» (меню для нескольких выбранных — без них)
function secTarget(e) {
  const r = e.target.closest('#sharev .srow'); if (!r || mode !== 'shares') return null;
  const it = ($('#sharev')._items || [])[+r.dataset.k]; if (!it) return null;
  if (window.SELX && SELX.multi('shares', it)) return null;
  return {n: it.n, p: it.p, d: it.d};
}
{
  const m = $('#menu'); let busy = false;
  new MutationObserver(() => {
    if (busy || m.hidden || !favTarget || m.querySelector('[data-fav]')) return;
    busy = true;
    const it = favTarget, p = favPath(it), on = FAVS.has(p);
    const hasDl = [...m.children].some(c => /^Скачать/.test(c.textContent.trim()));
    const add = (label, fn, icon) => {
      const d = document.createElement('div'); d.dataset.fav = '1';
      d.innerHTML = ico(icon) + `<span>${esc(label)}</span>`;
      d.onclick = ev => { ev.stopPropagation(); m.hidden = true; fn(); };
      m.append(d);
    };
    const hr = document.createElement('hr'); hr.dataset.fav = '1'; m.append(hr);
    add(on ? 'Убрать из избранного' : 'В избранное', () => favToggle(p), on ? 'starFill' : 'star');
    if (it.d && !hasDl) add('Скачать папку (ZIP)', () => zipDownload(p), 'zip');
    else if (!hasDl) add('Скачать', () => dlFile(fileUrl(p, true)), 'download');
    busy = false;
  }).observe(m, {childList: true});
}

const favPanel = document.createElement('section'); favPanel.id = 'favv'; favPanel.hidden = true;
($('#histv') ? $('#histv').after(favPanel) : $('#main').append(favPanel));
const navFav = document.createElement('a');
navFav.id = 'navFav'; navFav.className = 'navitem'; navFav.href = '#fav'; navFav.innerHTML = ico('star') + '<span>Избранное</span>';
(document.getElementById('navPhotos') || document.getElementById('ftree') || document.getElementById('navFiles')).after(navFav);   // порядок: Файлы, Галерея, Избранное
async function favShow() {
  favPanel.hidden = false; fab.hidden = true;
  qa('#side .navitem').forEach(n => n.classList.toggle('active', n === navFav));
  favPanel._all = await favLoad();
  favDraw();
}
// отрисовка «Избранного» с учётом поиска, сортировки и вида (список/плитки) — как в «Файлах»
function favDraw() {
  if (mode !== 'fav') return;
  const all = favPanel._all || [], f = filter.toLowerCase(), dir = sortOrder === 'desc' ? -1 : 1;
  const cmp = {name: (x, y) => dir * x.n.localeCompare(y.n, 'ru', {numeric: true}), date: (x, y) => dir * ((x.m || 0) - (y.m || 0)), size: (x, y) => dir * ((x.s || 0) - (y.s || 0))}[sort] || (() => 0);
  const items = all.filter(i => !f || i.n.toLowerCase().includes(f)).sort((x, y) => (y.d - x.d) || cmp(x, y));
  const grid = view === 'grid';
  favPanel.className = grid ? 'grid' : '';
  $('#viewBtn').innerHTML = ico(grid ? 'list' : 'grid');
  const star = k => `<button data-u="${k}" title="Убрать из избранного">${ico('starFill')}</button>`;
  setHTML(favPanel, !all.length ? '<div class="tinfo">Здесь появятся файлы и папки, отмеченные звёздочкой</div>'
    : !items.length ? '<div class="tinfo">Ничего не найдено</div>'
    : items.map((i, k) =>
    `<div class="row frow" data-k="${k}">${rowIcon(i, i.p, grid ? star(k) : '')}` +
    `<div class="nm">${esc(i.n)}<small>${esc(['Файлы', ...(dirOf(i.p) ? dirOf(i.p).split('/') : [])].join(' › '))}</small></div>` +
    `<div class="dt">${i.m ? fmtDate(i.m) : ''}</div><div class="sz">${i.d ? '' : fmtSize(i.s)}</div>` +
    `<span class="fact">` + (i.d ? `<button data-z="${k}" title="Скачать папку (ZIP)">${ico('download')}</button>` : `<button data-dl="${k}" title="Скачать">${ico('download')}</button>`) +
    (grid ? '' : star(k)) + `</span>` +
    `<button class="icon more" title="Действия">${ico('kebab')}</button></div>`).join(''));
  favPanel._items = items;
}
$('#filter').addEventListener('input', () => { if (mode === 'fav') favDraw(); });
$('#viewBtn').addEventListener('click', () => { if (mode === 'fav') favDraw(); });
{
  const baseSelectSort = selectSort;
  selectSort = function (k) { baseSelectSort(k); if (mode === 'fav') favDraw(); };
}
function favHide() {
  if (favPanel.hidden) return;
  favPanel.hidden = true; navFav.classList.remove('active');
  // вернуть подсветку текущему разделу (как в load() из app.js)
  for (const [m, id] of [['files', 'navFiles'], ['photos', 'navPhotos'], ['trash', 'navTrash'], ['history', 'navHistory']]) { const n = $('#' + id); if (n) n.classList.toggle('active', m === mode); }
  updateFab();
}
navFav.addEventListener('click', e => {
  e.preventDefault(); e.stopPropagation();
  if (location.hash === '#fav') favShow(); else location.hash = '#fav';   // раздел в адресе: #fav переживает обновление страницы
});
// «Избранное» как отдельный раздел #fav (переопределяет load() из app.js)
{
  const baseLoad = load;
  load = async function () {
    if (location.hash !== '#fav') return baseLoad();
    mode = 'fav'; sel = new Set();
    document.body.className = 'mode-fav';
    ['#list', '#photos', '#trashv', '#histv', '#empty', '#cal', '#ptop', '#pbub'].forEach(x => { const n = $(x); if (n) n.hidden = true; });
    $('#topx').innerHTML = ''; $('#crumbs').innerHTML = '<a>Избранное</a>';
    document.title = 'Избранное — Диск';
    favPanel.hidden = false; qa('#side .navitem').forEach(n => n.classList.toggle('active', n === navFav));
    updateFab(); treeRender();
    await favShow();
  };
}
$('#side').addEventListener('click', e => { if (e.target.closest('a, .navitem') && !e.target.closest('#navFav')) favHide(); }, true);
addEventListener('hashchange', () => { if (location.hash !== '#fav') favHide(); });
favPanel.addEventListener('click', async e => {
  const items = favPanel._items || [], g = a => e.target.closest(`[${a}]`);
  let x;
  if ((x = g('data-u'))) { e.stopPropagation(); await favToggle(items[+x.dataset.u].p); return; }
  if ((x = g('data-z'))) { e.stopPropagation(); zipDownload(items[+x.dataset.z].p); return; }
  if ((x = g('data-dl'))) { e.stopPropagation(); dlFile(fileUrl(items[+x.dataset.dl].p, true)); return; }
  const row = e.target.closest('.frow');
  if (!row) { if (!e.target.closest('button, a, input') && window.SELX) SELX.clear('fav'); return; }   // пустое место — снять выбор
  const it = items[+row.dataset.k]; if (!it) return;
  if (e.target.closest('.more')) { e.stopPropagation(); favMenu(e, it); return; }
  // одинарный клик — выделение, двойной — открыть (как в «Файлах»)
  if (favTap(it.p)) { if (window.SELX) SELX.clear('fav'); favOpen(it); }
  else if (window.SELX) SELX.only('fav', it);
});
const favTap = dblTap();
(window.SECOPEN = window.SECOPEN || {}).fav = it => favOpen(it);
favPanel.addEventListener('contextmenu', e => {
  const row = e.target.closest('.frow'); if (!row || e.target.closest('.ck')) return;
  const it = (favPanel._items || [])[+row.dataset.k]; if (it) favMenu(e, it);
});
function favOpen(it) {
  if (it.d) { favHide(); location.hash = hashFor(it.p); return; }
  if (!canView(it.n)) return filePreview(it);
  // панель «Избранное» не закрываем: просмотрщик открывается поверх неё, после закрытия возвращаемся в «Избранное»
  vlist.length = 0; vlist.push({n: it.n, p: it.p, s: it.s}); vi = 0;
  $('#viewer').classList.add('overfav'); $('#viewer').hidden = false; showV();
}
const showInFolder = p => { location.hash = hashFor(dirOf(p)); };
// меню «⋮» / правой кнопки в «Избранном»: для выбранных, если объект среди них, иначе — для этого объекта
function favMenu(e, it) {
  const its = window.SELX ? SELX.targets('fav', it) : [it], n = its.length;
  if (n > 1) {
    favTarget = null;
    return popMenu(e, [
      [`Скачать (${n})`, () => SELX.dl(its), 'download'],
      '-',
      [`Убрать из избранного (${n})`, async () => { await api('fav_del', {items: its.map(i => i.p)}); SELX.clear('fav'); load(); }, 'starFill'],
    ]);
  }
  favTarget = {n: it.n, p: it.p, d: it.d};   // «Убрать из избранного» и «Поделиться» добавят общие обработчики меню
  popMenu(e, [
    [it.d ? 'Открыть папку' : 'Открыть', () => favOpen(it), 'eye'],
    ['Показать в папке', () => { favHide(); showInFolder(it.p); }, 'folder'],
    it.d ? ['Скачать папку (ZIP)', () => zipDownload(it.p), 'zip'] : ['Скачать', () => dlFile(fileUrl(it.p, true)), 'download'],
  ]);
}
// после закрытия просмотрщика, открытого из «Избранного», — обновить список (файл могли удалить, переименовать, переместить)
new MutationObserver(() => {
  const v = $('#viewer');
  if (v.hidden && v.classList.contains('overfav')) { v.classList.remove('overfav'); if (!favPanel.hidden) favShow(); }
}).observe($('#viewer'), {attributes: true, attributeFilter: ['hidden']});

{
  const baseUF = updateFab;
  updateFab = function () { baseUF(); if (!favPanel.hidden) fab.hidden = true; };
  const baseRender = render;
  render = function () { baseRender(); markFavs(); };
}
updateFab();
favLoad().then(markFavs);

/* ===== Выбор элементов чекбоксами + панель действий над выбранным ===== */
document.head.append(Object.assign(document.createElement('style'), {textContent: `
/* чекбокс: в списке — квадрат 20px слева от иконки; в плитке — в круглой подложке 32px в правом нижнем углу */
#list .row .ck { flex: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .12s; }
#list .row .ck .bx { width: 20px; height: 20px; border-radius: 5px; border: 2px solid #8e8e99; background: rgba(20, 20, 24, .55); box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; transition: background .12s, border-color .12s; }
#list .row .ck svg { width: 13px; height: 13px; opacity: 0; }
#list .row .ck:hover .bx { border-color: #fff; }
#list .row .ck[aria-checked=true] .bx { background: #0a84ff; border-color: #0a84ff; }
#list .row .ck[aria-checked=true] svg { opacity: 1; }
#list .row:hover .ck, #list .row .ck[aria-checked=true], #list.selon .row .ck { opacity: 1; }
#list:not(.grid) .row .ck { margin-right: -8px; }
#list.grid .row .ic > .ck { position: absolute; right: 4px; bottom: 4px; z-index: 3; width: 32px; height: 32px; border-radius: 50%; background: rgba(32, 32, 38, .82); }
#list.grid .row .ic > .ck .bx { width: 18px; height: 18px; }
#list.grid .row .ic.vid .pv { right: auto; bottom: auto; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 34px; height: 34px; }
#list.grid .row .ic.vid .pv .ic-svg { width: 16px; height: 16px; }
@media (hover: none) { #list .row .ck { opacity: 1; } }
#top.lockh { box-sizing: border-box; }
#selBar { display: none; align-items: center; gap: 4px; margin-left: auto; }
#top.selon #selBar { display: flex; }
#top.selon > #filter, #top.selon > #sort, #top.selon > #sortBtn, #top.selon > #viewBtn { display: none !important; }
#selBar .cnt { color: #cfcfd8; font-size: 14px; margin-right: 8px; white-space: nowrap; }
#selBar button { width: 38px; height: 38px; border: 0; border-radius: 10px; background: #2a2a31; color: #e6e6ea; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
#selBar button:hover { background: #35353d; color: #fff; }
#selBar button .ic-svg { width: 20px; height: 20px; }
#selBar button.all, .selbar2 button.all { color: #0a84ff; }
#selBar button.all:hover, .selbar2 button.all:hover { color: #3d9dff; }
#selBar button.danger { color: #ff6b6b; }
#selBar button.danger:hover { background: #4a2a2e; color: #ff8a8a; }
`}));
{
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const top = $('#top'), list = $('#list');
  const bar = document.createElement('div'); bar.id = 'selBar';
  bar.innerHTML = `<span class="cnt"></span>` +
    `<button data-sa="all" class="all" title="Выделить все (Ctrl+A)">${ico('selAll')}</button>` +
    `<button data-sa="dl" title="Скачать">${ico('download')}</button>` +
    `<button data-sa="move" title="Переместить">${ico('move')}</button>` +
    `<button data-sa="del" class="danger" title="Удалить">${ico('trash')}</button>` +
    `<button data-sa="cancel" title="Отменить выбор">${ico('close')}</button>`;
  top.append(bar);
  const cntTxt = n => { const a = n % 10, b = n % 100; return 'Выбрано: ' + n + ' ' + (a === 1 && b !== 11 ? 'объект' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'объекта' : 'объектов'); };

  let busy = false;
  function syncSel() {
    if (busy) return; busy = true;
    try {
      const on = mode === 'files' && favPanel.hidden && sel.size > 0;
      const grid = list.classList.contains('grid');
      if (on && !top.classList.contains('selon')) { top.style.height = top.offsetHeight + 'px'; top.classList.add('lockh'); }
      if (!on && top.classList.contains('selon')) { top.style.height = ''; top.classList.remove('lockh'); }
      list.classList.toggle('selon', on);
      top.classList.toggle('selon', on);
      if (on) bar.querySelector('.cnt').textContent = cntTxt(sel.size);
      if (mode !== 'files') return;
      if ([...list.querySelectorAll('.row[data-i]')].some(r => !r.querySelector('[data-fa=star]'))) { try { markFavs(); } catch (_) {} }
      list.querySelectorAll('.row[data-i]').forEach(r => {
        const it = L[+r.dataset.i]; if (!it) return;
        let ck = r.querySelector('.ck');
        const ic = r.querySelector('.ic');
        if (!ck) {
          ck = document.createElement('span'); ck.className = 'ck'; ck.setAttribute('role', 'checkbox'); ck.title = 'Выбрать'; ck.innerHTML = '<span class="bx">' + CHECK + '</span>';
        }
        if (grid && ic && ck.parentNode !== ic) ic.append(ck);
        else if (!grid && ic && ck.nextSibling !== ic) ic.before(ck);
        const v = sel.has(it.n) ? 'true' : 'false';
        if (ck.getAttribute('aria-checked') !== v) ck.setAttribute('aria-checked', v);
      });
    } finally { busy = false; }
  }
  let q = 0;
  const later = () => { if (!q) q = requestAnimationFrame(() => { q = 0; syncSel(); }); };
  new MutationObserver(later).observe(list, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
  addEventListener('hashchange', later);
  document.addEventListener('click', later);

  // клик по чекбоксу — только выбор, без открытия
  list.addEventListener('click', e => {
    const ck = e.target.closest('.ck'); if (!ck) return;
    e.stopPropagation(); e.preventDefault();
    const r = ck.closest('.row[data-i]'), it = r && L[+r.dataset.i]; if (!it) return;
    sel.has(it.n) ? sel.delete(it.n) : sel.add(it.n);
    markSel(); syncSel();
  }, true);
  list.addEventListener('contextmenu', e => { if (e.target.closest('.ck')) { e.preventDefault(); e.stopPropagation(); } }, true);

  const clearSel = () => { sel = new Set(); markSel(); syncSel(); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  bar.addEventListener('click', async e => {
    const b = e.target.closest('[data-sa]'); if (!b) return;
    e.stopPropagation();
    const ts = targetsOf(); if (!ts.length && b.dataset.sa !== 'cancel') return clearSel();
    switch (b.dataset.sa) {
      case 'dl':
        for (let i = 0; i < ts.length; i++) {
          if (i) await wait(700);
          if (ts[i].d) zipDownload(ts[i].p); else dlFile(fileUrl(ts[i].p, true));
        }
        break;
      case 'move': await doMove(ts); break;
      case 'del': await doDelete(ts); break;
      case 'cancel': clearSel(); break;
      case 'all':   // повторное нажатие, когда выбрано всё, — снять выбор (панель закрывается)
        if (L.length && L.every(i => sel.has(i.n))) clearSel();
        else { L.forEach(i => sel.add(i.n)); markSel(); syncSel(); }
        break;
    }
    later();
  });
}
} catch (err) { console.error('favorites addon failed:', err); }

/* ===== Просмотр Word (docx) и Excel (xlsx/xls/ods) в браузере =====
   Отключается в config.php: 'office_view' => false.
   Документ отрисовывается локальными библиотеками из vendor/ и показывается
   в iframe с sandbox — скрипты из документа не выполняются, стили не влияют на страницу. */
const OFFICE_ON = (document.querySelector('meta[name=office]') || {}).content !== '0';
const OFF_WORD = new Set(['docx', 'docm', 'dotx']);
const OFF_XLS = new Set(['xlsx', 'xlsm', 'xlsb', 'xls', 'ods']);
const OFF_MAX = 50 * 1024 * 1024;     // больше 50 МБ — не открываем, предлагаем скачать
const OFF_ROWS = 2000;                // строк на лист Excel
if (OFFICE_ON) [...OFF_WORD, ...OFF_XLS].forEach(e => TXT.add(e));  // чтобы клик открывал просмотрщик и работали ← →

document.head.append(Object.assign(document.createElement('style'), {textContent: `
#vbody .offv { width: 100%; height: 100%; display: flex; flex-direction: column; min-height: 0; }
#vbody .offv iframe { flex: 1; width: 100%; height: auto; min-height: 0; border: 0; border-radius: 8px; background: #fff; }
#vbody .offtabs { display: flex; gap: 4px; overflow-x: auto; padding: 0 0 8px; flex: none; }
#vbody .offtabs button { flex: none; border: 0; border-radius: 8px; padding: 6px 12px; background: #2a2a31; color: #cfcfd8; font-size: 13px; cursor: pointer; white-space: nowrap; }
#vbody .offtabs button:hover { background: #35353d; color: #fff; }
#vbody .offtabs button.on { background: #0a84ff; color: #fff; }
#vbody .offnote { color: #8e8e99; font-size: 13px; padding: 6px 2px 0; flex: none; }
#vbody .offmsg { color: #cfcfd8; text-align: center; font-size: 15px; line-height: 1.6; }
#vbody .offmsg a { color: #0a84ff; }
`}));

const loadJs = (() => {
  const done = {};
  return src => done[src] || (done[src] = new Promise((ok, bad) => {
    const s = document.createElement('script'); s.src = src;
    s.onload = ok; s.onerror = () => { delete done[src]; bad(new Error('Не удалось загрузить ' + src)); };
    document.head.append(s);
  }));
})();

const offFrame = (html, css) => {
  const f = document.createElement('iframe');
  f.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
  f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>${css || ''}</style></head><body>${html}</body></html>`;
  return f;
};
const OFF_XLS_CSS = `body{margin:0;font:13px/1.4 Calibri,Arial,sans-serif;color:#111;background:#fff}
table{border-collapse:collapse;margin:0}td,th{border:1px solid #d4d4d8;padding:3px 6px;white-space:nowrap;vertical-align:top}
tr:first-child td{background:#f3f4f6;font-weight:600;position:sticky;top:0}`;

async function showOffice(it, p, e, b, tok) {
  const msg = h => { b.innerHTML = `<div class="offmsg">${h}</div>`; };
  const dl = `<a href="${fileUrl(p, true)}">Скачать файл</a>`;
  if (it.s != null && it.s > OFF_MAX) return msg(`Файл слишком большой для просмотра в браузере (${fmtSize(it.s)}).<br>${dl}`);
  msg('Открываю документ…');
  try {
    const word = OFF_WORD.has(e);
    const libs = word ? ['vendor/jszip.min.js?v=3.10.2', 'vendor/docx-preview.min.js?v=0.4.1'] : ['vendor/xlsx.full.min.js?v=0.20.3'];
    for (const s of libs) await loadJs(s);
    const r = await fetch(fileUrl(p));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = await r.arrayBuffer();
    if (tok !== vTok) return;
    if (buf.byteLength > OFF_MAX) return msg(`Файл слишком большой для просмотра в браузере.<br>${dl}`);
    const box = document.createElement('div'); box.className = 'offv';

    if (word) {
      const tmp = document.createElement('div');
      tmp.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px';
      document.body.append(tmp);
      try {
        await docx.renderAsync(buf, tmp, tmp, {inWrapper: true, breakPages: true, ignoreLastRenderedPageBreak: true, useBase64URL: true, renderHeaders: true, renderFooters: true, renderFootnotes: true, renderEndnotes: true});
        if (tok !== vTok) return;
        box.append(offFrame(tmp.innerHTML, 'body{margin:0;background:#808080}'));
      } finally { tmp.remove(); }
    } else {
      const wb = XLSX.read(buf, {type: 'array', sheetRows: OFF_ROWS + 1, cellDates: true});
      if (tok !== vTok) return;
      const tabs = document.createElement('div'); tabs.className = 'offtabs';
      const note = document.createElement('div'); note.className = 'offnote';
      let frame = null;
      const show = i => {
        const ws = wb.Sheets[wb.SheetNames[i]];
        const html = ws && ws['!ref'] ? XLSX.utils.sheet_to_html(ws, {header: '', footer: ''}) : '<p style="padding:12px;color:#666">Лист пуст</p>';
        const f = offFrame(html, OFF_XLS_CSS);
        frame ? frame.replaceWith(f) : tabs.after(f); frame = f;
        tabs.querySelectorAll('button').forEach((x, k) => x.classList.toggle('on', k === i));
        const full = ws && ws['!fullref'], cut = full && full !== ws['!ref'];
        note.textContent = cut ? `Показаны первые ${OFF_ROWS} строк. Полностью — в Excel.` : '';
        note.hidden = !cut;
      };
      wb.SheetNames.forEach((n, i) => {
        const x = document.createElement('button'); x.textContent = n; x.onclick = () => show(i); tabs.append(x);
      });
      tabs.hidden = wb.SheetNames.length < 2;
      box.append(tabs);
      show(0);
      box.append(note);
    }
    b.innerHTML = ''; b.append(box);
  } catch (err) {
    console.error('office view', err);
    if (tok === vTok) msg(`Не удалось показать документ.<br>${dl}`);
  }
}

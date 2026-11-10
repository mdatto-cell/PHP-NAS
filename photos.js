const P = {items: [], groups: [], g: null, cur: null, loading: false, done: false, inited: false, startTs: null, months: [], req: 0, activeYm: null, topLoading: false, topDone: true};
const CAL = {y: 0, m: 0};
const MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

async function pApi(q) {
  const r = await fetch('photos.php?' + q);
  if (r.status === 401) { location = 'login.php'; throw 0; }
  const j = await r.json();
  if (!r.ok) { $('#pinfo').textContent = j.error || 'Ошибка'; throw j; }
  return j;
}
function showPhotos() {
  $('#photos').hidden = false;
  $('#crumbs').innerHTML = '<a>Фото</a>'; document.title = 'Фото — Диск';
  $('#topx').innerHTML = `<button class="icon" id="calBtn" title="Выбрать дату">${ico('calendar')}</button>`;
  $('#calBtn').onclick = e => { e.stopPropagation(); toggleCal(); };
  pTopBtn();
  if (!P.inited) { P.inited = true; pInit(); }
}

/* временная шкала: собственный «скроллбар» с подсказкой */
/* при наведении год под курсором «раздвигается»: месяцы с подписями, остальные годы сжимаются */
function railYearAt(y) {
  return [...document.querySelectorAll('#prail .ry')].find(r => { const b = r.getBoundingClientRect(); return y >= b.top && y < b.bottom; }) || null;
}
function railZoom(ry) {
  const rail = $('#prail'), all = [...rail.querySelectorAll('.ry')];
  all.forEach(r => { r.classList.remove('ex'); r.style.flex = `${r.dataset.w} 1 0`; });
  rail.classList.toggle('zoom', !!ry);
  if (!ry) return;
  const H = rail.clientHeight - 12, n = ry.querySelectorAll('.rm').length;
  const E = Math.min(H * 0.6, n * 22 + 26);
  const rest = all.reduce((a, r) => a + (r === ry ? 0 : +r.dataset.w), 0) || 1;
  ry.classList.add('ex'); ry.style.flex = `${rest * E / Math.max(1, H - E)} 1 0`;
}
function railPoint(y) {
  let ry = document.querySelector('#prail .ry.ex');
  if (!ry || (() => { const b = ry.getBoundingClientRect(); return y < b.top || y >= b.bottom; })()) {
    const r = railYearAt(y); if (r && r !== ry) { railZoom(r); ry = r; }
  }
  return railPick(y, ry);
}
function railPick(y, scope) {
  let best = null, bd = 1e9;
  (scope || document).querySelectorAll(scope ? 'b, .rm' : '#prail b, #prail .rm').forEach(el => {
    const r = el.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - y);
    if (d < bd) { bd = d; best = el; }
  });
  return best;
}
function railShow(el, y) {
  document.querySelectorAll('#prail .hov').forEach(x => x.classList.remove('hov'));
  const bub = $('#pbub');
  if (!el) { bub.hidden = true; return; }
  el.classList.add('hov');
  bub.textContent = el.dataset.label; bub.hidden = false;
  bub.style.top = Math.max(8, y - $('#main').getBoundingClientRect().top - 16) + 'px';
}
function railJump(el) {
  if (el.matches('b')) pJump(Date.UTC(+el.dataset.y + 1, 0, 1) / 1000);
  else { const [y, mo] = el.dataset.ym.split('-').map(Number); pJump(Date.UTC(y, mo, 1) / 1000); }
}
async function pInit() {
  const [st, months] = await Promise.all([pApi('a=status'), pApi('a=months')]);
  P.months = months;
  const when = st.scanned ? new Date(st.scanned * 1000).toLocaleString('ru-RU') : 'ещё не выполнялось';
  $('#pinfo').innerHTML = st.count ? `<span>${st.count.toLocaleString('ru-RU')} файлов · индекс обновлён: ${when}${st.running ? ' (идёт сканирование)' : ''}</span>`
    : `<span>Индекс пуст${st.running ? ' — идёт первое сканирование' : '. Запустите scan.php'}</span>`;
  pRail();
  const rail = $('#prail');
  let drag = false;
  rail.addEventListener('pointermove', e => railShow(railPoint(e.clientY), e.clientY));
  rail.addEventListener('pointerdown', e => { drag = true; rail.setPointerCapture(e.pointerId); railShow(railPoint(e.clientY), e.clientY); });
  rail.addEventListener('pointerup', e => { if (!drag) return; drag = false; const el = railPoint(e.clientY); railShow(null); if (el) railJump(el); if (!rail.matches(':hover')) railZoom(null); });
  rail.addEventListener('pointercancel', () => { drag = false; railShow(null); railZoom(null); });
  rail.addEventListener('pointerleave', () => { if (!drag) { railShow(null); railZoom(null); } });
  // «К новым»: если новые уже загружены — просто прокрутка вверх
  $('#ptop').onclick = () => { if (P.topDone) $('#photos').scrollTo({top: 0, behavior: 'smooth'}); else pReset(null); };
  const root = $('#photos');
  new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) pMore(); }, {root, rootMargin: '900px'}).observe($('#psent'));
  let raf = 0; root.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pActive(); pTopBtn(); if (root.scrollTop < 1500) pMoreTop(); }); });
  $('#pgrid').addEventListener('click', e => {
    const t = e.target.closest('.pt'); if (!t) return;
    openViewer(P.items[+t.dataset.i], P.items.filter(Boolean));
  });
  $('#pgrid').addEventListener('contextmenu', e => {
    const t = e.target.closest('.pt'); if (!t) return;
    const it = P.items[+t.dataset.i], tg = {p: it.p, n: it.n, d: false, it};
    popMenu(e, menuFor([tg], {
      noRename: true,
      open: x => openViewer(x.it, P.items.filter(Boolean)),
      before: [['Показать в папке', () => { location.hash = hashFor(dirOf(it.p)); }, 'folder']],
    }));
  });
  pMore();
}
function pRail() {
  const by = {};
  P.months.forEach(m => { const [y, mo] = m.ym.split('-'); (by[y] = by[y] || []).push({mo: +mo, c: m.c, ym: m.ym}); });
  $('#prail').innerHTML = Object.keys(by).sort((a, b) => b - a).map(y =>
    `<div class="ry" data-w="${by[y].length + 1}" style="flex:${by[y].length + 1} 1 0"><b data-y="${y}" data-label="${y}">${y}</b>` +
    by[y].map(m => `<i class="rm" data-ym="${m.ym}" data-s="${MONTHS[m.mo - 1].slice(0, 3)}" data-label="${cap(MONTHS[m.mo - 1])} ${y} · ${(+m.c).toLocaleString('ru-RU')}"></i>`).join('') + '</div>').join('');
}
function pActive() {
  const top = $('#photos').getBoundingClientRect().top + 70;
  const g = P.groups.find(g => g.section.getBoundingClientRect().bottom > top);
  if (!g || g.ym === P.activeYm) return;
  P.activeYm = g.ym;
  document.querySelectorAll('#prail .act').forEach(x => x.classList.remove('act'));
  const t = document.querySelector(`#prail .rm[data-ym="${g.ym}"]`); if (t) t.classList.add('act');
  const b = document.querySelector(`#prail b[data-y="${g.ym.slice(0, 4)}"]`); if (b) b.classList.add('act');
}
function pReset(ts) {
  P.req++; P.loading = false; P.done = false; P.items = []; P.groups = []; P.g = null; P.activeYm = null;
  P.startTs = ts; P.cur = ts ? {t: ts, id: 0} : null;
  P.topLoading = false; P.topDone = ts == null;   // после перехода к дате сверху догружаются более новые
  $('#pgrid').innerHTML = ''; $('#photos').scrollTop = 0; pTopBtn();
  pMore();
}
const pFirst = () => P.items.find(Boolean), pLast = () => { for (let i = P.items.length - 1; i >= 0; i--) if (P.items[i]) return P.items[i]; return null; };
function pTopBtn() { const r = $('#photos'); $('#ptop').hidden = P.topDone && r.scrollTop < 1500; }
// переход к дате: без фильтра — лента остаётся целой, прокрутка вверх и вниз показывает соседние периоды
function pJump(ts) {
  const f = pFirst(), l = pLast();
  if (f && (P.topDone || f.t >= ts) && (P.done || l.t < ts)) {   // нужный период уже загружен — просто прокрутить
    const i = P.items.findIndex(it => it && it.t < ts);
    const t = i >= 0 && $('#pgrid').querySelector(`.pt[data-i="${i}"]`);
    if (t) {
      const g = P.groups.find(g => g.grid.contains(t));
      const el = g && g.grid.firstElementChild === t ? g.section : t, root = $('#photos');
      root.scrollTop += el.getBoundingClientRect().top - root.getBoundingClientRect().top - 4;
      return;
    }
  }
  pReset(ts);
}
async function pMoreTop() {
  if (P.topLoading || P.topDone) return;
  const f = pFirst(); if (!f) return;
  P.topLoading = true; const tok = P.req;
  try {
    const j = await pApi(`a=timeline&limit=240&at=${f.t}&ai=${f.id}`);
    if (tok !== P.req) return;
    const asc = j.items, k = asc.length;
    if (k < 240) P.topDone = true;
    if (!k) return;
    const root = $('#photos'), h0 = root.scrollHeight, s0 = root.scrollTop;
    $('#pgrid').querySelectorAll('.pt').forEach(t => { t.dataset.i = +t.dataset.i + k; });
    P.items.unshift(...asc.slice().reverse());
    asc.forEach((it, j2) => pAddTop(it, k - 1 - j2));
    root.scrollTop = s0 + (root.scrollHeight - h0);   // видимое место не сдвигается
  } finally { if (tok === P.req) P.topLoading = false; }
  if (tok !== P.req) return;
  pTopBtn(); pActive();
  if ($('#photos').scrollTop < 1500) pMoreTop();
}
function pTile(it, idx) {
  const t = mk('div', 'pt'); t.dataset.i = idx;
  t.innerHTML = `<img loading="lazy" alt="" src="${thumbUrl(it, it.p, 320)}" onerror="this.style.visibility='hidden'">` + (it.k === 'v' ? `<span class="pv">${ico('play')}</span>` : '');
  return t;
}
function pAddTop(it, idx) {
  const d = new Date(it.t * 1000), ym = d.toISOString().slice(0, 7), day = d.getUTCDate();
  let g = P.groups[0];
  if (!g || g.ym !== ym) {
    g = {ym, min: day, max: day, section: mk('div', 'pgroup'), head: mk('div', 'pday'), grid: mk('div', 'pg')};
    g.section.append(g.head, g.grid); $('#pgrid').prepend(g.section); P.groups.unshift(g); if (!P.g) P.g = g;
  }
  g.min = Math.min(g.min, day); g.max = Math.max(g.max, day); pHead(g);
  g.grid.prepend(pTile(it, idx));
}
const pRefresh = () => pReset(P.startTs);

async function pMore() {
  if (P.loading || P.done) return;
  P.loading = true; const tok = P.req;
  try {
    const j = await pApi('a=timeline&limit=240' + (P.cur ? `&bt=${P.cur.t}&bi=${P.cur.id}` : ''));
    if (tok !== P.req) return;
    j.items.forEach(pAdd);
    if (j.items.length) { const l = j.items[j.items.length - 1]; P.cur = {t: l.t, id: l.id}; }
    if (j.items.length < 240) P.done = true;
    if (!P.items.length) $('#pgrid').innerHTML = '<div class="tinfo">Нет фото за этот период</div>';
  } finally { if (tok === P.req) P.loading = false; }
  if (tok !== P.req) return;
  const s = $('#psent').getBoundingClientRect(), r = $('#photos').getBoundingClientRect();
  if (!P.done && s.top < r.bottom + 900) pMore();
  pActive();
  pMoreTop();
}
function pHead(g) {
  const [y, m] = g.ym.split('-').map(Number), cy = new Date().getUTCFullYear();
  const f = d => new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', timeZone: 'UTC'});
  const mn = f(1).replace(/^\d+\s/, '');
  g.head.textContent = (g.min === g.max ? f(g.min) : `${g.min} - ${g.max} ${mn}`) + (y !== cy ? ` ${y}` : '');
}
function pAdd(it) {
  const idx = P.items.push(it) - 1, d = new Date(it.t * 1000), ym = d.toISOString().slice(0, 7), day = d.getUTCDate();
  let g = P.g;
  if (!g || g.ym !== ym) {
    g = {ym, min: day, max: day, section: mk('div', 'pgroup'), head: mk('div', 'pday'), grid: mk('div', 'pg')};
    g.section.append(g.head, g.grid); $('#pgrid').append(g.section); P.groups.push(g); P.g = g;
  }
  g.min = Math.min(g.min, day); g.max = Math.max(g.max, day); pHead(g);
  g.grid.append(pTile(it, idx));
}
function pRemove(paths) {
  P.items.forEach((it, i) => {
    if (it && paths.has(it.p)) { P.items[i] = null; const t = $('#pgrid').querySelector(`.pt[data-i="${i}"]`); if (t) t.remove(); }
  });
  P.groups = P.groups.filter(g => { if (!g.grid.children.length) { g.section.remove(); return false; } return true; });
  if (P.g && !P.groups.includes(P.g)) P.g = P.groups[P.groups.length - 1] || null;
}

/* ---------- календарь ---------- */
function toggleCal() {
  const c = $('#cal');
  if (!c.hidden) { c.hidden = true; return; }
  const ym = P.activeYm || (P.months[0] && P.months[0].ym) || new Date().toISOString().slice(0, 7);
  [CAL.y, CAL.m] = ym.split('-').map(Number);
  c.hidden = false; drawCal();
}
async function drawCal() {
  const c = $('#cal'), {y, m} = CAL;
  let days = {};
  try { days = (await pApi('a=days&ym=' + y + '-' + String(m).padStart(2, '0'))).days; } catch (e) {}
  const years = [...new Set(P.months.map(x => +x.ym.slice(0, 4)).concat([y]))].sort((a, b) => b - a);
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate(), off = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  let h = `<div class="calh"><button data-nav="-1">${ico('chevL')}</button>` +
    `<select data-sel="m">${MONTHS.map((n, i) => `<option value="${i + 1}"${i + 1 === m ? ' selected' : ''}>${cap(n)}</option>`).join('')}</select>` +
    `<select data-sel="y">${years.map(v => `<option${v === y ? ' selected' : ''}>${v}</option>`).join('')}</select>` +
    `<button data-nav="1">${ico('chevR')}</button></div><div class="calg">` + ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => `<span>${d}</span>`).join('');
  for (let i = 0; i < off; i++) h += '<span></span>';
  for (let d = 1; d <= dim; d++) h += `<button data-day="${d}"${days[d] ? ` class="has" title="${days[d]} шт."` : ''}>${d}</button>`;
  c.innerHTML = h + '</div>';
}
$('#cal').addEventListener('click', e => {
  e.stopPropagation();
  const nb = e.target.closest('[data-nav]'), db = e.target.closest('[data-day]');
  if (nb) { CAL.m += +nb.dataset.nav; if (CAL.m < 1) { CAL.m = 12; CAL.y--; } if (CAL.m > 12) { CAL.m = 1; CAL.y++; } drawCal(); }
  if (db) { pJump(Date.UTC(CAL.y, CAL.m - 1, +db.dataset.day + 1) / 1000); $('#cal').hidden = true; }
});
$('#cal').addEventListener('change', e => {
  if (e.target.dataset.sel === 'm') CAL.m = +e.target.value;
  if (e.target.dataset.sel === 'y') CAL.y = +e.target.value;
  drawCal();
});
document.addEventListener('click', e => { if (!e.target.closest('#cal') && !e.target.closest('#calBtn')) $('#cal').hidden = true; });

const SV = b => `<svg class="ic-svg" viewBox="0 0 24 24" aria-hidden="true">${b}</svg>`;
const DOT = (y) => `<circle cx="12" cy="${y}" r="1.8" fill="currentColor" stroke="none"/>`;
const IC = {
  upload:  SV('<path d="M12 15V4m0 0L8 8m4-4 4 4M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
  plus:    SV('<path d="M12 5v14M5 12h14"/>'),
  folder:  SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  photo:   SV('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'),
  trash:   SV('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
  history: SV('<path d="M4 12a8 8 0 1 0 2.5-5.8L4 8"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/>'),
  logout:  SV('<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>'),
  eye:     SV('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  download:SV('<path d="M12 4v11m0 0-4-4m4 4 4-4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
  rename:  SV('<path d="M3 18l4-11 4 11M4.5 14h5M16 5v14M13.5 5h5M13.5 19h5"/>'),
  move:    SV('<path d="M13 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4"/><path d="M14 4h6v6M20 4l-9 9"/>'),
  copy:    SV('<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1"/>'),
  restore: SV('<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 10h-3"/>'),
  flame:   SV('<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.200 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>'),
  calendar:SV('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/>'),
  grid:    SV('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  list:    SV('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
  menu:    SV('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close:   SV('<path d="M6 6l12 12M18 6 6 18"/>'),
  chevL:   SV('<path d="M15 5l-7 7 7 7"/>'),
  chevR:   SV('<path d="M9 5l7 7-7 7"/>'),
  up:      SV('<path d="M5 15l7-7 7 7"/>'),
  kebab:   SV(DOT(5) + DOT(12) + DOT(19)),
  play:    SV('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>'),
};
const ico = n => IC[n] || '';

const FILE = (c, g = '') => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 4h17l9 9v29a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="${c}"/><path d="M29 4l9 9h-7a2 2 0 0 1-2-2z" fill="#fff" opacity=".4"/>${g}</svg>`;
const FILEGLYPH = {
  doc:   FILE('#7d8aa5', '<path d="M17 24h14M17 29h14M17 34h9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>'),
  image: FILE('#4fa36b', '<circle cx="20" cy="26" r="2.4" fill="#fff"/><path d="M14 38l7-7 5 5 4-4 4 6z" fill="#fff" opacity=".9"/>'),
  video: FILE('#7a5cd6', '<path d="M20 22l10 6-10 6z" fill="#fff"/>'),
  audio: FILE('#d6704f', '<path d="M27 21v11" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="23.800" cy="32.500" r="3.300" fill="#fff"/><path d="M27 21l4 2" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'),
  pdf:   FILE('#d9473f', '<text x="24" y="34" font-size="10" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700">PDF</text>'),
};
const FOLDER = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 12a4 4 0 0 1 4-4h11l4 4h17a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#e8a923"/><path d="M4 19a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ffd45e"/></svg>';
// папка-ссылка (mklink /D) — та же папка со значком «планета Земля» (шара) на передней стороне
const FOLDER_LNK = FOLDER.replace('</svg>', '<g fill="none" stroke="#9a6a06" stroke-width="1.9" stroke-linecap="round"><circle cx="24" cy="29" r="8.6"/><ellipse cx="24" cy="29" rx="3.6" ry="8.6"/><path d="M15.4 29h17.2M16.6 24.6h14.8M16.6 33.4h14.8"/></g></svg>');
const fileSvg = k => FILEGLYPH[k] || FILEGLYPH.doc;
document.querySelectorAll('[data-i]').forEach(e => { e.innerHTML = ico(e.dataset.i); });

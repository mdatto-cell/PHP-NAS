<?php
declare(strict_types=1);
// Публичное скачивание по ссылке «Поделиться» — без входа в систему.
// Ссылка: share.php?t=<токен>. Обычный GET показывает страницу с кнопкой «Скачать»
// (превью ссылок в мессенджерах не «съедают» одноразовую ссылку), скачивание — &dl=1.
// Для отдельного DocumentRoot (внешний доступ) достаточно заглушки из папки share-public:
//   <?php require 'H:/www/files/share.php';
require __DIR__ . '/lib.php';
require __DIR__ . '/fslib.php';
set_time_limit(0);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function sh_h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function sh_size(int $b): string {
    $u = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']; $i = 0; $v = (float)$b;
    while ($v >= 1024 && $i < count($u) - 1) { $v /= 1024; $i++; }
    return ($i ? number_format($v, $v < 10 ? 1 : 0, ',', ' ') : (string)$b) . ' ' . $u[$i];
}
function sh_name(string $n): string {
    return "attachment; filename=\"" . str_replace(['"', '\\', "\r", "\n"], '_', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $n) ?: 'download')
         . "\"; filename*=UTF-8''" . rawurlencode($n);
}
function sh_page(int $code, string $title, string $body): never {
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    echo '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         '<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>', sh_h($title), '</title><style>',
         'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1c1c21;color:#e6e6ea;',
         'font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}',
         '.c{width:min(420px,calc(100% - 32px));background:#26262d;border-radius:18px;padding:28px 24px;text-align:center;box-sizing:border-box}',
         '.i{width:72px;height:72px;margin:0 auto 14px;color:#8fb8ff}.i svg{width:100%;height:100%}',
         'h1{font-size:18px;font-weight:600;margin:0 0 6px;word-break:break-word}',
         '.m{color:#9a9aa6;font-size:13px;margin:0 0 18px}.n{color:#9a9aa6;font-size:13px;margin:14px 0 0}',
         '.b{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 26px;border-radius:12px;',
         'background:#0a84ff;color:#fff;text-decoration:none;font-weight:600}.b:hover{background:#2b95ff}.b svg{width:20px;height:20px}',
         '</style></head><body><div class="c">', $body, '</div></body></html>';
    exit;
}
function sh_gone(): never {
    sh_page(404, 'Ссылка недействительна',
        '<div class="i" style="color:#ff6b6b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg></div>' .
        '<h1>Ссылка недействительна</h1><p class="m">Доступ к файлу закрыт, ссылка одноразовая и уже использована, или в ней ошибка.</p>');
}
function sh_zip_walk(ZipArchive $zip, string $dir, string $prefix, int $depth, int &$count): void {
    if ($depth > 40) return;
    $entries = scandir($dir) ?: [];
    if (count($entries) <= 2) { $zip->addEmptyDir(rtrim($prefix, '/')); return; }
    foreach ($entries as $n) {
        if ($n === '.' || $n === '..' || is_hidden($n)) continue;
        $f = $dir . '\\' . $n;
        if (is_link($f)) continue;
        if (is_dir($f)) sh_zip_walk($zip, $f, $prefix . $n . '/', $depth + 1, $count);
        elseif (is_file($f) && $zip->addFile($f, $prefix . $n)) { $zip->setCompressionName($prefix . $n, ZipArchive::CM_STORE); $count++; }
    }
}

if (cfg('share') !== true) sh_gone();
$t = $_GET['t'] ?? '';
if (!is_string($t) || !preg_match('/^[a-f0-9]{32}$/', $t)) sh_gone();

$db = app_db();
$s = $db->prepare('SELECT * FROM share WHERE token = ?'); $s->execute([$t]);
$row = $s->fetch(PDO::FETCH_ASSOC);
if (!$row) sh_gone();
try { [$full, $rel] = resolve((string)$row['path']); }
catch (Throwable $e) { $db->prepare('DELETE FROM share WHERE token = ?')->execute([$t]); sh_gone(); }

$isDir = is_dir($full);
$once = (bool)$row['once'];
$name = basename($full);

/* ---------- страница с кнопкой «Скачать» ---------- */
if (!isset($_GET['dl'])) {
    $svg = $isDir
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/></svg>';
    $meta = $isDir ? 'Папка — будет скачана ZIP-архивом' : sh_size((int)@filesize($full));
    $note = ($once ? 'Ссылка одноразовая: после скачивания она перестанет работать.' : '')
          . ($isDir ? ($once ? '<br>' : '') . 'Подготовка архива большой папки может занять некоторое время.' : '');
    sh_page(200, $name,
        '<div class="i">' . $svg . '</div><h1>' . sh_h($name) . '</h1><p class="m">' . sh_h($meta) . '</p>' .
        '<a class="b" href="?t=' . $t . '&amp;dl=1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>Скачать</a>' .
        ($note !== '' ? '<p class="n">' . $note . '</p>' : ''));
}

/* ---------- скачивание ---------- */
if ($isDir) {
    if (!class_exists('ZipArchive')) sh_page(500, 'Ошибка', '<h1>Ошибка сервера</h1><p class="m">В PHP не включено расширение zip.</p>');
    $tmpdir = cfg('data') . '\\tmp'; ensure_dir($tmpdir);
    $send = tempnam($tmpdir, 'shz');
    if ($send === false) sh_page(500, 'Ошибка', '<h1>Ошибка сервера</h1><p class="m">Нет доступа к папке временных файлов.</p>');
    register_shutdown_function(function () use ($send) { if (is_file($send)) @unlink($send); });
    $zip = new ZipArchive();
    if ($zip->open($send, ZipArchive::OVERWRITE) !== true) sh_page(500, 'Ошибка', '<h1>Не удалось создать архив</h1>');
    $count = 0;
    sh_zip_walk($zip, $full, $name . '/', 0, $count);
    if ($count === 0) $zip->addEmptyDir($name);
    if (!$zip->close()) sh_page(500, 'Ошибка', '<h1>Не удалось завершить архив</h1>');
    $fname = $name . '.zip'; $ctype = 'application/zip'; $ranges = false;
} else {
    $send = $full; $fname = $name; $ctype = 'application/octet-stream';
    $ranges = !$once;   // докачка — только для постоянных ссылок
}
clearstatcache();
$size = (int)filesize($send);
$start = 0; $end = $size - 1;
if ($ranges && $size > 0 && isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', (string)$_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] === '') { $start = max(0, $size - (int)$m[2]); }
    else { $start = (int)$m[1]; if ($m[2] !== '') $end = min($end, (int)$m[2]); }
    if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
    http_response_code(206);
    header("Content-Range: bytes $start-$end/$size");
}
header('Content-Type: ' . $ctype);
header('Content-Length: ' . ($size ? $end - $start + 1 : 0));
header('Content-Disposition: ' . sh_name($fname));
header('Accept-Ranges: ' . ($ranges ? 'bytes' : 'none'));
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') exit;   // HEAD не считается скачиванием

while (ob_get_level()) ob_end_clean();
ignore_user_abort(true);   // при обрыве дорабатываем сами: ссылку не удаляем, скачивание не засчитываем
$fh = fopen($send, 'rb');
if ($fh === false) exit;
fseek($fh, $start);
$left = $size ? $end - $start + 1 : 0;
while ($left > 0 && !feof($fh)) {
    $chunk = fread($fh, (int)min(1048576, $left));
    if ($chunk === false || $chunk === '') break;
    echo $chunk; flush();
    $left -= strlen($chunk);
    if (connection_aborted()) break;
}
fclose($fh);

// засчитываем только полностью отданный файл (для докачки — когда отдан последний кусок)
if ($left === 0 && !connection_aborted() && $end === $size - 1) {
    if ($once) $db->prepare('DELETE FROM share WHERE token = ?')->execute([$t]);
    else $db->prepare('UPDATE share SET hits = hits + 1, last = ? WHERE token = ?')->execute([time(), $t]);
    ev('share_dl', $rel, '', $name, $isDir ? 'd' : 'f');
}

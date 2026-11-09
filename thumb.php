<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/thumblib.php';
boot('raw');
// ?p=путь — превью файла (создаётся при необходимости); &c=1 — только из кэша, без создания (404, если превью ещё нет)
// ?t=имя объекта в корзине — превью удалённого файла, только из кэша
$tid = (string)($_GET['t'] ?? '');
if ($tid !== '') {
    require_once __DIR__ . '/fslib.php';
    if (!valid_tid($tid)) { http_response_code(404); exit; }
    $full = trash_dir() . '\\' . $tid; $cacheOnly = true;
} else {
    try { [$full] = resolve((string)($_GET['p'] ?? '')); } catch (RuntimeException $e) { http_response_code(404); exit; }
    $cacheOnly = !empty($_GET['c']);
}
if (!is_file($full)) { http_response_code(404); exit; }
session_write_close();
set_time_limit(0);

$w = ((int)($_GET['w'] ?? 320)) >= 1000 ? 1600 : 320;
if ($cacheOnly) {
    $info = thumb_info($full, $w);
    $out = ($info && is_file($info[1])) ? $info[1] : null;
} else $out = thumb_make($full, $w);
if (!$out) { http_response_code(404); exit; }
header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($out));
header('Cache-Control: private, max-age=31536000, immutable');
readfile($out);

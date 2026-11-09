<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/thumblib.php';
boot('raw');
try { [$full] = resolve((string)($_GET['p'] ?? '')); } catch (RuntimeException $e) { http_response_code(404); exit; }
if (!is_file($full)) { http_response_code(404); exit; }
session_write_close();
set_time_limit(0);

$w = ((int)($_GET['w'] ?? 320)) >= 1000 ? 1600 : 320;
$out = thumb_make($full, $w);
if (!$out) { http_response_code(404); exit; }
header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($out));
header('Cache-Control: private, max-age=31536000, immutable');
readfile($out);

<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/fslib.php';
boot('raw');
try { [$full, $rel] = resolve((string)($_GET['p'] ?? '')); } catch (RuntimeException $e) { http_response_code(404); exit; }
if (!is_file($full)) { http_response_code(404); exit; }
session_write_close();
set_time_limit(0);
while (ob_get_level()) ob_end_clean();

$name = basename($full);
$mime = mime_of($name);
$inline_ok = !isset($_GET['dl']) && preg_match('#^(image/(jpeg|png|gif|webp|avif|bmp)|video/|audio/|application/pdf|text/plain)#', $mime);
$size = filesize($full);
$start = 0; $end = $size - 1;
if ($size > 0 && isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] === '') { $start = max(0, $size - (int)$m[2]); }
    else { $start = (int)$m[1]; if ($m[2] !== '') $end = min($end, (int)$m[2]); }
    if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
    http_response_code(206);
    header("Content-Range: bytes $start-$end/$size");
}
if (isset($_GET['dl']) && $start === 0) ev('download', $rel, '', $name, 'f');
header('Accept-Ranges: bytes');
header('Content-Type: ' . ($inline_ok ? $mime : 'application/octet-stream'));
header('Content-Length: ' . ($size ? $end - $start + 1 : 0));
header('Content-Disposition: ' . ($inline_ok ? 'inline' : 'attachment') . "; filename*=UTF-8''" . rawurlencode($name));
header("Content-Security-Policy: sandbox; default-src 'none'; img-src 'self'; media-src 'self'");
header('Cache-Control: private, max-age=3600');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($full)) . ' GMT');
$fh = fopen($full, 'rb');
fseek($fh, $start);
$left = $end - $start + 1;
while ($left > 0 && !feof($fh) && !connection_aborted()) {
    $chunk = fread($fh, (int)min(1048576, $left));
    if ($chunk === false || $chunk === '') break;
    echo $chunk; $left -= strlen($chunk);
    flush();
}
fclose($fh);

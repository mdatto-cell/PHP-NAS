<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/fslib.php';
boot('raw');
set_time_limit(0);
ignore_user_abort(false);

function dl_fail(int $code, string $msg): never { http_response_code($code); header('Content-Type: text/plain; charset=utf-8'); echo $msg; exit; }
function dl_name(string $n): string { return "attachment; filename=\"" . str_replace(['"', '\\', "\r", "\n"], '_', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $n) ?: 'download') . "\"; filename*=UTF-8''" . rawurlencode($n); }

try { [$full, $rel] = resolve((string)($_GET['p'] ?? '')); }
catch (Throwable $e) { dl_fail(404, 'Не найдено'); }

if (is_file($full)) {
    header('Content-Type: application/octet-stream');
    header('Content-Length: ' . filesize($full));
    header('Content-Disposition: ' . dl_name(basename($full)));
    session_write_close();
    readfile($full);
    exit;
}
if (!class_exists('ZipArchive')) dl_fail(500, 'В PHP не включено расширение zip (extension=zip в php.ini)');

$name = ($rel === '' ? 'Файлы' : basename($full));
$tmpdir = cfg('data') . DS . 'tmp'; ensure_dir($tmpdir);
$tmp = tempnam($tmpdir, 'zip');
if ($tmp === false) dl_fail(500, 'Нет доступа к папке временных файлов');
// удалить архив при любом завершении: успех, ошибка, обрыв скачивания клиентом
register_shutdown_function(function () use ($tmp) { if (is_file($tmp)) @unlink($tmp); });
$zip = new ZipArchive();
if ($zip->open($tmp, ZipArchive::OVERWRITE) !== true) dl_fail(500, 'Не удалось создать архив');
session_write_close();

$count = 0;
function zip_walk(ZipArchive $zip, string $dir, string $prefix, int $depth, int &$count): void {
    if ($depth > 40) return;
    $entries = scandir($dir) ?: [];
    if (count($entries) <= 2) { $zip->addEmptyDir(rtrim($prefix, '/')); return; }
    foreach ($entries as $n) {
        if ($n === '.' || $n === '..' || is_hidden($n)) continue;
        $f = $dir . DS . $n;
        if (is_link($f)) continue;
        if (is_dir($f)) { zip_walk($zip, $f, $prefix . $n . '/', $depth + 1, $count); }
        elseif (is_file($f)) {
            if ($zip->addFile($f, $prefix . $n)) { $zip->setCompressionName($prefix . $n, ZipArchive::CM_STORE); $count++; }
        }
    }
}
zip_walk($zip, $full, $name . '/', 0, $count);
if (!$zip->close()) dl_fail(500, 'Не удалось завершить архив');

ev('download', $rel, '', $name, 'd');
header('Content-Type: application/zip');
header('Content-Length: ' . filesize($tmp));
header('Content-Disposition: ' . dl_name($name . '.zip'));
header('Cache-Control: no-store');
while (ob_get_level()) ob_end_clean();
readfile($tmp);

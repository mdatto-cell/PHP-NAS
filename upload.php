<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/fslib.php';
boot('json'); need_csrf();
set_time_limit(0);
try {
    [$dir, $drel] = resolve((string)($_GET['p'] ?? ''));
    if (!is_dir($dir)) json_out(['error' => 'not a dir'], 400);
    $f = $_FILES['f'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'upload error ' . ($f['error'] ?? '?')], 400);
    $name = basename(str_replace('\\', '/', (string)$f['name']));
    $name = trim(preg_replace('/[<>:"|?*\x00-\x1f\\\\\/]/u', '_', $name), ' .');
    if ($name === '' || is_hidden($name)) $name = 'file_' . time();
    $t = unique_path($dir, $name, false);
    if (!move_uploaded_file($f['tmp_name'], $t)) json_out(['error' => 'move failed'], 500);
    ev('upload', rel_of($t), '', basename($t), 'f');
    json_out(['ok' => true, 'name' => basename($t)]);
} catch (RuntimeException $e) { json_out(['error' => $e->getMessage()], 404); }

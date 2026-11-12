<?php
// Фоновый сканер: php scan.php
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require __DIR__ . '/lib.php';
require __DIR__ . '/photos_lib.php';
set_time_limit(0);
ini_set('memory_limit', '512M');

$lockf = fopen(cfg('data') . DS . 'scan.lock', 'c');
if (!$lockf || !flock($lockf, LOCK_EX | LOCK_NB)) { echo "Уже запущен\n"; exit(0); }

$IMG = ['jpg','jpeg','png','gif','webp','heic','heif','avif','tif','tiff','bmp'];
$VID = ['mp4','mov','m4v','webm','mkv','avi'];
$exclude  = array_flip(array_map('strtolower', (array)(cfg('photo_exclude') ?? [])));
$minSize  = (int)(cfg('photo_min_size') ?? 30720);
$heicExif = (bool)(cfg('heic_exif') ?? true);
$magick   = (string)cfg('magick');

function taken_of(string $f, string $e, string $n, int $mt, bool $heicExif, string $magick): int {
    $str = null;
    if (in_array($e, ['jpg','jpeg','tif','tiff'], true) && function_exists('exif_read_data')) {
        $x = @exif_read_data($f, 'EXIF', false);
        $str = $x['DateTimeOriginal'] ?? $x['DateTimeDigitized'] ?? null;
    } elseif (in_array($e, ['heic','heif'], true) && $heicExif && $magick !== '' && is_file($magick)) {
        $str = run_capture([$magick, 'identify', '-ping', '-format', '%[EXIF:DateTimeOriginal]', 'heic:-'], $f, 30);
    }
    if (is_string($str) && preg_match('/^(\d{4}):(\d\d):(\d\d)[ T](\d\d):(\d\d):(\d\d)/', $str, $m) && (int)$m[1] > 1970) {
        $t = gmmktime((int)$m[4], (int)$m[5], (int)$m[6], (int)$m[2], (int)$m[3], (int)$m[1]);
        if ($t !== false && $t < time() + 86400 * 2) return $t;
    }
    if (preg_match('/(?<!\d)((?:19|20)\d{2})[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])(?:[-_ T]?([01]\d|2[0-3])([0-5]\d)([0-5]\d))?/', $n, $m)) {
        $t = gmmktime((int)($m[4] ?? 0), (int)($m[5] ?? 0), (int)($m[6] ?? 0), (int)$m[2], (int)$m[3], (int)$m[1]);
        if ($t !== false && $t < time() + 86400 * 2) return $t;
    }
    return $mt + (int)date('Z', $mt);
}

$db = photos_db();
$scan = time();
meta_set($db, 'scan_running', '1');
$rootLen = strlen(root()) + 1;

$starts = [];
$only = (array)(cfg('photo_dirs') ?? []);
if ($only) { foreach ($only as $d) { try { [$p] = resolve((string)$d); $starts[] = $p; } catch (Throwable $e) { echo "Пропуск photo_dirs: $d\n"; } } }
else $starts[] = root();

$same = $db->prepare('UPDATE media SET seen=? WHERE path=? AND size=? AND mtime=?');
$ups  = $db->prepare('INSERT INTO media(path,name,kind,size,mtime,taken,seen) VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(path) DO UPDATE SET name=excluded.name,kind=excluded.kind,size=excluded.size,mtime=excluded.mtime,taken=excluded.taken,seen=excluded.seen');
$keep = $db->prepare("UPDATE media SET seen=? WHERE path LIKE ? ESCAPE '\\'");

$stack = $starts; $n = 0; $new = 0; $errors = 0; $t0 = microtime(true);
$db->beginTransaction();
while ($stack) {
    $dir = array_pop($stack);
    $names = @scandir($dir);
    if ($names === false) {
        $errors++; echo "Нет доступа: $dir\n";
        $rel = str_replace(DS, '/', substr($dir, $rootLen));
        $keep->execute([$scan, addcslashes($rel, '%_\\') . '/%']);
        continue;
    }
    foreach ($names as $name) {
        if ($name === '.' || $name === '..' || is_hidden($name) || isset($exclude[strtolower($name)])) continue;
        $f = $dir . DS . $name;
        if (is_link($f)) continue;
        if (is_dir($f)) { $stack[] = $f; continue; }
        $e = ext_of($name);
        $kind = in_array($e, $IMG, true) ? 'i' : (in_array($e, $VID, true) ? 'v' : null);
        if (!$kind) continue;
        $size = (int)@filesize($f); $mt = (int)@filemtime($f);
        if ($kind === 'i' && $size < $minSize) continue;
        $rel = str_replace(DS, '/', substr($f, $rootLen));
        $same->execute([$scan, $rel, $size, $mt]);
        if ($same->rowCount() === 0) {
            $ups->execute([$rel, $name, $kind, $size, $mt, taken_of($f, $e, $name, $mt, $heicExif, $magick), $scan]);
            $new++;
        }
        if (++$n % 500 === 0) {
            $db->commit(); $db->beginTransaction();
            meta_set($db, 'scan_progress', (string)$n);
            if ($n % 2000 === 0) printf("[%s] %d файлов, новых/изменённых %d\n", date('H:i:s'), $n, $new);
        }
    }
}
$db->commit();
$del = $db->prepare('DELETE FROM media WHERE seen<>?'); $del->execute([$scan]);
meta_set($db, 'scan_finished', (string)time());
meta_set($db, 'scan_running', '0');
printf("Готово: %d файлов, новых/изменённых %d, удалено из индекса %d, ошибок %d, %.0f c\n",
    $n, $new, $del->rowCount(), $errors, microtime(true) - $t0);

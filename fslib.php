<?php
declare(strict_types=1);
require_once __DIR__ . '/photos_lib.php';

// Основная БД сайта (main.sqlite): История, Корзина, Избранное.
// Индекс галереи хранится отдельно в photos.sqlite (photos_db() в photos_lib.php)
// и может удаляться/пересоздаваться без потери этих данных.
function app_db(): PDO {
    static $db = null;
    if ($db === null) {
        $dir = (string)cfg('data'); ensure_dir($dir);
        $db = new PDO('sqlite:' . $dir . '\\main.sqlite');
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec('PRAGMA busy_timeout=15000');
        $db->exec('PRAGMA journal_mode=WAL');
        $db->exec('PRAGMA synchronous=NORMAL');
        $db->exec('CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, ts INTEGER NOT NULL, user TEXT, act TEXT NOT NULL,
            path TEXT, path2 TEXT, name TEXT, kind TEXT, n INTEGER NOT NULL DEFAULT 1, dev TEXT, ip TEXT)');
        $db->exec('CREATE TABLE IF NOT EXISTS trash(tname TEXT PRIMARY KEY, orig TEXT, name TEXT, dir INTEGER, size INTEGER, ts INTEGER, user TEXT)');
        $db->exec('CREATE TABLE IF NOT EXISTS fav(path TEXT PRIMARY KEY, dir INTEGER NOT NULL DEFAULT 0, user TEXT, ts INTEGER NOT NULL)');
        // «Общий доступ»: одна ссылка на объект; once=1 — одноразовая (удаляется после успешного скачивания)
        $db->exec('CREATE TABLE IF NOT EXISTS share(token TEXT PRIMARY KEY, path TEXT NOT NULL UNIQUE, dir INTEGER NOT NULL DEFAULT 0,
            once INTEGER NOT NULL DEFAULT 1, user TEXT, ts INTEGER NOT NULL, hits INTEGER NOT NULL DEFAULT 0, last INTEGER)');
    }
    return $db;
}
// Индекс галереи (photos.sqlite), одно соединение на запрос
function media_db(): PDO {
    static $db = null;
    if ($db === null) $db = photos_db();
    return $db;
}
function device(): string {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    foreach (['iPhone' => 'iPhone', 'iPad' => 'iPad', 'Android' => 'Android', 'Windows' => 'Windows', 'Macintosh' => 'Mac', 'Linux' => 'Linux'] as $k => $v)
        if (stripos($ua, $k) !== false) return $v;
    return $ua === '' ? 'Сервер' : 'Браузер';
}
function ev(string $act, string $path = '', string $path2 = '', string $name = '', string $kind = 'f', int $n = 1): void {
    try {
        app_db()->prepare('INSERT INTO events(ts,user,act,path,path2,name,kind,n,dev,ip) VALUES(?,?,?,?,?,?,?,?,?,?)')
            ->execute([time(), $_SESSION['u'] ?? '', $act, $path, $path2, $name, $kind, $n, device(), $_SERVER['REMOTE_ADDR'] ?? '']);
    } catch (Throwable $e) { error_log('ev: ' . $e->getMessage()); }
}
function like_esc(string $s): string { return addcslashes($s, '%_\\'); }

/* ---------- общий доступ по ссылке ---------- */
// при переименовании/перемещении ссылка продолжает указывать на объект
function share_move(string $old, string $new): void {
    try {
        $db = app_db();
        $db->prepare("UPDATE share SET path = ? || substr(path, ?) WHERE path LIKE ? ESCAPE '\\'")
           ->execute([$new . '/', mb_strlen($old) + 2, like_esc($old) . '/%']);
        $db->prepare('DELETE FROM share WHERE path = ?')->execute([$new]);
        $db->prepare('UPDATE share SET path = ? WHERE path = ?')->execute([$new, $old]);
    } catch (Throwable $e) { error_log('share_move: ' . $e->getMessage()); }
}
// при удалении объекта (в корзину) доступ к нему и ко всему внутри закрывается
function share_remove(string $rel): void {
    try {
        app_db()->prepare("DELETE FROM share WHERE path = ? OR path LIKE ? ESCAPE '\\'")->execute([$rel, like_esc($rel) . '/%']);
    } catch (Throwable $e) { error_log('share_remove: ' . $e->getMessage()); }
}

/* ---------- индекс фото ---------- */
function idx_remove(string $rel): void {
    try {
        media_db()->prepare("DELETE FROM media WHERE path = ? OR path LIKE ? ESCAPE '\\'")->execute([$rel, like_esc($rel) . '/%']);
    } catch (Throwable $e) { error_log('idx_remove: ' . $e->getMessage()); }
}
function idx_move(string $old, string $new): void {
    try {
        $db = media_db();
        $db->prepare("UPDATE media SET path = ? || substr(path, ?) WHERE path LIKE ? ESCAPE '\\'")
           ->execute([$new . '/', mb_strlen($old) + 2, like_esc($old) . '/%']);
        $db->prepare('UPDATE media SET path = ?, name = ? WHERE path = ?')->execute([$new, basename($new), $old]);
    } catch (Throwable $e) { error_log('idx_move: ' . $e->getMessage()); }
}

/* ---------- файловые операции ---------- */
function unique_path(string $dir, string $name, bool $isDir): string {
    $t = $dir . '\\' . $name;
    if (!file_exists($t)) return $t;
    $pi = pathinfo($name);
    $base = $isDir ? $name : $pi['filename'];
    $ext = (!$isDir && isset($pi['extension'])) ? '.' . $pi['extension'] : '';
    for ($i = 1; $i < 10000; $i++) {
        $t = $dir . '\\' . "$base ($i)$ext";
        if (!file_exists($t)) return $t;
    }
    throw new RuntimeException('Не удалось подобрать имя');
}
function copy_tree(string $src, string $dst, int $depth = 0): bool {
    if ($depth > 40) return false;
    if (is_link($src)) return true;
    if (is_file($src)) {
        if (!@copy($src, $dst)) return false;
        @touch($dst, (int)@filemtime($src));
        return true;
    }
    if (!@mkdir($dst)) return false;
    foreach (scandir($src) ?: [] as $n) {
        if ($n === '.' || $n === '..') continue;
        if (!copy_tree($src . '\\' . $n, $dst . '\\' . $n, $depth + 1)) return false;
    }
    return true;
}
// рекурсивное удаление только внутри корня; ссылки/junction удаляются как ссылки, содержимое не трогается
function rrmdir(string $p): bool {
    if (!inside($p) || $p === root()) return false;
    if (is_link($p) || is_file($p)) return @unlink($p) || @rmdir($p);
    $ok = true;
    foreach (scandir($p) ?: [] as $n) {
        if ($n === '.' || $n === '..') continue;
        $c = $p . '\\' . $n;
        if (is_link($c)) { @unlink($c) || @rmdir($c); continue; }
        if (is_dir($c)) {
            $rp = realpath($c);
            if ($rp === false || stripos($rp, $p . '\\') !== 0) { @rmdir($c); continue; }
            $ok = rrmdir($c) && $ok;
        } else {
            if (!@unlink($c)) { @chmod($c, 0666); $ok = @unlink($c) && $ok; }
        }
    }
    return @rmdir($p) && $ok;
}
function ensure_rel_dir(string $rel): string {
    $rel = clean_rel($rel);
    $cur = root();
    foreach ($rel === '' ? [] : explode('/', $rel) as $s) {
        $cur .= '\\' . $s;
        if (!is_dir($cur) && !@mkdir($cur)) throw new RuntimeException('Не удалось создать папку');
    }
    $rp = realpath($cur);
    if ($rp === false || !inside($rp)) throw new RuntimeException('bad path');
    return $rp;
}
function rel_of(string $full): string { return str_replace('\\', '/', substr($full, strlen(root()) + 1)); }

/* ---------- корзина ---------- */
function trash_dir(): string { $t = root() . '\\.trash'; ensure_dir($t); return $t; }
function valid_tid(string $id): bool {
    return $id !== '' && $id !== '.' && $id !== '..' && !preg_match('/[\\\\\/:*?"<>|\x00-\x1f]/u', $id);
}
/* ---------- кэш превью ---------- */
// Удаляет перекодированные превью (320 и 1600 px) файла или всех файлов папки.
// Ключ кэша должен совпадать с thumb_info() в thumblib.php: sha1(путь|mtime|размер|ширина).
function thumb_forget(string $full, int $depth = 0): void {
    if ($depth > 40 || is_link($full)) return;
    if (is_dir($full)) {
        foreach (scandir($full) ?: [] as $n) {
            if ($n === '.' || $n === '..') continue;
            thumb_forget($full . '\\' . $n, $depth + 1);
        }
        return;
    }
    if (!is_file($full)) return;
    static $types = ['jpg','jpeg','png','gif','webp','heic','heif','avif','tif','tiff','bmp','mp4','mov','m4v','mkv','avi','webm'];
    if (!in_array(ext_of($full), $types, true)) return;
    $mt = @filemtime($full); $sz = @filesize($full);
    if ($mt === false || $sz === false) return;
    foreach ([320, 1600] as $w) {
        $key = sha1($full . '|' . $mt . '|' . $sz . '|' . $w);
        $jpg = cfg('data') . '\\cache\\' . substr($key, 0, 2) . '\\' . $key . '.jpg';
        foreach ([$jpg, $jpg . '.fail', $jpg . '.tmp.jpg'] as $x) if (is_file($x)) @unlink($x);
    }
}

function trash_put(string $src, string $rel): bool {
    thumb_forget($src);
    $isDir = is_dir($src);
    $name = basename($src);
    $size = $isDir ? 0 : (int)@filesize($src);
    $tname = date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '_' . mb_substr($name, 0, 100);
    if (!@rename($src, trash_dir() . '\\' . $tname)) return false;
    try {
        app_db()->prepare('INSERT OR REPLACE INTO trash(tname,orig,name,dir,size,ts,user) VALUES(?,?,?,?,?,?,?)')
            ->execute([$tname, $rel, $name, $isDir ? 1 : 0, $size, time(), $_SESSION['u'] ?? '']);
    } catch (Throwable $e) { error_log('trash_put: ' . $e->getMessage()); }
    idx_remove($rel);
    return true;
}
function trash_list(): array {
    $dir = trash_dir(); $db = app_db(); $meta = [];
    foreach ($db->query('SELECT * FROM trash') as $r) $meta[$r['tname']] = $r;
    $out = []; $seen = [];
    foreach (scandir($dir) ?: [] as $n) {
        if ($n === '.' || $n === '..') continue;
        $f = $dir . '\\' . $n; $seen[$n] = 1;
        if (isset($meta[$n])) {
            $m = $meta[$n];
            $out[] = ['id' => $n, 'name' => $m['name'], 'd' => (bool)$m['dir'], 's' => (int)$m['size'], 't' => (int)$m['ts'], 'orig' => (string)$m['orig']];
        } else {
            $isDir = is_dir($f);
            $ts = (int)@filemtime($f);
            if (preg_match('/^(\d{8}_\d{6})_[0-9a-f]{6}_/', $n, $mm)) {
                $dt = DateTime::createFromFormat('Ymd_His', $mm[1]);
                if ($dt) $ts = $dt->getTimestamp();
            }
            $out[] = ['id' => $n, 'name' => preg_replace('/^\d{8}_\d{6}_[0-9a-f]{6}_/', '', $n), 'd' => $isDir,
                      's' => $isDir ? 0 : (int)@filesize($f), 't' => $ts, 'orig' => ''];
        }
    }
    foreach ($meta as $k => $_) if (!isset($seen[$k])) $db->prepare('DELETE FROM trash WHERE tname=?')->execute([$k]);
    usort($out, fn($a, $b) => $b['t'] <=> $a['t']);
    return $out;
}
function trash_restore(string $id): ?string {
    if (!valid_tid($id)) return null;
    $src = trash_dir() . '\\' . $id;
    $db = app_db();
    $s = $db->prepare('SELECT * FROM trash WHERE tname=?'); $s->execute([$id]);
    $m = $s->fetch(PDO::FETCH_ASSOC);
    if (!file_exists($src)) { $db->prepare('DELETE FROM trash WHERE tname=?')->execute([$id]); return null; }
    $orig = $m ? (string)$m['orig'] : '';
    $name = $m ? (string)$m['name'] : preg_replace('/^\d{8}_\d{6}_[0-9a-f]{6}_/', '', $id);
    $parent = ($orig !== '' && strpos($orig, '/') !== false) ? substr($orig, 0, (int)strrpos($orig, '/')) : '';
    try { $pdir = ensure_rel_dir($parent); } catch (Throwable $e) { $pdir = root(); }
    $isDir = is_dir($src);
    $t = unique_path($pdir, $name, $isDir);
    if (!@rename($src, $t)) return null;
    $db->prepare('DELETE FROM trash WHERE tname=?')->execute([$id]);
    $trel = rel_of($t);
    ev('restore', $orig, $trel, $name, $isDir ? 'd' : 'f');
    return $trel;
}
function trash_purge(string $id, bool $log = true): bool {
    if (!valid_tid($id)) return false;
    $p = trash_dir() . '\\' . $id;
    $db = app_db();
    $s = $db->prepare('SELECT * FROM trash WHERE tname=?'); $s->execute([$id]);
    $m = $s->fetch(PDO::FETCH_ASSOC);
    $isDir = is_dir($p);
    $ok = !file_exists($p) || ($isDir ? rrmdir($p) : @unlink($p));
    if ($ok) {
        $db->prepare('DELETE FROM trash WHERE tname=?')->execute([$id]);
        if ($log) ev('purge', $m ? (string)$m['orig'] : '', '', $m ? (string)$m['name'] : $id, $isDir ? 'd' : 'f');
    }
    return $ok;
}
function trash_empty(): int {
    $n = 0;
    foreach (trash_list() as $it) if (trash_purge($it['id'], false)) $n++;
    if ($n) ev('purge', '', '', '', 'f', $n);
    return $n;
}
function trash_purge_older(int $days): int {
    $n = 0; $lim = time() - $days * 86400;
    foreach (trash_list() as $it) if ($it['t'] < $lim && trash_purge($it['id'], false)) $n++;
    return $n;
}

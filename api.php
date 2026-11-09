<?php
require __DIR__ . '/lib.php';
require __DIR__ . '/fslib.php';
boot('json');
set_time_limit(0);

function items_arg(array $in): array {
    $a = $in['items'] ?? (isset($in['p']) ? [$in['p']] : []);
    if (!is_array($a)) return [];
    return array_slice(array_values(array_filter($a, 'is_string')), 0, 500);
}


/* ---------- избранное (SQLite) ---------- */
function fav_db(): PDO {
    $db = app_db();
    $db->exec('CREATE TABLE IF NOT EXISTS fav(path TEXT PRIMARY KEY, dir INTEGER NOT NULL DEFAULT 0, user TEXT, ts INTEGER NOT NULL)');
    return $db;
}
function fav_move(string $old, string $new): void {
    try {
        $db = fav_db();
        $db->prepare("UPDATE fav SET path = ? || substr(path, ?) WHERE path LIKE ? ESCAPE '\\'")
           ->execute([$new . '/', mb_strlen($old) + 2, like_esc($old) . '/%']);
        $db->prepare('UPDATE OR REPLACE fav SET path = ? WHERE path = ?')->execute([$new, $old]);
    } catch (Throwable $e) { error_log('fav_move: ' . $e->getMessage()); }
}
function fav_remove(string $rel): void {
    try {
        fav_db()->prepare("DELETE FROM fav WHERE path = ? OR path LIKE ? ESCAPE '\\'")->execute([$rel, like_esc($rel) . '/%']);
    } catch (Throwable $e) { error_log('fav_remove: ' . $e->getMessage()); }
}

$a = $_GET['a'] ?? '';
try {
    $in = [];
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        need_csrf();
        $in = json_decode((string)file_get_contents('php://input'), true) ?: [];
    }
    switch ($a) {
    case 'list':
        [$full, $rel] = resolve((string)($_GET['p'] ?? ''));
        if (!is_dir($full)) json_out(['error' => 'not a dir'], 400);
        $items = [];
        foreach (scandir($full) ?: [] as $n) {
            if ($n === '.' || $n === '..' || is_hidden($n)) continue;
            $f = $full . '\\' . $n;
            $d = is_dir($f);
            $items[] = ['n' => $n, 'd' => $d, 's' => $d ? 0 : (int)@filesize($f), 'm' => (int)@filemtime($f)];
        }
        json_out(['path' => $rel, 'items' => $items]);

    case 'space':
        $r = root();
        json_out(['free' => (float)@disk_free_space($r), 'total' => (float)@disk_total_space($r)]);

    case 'mkdir':
        $name = (string)($in['name'] ?? '');
        if (!valid_name($name)) json_out(['error' => 'Недопустимое имя'], 400);
        [$par, $prel] = resolve((string)($in['p'] ?? ''));
        $t = $par . '\\' . $name;
        if (file_exists($t)) json_out(['error' => 'Уже существует'], 409);
        if (!mkdir($t)) json_out(['error' => 'Не удалось создать'], 500);
        ev('mkdir', rel_of($t), '', $name, 'd');
        json_out(['ok' => true]);

    case 'rename':
        $name = (string)($in['name'] ?? '');
        if (!valid_name($name)) json_out(['error' => 'Недопустимое имя'], 400);
        [$src, $rel] = resolve((string)($in['p'] ?? ''));
        if ($rel === '') json_out(['error' => 'root'], 400);
        $t = dirname($src) . '\\' . $name;
        if (file_exists($t) && strcasecmp($t, $src) !== 0) json_out(['error' => 'Уже существует'], 409);
        $old = basename($src); $isDir = is_dir($src);
        if (!rename($src, $t)) json_out(['error' => 'Не удалось переименовать'], 500);
        $trel = rel_of($t);
        idx_move($rel, $trel); fav_move($rel, $trel);
        ev('rename', $rel, $trel, $old, $isDir ? 'd' : 'f');
        json_out(['ok' => true]);

    case 'delete':
        $n = 0; $fail = 0;
        foreach (items_arg($in) as $p) {
            [$src, $rel] = resolve($p);
            if ($rel === '') continue;
            $isDir = is_dir($src); $nm = basename($src);
            if (trash_put($src, $rel)) { fav_remove($rel); ev('delete', $rel, '', $nm, $isDir ? 'd' : 'f'); $n++; } else $fail++;
        }
        json_out(['ok' => $fail === 0, 'n' => $n, 'errors' => $fail ? ["Не удалось удалить объектов: $fail"] : []]);

    case 'move':
    case 'copy':
        [$dst, $drel] = resolve((string)($in['to'] ?? ''));
        if (!is_dir($dst)) json_out(['error' => 'Целевая папка не найдена'], 400);
        $n = 0; $errs = [];
        foreach (items_arg($in) as $p) {
            [$src, $rel] = resolve($p);
            if ($rel === '') continue;
            $isDir = is_dir($src); $nm = basename($src);
            if ($isDir && (strcasecmp($dst, $src) === 0 || stripos($dst . '\\', $src . '\\') === 0)) { $errs[] = "«$nm»: нельзя поместить папку в саму себя"; continue; }
            if ($a === 'move' && strcasecmp(dirname($src), $dst) === 0) continue;
            $t = unique_path($dst, $nm, $isDir);
            $trel = rel_of($t);
            if ($a === 'move') {
                if (!@rename($src, $t)) { $errs[] = "«$nm»: не удалось переместить"; continue; }
                idx_move($rel, $trel); fav_move($rel, $trel);
                ev('move', $rel, $trel, $nm, $isDir ? 'd' : 'f');
            } else {
                if (!copy_tree($src, $t)) {
                    if (is_dir($t)) rrmdir($t); else @unlink($t);
                    $errs[] = "«$nm»: не удалось скопировать"; continue;
                }
                ev('copy', $rel, $trel, $nm, $isDir ? 'd' : 'f');
            }
            $n++;
        }
        json_out(['ok' => !$errs, 'n' => $n, 'errors' => $errs]);

    case 'trash':
        json_out(['items' => trash_list()]);

    case 'restore':
        $ids = items_arg(['items' => $in['ids'] ?? []]); $n = 0;
        foreach ($ids as $id) if (trash_restore($id) !== null) $n++;
        json_out(['ok' => true, 'n' => $n]);

    case 'purge':
        $ids = items_arg(['items' => $in['ids'] ?? []]); $n = 0;
        foreach ($ids as $id) if (trash_purge($id)) $n++;
        json_out(['ok' => true, 'n' => $n]);

    case 'empty':
        json_out(['ok' => true, 'n' => trash_empty()]);

    case 'fav_list':
        $db = fav_db(); $out = [];
        foreach ($db->query('SELECT path,dir,ts FROM fav ORDER BY ts DESC')->fetchAll(PDO::FETCH_ASSOC) as $r) {
            try { [$full, $rel] = resolve($r['path']); } catch (Throwable $e) { fav_remove($r['path']); continue; }
            $d = is_dir($full);
            $out[] = ['p' => $rel, 'n' => basename($full), 'd' => $d, 's' => $d ? 0 : (int)@filesize($full), 'm' => (int)@filemtime($full), 't' => (int)$r['ts']];
        }
        json_out(['items' => $out]);

    case 'fav_add':
        $n = 0;
        foreach (items_arg($in) as $p) {
            [$full, $rel] = resolve($p);
            if ($rel === '') continue;
            fav_db()->prepare('INSERT OR REPLACE INTO fav(path,dir,user,ts) VALUES(?,?,?,?)')->execute([$rel, is_dir($full) ? 1 : 0, $_SESSION['u'] ?? '', time()]);
            $n++;
        }
        json_out(['ok' => true, 'n' => $n]);

    case 'fav_del':
        foreach (items_arg($in) as $p) { $rel = clean_rel($p); fav_db()->prepare('DELETE FROM fav WHERE path = ?')->execute([$rel]); }
        json_out(['ok' => true]);

    case 'history':
        $lim = max(1, min(200, (int)($_GET['limit'] ?? 100)));
        $sql = 'SELECT id,ts,user,act,path,path2,name,kind,n,dev,ip FROM events WHERE 1=1'; $par = [];
        if (($_GET['bid'] ?? '') !== '') { $sql .= ' AND id < :bid'; $par[':bid'] = (int)$_GET['bid']; }
        if (!empty($_GET['ut'])) { $sql .= ' AND ts <= :ut'; $par[':ut'] = (int)$_GET['ut']; }
        if (!empty($_GET['act'])) { $sql .= ' AND act = :act'; $par[':act'] = (string)$_GET['act']; }
        $sql .= ' ORDER BY id DESC LIMIT ' . $lim;
        $s = app_db()->prepare($sql); $s->execute($par);
        $rows = [];
        foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r)
            $rows[] = ['id' => (int)$r['id'], 'ts' => (int)$r['ts'], 'u' => $r['user'], 'act' => $r['act'], 'p' => $r['path'], 'p2' => $r['path2'],
                       'nm' => $r['name'], 'k' => $r['kind'], 'n' => (int)$r['n'], 'dev' => $r['dev'], 'ip' => $r['ip']];
        json_out(['items' => $rows]);

    default:
        json_out(['error' => 'unknown'], 400);
    }
} catch (RuntimeException $e) {
    json_out(['error' => $e->getMessage()], 404);
} catch (Throwable $e) {
    error_log('api.php: ' . $e->getMessage());
    json_out(['error' => 'Ошибка: ' . $e->getMessage()], 500);
}

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
    return app_db(); // таблица fav создаётся в app_db() (main.sqlite)
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
// изменяющие действия только через POST (а значит, только с CSRF-токеном)
$MUT = ['mkdir', 'rename', 'delete', 'move', 'copy', 'restore', 'purge', 'empty', 'fav_add', 'fav_del', 'share_add', 'share_del'];
if (is_string($a) && str_starts_with($a, 'share_') && cfg('share') !== true) json_out(['error' => 'Общий доступ отключён (share в config.php)'], 403);
if (in_array($a, $MUT, true) && $_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'method not allowed'], 405);
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
            $it = ['n' => $n, 'd' => $d, 's' => $d ? 0 : (int)@filesize($f), 'm' => (int)@filemtime($f)];
            if (is_share_link($f)) $it['l'] = 1;   // папка-ссылка (mklink /D) — значок «шары»
            $items[] = $it;
        }
        json_out(['path' => $rel, 'items' => $items]);

    case 'dirs':
        // только подпапки + признак h: есть ли внутри хотя бы одна подпапка (для шеврона в дереве)
        [$full, $rel] = resolve((string)($_GET['p'] ?? ''));
        if (!is_dir($full)) json_out(['error' => 'not a dir'], 400);
        $dirs = [];
        foreach (scandir($full) ?: [] as $n) {
            if ($n === '.' || $n === '..' || is_hidden($n)) continue;
            $f = $full . '\\' . $n;
            if (!is_dir($f)) continue;
            $h = false;
            if ($dh = @opendir($f)) {
                $seen = 0;
                while (($c = readdir($dh)) !== false) {
                    if ($c === '.' || $c === '..' || is_hidden($c)) continue;
                    if (is_dir($f . '\\' . $c)) { $h = true; break; }
                    if (++$seen >= 5000) { $h = true; break; } // очень большая папка — не перебираем до конца
                }
                closedir($dh);
            }
            $dirs[] = is_share_link($f) ? ['n' => $n, 'h' => $h, 'l' => 1] : ['n' => $n, 'h' => $h];
        }
        json_out(['path' => $rel, 'dirs' => $dirs]);

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
        idx_move($rel, $trel); fav_move($rel, $trel); share_move($rel, $trel);
        ev('rename', $rel, $trel, $old, $isDir ? 'd' : 'f');
        json_out(['ok' => true]);

    case 'delete':
        $n = 0; $fail = 0;
        foreach (items_arg($in) as $p) {
            [$src, $rel] = resolve($p);
            if ($rel === '') continue;
            $isDir = is_dir($src); $nm = basename($src);
            if (trash_put($src, $rel)) { fav_remove($rel); share_remove($rel); ev('delete', $rel, '', $nm, $isDir ? 'd' : 'f'); $n++; } else $fail++;
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
                if (!move_path($src, $t)) { $errs[] = "«$nm»: не удалось переместить"; continue; }
                idx_move($rel, $trel); fav_move($rel, $trel); share_move($rel, $trel);
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
            if (is_share_link($full)) $out[count($out) - 1]['l'] = 1;
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

    case 'share_list':
        $db = app_db(); $out = [];
        foreach ($db->query('SELECT token,path,once,ts,hits,last FROM share ORDER BY ts DESC')->fetchAll(PDO::FETCH_ASSOC) as $r) {
            try { [$full, $rel] = resolve($r['path']); } catch (Throwable $e) { share_remove($r['path']); continue; }
            $d = is_dir($full);
            $out[] = ['t' => $r['token'], 'p' => $rel, 'n' => basename($full), 'd' => $d, 's' => $d ? 0 : (int)@filesize($full), 'm' => (int)@filemtime($full),
                      'once' => (bool)$r['once'], 'ts' => (int)$r['ts'], 'hits' => (int)$r['hits'], 'last' => (int)($r['last'] ?? 0)];
            if (is_share_link($full)) $out[count($out) - 1]['l'] = 1;
        }
        json_out(['items' => $out]);

    case 'share_add':
        [$full, $rel] = resolve((string)($in['p'] ?? ''));
        if ($rel === '') json_out(['error' => 'Нельзя открыть доступ ко всему диску'], 400);
        $db = app_db();
        $s = $db->prepare('SELECT token,once FROM share WHERE path = ?'); $s->execute([$rel]);
        if ($r = $s->fetch(PDO::FETCH_ASSOC)) json_out(['ok' => true, 't' => $r['token'], 'once' => (bool)$r['once'], 'existed' => true]);
        $tok = bin2hex(random_bytes(16)); $once = !empty($in['once']); $isDir = is_dir($full);
        $db->prepare('INSERT INTO share(token,path,dir,once,user,ts) VALUES(?,?,?,?,?,?)')
           ->execute([$tok, $rel, $isDir ? 1 : 0, $once ? 1 : 0, $_SESSION['u'] ?? '', time()]);
        ev('share', $rel, '', basename($full), $isDir ? 'd' : 'f');
        json_out(['ok' => true, 't' => $tok, 'once' => $once]);

    case 'share_del':
        $db = app_db();
        if (!empty($in['all'])) $rows = $db->query('SELECT token,path,dir FROM share')->fetchAll(PDO::FETCH_ASSOC);
        else {
            $tok = array_values(array_filter(items_arg(['items' => $in['tokens'] ?? []]), fn($t) => (bool)preg_match('/^[a-f0-9]{32}$/', $t)));
            if (!$tok) json_out(['ok' => true, 'n' => 0]);
            $s = $db->prepare('SELECT token,path,dir FROM share WHERE token IN (' . implode(',', array_fill(0, count($tok), '?')) . ')');
            $s->execute($tok); $rows = $s->fetchAll(PDO::FETCH_ASSOC);
        }
        $del = $db->prepare('DELETE FROM share WHERE token = ?');
        foreach ($rows as $r) $del->execute([$r['token']]);
        if (count($rows) === 1) ev('unshare', $rows[0]['path'], '', basename($rows[0]['path']), $rows[0]['dir'] ? 'd' : 'f');
        elseif ($rows) ev('unshare', '', '', '', 'f', count($rows));
        json_out(['ok' => true, 'n' => count($rows)]);

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

<?php
require __DIR__ . '/lib.php';
require_once __DIR__ . '/photos_lib.php';
boot('json');
session_write_close();
try {
    $db = photos_db();
    switch ($_GET['a'] ?? '') {
    case 'status':
        json_out([
            'count'   => (int)$db->query('SELECT COUNT(*) FROM media')->fetchColumn(),
            'scanned' => (int)(meta_get($db, 'scan_finished') ?? 0),
            'running' => meta_get($db, 'scan_running') === '1',
        ]);
    case 'months':
        $r = $db->query("SELECT strftime('%Y-%m', taken, 'unixepoch') ym, COUNT(*) c FROM media GROUP BY ym ORDER BY ym DESC");
        json_out($r->fetchAll(PDO::FETCH_ASSOC));
    case 'days':
        if (!preg_match('/^(\d{4})-(\d\d)$/', (string)($_GET['ym'] ?? ''), $m)) json_out(['error' => 'bad ym'], 400);
        $a = gmmktime(0, 0, 0, (int)$m[2], 1, (int)$m[1]);
        $b = gmmktime(0, 0, 0, (int)$m[2] + 1, 1, (int)$m[1]);
        $s = $db->prepare("SELECT CAST(strftime('%d', taken, 'unixepoch') AS INTEGER) d, COUNT(*) c FROM media WHERE taken >= ? AND taken < ? GROUP BY d");
        $s->execute([$a, $b]);
        $days = [];
        foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) $days[(string)$r['d']] = (int)$r['c'];
        json_out(['days' => (object)$days]);
    case 'timeline':
        $limit = max(1, min(500, (int)($_GET['limit'] ?? 240)));
        if (isset($_GET['at'])) {
            // более новые, чем курсор (прокрутка вверх после перехода к дате): по возрастанию, клиент добавляет их сверху
            $s = $db->prepare('SELECT id,path,name,kind,taken,mtime FROM media
                WHERE taken > :t OR (taken = :t AND id > :i) ORDER BY taken ASC, id ASC LIMIT :n');
            $s->bindValue(':t', (int)$_GET['at'], PDO::PARAM_INT);
            $s->bindValue(':i', (int)($_GET['ai'] ?? 0), PDO::PARAM_INT);
        } elseif (isset($_GET['bt'])) {
            $s = $db->prepare('SELECT id,path,name,kind,taken,mtime FROM media
                WHERE taken < :t OR (taken = :t AND id < :i) ORDER BY taken DESC, id DESC LIMIT :n');
            $s->bindValue(':t', (int)$_GET['bt'], PDO::PARAM_INT);
            $s->bindValue(':i', (int)($_GET['bi'] ?? 0), PDO::PARAM_INT);
        } else {
            $s = $db->prepare('SELECT id,path,name,kind,taken,mtime FROM media ORDER BY taken DESC, id DESC LIMIT :n');
        }
        $s->bindValue(':n', $limit, PDO::PARAM_INT);
        $s->execute();
        $out = [];
        foreach ($s as $r) $out[] = ['id' => (int)$r['id'], 'p' => $r['path'], 'n' => $r['name'], 'k' => $r['kind'], 't' => (int)$r['taken'], 'm' => (int)$r['mtime']];
        json_out(['items' => $out]);
    default:
        json_out(['error' => 'unknown'], 400);
    }
} catch (Throwable $e) {
    error_log('photos.php: ' . $e->getMessage());
    json_out(['error' => 'Индекс недоступен (проверьте pdo_sqlite и права на папку data)'], 500);
}

<?php
declare(strict_types=1);

function photos_db(): PDO {
    $dir = (string)cfg('data'); ensure_dir($dir);
    $db = new PDO('sqlite:' . $dir . '\\photos.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec('PRAGMA busy_timeout=15000');
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA synchronous=NORMAL');
    $db->exec('CREATE TABLE IF NOT EXISTS media(
        id INTEGER PRIMARY KEY, path TEXT NOT NULL UNIQUE, name TEXT NOT NULL, kind TEXT NOT NULL,
        size INTEGER NOT NULL, mtime INTEGER NOT NULL, taken INTEGER NOT NULL, seen INTEGER NOT NULL DEFAULT 0)');
    $db->exec('CREATE INDEX IF NOT EXISTS i_taken ON media(taken DESC, id DESC)');
    $db->exec('CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT)');
    return $db;
}
function meta_get(PDO $db, string $k): ?string {
    $s = $db->prepare('SELECT v FROM meta WHERE k=?'); $s->execute([$k]);
    $v = $s->fetchColumn(); return $v === false ? null : (string)$v;
}
function meta_set(PDO $db, string $k, string $v): void {
    $db->prepare('INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v')->execute([$k, $v]);
}

// запуск программы с захватом stdout
function run_capture(array $cmd, ?string $stdin_file, int $timeout = 30): ?string {
    $o = tempnam(sys_get_temp_dir(), 'oc');
    $desc = [
        0 => $stdin_file ? ['file', $stdin_file, 'r'] : ['file', 'NUL', 'r'],
        1 => ['file', $o, 'w'],
        2 => ['file', 'NUL', 'w'],
    ];
    $p = @proc_open($cmd, $desc, $pipes, null, null, ['bypass_shell' => true]);
    if (!is_resource($p)) { @unlink($o); return null; }
    $t0 = time();
    while (true) {
        $st = proc_get_status($p);
        if (!$st['running']) break;
        if (time() - $t0 > $timeout) { proc_terminate($p); break; }
        usleep(50000);
    }
    $code = $st['running'] ? -1 : $st['exitcode'];
    proc_close($p);
    $s = is_file($o) ? (string)file_get_contents($o) : '';
    @unlink($o);
    return $code === 0 ? trim($s) : null;
}

<?php
// php pregen.php [--minutes=240] [--w=320] [--shard=0/3]
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require __DIR__ . '/lib.php';
require __DIR__ . '/photos_lib.php';
require __DIR__ . '/thumblib.php';
set_time_limit(0);

$opt = getopt('', ['minutes::', 'w::', 'shard::']);
$deadline = isset($opt['minutes']) && (int)$opt['minutes'] > 0 ? time() + (int)$opt['minutes'] * 60 : PHP_INT_MAX;
$w = ((int)($opt['w'] ?? 320)) >= 1000 ? 1600 : 320;
$si = 0; $sn = 1;
if (isset($opt['shard']) && preg_match('~^(\d+)/(\d+)$~', $opt['shard'], $m) && (int)$m[2] > 0 && (int)$m[1] < (int)$m[2]) { $si = (int)$m[1]; $sn = (int)$m[2]; }

$lockf = fopen(cfg('data') . DS . "pregen_{$w}_{$si}_{$sn}.lock", 'c');
if (!$lockf || !flock($lockf, LOCK_EX | LOCK_NB)) { echo "Уже запущен\n"; exit(0); }

$db = photos_db();
$rows = $db->query('SELECT path FROM media ORDER BY taken DESC, id DESC');
$done = 0; $skip = 0; $fail = 0; $k = 0;
foreach ($rows as $r) {
    if ($k++ % $sn !== $si) continue;
    if (time() > $deadline) { echo "Лимит времени\n"; break; }
    $full = root() . DS . str_replace('/', DS, $r['path']);
    if (!is_file($full)) continue;
    $info = thumb_info($full, $w);
    if (!$info || is_file($info[1]) || is_file($info[1] . '.fail')) { $skip++; continue; }
    if (thumb_make($full, $w, 120)) $done++; else $fail++;
    if (($done + $fail) % 100 === 0) printf("[%s] #%d создано %d, ошибок %d, пропущено %d\n", date('H:i:s'), $si, $done, $fail, $skip);
}
printf("Готово #%d: создано %d, ошибок %d, пропущено %d\n", $si, $done, $fail, $skip);
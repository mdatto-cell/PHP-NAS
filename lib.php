<?php
declare(strict_types=1);
// config.php лежит на уровень выше DocumentRoot (например, H:\www\config.php)
$CFG = require dirname(__DIR__) . '/config.php';
function cfg(string $k) { global $CFG; return $CFG[$k] ?? null; }

function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}
function ensure_dir(string $d): void { if (!is_dir($d)) @mkdir($d, 0775, true); }

function json_out($data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function start_session(): void {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header('X-Frame-Options: SAMEORIGIN');
    $dir = cfg('data') . '\\sessions';
    ensure_dir($dir);
    session_save_path($dir);
    session_name('NASSID');
    ini_set('session.gc_maxlifetime', (string)(30 * 86400));
    session_set_cookie_params([
        'lifetime' => 30 * 86400, 'path' => '/', 'httponly' => true,
        'secure' => is_https(), 'samesite' => 'Lax',
    ]);
    session_start();
}

// $mode: page | json | raw
function boot(string $mode = 'json'): void {
    start_session();
    if (empty($_SESSION['u'])) {
        if ($mode === 'page') { header('Location: login.php'); exit; }
        if ($mode === 'json') json_out(['error' => 'auth'], 401);
        http_response_code(401); exit;
    }
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
}
function need_csrf(): void {
    $t = $_SERVER['HTTP_X_CSRF'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', $t)) json_out(['error' => 'csrf'], 403);
}

/* ---------- безопасные пути ---------- */
function root(): string {
    static $r = null;
    if ($r === null) { $r = realpath(cfg('root')); if ($r === false) json_out(['error' => 'root missing'], 500); $r = rtrim($r, '\\'); }
    return $r;
}
function is_hidden(string $n): bool {
    return in_array(strtolower($n), ['.trash', 'system volume information', '$recycle.bin', 'desktop.ini', 'thumbs.db', '.ds_store'], true);
}
function valid_name(string $n): bool {
    return $n !== '' && $n !== '.' && $n !== '..' && strlen($n) <= 255
        && !preg_match('/[\\\\\/<>:"|?*\x00-\x1f]/', $n) && !is_hidden($n) && $n === rtrim($n, ' .');
}
function clean_rel(string $rel): string {
    $parts = [];
    foreach (explode('/', str_replace('\\', '/', $rel)) as $s) {
        if ($s === '' || $s === '.') continue;
        if ($s === '..' || !valid_name($s)) throw new RuntimeException('bad path');
        $parts[] = $s;
    }
    return implode('/', $parts);
}
function inside(string $p): bool {
    $r = root();
    return $p === $r || stripos($p, $r . '\\') === 0;
}
/* ---------- символические ссылки (mklink /D) внутри root ----------
   'symlinks' в config.php: false/нет — ссылки, ведущие за пределы root, не открываются (как раньше);
   true — открываются любые; массив папок — только ссылки, цель которых лежит внутри одной из них.
   Через ссылку путь остаётся «внутренним» (root\Ссылка\...), поэтому избранное, ссылки, история и превью работают как обычно. */
function links_on(): bool { $c = cfg('symlinks'); return $c === true || (is_array($c) && $c); }
function link_allowed(string $target): bool {
    $c = cfg('symlinks');
    if ($c === true) return true;
    if (!is_array($c)) return false;
    foreach ($c as $b) {
        $rb = realpath((string)$b); if ($rb === false) continue;
        $rb = rtrim($rb, '\\');
        if (strcasecmp($target, $rb) === 0 || stripos($target, $rb . '\\') === 0) return true;
    }
    return false;
}
// путь root\a\b\... идёт через разрешённую ссылку и не выходит за пределы её цели (вложенные ссылки проверяются так же)
function via_link(string $full): bool {
    if (!links_on()) return false;
    $r = root();
    if (stripos($full, $r . '\\') !== 0) return false;
    $cur = $r; $base = null;
    foreach (explode('\\', substr($full, strlen($r) + 1)) as $s) {
        if ($s === '') continue;
        $cur .= '\\' . $s;
        if (!is_link($cur)) continue;
        $t = realpath($cur);
        if ($t === false || !link_allowed($t)) return false;
        if (stripos($r . '\\', rtrim($t, '\\') . '\\') === 0) return false;   // ссылка на сам root или выше — петля, не открываем
        $base = rtrim($t, '\\');
    }
    if ($base === null) return false;
    $rp = realpath($full);
    return $rp !== false && (strcasecmp($rp, $base) === 0 || stripos($rp, $base . '\\') === 0);
}
// это разрешённая ссылка на папку/файл (для значка «шары» в интерфейсе)
function is_share_link(string $full): bool { return links_on() && is_link($full) && via_link($full); }

// existing=true -> путь должен существовать; false -> родитель должен существовать
function resolve(string $rel, bool $existing = true): array {
    $rel = clean_rel($rel);
    $full = $rel === '' ? root() : root() . '\\' . str_replace('/', '\\', $rel);
    if ($existing) {
        $rp = realpath($full);
        if ($rp !== false && inside($rp)) return [$rp, $rel];
        if ($rp !== false && via_link($full)) return [$full, $rel];   // через ссылку — путь внутри root, не цель ссылки
        throw new RuntimeException('not found');
    }
    $dir = dirname($full);
    $par = realpath($dir);
    if ($par !== false && inside($par)) return [$par . '\\' . basename($full), $rel];
    if ($par !== false && via_link($dir)) return [$dir . '\\' . basename($full), $rel];
    throw new RuntimeException('bad parent');
}

function ext_of(string $n): string { return strtolower(pathinfo($n, PATHINFO_EXTENSION)); }
function mime_of(string $n): string {
    static $m = [
        'jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','gif'=>'image/gif','webp'=>'image/webp','avif'=>'image/avif',
        'bmp'=>'image/bmp','heic'=>'image/heic','heif'=>'image/heif','tif'=>'image/tiff','tiff'=>'image/tiff',
        'mp4'=>'video/mp4','m4v'=>'video/mp4','mov'=>'video/quicktime','webm'=>'video/webm','mkv'=>'video/x-matroska',
        'mp3'=>'audio/mpeg','m4a'=>'audio/mp4','flac'=>'audio/flac','ogg'=>'audio/ogg','wav'=>'audio/wav','opus'=>'audio/ogg',
        'pdf'=>'application/pdf','txt'=>'text/plain; charset=utf-8','log'=>'text/plain; charset=utf-8',
        'md'=>'text/plain; charset=utf-8','csv'=>'text/plain; charset=utf-8','json'=>'text/plain; charset=utf-8',
    ];
    return $m[ext_of($n)] ?? 'application/octet-stream';
}

/* ---------- запуск внешних программ ---------- */
function run_cmd(array $cmd, ?string $stdin_file, int $timeout = 90): bool {
    $err = tempnam(sys_get_temp_dir(), 'er');
    $desc = [
        0 => $stdin_file ? ['file', $stdin_file, 'r'] : ['file', 'NUL', 'r'],
        1 => ['file', 'NUL', 'w'],
        2 => ['file', $err, 'w'],
    ];
    $p = @proc_open($cmd, $desc, $pipes, null, null, ['bypass_shell' => true]);
    if (!is_resource($p)) { @unlink($err); return false; }
    $t0 = time();
    while (true) {
        $st = proc_get_status($p);
        if (!$st['running']) break;
        if (time() - $t0 > $timeout) { proc_terminate($p); break; }
        usleep(50000);
    }
    $code = $st['running'] ? -1 : $st['exitcode'];
    proc_close($p);
    @unlink($err);
    return $code === 0;
}

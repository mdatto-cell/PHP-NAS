<?php
require __DIR__ . '/lib.php';
start_session();
$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '0';
    $dir = cfg('data') . DS . 'throttle'; ensure_dir($dir);
    $f   = $dir . DS . sha1($ip) . '.json';
    $st  = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: ['n' => 0, 't' => 0]) : ['n' => 0, 't' => 0];
    if (time() - $st['t'] > 900) $st = ['n' => 0, 't' => time()];
    if ($st['n'] >= 5) {
        $err = 'Слишком много попыток. Подождите 15 минут.';
    } else {
        $u = (string)($_POST['u'] ?? ''); $pw = (string)($_POST['p'] ?? '');
        $users = cfg('users');
        $hash = $users[$u] ?? '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';
        if (isset($users[$u]) && password_verify($pw, $hash)) {
            @unlink($f);
            session_regenerate_id(true);
            $_SESSION['u'] = $u;
            $_SESSION['csrf'] = bin2hex(random_bytes(16));
            header('Location: index.php'); exit;
        }
        $st['n']++; $st['t'] = time();
        file_put_contents($f, json_encode($st));
        usleep(600000);
        $err = 'Неверный логин или пароль';
    }
}
?><!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Вход</title><link rel="stylesheet" href="style.css"></head>
<body class="login"><form method="post" class="loginbox">
<h1>Диск</h1>
<?php if ($err): ?><div class="err"><?= htmlspecialchars($err) ?></div><?php endif; ?>
<input name="u" placeholder="Логин" autocomplete="username" autofocus required>
<input name="p" type="password" placeholder="Пароль" autocomplete="current-password" required>
<button class="btn primary" type="submit">Войти</button>
</form></body></html>

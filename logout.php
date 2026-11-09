<?php
require __DIR__ . '/lib.php';
start_session();
// выход только с CSRF-токеном, чтобы чужой сайт не мог разлогинить ссылкой
$t = (string)($_POST['t'] ?? $_GET['t'] ?? '');
if (!empty($_SESSION['u']) && !hash_equals($_SESSION['csrf'] ?? '', $t)) { header('Location: index.php'); exit; }
$_SESSION = [];
session_destroy();
header('Location: login.php');

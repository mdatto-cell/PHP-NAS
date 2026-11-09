<?php
// php mkpass.php "мой_пароль"
echo password_hash($argv[1] ?? '', PASSWORD_DEFAULT), PHP_EOL;

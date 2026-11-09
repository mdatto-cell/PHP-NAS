# Ночное обновление индекса галереи и параллельная генерация миниатюр
$php = 'H:\php85\php.exe'; $app = 'H:\www\files'; $log = 'D:\www\data'; $n = 3
& $php "$app\scan.php" *>> "$log\scan.log"
$procs = 0..($n - 1) | ForEach-Object {
  Start-Process $php -ArgumentList "`"$app\pregen.php`" --shard=$_/$n --minutes=300" `
    -RedirectStandardOutput "$log\pregen$_.log" -RedirectStandardError "$log\pregen$_.err" -PassThru -WindowStyle Hidden
}
$procs | Wait-Process

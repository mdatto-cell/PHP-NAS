
@echo off
rem Ежедневное обновление индекса фото и миниатюр
set PHP=H:\php85\php.exe
set APP=H:\www\files
set LOG=H:\www\data
"%PHP%" "%APP%\scan.php" >> "%LOG%\scan.log" 2>&1
"%PHP%" "%APP%\pregen.php" --minutes=300 >> "%LOG%\pregen.log" 2>&1

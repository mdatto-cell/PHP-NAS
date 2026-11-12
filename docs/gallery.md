# Галерея: первичная индексация, автоматизация и очистка

Инструкция для двух вариантов сервера:

- **Windows:** Windows Server 2022, Apache + PHP (php-cgi, mod_fcgid). Команды выполняйте в консоли, запущенной от имени администратора.
- **Linux:** веб-сервер с PHP, пользователь веб-сервера `www-data` (Debian/Ubuntu). Команды выполняйте от root или через `sudo`.

Пути ниже даны для примера, подставьте свои.

## Где что лежит

| Windows | Linux | Что хранит | Можно удалять? |
|---|---|---|---|
| `H:\www\config.php` | `/var/www/disk/config.php` | Конфигурация (вне DocumentRoot) | Нет |
| `H:\www\files` | `/var/www/disk/files` | Приложение (DocumentRoot) | — |
| `H:\share` | `/var/www/disk/share` | Корень (`root`), то, что видно в интерфейсе | Нет |
| `D:\www\data\main.sqlite*` | `/var/www/disk/data/main.sqlite*` | История, Корзина (исходные пути), Избранное | Нет, данные пропадут |
| `D:\www\data\photos.sqlite*` | `/var/www/disk/data/photos.sqlite*` | Индекс галереи | Да, `scan.php` создаст заново |
| `D:\www\data\cache` | `/var/www/disk/data/cache` | Миниатюры 320 и 1600 px | Да, создадутся заново |
| `D:\www\data\tmp` | `/var/www/disk/data/tmp` | Временные ZIP при скачивании папок | Да |
| `D:\www\data\sessions`, `throttle`, `locks` | `/var/www/disk/data/sessions`, `throttle`, `locks` | Служебные файлы | Не нужно (удаление сессий = повторный вход) |

`config.php` всегда ищется на уровень выше папки приложения.

У SQLite-баз три файла: `.sqlite`, `.sqlite-wal`, `.sqlite-shm`. Удаляйте и копируйте их вместе и только при остановленном веб-сервере.

## 0. Проверка перед запуском

### Windows

В `H:\www\config.php`:

```
'data'        => 'D:\\www\\data',
'magick'      => 'C:\\Program Files\\ImageMagick\\magick.exe',
'ffmpeg'      => 'C:\\ffmpeg\\bin\\ffmpeg.exe',
'photo_dirs'  => ['iCloud', 'Облако Mail.ru/Camera Uploads'],
'thumb_slots' => 4,
```

Проверка ImageMagick и HEIC:

```
magick -list format | findstr /i "HEIC"
magick "H:\share\iCloud\<файл>.HEIC" -thumbnail 320x320 D:\www\data\t.jpg
```

### Linux

В `/var/www/disk/config.php` обычные пути, без экранирования:

```
'root'        => '/var/www/disk/share',
'data'        => '/var/www/disk/data',
'magick'      => '/usr/bin/magick',
'ffmpeg'      => '/usr/bin/ffmpeg',
'photo_dirs'  => ['iCloud', 'Облако Mail.ru/Camera Uploads'],
'thumb_slots' => 4,
```

- Нужен **ImageMagick 7**: приложение вызывает программу `magick`. В ImageMagick 6 (в некоторых дистрибутивах он ставится по умолчанию) её нет, есть только `convert`, и с ним миниатюры не создадутся. Путь указывайте полный, проверить его можно командой `command -v magick`.
- Для HEIC ImageMagick должен быть собран с libheif.
- Для PHP нужны расширения `mbstring`, `exif`, `fileinfo`, `gd`, `pdo_sqlite`, `sqlite3`, `zip`, а также консольный `php` (пакет php-cli) для `scan.php` и `pregen.php`.

Папка данных должна принадлежать пользователю веб-сервера, `config.php` ему достаточно читать:

```
mkdir -p /var/www/disk/data
chown -R www-data:www-data /var/www/disk/data
chown root:www-data /var/www/disk/config.php && chmod 640 /var/www/disk/config.php
```

Проверка ImageMagick и HEIC:

```
magick -version
magick -list format | grep -i heic
sudo -u www-data magick "/var/www/disk/share/iCloud/<файл>.HEIC" -thumbnail 320x320 /var/www/disk/data/t.jpg
```

### Общее

- `photo_dirs` — пути относительно корня (`root`), без самого корня в начале. Вложенные папки пишите через `/`. Пустой список означает весь корень.
- `thumb_slots` — число воркеров `pregen` плюс один слот для веб-запросов.

## 1. Первичный прогон

1. Положите фото в папки из `photo_dirs`.
2. Индексация (первый проход самый долгий, для HEIC около 60 мс на файл):

Windows:

```
H:\php85\php.exe H:\www\files\scan.php
```

Linux (от пользователя веб-сервера, чтобы базы и миниатюры получили правильного владельца):

```
sudo -u www-data php /var/www/disk/files/scan.php
```

3. Миниатюры: откройте три консоли и в каждой запустите свою долю. Новые снимки обрабатываются первыми, прерванный прогон можно продолжить, готовые миниатюры пропускаются.

Windows:

```
H:\php85\php.exe H:\www\files\pregen.php --shard=0/3 --minutes=600
H:\php85\php.exe H:\www\files\pregen.php --shard=1/3 --minutes=600
H:\php85\php.exe H:\www\files\pregen.php --shard=2/3 --minutes=600
```

Linux (можно в одной консоли, в фоне):

```
cd /var/www/disk/files
for i in 0 1 2; do sudo -u www-data php pregen.php --shard=$i/3 --minutes=600 > /var/www/disk/data/pregen$i.log 2>&1 & done
wait
```

Следите за загрузкой CPU. Если есть запас, добавьте воркеры (`--shard=i/4` и `thumb_slots` = 5). Ориентир: около 1 с на миниатюру HEIC в один поток.

## 2. Автоматизация

### Windows

`scan.ps1` (лежит в папке приложения) обновляет индекс и запускает три воркера `pregen`. Пути к PHP, приложению и логам заданы в его первой строке.

Ежедневная задача «NAS Photos» в 03:00 от SYSTEM создаётся файлом `install-task.cmd` (запустите от имени администратора). Он берёт `scan.ps1` из своей же папки.

```
H:\www\files\install-task.cmd
schtasks /Run /TN "NAS Photos"
```

Вторая команда запускает задачу вручную. Чтобы запускать каждые 2 часа, замените в `install-task.cmd` `/SC DAILY /ST 03:00` на `/SC HOURLY /MO 2`.

Логи: `D:\www\data\scan.log`, `pregen0.log`, `pregen0.err` (и для остальных воркеров).

### Linux

`scan.ps1` и `install-task.cmd` на Linux не нужны, их заменяет cron. Создайте файл `/etc/cron.d/nas-photos`:

```
# Ночное обновление индекса галереи и миниатюры (3 воркера)
0 3 * * * www-data cd /var/www/disk/files && php scan.php >> /var/www/disk/data/scan.log 2>&1; for i in 0 1 2; do php pregen.php --shard=$i/3 --minutes=300 > /var/www/disk/data/pregen$i.log 2> /var/www/disk/data/pregen$i.err & done; wait
```

Cron подхватывает файл сам. Чтобы запускать каждые 2 часа, замените `0 3 * * *` на `0 */2 * * *`. Ручной запуск — та же команда от `www-data` (см. раздел 1).

Логи: `/var/www/disk/data/scan.log`, `pregen0.log`, `pregen0.err` (и для остальных воркеров).

Повторный запуск, пока работает предыдущий, безопасен: `scan.php` и каждый воркер `pregen.php` держат блокировку и при повторном старте пишут `Уже запущен`.

## 3. Как работают повторные запуски

- `scan.php` каждый раз обходит все папки из `photo_dirs`, но для каждого файла читает только размер и дату изменения. EXIF читается только у новых и изменённых файлов. Записи об исчезнувших файлах удаляются из индекса.
- `pregen.php` идёт по индексу и пропускает файлы, для которых миниатюра уже есть или стоит маркер `.fail`.
- Итог «новых/изменённых 0» означает, что ничего заново не читалось.

## 4. Очистка галереи

Все варианты ниже затрагивают только галерею. `main.sqlite` не трогайте: История, Корзина и Избранное сохранятся.

### 4.1. Только миниатюры

Веб-сервер останавливать не нужно.

Windows:

```
rmdir /s /q D:\www\data\cache
```

Linux:

```
rm -rf /var/www/disk/data/cache
```

Затем запустите `pregen.php` (или дождитесь ночной задачи). Пока миниатюр нет, они создаются при первом просмотре, поэтому галерея будет медленнее.

### 4.2. Ложные маркеры неудач

Если миниатюры не создавались из-за временной проблемы (не было ImageMagick, не хватало прав):

Windows:

```
del /s /q D:\www\data\cache\*.fail
```

Linux:

```
find /var/www/disk/data/cache -name '*.fail' -delete
```

### 4.3. Полный сброс индекса

Windows:

```
schtasks /End /TN "NAS Photos"
net stop Apache2.4
del D:\www\data\photos.sqlite*
net start Apache2.4
H:\php85\php.exe H:\www\files\scan.php
```

Linux (вместо `apache2` подставьте свою службу, например `php8.3-fpm` для nginx):

```
pkill -f 'files/(scan|pregen).php'
systemctl stop apache2
rm -f /var/www/disk/data/photos.sqlite*
systemctl start apache2
sudo -u www-data php /var/www/disk/files/scan.php
```

После сброса `scan.php` заново прочитает даты съёмки у всех файлов. Миниатюры в `cache` останутся и будут использованы, если файлы не менялись. Сброс также удаляет старые таблицы Истории, Корзины и Избранного, которые лежали в `photos.sqlite` до разделения баз.

### 4.4. Изменение photo_dirs

Чистить ничего не нужно. После правки `config.php` запустите `scan.php`: записи из папок, которых больше нет в списке, удалятся из индекса автоматически. Их миниатюры останутся в `cache`; чтобы освободить место, выполните 4.1.

Если папка из `photo_dirs` в момент запуска недоступна (переименована, диск не подключён), сканер выведет `Пропуск photo_dirs` и тоже уберёт её записи. Когда папка вернётся, следующий запуск перечитает её целиком.

На Linux имена папок чувствительны к регистру: `iCloud` и `icloud` — разные папки, поэтому пишите их в `photo_dirs` точно так, как они называются на диске.

### 4.5. Резервная копия основной базы

Windows:

```
net stop Apache2.4
mkdir D:\www\data\backup
copy D:\www\data\main.sqlite* D:\www\data\backup\
net start Apache2.4
```

Linux:

```
systemctl stop apache2
mkdir -p /var/www/disk/data/backup
cp -p /var/www/disk/data/main.sqlite* /var/www/disk/data/backup/
systemctl start apache2
```

## 5. Диагностика

- Если в логах `pregen` растёт число ошибок, проверьте путь `magick` в `config.php` и права на папку данных.
- Права на `D:\www\data` (Windows): запись для учётной записи Apache (сейчас SYSTEM), SYSTEM и Администраторов с наследованием. На `H:\www\config.php` учётной записи Apache достаточно чтения.

```
icacls D:\www\data /grant "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F" /T /C
```

- Права на `/var/www/disk/data` (Linux): владелец `www-data`. Если `scan.php` или `pregen.php` по ошибке запускались от root, верните владельца, иначе веб-интерфейс не сможет писать в базы и кэш:

```
chown -R www-data:www-data /var/www/disk/data
```

- На Linux пользователю `www-data` нужно право на чтение файлов в корне (`root`) и на запись туда, если через интерфейс загружают, переименовывают и удаляют файлы.
- Миниатюры 1600 px для просмотрщика создаются при первом открытии снимка. Заранее для свежих фото: `pregen.php --w=1600 --minutes=60` (места нужно заметно больше).
- После обновления PHP или ImageMagick сначала проверьте `php -v` (`php.exe -v` на Windows), `magick -version` и права на папку данных.

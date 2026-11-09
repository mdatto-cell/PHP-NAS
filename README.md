# PHP-NAS

Лёгкий веб-интерфейс «Диск» для домашнего NAS на Windows: Apache + PHP (FastCGI), без базы данных, кроме SQLite. Дизайн в духе Яндекс Диска и Облака Mail.ru, адаптивная вёрстка для телефона.

## Возможности

- **Файлы:** список и плитки, дерево папок в боковом меню, сортировка, поиск по папке, хлебные крошки.
- **Операции:** загрузка файлов и целых папок (кнопка, перетаскивание, Shift+I / Shift+U), создание папки (Shift+F), переименование, перемещение, копирование, удаление, контекстное меню по правой кнопке, множественное выделение.
- **Скачивание:** файлов с поддержкой Range и папок архивом ZIP (`download.php`, расширение PHP `zip`).
- **Галерея:** лента фото и видео по дням, шкала времени, календарь, индекс в SQLite, фоновый сканер, HEIC через ImageMagick, превью видео через FFmpeg.
- **Просмотрщик:** фото, видео, аудио, PDF, текст; путь, размер, переименование, перемещение и удаление прямо из просмотра.
- **Корзина:** восстановление в исходную папку, удаление навсегда, очистка; превью удалённых файлов чистятся из кэша.
- **История** действий через веб-интерфейс и **Избранное** (хранится в SQLite).
- **Безопасность:** вход по паролю (`password_hash`), ограничение попыток входа, CSRF-токены (изменяющие действия API и выход только с токеном), защита от выхода за корень через `realpath`, `config.php` вне DocumentRoot, временные ZIP в папке данных с удалением при любом завершении скрипта.

## Требования

- Windows Server 2019/2022 (или Windows 10/11)
- Apache 2.4 (Apache Lounge) + `mod_fcgid`
- PHP 8.3+ NTS x64, расширения: `mbstring`, `exif`, `fileinfo`, `gd`, `pdo_sqlite`, `sqlite3`, `zip`, `openssl`
- ImageMagick с libheif (миниатюры и HEIC)
- FFmpeg (необязательно, превью видео)

## Установка

1. Скопируйте файлы репозитория в DocumentRoot, например `H:\www\files`.
2. Создайте папку данных вне DocumentRoot, например `D:\www\data`, и дайте учётной записи Apache права на запись.
3. Скопируйте `config.example.php` в `config.php` **на уровень выше** папки приложения (например, `H:\www\config.php`) и укажите `root`, `data`, пути к `magick` и `ffmpeg`.
4. Сгенерируйте хэш пароля и впишите его в `users`:
   ```
   php mkpass.php "ваш_пароль"
   ```
5. Первое сканирование галереи и генерация миниатюр:
   ```
   php scan.php
   php pregen.php --shard=0/3 --minutes=600
   php pregen.php --shard=1/3 --minutes=600
   php pregen.php --shard=2/3 --minutes=600
   ```
6. Ночное обновление через планировщик (от имени администратора): `install-task.cmd` создаёт задачу «NAS Photos» в 03:00 от SYSTEM, которая запускает `scan.ps1`.

Подробная инструкция по галерее: [docs/gallery.md](docs/gallery.md).

Пример блока `mod_fcgid` для `httpd.conf`:

```apache
LoadModule fcgid_module modules/mod_fcgid.so
<IfModule fcgid_module>
    FcgidInitialEnv PHPRC "H:/php85"
    FcgidMaxRequestLen 2147483647
    FcgidIOTimeout 300
    FcgidPassHeader Authorization
    <Files ~ "\.php$">
        Options +ExecCGI
        AddHandler fcgid-script .php
        FcgidWrapper "H:/php85/php-cgi.exe" .php
    </Files>
</IfModule>
DirectoryIndex index.php
```

## Данные

В папке `data` (из `config.php`) лежат:

| Файл / папка | Что хранит | Можно удалить? |
|---|---|---|
| `main.sqlite*` | История, Корзина (исходные пути), Избранное | Нет — данные потеряются |
| `photos.sqlite*` | Индекс галереи | Да, `scan.php` создаст заново |
| `cache\` | Миниатюры | Да, создадутся заново |
| `sessions\`, `throttle\`, `locks\`, `tmp\` | Служебное | Да (сессии — с повторным входом) |

Удаляя SQLite-базу, удаляйте её вместе с файлами `-wal` и `-shm` при остановленном Apache.

## Очистка галереи

Галерея хранится отдельно от остальных разделов, поэтому её можно сбросить, не трогая Историю, Корзину и Избранное (`main.sqlite`).

| Задача | Команды |
|---|---|
| Пересоздать миниатюры | `rmdir /s /q D:\www\data\cache`, затем `pregen.php` |
| Снять ложные маркеры неудач | `del /s /q D:\www\data\cache\*.fail` |
| Полный сброс индекса | `schtasks /End /TN "NAS Photos"`, `net stop Apache2.4`, `del D:\www\data\photos.sqlite*`, `net start Apache2.4`, `php scan.php` |
| Изменили `photo_dirs` | Ничего не чистить: `scan.php` сам уберёт записи из исключённых папок |

Если папка из `photo_dirs` во время сканирования недоступна, её записи удаляются из индекса и перечитываются, когда папка вернётся. Подробности: [docs/gallery.md](docs/gallery.md#4-очистка-галереи).

## Обновление с предыдущей версии

- `config.php` теперь читается на уровень выше папки приложения: перенесите `H:\www\files\config.php` в `H:\www\config.php`.
- История, Корзина и Избранное хранятся в новой базе `main.sqlite` (создаётся автоматически, без переноса данных). Старые таблицы в `photos.sqlite` больше не используются.
- `scan.cmd` удалён, вместо него `scan.ps1` и `install-task.cmd`.

## Публикация в интернет

Не открывайте Apache напрямую. Ставьте перед ним nginx с HTTPS (передавайте `X-Forwarded-Proto: https` и `X-Forwarded-For`, в Apache включите `mod_remoteip` с доверием только к адресу nginx) или пускайте доступ через VPN.

## Структура

| Файл | Назначение |
|---|---|
| `index.php`, `login.php`, `logout.php` | Страницы приложения и входа |
| `api.php` | JSON API: список, операции, корзина, история, избранное |
| `upload.php`, `file.php`, `download.php` | Загрузка, отдача файлов, ZIP |
| `thumb.php`, `thumblib.php` | Миниатюры и кэш |
| `photos.php`, `photos_lib.php`, `scan.php`, `pregen.php` | Галерея, индекс, генерация превью |
| `lib.php`, `fslib.php` | Общие функции, корзина, история |
| `app.js`, `photos.js`, `trash.js`, `viewer.js`, `icons.js` | Интерфейс |
| `scan.ps1`, `install-task.cmd` | Ночная задача и её установка |
| `docs/gallery.md` | Инструкция по галерее |

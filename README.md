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
- **Безопасность:** вход по паролю (`password_hash`), ограничение попыток входа, CSRF-токены, защита от выхода за корень через `realpath`.

## Требования

- Windows Server 2019/2022 (или Windows 10/11)
- Apache 2.4 (Apache Lounge) + `mod_fcgid`
- PHP 8.3+ NTS x64, расширения: `mbstring`, `exif`, `fileinfo`, `gd`, `pdo_sqlite`, `sqlite3`, `zip`, `openssl`
- ImageMagick с libheif (миниатюры и HEIC)
- FFmpeg (необязательно, превью видео)

## Установка

1. Скопируйте файлы репозитория в DocumentRoot, например `H:\www\files`.
2. Создайте папку данных вне DocumentRoot, например `D:\www\data`, и дайте учётной записи Apache права на запись.
3. Скопируйте `config.example.php` в `config.php` и укажите `root`, `data`, пути к `magick` и `ffmpeg`.
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
6. Ночное обновление через планировщик:
   ```
   schtasks /Create /TN "NAS Photos" /SC DAILY /ST 03:00 /RU SYSTEM /RL HIGHEST /TR "powershell -NoProfile -ExecutionPolicy Bypass -File H:\www\files\scan.ps1"
   ```

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
| `scan.ps1`, `scan.cmd` | Задача планировщика |

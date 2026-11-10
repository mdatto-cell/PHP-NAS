<?php
// Скопируйте этот файл в config.php на уровень ВЫШЕ папки приложения
// (например, приложение в H:\www\files, конфиг в H:\www\config.php) и подставьте свои значения.
// config.php в репозиторий не попадает (см. .gitignore).
return [
    // Папка, которая показывается в веб-интерфейсе
    'root' => 'H:\\share',

    // Служебные данные: сессии, кэш миниатюр, SQLite, блокировки.
    // Должна лежать ВНЕ DocumentRoot, лучше на SSD.
    'data' => 'D:\\www\\data',

    // Пользователи: логин => хэш пароля.
    // Хэш: php mkpass.php "ваш_пароль"
    'users' => [
        'admin' => '$2y$10$REPLACE_WITH_HASH_FROM_MKPASS_PHP',
    ],

    // ImageMagick с поддержкой HEIC (libheif) и FFmpeg для превью видео
    'magick' => 'C:\\Program Files\\ImageMagick\\magick.exe',
    'ffmpeg' => 'C:\\ffmpeg\\bin\\ffmpeg.exe',

    // Сколько конвертаций превью одновременно (воркеры pregen + 1)
    'thumb_slots' => 4,

    // Галерея
    'photo_dirs'     => [],                        // пусто = вся root; или ['iCloud', 'Фото']
    'photo_exclude'  => ['node_modules', 'cache'], // имена папок, которые пропускать
    'photo_min_size' => 30720,                     // файлы меньше 30 КБ не считать фото
    'heic_exif'      => true,                      // дата съёмки HEIC через magick identify -ping

    // Символические ссылки на папки внутри root (mklink /D "H:\\share\\Медиа" "E:\\Media"):
    //   false — ссылки, ведущие за пределы root, не открываются;
    //   true  — открываются любые ссылки;
    //   ['E:\\Media', '\\\\server\\share'] — только ссылки, цель которых лежит внутри этих папок (рекомендуется).
    // Папки-ссылки помечаются значком «шары». В галерею (индекс фото) они не попадают.
    'symlinks' => false,

    // Просмотр Word (docx) и Excel (xlsx, xls, ods) в браузере; false — отключить
    'office_view' => true,

    // «Поделиться» — публичные ссылки на скачивание файла или папки (ZIP).
    // По умолчанию выключено: без 'share' => true раздел и пункты меню не показываются, share.php отвечает 404.
    'share' => false,
    // Адрес share.php для формирования ссылок в интерфейсе:
    //   ''  — share.php этого же сайта (NAS в локальной сети или весь сайт опубликован через nginx);
    //   'https://files.example.com/share.php' — внешний адрес (отдельный DocumentRoot/порт или location в nginx).
    'share_url' => '',
];

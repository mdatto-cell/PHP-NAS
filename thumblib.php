<?php
declare(strict_types=1);

// -> ['img'|'vid', путь к кэшу] или null, если тип не поддерживается / программа не настроена
function thumb_info(string $full, int $w): ?array {
    $coders = ['jpg'=>'jpeg','jpeg'=>'jpeg','png'=>'png','gif'=>'gif','webp'=>'webp','heic'=>'heic','heif'=>'heic',
               'avif'=>'avif','tif'=>'tiff','tiff'=>'tiff','bmp'=>'bmp'];
    $videos = ['mp4','mov','m4v','mkv','avi','webm'];
    $ext = ext_of($full);
    $magick = (string)cfg('magick'); $ffmpeg = (string)cfg('ffmpeg');
    if (isset($coders[$ext]) && $magick !== '' && is_file($magick)) $type = 'img';
    elseif (in_array($ext, $videos, true) && $ffmpeg !== '' && is_file($ffmpeg)) $type = 'vid';
    else return null;
    $key = sha1($full . '|' . filemtime($full) . '|' . filesize($full) . '|' . $w);
    $dir = cfg('data') . '\\cache\\' . substr($key, 0, 2); ensure_dir($dir);
    return [$type, $dir . '\\' . $key . '.jpg', $coders[$ext] ?? ''];
}

function thumb_make(string $full, int $w, int $wait = 60): ?string {
    $info = thumb_info($full, $w);
    if (!$info) return null;
    [$type, $out, $coder] = $info;
    if (is_file($out)) return $out;
    if (is_file($out . '.fail')) return null;

    $lockdir = cfg('data') . '\\locks'; ensure_dir($lockdir);
    $slots = max(1, (int)(cfg('thumb_slots') ?? 3)); $lock = null; $t0 = time();
    while ($lock === null && time() - $t0 < $wait) {
        for ($i = 0; $i < $slots; $i++) {
            $h = fopen($lockdir . "\\slot$i.lock", 'c');
            if ($h && flock($h, LOCK_EX | LOCK_NB)) { $lock = $h; break; }
            if ($h) fclose($h);
        }
        if ($lock === null) usleep(150000);
    }
    if ($lock === null) return null;
    if (is_file($out)) { flock($lock, LOCK_UN); fclose($lock); return $out; }

    $tmp = $out . '.tmp.jpg'; $ok = false;
    if ($type === 'img') {
        $ok = run_cmd([cfg('magick'), '-limit', 'memory', '512MiB', '-limit', 'map', '1GiB', '-limit', 'time', '60',
            $coder . ':-', '-flatten', '-auto-orient', '-thumbnail', "{$w}x{$w}>",
            '-background', 'white', '-strip', '-quality', '82', 'jpeg:' . $tmp], $full);
    } else {
        foreach (['1', '0'] as $ss) {
            $ok = run_cmd([cfg('ffmpeg'), '-v', 'error', '-y', '-ss', $ss, '-i', $full, '-frames:v', '1',
                '-vf', 'scale=' . min($w, 640) . ':-2', '-q:v', '4', $tmp], null, 60);
            if ($ok && is_file($tmp) && filesize($tmp) > 0) break;
        }
    }
    if ($ok && is_file($tmp) && filesize($tmp) > 0) rename($tmp, $out);
    else { @unlink($tmp); @touch($out . '.fail'); }
    flock($lock, LOCK_UN); fclose($lock);
    return is_file($out) ? $out : null;
}

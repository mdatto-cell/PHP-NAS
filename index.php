<?php
require __DIR__ . '/lib.php';
boot('page');
?><!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="csrf" content="<?= htmlspecialchars($_SESSION['csrf']) ?>">
<meta name="user" content="<?= htmlspecialchars($_SESSION['u']) ?>">
<meta name="office" content="<?= cfg('office_view') === false ? '0' : '1' ?>">
<meta name="share" content="<?= cfg('share') === true ? '1' : '0' ?>">
<meta name="share-url" content="<?= htmlspecialchars(is_string(cfg('share_url')) ? cfg('share_url') : '') ?>">
<title>Диск</title>
<link rel="stylesheet" href="style.css?v=4"><link rel="stylesheet" href="photos.css?v=4"><link rel="stylesheet" href="ui2.css?v=4"><link rel="stylesheet" href="ui3.css?v=7"></head>
<body>
<div id="app">
  <aside id="side">
    <div class="logo">Диск</div>
    <button class="btn primary" id="btnUpload"><span class="i" data-i="upload"></span>Загрузить</button>
    <button class="btn" id="btnMkdir"><span class="i" data-i="plus"></span>Папку</button>
    <input type="file" id="fileInput" multiple hidden>
    <nav>
      <a href="#/" id="navFiles" class="navitem active"><span class="i" data-i="folder"></span>Файлы</a>
      <a href="#photos" id="navPhotos" class="navitem"><span class="i" data-i="photo"></span>Фото</a>
      <a href="#trash" id="navTrash" class="navitem"><span class="i" data-i="trash"></span>Корзина</a>
      <a href="#history" id="navHistory" class="navitem"><span class="i" data-i="history"></span>История</a>
    </nav>
    <div class="space"><div class="bar"><i id="spaceBar"></i></div><span id="spaceTxt"></span></div>
    <a href="logout.php?t=<?= urlencode($_SESSION['csrf']) ?>" class="navitem logout"><span class="i" data-i="logout"></span>Выйти (<span id="uname"></span>)</a>
  </aside>
  <main id="main">
    <header id="top">
      <button id="burger" class="icon" data-i="menu"></button>
      <div id="crumbs"></div>
      <span id="topx"></span>
      <input id="filter" type="search" placeholder="Поиск в папке">
      <select id="sort"><option value="name">По названию</option><option value="date">По дате</option><option value="size">По размеру</option></select>
      <button id="viewBtn" class="icon" title="Вид"></button>
    </header>
    <section id="list"></section>
    <section id="photos" hidden><div id="pinfo"></div><div id="pgrid"></div><div id="psent"></div></section>
    <section id="trashv" hidden></section>
    <section id="histv" hidden></section>
    <div id="prail"></div>
    <div id="pbub" hidden></div>
    <button id="ptop" class="btn" hidden><span class="i" data-i="up"></span>К новым</button>
    <div id="cal" hidden></div>
    <div id="empty" hidden>Папка пуста</div>
    <div id="drop" hidden>Отпустите файлы для загрузки</div>
  </main>
</div>
<div id="menu" hidden></div>
<div id="modal" hidden></div>
<div id="viewer" hidden>
  <div class="vbar"><span id="vname"></span><span class="sp"></span>
    <a id="vdl" class="icon" title="Скачать" data-i="download"></a><button id="vclose" class="icon" data-i="close"></button></div>
  <button id="vprev" class="nav" data-i="chevL"></button><div id="vbody"></div><button id="vnext" class="nav" data-i="chevR"></button>
</div>
<div id="uploads" hidden></div>
<script src="icons.js?v=7"></script>
<script src="app.js?v=12"></script>
<script src="photos.js?v=5"></script>
<script src="trash.js?v=7"></script>
<script src="viewer.js?v=21"></script>
<script src="share.js?v=8"></script>
<script src="select.js?v=4"></script>
<script src="mobile.js?v=5"></script>
<script>load();</script>
</body></html>

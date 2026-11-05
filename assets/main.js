/* Velisa Putri portfolio.
   No libraries or build step. All content comes from data/*.json, which is what
   Pages CMS edits, so every animation below has to work with whatever photos
   and words are in those files. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // The red-pencil scribble, drawn by animating the stroke along its length.
  var CIRCLE = 'M26 46C27 18 88 5 138 8c47 3 60 26 53 45-9 21-85 27-134 20C20 68 3 49 13 30 21 15 52 9 80 7';
  var RECT = 'M2 3 98 1.5l.8 127L1.4 129 2.6.6';

  function pencilSvg(d, cls, box) {
    return '<svg class="' + cls + '" viewBox="' + box + '" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + d + '"/></svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // CMS paths start with "/". Strip it so they resolve relative to the page.
  function fixPath(p) {
    p = String(p || '');
    if (/^https?:\/\//i.test(p)) return p;
    return p.charAt(0) === '/' ? p.slice(1) : p;
  }

  function fetchJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Headings: split into masked words, last word italic + pencil ---------- */
  function splitWords(el, text, opts) {
    opts = opts || {};
    var words = String(text).trim().split(/\s+/);
    var html = '<span class="sr">' + esc(text) + '</span><span aria-hidden="true">';
    words.forEach(function (w, i) {
      var last = i === words.length - 1;
      var inner = '<span class="w"><span class="wi" style="--i:' + i + '">' + (last ? '<em>' + esc(w) + '</em>' : esc(w)) + '</span></span>';
      if (last && opts.pencil) {
        inner = '<span class="pw">' + inner + pencilSvg(CIRCLE, 'pencil', '0 0 200 80') + '</span>';
      }
      html += inner + (last ? '' : ' ');
    });
    el.innerHTML = html + '</span>';
    var path = $('.pencil path', el);
    if (path && opts.pencilDelay != null) path.style.setProperty('--pd', opts.pencilDelay + 'ms');
  }

  /* ---------- Scroll reveal ---------- */
  var revealObs = null;
  if ('IntersectionObserver' in window && !reduced) {
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        revealObs.unobserve(el);
        // After the reveal, hand the element back to its normal hover timing.
        setTimeout(function () { el.classList.add('done'); }, 1700);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  function reveal(el) {
    if (revealObs) revealObs.observe(el);
    else { el.classList.add('in'); el.classList.add('done'); }
  }

  /* ---------- Hero reel ---------- */
  var reel = { imgs: [], cur: -1, z: 1, timer: null, visible: true };
  var paused = false;

  function setFrame(i) {
    var el = $('#frameNo');
    if (el) el.textContent = 'FR ' + pad(i + 1) + ' / ' + pad(reel.imgs.length);
  }

  function showFrame(i) {
    var prev = reel.imgs[reel.cur];
    var next = reel.imgs[i];
    next.style.zIndex = ++reel.z;
    next.classList.add('on');
    if (prev && prev !== next) prev.classList.remove('on');
    reel.cur = i;
    setFrame(i);
  }

  function wipeTo(i) {
    var prev = reel.imgs[reel.cur];
    var next = reel.imgs[i];
    if (!next.complete || !next.naturalWidth) return Promise.resolve();
    next.style.zIndex = ++reel.z;
    next.classList.add('on');
    var from = i % 2 ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)';
    var anim = next.animate(
      [{ clipPath: from, transform: 'scale(1.12)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }],
      { duration: 1050, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
    reel.cur = i;
    setFrame(i);
    return anim.finished.then(function () {
      if (prev && prev !== next) prev.classList.remove('on');
    }).catch(function () {});
  }

  function scheduleReel() {
    clearTimeout(reel.timer);
    if (reduced || reel.imgs.length < 2) return;
    reel.timer = setTimeout(function () {
      if (!paused && reel.visible && !document.hidden) {
        wipeTo((reel.cur + 1) % reel.imgs.length);
      }
      scheduleReel();
    }, 4200);
  }

  // Frames finish on the hero photo, so that's the one the visitor lands on.
  function buildReel(frames) {
    var stage = $('#stage');
    stage.innerHTML = '';
    reel.imgs = frames.map(function (src, i) {
      var im = new Image();
      im.alt = '';
      im.className = 'reel-img';
      if (i === frames.length - 1) im.fetchPriority = 'high';
      im.src = src;
      stage.appendChild(im);
      return im;
    });
  }

  function decoded(img) {
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  }

  function playHero(frames) {
    var hero = $('.hero');
    var frame = $('#frame');
    buildReel(frames);
    hero.classList.add('ready');
    $('#headline').classList.add('in');

    var last = reel.imgs.length - 1;
    if (reduced || last < 1) {
      showFrame(last);
      frame.classList.remove('hunt');
      return;
    }

    // Focus-hunting corners while the burst loads, but never hold the page up.
    return Promise.race([Promise.all(reel.imgs.map(decoded)), wait(1400)]).then(function () {
      var ready = reel.imgs
        .map(function (im, i) { return im.complete && im.naturalWidth ? i : -1; })
        .filter(function (i) { return i > -1 && i < last; });

      var run = Promise.resolve();
      // One cut every 340ms stays under the 3-per-second photosensitivity limit.
      ready.forEach(function (i) {
        run = run.then(function () { showFrame(i); return wait(340); });
      });
      return run;
    }).then(function () {
      showFrame(last);
      frame.classList.remove('hunt');
      reel.imgs[last].animate(
        [{ transform: 'scale(1.09)' }, { transform: 'scale(1)' }],
        { duration: 1500, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
      var btn = $('#pauseBtn');
      btn.hidden = false;
      scheduleReel();
    });
  }

  /* ---------- Site content ---------- */
  function statsHtml(stats) {
    return stats.map(function (s) {
      return '<div><dt>' + esc(s.label) + '</dt><dd>' + esc(s.value) + '</dd></div>';
    }).join('');
  }

  function renderContent(s) {
    if (s.name) {
      var parts = s.name.trim().split(/\s+/);
      var lastName = parts.pop();
      $('#logo').innerHTML = esc(parts.join(' ')) + ' <em>' + esc(lastName) + '</em>';
    }
    if (s.tagline) {
      var h = $('#headline');
      var wasIn = h.classList.contains('in');
      splitWords(h, s.tagline, { pencil: true, pencilDelay: 1700 });
      if (wasIn) h.classList.add('in');
    }
    // Once site.json has loaded it decides what shows. A field that's empty or
    // missing gets hidden, not replaced with the built-in text from index.html
    // (which is only there for when the data file can't be loaded at all).
    var introText = String(s.intro || '').trim();
    var intro = $('#intro');
    intro.textContent = introText;
    intro.hidden = !introText;

    if (s.aboutImage) $('#aboutImg').src = fixPath(s.aboutImage);
    if (s.bio) {
      $('#aboutBio').innerHTML = s.bio.split(/\n\s*\n/).map(function (par) {
        return '<p>' + esc(par.trim()) + '</p>';
      }).join('');
    }
    var stats = (s.stats || []).filter(function (x) { return x && x.label && x.value; });
    ['#heroStats', '#aboutStats'].forEach(function (id) {
      var el = $(id);
      el.innerHTML = statsHtml(stats);
      el.hidden = !stats.length;
    });

    // No services left: hide the whole section and its menu link.
    var services = (s.highlights || []).filter(function (x) { return x && x.title; });
    var list = $('#facts');
    list.innerHTML = services.map(function (h, i) {
      return '<li class="svc" data-reveal><a href="#contact"><span class="svc-no">' + pad(i + 1) + '</span><h3>' + esc(h.title) + '</h3><p>' + esc(h.subtitle || '') + '</p><span class="svc-go" aria-hidden="true">→</span></a></li>';
    }).join('');
    $$('.svc', list).forEach(reveal);
    $('#services').hidden = !services.length;
    $('#navlinks a[href="#services"]').hidden = !services.length;

    var comp = $('#compCard');
    if (s.compCard) comp.href = fixPath(s.compCard);
    else comp.hidden = true;

    if (s.email) {
      var subject = 'Working with ' + (s.name || 'Velisa Putri');
      var body = 'Hi ' + ((s.name || 'Velisa').split(' ')[0]) + ',\n\nBrand or client:\nWhat you need (modeling, UGC, brand deal, something else):\nDates:\nLocation:\nBudget:\n\n';
      $('#emailBtn').href = 'mailto:' + s.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      $('#copyBtn').dataset.email = s.email;
    }
    var ig = $('#igBtn');
    if (s.instagram) ig.href = 'https://instagram.com/' + encodeURIComponent(s.instagram);
    else ig.hidden = true;
    var tt = $('#ttBtn');
    if (s.tiktok) tt.href = 'https://tiktok.com/@' + encodeURIComponent(s.tiktok);
    else tt.hidden = true;

    renderTicker(s.brands);
  }

  /* ---------- Brand ticker ---------- */
  var ticker = { x: 0, setW: 0, active: false, hover: false, visible: true };

  function renderTicker(brands) {
    var section = $('#ticker');
    var track = $('#tickerTrack');
    var names = (brands || []).map(function (b) { return b && b.name; }).filter(Boolean);
    if (!names.length) { section.hidden = true; return; }
    section.hidden = false;

    var x = '<svg class="t-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5c5 4 11 10 16 15M20 4C14 9 9 15 4 20"/></svg>';
    var set = '<div class="ticker-set"><span class="t-label">Worked with</span>' + names.map(function (n) {
      return '<span class="t-brand">' + esc(n) + '</span>' + x;
    }).join('') + '</div>';

    if (reduced) {
      section.classList.add('static');
      track.innerHTML = set;
      return;
    }
    track.innerHTML = set;
    measureTicker(set);
  }

  function measureTicker(set) {
    var section = $('#ticker');
    var track = $('#tickerTrack');
    var first = track.firstElementChild;
    if (!first) return;
    ticker.setW = first.getBoundingClientRect().width;
    if (!ticker.setW) return;
    // Enough copies to fill the width, plus one to scroll into.
    var copies = Math.ceil(section.offsetWidth / ticker.setW) + 1;
    var clones = '';
    for (var i = 0; i < copies; i++) clones += set.replace('class="ticker-set"', 'class="ticker-set" aria-hidden="true"');
    track.innerHTML = set + clones;
    ticker.active = true;
    ticker.set = set;
  }

  /* ---------- Gallery ---------- */
  var photos = [];
  var galleryCols = 0;
  var FALLBACK_PHOTOS = [
    { image: 'images/velisa-04.jpg', alt: 'Smiling portrait of Velisa Putri' },
    { image: 'images/velisa-02.jpg', alt: 'Velisa Putri in a garden editorial' },
    { image: 'images/velisa-03.jpg', alt: 'Velisa Putri in an outdoor lifestyle shot' }
  ];

  function colCount() {
    return window.innerWidth < 640 ? 2 : 3;
  }

  function renderGallery() {
    var g = $('#gallery');
    var n = colCount();
    galleryCols = n;
    var cols = [];
    for (var c = 0; c < n; c++) cols.push('');
    photos.forEach(function (p, i) {
      var num = pad(i + 1) + 'A';
      cols[i % n] +=
        '<figure class="shot" data-col="' + (i % n) + '" style="--delay:' + ((i % n) * 90) + 'ms">' +
          '<button class="shot-btn" type="button" data-i="' + i + '" aria-label="Enlarge photo ' + (i + 1) + ': ' + esc(p.alt) + '">' +
            '<span class="shot-mask"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async"></span>' +
            pencilSvg(RECT, 'shot-mark', '0 0 100 130') +
          '</button>' +
          '<figcaption class="shot-label" aria-hidden="true"><span>' + num + '</span><span class="pick">Enlarge +</span></figcaption>' +
        '</figure>';
    });
    g.innerHTML = cols.map(function (c) { return '<div class="g-col">' + c + '</div>'; }).join('');

    $$('.shot', g).forEach(function (shot) {
      var img = $('img', shot);
      var setRatio = function () {
        if (img.naturalWidth) $('.shot-mask', shot).style.setProperty('--ar', img.naturalWidth + '/' + img.naturalHeight);
      };
      if (img.complete) setRatio(); else img.addEventListener('load', setRatio);
      reveal(shot);
    });
    $('#frameCount').textContent = photos.length + ' frames · Tap to enlarge';
  }

  /* ---------- Lightbox (the old one never opened: an overlay blocked the click) ---------- */
  var lb = { el: null, i: 0, origin: null };

  function setLightbox(i) {
    lb.i = (i + photos.length) % photos.length;
    var p = photos[lb.i];
    var im = $('#lbImg');
    im.src = p.src;
    im.alt = p.alt;
    $('#lbCount').textContent = pad(lb.i + 1) + ' / ' + pad(photos.length);
    $('#lbCap').textContent = p.alt;
    return im.decode ? im.decode().catch(function () {}) : Promise.resolve();
  }

  function originImg(i) {
    var b = $('.shot-btn[data-i="' + i + '"]');
    return b ? $('img', b) : null;
  }

  function inViewport(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function openLightbox(i) {
    var from = originImg(i);
    var lbImg = $('#lbImg');
    var open = function () {
      return setLightbox(i).then(function () {
        lb.el.showModal();
        document.documentElement.classList.add('lb-open');
      });
    };
    if (document.startViewTransition && !reduced && from) {
      from.style.viewTransitionName = 'shot';
      var vt = document.startViewTransition(function () {
        from.style.viewTransitionName = '';
        lbImg.style.viewTransitionName = 'shot';
        return open();
      });
      vt.finished.finally(function () { lbImg.style.viewTransitionName = ''; });
    } else {
      open();
    }
  }

  function closeLightbox() {
    var to = originImg(lb.i);
    var lbImg = $('#lbImg');
    var close = function () {
      lb.el.close();
      document.documentElement.classList.remove('lb-open');
    };
    if (document.startViewTransition && !reduced && to && inViewport(to)) {
      lbImg.style.viewTransitionName = 'shot';
      var vt = document.startViewTransition(function () {
        lbImg.style.viewTransitionName = '';
        to.style.viewTransitionName = 'shot';
        close();
      });
      vt.finished.finally(function () { to.style.viewTransitionName = ''; });
    } else {
      close();
    }
  }

  function stepLightbox(dir) {
    var im = $('#lbImg');
    setLightbox(lb.i + dir).then(function () {
      if (reduced || !im.animate) return;
      im.animate(
        [{ opacity: 0, transform: 'translateX(' + (dir * 34) + 'px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    });
  }

  function initLightbox() {
    lb.el = $('#lb');
    $('#gallery').addEventListener('click', function (e) {
      var btn = e.target.closest('.shot-btn');
      if (btn) openLightbox(parseInt(btn.dataset.i, 10));
    });
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', function () { stepLightbox(-1); });
    $('#lbNext').addEventListener('click', function () { stepLightbox(1); });
    lb.el.addEventListener('click', function (e) { if (e.target === lb.el || e.target.classList.contains('lb-fig')) closeLightbox(); });
    lb.el.addEventListener('cancel', function (e) { e.preventDefault(); closeLightbox(); });
    lb.el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    });
    var sx = 0;
    lb.el.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.el.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------- Videos ---------- */
  function loadScriptOnce(src, onload) {
    if ($('script[src="' + src + '"]')) { if (onload) onload(); return; }
    var s = document.createElement('script');
    s.src = src; s.async = true;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  }

  // Instagram refuses to embed some posts, and blockers can stop embeds entirely.
  // Either way the frame never grows, so swap the blank box for a link to the post.
  // Keeps checking for a while, so a slow embed still replaces the link when it arrives.
  function watchEmbeds(grid) {
    var start = Date.now();
    var timer = setInterval(function () {
      var elapsed = Date.now() - start;
      var waiting = 0;
      $$('.vbox', grid).forEach(function (box) {
        var frame = $('iframe', box);
        var loaded = !!frame && frame.offsetHeight > 50;
        $('.vfallback', box).hidden = loaded || elapsed < 10000;
        if (!loaded) waiting++;
      });
      if (!waiting || elapsed > 60000) clearInterval(timer);
    }, 1000);
  }

  function renderVideos(list) {
    var html = '';
    var tiktok = false, insta = false, count = 0;
    (list || []).forEach(function (v) {
      var url = String(v.url || '').trim().split('?')[0] // drop share-tracking params
        .replace(/(instagram\.com\/)reels\//i, '$1reel/'); // /reels/ links embed as a blank card
      if (!url) return;
      var embed = '';
      if (url.indexOf('tiktok.com') > -1) {
        tiktok = true;
        var m = url.match(/\/video\/(\d+)/);
        embed = '<blockquote class="tiktok-embed" cite="' + esc(url) + '" data-video-id="' + esc(m ? m[1] : '') + '"><section></section></blockquote>';
      } else if (url.indexOf('instagram.com') > -1) {
        insta = true;
        embed = '<blockquote class="instagram-media" data-instgrm-permalink="' + esc(url) + '" data-instgrm-version="14"></blockquote>';
      }
      if (!embed) return;
      count++;
      html += '<article class="vcard" data-reveal style="--delay:' + (Math.min(count, 4) * 80) + 'ms">' +
        '<p class="vlabel"><span>' + pad(count) + '</span><b>' + esc(v.caption || 'Reel') + '</b></p>' +
        '<div class="vbox">' + embed +
          '<a class="vfallback" href="' + esc(url) + '" target="_blank" rel="noopener" hidden>' +
            '<span class="vf-brand">' + esc(v.caption || 'Reel') + '</span>' +
            '<span class="vf-go">Watch on ' + (url.indexOf('tiktok.com') > -1 ? 'TikTok' : 'Instagram') + ' →</span>' +
          '</a></div></article>';
    });
    if (!html) return;

    var grid = $('#videoGrid');
    grid.innerHTML = html;
    $('#video').hidden = false;
    $('#navVideos').hidden = false;
    $$('.vcard', grid).forEach(reveal);
    $$('[data-reveal],[data-words]', $('#video')).forEach(function (el) {
      if (!el.classList.contains('vcard')) reveal(el);
    });

    // The embed scripts are heavy, so only fetch them as the section gets close.
    var loadEmbeds = function () {
      if (tiktok) loadScriptOnce('https://www.tiktok.com/embed.js');
      if (insta) {
        loadScriptOnce('https://www.instagram.com/embed.js', function () {
          if (window.instgrm) window.instgrm.Embeds.process();
        });
      }
      watchEmbeds(grid);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); loadEmbeds(); }
      }, { rootMargin: '700px 0px' });
      io.observe($('#video'));
    } else {
      loadEmbeds();
    }

    // Rail arrows
    var nav = $('#railNav'), prev = $('#railPrev'), next = $('#railNext');
    var sync = function () {
      var max = grid.scrollWidth - grid.clientWidth;
      nav.hidden = max < 8;
      prev.disabled = grid.scrollLeft < 8;
      next.disabled = grid.scrollLeft > max - 8;
    };
    var step = function (d) {
      var card = $('.vcard', grid);
      grid.scrollBy({ left: d * (card.offsetWidth + 24), behavior: reduced ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    grid.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- Services: a photo follows the cursor over each row ---------- */
  var float = { el: null, img: null, x: 0, y: 0, tx: 0, ty: 0, on: false };

  function initFloat() {
    if (reduced || !window.matchMedia('(hover:hover) and (min-width:1100px)').matches) return;
    float.el = $('#float');
    float.img = $('img', float.el);
    var list = $('#facts');
    list.addEventListener('pointermove', function (e) {
      // Stays in the empty column beside the titles, with a little sideways sway.
      var desc = $('.svc p', list);
      var h = float.el.offsetHeight;
      var w = float.el.offsetWidth;
      var home = desc.getBoundingClientRect().left - w - 24;
      float.tx = home + (e.clientX / window.innerWidth - 0.5) * 24;
      float.ty = Math.max(76, Math.min(window.innerHeight - h - 12, e.clientY - h / 2));
      if (!float.on) { float.x = float.tx; float.y = float.ty; }
    });
    list.addEventListener('pointerover', function (e) {
      var row = e.target.closest('.svc');
      if (!row || !photos.length) return;
      var i = $$('.svc', list).indexOf(row);
      var p = photos[(i * 2) % photos.length];
      if (float.img.getAttribute('src') !== p.src) float.img.src = p.src;
      float.on = true;
      float.el.classList.add('show');
    });
    list.addEventListener('pointerleave', function () {
      float.on = false;
      float.el.classList.remove('show');
    });
  }

  /* ---------- One animation loop for everything tied to scroll ---------- */
  function startLoop() {
    if (reduced) return;
    var work = $('#work'), gallery = $('#gallery'), perfs = $$('.perf');
    var frame = $('#frame'), aboutImg = $('#aboutImg'), aboutBox = $('.about-photo');
    var last = performance.now(), lastY = window.scrollY, vel = 0;
    var drift = [-34, 46, -18, 58];

    function tick(now) {
      var dt = Math.min(now - last, 50) / 1000;
      last = now;
      var y = window.scrollY;
      vel += ((y - lastY) - vel) * 0.12;
      lastY = y;
      var vh = window.innerHeight;

      // Ticker speeds up with scroll velocity.
      if (ticker.active && ticker.setW && !paused && !ticker.hover) {
        ticker.x -= (70 + Math.min(Math.abs(vel) * 34, 700)) * dt;
        if (ticker.x <= -ticker.setW) ticker.x += ticker.setW;
        $('#tickerTrack').style.transform = 'translate3d(' + ticker.x.toFixed(1) + 'px,0,0)';
      }

      // Hero frame eases up slightly as you leave.
      if (window.innerWidth > 900 && y < vh * 1.2) {
        frame.style.transform = 'translate3d(0,' + (y * -0.045).toFixed(1) + 'px,0)';
      }

      // Film perforations and gallery columns.
      var wr = work.getBoundingClientRect();
      if (wr.bottom > 0 && wr.top < vh) {
        var shift = -(y * 0.28 % 36);
        perfs.forEach(function (p) { p.style.transform = 'translate3d(' + shift.toFixed(1) + 'px,0,0)'; });
        if (window.innerWidth >= 900) {
          var gr = gallery.getBoundingClientRect();
          var prog = ((vh - gr.top) / (vh + gr.height)) * 2 - 1;
          var cols = gallery.children;
          for (var c = 0; c < cols.length; c++) {
            cols[c].style.transform = 'translate3d(0,' + (prog * drift[c % drift.length]).toFixed(1) + 'px,0)';
          }
        }
      }

      // About photo parallax.
      var ar = aboutBox.getBoundingClientRect();
      if (ar.bottom > 0 && ar.top < vh) {
        var p = (ar.top + ar.height) / (vh + ar.height);
        aboutImg.style.transform = 'translate3d(0,' + (-(1 - p) * 15).toFixed(2) + '%,0)';
      }

      // Cursor-follow photo.
      if (float.el) {
        float.x += (float.tx - float.x) * 0.14;
        float.y += (float.ty - float.y) * 0.14;
        float.el.style.transform = 'translate3d(' + float.x.toFixed(1) + 'px,' + float.y.toFixed(1) + 'px,0) rotate(' + Math.max(-5, Math.min(5, (float.tx - float.x) * 0.04)).toFixed(2) + 'deg)';
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Small interactions ---------- */
  function initChrome() {
    var nav = $('#nav'), root = document.documentElement, btn = $('#menuBtn');
    var setMenu = function (open) {
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    btn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $('#navlinks').addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

    $('#pauseBtn').addEventListener('click', function () {
      paused = !paused;
      this.textContent = paused ? 'Play motion' : 'Pause motion';
      this.setAttribute('aria-pressed', paused);
    });

    var tick = $('#ticker');
    tick.addEventListener('pointerenter', function () { ticker.hover = true; });
    tick.addEventListener('pointerleave', function () { ticker.hover = false; });

    var copy = $('#copyBtn');
    copy.dataset.email = copy.dataset.email || $('#emailBtn').getAttribute('href').replace(/^mailto:/, '').split('?')[0];
    copy.addEventListener('click', function () {
      var done = function (msg) {
        var original = 'Copy email';
        copy.textContent = msg;
        $('#copyStatus').textContent = msg;
        setTimeout(function () { copy.textContent = original; }, 1800);
      };
      if (!navigator.clipboard) { done(copy.dataset.email); return; }
      navigator.clipboard.writeText(copy.dataset.email).then(function () { done('Copied'); }, function () { done(copy.dataset.email); });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { reel.visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe($('#frame'));

      var links = $$('#navlinks a');
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['top', 'work', 'video', 'services', 'about', 'contact'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) spy.observe(el);
      });
    }

    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        if (photos.length && colCount() !== galleryCols) renderGallery();
        if (ticker.active) { $('#tickerTrack').innerHTML = ticker.set; measureTicker(ticker.set); }
      }, 180);
    });
  }

  /* ---------- Start ---------- */
  function start() {
    // Static headings: split, then reveal on scroll. Headline is handled by the hero.
    $$('[data-words]').forEach(function (h) {
      var isContact = !!h.closest('.contact');
      splitWords(h, h.textContent, { pencil: isContact, pencilDelay: 500 });
    });
    splitWords($('#headline'), $('#headline').textContent, { pencil: true, pencilDelay: 1700 });

    initChrome();
    initLightbox();
    startLoop();
    initFloat();

    $$('[data-reveal],[data-words]').forEach(function (el) {
      if (!el.closest('#video')) reveal(el);
    });

    var siteP = fetchJSON('data/site.json').catch(function () { return null; });
    var galleryP = fetchJSON('data/gallery.json').catch(function () { return null; });
    var videosP = fetchJSON('data/videos.json').catch(function () { return null; });

    // Wait for the words and photos before the hero plays, so nothing swaps
    // mid-animation, but never longer than 2.5s on a slow connection.
    var timeout = wait(2500).then(function () { return null; });
    Promise.race([Promise.all([siteP, galleryP]), timeout]).then(function (res) {
      var site = res && res[0], gal = res && res[1];

      if (gal && gal.photos && gal.photos.length) {
        photos = gal.photos.map(function (p) { return { src: fixPath(p.image), alt: p.alt || 'Velisa Putri' }; });
        renderGallery();
      } else {
        // Slow or failed data file: use it if it turns up, otherwise show the built-in photos.
        galleryP.then(function (late) {
          if (photos.length) return;
          var list = late && late.photos && late.photos.length ? late.photos : FALLBACK_PHOTOS;
          photos = list.map(function (p) { return { src: fixPath(p.image), alt: p.alt || 'Velisa Putri' }; });
          renderGallery();
        });
      }

      if (site) renderContent(site);
      else siteP.then(function (late) { if (late) renderContent(late); });

      var heroSrc = site && site.heroImage ? fixPath(site.heroImage) : 'images/uploads/Velisa_Photoshoot_14 (1) (1).jpg';
      var frames = [];
      if (!reduced && !saveData) {
        if (site && site.heroReel && site.heroReel.length) {
          frames = site.heroReel.map(function (r) { return fixPath(r.image); });
        } else if (photos.length) {
          frames = photos.slice(0, 4).map(function (p) { return p.src; });
        }
        frames = frames.filter(function (src) { return src !== heroSrc; });
      }
      frames.push(heroSrc);
      playHero(frames);

      // Rendered after the gallery so the embeds aren't fetched while the page is
      // still short and the video section looks close to the top of the screen.
      videosP.then(function (d) { if (d) renderVideos(d.videos); });
    });
  }

  try {
    if (document.fonts && document.fonts.ready) {
      // Ticker widths depend on the real font being in place.
      document.fonts.ready.then(function () {
        if (ticker.active) { $('#tickerTrack').innerHTML = ticker.set; measureTicker(ticker.set); }
      });
    }
    start();
  } catch (err) {
    // If anything fails, drop the hidden-until-animated state so the page still reads.
    document.documentElement.classList.remove('js');
    if (window.console) console.error(err);
  }
})();

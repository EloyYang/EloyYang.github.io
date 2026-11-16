/* 다이얼 홈 소개 페이지 — 직접 눌러 보는 다이얼.
 * 동작은 앱의 ui/Dial.kt 를 따른다:
 *  - 다이얼(원 안)을 누르면 손가락을 댄 자리 둘레에 지정한 앱 아이콘이 펼쳐진다(링·이름 없음).
 *  - 방향은 손가락을 댄 자리에서부터 잰다. 22dp 안쪽은 '아직 안 고름', 그 밖은 8방향(0=위, 시계 방향).
 *  - 고른 아이콘은 1.38배로 커지며 빛나고 나머지는 반투명. 방향이 바뀔 때 짧게 진동.
 *  - 손을 떼면 고른 앱이 실행된다.
 */
(function () {
  'use strict';
  var APPS = [
    ['카메라', '', '#c92a3e'], ['메시지', '', '#1f63e0'], ['음악', '', '#e23a64'], ['지도', '', '#2f8f5b'],
    ['전화', '', '#18a54a'], ['캘린더', '', '#dc3b3b'], ['동영상', '', '#c4120a'], ['설정', '', '#56607a']
  ];
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 실제 휴대폰 기본 앱처럼 그린 아이콘(48×48, 둥근 사각형)
  var gid = 0;
  var SQ = 'M24 2C8 2 2 8 2 24s6 22 22 22 22-6 22-22S40 2 24 2z';
  function bg(c1, c2) { var id = 'g' + (++gid); return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><path d="' + SQ + '" fill="url(#' + id + ')"/>'; }
  var GEAR = 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z';
  var PHONE = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';
  var DRAW = {
    '카메라': function () { return bg('#ff6b6b', '#e0344a') + '<path d="M17 14.5h14l2 3.5h3.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-25a3 3 0 0 1-3-3V21a3 3 0 0 1 3-3H15z" fill="#fff"/><circle cx="24" cy="27" r="7.2" fill="#e0344a"/><circle cx="24" cy="27" r="4.4" fill="#3b0d15"/><circle cx="22.4" cy="25.4" r="1.4" fill="#fff" opacity=".8"/><circle cx="34.5" cy="21.8" r="1.3" fill="#e0344a"/>'; },
    '메시지': function () { return bg('#4c9bff', '#1f63e0') + '<path d="M24 11c-8.8 0-15 5.6-15 12.4 0 3.8 2 7.2 5.1 9.4L13 38.5l6.3-3.4c1.5.4 3.1.6 4.7.6 8.8 0 15-5.6 15-12.3S32.8 11 24 11z" fill="#fff"/><circle cx="18" cy="23.4" r="1.9" fill="#1f63e0"/><circle cx="24" cy="23.4" r="1.9" fill="#1f63e0"/><circle cx="30" cy="23.4" r="1.9" fill="#1f63e0"/>'; },
    '음악': function () { return bg('#ff8f3f', '#f2416e') + '<path d="M20 15.5l14-3.2v17.4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"/><path d="M20 15.5v17" stroke="#fff" stroke-width="3.2"/><ellipse cx="16.5" cy="33" rx="4.6" ry="3.8" fill="#fff"/><ellipse cx="30.5" cy="30" rx="4.6" ry="3.8" fill="#fff"/>'; },
    '지도': function () { return bg('#ffffff', '#eef2f5') + '<path d="M2 30 L30 2 H40 L2 40z" fill="#c9e7cf"/><path d="M46 20 L20 46 H32 L46 32z" fill="#bfe0f7"/><path d="M8 46 L46 8" stroke="#ffcf3f" stroke-width="7"/><path d="M2 14 L34 46" stroke="#fff" stroke-width="4"/><path d="M28 9a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8z" fill="#ea4335"/><circle cx="28" cy="17" r="3" fill="#8c1d18"/>'; },
    '전화': function () { return bg('#3ddc6e', '#18a54a') + '<g transform="translate(10.5 10.5) scale(1.12)"><path d="' + PHONE + '" fill="#fff"/></g>'; },
    '캘린더': function () { var d = new Date(); return '<path d="' + SQ + '" fill="#fff"/><path d="M24 2C11 2 4.2 6 2.6 15h42.8C43.8 6 37 2 24 2z" fill="#ef4444"/><text x="24" y="11.6" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" font-family="sans-serif">' + ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] + '요일</text><text x="24" y="37.5" text-anchor="middle" font-size="21" font-weight="500" fill="#222" font-family="sans-serif">' + d.getDate() + '</text>'; },
    '동영상': function () { return bg('#ff4a3d', '#d4140a') + '<path d="M19.5 14.6c0-1.6 1.7-2.5 3-1.7l11.7 7.6c1.3.8 1.3 2.6 0 3.4l-11.7 7.6c-1.3.8-3-.1-3-1.7z" fill="#fff" transform="translate(-1 3.2)"/>'; },
    '설정': function () { return bg('#9aa4b5', '#5c667a') + '<g transform="translate(9 9) scale(1.25)"><path d="' + GEAR + '" fill="#fff"/></g>'; }
  };
  function icon(name) { return '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">' + DRAW[name]() + '</svg>'; }
  document.querySelectorAll('[data-app]').forEach(function (el) { el.innerHTML = icon(el.dataset.app); });
  function track(name, p) { try { if (window.dataLayer) (function () { window.dataLayer.push(arguments); })('event', name, p || {}); } catch (e) {} }

  // 상단 시계·날짜
  var days = ['일', '월', '화', '수', '목', '금', '토'];
  function clock() {
    var d = new Date(), hh = d.getHours(), mm = ('0' + d.getMinutes()).slice(-2);
    document.getElementById('clock').textContent = hh + ':' + mm;
    document.getElementById('date').innerHTML = '<b>' + hh + ':' + mm + '</b>' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + days[d.getDay()] + '요일';
  }
  clock(); setInterval(clock, 15000);

  var screen = document.getElementById('screen'), marker = document.getElementById('marker');
  var ring = document.getElementById('ring'), finger = document.getElementById('finger'), launch = document.getElementById('launch');
  var tryEl = document.getElementById('try');
  marker.style.left = marker.dataset.x * 100 + '%'; marker.style.top = marker.dataset.y * 100 + '%';

  var icons = APPS.map(function (a) {
    var el = document.createElement('div'); el.className = 'ri';
    el.innerHTML = '<i>' + icon(a[0]) + '</i>';
    ring.appendChild(el); return el;
  });

  // 실제 앱 크기를 화면 폭(약 412dp 기기)에 맞춰 줄인다
  function dp(v) { return v * screen.clientWidth / 412; }
  function sectorOf(dx, dy) { var deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360; return Math.round(deg / 45) % 8; }
  function vec(i) { var a = i * Math.PI / 4; return [Math.sin(a), -Math.cos(a)]; }

  var origin = null, selected = -1, pointerId = null, busy = false, launchT = null;

  function showRing(x, y) {
    var r = dp(92), W = screen.clientWidth, H = screen.clientHeight;
    icons.forEach(function (el, i) {
      var v = vec(i);
      el.style.left = (x + v[0] * r) / W * 100 + '%'; el.style.top = (y + v[1] * r) / H * 100 + '%';
      el.classList.remove('sel');
    });
    ring.classList.remove('picking'); ring.classList.add('show');
    finger.style.left = x / W * 100 + '%'; finger.style.top = y / H * 100 + '%'; finger.classList.add('on');
  }
  function pick(i) {
    if (i === selected) return;
    selected = i;
    icons.forEach(function (el, k) { el.classList.toggle('sel', k === i); });
    ring.classList.toggle('picking', i >= 0);
    if (i >= 0 && !ghostRunning && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  }
  function hideRing() { ring.classList.remove('show', 'picking'); icons.forEach(function (el) { el.classList.remove('sel'); }); finger.classList.remove('on'); }
  function openApp(i) {
    busy = true;
    var el = icons[i], a = APPS[i];
    launch.style.setProperty('--lx', el.style.left); launch.style.setProperty('--ly', el.style.top);
    launch.style.background = a[2];
    launch.querySelector('.launch-icon').innerHTML = icon(a[0]);
    launch.querySelector('b').textContent = a[0];
    launch.classList.add('open');
    clearTimeout(launchT);
    launchT = setTimeout(function () { launch.classList.remove('open'); launchT = setTimeout(function () { busy = false; }, 450); }, 1300);
  }

  function local(e) { var r = screen.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function insideDial(p) {
    var r = marker.getBoundingClientRect(), s = screen.getBoundingClientRect();
    var cx = r.left - s.left + r.width / 2, cy = r.top - s.top + r.height / 2;
    return Math.hypot(p[0] - cx, p[1] - cy) <= r.width / 2;
  }

  // ── 사용자가 직접 ──
  var userTouched = false;
  screen.addEventListener('pointerdown', function (e) {
    var p = local(e);
    if (!insideDial(p)) { screen.classList.add('hint'); setTimeout(function () { screen.classList.remove('hint'); }, 900); return; }
    e.preventDefault();
    userTouched = true; stopGhost();
    if (busy) { clearTimeout(launchT); launch.classList.remove('open'); busy = false; }
    pointerId = e.pointerId; try { screen.setPointerCapture(pointerId); } catch (er) {}
    origin = p; selected = -1; showRing(p[0], p[1]);
    if (navigator.vibrate) { try { navigator.vibrate(18); } catch (er) {} }
  });
  screen.addEventListener('pointermove', function (e) {
    if (e.pointerId !== pointerId || !origin) return;
    var p = local(e), dx = p[0] - origin[0], dy = p[1] - origin[1];
    finger.style.left = p[0] / screen.clientWidth * 100 + '%'; finger.style.top = p[1] / screen.clientHeight * 100 + '%';
    pick(Math.hypot(dx, dy) < dp(22) ? -1 : sectorOf(dx, dy));
  });
  function release(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null; origin = null;
    var s = selected; selected = -1; hideRing();
    if (s >= 0) { openApp(s); track('dial_demo_launch', { app: APPS[s][0] }); tryEl.innerHTML = '<b>' + APPS[s][0] + '</b> 실행! 다른 방향으로도 끌어 보세요'; }
  }
  screen.addEventListener('pointerup', release);
  screen.addEventListener('pointercancel', release);

  // ── 아무도 안 만질 때 보여 주는 시범 동작 ──
  var ghostRunning = false, ghostTimer = null, ghostIdx = 0, ORDER = [2, 0, 6, 4, 1, 7];
  function sleep(ms) { return new Promise(function (r) { ghostTimer = setTimeout(r, ms); }); }
  async function ghost() {
    if (userTouched || REDUCE) return;
    ghostRunning = true;
    var r = marker.getBoundingClientRect(), s = screen.getBoundingClientRect();
    var x = r.left - s.left + r.width / 2, y = r.top - s.top + r.height / 2;
    var i = ORDER[ghostIdx++ % ORDER.length], v = vec(i), d = dp(52);
    finger.classList.add('ghost'); showRing(x, y); selected = -1;
    await sleep(500); if (!ghostRunning) return;
    finger.style.left = (x + v[0] * d) / s.width * 100 + '%'; finger.style.top = (y + v[1] * d) / s.height * 100 + '%';
    await sleep(260); if (!ghostRunning) return;
    pick(i);
    await sleep(700); if (!ghostRunning) return;
    hideRing(); finger.classList.remove('ghost'); selected = -1; openApp(i);
    await sleep(2600); if (!ghostRunning) return;
    ghostRunning = false;
    schedule(1600);
  }
  function stopGhost() { clearTimeout(ghostTimer); if (ghostRunning) { ghostRunning = false; hideRing(); finger.classList.remove('ghost'); } }
  function schedule(ms) { clearTimeout(ghostTimer); ghostTimer = setTimeout(ghost, ms); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? schedule(1200) : stopGhost(); }); }, { threshold: .5 }).observe(screen);
  } else schedule(1500);

  // ── 표시 모양 바꾸기 ──
  document.querySelectorAll('.shapes button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.shapes button').forEach(function (x) { x.classList.toggle('on', x === b); });
      marker.className = 'dial-marker ' + b.dataset.shape;
      if (b.dataset.shape === 'none') { screen.classList.add('hint'); setTimeout(function () { screen.classList.remove('hint'); }, 1200); }
    });
  });

  // ── 기능 설명 그림: 8방향 ──
  var dirs = document.querySelector('.dirs');
  if (dirs) {
    var di = Array.prototype.slice.call(dirs.querySelectorAll('i')), db = dirs.querySelector('b');
    di.forEach(function (el, k) { var v = vec(k); el.style.left = 115 + v[0] * 86 + 'px'; el.style.top = 115 + v[1] * 86 + 'px'; el.innerHTML = icon(APPS[k][0]); });
    var dk = 0;
    if (!REDUCE) setInterval(function () {
      var k = [0, 3, 5, 2, 7, 4][dk++ % 6], v = vec(k);
      db.style.transform = 'translate(' + v[0] * 34 + 'px,' + v[1] * 34 + 'px)';
      setTimeout(function () { di.forEach(function (el, j) { el.classList.toggle('sel', j === k); }); }, 260);
      setTimeout(function () { db.style.transform = 'none'; di.forEach(function (el) { el.classList.remove('sel'); }); }, 1500);
    }, 2000);
  }

  // ── 기능 설명 그림: 검색 (초성으로 찾기) ──
  var typed = document.querySelector('.s-typed');
  if (typed && !REDUCE) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.s-row')), idx = Array.prototype.slice.call(document.querySelectorAll('.s-index span'));
    var steps = [['', -1, []], ['ㅇ', 6, [4]], ['ㅇㅇ', 6, [4]], ['', -1, []], ['ㅂ', 4, [3]], ['ㅂㄹ', 4, [3]], ['', -1, []]];
    var si = 0;
    setInterval(function () {
      var st = steps[si++ % steps.length];
      typed.textContent = st[0];
      idx.forEach(function (s, k) { s.classList.toggle('on', k === st[1]); });
      rows.forEach(function (r, k) { r.classList.toggle('hit', st[2].indexOf(k) >= 0); r.classList.toggle('dim', st[2].length > 0 && st[2].indexOf(k) < 0); });
    }, 900);
  }

  // 내려받기 버튼 클릭 기록
  document.querySelectorAll('[data-track]').forEach(function (a) { a.addEventListener('click', function () { track(a.dataset.track, { app: 'dial-home' }); }); });
})();

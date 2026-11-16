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
    ['카메라', '📷', '#f59e0b'], ['메시지', '💬', '#22c55e'], ['음악', '♫', '#ec4899'], ['지도', '🗺', '#6366f1'],
    ['전화', '☎', '#0ea5e9'], ['캘린더', '📅', '#a855f7'], ['동영상', '▶', '#ef4444'], ['설정', '⚙', '#64748b']
  ];
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    el.innerHTML = '<i style="background:' + a[2] + '">' + a[1] + '</i>';
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
    if (i >= 0 && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  }
  function hideRing() { ring.classList.remove('show', 'picking'); icons.forEach(function (el) { el.classList.remove('sel'); }); finger.classList.remove('on'); }
  function openApp(i) {
    busy = true;
    var el = icons[i], a = APPS[i];
    launch.style.setProperty('--lx', el.style.left); launch.style.setProperty('--ly', el.style.top);
    launch.style.background = a[2];
    launch.querySelector('.launch-icon').textContent = a[1];
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
    di.forEach(function (el, k) { var v = vec(k); el.style.left = 115 + v[0] * 86 + 'px'; el.style.top = 115 + v[1] * 86 + 'px'; el.style.background = APPS[k][2]; el.textContent = APPS[k][1]; });
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

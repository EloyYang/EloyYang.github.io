/* 프로젝트 카드의 움직이는 미리보기.
 * 실제 화면 캡처가 아니라, 각 서비스의 화면과 동작을 코드로 작게 다시 그려 움직인다.
 * - 카드가 화면에 보일 때만 돌고, 벗어나면 멈춘다.
 * - '동작 줄이기' 설정이면 마지막 장면만 멈춘 채로 보여 준다.
 */
(function () {
  'use strict';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  // 화면 안에서 움직이는 마우스 커서
  function cursor(screen) {
    var c = h('div', 'pv-cur', '<svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>');
    screen.appendChild(c);
    return {
      el: c,
      to: function (target, dx, dy) {
        var s = screen.getBoundingClientRect(), r = target.getBoundingClientRect();
        var x = (r.left - s.left + r.width * (dx == null ? .5 : dx)) / s.width * 100;
        var y = (r.top - s.top + r.height * (dy == null ? .5 : dy)) / s.height * 100;
        c.style.left = x + '%'; c.style.top = y + '%';
      },
      home: function () { c.style.left = '92%'; c.style.top = '92%'; },
      click: function () { c.classList.remove('click'); void c.offsetWidth; c.classList.add('click'); }
    };
  }

  /* ───────────── 시험 준비 노트: 문제 고르기 → 채점 → 오답 노트 ───────────── */
  function examDemo(screen, cap) {
    screen.innerHTML =
      '<div class="ex">' +
        '<div class="ex-top"><span class="ex-logo">史</span><b>기출 풀기</b><span class="ex-sub">한국사능력검정시험 심화</span>' +
          '<span class="ex-note">오답 노트 <i class="ex-cnt">3</i></span></div>' +
        '<div class="ex-body">' +
          '<div class="ex-q">' +
            '<div class="ex-qh"><b>제80회</b> 12 / 50 <span class="ex-timer">0:00</span></div>' +
            '<div class="ex-src">(가) 왕은 쌍기의 건의를 받아들여 과거제를 처음 시행하였다.</div>' +
            '<p class="ex-qt">(가) 왕이 실시한 정책으로 옳은 것은?</p>' +
            '<ol class="ex-ch">' +
              '<li><i>①</i>대동법을 실시하였다</li>' +
              '<li data-ok><i>②</i>노비안검법을 실시하였다</li>' +
              '<li><i>③</i>훈민정음을 창제하였다</li>' +
              '<li><i>④</i>균역법을 실시하였다</li>' +
            '</ol>' +
          '</div>' +
          '<div class="ex-side">' +
            '<div class="ex-card"><span>이번 회차</span><b class="ex-sc">–</b><small>점</small></div>' +
            '<div class="ex-bar"><i></i></div>' +
            '<button class="ex-btn" tabindex="-1">채점하기</button>' +
            '<div class="ex-memo">메모<br><span class="ex-typed"></span></div>' +
          '</div>' +
        '</div>' +
        '<div class="ex-toast">✓ 오답 노트에 저장했어요</div>' +
      '</div>';
    var cur = cursor(screen);
    var lis = $$(screen, '.ex-ch li'), btn = $(screen, '.ex-btn'), cnt = $(screen, '.ex-cnt');
    var sc = $(screen, '.ex-sc'), bar = $(screen, '.ex-bar i'), toast = $(screen, '.ex-toast');
    var timer = $(screen, '.ex-timer'), typed = $(screen, '.ex-typed'), note = $(screen, '.ex-note');
    var round = 0, tick = null;

    function reset() {
      lis.forEach(function (li) { li.className = ''; });
      sc.textContent = '–'; bar.style.width = '0%'; toast.classList.remove('show');
      typed.textContent = ''; timer.textContent = '0:00'; cur.home();
    }
    function startTimer() {
      var t = 0; clearInterval(tick);
      tick = setInterval(function () { t++; timer.textContent = '0:' + (t < 10 ? '0' : '') + t; }, 1000);
    }
    return {
      reset: function () { reset(); cnt.textContent = '3'; round = 0; },
      stop: function () { clearInterval(tick); },
      still: function () { lis[1].className = 'ok'; lis[2].className = 'bad'; sc.textContent = '82'; bar.style.width = '82%'; cnt.textContent = '4'; },
      play: async function (wait) {
        reset(); startTimer();
        var wrong = round % 2 === 0, pick = wrong ? 2 : 1;
        cap('회차별 기출을 실제 시험처럼 풀어요');
        await wait(900);
        cur.to(typed.parentNode, .3, .6); await wait(700);
        var memo = '광종 · 과거제';
        for (var k = 1; k <= memo.length; k++) { typed.textContent = memo.slice(0, k); await wait(90); }
        await wait(300);
        cur.to(lis[pick], .25); await wait(800);
        cur.click(); lis[pick].className = 'sel'; await wait(700);
        cap('채점하면 정답과 내 답이 바로 보여요');
        cur.to(btn); await wait(750);
        cur.click(); btn.classList.add('press'); await wait(200); btn.classList.remove('press');
        clearInterval(tick);
        lis[1].className = 'ok';
        if (wrong) lis[pick].className = 'bad';
        var target = wrong ? 82 : 86, n = 0;
        bar.style.width = target + '%';
        while (n < target) { n = Math.min(target, n + 4); sc.textContent = n; await wait(28); }
        await wait(500);
        if (wrong) {
          cap('틀린 문제는 오답 노트에 자동으로 모여요');
          toast.classList.add('show'); await wait(900);
          note.classList.add('bump'); cnt.textContent = String(+cnt.textContent + 1);
          await wait(400); note.classList.remove('bump');
          await wait(1300);
        } else {
          cap('맞힌 문제도 시대·유형별 약점 분석에 반영돼요');
          await wait(2000);
        }
        round++;
      }
    };
  }

  /* ───────────── 부니: Claude Code 옆에서 상태를 알려 주는 픽셀 토끼 ─────────────
   * 캐릭터 그림·동작은 부니 소개 페이지(EloyYang/buni docs/index.html)의 코드를 그대로 옮겼다.
   * 그 코드는 실제 앱의 RabbitCharacterView.swift · LaptopView.swift 치수(p = 6.5)를 따른다. */
  var BNS = 'http://www.w3.org/2000/svg', BSCALE = 6.5, BCX = 35, BCY = 39;
  var BUNI = { body: '#e9ecf3', accent: '#f2b8c6' }, BUNI_EAR = { w: 1.6, h: 3.4, ox: 1.6, oy: 3.5 };
  function partRect(cls, dx, dy, w, hh, fill) {
    var el = document.createElementNS(BNS, 'rect');
    el.setAttribute('x', (BCX + dx * BSCALE - w * BSCALE / 2).toFixed(1));
    el.setAttribute('y', (BCY + dy * BSCALE - hh * BSCALE / 2).toFixed(1));
    el.setAttribute('width', (w * BSCALE).toFixed(1));
    el.setAttribute('height', (hh * BSCALE).toFixed(1));
    if (cls) el.setAttribute('class', cls);
    if (fill) el.setAttribute('fill', fill);
    return el;
  }
  function buniBack(svg) {
    var body = BUNI.body, ear = BUNI_EAR;
    [-1, 1].forEach(function (side) {
      var g = document.createElementNS(BNS, 'g');
      g.setAttribute('class', 'ear ear-' + (side < 0 ? 'left' : 'right'));
      g.appendChild(partRect('', side * ear.ox, -ear.oy, ear.w, ear.h, body));
      g.appendChild(partRect('', side * ear.ox, -ear.oy - 0.1, ear.w * 0.5, ear.h * 0.79, BUNI.accent));
      svg.appendChild(g);
    });
    svg.appendChild(partRect('', 0, 1.5, 4.6, 2.5, body));
    svg.appendChild(partRect('arm arm-left', -2.68, 1.1, 1.5, 0.9, body));
    svg.appendChild(partRect('arm arm-right', 2.68, 1.1, 1.5, 0.9, body));
    svg.appendChild(partRect('', -1.2, 2.9, 1.5, 0.9, body));
    svg.appendChild(partRect('', 1.2, 2.9, 1.5, 0.9, body));
  }
  function buniFront(svg) {
    svg.appendChild(partRect('', 0, -0.8, 5.6, 2.6, BUNI.body));
    svg.appendChild(partRect('eye eye-left', -1.4, -0.9, 0.65, 0.75, '#1a1206'));
    svg.appendChild(partRect('eye eye-right', 1.4, -0.9, 0.65, 0.75, '#1a1206'));
    svg.appendChild(partRect('', 0, -0.25, 0.55, 0.4, BUNI.accent));
  }
  function buniLaptop(svg) {
    var silver = '#c7cbd4', silverHi = '#e4e7ee', silverDark = '#82868f', silverMid = '#a7acb8';
    svg.appendChild(partRect('', 0, 1.48, 3.15, 2.15, silver));
    svg.appendChild(partRect('', 0, 0.41, 3.15, 0.17, silverHi));
    svg.appendChild(partRect('', -1.52, 1.48, 0.12, 2.15, silverDark));
    svg.appendChild(partRect('', 1.52, 1.48, 0.12, 2.15, silverDark));
    var LY = 1.42;
    var l1 = document.createElementNS(BNS, 'g'); l1.style.transform = 'rotate(-20deg)';
    l1.appendChild(partRect('', -0.10, LY - 0.56, 0.12, 0.28, '#3fa83f')); svg.appendChild(l1);
    var l2 = document.createElementNS(BNS, 'g'); l2.style.transform = 'rotate(20deg)';
    l2.appendChild(partRect('', 0.10, LY - 0.56, 0.12, 0.28, '#3fa83f')); svg.appendChild(l2);
    svg.appendChild(partRect('', 0, LY - 0.52, 0.12, 0.24, '#3fa83f'));
    [[0.52, -0.28, 0.14], [0.46, -0.14, 0.14], [0.40, 0.00, 0.14], [0.32, 0.14, 0.14], [0.22, 0.28, 0.14], [0.12, 0.41, 0.13]]
      .forEach(function (r) { svg.appendChild(partRect('', 0, LY + r[1], r[0], r[2], '#f28c2e')); });
    svg.appendChild(partRect('', 0.22, LY - 0.20, 0.20, 0.18, silver));
    svg.appendChild(partRect('', 0, 2.64, 3.50, 0.20, silverDark));
    svg.appendChild(partRect('', 0, 2.90, 3.80, 0.44, silverMid));
    svg.appendChild(partRect('', 0, 3.13, 3.80, 0.16, silverDark));
    svg.appendChild(partRect('', 0, 2.82, 3.10, 0.13, '#767b85'));
    svg.appendChild(partRect('', 0, 3.02, 1.0, 0.22, '#767b85'));
  }
  // 소품·반짝이 div를 캐릭터 좌표계(p 단위)에 놓는다 — 70×78 무대 기준 % 로
  function placeAcc(el, dx, dy, wP, hP) {
    var w = wP * BSCALE, hh = hP * BSCALE;
    el.style.width = (w / 70 * 100) + '%'; el.style.height = (hh / 78 * 100) + '%';
    el.style.left = ((BCX + dx * BSCALE - w / 2) / 70 * 100) + '%';
    el.style.top = ((BCY + dy * BSCALE - hh / 2) / 78 * 100) + '%';
  }
  var CARROT = '<svg viewBox="0 0 20 34"><path d="M6 8l-3-7 6 3z" fill="#6bbf59"/><path d="M14 8l3-7-6 3z" fill="#6bbf59"/>' +
    '<rect x="7" y="6" width="6" height="6" fill="#6bbf59"/><rect x="2" y="9" width="16" height="6" rx="1" fill="#f28c2e"/>' +
    '<rect x="4" y="15" width="12" height="6" rx="1" fill="#f28c2e"/><rect x="6" y="21" width="8" height="6" rx="1" fill="#f28c2e"/>' +
    '<rect x="8" y="27" width="4" height="5" rx="1" fill="#f28c2e"/></svg>';
  var SPARK = '<svg viewBox="0 0 70 40"><path d="M10 20l3-8 3 8 8 3-8 3-3 8-3-8-8-3z" fill="#f2d34e"/>' +
    '<path d="M52 8l2-5 2 5 5 2-5 2-2 5-2-5-5-2z" fill="#f2d34e"/><path d="M60 24l1.6-4 1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6z" fill="#f2d34e"/></svg>';

  function buniDemo(screen, cap) {
    var lines = '';
    [78, 55, 68, 40, 72, 50, 60, 35, 66, 48, 58, 30].forEach(function (w, i) {
      lines += '<i style="--w:' + w + '%"' + (i === 2 ? ' class="accent"' : i === 7 ? ' class="leaf"' : '') + '></i>';
    });
    screen.innerHTML =
      '<div class="bn" data-state="idle">' +
        '<div class="bn-sidebar"></div>' +
        '<div class="bn-titlebar"><span></span><span></span><span></span></div>' +
        '<div class="bn-code"><div class="bn-prompt">&gt; <span class="bn-cmd"></span><b class="bn-caret"></b></div><div class="bn-lines">' + lines + '</div></div>' +
        '<div class="bn-row">' +
          '<div class="bn-speech"><div class="bn-bubble"><span class="bn-text"> </span>' +
            '<span class="bn-perm"><b class="deny">거부</b><b class="allow">허용</b><b class="all">전체 허용</b></span>' +
            '<div class="bn-tail"></div></div></div>' +
          '<div class="bn-col">' +
            '<div class="bn-stage">' +
              '<svg class="bunny bunny-back" viewBox="0 0 70 78"></svg>' +
              '<svg class="bunny bunny-laptop" viewBox="0 0 70 78"></svg>' +
              '<svg class="bunny bunny-front" viewBox="0 0 70 78"></svg>' +
              '<div class="bn-acc bn-prop">' + CARROT + '</div>' +
              '<div class="bn-acc bn-spark">' + SPARK + '</div>' +
            '</div>' +
            '<div class="bn-usage"><div class="ub-level">★ Lv.3</div><div class="ub-track"><div class="ub-segs"></div></div>' +
              '<div class="ub-foot"><span class="ub-pct">0%</span><span>↺ 3:47</span></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="bn-caption">대기중</div>' +
      '</div>';
    var root = $(screen, '.bn'), stage = $(screen, '.bn-stage');
    buniBack($(screen, '.bunny-back')); buniLaptop($(screen, '.bunny-laptop')); buniFront($(screen, '.bunny-front'));
    placeAcc($(screen, '.bn-prop'), -4.0, -3.19, 1.5, 3.08);
    placeAcc($(screen, '.bn-spark'), 0, -2.6, 3.2, 1.8);
    // 실제 UsageBarView.swift: 10칸, 초록→노랑→빨강
    var segs = $(screen, '.ub-segs'), pct = $(screen, '.ub-pct');
    for (var i = 0; i < 10; i++) {
      var r = (i + 1) / 10, s = h('i');
      s.style.setProperty('--seg-color', r <= 0.5 ? '#4ddb59' : r <= 0.75 ? '#f2cc26' : '#f2503a');
      segs.appendChild(s);
    }
    var segEls = $$(screen, '.ub-segs i');
    function usage(p) { pct.textContent = p + '%'; segEls.forEach(function (e, k) { e.classList.toggle('on', k < Math.round(p / 10)); }); }
    var txt = $(screen, '.bn-text'), capEl = $(screen, '.bn-caption'), cmd = $(screen, '.bn-cmd'), ls = $$(screen, '.bn-lines i');
    function state(s, caption, bubble) { root.dataset.state = s; capEl.textContent = caption; txt.textContent = bubble || ' '; }
    var cur = cursor(screen), blinkT = null, perkT = null;
    function timers() {
      clearInterval(blinkT); clearInterval(perkT);
      // 눈 깜빡임 3.4초마다(권한 요청·완료 땐 생략), 귀 쫑긋 2.6초마다(대기중만) — 소개 페이지와 같은 주기
      blinkT = setInterval(function () {
        var s = root.dataset.state; if (s === 'permission' || s === 'done') return;
        stage.classList.add('blinking'); setTimeout(function () { stage.classList.remove('blinking'); }, 130);
      }, 3400);
      perkT = setInterval(function () {
        if (root.dataset.state !== 'idle') return;
        stage.classList.add('perking'); setTimeout(function () { stage.classList.remove('perking'); }, 220);
      }, 2600);
    }
    function reset() { state('idle', '대기중', ''); cmd.textContent = ''; ls.forEach(function (l) { l.classList.remove('on'); }); usage(0); cur.home(); }
    return {
      reset: function () { reset(); timers(); },
      stop: function () { clearInterval(blinkT); clearInterval(perkT); blinkT = perkT = null; },
      still: function () { state('done', '완료!', '완료 ✓'); ls.forEach(function (l) { l.classList.add('on'); }); usage(62); },
      play: async function (wait) {
        reset(); if (!blinkT) timers();
        cap('Claude Code가 쉬는 동안 — 부니도 대기중');
        await wait(2200);
        var q = '로그인 버튼 고쳐줘';
        for (var k = 1; k <= q.length; k++) { cmd.textContent = q.slice(0, k); await wait(70); }
        await wait(250);
        state('thinking', '생각중', '코딩중'); usage(38);
        cap('일을 시작하면 노트북을 펴고 타닥타닥');
        for (var j = 0; j < 6; j++) { ls[j].classList.add('on'); await wait(300); }
        state('tool', '도구 사용', 'Edit'); usage(55);
        cap('지금 쓰는 도구를 말풍선으로 알려 줘요');
        for (; j < ls.length; j++) { ls[j].classList.add('on'); await wait(250); }
        await wait(400);
        state('permission', '권한 요청', 'Bash 실행을\n허용할까요?');
        cap('허락이 필요하면 당근을 들고 물어봐요');
        await wait(1100);
        cur.to($(screen, '.bn-perm .allow')); await wait(800); cur.click(); await wait(300); cur.home();
        state('tool', '도구 사용', 'Bash'); usage(62);
        cap('허용하면 이어서 일해요');
        await wait(1600);
        state('done', '완료!', '완료 ✓');
        cap('다 끝나면 번쩍 손을 들어 알려 줘요');
        await wait(3000);
      }
    };
  }

  /* ───────────── Pocket Arena: 체스 대국 ↔ 소드 듀얼 ───────────── */
  function arenaDemo(screen, cap) {
    var sq = '', files = 'abcdefgh';
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) sq += '<i class="' + ((r + c) % 2 ? 'd' : 'l') + '" data-sq="' + files[c] + (8 - r) + '"></i>';
    screen.innerHTML =
      '<div class="ar">' +
        '<div class="ar-nav"><b><span class="ar-logo">▮</span> POCKET <em>ARENA</em></b><span class="ar-tabs"><i class="on">체스</i><i>소드 듀얼</i></span></div>' +
        '<div class="ar-scene ar-chess on">' +
          '<div class="ar-board">' + sq + '<div class="ar-pieces"></div></div>' +
          '<div class="ar-panel"><div class="ar-vs"><span class="me">● 나</span><em>vs</em><span>AI</span></div>' +
            '<div class="ar-turn">내 차례예요</div><ol class="ar-moves"></ol>' +
            '<div class="ar-invite">🔗 링크로 친구 초대</div></div>' +
        '</div>' +
        '<div class="ar-scene ar-duel">' +
          '<div class="ar-floor"></div>' +
          '<div class="ar-hp foe"><i></i></div><div class="ar-foe"><i class="head"></i><i class="eye"></i><i class="body"></i><i class="blade"></i></div>' +
          '<div class="ar-slash"></div><div class="ar-banner">내 공격 턴!</div>' +
          '<div class="ar-phone"><i></i></div>' +
          '<div class="ar-hp me"><i></i></div>' +
        '</div>' +
      '</div>';
    var board = $(screen, '.ar-board'), pieces = $(screen, '.ar-pieces'), moves = $(screen, '.ar-moves'), turn = $(screen, '.ar-turn');
    var chess = $(screen, '.ar-chess'), duel = $(screen, '.ar-duel'), tabs = $$(screen, '.ar-tabs i');
    var START = { a8: '♜', b8: '♞', c8: '♝', d8: '♛', e8: '♚', f8: '♝', g8: '♞', h8: '♜', a1: '♖', b1: '♘', c1: '♗', d1: '♕', e1: '♔', f1: '♗', g1: '♘', h1: '♖' };
    for (var f = 0; f < 8; f++) { START[files[f] + '7'] = '♟'; START[files[f] + '2'] = '♙'; }
    var at = {};
    function place(p, s) { p.style.left = files.indexOf(s[0]) * 12.5 + '%'; p.style.top = (8 - +s[1]) * 12.5 + '%'; }
    function setup() {
      pieces.innerHTML = ''; at = {}; moves.innerHTML = '';
      Object.keys(START).forEach(function (s) {
        var p = h('span', 'pc ' + ('♙♖♘♗♕♔'.indexOf(START[s]) >= 0 ? 'w' : 'b'), '♚♛♜♝♞♟'.charAt('♔♕♖♗♘♙♚♛♜♝♞♟'.indexOf(START[s]) % 6));
        place(p, s); pieces.appendChild(p); at[s] = p;
      });
      $$(board, '[data-sq]').forEach(function (e) { e.classList.remove('hl'); });
    }
    function mark(a, b) { $$(board, '[data-sq]').forEach(function (e) { e.classList.toggle('hl', e.dataset.sq === a || e.dataset.sq === b); }); }
    async function move(wait, a, b, san, mine) {
      var p = at[a]; mark(a, b);
      if (at[b]) at[b].remove();
      place(p, b); at[b] = p; delete at[a];
      if (mine) { var li = h('li', '', san); moves.appendChild(li); } else { moves.lastChild.innerHTML += ' &nbsp;' + san; }
      turn.textContent = mine ? 'AI가 생각 중…' : '내 차례예요';
      turn.classList.toggle('wait', mine);
      await wait(mine ? 1000 : 900);
    }
    function scene(which) {
      chess.classList.toggle('on', which === 0); duel.classList.toggle('on', which === 1);
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === which); });
    }
    var foeHp = $(screen, '.ar-hp.foe i'), meHp = $(screen, '.ar-hp.me i'), foe = $(screen, '.ar-foe');
    var slash = $(screen, '.ar-slash'), banner = $(screen, '.ar-banner'), phone = $(screen, '.ar-phone');
    function retrigger(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    return {
      reset: function () { scene(0); setup(); foeHp.style.width = '100%'; meHp.style.width = '100%'; },
      still: function () { scene(0); },
      play: async function (wait) {
        scene(0); setup();
        cap('체스 · 바둑 · 오목 — 링크 하나로 친구와 대국');
        await wait(700);
        var seq = [['e2', 'e4', '1. e4', 1], ['e7', 'e5', 'e5', 0], ['g1', 'f3', '2. Nf3', 1], ['b8', 'c6', 'Nc6', 0], ['f1', 'b5', '3. Bb5', 1], ['a7', 'a6', 'a6', 0]];
        for (var i = 0; i < seq.length; i++) await move(wait, seq[i][0], seq[i][1], seq[i][2], seq[i][3]);
        await wait(600);
        scene(1); foeHp.style.width = '100%'; meHp.style.width = '100%';
        cap('소드 듀얼 — 휴대폰을 칼처럼 휘둘러 공격');
        banner.textContent = '내 공격 턴!'; retrigger(banner, 'pop');
        await wait(1100);
        for (var k = 0; k < 2; k++) {
          retrigger(phone, 'swing'); await wait(260);
          retrigger(slash, 'go'); retrigger(foe, 'hit');
          foeHp.style.width = (k ? 40 : 70) + '%';
          await wait(900);
        }
        banner.textContent = '막기!'; retrigger(banner, 'pop');
        cap('상대 턴엔 휴대폰을 세워 막아요');
        retrigger(phone, 'guard'); retrigger(foe, 'lunge');
        await wait(1700);
      }
    };
  }

  /* ───────────── 머니 커넥션: 누르면 펼쳐지는 종목 네트워크 ───────────── */
  function moneyDemo(screen, cap) {
    screen.innerHTML =
      '<div class="mn"><canvas></canvas>' +
        '<div class="mn-top"><b>분석</b><span>기간 1년</span><span class="mn-search">티커 또는 회사명 검색</span></div>' +
        '<div class="mn-legend"></div><div class="mn-tip"></div><div class="mn-hint">누르면 종목 네트워크가 펼쳐집니다</div>' +
      '</div>';
    var THEMES = [['AI 반도체', '#3b82f6'], ['빅테크', '#f97316'], ['소프트웨어', '#14b8a6'], ['EV · 우주', '#eab308'], ['이커머스 · 미디어', '#ec4899'], ['소비재', '#22c55e'], ['바이오', '#a855f7']];
    var TICK = [['NVDA', 'AVGO', 'AMD', 'TSM', 'MU'], ['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN'], ['CRM', 'NOW', 'PLTR', 'CRWD'], ['TSLA', 'RKLB', 'RIVN'], ['NFLX', 'SHOP', 'UBER'], ['COST', 'WMT', 'KO'], ['LLY', 'NVO', 'AMGN']];
    var legend = $(screen, '.mn-legend');
    THEMES.forEach(function (t) { legend.appendChild(h('span', '', '<i style="background:' + t[1] + '"></i>' + t[0])); });
    var cv = $(screen, 'canvas'), ctx = cv.getContext('2d'), tip = $(screen, '.mn-tip'), hint = $(screen, '.mn-hint');
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), nodes = [], edges = [], raf = 0, t0 = 0, focus = -1;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function build() {
      nodes = []; edges = [];
      THEMES.forEach(function (t, ci) {
        var ang = ci / THEMES.length * Math.PI * 2 - Math.PI / 2, cx = .5 + Math.cos(ang) * .27, cy = .54 + Math.sin(ang) * .3;
        var n = 9 + (ci % 3) * 2;
        for (var i = 0; i < n; i++) {
          var a = rnd(0, 6.28), d = rnd(.02, .09);
          nodes.push({ c: ci, col: t[1], tx: cx + Math.cos(a) * d * 1.2, ty: cy + Math.sin(a) * d, r: i < 2 ? rnd(4.5, 6) : rnd(1.6, 3.2), lab: i < TICK[ci].length && i < 2 ? TICK[ci][i] : '', ph: rnd(0, 6.28), delay: rnd(0, .35) });
        }
      });
      nodes.forEach(function (a, i) {
        nodes.forEach(function (b, j) {
          if (j <= i) return;
          var same = a.c === b.c, dx = a.tx - b.tx, dy = a.ty - b.ty, dist = Math.sqrt(dx * dx + dy * dy);
          if ((same && dist < .09 && Math.random() < .55) || (!same && dist < .2 && Math.random() < .05)) edges.push([i, j, same ? 1 : -1, rnd(0, .5)]);
        });
      });
    }
    function size() {
      var r = screen.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    }
    function ease(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
    function draw(t) {
      var s = (t - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var burst = (s - 1.4) / 1.6;
      // 가운데 빛 (누르기 전)
      if (burst < .4) {
        var pr = 6 + Math.sin(s * 4) * 1.5, al = burst < 0 ? 1 : 1 - burst / .4;
        var g = ctx.createRadialGradient(W / 2, H * .54, 0, W / 2, H * .54, pr * 5);
        g.addColorStop(0, 'rgba(160,230,255,' + al + ')'); g.addColorStop(.25, 'rgba(70,170,255,' + al * .6 + ')'); g.addColorStop(1, 'rgba(40,120,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H * .54, pr * 5, 0, 7); ctx.fill();
      }
      if (burst > 0 && burst < 1.2) {
        ctx.strokeStyle = 'rgba(80,180,255,' + (1 - burst / 1.2) * .6 + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(W / 2, H * .54, ease(burst) * W * .45, 0, 7); ctx.stroke();
      }
      if (burst <= 0) return;
      var pos = nodes.map(function (n) {
        var k = ease((burst - n.delay) / .9);
        return [W / 2 + (n.tx * W - W / 2) * k + Math.sin(s * .8 + n.ph) * 2, H * .54 + (n.ty * H - H * .54) * k + Math.cos(s * .7 + n.ph) * 2, k];
      });
      var nb = {};
      if (focus >= 0) edges.forEach(function (e) { if (e[0] === focus) nb[e[1]] = 1; if (e[1] === focus) nb[e[0]] = 1; });
      edges.forEach(function (e) {
        var a = pos[e[0]], b = pos[e[1]], k = ease((burst - .7 - e[3]) / .6);
        if (k <= 0) return;
        var on = focus >= 0 && (e[0] === focus || e[1] === focus);
        ctx.globalAlpha = k * (focus >= 0 ? (on ? .95 : .12) : (e[2] > 0 ? .45 : .3));
        ctx.strokeStyle = e[2] > 0 ? (on ? '#7dffb0' : '#3fbf78') : '#d9534f';
        ctx.lineWidth = on ? 1.6 : .8;
        ctx.setLineDash(e[2] > 0 ? [] : [2, 3]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      });
      ctx.setLineDash([]);
      nodes.forEach(function (n, i) {
        var p = pos[i]; if (p[2] <= 0) return;
        var dim = focus >= 0 && i !== focus && !nb[i];
        ctx.globalAlpha = p[2] * (dim ? .25 : 1);
        var r = n.r * (i === focus ? 1.8 : 1) * (W / 420);
        ctx.fillStyle = n.col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
        if (i === focus) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
        if (n.lab && p[2] > .9 && !dim) {
          ctx.fillStyle = '#e8edf5'; ctx.font = '600 ' + Math.max(7, W / 60) + 'px system-ui, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(n.lab, p[0], p[1] + r + Math.max(8, W / 50));
        }
      });
      ctx.globalAlpha = 1;
      if (focus >= 0) {
        var fp = pos[focus];
        tip.style.left = (fp[0] / W * 100) + '%'; tip.style.top = (fp[1] / H * 100) + '%';
      }
    }
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    return {
      reset: function () { size(); build(); focus = -1; tip.classList.remove('show'); hint.classList.remove('hide'); legend.classList.remove('show'); },
      stop: function () { cancelAnimationFrame(raf); raf = 0; },
      still: function () { size(); build(); t0 = performance.now() - 9000; legend.classList.add('show'); hint.classList.add('hide'); draw(performance.now()); },
      play: async function (wait) {
        size(); build(); focus = -1; tip.classList.remove('show'); hint.classList.remove('hide'); legend.classList.remove('show');
        t0 = performance.now(); if (!raf) raf = requestAnimationFrame(loop);
        cap('나스닥 · 코스피 · ETF · 코인 · 금 — 처음 화면');
        await wait(1400);
        hint.classList.add('hide');
        cap('누르면 종목 네트워크가 펼쳐져요');
        await wait(2400);
        legend.classList.add('show');
        cap('함께 움직이는 종목끼리 선으로 이어져요');
        await wait(1800);
        focus = 0; tip.textContent = NODES_LABEL(nodes[0]); tip.classList.add('show');
        cap('종목을 고르면 같이 움직이는 종목만 밝아져요');
        await wait(2600);
        focus = nodes.findIndex(function (n) { return n.c === 1 && n.lab; });
        tip.textContent = NODES_LABEL(nodes[focus]);
        await wait(2200);
      }
    };
    function NODES_LABEL(n) { return n.lab + ' · ' + THEMES[n.c][0]; }
  }

  var DEMOS = { exam: examDemo, buni: buniDemo, arena: arenaDemo, money: moneyDemo };

  document.querySelectorAll('[data-demo]').forEach(function (pv) {
    var make = DEMOS[pv.dataset.demo]; if (!make) return;
    var screen = $(pv, '.pv-screen'), capEl = $(pv, '.pv-cap');
    function cap(t) { if (capEl.textContent !== t) { capEl.classList.remove('in'); void capEl.offsetWidth; capEl.textContent = t; capEl.classList.add('in'); } }
    var demo = make(screen, cap), token = 0, running = false;

    async function run() {
      var my = ++token;
      function wait(ms) { return new Promise(function (res, rej) { setTimeout(function () { my === token ? res() : rej('stop'); }, ms); }); }
      try { while (true) { await demo.play(wait); } } catch (e) { /* 멈춤 */ }
    }
    function start() { if (running) return; running = true; demo.reset(); run(); }
    function stop() { if (!running) return; running = false; token++; if (demo.stop) demo.stop(); }

    if (REDUCE) { demo.reset(); if (demo.still) demo.still(); return; }
    if (!('IntersectionObserver' in window)) { start(); return; }
    var inView = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { inView = e.isIntersecting; inView && !document.hidden ? start() : stop(); });
    }, { threshold: 0.3 }).observe(pv);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : (inView && start()); });
  });

  // 다이얼 홈 그림은 CSS 애니메이션 — 화면 밖에서는 멈춘다
  document.querySelectorAll('.pv-dial').forEach(function (el) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { el.classList.toggle('paused', !e.isIntersecting); });
    }).observe(el);
  });
})();

/* 프로젝트 카드의 화면 미리보기: 실제 화면 캡처를 차례로 넘겨 보여 준다.
 * - 화면에 보일 때만 움직이고, 다음 장면은 직전에 불러온다.
 * - '동작 줄이기' 설정이면 첫 장면만 보여 준다.
 */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-pv]').forEach(function (pv) {
    var imgs = Array.prototype.slice.call(pv.querySelectorAll('.pv-screen img'));
    var cap = pv.querySelector('.pv-cap');
    var step = pv.querySelector('.pv-step');
    var bar = pv.querySelector('.pv-prog i');
    var speed = +pv.dataset.speed || 2600;
    var i = 0, timer = null;

    function load(img) { if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } }
    function show(n) {
      i = (n + imgs.length) % imgs.length;
      load(imgs[i]); load(imgs[(i + 1) % imgs.length]);
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      cap.textContent = imgs[i].dataset.cap;
      step.textContent = (i + 1) + '/' + imgs.length;
      if (bar) {
        bar.style.transition = 'none'; bar.style.width = '0%';
        void bar.offsetWidth;
        bar.style.transition = 'width ' + speed + 'ms linear'; bar.style.width = '100%';
      }
    }
    function play() { if (timer || reduce) return; show(i); timer = setInterval(function () { show(i + 1); }, speed); }
    function stop() { clearInterval(timer); timer = null; if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; } }

    if (reduce || !('IntersectionObserver' in window)) { if (!reduce) play(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? play() : stop(); });
    }, { threshold: 0.35 }).observe(pv);
  });

  // 다이얼 홈 그림은 CSS 애니메이션 — 화면 밖에서는 멈춘다
  document.querySelectorAll('.pv-dial').forEach(function (el) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { el.classList.toggle('paused', !e.isIntersecting); });
    }).observe(el);
  });
})();

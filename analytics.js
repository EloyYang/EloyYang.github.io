/* 포털 이용 기록(GA4). 시험 준비 노트와 같은 속성으로 보낸다.
 * - 끄기: ?notrack=1 (다시 켜기 ?notrack=0). 시험 준비 노트와 같은 저장값(analytics.off)을 쓴다.
 * - 이벤트: page_view, project_click(project, link_url)
 */
(function () {
  var ID = 'G-FXS8VPXXJV', OFF = 'analytics.off';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  var qs = new URLSearchParams(location.search);
  if (qs.get('notrack') === '1') set(OFF, '1');
  if (qs.get('notrack') === '0') set(OFF, null);
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
  if (local || get(OFF) === '1') return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', ID, { content_group: 'portal', page_name: 'portal' });
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var card = a.closest('[data-project]');
    gtag('event', 'project_click', {
      project: card ? card.dataset.project : 'other',
      link_url: a.href,
      content_group: 'portal',
      transport_type: 'beacon'
    });
  });
})();

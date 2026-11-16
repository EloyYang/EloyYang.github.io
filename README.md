# Eloy Lab — eloylab.it

eloy의 개인 포트폴리오 겸 서비스 포털. GitHub 사용자 사이트(`EloyYang.github.io`)에 `eloylab.it` 도메인을 연결해 두어, 같은 계정의 GitHub Pages 프로젝트가 모두 `eloylab.it/<저장소 이름>/`으로 열린다.

| 주소 | 저장소 |
|---|---|
| `/` | 이 저장소 (포털) |
| `/exam/` | `EloyYang/exam` — 시험 준비 노트 |
| `/buni/` | `EloyYang/buni` (docs 폴더) |
| `/pocket-arena/` | `EloyYang/pocket-arena` |
| `/money-connection/` | `EloyYang/money-connection` |
| `/dial-home/` | 이 저장소의 `dial-home/` 폴더 (앱 저장소 `EloyYang/dial-home` 은 Pages를 켜지 않는다 — 켜면 이 폴더와 주소가 겹친다) |

- 새 프로젝트 추가: 그 저장소에서 Pages를 켜고(`CNAME`은 두지 않는다) `index.html`에 카드를 하나 더 넣고 `sitemap.xml`에 주소를 추가.
- `gtelp.html` 등 루트의 짧은 HTML은 예전 시험 사이트 주소를 `/exam/`으로 넘기는 이동 페이지. `404.html`도 예전 `/css`, `/js`, `/fire/` 경로를 `/exam/`으로 보낸다.
- `ads.txt`, 구글 사이트 확인 파일, 네이버·애드센스 메타 태그는 도메인 루트에 있어야 해서 이 저장소에 둔다.
- 이용 기록: `analytics.js` (GA4 `G-FXS8VPXXJV`, 시험 준비 노트와 같은 속성). 카드 클릭은 `project_click` 이벤트.

/* 홈 화면에 YEM 앱 만들기 (#addhome) · 아이폰 / 안드로이드
   스토리북 인물과 슈퍼스타 윤희쌤이 한 단계씩 알려 줘요. 안드로이드 크롬에서는 [지금 바로 설치] 버튼도 떠요. */
window.ADDHOME = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const URL_TXT = 'yem-brown.vercel.app';
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; document.querySelectorAll('.ah-install').forEach((b) => { b.hidden = false; }); });

  const ICON = 'assets/app/icon-192.png';
  const ppl = (id) => `assets/people/img/${id}.webp`;
  const yh = (pic) => `assets/yunhee/guide/${pic}.webp`;

  /* 휴대폰 그림: 화면 안에 누를 곳만 반짝여요 */
  const phone = (inner, cls = '') => `<div class="ah-phone ${cls}" aria-hidden="true"><div class="ah-scr">${inner}</div></div>`;
  const urlBar = (pos) => `<div class="ah-url ${pos}"><span>🔒 ${URL_TXT}</span></div>`;
  const page = '<div class="ah-page"><i></i><i></i><i class="s"></i><i></i><i class="s"></i></div>';
  const MOCK = {
    ios1: phone(`${page}${urlBar('bottom')}<div class="ah-bar bottom"><b>‹</b><b>›</b><b class="ah-hot">⬆︎</b><b>📖</b><b>⧉</b></div>`),
    ios2: phone(`${page}${urlBar('bottom')}<div class="ah-bar bottom"><b>‹</b><b>›</b><b class="ah-hot big">⬆︎</b><b>📖</b><b>⧉</b></div>`),
    ios3: phone(`<div class="ah-sheet"><p>공유</p><span>복사</span><span>읽기 목록에 추가</span><span>즐겨찾기 추가</span><span class="ah-hot row">홈 화면에 추가 <em>⊞</em></span><span>인쇄</span></div>`),
    ios4: phone(`<div class="ah-add"><p><span>취소</span><b>홈 화면에 추가</b><span class="ah-hot txt">추가</span></p><div class="ah-add-row"><img src="${ICON}" alt=""><div><b>YEM</b><small>${URL_TXT}</small></div></div></div>`),
    and1: phone(`${urlBar('top')}<div class="ah-bar top"><b class="ah-hot">⋮</b></div>${page}`),
    and2: phone(`${urlBar('top')}${page}<div class="ah-menu"><span>새 탭</span><span>북마크</span><span>방문 기록</span><span>페이지에서 찾기</span><span class="ah-hot row">설치 및 바로가기 만들기</span><span>번역…</span></div>`),
    and3: phone(`${page}<div class="ah-dialog"><p>설치 및 바로가기 만들기</p><div class="ah-add-row ah-hot row"><img src="${ICON}" alt=""><b>설치</b></div><div class="ah-add-row"><img src="${ICON}" alt=""><b>바로가기 만들기</b></div></div>`),
    done: phone(`<div class="ah-home">${'<i></i>'.repeat(5)}<span class="ah-myicon"><img src="${ICON}" alt=""><b>YEM</b></span>${'<i></i>'.repeat(6)}</div>`),
  };

  const step = (n, mock, who, say, title, desc) => `
    <li class="ah-step">
      <div class="ah-step-t"><span class="ah-no">${n}</span><div><h3>${title}</h3><p>${desc}</p></div></div>
      <div class="ah-step-v">${mock}<div class="ah-say"><img src="${who}" alt=""><p>${say}</p></div></div>
    </li>`;

  function iosHTML() {
    return `
      <div class="ah-pre">${'<img src="' + yh('oops') + '" alt="">'}<div><b>먼저 확인! 카카오톡에서 링크를 열었나요?</b>
        <p>오른쪽 아래 <b>⋯</b> 또는 <b>나침반 🧭</b> 버튼을 눌러 <b>“Safari로 열기”</b>를 골라요. 홈 화면 추가는 <b>Safari</b>에서만 돼요!</p></div></div>
      <ol class="ah-steps">
        ${step(1, MOCK.ios1, ppl('mary-mother'), '주소를 열었으면 준비 끝! 아래쪽을 봐요 😊', 'Safari로 YEM 홈페이지 열기', `주소창에 <b>${URL_TXT}</b> 가 보이면 돼요.`)}
        ${step(2, MOCK.ios2, ppl('gabriel'), '여기예요! 네모에서 화살표가 위로 쏙 나온 버튼!', '아래 가운데 <span class="ah-key">⬆︎ 공유</span> 버튼 누르기', '네모 위로 화살표가 나온 모양이에요. 안 보이면 화면을 살짝 위로 올려 봐요. (최신 아이폰은 <b>⋯</b> 를 누른 뒤 <b>공유</b>)')}
        ${step(3, MOCK.ios3, ppl('shepherds'), '목록을 위로 쭉~ 올려서 찾아봐요!', '<span class="ah-key">⊞ 홈 화면에 추가</span> 누르기', '메뉴를 위로 밀어 올리면 아래쪽에 있어요.')}
        ${step(4, MOCK.ios4, ppl('wise-men'), '이름은 YEM! 오른쪽 위 추가를 눌러요', '오른쪽 위 <span class="ah-key">추가</span> 누르기', '이름이 <b>YEM</b> 인지 확인하고 누르면 끝!')}
        ${step(5, MOCK.done, yh('yay'), '짜잔~! 이제 아기 예수님을 누르면 바로 열려요 🎉', '홈 화면에 <b>아기 예수님 YEM 앱</b> 완성!', '앱처럼 한 번에 열리고, 공부한 기록도 그대로 이어져요.')}
      </ol>`;
  }
  function androidHTML() {
    return `
      <div class="ah-pre"><img src="${yh('oops')}" alt=""><div><b>먼저 확인! 카카오톡에서 링크를 열었나요?</b>
        <p>오른쪽 위 <b>⋮</b> 를 눌러 <b>“다른 브라우저로 열기”</b> → <b>Chrome</b>(또는 삼성 인터넷)을 골라요.</p></div></div>
      <button type="button" class="hud-go ah-install" hidden>📲 지금 바로 설치하기 · 한 번에 끝!</button>
      <ol class="ah-steps">
        ${step(1, MOCK.and1, ppl('mary-mother'), '크롬으로 열었으면 오른쪽 위를 봐요!', 'Chrome으로 YEM 홈페이지 열기', `주소창에 <b>${URL_TXT}</b> 가 보이면 돼요.`)}
        ${step(2, MOCK.and1.replace('ah-phone ', 'ah-phone zoom-tr '), ppl('gabriel'), '점 세 개가 세로로 있는 버튼이에요!', '오른쪽 위 <span class="ah-key">⋮</span> 누르기', '점 세 개가 세로로 서 있는 버튼이에요.')}
        ${step(3, MOCK.and2, ppl('shepherds'), '설치 및 바로가기 만들기! 찾았나요?', '<span class="ah-key">설치 및 바로가기 만들기</span> 누르기', '휴대폰에 따라 <b>“홈 화면에 추가”</b> 또는 <b>“앱 설치”</b>로 보일 수도 있어요. 모두 같은 버튼이에요!')}
        ${step(4, MOCK.and3, ppl('wise-men'), '위에 있는 설치를 골라요!', '<span class="ah-key">설치</span> 누르기 (추천)', '<b>설치</b>를 고르면 진짜 앱처럼 주소창 없이 넓게 열려요. <b>바로가기 만들기</b>는 크롬 안에서 열려요. 둘 다 괜찮아요! 다른 화면이 나오면 <b>추가</b>를 눌러요.')}
        ${step(5, MOCK.done, yh('yay'), '짜잔~! 아기 예수님 아이콘이 생겼어요 🎉', '홈 화면에 <b>아기 예수님 YEM 앱</b> 완성!', '앱처럼 한 번에 열리고, 공부한 기록도 그대로 이어져요.')}
      </ol>
      <div class="ah-tip"><b>📱 삼성 인터넷을 쓰나요?</b> 아래 <span class="ah-key">☰</span> → <span class="ah-key">현재 페이지 추가</span> → <span class="ah-key">홈 화면</span> 순서로 눌러요.</div>`;
  }

  function render(tab) {
    const t = tab || (isAndroid ? 'android' : 'ios');
    return `
      <section class="sb-banner big page" aria-label="홈 화면에 YEM 앱 만들기">
        <img class="sb-banner-img" src="assets/banner/addhome.webp" alt="휴대폰 홈 화면에 생긴 아기 예수님 YEM 앱 아이콘" width="900" height="768" fetchpriority="high">
        <div class="sb-banner-t">
          <p class="sb-banner-k">ADD TO HOME SCREEN · 홈 화면에 추가</p>
          <h1 class="sb-banner-big">홈 화면에<br><em>YEM 앱</em> 만들기</h1>
          <p class="sb-banner-q" lang="en">“One tap, and you’re in!”</p>
          <p class="sb-banner-ko">아기 예수님을 누르면 바로 열려요</p>
          <p class="sb-banner-pill">🍎 아이폰 · 🤖 안드로이드 · 1분이면 끝!</p>
        </div>
      </section>
      ${standalone ? '<p class="ah-done-note">🎉 지금 이미 홈 화면 앱으로 열었어요! 잘했어요.</p>' : ''}
      <div class="ah-why"><img src="${ICON}" alt=""><div><b>왜 홈 화면에 추가하면 좋을까요?</b>
        <p>주소를 찾을 필요 없이 <b>아기 예수님 아이콘을 한 번</b> 누르면 바로 열려요. 화면도 넓어지고, <b>이어하기</b>로 공부하던 곳부터 바로 시작해요.</p></div></div>
      <div class="ah-tabs" role="tablist">
        <button type="button" role="tab" class="ah-tab ${t === 'ios' ? 'on' : ''}" data-ah-tab="ios" aria-selected="${t === 'ios'}">🍎 아이폰 (Safari)</button>
        <button type="button" role="tab" class="ah-tab ${t === 'android' ? 'on' : ''}" data-ah-tab="android" aria-selected="${t === 'android'}">🤖 안드로이드 (Chrome)</button>
      </div>
      <div class="ah-body" data-ah-os="${t}">${t === 'ios' ? iosHTML() : androidHTML()}</div>
      <div class="ah-end"><img src="${yh('heart')}" alt=""><p><b>슈퍼스타 윤희쌤</b>어려우면 주일에 선생님께 휴대폰을 보여 주세요. 같이 만들어 줄게요! 💛</p></div>`;
  }
  function bind(root) {
    root.addEventListener('click', async (e) => {
      const tb = e.target.closest('[data-ah-tab]');
      if (tb) {
        const t = tb.dataset.ahTab;
        root.querySelectorAll('.ah-tab').forEach((b) => { b.classList.toggle('on', b === tb); b.setAttribute('aria-selected', String(b === tb)); });
        const body = root.querySelector('.ah-body');
        body.dataset.ahOs = t;
        body.innerHTML = t === 'ios' ? iosHTML() : androidHTML();
        if (deferred) root.querySelectorAll('.ah-install').forEach((b) => { b.hidden = false; });
        return;
      }
      if (e.target.closest('.ah-install') && deferred) {
        deferred.prompt();
        try { await deferred.userChoice; } catch (err) { /* 무시 */ }
        deferred = null;
        root.querySelectorAll('.ah-install').forEach((b) => { b.hidden = true; });
      }
    });
    if (deferred) root.querySelectorAll('.ah-install').forEach((b) => { b.hidden = false; });
  }
  return { render, bind, isIOS, isAndroid };
})();

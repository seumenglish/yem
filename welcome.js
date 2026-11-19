/* 한눈에 보는 인천영락교회 영어예배부 YEM (#welcome)
   새신자 · 예배 참석자에게 링크 하나로 보내는 소개 페이지예요. 예배 순서는 about.js의 ORDER를 그대로 써요.
   아이 이름 · 사진은 넣지 않아요. */
window.WELCOME = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const URL = 'https://yem-brown.vercel.app/welcome';
  const P = (id) => `assets/people/img/${id}.webp`;
  const USE = [
    ['📚', '바이블 스토리북', '예수님 탄생 이야기 5권을 영어 · 中文 원어민 목소리로 들어요.', '#books', 'jesus'],
    ['🎧', '이번 달 영어 찬양', '예배 때 부르는 찬양을 집에서 미리 배우고 따라 불러요.', '#songs', 'david'],
    ['🙋', '믿음의 사람 110명', '성경 인물 카드를 누르면 이름과 이야기를 들려줘요.', '#people', 'moses'],
    ['🌟', '리더 라운지', '챌린지 사진 · 배지함 · 감사 일기 · 받은 메시지. <b>YEM 코드</b>는 선생님께 받아요.', '#challenge', 'mary-mother'],
    ['📲', '홈 화면에 앱 만들기', '아기 예수님 아이콘을 누르면 한 번에 열려요.', '#addhome', 'gabriel'],
    ['🏠', 'YEM 이야기', '우리가 어떤 공동체인지, 사진과 함께 더 알아봐요.', '#home', 'shepherds'],
  ];
  function render() {
    const A = window.ABOUT || {};
    const ORDER = A.ORDER || [];
    const FAQ = A.FAQ || [];
    const banner = window.yemBanner ? window.yemBanner({
      img: 'home', alt: '별빛 아래 마구간의 아기 예수님과 마리아, 요셉', kicker: 'YOUNGNAK ENGLISH MINISTRY · 인천영락교회 영어예배부',
      q: 'Welcome Home!', ko: '“어서 와, 영어예배부는 처음이지?”', ref: 'YEM', big: '한눈에 보는<br><em>YEM</em>', title: '⛪ 매주 주일 오후 2시 · 2층 다윗홀',
    }) : '<h1>한눈에 보는 YEM</h1>';
    return `${banner}
    <section class="wl-wrap">
      <div class="wl-facts">
        <div><span>🕑</span><b>매주 주일 오후 2시</b><small>Sunday 2:00 PM</small></div>
        <div><span>📍</span><b>인천영락교회 2층 다윗홀</b><small>Incheon Younglak Church · 2F</small></div>
        <div><img class="wl-pastor" src="assets/pastor/smile.webp" alt="문새럴 목사님 캐릭터"><b>문새럴 목사님</b><small>Pastor Moon Shairal</small></div>
        <div><span>👨‍👩‍👧‍👦</span><b>유치부부터 어른까지</b><small>Everyone is welcome!</small></div>
      </div>

      <div class="wl-card wl-first">
        <h2>처음 오셨나요? <small>First time? Welcome!</small></h2>
        <ol class="wl-steps">
          <li><b>1</b><p><b>2층 다윗홀</b>로 오세요. 1시 50분쯤 오면 여유 있어요.</p></li>
          <li><b>2</b><p>명찰이 없으면 입구에서 <b>이름을 남겨 주세요.</b> 영어 이름이 없어도 괜찮아요.</p></li>
          <li><b>3</b><p>예배 마지막 <b>광고 시간</b>에 큰 박수로 환영해요. 쑥스러워도 괜찮아요!</p></li>
          <li><b>4</b><p>예배 후 선생님이 <b>환영 메시지</b>와 이 홈페이지 사용법을 보내 드려요.</p></li>
        </ol>
        <div class="wl-hello"><img src="assets/pastor/thanks.webp" alt="문새럴 목사님 캐릭터"><p><b>문새럴 목사님</b>영어를 잘 못해도 괜찮아요. 시험 보는 자리가 아니라 하나님의 사랑을 함께 누리는 자리예요. 오늘 와 주셔서 고마워요 💛</p></div>
      </div>

      <div class="wl-card">
        <h2>예배 순서 <small>Order of Worship · 2:00 PM</small></h2>
        <ol class="wl-order">${ORDER.map(([en, ko, who], i) => `<li><span>${i + 1}</span><div><b>${esc(ko)}</b><small lang="en">${esc(en)}${who ? ` · ${esc(who)}` : ''}</small></div>${who === 'Pastor Moon' ? '<img class="wl-who" src="assets/pastor/smile.webp" alt="">' : ''}</li>`).join('')}</ol>
        <p class="wl-muted">순서는 주마다 조금씩 달라질 수 있어요. 가사와 말씀은 스크린에 크게 나와요.</p>
      </div>

      <div class="wl-card">
        <h2>홈페이지, 이렇게 써요 <small>Use YEM at home</small></h2>
        <div class="wl-use">${USE.map(([e, h, p, to, img]) => `<a class="wl-u" href="${to}"><img src="${P(img)}" alt="" loading="lazy"><div><b>${e} ${h}</b><p>${p}</p></div></a>`).join('')}</div>
      </div>

      ${FAQ.length ? `<div class="wl-card"><h2>자주 묻는 질문 <small>FAQ</small></h2>${FAQ.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}

      <div class="wl-share">
        <img src="assets/yunhee/guide/heart.webp" alt="">
        <div><b>다음 주일에 또 만나요! 💛</b><p>이 페이지를 친구 · 가족에게 보내 주세요.</p>
          <button type="button" class="ld-big" data-wl-share>🔗 이 페이지 보내기</button></div>
      </div>
    </section>`;
  }
  function bind(root) {
    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-wl-share]');
      if (!b) return;
      const text = '한눈에 보는 인천영락교회 영어예배부 YEM · 매주 주일 오후 2시 2층 다윗홀';
      if (navigator.share) { try { await navigator.share({ title: 'YEM 한눈에 보기', text, url: URL }); return; } catch (x) { /* 취소 */ } }
      try { await navigator.clipboard.writeText(`${text}\n${URL}`); b.textContent = '✅ 링크를 복사했어요! 카톡에 붙여넣기'; } catch (x) { prompt('이 주소를 복사해요', URL); }
    });
  }
  return { render, bind };
})();

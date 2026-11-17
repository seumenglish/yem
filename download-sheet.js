/* 파일 내려받기 상세 안내 (모든 a[download] 버튼)
   버튼을 누르면 바로 내려받지 않고, 어떤 파일인지 · 어떻게 쓰는지 먼저 보여 줘요.
   안내창 안의 [내려받기] 버튼(data-dl-go)만 실제로 파일을 받아요. */
(function () {
  /* 🔒 지금은 모든 내려받기를 잠시 막아 둬요 (완성되면 false 로 바꾸면 위 안내창이 열려요) */
  const LOCKED = true;
  const FILE_RE = /assets\/(books|cards)\/.+\.(mp3|pdf)$/i;
  if (LOCKED) document.documentElement.classList.add('dl-locked');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MB = (n) => (n >= 1048576 ? (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB');

  function kindOf(href) {
    const m = href.match(/books\/b(\d+)\/[^/]+\.(mp3|pdf)$/i);
    if (m) return { kind: m[2].toLowerCase() === 'mp3' ? 'bookMp3' : 'bookPdf', bk: m[1] };
    if (/cards\/[^/]+\.pdf$/i.test(href)) return { kind: 'cards' };
    return { kind: /\.mp3$/i.test(href) ? 'mp3' : 'file' };
  }

  const say = (pic, html) => `<div class="dl-say"><img src="assets/yunhee/guide/${pic}.webp" alt="" width="64"><p><b>슈퍼스타 윤희쌤</b>${html}</p></div>`;
  const list = (title, items, ol) => `<section class="dl-sec"><h4>${title}</h4><${ol ? 'ol' : 'ul'}>${items.map((t) => `<li>${t}</li>`).join('')}</${ol ? 'ol' : 'ul'}></section>`;
  const SAVE = list('📱 휴대폰에 저장하는 법', [
    '<b>아이폰</b> · 버튼을 누르면 위에 ⬇ 표시가 생겨요 → <b>파일 앱 › 다운로드</b> 폴더에 저장돼요.',
    '<b>안드로이드</b> · 알림창의 다운로드 완료를 누르거나, <b>내 파일 › Download</b> 폴더에서 찾아요.',
    '카카오톡 <b>나와의 채팅</b>에 보내 두면 언제든 다시 꺼내 쓰기 편해요.',
  ]);
  const FREE = `<p class="dl-free">🆓 <b>모두 무료예요.</b> 가정 · 교회 · 교실에서 마음껏 쓰세요. 다만 <b>판매하거나 고쳐서 다시 배포하는 것은 안 돼요.</b> 나눌 때는 <b>“YEM 영어예배부”</b> 출처와 홈페이지 링크를 함께 알려 주세요.</p>`;

  function body(info, href, name) {
    const D = window.STORYBOOKS;
    const b = info.bk && D && D.books ? D.books[info.bk] : null;
    const head = (kick, title, sub, img) => `
      <header class="dl-head">${img ? `<img class="dl-thumb" src="${img}" alt="">` : '<span class="dl-thumb ico">📁</span>'}
        <div><p class="dl-kick">${kick}</p><h3 id="dl-title">${title}</h3>${sub ? `<p class="dl-sub">${sub}</p>` : ''}</div></header>`;
    const chips = (arr) => `<div class="dl-chips">${arr.map((c) => `<span>${c}</span>`).join('')}<span class="dl-size" hidden></span></div>`;

    if (info.kind === 'bookMp3' && b) {
      return {
        html: head(`BOOK ${b.bk} · 전체 음성 MP3`, `<span lang="en">${esc(b.title)}</span>`, esc(b.ko), b.ebook && b.ebook[0])
          + chips(['🎧 <span class="dl-dur">약 3분</span>', '🗣️ 영어 · 中文', '🆓 무료'])
          + say('yay', '차 타고 갈 때, 잠들기 전에 틀어 주세요. 귀로 먼저 만난 이야기는 주일 영어예배에서 <b>“어, 이거 들었어!”</b> 하고 반짝여요 ✨')
          + list('🎵 이 파일에 들어 있어요', [
            '쪽마다 <b>책장 넘기는 소리</b> — 그림책을 펴 놓고 함께 넘겨요',
            '<b>영어 이야기 드라마 낭독</b> — 해설과 등장인물 목소리가 달라요',
            '<b>中文</b> 여자 · 남자 목소리로 한 번 더',
            `마지막엔 외울 말씀 <b lang="en">${esc(b.verse && b.verse.enRef)}</b>`,
          ])
          + list('💡 이렇게 들어 보세요', [
            '<b>등원 · 차 안</b>에서 배경음처럼 하루 한 번',
            '<b>잠자리</b>에서 인쇄한 그림책을 펴고 같이 넘기기',
            '한 쪽이 끝나면 멈추고 <b>한 문장만 따라 말하기</b>',
            '다 듣고 나면 홈페이지 E-북에서 <b>카드를 모아</b> XP 받기',
          ], true)
          + SAVE
          + `<p class="dl-note">🤖 원어민 목소리는 AI 음성으로 만들었어요.</p>`
          + `<div class="dl-pre"><button type="button" class="ghost sm" data-dl-play>▶ 먼저 조금 들어 보기</button><audio preload="none" src="${esc(href)}"></audio></div>`,
        go: '⬇️ MP3 내려받기',
      };
    }
    if (info.kind === 'bookPdf' && b) {
      return {
        html: head(`BOOK ${b.bk} · 인쇄용 소책자 PDF`, `<span lang="en">${esc(b.title)}</span>`, esc(b.ko), b.ebook && b.ebook[0])
          + chips(['📄 A4 가로 10쪽', '🧾 종이 5장', '📖 접으면 20쪽 책', '🆓 무료'])
          + say('heart', '직접 접어 만든 책은 아이에게 <b>“내 책”</b>이 돼요. 표지에 이름도 쓰고, 색칠도 마음껏 하게 해 주세요 💛')
          + list('🧰 준비물', [
            '컬러 프린터 (흑백으로 뽑아 색칠책으로 써도 좋아요)',
            'A4 종이 5장 — 120g 이상 조금 두꺼운 종이면 더 튼튼해요',
            '스테이플러 (가운데를 찍는 <b>롱 스테이플러</b>가 있으면 최고!)',
          ])
          + list('🖨️ 인쇄 설정 (꼭 확인!)', [
            '용지 <b>A4 · 가로</b> / 크기 <b>실제 크기 100%</b> (“페이지에 맞춤” 끄기)',
            '<b>양면 인쇄 · 짧은 쪽으로 넘기기</b> / 컬러 · 고품질',
            '단면 프린터라면: <b>홀수 쪽</b> 먼저 → 나온 종이를 뒤집어 넣고 <b>짝수 쪽</b>',
          ])
          + list('✂️ 만드는 법', [
            '인쇄한 5장을 <b>나온 순서 그대로</b> 겹쳐요 (1쪽이 맨 위)',
            '한가운데를 <b>반으로 접어요</b> — 표지가 앞에 오면 성공!',
            '접힌 선에 <b>스테이플러 2곳</b>을 찍어요',
            '표지에 이름을 쓰고, 그림을 색칠하면 완성 🎉',
          ], true)
          + list('💡 이렇게 써요', [
            '전체 음성 MP3를 틀고 소리에 맞춰 <b>책장 넘기기</b>',
            '쪽마다 나온 <b>영어 단어</b>에 동그라미 치기',
            '마지막 쪽 <b>외울 말씀</b>을 가족과 함께 소리 내어 읽기',
            '주일에 교회에 가져와 <b>친구에게 소개</b>하기',
          ])
          + SAVE,
        go: '⬇️ PDF 내려받기',
        open: '🖨️ 파일 열어 바로 인쇄',
      };
    }
    if (info.kind === 'cards') {
      return {
        html: head('PEOPLE OF FAITH · 인쇄용 카드 PDF', '성경 인물 카드 110장', '영어 · 中文 · 한국어', 'assets/cards/sample-front.webp')
          + chips(['🃏 110장', '📄 A4 56쪽', '✂️ A6 크기', '🆓 무료'])
          + say('wow', '파일이 커요(약 30MB). <b>와이파이</b>에서 받아 주세요! 인쇄 설정과 만드는 법은 이 페이지 위쪽에 자세히 적어 두었어요.')
          + list('🖨️ 꼭 기억해요', [
            'A4 · <b>실제 크기 100%</b> · 컬러 · <b>양면 · 긴 쪽으로 넘기기</b>',
            '종이는 <b>180~250g 무광</b> 두꺼운 종이가 좋아요',
            '성탄 카드만 먼저: <b>23~26쪽, 45~50쪽</b>',
          ])
          + SAVE,
        go: '⬇️ 카드 파일 내려받기',
        open: '🖨️ 파일 열어 바로 인쇄',
      };
    }
    return {
      html: head('파일 내려받기', esc(name), '', '') + chips(['🆓 무료']) + SAVE,
      go: '⬇️ 내려받기',
      open: /\.pdf$/i.test(href) ? '📄 파일 열어 보기' : '',
    };
  }

  let box = null, lastFocus = null;
  function close() {
    if (!box) return;
    const au = box.querySelector('audio'); if (au) au.pause();
    box.remove(); box = null;
    document.documentElement.classList.remove('dl-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function soon(a) {
    lastFocus = a;
    close();
    box = document.createElement('div');
    box.className = 'dl-wrap';
    box.innerHTML = `
      <div class="dl-back" data-dl-close></div>
      <div class="dl-card dl-soon" role="dialog" aria-modal="true" aria-labelledby="dl-title">
        <button type="button" class="dl-x" data-dl-close aria-label="닫기">✕</button>
        <div class="soon-box">
          <div class="soon-pic"><img src="assets/yunhee/guide/shh.webp" alt="쉿! 하는 슈퍼스타 윤희쌤"><span class="soon-shh">🤫 쉿!</span></div>
          <p class="soon-big" id="dl-title">COMING<br>SOON</p>
        </div>
        <p class="soon-t"><b>슈퍼스타 윤희쌤</b>아직 비밀이에요! 음성 · 인쇄용 PDF · 성경 인물 카드 파일을 지금 더 예쁘게 다듬고 있어요. 완성되면 여기에서 <b>무료로</b> 열어 드릴게요 💛</p>
        <p class="soon-sub">그동안은 홈페이지에서 E-북으로 읽고, 듣고, 카드를 모아 보세요!</p>
        <div class="soon-btns"><a class="hud-go" href="#books" data-dl-close-go>📖 E-북으로 읽으러 가기</a><button type="button" class="ghost" data-dl-close>닫기</button></div>
      </div>`;
    document.body.appendChild(box);
    document.documentElement.classList.add('dl-lock');
    box.querySelector('.dl-x').focus();
  }

  function open(a) {
    const href = a.getAttribute('href');
    const name = a.getAttribute('download') || href.split('/').pop();
    const info = kindOf(href);
    const c = body(info, href, name);
    lastFocus = a;
    close();
    box = document.createElement('div');
    box.className = 'dl-wrap';
    box.innerHTML = `
      <div class="dl-back" data-dl-close></div>
      <div class="dl-card" role="dialog" aria-modal="true" aria-labelledby="dl-title">
        <button type="button" class="dl-x" data-dl-close aria-label="닫기">✕</button>
        <div class="dl-scroll">${c.html}${FREE}</div>
        <footer class="dl-foot">
          <a class="hud-go dl-go" data-dl-go href="${esc(href)}" download="${esc(name)}">${c.go}</a>
          ${c.open ? `<a class="ghost dl-open" data-dl-go href="${esc(href)}" target="_blank" rel="noopener">${c.open}</a>` : ''}
          <p class="dl-fname">파일 이름 · <code>${esc(name)}</code></p>
        </footer>
      </div>`;
    document.body.appendChild(box);
    document.documentElement.classList.add('dl-lock');
    box.querySelector('.dl-x').focus();

    // 파일 크기 · 길이를 실제 파일에서 읽어 와요 (실패하면 조용히 숨김)
    fetch(href, { method: 'HEAD' }).then((r) => {
      const n = +r.headers.get('content-length');
      const el = box && box.querySelector('.dl-size');
      if (el && n > 0) { el.textContent = '💾 ' + MB(n); el.hidden = false; }
    }).catch(() => {});
    const au = box.querySelector('audio');
    if (au) {
      const dur = box.querySelector('.dl-dur');
      const probe = new Audio(); probe.preload = 'metadata'; probe.src = href;
      probe.addEventListener('loadedmetadata', () => {
        if (dur && isFinite(probe.duration)) { const m = Math.floor(probe.duration / 60), s = Math.round(probe.duration % 60); dur.textContent = `${m}분 ${s}초`; }
      });
    }
  }

  document.addEventListener('click', (e) => {
    if (box) {
      if (e.target.closest('[data-dl-close]')) { e.preventDefault(); close(); return; }
      const pl = e.target.closest('[data-dl-play]');
      if (pl) {
        const au = box.querySelector('audio');
        if (au.paused) { au.play().catch(() => {}); pl.textContent = '⏸ 멈추기'; } else { au.pause(); pl.textContent = '▶ 이어 듣기'; }
        return;
      }
      if (e.target.closest('[data-dl-go]')) {
        const done = box.querySelector('.dl-done');
        if (!done) box.querySelector('.dl-foot').insertAdjacentHTML('beforeend', '<p class="dl-done">✅ 내려받기를 시작했어요! 휴대폰은 <b>다운로드</b> 폴더를 확인해 주세요.</p>');
        return; // 실제 내려받기는 브라우저가 해요
      }
    }
    if (LOCKED) {
      const f = e.target.closest('a[href]');
      if (!f || !(f.hasAttribute('download') || FILE_RE.test(f.getAttribute('href')))) return;
      e.preventDefault();
      if (box && f.hasAttribute('data-dl-go')) return;
      soon(f);
      return;
    }
    const a = e.target.closest('a[download]');
    if (!a || a.hasAttribute('data-dl-go') || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    open(a);
  });
  document.addEventListener('keydown', (e) => { if (box && e.key === 'Escape') close(); });
  window.addEventListener('hashchange', close);
})();

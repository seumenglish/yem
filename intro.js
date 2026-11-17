/* YEM 홈페이지 소개 (#intro): 이 홈페이지에서 무엇을 할 수 있는지 한눈에 보여 주고, 바로 해 보게 이끌어요. */
window.INTRO = (() => {
  const P = (id) => `assets/people/img/${id}.webp`;
  const yh = (pic, html, side) => `
    <div class="cg-say ${side || ''}"><img src="assets/yunhee/guide/${pic}.webp" alt="슈퍼스타 윤희쌤" width="82" height="120" loading="lazy">
      <p class="cg-bub">${html}</p></div>`;
  const cover = (n) => `assets/books/b${n}/e01.webp`;

  function render() {
    const verses = typeof VERSES !== 'undefined' ? VERSES.filter((v) => v.no > 0).length : 20;
    const people = 110;
    const books = window.STORYBOOKS ? Object.keys(window.STORYBOOKS.books).length : 5;
    const crowd = ['moses', 'noah', 'david', 'mary-mother', 'jesus', 'peter', 'esther', 'daniel', 'ruth', 'jonah', 'zacchaeus', 'miriam']
      .map((id, i) => `<img src="${P(id)}" alt="" style="--i:${i}" loading="lazy" onerror="this.remove()">`).join('');

    const FEAT = [
      { k: 'SONGS', h: '해외 CCM, <em>게임처럼</em> 정복해요', ico: '🎧', img: 'assets/hero/songs.webp', to: '#songs', go: '찬양 미션 시작',
        p: `한 곡을 <b>STAGE 1~4</b>(단어 → 문장 → 받아쓰기 → 외우기)로 나눠 미션처럼 깨요. 단계마다 <b>+10 XP</b>, 네 단계를 다 깨면 <b>MASTER 배지</b>와 보너스 XP!`,
        pts: ['원어민 음성 · 가사 따라 부르기', '같은 색 짝 찾기 메모리 게임', '구간 반복 · 속도 조절'] },
      { k: 'STORYBOOKS', h: '성경동화를 <em>원어민 드라마</em>로 들어요', ico: '📚', fan: true, to: '#books', go: '스토리북 펼치기',
        p: `책장을 넘기면 해설자와 마리아, 천사, 목자, 헤롯까지 <b>등장인물마다 다른 목소리</b>로 감정을 담아 읽어 줘요. 영어 · 中文으로 듣고, 한국어로 뜻을 봐요.`,
        pts: ['자동 넘기기 · 처음부터 끝까지 듣기', '전체 MP3 · 인쇄용 PDF 무료', '읽으면 바이블 포토카드 획득'] },
      { k: 'BIBLE FRIENDS', h: `성경 친구 <em>${people}명</em>을 만나요`, ico: '🙋', img: 'assets/hero/praise-team.webp', to: '#people', go: '성경 친구 만나기',
        p: `아담부터 바울까지, 이름을 누르면 <b>빠르게 한 번 · 천천히 한 번</b> 원어민이 불러 줘요. 그림을 누르면 영어와 한국어로 이야기를 들려줘요.`,
        pts: ['영어 · 발음기호 · 中文 · 한국어', '구약 · 신약 색으로 구분', '실물 카드로 인쇄해 놀기'], link: { to: '#cards', t: '실물 카드 만들기 →' } },
      { k: 'BIBLE VERSE', h: '이번 주 말씀, <em>빨간 동그라미</em>까지!', ico: '✍️', img: 'assets/hero/sentences.webp', to: '#verses', go: '이번 주 말씀 외우기',
        p: `듣고 따라 읽기 → 빈칸 채우기 → <b>보지 않고 쓰기</b>. 다 맞히면 원어민이 한 번 더 읽어 주고, 선생님처럼 <b>빨간 동그라미</b>를 쳐 줘요.`,
        pts: [`찬양마다 한 구절 · 모두 ${verses}구절`, '이번 주 보너스 +10 XP', '한 달 4구절 모으면 왕관'] },
    ];
    const feats = FEAT.map((f, i) => `
      <section class="it-feat ${i % 2 ? 'rev' : ''}">
        <div class="it-art">${f.fan
          ? `<div class="it-fan">${[1, 2, 3, 4, 5].map((n, j) => `<img src="${cover(n)}" alt="" style="--i:${j - 2}" loading="lazy">`).join('')}</div>`
          : `<img src="${f.img}" alt="" loading="lazy" width="1536" height="1024">`}</div>
        <div class="it-txt">
          <p class="it-k"><span>${f.ico}</span>${f.k}</p>
          <h2>${f.h}</h2>
          <p>${f.p}</p>
          <ul>${f.pts.map((x) => `<li>${x}</li>`).join('')}</ul>
          <div class="sa-btns"><a class="btn" href="${f.to}">${f.go} ▶</a>${f.link ? `<a class="ghost" href="${f.link.to}">${f.link.t}</a>` : ''}</div>
        </div>
      </section>`).join('');

    return `
      <section class="it-hero">
        <div class="it-sky" aria-hidden="true"></div>
        <div class="it-hero-in">
          <p class="it-kick">WELCOME TO YEM · 인천영락교회 영어예배부</p>
          <h1>말씀으로 자라고<br><em>영어로 찬양하는</em><br>우리들의 놀이터</h1>
          <p class="it-lead">주일 영어예배에서 부른 찬양과 들은 말씀을, 집에서도 <b>듣고 · 따라 하고 · 외우며</b> 이어 가요.
            하루 10분이면 충분해요. 가입도, 설치도, 비용도 없어요.</p>
          <div class="sa-btns"><a class="hud-go it-start" href="#home">지금 시작하기 ▶</a><button type="button" class="ghost it-share" data-it-share>🔗 친구에게 소개하기</button></div>
        </div>
        <div class="it-crowd" aria-hidden="true">${crowd}</div>
      </section>

      <section class="it-stats" aria-label="한눈에">
        <div><b>20</b><span>해외 CCM 곡</span></div>
        <div><b>${books}</b><span>바이블 스토리북</span></div>
        <div><b>${people}</b><span>성경 친구</span></div>
        <div><b>3</b><span>언어 · EN 中 한</span></div>
        <div class="gold"><b>0<small>원</small></b><span>모두 무료</span></div>
      </section>

      ${yh('wow', '안녕하세요, <b>슈퍼스타 윤희쌤</b>이에요! 이 홈페이지는 우리 영어예배부 친구들이 <b>일주일 내내</b> 말씀과 찬양 속에서 놀 수 있도록 하나하나 직접 만들었어요. 무엇을 할 수 있는지 같이 둘러볼까요? 💕')}

      <section class="it-loop">
        <p class="sb-kicker">HOW WE GROW</p>
        <h2>이렇게 자라요</h2>
        <ol>
          <li><b>듣기</b><span>원어민 목소리로 찬양과 이야기를 들어요</span></li>
          <li><b>따라 하기</b><span>단어 · 문장을 소리 내어 따라 해요</span></li>
          <li><b>외우기</b><span>빈칸을 채우고, 보지 않고 써요</span></li>
          <li><b>고백하기</b><span>주일 예배에서 친구들과 함께 담대히 찬양해요</span></li>
        </ol>
      </section>

      ${feats}

      <section class="it-game">
        <div class="it-game-t">
          <p class="it-k gold"><span>🏆</span>GROW &amp; COLLECT</p>
          <h2>공부할수록 <em>부자가 되는</em> 기분!</h2>
          <p>홈페이지가 날짜와 요일을 기억하고, 내가 한 모든 것을 차곡차곡 쌓아 줘요. 들어올 때마다 윤희쌤이 반겨 주고, 오늘 할 일을 바로 알려 줘요.</p>
        </div>
        <div class="it-badges">
          <div><b>⭐ XP</b><span>단계 · 말씀 · 카드마다 쌓여요</span></div>
          <div><b>🌱 → 🌟 레벨 8단계</b><span>새싹 찬양이에서 슈퍼스타까지</span></div>
          <div><b>👑 MASTER 배지</b><span>한 곡을 끝까지 정복하면</span></div>
          <div><b>🃏 바이블 포토카드</b><span>스토리북을 읽으면 모여요</span></div>
          <div><b>🔥 연속 방문</b><span>매일 오면 불꽃이 커져요</span></div>
          <div><b>🎄 크리스마스 카운트다운</b><span>주마다 미션과 달성률 %</span></div>
        </div>
        <a class="hud-go" href="#me">내 공부방 가 보기 ▶</a>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">10 MINUTES A DAY</p>
        <h2>하루 10분 추천 루틴</h2>
        <div class="it-week">
          <div><b>월 · 화</b><span>이번 주 찬양 듣고 STAGE 1 · 2</span></div>
          <div><b>수 · 목</b><span>스토리북 한 권 듣고 카드 모으기</span></div>
          <div><b>금</b><span>이번 주 암송 말씀 외워 쓰기</span></div>
          <div><b>토</b><span>성경 친구 이름 퀴즈 · 메모리 게임</span></div>
          <div class="sun"><b>주일</b><span>오후 2시 다윗홀에서 함께 찬양! 🙌</span></div>
        </div>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">FOR PARENTS</p>
        <h2>부모님께</h2>
        <div class="it-faq">
          <details open><summary>정말 무료인가요? 가입해야 하나요?</summary><p>네, 모든 기능과 자료(MP3 · 인쇄용 PDF · 카드)가 무료예요. 가입도 앱 설치도 필요 없어요. 처음에 아이 이름(별명도 좋아요)만 등록하면 돼요.</p></details>
          <details><summary>기록은 어디에 저장되나요?</summary><p>학습 기록과 카드는 <b>지금 쓰는 휴대폰(또는 컴퓨터)의 브라우저</b>에만 저장돼요. 서버로 보내지 않아요. 다른 기기에서는 따로 쌓이고, 브라우저 기록을 지우면 함께 지워질 수 있어요. 형제자매는 이름을 따로 등록하면 기록이 섞이지 않아요.</p></details>
          <details><summary>휴대폰 홈 화면에 앱처럼 놓을 수 있나요?</summary><p><b>아이폰</b>: 사파리에서 열고 아래 공유 버튼 → ‘홈 화면에 추가’.<br><b>안드로이드</b>: 크롬에서 열고 오른쪽 위 ⋮ → ‘홈 화면에 추가’. 이제 아이콘을 누르면 바로 열려요.</p></details>
          <details><summary>영어를 잘 못하는 부모님도 도와줄 수 있나요?</summary><p>그럼요! 모든 문장에 원어민 음성과 한국어 뜻이 함께 있어요. 아이와 같이 듣고 “와, 잘했다!” 한마디면 충분해요. 칭찬이 최고의 선생님이에요.</p></details>
          <details><summary>그림과 목소리는 어떻게 만들었나요?</summary><p>선생님이 성경을 읽고 또 읽으며 글을 쓰고, 그림과 원어민 목소리는 AI 도구(ChatGPT 그림, 무료 AI 음성)의 도움을 받아 만든 뒤 한 장씩 확인하고 다듬었어요.</p></details>
        </div>
      </section>

      <section class="it-end">
        ${yh('cheer', '우리 아이의 작은 영어 찬양 한 줄이, 세상을 품는 큰 꿈의 시작이 되길 기도해요. <b>“너의 무대는 세계야!”</b> 🌏', 'r')}
        <h2>오늘, 첫 미션부터 시작해 볼까요?</h2>
        <div class="sa-btns it-end-btns"><a class="hud-go" href="#home">오늘의 미션 보러 가기 ▶</a><button type="button" class="ghost" data-it-share>🔗 링크 공유하기</button></div>
        <p class="it-small">YEM 영어예배부 · Incheon Younglak Church English Ministry · 매주 주일 오후 2시 · 2층 다윗홀</p>
      </section>`;
  }

  function bind(el) {
    el.onclick = async (e) => {
      const b = e.target.closest('[data-it-share]');
      if (!b) return;
      const url = 'https://yem-brown.vercel.app/';
      const text = 'YEM 홈페이지에서 영어 성경동화를 원어민 목소리로 들어요! WOW!';
      try {
        if (navigator.share) { await navigator.share({ title: 'YEM 영어예배부', text, url }); return; }
        await navigator.clipboard.writeText(`${text}\n${url}`);
        const old = b.textContent; b.textContent = '✓ 링크를 복사했어요!'; setTimeout(() => { b.textContent = old; }, 2200);
      } catch (err) { /* 공유 취소 */ }
    };
  }
  return { render, bind };
})();

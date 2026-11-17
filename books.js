/* YEM 바이블 스토리북 E-북: 책장(#books) · 책(#book/<책>/<쪽 1~20>)
   데이터: storybooks-data.js (christmas/소책자/make_web_books.py 가 소책자 PDF · 글 · 그림으로 만듦)
   책장 넘기기: vendor/page-flip.browser.js (St.PageFlip, MIT)
   쪽 번호 = 소책자 쪽 번호 (1 표지 · 2 단어 · 3~14 이야기 · 15~16 한국어 · 17 외울 말씀 · 18~20)
   음성: 영어 여자 → 남자 (한 번 누르면 두 번), 중국어 여자 → 남자, 영어 천천히. 한국어는 글로만 보여요. */
window.BOOKS_UI = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = window.STORYBOOKS || { series: [], books: {} };
  const ar = (c) => `<span class="ar">${c}</span>`;
  const chev = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d === 'l' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('yem.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yem.' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 무시 */ } },
  };
  const person = (id) => (window.PEOPLE_ART && PEOPLE_ART.byId.get(id)) || null;

  /* ---------- 소리 ---------- */
  let voice = null; // 읽어 주는 목소리
  let token = 0;
  const flipAudio = D.flip ? new Audio(D.flip) : null;
  let flipOn = store.get('flipSound', true);
  function flipSound() {
    if (!flipOn || !flipAudio) return;
    try { flipAudio.currentTime = 0; flipAudio.volume = 0.7; flipAudio.play().catch(() => {}); } catch (e) { /* 무시 */ }
  }
  function stopVoice() {
    token++;
    if (voice) { voice.onended = voice.onerror = null; voice.pause(); }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.querySelectorAll('.eb-speaking').forEach((e) => e.classList.remove('eb-speaking'));
  }
  /* 여러 소리를 차례로: [{src, text, lang}] */
  function playList(list, el, onEnd) {
    stopVoice();
    const my = token;
    if (window.onVoicePlay && list[0]) window.onVoicePlay(list[0].text);
    if (el) el.classList.add('eb-speaking');
    let i = 0;
    const finish = () => { if (my !== token) return; if (el) el.classList.remove('eb-speaking'); if (onEnd) onEnd(); };
    const next = () => {
      if (my !== token) return;
      if (i >= list.length) return finish();
      const it = list[i++];
      const after = () => setTimeout(next, 450);
      const fallback = () => {
        if (my !== token) return;
        if (!('speechSynthesis' in window)) return after();
        const u = new SpeechSynthesisUtterance(it.text);
        u.lang = it.lang; u.rate = it.slow ? 0.65 : 0.95;
        u.onend = after; u.onerror = after;
        speechSynthesis.speak(u);
      };
      if (!voice) voice = new Audio();
      voice.onended = after;
      voice.onerror = fallback;
      voice.src = it.src;
      voice.play().catch(fallback);
    };
    next();
  }

  /* ---------- 쪽 → 읽을 내용 ---------- */
  function readable(b, num) {
    if (num === 1) return { au: b.titleAudio, en: b.title, zh: b.zh, people: b.coverPeople };
    if (num === 17) return { au: b.verse.audio, en: b.verse.en, zh: b.verse.zh };
    const p = b.pages.find((x) => x.n === num);
    return p ? { au: p.audio, en: p.en, zh: p.zh, ko: p.ko, people: p.people, slow: p.audio.slow } : null;
  }
  const enList = (r) => [{ src: r.au['en-f'], text: r.en, lang: 'en-US' }, { src: r.au['en-m'], text: r.en, lang: 'en-US' }];
  // 드라마식 낭독(해설자 + 등장인물 목소리)이 있으면 그것으로, 없으면 영어 여 → 남
  // 목소리 고르기: 'native' 원어민 드라마 · 'yh' 슈퍼스타 윤희쌤 목소리 (그 쪽에 있을 때만)
  let voicePick = store.get('voice', 'native');
  const storyList = (r) => {
    if (voicePick === 'yh' && r.au && r.au.yh) return [{ src: r.au.yh, text: r.en, lang: 'en-US' }];
    return r.au && r.au.drama ? [{ src: r.au.drama, text: r.en, lang: 'en-US' }] : enList(r);
  };
  const hasYh = (b) => !!((b.titleAudio && b.titleAudio.yh) || b.pages.some((p) => p.audio && p.audio.yh));
  const zhList = (r) => [{ src: r.au['zh-f'], text: r.zh, lang: 'zh-CN' }, { src: r.au['zh-m'], text: r.zh, lang: 'zh-CN' }];

  /* ---------- 책장 ---------- */
  function renderShelf() {
    const items = D.series.map((s) => {
      const b = D.books[s.bk];
      const pill = `<span class="sb-pill">Book ${s.bk}</span>`;
      if (!s.ready || !b) {
        return `<div class="sb-shelf-item soon"><div class="sb-cover-wrap sb-cover-soon">${pill}<span>📖<br>${esc(s.date)}<br>준비 중</span></div>
          <b lang="en">${esc(s.title)}</b><small>${esc(s.ko)}</small></div>`;
      }
      return `<a class="sb-shelf-item" href="#book/${s.bk}">
        <span class="sb-cover-wrap real">${s.bk === '1' || s.bk === '2' ? '<span class="sb-best">BEST</span>' : ''}<img src="${b.ebook[0]}" alt="Book ${s.bk} ${esc(s.title)} · ${esc(s.ko)} 표지" loading="lazy"></span>
        <span class="sb-meta"><span class="sb-no">BOOK ${s.bk}</span><b lang="en">${esc(s.title)}</b><small>${esc(s.ko)} · ${esc(b.source.ko)}</small></span></a>`;
    }).join('');
    const ready = D.series.filter((s) => s.ready).length;
    return `
      <section class="sb-banner big" aria-label="YEM 바이블 스토리북 · 예수님 탄생 이야기">
        <img class="sb-banner-img" src="assets/books/banner-nativity.webp" alt="마구간 구유에 누운 아기 예수님과 기도하는 마리아와 요셉" width="900" height="768" fetchpriority="high">
        <div class="sb-banner-t">
          <p class="sb-banner-k">YEM BIBLE STORY BOOKS</p>
          <h1 class="sb-banner-big">YEM 바이블<br><em>스토리북</em></h1>
          <p class="sb-banner-q" lang="en">“There, baby Jesus was born!”</p>
          <p class="sb-banner-ko">“아기 예수님이 태어나셨어요!”</p>
          <p class="sb-banner-pill">✨ 예수님 탄생 이야기 <em>${D.series.length}권</em></p>
        </div>
      </section>
      <section class="sb-shelf">${items}</section>
      <section class="sb-intro">
        <div><p class="bp-kicker">New Testament · Christmas Stories</p>
          <h2>예수님 탄생 이야기 ${D.series.length}권</h2>
          <p>영어 · 中文 · 한국어가 함께 들어 있는 그림책이에요. 해설자와 <b>등장인물마다 다른 원어민 목소리</b>로 실감 나게 읽어 주고, 중국어도 들을 수 있어요.<br>
          책장은 <b>오른쪽 · 왼쪽 동그라미</b>를 눌러 넘기고, <b>자동 넘기기</b>를 켜면 저절로 넘어가요.</p></div>
        <div class="sb-intro-act"><a class="btn" href="#books/about">스토리북 소개 보기 ${ar('→')}</a><span class="sb-ready">지금 읽을 수 있어요 · ${ready}권</span></div>
      </section>`;
  }

  /* ---------- 책마다 맨 위 배너 (그 책의 대표 장면) ---------- */
  const BANNER_PAGE = { 1: 10, 2: 13, 3: 5, 4: 13, 5: 7 };
  function bookBanner(b) {
    const p = b.pages.find((x) => x.n === BANNER_PAGE[b.bk]) || b.pages[0];
    const q = (s) => String(s || '').replace(/^["“]|["”]$/g, '');
    return `
      <section class="sb-banner book big" aria-label="Book ${b.bk} ${esc(b.title)}">
        <img class="sb-banner-img" src="assets/books/b${b.bk}/banner.webp" alt="" width="900" height="768" fetchpriority="high">
        <div class="sb-banner-t">
          <p class="sb-banner-k">BOOK ${b.bk} · ${esc(b.source.short || 'NEW TESTAMENT')}</p>
          <h1 class="sb-banner-big"><em>Book ${b.bk}</em><br>${esc(b.ko)}</h1>
          <p class="sb-banner-q" lang="en">“${esc(q(p.en))}”</p>
          <p class="sb-banner-ko">“${esc(q(p.ko))}”</p>
          <p class="sb-banner-pill" lang="en">📖 ${esc(b.title)}</p>
        </div>
      </section>`;
  }

  /* ---------- E-북 ---------- */
  function renderBook(b) {
    const pages = b.ebook.map((src, i) => {
      const hard = i === 0 || i === b.ebook.length - 1;
      return `<div class="eb-page" ${hard ? 'data-density="hard"' : ''}><img src="${src}" alt="${i + 1}쪽" ${i < 4 ? '' : 'loading="lazy"'} draggable="false"></div>`;
    }).join('');
    const words = b.words.map((w, i) => `<button type="button" class="sb-word" data-word="${i}">
      <b lang="en">${esc(w.en)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="ko">${esc(w.ko)}</span><span class="zh" lang="zh-CN">${esc(w.zh)} <small>${esc(w.py)}</small></span></button>`).join('');
    const nextBook = D.books[String(Number(b.bk) + 1)];
    return `
      <a class="back sb-back" href="#books">${ar('←')} 스토리북 책장</a>
      ${bookBanner(b)}
      <section class="eb-wrap">
        <div class="eb-stage">
          <button type="button" class="eb-arrow left" data-flip="prev" aria-label="이전 쪽">${chev('l')}</button>
          <div class="eb-book" id="eb-book" style="--ratio:${b.pageW}/${b.pageH}">${pages}</div>
          <button type="button" class="eb-arrow right" data-flip="next" aria-label="다음 쪽">${chev('r')}</button>
        </div>
        ${hasYh(b) ? `<div class="eb-voice" role="group" aria-label="목소리 고르기">
          <span class="eb-voice-l">목소리</span>
          <button type="button" class="eb-vbtn ${voicePick !== 'yh' ? 'on' : ''}" data-voice="native" aria-pressed="${voicePick !== 'yh'}">🎭 원어민 드라마</button>
          <button type="button" class="eb-vbtn yh ${voicePick === 'yh' ? 'on' : ''}" data-voice="yh" aria-pressed="${voicePick === 'yh'}"><img src="assets/yunhee/guide/yay.webp" alt="" width="34" height="50">슈퍼스타 윤희쌤 목소리</button>
        </div>` : ''}
        <div class="eb-bar">
          <span class="eb-count" id="eb-count">1 / ${b.ebook.length}</span>
          <div class="eb-tools" id="eb-read">
            <button type="button" class="listen-btn" data-say="story"><span>🎭</span>이야기 듣기</button>
            <button type="button" class="mini-btn" data-say="en">🔊 영어 <small>여·남</small></button>
            <button type="button" class="mini-btn" data-say="zh" lang="zh-CN">中文 <small>女·男</small></button>
            <button type="button" class="mini-btn" data-say="slow">🐢 천천히</button>
          </div>
          <div class="eb-tools">
            <button type="button" class="ghost sm eb-toggle" data-mode="auto" aria-pressed="false">▶ 자동 넘기기</button>
            <button type="button" class="ghost sm eb-toggle" data-mode="listen" aria-pressed="false">🎧 처음부터 끝까지 듣기</button>
            <button type="button" class="ghost sm eb-toggle ${flipOn ? 'on' : ''}" data-mode="sound" aria-pressed="${flipOn}">${flipOn ? '🔔 넘기는 소리 켜짐' : '🔕 넘기는 소리 꺼짐'}</button>
          </div>
        </div>
        <div class="eb-under">
          <div class="eb-ko" id="eb-ko"></div>
          <div id="eb-people"></div>
        </div>
      </section>
      <section class="eb-down">
        <a class="btn" href="${b.mp3}" download="${b.mp3.split('/').pop()}">⬇ 전체 음성 MP3 받기</a>
        ${b.pdf ? `<a class="btn alt" href="${b.pdf}" download="${b.pdf.split('/').pop()}">🖨️ 인쇄용 PDF 받기</a>` : ''}
        <small>MP3: 쪽마다 책장 넘기는 소리 → 영어 이야기 낭독(해설 + 등장인물 목소리) → 中文(女·男) · 외울 말씀까지 ·
          PDF: A4 가로 양면 인쇄 → 반으로 접어 가운데를 스테이플러로 묶어요 <b class="eb-wip">작업 중 · 완성 전</b></small>
      </section>
      <details class="card eb-words"><summary>📝 이 책의 단어 ${b.words.length}개 <small>(누르면 영어 → 中文 순서로 들려줘요)</small></summary><div class="sb-words">${words}</div></details>
      <nav class="sb-nav"><a class="ghost sm" href="#books">${ar('←')} 책장</a>
        ${nextBook ? `<a class="btn sm" href="#book/${nextBook.bk}">Book ${nextBook.bk} 읽으러 가기 ${ar('→')}</a>` : ''}</nav>`;
  }


  /* ---------- 스토리북 소개 (#books/about) ---------- */
  function renderAbout() {
    const list = D.series.filter((s) => s.ready && D.books[s.bk]).map((s) => D.books[s.bk]);
    const fan = list.map((b, i) => `<img src="${b.ebook[0]}" alt="" style="--i:${i - (list.length - 1) / 2}" loading="${i < 3 ? 'eager' : 'lazy'}">`).join('');
    const wordsN = list.reduce((n, b) => n + b.words.length, 0);
    const scenes = list.reduce((n, b) => n + b.pages.length, 0);
    const books = list.map((b) => `
      <article class="sa-book">
        <a class="sa-cover" href="#book/${b.bk}"><img src="${b.ebook[0]}" alt="Book ${b.bk} 표지" loading="lazy"></a>
        <div class="sa-book-t">
          <p class="sb-no">BOOK ${b.bk} · ${esc(b.date)}</p>
          <h3 lang="en">${esc(b.title)}</h3>
          <p class="sa-sub">${esc(b.ko)} · <span lang="zh-CN">${esc(b.zh)}</span></p>
          <p class="sa-src">${esc(b.source.ko)}</p>
          <blockquote lang="en">“${esc(b.verse.en)}”<cite>${esc(b.verse.enRef)}</cite></blockquote>
          <p class="sa-talk">함께 나눠요 · ${esc(b.talk.ko)}</p>
          <div class="sa-btns"><a class="btn sm" href="#book/${b.bk}">읽기</a>
            ${b.pdf ? `<a class="ghost sm" href="${b.pdf}" download="${b.pdf.split('/').pop()}">인쇄용 PDF</a>` : ''}
            ${b.mp3 ? `<a class="ghost sm" href="${b.mp3}" download="${b.mp3.split('/').pop()}">전체 MP3</a>` : ''}</div>
        </div>
      </article>`).join('');
    return `
      <section class="sa-hero">
        <a class="back" href="#books">${ar('←')} 스토리북 책장</a>
        <div class="sa-hero-in">
          <div class="sa-hero-t">
            <p class="sb-kicker">YEM BIBLE STORY BOOKS · FREE TO SHARE</p>
            <h1>한 아이를 위해<br>한 장씩 그린 <em>성경 그림책</em></h1>
            <p>인천영락교회 영어예배부(YEM)가 아이들과 함께 읽으려고 만든 예수님 탄생 이야기 ${list.length}권이에요.
              값을 받지 않고 나눠요. 그래도 한 장 한 장, 한 문장 한 문장 <b>가장 귀한 선물을 준비하는 마음</b>으로 만들었어요.</p>
            <div class="sa-btns"><a class="btn" href="#book/${list[0] ? list[0].bk : 1}">Book 1부터 읽기 ${ar('→')}</a><a class="ghost" href="#books">책장 보기</a></div>
          </div>
          <div class="sa-fan" aria-hidden="true">${fan}</div>
        </div>
      </section>

      <section class="sa-stats" aria-label="스토리북 한눈에">
        <div><b>${list.length}</b><span>권 시리즈</span></div>
        <div><b>${scenes}</b><span>장면 그림</span></div>
        <div><b>3</b><span>언어 · English 中文 한국어</span></div>
        <div><b>${wordsN}</b><span>핵심 단어</span></div>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">WHY WE MADE IT</p>
        <h2>왜 만들었나요?</h2>
        <p>영어예배에 오는 아이들은 나이도, 영어 실력도, 쓰는 언어도 달라요. 그래서 <b>누구나 같은 이야기를 함께 읽을 수 있는 책</b>을 만들고 싶었어요.
          쉬운 영어 한 줄, 중국어 한 줄, 한국어 한 줄. 한 쪽에 세 언어가 나란히 있어서 형제자매도, 부모님도, 중국어를 쓰는 친구도 같은 장면에서 같은 예수님을 만나요.</p>
        <p>집에서 다시 펼쳐 보며 <b>“오늘 주일에 들은 이야기”</b>가 한 주 동안 아이 마음에 머물기를 기도하며 만들었어요.</p>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">WHAT'S INSIDE</p>
        <h2>한 권에 담긴 것</h2>
        <div class="sa-grid">
          <div class="sa-item"><b>장면마다 그린 그림 12장</b><p>성경 친구들의 표정과 눈빛까지, 아이들이 그림만 보고도 이야기를 따라갈 수 있게 그렸어요.</p></div>
          <div class="sa-item"><b>세 언어 나란히</b><p>쉬운 영어 문장 · 中文(병음) · 한국어. 성경 구절은 NIV와 和合本(CUV)을 바탕으로 했어요.</p></div>
          <div class="sa-item"><b>드라마처럼 읽어 주는 목소리</b><p>해설자와 마리아, 천사, 목자, 헤롯까지 등장인물마다 다른 원어민 목소리로 장면에 맞는 감정을 담아 읽어 줘요.</p></div>
          <div class="sa-item"><b>핵심 단어 · 발음</b><p>책마다 단어 16개를 발음기호, 뜻, 중국어와 함께 들려줘요.</p></div>
          <div class="sa-item"><b>외울 말씀 한 구절</b><p>이야기의 마음이 담긴 말씀을 영어와 중국어로 듣고 따라 외워요.</p></div>
          <div class="sa-item"><b>함께 나눌 질문</b><p>책을 덮은 뒤 가족이나 반 친구들과 나눌 질문이 하나씩 들어 있어요.</p></div>
        </div>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">HOW TO USE</p>
        <h2>이렇게 사용해요</h2>
        <ol class="sa-how">
          <li><b>집에서 · 휴대폰 e-북</b><span>QR을 찍으면 바로 열려요. 책장을 넘기면 원어민이 읽어 주고, 자동 넘기기를 켜면 잠자리 그림책이 돼요.</span></li>
          <li><b>교회에서 · 인쇄 소책자</b><span>인쇄용 PDF를 A4 가로 양면으로 뽑아 반으로 접고 가운데를 스테이플러로 묶으면 한 권이 돼요.</span></li>
          <li><b>차 안에서 · 전체 MP3</b><span>한 권을 처음부터 끝까지 들을 수 있어요. 영어 이야기와 중국어, 외울 말씀까지 이어져요.</span></li>
          <li><b>다 읽으면 · 성경 친구 카드</b><span>책을 읽으면 책 속 성경 친구 카드를 모을 수 있어요. 내 공부방에서 모은 카드를 볼 수 있어요.</span></li>
        </ol>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">THE SERIES</p>
        <h2>예수님 탄생 이야기 ${list.length}권</h2>
        <div class="sa-books">${books}</div>
      </section>

      <section class="sa-share">
        <p class="sb-kicker">FREE TO SHARE</p>
        <h2>값없이 받았으니, 값없이 나눠요</h2>
        <p lang="en" class="sa-verse">“Freely you have received; freely give.” <cite>Matthew 10:8</cite></p>
        <p>이 스토리북은 누구나 무료로 읽고, 인쇄하고, 나눌 수 있어요. 다른 교회 주일학교, 가정, 이웃 아이들에게도 마음껏 전해 주세요.
          한 가지만 부탁드려요. <b>판매하지 말아 주시고</b>, 나눌 때 <b>“인천영락교회 영어예배부 YEM”</b> 출처를 함께 적어 주세요.</p>
        <p class="sa-credit">만든 곳 · Incheon Younglak Church English Ministry (YEM) · 성경 Scripture: NIV, CUV(和合本)<br>
          그림과 목소리는 AI 도구(ChatGPT 그림, 무료 원어민 AI 음성)의 도움을 받아 만들고, 선생님들이 한 장씩 확인하고 다듬었어요.</p>
        <div class="sa-btns"><a class="btn" href="#books">책장으로 가서 읽기 ${ar('→')}</a></div>
      </section>`;
  }

  function render(parts) {
    if (parts[0] === 'books' && parts[1] === 'about') return { html: renderAbout() };
    if (parts[0] === 'books') return { html: renderShelf() };
    const b = D.books[parts[1]];
    if (!b) return { html: renderShelf() };
    let start = Number(parts[2]) || 1;
    if (parts[2] === 'end') start = 17;
    start = Math.min(Math.max(start, 1), b.ebook.length);
    return { html: renderBook(b), b, start };
  }

  /* ---------- 움직임 ---------- */
  let pf = null; // PageFlip
  let autoTimer = null;
  let earnTimer = null; // 이 쪽을 4초 보면 카드
  let flipReadTimer = null; // 넘긴 쪽 읽기 예약
  let mode = null; // 'auto' | 'listen' | null
  function stop() {
    stopVoice();
    clearTimeout(autoTimer);
    clearTimeout(earnTimer);
    clearTimeout(flipReadTimer);
    mode = null;
    if (pf) { try { pf.destroy(); } catch (e) { /* 무시 */ } pf = null; }
  }

  function bind(el, r) {
    stop();
    const { b, start } = r || {};
    if (!b) return;
    const bookEl = el.querySelector('#eb-book');
    if (!window.St || !bookEl) return;
    const total = b.ebook.length;

    pf = new St.PageFlip(bookEl, {
      width: b.pageW, height: b.pageH, size: 'stretch',
      minWidth: 240, maxWidth: 620, minHeight: 340, maxHeight: 880,
      showCover: true, usePortrait: true, mobileScrollSupport: false,
      flippingTime: 750, drawShadow: true, maxShadowOpacity: 0.35, startPage: start - 1,
    });
    pf.loadFromHTML(bookEl.querySelectorAll('.eb-page'));

    const visible = () => {
      const i = pf.getCurrentPageIndex();
      if (pf.getOrientation() === 'portrait' || i === 0) return [i + 1];
      return [i + 1, i + 2].filter((n) => n <= total);
    };
    const readablePages = () => visible().map((n) => readable(b, n)).filter(Boolean);

    function update() {
      const vs = visible();
      el.querySelector('#eb-count').textContent = `${vs.join('–')} / ${total}`;
      history.replaceState(null, '', `#book/${b.bk}/${vs[0]}`);
      store.set('lastBook:' + H().who(), { bk: b.bk, page: vs[0] }); // 내 공부방 '이어 읽기'
      const seen = store.get('bkSeen:' + H().who(), {}); // 진도표: 이 책에서 본 쪽
      const was = (seen[b.bk] || []).length;
      seen[b.bk] = [...new Set([...(seen[b.bk] || []), ...vs])].sort((x, y) => x - y);
      if (seen[b.bk].length !== was) store.set('bkSeen:' + H().who(), seen);
      const rs = readablePages();
      el.querySelector('#eb-read').classList.toggle('off', !rs.length);
      el.querySelector('[data-say="slow"]').disabled = !rs.some((x) => x.slow);
      el.querySelector('[data-say="en"]').disabled = el.querySelector('[data-say="zh"]').disabled = el.querySelector('[data-say="story"]').disabled = !rs.length;
      const ko = rs.filter((x) => x.ko).map((x) => x.ko);
      el.querySelector('#eb-ko').innerHTML = ko.length ? `<button type="button" class="bpm-more sb-ko-btn" data-ko aria-expanded="false">한국어 풀이 보기 ▾</button><p class="sb-ko" hidden>${ko.map(esc).join('<br>')}</p>` : '';
      const ids = [...new Set(rs.flatMap((x) => x.people || []))].map(person).filter(Boolean);
      el.querySelector('#eb-people').innerHTML = ids.length ? `<div class="sb-people"><span class="sb-people-t">이 쪽에 나오는 친구</span>${ids.map((p) =>
        `<button type="button" class="sb-chip" data-person="${p.id}" aria-label="${esc(p.koMain)} 인물 카드 보기"><img src="${p.img}" alt="" loading="lazy"><span>${esc(p.koMain)}</span></button>`).join('')}</div>` : '';
      clearTimeout(earnTimer);
      earnTimer = setTimeout(() => earn(readablePages().flatMap((x) => x.people || [])), 4000);
      el.querySelector('.eb-arrow.left').disabled = vs[0] <= 1;
      el.querySelector('.eb-arrow.right').disabled = vs[vs.length - 1] >= total;
    }

    pf.on('changeState', (e) => { if (e.data === 'flipping') flipSound(); });
    let readTimer = null; // 듣기 시작을 한 번만 (넘기기 이벤트가 겹쳐도)
    const readSoon = (ms) => { clearTimeout(readTimer); readTimer = setTimeout(readThenTurn, ms); };
    pf.on('flip', () => {
      update();
      if (mode === 'listen') readSoon(500);
      else readOnFlip();
    });
    pf.on('changeOrientation', update);
    update();

    /* 책장을 넘기면 그 쪽을 바로 읽어 줘요 (영어 여 → 남). 또 넘기면 이전 소리는 멈추고 새 쪽을 읽어요.
       자동 넘기기 중에는 다 읽은 뒤 잠깐 쉬고 다음 쪽으로 */
    function readOnFlip() {
      clearTimeout(flipReadTimer);
      clearTimeout(autoTimer);
      stopVoice();
      flipReadTimer = setTimeout(() => {
        const rs = readablePages();
        const list = rs.flatMap(storyList);
        if (list.length) {
          earn(rs.flatMap((x) => x.people || []));
          playList(list, el.querySelector('.eb-stage'), () => { if (mode === 'auto') scheduleAuto(1500); });
        } else if (mode === 'auto') scheduleAuto(4000);
      }, 650); // 넘기는 소리가 끝난 뒤
    }

    // 자동 넘기기: 읽기가 끝나면 다음 쪽 (읽을 글이 없는 쪽은 잠깐 보여 주고)
    function scheduleAuto(ms = 4000) {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        if (mode !== 'auto') return;
        if (visible().slice(-1)[0] >= total) return setMode(null);
        pf.flipNext();
      }, ms);
    }
    // 처음부터 끝까지 듣기: 보이는 쪽을 읽고 (영어 여·남 → 중국어 여·남) → 넘기기
    function readThenTurn() {
      if (mode !== 'listen') return;
      const list = readablePages().flatMap((x) => [...storyList(x), ...zhList(x)]);
      const turn = () => {
        if (mode !== 'listen') return;
        if (visible().slice(-1)[0] >= total) return setMode(null);
        pf.flipNext();
      };
      if (list.length) { earn(readablePages().flatMap((x) => x.people || [])); playList(list, el.querySelector('.eb-stage'), () => setTimeout(turn, 900)); }
      else autoTimer = setTimeout(turn, 2500);
    }
    function setMode(m) {
      clearTimeout(autoTimer);
      stopVoice();
      mode = m;
      el.querySelectorAll('[data-mode="auto"], [data-mode="listen"]').forEach((t) => {
        const on = t.dataset.mode === m;
        t.classList.toggle('on', on);
        t.setAttribute('aria-pressed', String(on));
        t.innerHTML = t.dataset.mode === 'auto' ? (on ? '⏸ 자동 넘기기 멈춤' : '▶ 자동 넘기기') : (on ? '⏸ 듣기 멈춤' : '🎧 처음부터 끝까지 듣기');
      });
      if (m === 'auto') readOnFlip(); // 지금 쪽부터 읽고 넘기기
      if (m === 'listen') {
        if (pf.getCurrentPageIndex() !== 0) { pf.turnToPage(0); update(); }
        readSoon(400);
      } else clearTimeout(readTimer);
    }

    el.onclick = (e) => {
      const vb = e.target.closest('[data-voice]');
      if (vb) {
        voicePick = vb.dataset.voice; store.set('voice', voicePick);
        el.querySelectorAll('[data-voice]').forEach((x) => { const on = x.dataset.voice === voicePick; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        const rs = readablePages();
        if (rs.length) playList(rs.flatMap(storyList), el.querySelector('[data-say="story"]'));
        return;
      }
      const t = e.target.closest('[data-flip], [data-say], [data-mode], [data-ko], [data-person], [data-word]');
      if (!t) return;
      if (t.dataset.flip) return t.dataset.flip === 'next' ? pf.flipNext() : pf.flipPrev();
      if (t.dataset.person) { setMode(null); PEOPLE_ART.openDetail(t.dataset.person); return; }
      if (t.dataset.ko !== undefined) {
        const ko = el.querySelector('#eb-ko .sb-ko');
        const open = ko.hidden;
        ko.hidden = !open;
        t.setAttribute('aria-expanded', String(open));
        t.textContent = open ? '한국어 풀이 접기 ▴' : '한국어 풀이 보기 ▾';
        return;
      }
      if (t.dataset.word !== undefined) {
        const w = b.words[Number(t.dataset.word)];
        return playList([{ src: w.audio, text: w.en, lang: 'en-US' }, { src: w.audio.replace(/\.mp3$/, '-zh.mp3'), text: w.zh, lang: 'zh-CN' }], t);
      }
      if (t.dataset.mode === 'sound') {
        flipOn = !flipOn; store.set('flipSound', flipOn);
        t.classList.toggle('on', flipOn); t.setAttribute('aria-pressed', String(flipOn));
        t.textContent = flipOn ? '🔔 넘기는 소리 켜짐' : '🔕 넘기는 소리 꺼짐';
        return;
      }
      if (t.dataset.mode) return setMode(mode === t.dataset.mode ? null : t.dataset.mode);
      const rs = readablePages();
      if (!rs.length) return;
      if (mode === 'listen') setMode(null);
      earn(rs.flatMap((x) => x.people || []));
      if (t.dataset.say === 'story') playList(rs.flatMap(storyList), t);
      if (t.dataset.say === 'en') playList(rs.flatMap(enList), t);
      if (t.dataset.say === 'zh') playList(rs.flatMap(zhList), t);
      if (t.dataset.say === 'slow') playList(rs.filter((x) => x.slow).map((x) => ({ src: x.slow, text: x.en, lang: 'en-US', slow: true })), t);
    };
  }

  // 키보드 ← → 로 넘기기 (인물 소개 창이 열려 있지 않을 때)
  document.addEventListener('keydown', (e) => {
    if (!pf || !/^#book\//.test(location.hash) || document.querySelector('#modal-root .bp-modal')) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); pf.flipNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); pf.flipPrev(); }
  });

  /* ---------- 성경 친구 카드 (포켓몬 카드처럼 모으기) ----------
     스토리북에 나오는 인물 = 모을 수 있는 카드. 그 쪽을 4초 보거나 들으면 카드가 생겨요.
     ★★★ 예수님 · ★★ 여러 쪽에 나오는 친구 · ★ 그 밖의 친구 */
  const COLLECT = (() => {
    const m = new Map();
    Object.values(D.books).forEach((b) => {
      const add = (id, n) => {
        if (!m.has(id)) m.set(id, { id, bk: b.bk, n, count: 0 });
        m.get(id).count++;
      };
      b.coverPeople.forEach((id) => add(id, 1));
      b.pages.forEach((p) => p.people.forEach((id) => add(id, p.n)));
    });
    return [...m.values()].filter((c) => person(c.id)).map((c) => ({ ...c, stars: c.id === 'jesus' ? 3 : c.count >= 4 ? 2 : 1 }))
      .sort((a, b) => Number(a.bk) - Number(b.bk) || a.n - b.n);
  })();
  const H = () => window.YEM_HOOKS || { who: () => 'guest', addXp() {}, sparkle() {}, touch() {} };
  const myCards = () => store.get('cards:' + H().who(), {});
  function cardHTML(c, owned, mini) {
    const p = person(c.id);
    const stars = '★'.repeat(c.stars);
    const where = `Book ${c.bk}${c.n > 1 ? ` · ${c.n}쪽` : ' · 표지'}`;
    if (!owned) {
      return `<div class="pk-card locked t-${p.t}" aria-label="아직 못 모은 카드"><div class="pk-top"><span class="pk-name">? ? ?</span><span class="pk-stars">${stars}</span></div>
        <div class="pk-art"><img src="${p.img}" alt="" loading="lazy"></div><div class="pk-type">${p.t === 'OT' ? '구약' : '신약'} · No.${String(p.no).padStart(2, '0')}</div>
        <div class="pk-desc">📚 ${where}에서 만나요</div></div>`;
    }
    return `<button type="button" class="pk-card t-${p.t} r${c.stars} ${mini ? 'mini' : ''}" data-person="${p.id}" aria-label="${esc(p.koMain)} 카드">
      <div class="pk-top"><span class="pk-name" lang="en">${esc(p.en)}</span><span class="pk-stars">${stars}</span></div>
      <div class="pk-art"><img src="${p.img}" alt="" loading="lazy"></div>
      <div class="pk-type">${p.t === 'OT' ? '구약' : '신약'} · No.${String(p.no).padStart(2, '0')} · ${esc(p.koMain)}</div>
      ${mini ? '' : `<div class="pk-desc">${esc(p.desc)}</div><div class="pk-foot">📚 ${where}</div>`}
    </button>`;
  }
  let toastTimer = null;
  function earn(ids) {
    const have = myCards();
    const fresh = [...new Set(ids)].filter((id) => !have[id] && COLLECT.some((c) => c.id === id));
    if (!fresh.length) return;
    fresh.forEach((id) => { have[id] = Date.now(); });
    store.set('cards:' + H().who(), have);
    H().addXp(5 * fresh.length);
    H().touch();
    H().sparkle();
    let t = document.getElementById('pk-toast');
    if (!t) { t = document.createElement('div'); t.id = 'pk-toast'; t.className = 'pk-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    const got = Object.keys(have).length;
    t.innerHTML = `<div class="pk-toast-cards">${fresh.map((id) => cardHTML(COLLECT.find((c) => c.id === id), true, true)).join('')}</div>
      <p><b>새 친구 카드${fresh.length > 1 ? ` ${fresh.length}장` : ''}!</b> ${fresh.map((id) => esc(person(id).koMain)).join(', ')} <small>+${5 * fresh.length} XP · ${got}/${COLLECT.length} 모음</small></p>
      <a class="ghost sm" href="#board">📒 카드첩 보기</a>`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  }
  function albumHTML() {
    const have = myCards();
    const got = COLLECT.filter((c) => have[c.id]).length;
    const byBook = Object.values(D.books).map((b) => {
      const cs = COLLECT.filter((c) => c.bk === b.bk);
      if (!cs.length) return '';
      return `<div class="pk-book"><h3>📖 Book ${b.bk} · <span lang="en">${esc(b.title)}</span> <small>${cs.filter((c) => have[c.id]).length}/${cs.length}</small>
        <a class="ghost sm" href="#book/${b.bk}">읽으러 가기 ${ar('→')}</a></h3>
        <div class="pk-grid">${cs.map((c) => cardHTML(c, !!have[c.id])).join('')}</div></div>`;
    }).join('');
    return `<section class="card pk-album">
      <div class="pk-head"><div><p class="bp-kicker">YEM Bible Friends Cards</p><h2>📒 내 성경 친구 카드첩</h2>
        <p>스토리북을 읽거나 들으면 그 쪽에 나오는 친구 카드가 생겨요. 카드 한 장에 <b>+5 XP</b>!<br>★★★ 예수님 · ★★ 반짝 카드 · ★ 친구 카드</p></div>
        <div class="pk-count"><b>${got}</b><span>/ ${COLLECT.length}</span><small>모았어요</small></div></div>
      <div class="pk-bar"><i style="width:${Math.round((got / Math.max(1, COLLECT.length)) * 100)}%"></i></div>
      ${byBook}</section>`;
  }

  /* 성경 인물 → 나오는 이야기 (인물 소개 창에서 씀) */
  function storiesOf(id) {
    const out = [];
    Object.values(D.books).forEach((b) => {
      const pg = b.pages.find((p) => p.people.includes(id));
      if (pg || b.coverPeople.includes(id)) out.push({ bk: b.bk, title: b.title, ko: b.ko, key: pg ? String(pg.n) : '1', cover: b.cover });
    });
    return out;
  }

  /* 진도표에서 쓰는 책 통계: 본 쪽 · 모은 카드 */
  function bookStats(bk) {
    const book = D.books[String(bk)];
    if (!book) return null;
    const seen = (store.get('bkSeen:' + H().who(), {})[book.bk] || []).length;
    const have = myCards();
    const cs = COLLECT.filter((c) => c.bk === book.bk);
    return { seen, total: book.ebook.length, cards: cs.filter((c) => have[c.id]).length, cardsTotal: cs.length, title: book.title, ko: book.ko, cover: book.ebook[0] };
  }
  /* 홈 맨 위: 예수님 탄생 배너 + 12월 추천 스토리북 (책장 페이지와 같은 모양) */
  function homeTop() {
    const html = renderShelf();
    const cut = html.indexOf('<section class="sb-intro">');
    const top = cut > 0 ? html.slice(0, cut) : html;
    const i = top.indexOf('<section class="sb-shelf">');
    const head = `<div class="home-rec"><div><p class="home-rec-k">🎄 DECEMBER PICK</p><h2>12월 추천 · 예수님 탄생 이야기</h2></div>
      <a class="home-rec-all" href="#books">전체 보기 ${ar('→')}</a></div>`;
    return i > 0 ? top.slice(0, i) + head + top.slice(i) : top;
  }

  return { render, bind, stop, storiesOf, albumHTML, bookStats, homeTop, collectCount: () => COLLECT.length };
})();

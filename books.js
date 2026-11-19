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

  /* ---------- 🎬 영상으로 보기 (영어 · 中文 따로) ----------
     영상 파일: assets/books/b<n>/video-<en|zh>.mp4 (videos/advent/make_video.py → web_export.sh)
     유튜브에 올리면 YT 에 영상 주소의 v= 뒤 11글자만 넣으세요. 넣은 영상은 유튜브로 재생해요(홈페이지 용량 절약). */
  const YT = { 1: { en: '', zh: '' }, 2: { en: '', zh: '' }, 3: { en: '', zh: '' }, 4: { en: '', zh: '' }, 5: { en: '', zh: '' } };
  // 영상 파일 위치. 나중에 영상이 많아지면 Cloudflare R2 같은 저장소 주소로 이 한 줄만 바꾸면 돼요.
  const VBASE = 'assets/books/';
  const VLANG = { en: 'English', zh: '中文' };
  let vLang = (() => { try { return localStorage.getItem('yem.vLang') === 'zh' ? 'zh' : 'en'; } catch (e) { return 'en'; } })();
  const VBOOKS = ['1', '2', '3', '4', '5'];
  function videoMedia(bk, lang, auto) {
    const id = (YT[bk] || {})[lang];
    if (id) {
      return `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${auto ? '&autoplay=1' : ''}" title="Book ${bk} ${VLANG[lang]} 영상" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    }
    return `<video controls controlslist="nodownload" disablepictureinpicture oncontextmenu="return false" playsinline preload="none" ${auto ? 'autoplay' : ''} poster="assets/books/b${bk}/banner.webp" src="${VBASE}b${bk}/video-${lang}.mp4" lang="${lang === 'zh' ? 'zh-CN' : 'en'}"></video>`;
  }
  function videoBox(kind, bk) {
    const one = kind === 'one';
    const cur = one ? bk : '1';
    const b = D.books[cur] || {};
    const langs = Object.keys(VLANG).map((l) => `<button type="button" class="vw-lang ${l === vLang ? 'on' : ''}" data-vw-lang="${l}" aria-pressed="${l === vLang}" ${l === 'zh' ? 'lang="zh-CN"' : 'lang="en"'}>${l === 'en' ? 'English' : '中文'}</button>`).join('');
    const chips = one ? '' : `<ol class="vw-chips">${VBOOKS.filter((k) => D.books[k]).map((k) => `<li><button type="button" class="vw-chip ${k === cur ? 'on' : ''}" data-vw-pick="${k}"><img src="${D.books[k].ebook[0]}" alt="" loading="lazy"><b>Book ${k}</b><small>${esc(D.books[k].ko)}</small></button></li>`).join('')}</ol>`;
    const head = one
      ? `<p class="vw-k">🎬 WATCH · 영상으로 보기</p><h2>Book ${bk} <em>영상으로 보기</em></h2>
         <p class="vw-lead">책 속 그림이 <b>움직이고</b>, 해설자와 <b>등장인물마다 다른 원어민 목소리</b>로 이야기해요. 반짝반짝 · 똑똑똑 같은 <b>효과음</b>도 들어 있어요.</p>`
      : `<p class="vw-k">🎬 WATCH ALL · 5편 한 번에 보기</p><h2>예수님 탄생 이야기 <em>5편 이어 보기</em></h2>
         <p class="vw-lead">Book 1부터 Book 5까지 <b>한 편이 끝나면 다음 편이 저절로</b> 이어져요. 다 보면 약 7분이에요. 보고 싶은 책을 눌러 거기서부터 볼 수도 있어요.</p>`;
    return `
      <section class="vw-box ${one ? 'vw-one' : 'vw-all'}" data-vw="${kind}" data-bk="${cur}" ${one ? 'hidden' : ''} aria-label="${one ? `Book ${bk} 영상` : '5편 한 번에 보기'}">
        <div class="vw-head">${head}</div>
        <div class="vw-langs" role="group" aria-label="영상 언어 고르기"><span>말 고르기</span>${langs}</div>
        <div class="vw-player">${videoMedia(cur, vLang, false)}</div>
        <p class="vw-now">${one ? '' : `▶ 지금: <b>Book ${cur}</b> ${esc(b.ko || '')} · <span class="vw-now-l">${VLANG[vLang]}</span>`}</p>
        ${chips}
        <div class="vw-help">
          <img src="assets/yunhee/guide/yay.webp" alt="" width="54" height="80" loading="lazy">
          <div><b>이렇게 보세요 😊</b>
            <ul>
              <li><b>English / 中文</b> 버튼으로 말을 골라요. 영어판과 중국어판은 따로 있어요.</li>
              <li>가운데 ▶ 를 누르면 시작해요. 오른쪽 아래 <b>⛶ 버튼</b>을 누르면 화면 가득 크게 볼 수 있어요.</li>
              <li>자막은 그림 아래 흰 상자에 나와요. <b>한 문장씩 따라 말해 보세요!</b></li>
              <li>영상은 한 편에 약 8MB예요. 휴대폰이라면 <b>와이파이</b>에서 보는 걸 추천해요.</li>
              ${one ? '<li>책장을 넘기며 단어를 보고 싶으면 위의 <b>📖 E-북으로 보기</b>를 누르세요.</li>' : ''}
            </ul>
            <small>그림 · 목소리 · 효과음은 AI 도구의 도움을 받아 만들고, 선생님들이 확인했어요. Scripture: NIV · 和合本</small></div>
        </div>
      </section>`;
  }
  function vwLoad(box, bk, lang, auto) {
    box.dataset.bk = bk;
    box.querySelector('.vw-player').innerHTML = videoMedia(bk, lang, auto);
    box.querySelectorAll('.vw-chip').forEach((c) => c.classList.toggle('on', c.dataset.vwPick === bk));
    const now = box.querySelector('.vw-now');
    if (box.dataset.vw === 'all' && now) now.innerHTML = `▶ 지금: <b>Book ${bk}</b> ${esc((D.books[bk] || {}).ko || '')} · <span class="vw-now-l">${VLANG[lang]}</span>`;
  }
  function vwPauseAll(except) {
    document.querySelectorAll('.vw-box video').forEach((v) => { if (v !== except) v.pause(); });
  }
  document.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-vw-view]');
    if (sw) {
      const video = sw.dataset.vwView === 'video';
      document.querySelectorAll('.vw-sw').forEach((x) => { const on = x === sw; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      const wrap = document.querySelector('.eb-wrap');
      const one = document.querySelector('.vw-one');
      if (wrap) wrap.hidden = video;
      if (one) one.hidden = !video;
      if (video) { // 책 읽어 주기 · 자동 넘기기는 멈춰요
        stopVoice(); clearTimeout(autoTimer); clearTimeout(flipReadTimer); mode = null;
        document.querySelectorAll('.eb-toggle[data-mode="auto"], .eb-toggle[data-mode="listen"]').forEach((t) => { t.classList.remove('on'); t.setAttribute('aria-pressed', 'false'); });
      } else vwPauseAll();
      return;
    }
    const lg = e.target.closest('[data-vw-lang]');
    if (lg) {
      vLang = lg.dataset.vwLang;
      try { localStorage.setItem('yem.vLang', vLang); } catch (err) { /* 무시 */ }
      document.querySelectorAll('.vw-lang').forEach((x) => { const on = x.dataset.vwLang === vLang; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      const box = lg.closest('.vw-box');
      document.querySelectorAll('.vw-box').forEach((bx) => vwLoad(bx, bx.dataset.bk, vLang, false));
      return;
    }
    const pk = e.target.closest('[data-vw-pick]');
    if (pk) { const box = pk.closest('.vw-box'); vwPauseAll(); vwLoad(box, pk.dataset.vwPick, vLang, true); }
  });
  document.addEventListener('play', (e) => { if (e.target.closest && e.target.closest('.vw-box')) { vwPauseAll(e.target); stopVoice(); } }, true);
  document.addEventListener('ended', (e) => { // 5편 이어 보기: 다음 편으로
    const box = e.target.closest && e.target.closest('.vw-all');
    if (!box) return;
    const i = VBOOKS.indexOf(box.dataset.bk);
    const next = VBOOKS[i + 1];
    if (next && D.books[next]) vwLoad(box, next, vLang, true);
  }, true);

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
      ${videoBox('all', null)}
      ${radioHTML(null)}
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
      <b lang="en">${esc(w.en)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="ko">${esc(w.ko)}</span><span class="zh" lang="zh-CN" data-nopy>${esc(w.zh)} <small>${esc(w.py)}</small></span></button>`).join('');
    const nextBook = D.books[String(Number(b.bk) + 1)];
    return `
      <a class="back sb-back" href="#books">${ar('←')} 스토리북 책장</a>
      ${bookBanner(b)}
      <div class="vw-switch" role="group" aria-label="보는 방법 고르기">
        <button type="button" class="vw-sw on" data-vw-view="book" aria-pressed="true"><span>📖</span><b>E-북으로 보기</b><small>한 장씩 넘기며 · 단어 · 따라 읽기</small></button>
        <button type="button" class="vw-sw" data-vw-view="video" aria-pressed="false"><span>🎬</span><b>영상으로 보기</b><small>움직이는 그림 · 드라마 목소리 · 효과음</small></button>
      </div>
      ${videoBox('one', b.bk)}
      <section class="eb-wrap">
        <div class="eb-stage at-cover">
          <button type="button" class="eb-hint" data-hint-next aria-label="책 펼치기">
            <span class="eb-hint-ico" aria-hidden="true">📖</span>
            <b>E-북으로 읽어요!</b>
            <span>오른쪽 <i>›</i> 를 누르거나 책장을 넘기면<br>한 장씩 넘기며 읽을 수 있어요</span>
            <em>🎭 원어민이 읽어 줘요 · 영어 · 中文</em>
            <strong>책 펼치기 →</strong>
          </button>
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
      ${videoBox('all', b.bk)}
      ${radioHTML(b.bk)}
      <section class="eb-down">
        <a class="btn" href="${b.mp3}" download="${b.mp3.split('/').pop()}">⬇ 전체 음성 MP3 받기</a>
        ${b.pdf ? `<a class="btn alt" href="${b.pdf}" download="${b.pdf.split('/').pop()}">🖨️ 인쇄용 PDF 받기</a>` : ''}
        <small>MP3: 쪽마다 책장 넘기는 소리 → 영어 이야기 낭독(해설 + 등장인물 목소리) → 中文(女·男) · 외울 말씀까지 ·
          PDF: A4 가로 양면 인쇄 → 반으로 접어 가운데를 스테이플러로 묶어요 <b class="eb-wip">작업 중 · 완성 전</b></small>
      </section>
      ${bookDetail(b)}
      <details class="card eb-words"><summary>📝 이 책의 단어 ${b.words.length}개 <small>(누르면 영어 → 中文 순서로 들려줘요)</small></summary><div class="sb-words">${words}</div></details>
      <nav class="sb-nav"><a class="ghost sm" href="#books">${ar('←')} 책장</a>
        ${nextBook ? `<a class="btn sm" href="#book/${nextBook.bk}">Book ${nextBook.bk} 읽으러 가기 ${ar('→')}</a>` : ''}</nav>`;
  }


  /* ---------- 스토리북 소개 (#books/about) ---------- */
  /* ---------- 스토리북 상세 소개 (#books/about) · 상품 상세페이지처럼 ---------- */
  const WEEKS = { 1: '11/29 · 대림절 1주 · 소망', 2: '12/6 · 대림절 2주 · 평화', 3: '12/13 · 대림절 3주 · 기쁨', 4: '12/20 · 대림절 4주 · 사랑', 5: '12/27 · 성탄 후 주일' };
  const AB = 'assets/books/about/';
  const yhSay = (pic, html, r) => `<div class="pd-say ${r ? 'r' : ''}"><img src="assets/yunhee/guide/${pic}.webp" alt=""><p><b>슈퍼스타 윤희쌤</b>${html}</p></div>`;
  const zoom = (src, alt, cls = '') => `<button type="button" class="pd-zoom ${cls}" data-zoom="${src}" aria-label="${esc(alt)} 크게 보기"><img src="${src}" alt="${esc(alt)}" loading="lazy"><span class="pd-zoom-ico" aria-hidden="true">⤢</span></button>`;

  function renderAbout() {
    const list = D.series.filter((s) => s.ready && D.books[s.bk]).map((s) => D.books[s.bk]);
    const wordsN = list.reduce((n, b) => n + b.words.length, 0);
    const scenes = list.reduce((n, b) => n + b.pages.length, 0);
    const series = list.map((b) => `
      <article class="pd-book">
        <a class="pd-book-cover" href="#book/${b.bk}"><img src="${b.ebook[0]}" alt="Book ${b.bk} 표지" loading="lazy">${b.bk === '1' || b.bk === '2' ? '<span class="sb-best">BEST</span>' : ''}</a>
        <div class="pd-book-t">
          <p class="pd-book-no">BOOK ${b.bk} · ${esc(b.source.ko)}</p>
          <h3 lang="en">${esc(b.title)}</h3>
          <p class="pd-book-sub">${esc(b.ko)} · <span lang="zh-CN">${esc(b.zh)}</span></p>
          <blockquote lang="en">“${esc(b.verse.en)}”<cite>${esc(b.verse.enRef)}</cite></blockquote>
          <p class="pd-book-meta"><span>🗓️ ${WEEKS[b.bk] || esc(b.date)}</span><span>🖼️ ${b.pages.length}장면</span><span>🔤 단어 ${b.words.length}</span></p>
          <div class="pd-book-btns"><a class="btn sm" href="#book/${b.bk}">📖 E-북 읽기</a><a class="ghost sm" href="#book/${b.bk}" data-goto-detail="${b.bk}">상세 보기 →</a></div>
        </div>
        ${zoom(`assets/books/b${b.bk}/sheet.webp`, `Book ${b.bk} 한 장으로 읽기`, 'pd-book-sheet')}
      </article>`).join('');
    const inside = [['b1_01', '1쪽 · 표지', '신약 · 책 번호 · 성경 출처'], ['b1_02', '2쪽 · 단어', '발음기호 · 병음 · 한국어 뜻'], ['b1_05', '3~14쪽 · 이야기', '그림 한 장, 영어 한 문장 + 中文'],
      ['b1_15', '15~16쪽 · 한국어', '작은 그림과 한국어 풀이로 복습'], ['b1_17', '17쪽 · 암송 · 쓰기', 'NIV · 和合本 · 따라 쓰기 5줄'], ['b1_18', '18쪽 · 퀴즈 · 기도', '인물 · 그림 퀴즈 3문제 · 3개국어 기도'],
      ['b1_19', '19쪽 · 색칠', '암송 말씀과 이어지는 색칠 도안'], ['b1_20', '20쪽 · 뒷표지', '다섯 권 이야기 · 영어예배 안내 · QR']]
      .map(([f, t, d]) => `<figure>${zoom(AB + f + '.webp', t)}<figcaption><b>${t}</b><span>${d}</span></figcaption></figure>`).join('');
    return `
      <section class="pd-hero">
        <a class="back pd-back" href="#books">${ar('←')} 스토리북 책장</a>
        <p class="pd-k">YEM BIBLE STORY BOOKS · NEW TESTAMENT</p>
        <h1><span lang="en">Christmas Story Books</span>예수님 탄생 이야기 ${list.length}권 세트</h1>
        <p class="pd-lead">인천영락교회 영어예배부가 성경 말씀으로 새로 쓰고 그린 어린이 영어 성경 이야기책</p>
        <img class="pd-mock" src="${AB}mockup.webp" alt="인쇄한 예수님 탄생 이야기 5권이 나무 책상 위에 부채꼴로 놓인 모습" width="1400" height="933" fetchpriority="high">
        <ul class="pd-badges"><li>📖 성경 그대로 <small>NIV · 和合本</small></li><li>🌏 3개국어 <small>English · 中文 · 한국어</small></li><li>🎨 쪽마다 새 그림 <small>${scenes}장면</small></li><li>✏️ 쓰기 · 퀴즈 · 색칠 <small>권마다 20쪽</small></li></ul>
        <div class="pd-cta"><a class="hud-go" href="#book/${list[0] ? list[0].bk : 1}">📖 Book 1부터 읽기</a><a class="pd-ghost" href="#pd-series" data-pd-jump>5권 자세히 보기 ↓</a></div>
      </section>

      <section class="pd-spec" aria-label="제품 정보">
        <div><b>${list.length}</b><span>권 시리즈</span></div><div><b>20</b><span>쪽 · 권마다</span></div><div><b>${scenes}</b><span>장면 그림</span></div>
        <div><b>3</b><span>개 언어</span></div><div><b>${wordsN}</b><span>핵심 단어</span></div><div><b>A5</b><span>중철 · 컬러</span></div>
      </section>

      <section class="pd-sec">
        <p class="pd-k">WHY YEM BOOKS</p>
        <h2>성경을 잘 모르는 아이도<br><em>그림 한 장</em>으로 이야기를 기억해요</h2>
        <p class="pd-p">한 쪽에 그림 한 장, 영어 한 문장. 영어를 처음 배우는 유치 · 초등 아이도 혼자 읽을 수 있게 만들었어요.</p>
        ${yhSay('heart', '성경을 잘 몰라도 괜찮아요! 그림만 봐도 이야기가 떠오르도록 <b>표정 하나, 눈길 하나</b>까지 꼼꼼히 골랐답니다 😊')}
        <div class="pd-feat">
          <article><span>📖</span><b>성경 말씀 그대로</b><p>이사야 · 마태복음 · 누가복음 본문을 따라 쓰고, 성경에 없는 장면은 넣지 않았어요. 암송 구절은 NIV와 和合本이에요.</p></article>
          <article><span>🌏</span><b>3개국어로 함께</b><p>영어를 가장 크게, 중국어는 한자마다 병음을, 한국어 풀이는 책 뒤쪽에 따로 모았어요.</p></article>
          <article><span>😊</span><b>표정이 살아 있는 그림</b><p>110명의 YEM 성경 인물이 놀라고, 웃고, 기도해요. 누가 누구에게 말하는지 시선까지 맞췄어요.</p></article>
          <article><span>✏️</span><b>읽고, 쓰고, 기도해요</b><p>단어장 · 따라 쓰기 · 그림 퀴즈 · 색칠 · 3개국어 기도로 한 권을 끝까지 즐겨요.</p></article>
        </div>
      </section>

      <section class="pd-sec dark" id="pd-series">
        <p class="pd-k">THE SERIES · 5 BOOKS</p>
        <h2>대림절부터 성탄 후 주일까지<br><em>매주 한 권씩</em></h2>
        <p class="pd-p">다섯 권 모두 <b>한 장으로 읽는 전체 이야기</b>가 있어요. 오른쪽 그림을 누르면 영어 · 中文 · 한국어 전체 글과 암송 말씀, 기도를 크게 볼 수 있어요.</p>
        <div class="pd-books">${series}</div>
      </section>

      <section class="pd-sec">
        <p class="pd-k">INSIDE A BOOK</p>
        <h2>한 권 20쪽, <em>이렇게 구성돼요</em></h2>
        ${yhSay('surprise', '얇아 보여도 한 권에 이만큼 들어 있어요! 단어 · 따라 쓰기 · 퀴즈 · 기도 · 색칠까지 <b>꽉꽉!</b>', true)}
        <div class="pd-inside">${inside}</div>
        <p class="pd-note">A4를 반으로 접은 A5 크기 · 가운데 스테이플러 제본 · 컬러 인쇄</p>
      </section>

      <section class="pd-sec soft">
        <p class="pd-k">3 LANGUAGES</p>
        <h2>한 문장을 <em>세 가지 말</em>로</h2>
        <div class="pd-lang">
          <figure>${zoom(AB + 'b3_09.webp', 'English · 中文 쪽')}<figcaption>English · 中文 — 영어 문장 아래 중국어, 한자마다 병음</figcaption></figure>
          <figure>${zoom(AB + 'b3_16.webp', '한국어로 읽어요 쪽')}<figcaption>한국어로 읽어요 — 그림 순서를 따라 한국어 풀이</figcaption></figure>
          <div class="pd-lang-t">
            <div><b lang="en">English</b><span>쉬운 영어 한 문장 · 단어마다 발음기호</span></div>
            <div><b lang="zh-CN">中文</b><span>和合本 성경 이름 · 한자 아래 병음</span></div>
            <div><b>한국어</b><span>쉬운 우리말 풀이 · 뜻이 끊기지 않는 줄바꿈</span></div>
            ${yhSay('cheer', '중국어는 한 글자마다 <b>병음</b>을 달아서 처음 보는 친구도 읽을 수 있어요 ✨')}
          </div>
        </div>
      </section>

      <section class="pd-sec">
        <p class="pd-k">MORE TOGETHER</p>
        <h2>책과 <em>함께 쓰는 자료</em></h2>
        <div class="pd-more">
          <article>${zoom(AB + 'big1_04.webp', '교사용 큰 책')}<b>교사용 큰 책 · 슬라이드</b><p>A4 가로로 크게 인쇄하거나 화면에 띄워요. 소책자와 쪽 번호가 같아 함께 펴고 읽어요.</p></article>
          <article><a class="pd-more-img" href="#book/1"><img src="${list[0] ? list[0].ebook[0] : ''}" alt="" loading="lazy"><span>▶ E-BOOK</span></a><b>홈페이지 E-북 · 원어민 음성</b><p>QR을 찍으면 책장을 넘기며 해설과 등장인물마다 다른 원어민 목소리, 중국어 음성으로 들어요.</p></article>
          <article><span class="pd-cards"><img src="${AB}card_000.webp" alt="" loading="lazy"><img src="${AB}card_097.webp" alt="" loading="lazy"></span><b>YEM 성경 인물 카드 110장</b><p>구약은 금색, 신약은 파란색. 앞면은 3개국어 이름, 뒷면은 성경 구절과 이야기 풀이예요.</p></article>
          <article><span class="pd-stk">${[1, 2, 3, 4, 5].map((n) => `<img src="${AB}stk${n}.webp" alt="" loading="lazy">`).join('')}</span><b>모으는 재미 · 원형 스티커</b><p>권마다 표지 그림 스티커를 붙이며 다섯 권을 모아요.</p></article>
        </div>
      </section>

      <section class="pd-sec soft">
        <p class="pd-k">SCHEDULE</p>
        <h2>2026 대림절 · <em>매주 주일 한 권</em></h2>
        <ol class="pd-sched">${list.map((b) => `<li><a href="#book/${b.bk}"><img src="${b.ebook[0]}" alt="" loading="lazy"><b>Book ${b.bk}</b><span>${WEEKS[b.bk] || ''}</span></a></li>`).join('')}</ol>
        ${yhSay('armup', '주일 오후 2시, <b>2층 다윗홀</b>에서 만나요! 찬양하고, 읽고, 함께 기도해요 🙌', true)}
      </section>

      <section class="pd-maker">
        <img src="assets/yunhee/guide/pray.webp" alt="">
        <div><p class="pd-k">MADE WITH LOVE</p><h2>만든 사람 · 슈퍼스타 윤희쌤</h2>
          <p>YEM 영어예배부 찬양팀 리더예요. 아이들이 성경 말씀을 영어로 즐겁게 만나도록 이야기를 쓰고 그림을 골라 다섯 권을 엮었어요.
            한 장 한 장, 한 문장 한 문장 <b>가장 귀한 선물을 준비하는 마음</b>으로 만들었어요 💕</p>
          <p class="pd-credit">Incheon Younglak Church English Ministry (YEM) · Scripture: NIV, CUV(和合本)<br>그림과 목소리는 AI 도구의 도움을 받아 만들고, 선생님들이 한 장씩 확인하고 다듬었어요.</p>
          <div class="pd-cta"><a class="hud-go" href="#book/1">📖 지금 Book 1 읽기</a><a class="pd-ghost dark" href="#books">책장 보기</a></div></div>
      </section>`;
  }

  /* ---------- 책마다 상세 정보 (책 페이지 아래) ---------- */
  function bookDetail(b) {
    return `
      <section class="pd-detail" id="pd-detail">
        <div class="pd-detail-h">
          <img src="${b.ebook[0]}" alt="Book ${b.bk} 표지" loading="lazy">
          <div><p class="pd-k">BOOK ${b.bk} · DETAIL</p><h2 lang="en">${esc(b.title)}</h2>
            <p class="pd-book-sub">${esc(b.ko)} · <span lang="zh-CN">${esc(b.zh)}</span></p>
            <p class="pd-book-meta"><span>📜 ${esc(b.source.ko)}</span><span>🗓️ ${WEEKS[b.bk] || esc(b.date)}</span><span>📄 20쪽 · A5</span><span>🖼️ ${b.pages.length}장면</span><span>🔤 단어 ${b.words.length}</span><span>🌏 English · 中文 · 한국어</span></p>
            <blockquote lang="en">“${esc(b.verse.en)}”<cite>${esc(b.verse.enRef)}</cite></blockquote>
            <p class="pd-talk"><b>함께 나눠요</b> ${esc(b.talk.ko)} <span lang="en">${esc(b.talk.en)}</span></p></div>
        </div>
        <div class="pd-sheet">
          <p class="pd-k">READ IT ON ONE PAGE</p>
          <h3>한 장으로 읽는 Book ${b.bk}</h3>
          <p class="pd-p">이 책의 이야기 12장면을 영어 · 中文 · 한국어로, 암송 말씀과 기도까지 한 장에 담았어요. 누르면 크게 볼 수 있어요.</p>
          ${zoom(`assets/books/b${b.bk}/sheet.webp`, `Book ${b.bk} 전체 이야기 한 장`, 'pd-sheet-img')}
        </div>
      </section>`;
  }

  /* 그림 크게 보기 (상세페이지 공통) */
  document.addEventListener('click', (e) => {
    const z = e.target.closest('[data-zoom]');
    if (z) {
      const box = document.createElement('div');
      box.className = 'pd-lightbox';
      box.innerHTML = `<button type="button" class="pd-lb-x" aria-label="닫기">✕</button><div class="pd-lb-in"><img src="${z.dataset.zoom}" alt=""></div>`;
      document.body.appendChild(box);
      document.documentElement.classList.add('dl-lock');
      const close = () => { box.remove(); document.documentElement.classList.remove('dl-lock'); window.removeEventListener('hashchange', close); };
      box.addEventListener('click', (ev) => { if (ev.target === box || ev.target.closest('.pd-lb-x')) close(); });
      window.addEventListener('hashchange', close);
      return;
    }
    const j = e.target.closest('[data-pd-jump]');
    if (j) { e.preventDefault(); const t = document.querySelector(j.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth' }); return; }
    const g = e.target.closest('[data-goto-detail]');
    if (g) { setTimeout(() => { const d = document.getElementById('pd-detail'); if (d) d.scrollIntoView({ behavior: 'smooth' }); }, 700); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const lb = document.querySelector('.pd-lightbox'); if (lb) lb.querySelector('.pd-lb-x').click(); } });

  /* ---------- 📻 전체 듣기: 한 번 틀어 두면 계속 (영어 · 中文 · 영어+中文, Book 1→5 연속, 반복) ----------
     쪽마다 있는 음성 파일을 차례로 이어 틀어요. 페이지를 옮겨도 화면 아래 막대에서 계속 나와요. */
  const LANGS = { en: '영어', zh: '中文', both: '영어 + 中文' };
  function radioHTML(bk) {
    const from = bk ? `Book ${bk}부터` : 'Book 1부터';
    return `
      <section class="radio-box" aria-label="전체 듣기">
        <div class="radio-h"><p class="radio-k">📻 LISTEN ALL · 전체 듣기</p>
          <h3>한 번 틀어 두면 <em>쭉~</em> 들어요</h3>
          <p>설거지할 때, 차 안에서, 잠자리에서. ${from} 5권까지 이어서, 끝나면 처음부터 다시 들려줘요.</p></div>
        <div class="radio-btns">
          <button type="button" class="radio-go en" data-radio="en" data-from="${bk || 1}"><span>🇬🇧</span><b>영어로 듣기</b><small>등장인물마다 다른 원어민 목소리</small></button>
          <button type="button" class="radio-go zh" data-radio="zh" data-from="${bk || 1}"><span>🇨🇳</span><b>中文으로 듣기</b><small>중국어 원어민 목소리</small></button>
          <button type="button" class="radio-go both" data-radio="both" data-from="${bk || 1}"><span>🎧</span><b>영어 + 中文</b><small>한 쪽씩 영어 다음 중국어</small></button>
        </div>
      </section>`;
  }
  const R = { list: [], i: 0, lang: 'en', title: '', gap: 450, loop: true, audio: new Audio(), bar: null };
  function radioList(lang, from) {
    const out = [];
    const bks = D.series.filter((x) => x.ready && D.books[x.bk]).map((x) => x.bk);
    const order = [...bks.slice(bks.indexOf(String(from))), ...bks.slice(0, bks.indexOf(String(from)))];
    order.forEach((bk) => {
      const b = D.books[bk];
      const en = (au) => au && (au.drama || au['en-f']);
      const zh = (au) => au && au['zh-f'];
      const add = (au, label, page) => {
        const base = { bk, page, thumb: `assets/books/b${bk}/banner.webp`, href: `#book/${bk}/${page}`, sub: `${b.ko} · ${b.title}` };
        if (lang !== 'zh' && en(au)) out.push({ ...base, src: en(au), label: `${label} · English` });
        if (lang !== 'en' && zh(au)) out.push({ ...base, src: zh(au), label: `${label} · 中文` });
      };
      add(b.titleAudio, `Book ${bk} 제목`, 1);
      b.pages.forEach((p) => add(p.audio, `Book ${bk} · ${p.n}쪽`, p.n));
      add(b.verse && b.verse.audio, `Book ${bk} · 외울 말씀`, b.ebook.length - 3);
    });
    return out;
  }
  function radioBar() {
    if (R.bar) return R.bar;
    const el = document.createElement('div');
    el.id = 'radio-player';
    el.hidden = true;
    el.innerHTML = `<a class="rp-thumb" href="#books" aria-label="지금 나오는 곳 보기"><img src="" alt=""></a>
      <button type="button" class="rp-pp" aria-label="재생 / 멈춤"></button>
      <a class="rp-t" href="#books"><b></b><small></small></a>
      <span class="rp-ctl"><button type="button" class="rp-prev" aria-label="이전">⏮</button><button type="button" class="rp-next" aria-label="다음">⏭</button><button type="button" class="rp-loop on" aria-label="반복">🔁</button></span>
      <div class="rp-bar"><i></i></div>
      <button type="button" class="rp-x" aria-label="닫기">✕</button>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      if (e.target.closest('.rp-x')) return radioStop();
      if (e.target.closest('.rp-pp')) { if (R.audio.paused) R.audio.play().catch(() => {}); else R.audio.pause(); return; }
      if (e.target.closest('.rp-next')) return radioGo(R.i + 1);
      if (e.target.closest('.rp-prev')) return radioGo(Math.max(0, R.i - 1));
      if (e.target.closest('.rp-loop')) { R.loop = !R.loop; e.target.closest('.rp-loop').classList.toggle('on', R.loop); }
    });
    R.bar = el;
    return el;
  }
  function radioPaint() {
    const el = radioBar();
    const it = R.list[R.i];
    el.hidden = !it;
    document.documentElement.classList.toggle('has-radio', !!it);
    if (!it) return;
    el.querySelector('.rp-pp').innerHTML = R.audio.paused ? '▶' : '❚❚';
    el.querySelector('.rp-pp').classList.toggle('playing', !R.audio.paused);
    el.querySelector('.rp-t b').textContent = it.label;
    el.querySelector('.rp-t small').textContent = `${R.title} · ${R.i + 1} / ${R.list.length}${it.sub ? ` · ${it.sub}` : ''}`;
    el.querySelector('.rp-t').setAttribute('href', it.href || '#books');
    el.querySelector('.rp-thumb').setAttribute('href', it.href || '#books');
    const im = el.querySelector('.rp-thumb img');
    if (it.thumb && im.getAttribute('src') !== it.thumb) im.setAttribute('src', it.thumb);
    el.querySelector('.rp-bar i').style.width = `${((R.i + 1) / R.list.length) * 100}%`;
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: it.label, artist: 'YEM 영어예배부', album: R.title, artwork: it.thumb ? [{ src: it.thumb, sizes: '900x768', type: 'image/webp' }] : [] });
    }
  }
  function radioGo(i) {
    if (!R.list.length) return;
    if (i >= R.list.length) { if (!R.loop) { R.audio.pause(); radioPaint(); return; } i = 0; }
    R.i = i;
    R.audio.src = R.list[i].src;
    R.audio.play().catch(() => {});
    radioPaint();
  }
  function radioStop() {
    R.audio.pause(); R.list = []; R.i = 0;
    radioPaint();
  }
  R.audio.preload = 'auto';
  R.audio.addEventListener('ended', () => setTimeout(() => radioGo(R.i + 1), R.gap));
  R.audio.addEventListener('play', radioPaint);
  R.audio.addEventListener('pause', radioPaint);
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('nexttrack', () => radioGo(R.i + 1));
      navigator.mediaSession.setActionHandler('previoustrack', () => radioGo(Math.max(0, R.i - 1)));
    } catch (e) { /* 지원 안 하면 그냥 넘어가요 */ }
  }
  // 다른 소리(찬양 · 책 읽어 주기)가 나오면 전체 듣기는 잠시 멈춰요
  document.addEventListener('play', (e) => { if (e.target !== R.audio && !R.audio.paused) R.audio.pause(); }, true);
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-radio]');
    if (!g) return;
    R.lang = g.dataset.radio;
    R.title = `📻 스토리북 ${LANGS[R.lang]} 전체 듣기`;
    R.gap = 450;
    R.list = radioList(R.lang, g.dataset.from || 1);
    radioGo(0);
  });
  /* 다른 페이지(찬양)에서도 같은 플레이어를 써요: YEM_RADIO.start(list, title, gap) */
  window.YEM_RADIO = { start(list, title, gap = 1200) { R.title = title; R.gap = gap; R.list = list; radioGo(0); } };

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
      const stg = el.querySelector('.eb-stage');
      if (stg) { stg.classList.toggle('at-cover', vs[0] === 1); stg.classList.toggle('portrait', pf.getOrientation() === 'portrait'); }
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
    const hint = el.querySelector('[data-hint-next]');
    if (hint) hint.addEventListener('click', () => pf.flipNext());
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

  /* ---------- 바이블 포토카드 (포켓몬 카드처럼 모으기) ----------
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
      <p><b>새 포토카드${fresh.length > 1 ? ` ${fresh.length}장` : ''}!</b> ${fresh.map((id) => esc(person(id).koMain)).join(', ')} <small>+${5 * fresh.length} XP · ${got}/${COLLECT.length} 모음</small></p>
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
      <div class="pk-head"><div><p class="bp-kicker">YEM Bible Photo Cards</p><h2>📒 내 바이블 포토카드첩</h2>
        <p>스토리북을 읽거나 들으면 그 쪽에 나오는 포토카드가 생겨요. 카드 한 장에 <b>+5 XP</b>!<br>★★★ 예수님 · ★★ 반짝 카드 · ★ 친구 카드</p></div>
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
    const head = `<div class="home-rec"><div><p class="home-rec-k">🎄 DECEMBER PICK</p><h2>12월 추천<span class="home-rec-dot"> · </span><br class="m-br">예수님 탄생 이야기</h2></div>
      <a class="home-rec-all" href="#books">전체 보기 ${ar('→')}</a></div>`;
    return i > 0 ? top.slice(0, i) + head + top.slice(i) : top;
  }

  return { render, bind, stop, storiesOf, albumHTML, bookStats, homeTop, collectCount: () => COLLECT.length };
})();

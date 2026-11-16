/* YEM 바이블 스토리북: 책장(#books) · 읽기(#book/<책>/<쪽>)
   데이터: storybooks-data.js (christmas/소책자/make_web_books.py 가 소책자 글·그림으로 만듦)
   쪽 순서: cover → 3 … 14 (이야기) → end (외울 말씀 · 이야기 나누기 · 단어) */
window.BOOKS_UI = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = window.STORYBOOKS || { series: [], books: {} };
  const ar = (c) => `<span class="ar">${c}</span>`;
  let Y = null;
  let auto = false; // 자동으로 읽기

  const order = (b) => ['cover', ...b.pages.map((p) => String(p.n)), 'end'];
  const person = (id) => (window.PEOPLE_ART && PEOPLE_ART.byId.get(id)) || null;

  /* ---------- 소리: 한 번에 하나만 ---------- */
  let audio = null;
  let token = 0;
  function stop() {
    token++;
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.querySelectorAll('.sb-speaking').forEach((e) => e.classList.remove('sb-speaking'));
  }
  function play(src, text, lang, el, onEnd) {
    stop();
    const my = token;
    if (window.onVoicePlay) window.onVoicePlay(text);
    if (el) el.classList.add('sb-speaking');
    const done = () => { if (my !== token) return; if (el) el.classList.remove('sb-speaking'); if (onEnd) onEnd(); };
    const fallback = () => {
      if (my !== token) return;
      if (!('speechSynthesis' in window)) return done();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = /slow/.test(src) ? 0.65 : 0.95;
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    };
    if (!audio) audio = new Audio();
    audio.onended = done;
    audio.onerror = fallback;
    audio.src = src;
    audio.play().catch(fallback);
  }

  /* ---------- 책장 ---------- */
  function renderShelf() {
    const items = D.series.map((s) => {
      const b = D.books[s.bk];
      const pill = `<span class="sb-pill">Book ${s.bk}</span>`;
      if (!s.ready || !b) {
        return `<div class="sb-shelf-item soon"><div class="sb-cover-wrap sb-cover-soon">${pill}<span>📖<br>${esc(s.date)}<br>준비 중</span></div>
          <b lang="en">${esc(s.title)}</b><small>${esc(s.ko)}</small></div>`;
      }
      return `<a class="sb-shelf-item" href="#book/${s.bk}/cover">
        <span class="sb-cover-wrap"><img src="${b.cover}" alt="${esc(s.ko)} 표지" loading="lazy">${pill}</span>
        <b lang="en">${esc(s.title)}</b><small>${esc(s.ko)} · ${esc(b.source.short)}</small></a>`;
    }).join('');
    const ready = D.series.filter((s) => s.ready).length;
    return `
      <section class="play-head"><a class="back" href="#home">${ar('←')} 처음으로</a>
        <h1>📚 YEM 바이블 스토리북<span>그림책을 넘기며 영어 · 중국어로 성경 이야기를 읽고 들어요</span></h1></section>
      <section class="sb-intro">
        <div><p class="bp-kicker">New Testament · Christmas Stories</p>
          <h2>예수님 탄생 이야기 ${D.series.length}권</h2>
          <p>쪽마다 원어민 목소리로 읽어 줘요. <b>🔊 듣기</b>는 보통 빠르기, <b>🐢 천천히</b>는 또박또박, <b>中文</b>은 중국어예요.<br>
          그림 아래 동그란 친구 얼굴을 누르면 성경 인물 카드로 가요.</p></div>
        <div class="bp-stats"><span class="nt">📖 지금 읽을 수 있어요 ${ready}권</span></div>
      </section>
      <section class="sb-shelf">${items}</section>`;
  }

  /* ---------- 읽기 ---------- */
  function chips(ids) {
    const ps = (ids || []).map(person).filter(Boolean);
    if (!ps.length) return '';
    return `<div class="sb-people"><span class="sb-people-t">이 쪽에 나오는 친구</span>${ps.map((p) =>
      `<button type="button" class="sb-chip" data-person="${p.id}" aria-label="${esc(p.koMain)} 인물 카드 보기"><img src="${p.img}" alt="" loading="lazy"><span>${esc(p.koMain)}</span></button>`).join('')}</div>`;
  }
  function navBar(b, key) {
    const seq = order(b);
    const i = seq.indexOf(key);
    const prev = seq[i - 1];
    const next = seq[i + 1];
    const dots = seq.map((k) => `<a class="sb-dot ${k === key ? 'on' : ''}" href="#book/${b.bk}/${k}" aria-label="${k === 'cover' ? '표지' : k === 'end' ? '마무리' : k + '쪽'}"></a>`).join('');
    const nextBook = D.books[String(Number(b.bk) + 1)];
    return `<nav class="sb-nav">
      ${prev ? `<a class="ghost sm" href="#book/${b.bk}/${prev}" data-nav="prev">${ar('←')} 이전</a>` : `<a class="ghost sm" href="#books">${ar('←')} 책장</a>`}
      <div class="sb-dots">${dots}</div>
      ${next ? `<a class="btn sm" href="#book/${b.bk}/${next}" data-nav="next">다음 ${ar('→')}</a>`
        : nextBook ? `<a class="btn sm" href="#book/${nextBook.bk}/cover">Book ${nextBook.bk} ${ar('→')}</a>` : `<a class="btn sm" href="#books">책장 ${ar('→')}</a>`}
    </nav>`;
  }
  function head(b) {
    return `<section class="play-head"><a class="back" href="#books">${ar('←')} 스토리북 책장</a>
      <h1>📖 Book ${b.bk} · <span lang="en" class="sb-h-en">${esc(b.title)}</span><span>${esc(b.ko)} · ${esc(b.source.ko)}</span></h1></section>`;
  }

  function renderCover(b) {
    return `${head(b)}
      <section class="sb-cover-page">
        <div class="sb-cover-art"><img src="${b.cover}" alt="${esc(b.ko)} 표지" fetchpriority="high">
          <div class="sb-cover-title"><span class="sb-pill">Book ${b.bk}</span><b lang="en">${esc(b.title)}</b><span lang="zh-CN" class="zh">${esc(b.zh)}</span><span class="ko">${esc(b.ko)}</span></div></div>
        <div class="sb-cover-side">
          <p class="bp-kicker">From the Bible · ${esc(b.source.en)}</p>
          <h2>${esc(b.ko)}</h2>
          <p>${b.pages.length}쪽짜리 그림책이에요. 한 쪽씩 넘기며 듣고 따라 읽어요.</p>
          <div class="sb-tools">
            <button type="button" class="listen-btn" data-play="title"><span>🔊</span>제목 듣기</button>
            <a class="btn" href="#book/${b.bk}/${b.pages[0].n}">📖 읽기 시작</a>
            <button type="button" class="ghost sm" data-auto="start">▶ 처음부터 자동으로 읽기</button>
          </div>
          ${chips(b.coverPeople)}
        </div>
      </section>
      ${navBar(b, 'cover')}`;
  }

  function renderPage(b, p) {
    const total = b.pages.length;
    const idx = b.pages.indexOf(p) + 1;
    return `${head(b)}
      <section class="sb-page">
        <div class="sb-art" data-swipe><img src="${p.img}" alt="${idx}쪽 그림" fetchpriority="high"></div>
        <div class="sb-text">
          <span class="sb-count">${idx} / ${total}</span>
          <p class="sb-en" lang="en" id="sb-en">${esc(p.en)}</p>
          <p class="sb-zh" lang="zh-CN">${esc(p.zh)}</p>
          <button type="button" class="bpm-more sb-ko-btn" data-ko aria-expanded="false">한국어 보기 ▾</button>
          <p class="sb-ko" hidden>${esc(p.ko)}</p>
          <div class="sb-tools">
            <button type="button" class="listen-btn" data-play="en"><span>🔊</span>듣기</button>
            <button type="button" class="mini-btn" data-play="slow">🐢 천천히</button>
            <button type="button" class="mini-btn" data-play="zh" lang="zh-CN">中文</button>
            <button type="button" class="ghost sm sb-auto ${auto ? 'on' : ''}" data-auto="toggle" aria-pressed="${auto}">${auto ? '⏸ 자동 읽기 멈춤' : '▶ 자동으로 읽기'}</button>
          </div>
          ${chips(p.people)}
        </div>
      </section>
      ${navBar(b, String(p.n))}`;
  }

  function renderEnd(b) {
    const v = b.verse;
    const words = b.words.map((w, i) => `<button type="button" class="sb-word" data-word="${i}">
      <b lang="en">${esc(w.en)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="ko">${esc(w.ko)}</span><span class="zh" lang="zh-CN">${esc(w.zh)} <small>${esc(w.py)}</small></span></button>`).join('');
    const bible = b.bible.map((w) => `<span class="sb-bb"><b lang="en">${esc(w.en)}</b> /${esc(w.ipa)}/ · ${esc(w.ko)}</span>`).join('');
    return `${head(b)}
      <section class="sb-end">
        <div class="sb-verse">
          <p class="bp-kicker">Memory Verse · 함께 외워요</p>
          <p class="sb-en" lang="en">“${esc(v.en)}”</p><p class="sb-ref">${esc(v.enRef)}</p>
          <p class="sb-zh" lang="zh-CN">${esc(v.zh)}</p><p class="sb-ref">${esc(v.zhRef)}</p>
          <p class="sb-ko-v">${esc(v.ko)}</p><p class="sb-ref">${esc(v.koRef)}</p>
          <button type="button" class="listen-btn" data-play="verse"><span>🔊</span>말씀 듣기</button>
        </div>
        <div class="sb-talk"><p class="bp-kicker">Talk about it · 이야기 나눠요</p>
          <p class="sb-en" lang="en">${esc(b.talk.en)}</p><p class="sb-zh" lang="zh-CN">${esc(b.talk.zh)}</p><p>${esc(b.talk.ko)}</p></div>
        <div class="sb-words-box"><p class="bp-kicker">Words in this book · 이 책의 단어 (누르면 들려줘요)</p>
          <div class="sb-words">${words}</div>
          <p class="sb-bible">📖 ${bible}</p></div>
      </section>
      ${navBar(b, 'end')}`;
  }

  function render(parts) {
    if (parts[0] === 'books') return { html: renderShelf() };
    const b = D.books[parts[1]];
    if (!b) return { html: renderShelf() };
    const key = parts[2] || 'cover';
    if (key === 'end') return { html: renderEnd(b), b, key };
    const p = b.pages.find((x) => String(x.n) === key);
    if (p) return { html: renderPage(b, p), b, key, p };
    return { html: renderCover(b), b, key: 'cover' };
  }

  function go(b, key, dir) {
    const seq = order(b);
    const k = seq[seq.indexOf(key) + dir];
    if (k) location.hash = `#book/${b.bk}/${k}`;
  }

  function bind(el, r) {
    stop();
    const { b, key, p } = r || {};
    el.onclick = (e) => {
      const t = e.target.closest('[data-play], [data-auto], [data-ko], [data-person], [data-word]');
      if (!t || !b) return;
      if (t.dataset.person) { stop(); PEOPLE_ART.openDetail(t.dataset.person); return; }
      if (t.dataset.ko !== undefined) {
        const ko = el.querySelector('.sb-ko');
        const open = ko.hidden;
        ko.hidden = !open;
        t.setAttribute('aria-expanded', String(open));
        t.textContent = open ? '한국어 접기 ▴' : '한국어 보기 ▾';
        return;
      }
      if (t.dataset.word !== undefined) {
        const w = b.words[Number(t.dataset.word)];
        play(w.audio, w.en, 'en-US', t);
        return;
      }
      if (t.dataset.auto) {
        if (t.dataset.auto === 'start') { auto = true; location.hash = `#book/${b.bk}/${b.pages[0].n}`; return; }
        auto = !auto;
        if (auto) readAndTurn(); else stop();
        t.classList.toggle('on', auto);
        t.setAttribute('aria-pressed', String(auto));
        t.textContent = auto ? '⏸ 자동 읽기 멈춤' : '▶ 자동으로 읽기';
        return;
      }
      const kind = t.dataset.play;
      if (kind === 'title') return play(b.titleAudio, b.title, 'en-US', t);
      if (kind === 'verse') return play(b.verse.audio, b.verse.en, 'en-US', t);
      if (!p) return;
      const base = p.img.replace(/\.webp$/, '');
      if (kind === 'en') play(`${base}-en.mp3`, p.en, 'en-US', el.querySelector('#sb-en'));
      if (kind === 'slow') play(`${base}-slow.mp3`, p.en, 'en-US', el.querySelector('#sb-en'));
      if (kind === 'zh') play(`${base}-zh.mp3`, p.zh, 'zh-CN', el.querySelector('.sb-zh'));
    };

    // 자동으로 읽기: 영어로 읽고 → 잠깐 쉬고 → 다음 쪽
    function readAndTurn() {
      if (!p) return;
      const base = p.img.replace(/\.webp$/, '');
      play(`${base}-en.mp3`, p.en, 'en-US', el.querySelector('#sb-en'), () => {
        setTimeout(() => { if (auto && location.hash === `#book/${b.bk}/${key}`) go(b, key, +1); }, 1200);
      });
    }
    if (p && auto) setTimeout(readAndTurn, 500);
    if (key === 'end') auto = false;

    // 휴대폰: 그림을 옆으로 밀어 넘기기
    const sw = el.querySelector('[data-swipe]');
    if (sw && b) {
      let x0 = null;
      sw.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      sw.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 50) go(b, key, dx < 0 ? +1 : -1);
      });
    }
  }

  // 키보드 ← → 로 넘기기 (소개 창이 열려 있지 않을 때)
  document.addEventListener('keydown', (e) => {
    if (!/^#book\//.test(location.hash) || document.querySelector('#modal-root .bp-modal')) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const a = document.querySelector(`.sb-nav [data-nav="${e.key === 'ArrowRight' ? 'next' : e.key === 'ArrowLeft' ? 'prev' : 'x'}"]`);
    if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); }
  });

  /* 성경 인물 → 나오는 이야기 (인물 소개 창에서 씀) */
  function storiesOf(id) {
    const out = [];
    Object.values(D.books).forEach((b) => {
      const pg = b.pages.find((p) => p.people.includes(id));
      if (pg || b.coverPeople.includes(id)) out.push({ bk: b.bk, title: b.title, ko: b.ko, key: pg ? String(pg.n) : 'cover', cover: b.cover });
    });
    return out;
  }

  return { init(api) { Y = api; }, render, bind, stop, storiesOf };
})();

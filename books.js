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
        <span class="sb-cover-wrap"><img src="${b.cover}" alt="${esc(s.ko)} 표지" loading="lazy">${pill}</span>
        <b lang="en">${esc(s.title)}</b><small>${esc(s.ko)} · ${esc(s.date)}</small></a>`;
    }).join('');
    const ready = D.series.filter((s) => s.ready).length;
    return `
      <section class="play-head"><a class="back" href="#home">${ar('←')} 처음으로</a>
        <h1>📚 YEM 바이블 스토리북<span>책장을 넘기며 영어 · 중국어로 성경 이야기를 읽고 들어요</span></h1></section>
      <section class="sb-intro">
        <div><p class="bp-kicker">New Testament · Christmas Stories</p>
          <h2>예수님 탄생 이야기 ${D.series.length}권</h2>
          <p>영어 · 中文 · 한국어가 함께 들어 있는 그림책이에요. 원어민 <b>여자 · 남자 목소리</b>로 영어와 중국어를 읽어 줘요.<br>
          책장은 <b>오른쪽 · 왼쪽 동그라미</b>를 눌러 넘기고, <b>자동 넘기기</b>를 켜면 저절로 넘어가요.</p></div>
        <div class="bp-stats"><span class="nt">📖 지금 읽을 수 있어요 ${ready}권</span></div>
      </section>
      <section class="sb-shelf">${items}</section>`;
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
      <section class="play-head"><a class="back" href="#books">${ar('←')} 스토리북 책장</a>
        <h1>📖 Book ${b.bk} · <span lang="en" class="sb-h-en">${esc(b.title)}</span><span>${esc(b.ko)} · ${esc(b.source.ko)}</span></h1></section>
      <section class="eb-wrap">
        <div class="eb-stage">
          <button type="button" class="eb-arrow left" data-flip="prev" aria-label="이전 쪽">${chev('l')}</button>
          <div class="eb-book" id="eb-book" style="--ratio:${b.pageW}/${b.pageH}">${pages}</div>
          <button type="button" class="eb-arrow right" data-flip="next" aria-label="다음 쪽">${chev('r')}</button>
        </div>
        <div class="eb-bar">
          <span class="eb-count" id="eb-count">1 / ${b.ebook.length}</span>
          <div class="eb-tools" id="eb-read">
            <button type="button" class="listen-btn" data-say="en"><span>🔊</span>영어 듣기 <small>여·남</small></button>
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
        <a class="btn" href="${b.mp3}" download="YEM_Book${b.bk}_${b.title.replace(/[^A-Za-z]+/g, '_')}.mp3">⬇ 전체 음성 MP3 받기</a>
        ${b.pdf ? `<a class="btn alt" href="${b.pdf}" download="YEM_Book${b.bk}_print.pdf">🖨️ 인쇄용 PDF 받기</a>` : ''}
        <small>MP3: 쪽마다 책장 넘기는 소리 → 영어(여·남) → 中文(女·男) · 외울 말씀까지 ·
          PDF: A4 가로 양면 인쇄 → 반으로 접어 가운데를 스테이플러로 묶어요 <b class="eb-wip">작업 중 · 완성 전</b></small>
      </section>
      <details class="card eb-words"><summary>📝 이 책의 단어 ${b.words.length}개 <small>(누르면 들려줘요)</small></summary><div class="sb-words">${words}</div></details>
      <nav class="sb-nav"><a class="ghost sm" href="#books">${ar('←')} 책장</a>
        ${nextBook ? `<a class="btn sm" href="#book/${nextBook.bk}">Book ${nextBook.bk} 읽으러 가기 ${ar('→')}</a>` : ''}</nav>`;
  }

  function render(parts) {
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
      const rs = readablePages();
      el.querySelector('#eb-read').classList.toggle('off', !rs.length);
      el.querySelector('[data-say="slow"]').disabled = !rs.some((x) => x.slow);
      el.querySelector('[data-say="en"]').disabled = el.querySelector('[data-say="zh"]').disabled = !rs.length;
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
        const list = rs.flatMap(enList);
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
      const list = readablePages().flatMap((x) => [...enList(x), ...zhList(x)]);
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
        return playList([{ src: w.audio, text: w.en, lang: 'en-US' }], t);
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

  return { render, bind, stop, storiesOf, albumHTML, collectCount: () => COLLECT.length };
})();

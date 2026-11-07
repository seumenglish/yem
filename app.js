/* 영어예배부 찬양 학습 — 앱 로직
   해시 라우팅 · 4주차 단계 · 연령 단계 · 캐릭터 팝업 · 학생 프로필/출석표 · 음원 재생 · 가사 하이라이트 */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '');
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = (t) => (t == null || isNaN(t) ? '--:--' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`);
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.5" height="15" rx="1"/><rect x="13.5" y="4.5" width="4.5" height="15" rx="1"/></svg>';
  const art = (name) => `assets/art/${name}.png`;
  const audioOf = (no) => `audio/${String(no).padStart(2, '0')}.m4a`;

  /* 캐릭터: 팝업 · 아바타 후보 */
  const AV = {
    "bear": "믿음의 용사 곰", "bunny-piano": "찬양 반주자 토끼", "dog-harp": "섬기는 강아지", "cat-flute": "기쁨의 고양이",
    "giraffe": "비전 기린", "squirrel-sing": "성실한 다람쥐", "snowman": "정직한 눈사람", "pink-photo": "찬양 리더 윤희쌤",
    "bear-concert": "콘서트 곰", "bunny-concert": "콘서트 토끼", "dog": "강아지", "cat": "고양이", "cat-winter": "겨울 고양이",
    "bunny-winter": "겨울 토끼", "squirrel-winter": "겨울 다람쥐", "dog-concert": "콘서트 강아지", "cat-concert": "콘서트 고양이",
    "bunny-play": "연주 토끼", "bunny-squirrel": "토끼와 다람쥐",
  };
  const CHAR_KEYS = Object.keys(AV);
  const AVATARS = ['bear', 'bunny-piano', 'dog-harp', 'cat-flute', 'giraffe', 'squirrel-sing', 'snowman', 'pink-photo']; // 학생 선택용 (적게)

  /* 월별 컨셉 (핑크 바탕 위의 악센트 색 + 마스코트) */
  const CONCEPT = {
    aug: { c: "#3e8fa8", mascot: "bear-concert", title: "🙏 믿음의 고백", sub: "주는 나의 모든 것, 은혜로 고백해요" },
    sep: { c: "#4fae8c", mascot: "bunny-piano", title: "🌊 도전과 믿음", sub: "물 위를 걷듯 믿음으로 나아가요" },
    oct: { c: "#e0883a", mascot: "dog-harp", title: "🏆 도전과 성취", sub: "길을 만드시는 주님과 함께 이뤄요" },
    nov: { c: "#c9685a", mascot: "cat-flute", title: "💞 감사와 헌신", sub: "주님께 드리는 마음으로 노래해요" },
    dec: { c: "#e2708f", mascot: "snowman", title: "✨ 빛 가운데 걷기", sub: "내 눈을 열어 주님을 바라봐요" },
    bonus: { c: "#d8a12a", mascot: "bunny-concert", title: "🎄 기쁨의 성탄", sub: "구주가 오신 기쁨을 노래해요" },
    prayer: { c: "#9b7fd0", mascot: "cat-winter", title: "🕊️ 기도", sub: "우리가 함께 드리는 기도" },
  };

  /* ---------- 저장소 ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('yem.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yem.' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 무시 */ } },
  };
  let level = 'kids'; // 연령 구분 없이 하나의 학습 화면
  let students = store.get('students', []);     // [{id, name, avatar}]
  let curId = store.get('cur', null);
  let progress = {};
  let xp = 0;
  const who = () => curId || 'guest';
  function loadStudent() {
    progress = store.get('p:' + who(), {});
    xp = store.get('xp:' + who(), 0);
  }
  const saveProgress = () => store.set('p:' + who(), progress);
  const curStudent = () => students.find((s) => s.id === curId) || null;

  /* ---------- 데이터 헬퍼 ---------- */
  const ALL_SETS = [...SETS, { id: 'prayer', name: '마치는 찬양 · 주기도문', tag: 'PRAYER', songs: [0], color: '#9b7fd0' }];
  const songOf = (no) => (no === 0 ? PRAYER : SONGS.find((s) => s.no === no));
  const setOf = (id) => ALL_SETS.find((s) => s.id === id);
  const conceptOf = (id) => CONCEPT[id] || CONCEPT.aug;
  const isDone = (no, st) => !!progress[`${no}:${st}`];
  const blanksFor = () => (level === 'kids' ? 1 : level === 'mid' ? 2 : 3);
  const timingOf = (no) => store.get('timing:' + no, null) || ((window.TIMINGS || {})[no] || null);
  function nextSong(set, no) { const i = set.songs.indexOf(no); return i >= 0 && i < set.songs.length - 1 ? set.songs[i + 1] : null; }
  function setProgress(set) {
    const total = set.songs.length * STAGES.length;
    let d = 0;
    set.songs.forEach((no) => STAGES.forEach((st) => { if (isDone(no, st.id)) d++; }));
    return Math.round((d / total) * 100);
  }

  /* ---------- 완료 · XP · 기록 ---------- */
  function completeStage(no, stageId) {
    const key = `${no}:${stageId}`;
    if (progress[key]) return;
    progress[key] = true;
    saveProgress();
    store.set('last:' + who(), new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    addXp(10);
    const songDone = STAGES.every((st) => progress[`${no}:${st.id}`]);
    if (songDone && !progress[`${no}:complete`]) {
      progress[`${no}:complete`] = true;
      saveProgress();
      addXp(50);
      pilsa('🎉 곡 완주! 이 찬양을 마음에 새겼어요', 'big');
    } else {
      pilsa(['주님이 기뻐하세요! 한 단계 완료 ✨', '정말 잘했어요, 하나님께 드리는 찬양이에요 🙌', '믿음으로 한 걸음 더 나아갔어요 💪'][Math.floor(Math.random() * 3)]);
    }
  }
  function addXp(n) { xp += n; store.set('xp:' + who(), xp); renderTop(); }

  /* ---------- 상단 바 ---------- */
  function renderTop() {
    const s = curStudent();
    $('#top-right').innerHTML = `
      <a class="navlink" href="#verses">📖 말씀 암송</a>
      <a class="navlink" href="#songs">🎧 한 곡씩</a>
      <a class="navlink" href="#months">🎼 월별</a>
      <a class="navlink" href="#words">🔤 단어</a>
      <a class="navlink" href="#sentences">💬 문장</a>
      <a class="navlink" href="#board">📋 출석부</a>
      <button class="student-chip" id="who">${s ? `<img src="${art(s.avatar)}" alt="">${esc(s.name)}` : '👤 친구 선택'}</button>
      <div class="xp">⭐ ${xp} XP</div>`;
  }
  function renderXp() { renderTop(); }

  /* 상단 바 이벤트 */
  document.addEventListener('click', (e) => {
    const lv = e.target.closest('[data-level]');
    if (lv) { level = lv.dataset.level; store.set('level', level); renderTop(); route(); return; }
    if (e.target.closest('#who')) { openStudents(false); }
    const toc = e.target.closest('.toc-item');
    if (toc) { $$('.toc-item.selected').forEach((x) => x.classList.remove('selected')); toc.classList.add('selected'); }
  });

  /* ---------- 학생 프로필 ---------- */
  function openStudents(required) {
    const root = $('#modal-root');
    let av = (curStudent() || {}).avatar || CHAR_KEYS[0];
    let nm = '';
    const draw = () => {
      root.innerHTML = `
        <div class="modal-bg" id="modal-bg">
          <div class="modal" role="dialog" aria-modal="true">
            <h2>누가 찬양하나요? 🎤</h2>
            <p>내 이름과 캐릭터를 고르면, 나의 학습 기록이 따로 저장돼요.</p>
            <div class="student-list">
              ${students.length ? students.map((s) => `
                <div class="student-row ${s.id === curId ? 'on' : ''}">
                  <img src="${art(s.avatar)}" alt="">
                  <span class="grow">${esc(s.name)}</span>
                  <button class="ghost sm" data-pick-st="${s.id}">선택</button>
                  <button class="ghost sm" data-del-st="${s.id}" aria-label="삭제">×</button>
                </div>`).join('') : '<p>아직 등록된 친구가 없어요. 아래에서 이름을 적어 주세요.</p>'}
            </div>
            <h3 style="margin:22px 0 2px">새 친구 등록</h3>
            <input type="text" id="new-name" value="${esc(nm)}" placeholder="이름 (예: 하율)" maxlength="10">
            <div class="avatars">
              ${AVATARS.map((k) => `<button class="avatar ${k === av ? 'on' : ''}" data-av="${k}"><img src="${art(k)}" alt=""><small>${AV[k]}</small></button>`).join('')}
            </div>
            <div class="row">
              <button class="btn" id="add-st">등록하고 시작</button>
              ${required && !students.length ? '' : '<button class="ghost" id="close-st">닫기</button>'}
            </div>
          </div>
        </div>`;
    };
    draw();
    root.oninput = (e) => { if (e.target.id === 'new-name') nm = e.target.value; };
    root.onclick = (e) => {
      const av2 = e.target.closest('[data-av]');
      if (av2) { nm = ($('#new-name') || { value: nm }).value; av = av2.dataset.av; draw(); return; }
      const pick = e.target.closest('[data-pick-st]');
      if (pick) { curId = pick.dataset.pickSt; store.set('cur', curId); loadStudent(); root.innerHTML = ''; renderTop(); route(); return; }
      const del = e.target.closest('[data-del-st]');
      if (del) {
        const id = del.dataset.delSt;
        if (!confirm('이 친구의 기록도 함께 지워져요. 삭제할까요?')) return;
        students = students.filter((s) => s.id !== id);
        store.set('students', students);
        ['p:', 'xp:', 'last:'].forEach((p) => localStorage.removeItem('yem.' + p + id));
        if (curId === id) { curId = students[0] ? students[0].id : null; store.set('cur', curId); loadStudent(); }
        openStudents(!students.length && required); renderTop(); route(); return;
      }
      if (e.target.closest('#add-st')) {
        const name = ($('#new-name').value || '').trim();
        if (!name) { $('#new-name').placeholder = '이름을 적어 주세요'; return; }
        const s = { id: 's' + Date.now().toString(36), name, avatar: av };
        students.push(s);
        store.set('students', students);
        curId = s.id; store.set('cur', curId); loadStudent();
        root.innerHTML = ''; renderTop(); route(); pilsa(`${name}님, 환영해요! 함께 찬양해요 🎵`);
        return;
      }
      if (e.target.closest('#close-st') || e.target.id === 'modal-bg') { root.innerHTML = ''; }
    };
  }

  /* ---------- 칭찬 한마디 (왼쪽 아래) ---------- */
  const PRAISE = [
    '주님이 기뻐하세요! 🙏', '하나님께 드리는 찬양이 아름다워요 💛', '말씀을 소리 내어 읽었네요, 정말 잘했어요 ✨',
    '믿음으로 한 걸음 더! 🌟', '하나님은 우리의 노력을 기쁘게 보세요 🕊️', '찬양하는 입술이 복이 있어요 🎶',
  ];
  let lastPraise = 0, praiseIdx = 0;
  window.onVoicePlay = () => {
    const now = Date.now();
    if (now - lastPraise < 4000) return;
    lastPraise = now;
    praiseIdx = (praiseIdx + 1) % PRAISE.length;
    pilsa(PRAISE[praiseIdx]);
  };

  /* ---------- 필사 캐릭터 팝업 ---------- */
  let pilsaTimer = null;
  function pilsa(msg, mood) {
    const layer = $('#pilsa-layer');
    const pick = CHAR_KEYS[Math.floor(Math.random() * CHAR_KEYS.length)];
    layer.innerHTML = `<div class="pilsa-pop"><img src="${art(pick)}" alt=""><div class="bubble">${esc(msg)}</div></div>`;
    const el = layer.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    clearTimeout(pilsaTimer);
    pilsaTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { if (layer.contains(el)) layer.innerHTML = ''; }, 500);
    }, mood === 'big' ? 4200 : 2600);
  }
  const STAGE_GREET = {
    1: '주님의 말씀을 먼저 읽어 볼까요? 가사부터 함께 🙏',
    2: '하나님께 드리는 찬양, 문장을 차근차근 조립해요 ✨',
    3: '주님께 귀 기울이며 빈칸을 채워 봐요 🎧',
    4: '마음에 새기고 주님께 노래로 올려드려요 💛',
  };

  /* ---------- 발음 · 단어 하이라이트 ---------- */
  function speakPlain(text) {
    if (window.TTS) { TTS.speak(text); return; }
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  /* 한 줄을 읽으며 지금 읽는 단어 표시 (브라우저가 단어 경계를 주면 정확히, 아니면 길이로 추정) */
  function speakLine(lineEl, text) {
    if (window.TTS) { TTS.speak(text, { el: lineEl }); return; }
    if (!('speechSynthesis' in window) || !lineEl) return;
    speechSynthesis.cancel();
    $$('#activity .lline.speaking').forEach((x) => x.classList.remove('speaking'));
    $$('#activity .lline .w.on').forEach((x) => x.classList.remove('on'));
    lineEl.classList.add('speaking');
    const words = $$('.w', lineEl);
    const toks = text.split(/\s+/);
    const starts = []; let pos = 0;
    toks.forEach((w) => { const i = text.indexOf(w, pos); starts.push(i); pos = i + w.length; });
    const setOn = (k) => words.forEach((w, j) => w.classList.toggle('on', j === k));
    let gotBoundary = false, timers = [];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9;
    u.onboundary = (e) => {
      if (e.name !== 'word') return;
      gotBoundary = true;
      const k = starts.findIndex((s, j) => e.charIndex >= s && (j === starts.length - 1 || e.charIndex < starts[j + 1]));
      setOn(k);
    };
    const done = () => { timers.forEach(clearTimeout); setOn(-1); lineEl.classList.remove('speaking'); };
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
    // 경계 이벤트가 없는 음성(온라인 음성 등)을 위한 추정 하이라이트
    const total = toks.reduce((n, w) => n + w.length + 1, 0);
    const dur = Math.max(1200, total * 75 / 0.9);
    let acc = 0;
    toks.forEach((w, k) => {
      timers.push(setTimeout(() => { if (!gotBoundary) setOn(k); }, (acc / total) * dur + 150));
      acc += w.length + 1;
    });
  }

  /* 노래 재생 위치 → 지금 나오는 줄 · 단어 표시 */
  let lastKaraokeIdx = -1;
  function syncLyricsToTime(ct) {
    const t = timingOf(currentNo);
    if (!t) return;
    const rows = $$('.kline');
    const n = rows.length;
    if (!n) return;
    let idx = -1;
    for (let i = 0; i < n; i++) {
      if (t[i] == null) continue;
      let next = Infinity;
      for (let j = i + 1; j < n; j++) { if (t[j] != null) { next = t[j]; break; } }
      if (ct >= t[i] && ct < next) { idx = i; break; }
    }
    // 노래방 가사와 전체 가사 양쪽에 같은 줄 표시
    $$('[data-li]').forEach((el) => {
      const on = Number(el.dataset.li) === idx;
      if (el.classList.contains('kline') || el.classList.contains('lline')) el.classList.toggle('now', on);
      if (!on) $$('.w.on', el).forEach((w) => w.classList.remove('on'));
    });
    if (idx < 0) return;
    let end = Infinity;
    for (let j = idx + 1; j < n; j++) { if (t[j] != null) { end = t[j]; break; } }
    if (end === Infinity) end = t[idx] + 6;
    const frac = Math.min(0.999, Math.max(0, (ct - t[idx]) / Math.max(0.1, end - t[idx])));
    $$(`[data-li="${idx}"]`).forEach((el) => {
      const words = $$('.w', el);
      const k = Math.floor(frac * words.length);
      words.forEach((w, j) => w.classList.toggle('on', j === k));
    });
    // 노래방 화면을 현재 줄로 부드럽게 이동
    if (idx !== lastKaraokeIdx && rows[idx]) {
      lastKaraokeIdx = idx;
      const box = rows[idx].parentElement;
      if (box) box.scrollTo({ top: rows[idx].offsetTop - box.clientHeight / 2 + rows[idx].clientHeight / 2, behavior: 'smooth' });
    }
  }

  /* ---------- 라우팅 ---------- */
  function route() {
    const parts = (location.hash || '#home').replace(/^#\/?/, '').split('/');
    if (parts[0] === 'set') renderSet(parts[1]);
    else if (parts[0] === 'play') renderPlay(parts[1], Number(parts[2]), Number(parts[3]));
    else if (parts[0] === 'board') renderBoard();
    else if (parts[0] === 'songs') renderSongs();
    else if (parts[0] === 'words' || parts[0] === 'sentences') {
      if (parts[1]) LEARN.setTab(parts[1]);
      const r = LEARN.render(parts);
      $('#app').innerHTML = r.html;
      LEARN.bind($('#app'));
    }
    else if (parts[0] === 'sheet') renderSheet(Number(parts[1]));
    else if (parts[0] === 'months') renderMonths();
    else if (parts[0] === 'listen') renderListen(parts[1], Number(parts[2]));
    else if (parts[0] === 'practice') { PRACTICE.stop(); PRACTICE.render(parts[1], Number(parts[2]), parts[3]); }
    else if (parts[0] === 'verses') renderVerses();
    else if (parts[0] === 'verse') renderVerse(Number(parts[1]));
    else renderHome();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  window.addEventListener('hashchange', route);

  /* ---------- 홈: 간단한 메뉴 화면 ---------- */
  /* 달력 → 찬양 묶음: 1~5월 = 1~5번째 묶음, 8~12월 = 1~5번째 묶음 (20곡 반복) */
  function currentSetFor(date = new Date()) {
    const m = date.getMonth() + 1;
    const idx = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 8: 0, 9: 1, 10: 2, 11: 3, 12: 4 }[m];
    return { month: m, set: idx === undefined ? null : SETS[idx] };
  }

  const pilsaPic = (n) => `assets/pilsa/pilsa_${String(n).padStart(3, '0')}.png`;

  function renderHome() {
    const cur = currentSetFor();
    const curSet = cur.set || SETS[0];
    const menu = [
      { href: '#songs', art: 'bunny-piano', ico: '📁', t: '한 곡씩 불러요', d: '1번부터 22번까지 곡을 골라 듣고 따라 불러요' },
      { href: '#months', art: 'bear-concert', ico: '📁', t: '월별로 불러요', d: `이번 달은 ${cur.month}월 찬양이에요` },
      { href: '#words', art: 'dog-harp', ico: '📁', t: '단어를 배워요', d: '찬양 단어 · 하나님·예수님 · 성경 인물 · 성경 책' },
      { href: '#sentences', art: 'cat-flute', ico: '📁', t: '문장을 배워요', d: '가사 한 줄마다 원어민 발음 듣기' },
      { href: '#verses', art: 'squirrel-sing', ico: '📖', t: '말씀 암송', d: '찬양마다 한 구절씩 외워요' },
      { href: '#board', art: 'snowman', ico: '📋', t: '출석부', d: '누가 함께 참여했는지 확인해요' },
    ].map((m) => `<a class="menu-card" href="${m.href}">${m.art ? `<img class="menu-art" src="assets/art/${m.art}.png" alt="">` : `<span class="menu-ico">${m.ico}</span>`}<b>${m.t}</b><small>${m.d}</small></a>`).join('');
    $('#app').innerHTML = `
      <section class="home-top">
        <span class="tag" style="--c:#e2708f">English Worship</span>
        <h1>슈퍼스타 윤희쌤과 함께하는<br><span class="hl">YEM 영어예배</span> 찬양곡 배우기</h1>
        <p>매달 같은 찬양을 반복하며 찬양팀과 아이들이 함께 외워요.</p>
        <div class="row home-cta"><a class="btn" href="#listen/${curSet.id}/${curSet.songs[0]}">🎤 ${cur.month}월 찬양 시작</a></div>
      </section>
      <div class="menu-grid">${menu}</div>
      <div class="cheer">
        <img src="${pilsaPic(12)}" alt=""><img src="${pilsaPic(45)}" alt=""><img src="${pilsaPic(70)}" alt=""><img src="${pilsaPic(96)}" alt="">
        <p>“주님이 함께하시니 우리는 할 수 있어요.”</p>
      </div>`;
  }

  /* 한 곡씩 듣기: 1~22번 목차 */
  function renderSongs() {
    const toc = [...SONGS, PRAYER].map((x) => {
      const s = setOfSong(x.no);
      const c = conceptOf(s.id);
      return `<a class="toc-item" href="#listen/${s.id}/${x.no}" style="--c:${c.c}">
        <span class="toc-no">${x.no === 0 ? '🕊️' : x.no}</span>
        <span class="toc-t"><b>${esc(x.title)}</b><small>${esc(x.ko)}</small></span></a>`;
    }).join('');
    $('#app').innerHTML = `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a><h1>🎧 한 곡씩 듣기<span>곡을 누르면 바로 들을 수 있어요</span></h1></section>
      <div class="toc toc-big">${toc}</div>`;
  }

  /* 월별로 듣기: 묶음 카드 */
  function renderMonths() {
    const cur = currentSetFor();
    const sets = ALL_SETS.map((s) => {
      const p = setProgress(s); const c = conceptOf(s.id);
      const isNow = cur.set && s.id === cur.set.id;
      const list = s.songs.map((no) => `<li>${esc(songOf(no).title)}</li>`).join('');
      return `<a class="card set-card ${isNow ? 'now' : ''}" href="#set/${s.id}" style="--c:${c.c}">
        <img class="mascot" src="${art(c.mascot)}" alt="">
        <div class="set-top"><span class="tag">${s.tag}</span><span class="pct">${p}%</span></div>
        ${isNow ? '<span class="now-badge">이번 달</span>' : ''}
        <h3>${s.name}</h3><div class="concept">${c.title}</div><ul>${list}</ul>
        <div class="bar"><i style="width:${p}%"></i></div></a>`;
    }).join('');
    $('#app').innerHTML = `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a><h1>🎼 월별로 듣기<span>한 묶음은 찬양 4곡 · 4주 학습</span></h1></section>
      <div class="grid sets">${sets}</div>`;
  }

  /* ---------- 묶음 페이지 ---------- */
  function renderSet(id) {
    const s = setOf(id);
    if (!s) { location.hash = '#home'; return; }
    const c = conceptOf(s.id);
    const songs = s.songs.map(songOf);
    const weeks = STAGES.map((st) => {
      const done = s.songs.filter((no) => isDone(no, st.id)).length;
      const pct = Math.round((done / s.songs.length) * 100);
      const chips = songs.map((x) => `<span class="chip ${isDone(x.no, st.id) ? 'on' : ''}">${x.no === 0 ? '주기도문' : '#' + x.no}</span>`).join('');
      return `<a class="card week-card" href="#play/${s.id}/${st.id}/${s.songs[0]}" style="--c:${c.c}">
        <div class="week-top"><span class="week-no">${st.week}</span><span class="week-ico">${st.icon}</span></div>
        <h3>${st.name}</h3><p>${st.desc}</p>
        <div class="chips">${chips}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <small>${done}/${s.songs.length} 곡 완료</small></a>`;
    }).join('');
    const list = songs.map((x) => `<li><a href="#listen/${s.id}/${x.no}"><b>${x.no === 0 ? '' : x.no + '.'}</b>${esc(x.title)}<span>${esc(x.ko)}</span></a></li>`).join('');
    $('#app').innerHTML = `
      <section class="set-head" style="--c:${c.c}">
        <a href="#home" class="back">← 전체 콘서트</a>
        <div class="concept-banner"><img src="${art(c.mascot)}" alt=""><div><span class="tag">${s.tag}</span><b>${c.title}</b><p>${c.sub}</p></div></div>
        <h1>${s.name}</h1>
        <div class="set-actions">
          <a class="btn big-btn" href="#listen/${s.id}/${s.songs[0]}">🎧 곡 들어보기</a>
          <a class="btn alt big-btn" href="#play/${s.id}/1/${s.songs[0]}">🎤 찬양 연습 시작</a>
        </div>
        <ol class="song-list">${list}</ol>
      </section>
      <section class="weeks" style="--c:${c.c}">${weeks}</section>`;
  }

  /* ---------- 출석표 ---------- */
  function renderBoard() {
    if (!students.length) {
      $('#app').innerHTML = `<section class="card"><h2>📋 출석표</h2><p>아직 등록된 친구가 없어요. 상단의 “친구 선택”에서 이름을 등록해 주세요.</p></section>`;
      return;
    }
    const cols = ALL_SETS.flatMap((s) => s.songs.map((no) => ({ no, set: s })));
    const head = `<tr><th>친구</th>${cols.map((c) => `<th title="${esc(songOf(c.no).title)}" style="--c:${conceptOf(c.set.id).c}">${c.no === 0 ? '주기도문' : '#' + c.no}</th>`).join('')}<th>마지막 참여</th></tr>`;
    const rows = students.map((s) => {
      const pr = store.get('p:' + s.id, {});
      const cells = cols.map((c) => {
        const n = STAGES.filter((st) => pr[`${c.no}:${st.id}`]).length;
        return `<td><span class="dot s${n}" title="${n}/4 단계"></span></td>`;
      }).join('');
      const xpv = store.get('xp:' + s.id, 0);
      const last = store.get('last:' + s.id, '아직 없음');
      return `<tr><td class="name"><img src="${art(s.avatar)}" alt="">${esc(s.name)} <small>⭐${xpv}</small></td>${cells}<td>${esc(last)}</td></tr>`;
    }).join('');
    $('#app').innerHTML = `
      <section class="section-head" style="margin-top:0"><div><h1>📋 출석부</h1><p>한 칸은 한 곡, 점의 색이 진할수록 많은 단계를 끝낸 거예요 (●1 ●2 ●3 ●4 단계)</p></div></section>
      <div class="board-wrap card" style="padding:0"><table class="board"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <p style="margin-top:14px">※ 기록은 이 기기(브라우저)에 저장됩니다. 여러 기기에서 함께 보려면 저장소 연결이 필요해요.</p>`;
  }

  /* ---------- 학습 페이지 ---------- */
  let lastGreetKey = '';
  let currentNo = null;
  function renderPlay(setId, stageId, no) {
    const s = setOf(setId);
    const st = STAGES.find((x) => x.id === stageId);
    if (!s || !st) { location.hash = '#home'; return; }
    const song = songOf(no) || songOf(s.songs[0]);
    const c = conceptOf(s.id);
    const tabs = s.songs.map((n) => {
      const x = songOf(n);
      return `<a class="tab ${n === song.no ? 'active' : ''}" href="#play/${s.id}/${st.id}/${n}">${n === 0 ? '주기도문' : '#' + n + ' ' + esc(x.title)}${isDone(n, st.id) ? ' ✓' : ''}</a>`;
    }).join('');
    const stageTabs = STAGES.map((x) => `<a class="stage-tab ${x.id === st.id ? 'active' : ''}" href="#play/${s.id}/${x.id}/${song.no}">${x.week} · ${x.name}</a>`).join('');
    const nxt = nextSong(s, song.no);
    const foot = nxt !== null
      ? `<a class="btn" href="#play/${s.id}/${st.id}/${nxt}">다음 곡 →</a>`
      : (STAGES[st.id] ? `<a class="btn" href="#play/${s.id}/${st.id + 1}/${s.songs[0]}">다음 주차 →</a>` : `<a class="btn" href="#set/${s.id}">콘서트로 돌아가기</a>`);

    $('#app').innerHTML = `
      <section class="play-head" style="--c:${c.c}">
        <a class="back" href="#set/${s.id}">← ${esc(s.name)}</a>
        <h1>${esc(song.title)}<span>${esc(song.ko)} · ${st.week} ${st.name}</span></h1>
        <div class="tabs">${tabs}</div>
        <div class="stage-tabs">${stageTabs}</div>
      </section>
      ${playerHTML(song)}
      <section class="card activity" id="activity" style="--c:${c.c}"></section>
      <div class="play-foot"><a class="back" href="#set/${s.id}">← 묶음 목록</a>${foot}</div>`;

    const key = `${setId}/${stageId}/${no}`;
    if (lastGreetKey !== key) { lastGreetKey = key; pilsa(STAGE_GREET[st.id]); }

    currentNo = song.no;
    wirePlayer(song);
    const renderers = { 1: stageWords, 2: stageSentence, 3: stageDictation, 4: stageRecall };
    renderers[st.id](song, s, st);
  }

  /* 곡 들어보기 페이지: 큰 재생 버튼 · 찬양 가사 · 다음 곡 / 찬양 연습 시작 */
  function renderListen(setId, no) {
    const s = setOf(setId) || setOfSong(no);
    const song = songOf(no);
    if (!song || !s) { location.hash = '#home'; return; }
    const c = conceptOf(s.id);
    const i = s.songs.indexOf(no);
    const prev = i > 0 ? s.songs[i - 1] : null;
    const nxt = nextSong(s, no);
    currentNo = no;
    $('#app').innerHTML = `
      <section class="play-head" style="--c:${c.c}">
        <a class="back" href="#set/${s.id}">← ${esc(s.name)}</a>
        <h1>${no === 0 ? '' : '#' + no + ' '}${esc(song.title)}<span>${esc(song.ko)} · 곡 들어보기</span></h1>
      </section>
      <div class="tabs song-pick" aria-label="이번 묶음 곡 고르기">${s.songs.map((n) => { const x2 = songOf(n); return `<a class="tab ${n === no ? 'active' : ''}" href="#listen/${s.id}/${n}">${n === 0 ? '주기도문' : '#' + n + ' ' + esc(x2.title)}</a>`; }).join('')}</div>
      ${PRACTICE.stepper(s.id, no, 1)}
      ${playerHTML(song)}
      <div class="play-foot">
        ${prev !== null ? `<a class="ghost" href="#listen/${s.id}/${prev}">← 이전 곡</a>` : '<span></span>'}
        <a class="btn alt big-btn pulse" href="#practice/${s.id}/${no}">🎤 찬양연습시작!</a>
        ${nxt !== null ? `<a class="ghost" href="#listen/${s.id}/${nxt}">다음 곡 →</a>` : '<span></span>'}
      </div>
      <div class="row"><a class="ghost" href="#sheet/${no}">📄 가사지 보기</a></div>`;
    wirePlayer(song);
  }

  /* [영어, 한글] 쌍 목록 — 노래방 가사와 전체 가사가 같은 순서를 씁니다 */
  function flatPairs(song) {
    const src = (window.LYRICS || {})[song.no];
    if (!src) return song.lines.filter((l) => l[0]).map((l) => [l[0], l[1] || '']);
    const out = [];
    src.forEach((s) => s.lines.forEach((l) => { if (l[0]) out.push([l[0], l[1] || '']); }));
    return out;
  }

  function playerHTML(song) {
    if (!window.AUDIO_ENABLED) return `<section class="card player"><p class="ph">🎵 음원은 준비 중이에요. 가사를 보며 따라 읽고 외워 보세요.</p></section>`;
    const segs = store.get('seg:' + song.no, []);
    const t = timingOf(song.no);
    const pairs = flatPairs(song);
    const karaoke = `
      <div class="karaoke-head">
        <span class="kicker">🎤 찬양 가사</span>
        <span class="ph">가사를 묵상하며 찬양을 불러보아요.</span>
      </div>
      <div class="karaoke" id="karaoke">${pairs.map((p, i) => `
        <div class="kline" data-li="${i}">
          <span class="ken">${wordSpans(p[0])}</span>
          <span class="kko">${esc(p[1])}</span>
          <button type="button" class="listen-btn kline-say" data-say-text="${esc(p[0])}" aria-label="이 줄 듣기"><span>🔊</span>듣기</button>
          <span class="ktime">${t && t[i] != null ? fmt(t[i]) : ''}</span>
        </div>`).join('')}
      </div>`;
    return `
      <section class="card player">
        <div class="play-row">
          <button type="button" class="big-play" data-bigplay aria-label="재생 또는 일시정지">${PLAY_ICON}</button>
          <div><b class="now-title">${esc(song.title)}</b><small>${esc(song.ko)} · 재생 버튼을 누르면 찬양이 시작돼요</small></div>
        </div>
        <audio id="song-audio" controls preload="metadata" src="${encodeURI(audioOf(song.no))}"></audio>
        ${karaoke}
        <div class="speed">
          <small>속도</small>
          ${[0.75, 1, 1.25].map((r) => `<button class="ghost ${r === 1 ? 'on' : ''}" data-rate="${r}">${r}x</button>`).join('')}
          <button class="ghost" data-seek="-5">⏪ 5초</button>
          <button class="ghost" data-seek="5">5초 ⏩</button>
        </div>
        <div class="range-tools">
          <small>구간</small>
          <button class="ghost" data-mark="a">A 찍기 <b id="pa">--:--</b></button>
          <button class="ghost" data-mark="b">B 찍기 <b id="pb">--:--</b></button>
          <button class="btn sm" data-range="ab">A→B 재생</button>
          <label class="loopchk"><input type="checkbox" id="loop"> 반복</label>
          <input id="seg-name" placeholder="구간 이름 (예: 후렴)" maxlength="20">
          <button class="ghost" data-seg-save>구간 저장</button>
        </div>
        <div class="seg-list" id="seg-list">${segListHTML(segs)}</div>
      </section>`;
  }

  function segListHTML(segs) {
    if (!segs.length) return '<small>저장된 구간이 없어요. A와 B를 찍고 이름을 붙여 저장하면 여기서 바로 반복 재생할 수 있어요.</small>';
    return segs.map((s, i) => `<span class="seg"><button data-seg-play="${i}">▶ ${esc(s.name)} <small>${fmt(s.a)}~${fmt(s.b)}</small></button><button data-seg-del="${i}" aria-label="구간 삭제">×</button></span>`).join('');
  }

  function wirePlayer(song) {
    const a = $('#song-audio');
    const box = document.querySelector('.player');
    if (!a || !box) return;
    let A = null, B = null, range = null;
    const play = (s, e, loop) => { range = { s, e, loop }; a.currentTime = s; a.play().catch(() => {}); };
    a.playRange = play;
    a.addEventListener('timeupdate', () => {
      syncLyricsToTime(a.currentTime);
      if (!range || a.currentTime < range.e) return;
      if (range.loop) a.currentTime = range.s;
      else { a.pause(); range = null; }
    });
    a.addEventListener('pause', () => { $$('.kline.now, .lline.now').forEach((x) => x.classList.remove('now')); });
    const big = box.querySelector('[data-bigplay]');
    const showPlayState = () => { if (big) big.innerHTML = a.paused ? PLAY_ICON : PAUSE_ICON; };
    a.addEventListener('play', showPlayState);
    a.addEventListener('pause', showPlayState);

    /* 노래방 가사: 줄 누르면 그 줄부터 재생 · 싱크 모드에서는 현재 위치를 줄 시작으로 기록 */
    let syncMode = false;
    const stampLine = (i) => {
      const arr = (store.get('timing:' + song.no, null) || ((window.TIMINGS || {})[song.no]) || []).slice();
      arr[i] = Math.round(a.currentTime * 10) / 10;
      store.set('timing:' + song.no, arr);
      const kl = box.querySelector(`.kline[data-li="${i}"] .ktime`);
      if (kl) kl.textContent = fmt(arr[i]);
    };
    box.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-bigplay]')) {
        if (a.paused) a.play().catch(() => {}); else a.pause();
        return;
      }
      const ks = ev.target.closest('[data-say-text]');
      if (ks) { TTS.speak(ks.dataset.sayText, { el: ks.closest('.kline') }); return; }
      const kl = ev.target.closest('.kline');
      if (kl) {
        const i = Number(kl.dataset.li);
        if (syncMode) stampLine(i);
        else playLine(i, $$('.kline').length);
        return;
      }
      const sy = ev.target.closest('[data-sync]');
      if (sy) {
        syncMode = !syncMode;
        sy.classList.toggle('on', syncMode);
        sy.textContent = syncMode ? '✔ 싱크 맞추는 중 (줄을 누르면 기록)' : '⏱ 싱크 맞추기';
        return;
      }
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.rate) {
        a.playbackRate = Number(b.dataset.rate);
        box.querySelectorAll('[data-rate]').forEach((x) => x.classList.toggle('on', x === b));
      }
      if (b.dataset.seek) a.currentTime = Math.max(0, a.currentTime + Number(b.dataset.seek));
      if (b.dataset.mark === 'a') { A = a.currentTime; $('#pa').textContent = fmt(A); }
      if (b.dataset.mark === 'b') { B = a.currentTime; $('#pb').textContent = fmt(B); }
      if (b.dataset.range === 'ab') {
        if (A == null || B == null || B <= A) { $('#seg-name').placeholder = 'A가 B보다 앞이어야 해요'; return; }
        play(A, B, $('#loop').checked);
      }
      if (b.hasAttribute('data-seg-save')) {
        if (A == null || B == null || B <= A) { $('#seg-name').placeholder = '먼저 A와 B를 찍어 주세요'; return; }
        const segs = store.get('seg:' + song.no, []);
        const name = ($('#seg-name').value || '').trim() || `구간 ${segs.length + 1}`;
        segs.push({ name, a: A, b: B });
        store.set('seg:' + song.no, segs);
        $('#seg-list').innerHTML = segListHTML(segs);
        $('#seg-name').value = '';
      }
      if (b.dataset.segPlay !== undefined) {
        const s = store.get('seg:' + song.no, [])[Number(b.dataset.segPlay)];
        if (s) { A = s.a; B = s.b; $('#pa').textContent = fmt(A); $('#pb').textContent = fmt(B); play(s.a, s.b, $('#loop').checked); }
      }
      if (b.dataset.segDel !== undefined) {
        const segs = store.get('seg:' + song.no, []);
        segs.splice(Number(b.dataset.segDel), 1);
        store.set('seg:' + song.no, segs);
        $('#seg-list').innerHTML = segListHTML(segs);
      }
    });
  }

  /* 한 줄 재생: 해당 줄 시작 ~ 다음 줄 시작 */
  function playLine(idx, flatLen) {
    const a = $('#song-audio');
    const t = timingOf(currentNo);
    if (!a || !t || t[idx] == null) return false;
    let end = null;
    for (let j = idx + 1; j < flatLen; j++) { if (t[j] != null) { end = t[j]; break; } }
    if (end == null) end = (a.duration && !isNaN(a.duration)) ? a.duration : t[idx] + 8;
    a.playRange(t[idx], end, false);
    return true;
  }

  /* 단어를 칸 단위 span으로 */
  const wordSpans = (text) => text.split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" data-wi="${i}">${esc(w)}</span>`).join(' ');

  /* ===== 1주차 준비 · 전체 가사 먼저 읽기 ===== */
  const isRead = (no) => !!progress[`${no}:read`];
  function markRead(no) {
    if (progress[`${no}:read`]) return;
    progress[`${no}:read`] = true;
    saveProgress();
    pilsa('가사를 읽었어요! 이제 단어를 하나씩 익혀 볼까요? 🎵');
  }

  function lyricsPanel(song) {
    const secs = ((window.LYRICS || {})[song.no] || [{ label: '', lines: song.lines }]).filter((s) => s.lines.some((l) => l[0]));
    const read = isRead(song.no);
    const t = timingOf(song.no);
    let idx = 0;
    const flatLen = secs.reduce((n, s) => n + s.lines.filter((l) => l[0]).length, 0);
    const body = secs.map((s) => `
      <div class="lsec">
        ${s.label ? `<span class="lsec-label">${esc(s.label)}</span>` : ''}
        ${s.lines.filter((l) => l[0]).map((l) => {
          const i = idx++;
          const has = t && t[i] != null;
          return `
          <div class="lline" data-li="${i}">
            <span class="len">${wordSpans(l[0])}</span>
            ${l[1] ? `<span class="lko ${level === 'high' ? 'blur' : ''}">${esc(l[1])}</span>` : '<span></span>'}
            <span class="lctl"><button type="button" class="spk" data-say-line="${i}" aria-label="이 줄을 원어민 음성으로 듣기">🔊</button></span>
          </div>`;
        }).join('')}
      </div>`).join('');
    return `
      <div class="lyrics-first">
        <div class="act-head"><span class="kicker">준비 · 가사 먼저 읽기</span><h2>${esc(song.title)} 전체 가사</h2>
          <p>처음부터 끝까지 읽어 보세요. 🔊을 누르면 원어민 음성으로 그 줄을 읽어 주고, 지나가는 단어가 색으로 보여요.${level === 'high' ? ' 뜻은 줄을 눌러 확인해요.' : ''}</p></div>
        <div class="lyrics-box">${body}</div>
        <div class="row"><button class="btn" data-read ${read ? 'disabled' : ''}>${read ? '✔ 가사를 읽었어요' : '가사를 한 번 읽었어요'}</button></div>
      </div>`;
  }

  /* 줄별 시간 기록 · 재생 · 음성 */
  function handleLyricTiming(e, song) {
    const say = e.target.closest('[data-say-line]');
    if (say) {
      const i = Number(say.dataset.sayLine);
      const lineEl = $('#activity').querySelector(`.lline[data-li="${i}"]`);
      const text = flatLyrics(song.no)[i] || (song.lines[i] || [''])[0];
      speakLine(lineEl, text);
      return true;
    }
    return false;
  }
  function flatLyrics(no) {
    const out = [];
    ((window.LYRICS || {})[no] || []).forEach((s) => s.lines.forEach((l) => { if (l[0]) out.push(l[0]); }));
    return out;
  }

  /* ===== 1주차 · 단어 파워 ===== */
  function stageWords(song, set, st) {
    const el = $('#activity');
    const cards = song.words.map((w, i) => `
      <div class="flip" data-i="${i}" role="button" tabindex="0" aria-label="${esc(w[0])} 뒤집기">
        <span class="flip-in">
          <span class="face front"><em>${w[2]}</em><b>${esc(w[0])}</b>${level === 'kids' ? `<small>${esc(w[1])}</small>` : ''}<button type="button" class="spk" data-say="${esc(w[0])}" aria-label="발음 듣기">🔊</button></span>
          <span class="face back"><b>${esc(w[1])}</b><small>${esc(w[0])}</small></span>
        </span>
      </div>`).join('');
    el.innerHTML = `
      <div class="act-head"><span class="kicker">${st.week} · ${st.name}</span><h2>핵심 단어 ${song.words.length}개</h2><p>클래스 카드처럼 넘기며 단어를 익혀요. ✓ 알아요를 누르면 쌓여요.</p></div>
      ${PRACTICE.deckHTML(song)}
      <div class="divider"></div>
      <div class="act-head"><span class="kicker">미니 게임</span><h2>단어 메모리 게임</h2><p>영어 카드와 뜻 카드를 짝 맞춰 보세요. 가사 읽기와 모든 짝 맞히기를 끝내면 1주차가 완료돼요.</p></div>
      <div class="memory" id="memory"></div>
      <div class="mem-status" id="mem-status"></div>`;

    let memDone = false;
    const tryStage1 = () => {
      if (memDone && isRead(song.no)) {
        completeStage(song.no, st.id);
        $('#mem-status').textContent = '🎉 1주차 완료! 가사를 읽고 단어까지 모두 익혔어요.';
      }
    };

    PRACTICE.bindDeck(song);
    el.onclick = (e) => {
      if (PRACTICE.handleClick(e)) return;
      const say = e.target.closest('[data-say]');
      if (say) { e.stopPropagation(); speakPlain(say.dataset.say); return; }
      if (e.target.closest('[data-read]')) {
        markRead(song.no); tryStage1();
        const b = el.querySelector('[data-read]');
        if (b) { b.disabled = true; b.textContent = '✔ 가사를 읽었어요'; }
        return;
      }
      const lk = e.target.closest('.lko.blur');
      if (lk) { lk.classList.toggle('shown'); return; }
      const f = e.target.closest('.flip');
      if (f) f.classList.toggle('turned');
    };

    /* 메모리 게임 */
    const pairs = song.words.slice(0, 8);
    const deck = shuffle(pairs.flatMap((w, i) => [{ k: i, label: w[0], t: 'en' }, { k: i, label: w[1], t: 'ko' }]));
    let open = [], moves = 0, matched = 0, lock = false;
    const mem = $('#memory');
    mem.innerHTML = deck.map((c, j) => `<button class="mem ${c.t === 'ko' ? 'ko' : ''}" data-j="${j}" aria-label="카드 ${j + 1}"><span class="mtxt" hidden>${esc(c.label)}</span>?</button>`).join('');
    const status = () => { $('#mem-status').textContent = `시도 ${moves}회 · 맞춘 짝 ${matched}/${pairs.length}`; };
    status();
    mem.onclick = (e) => {
      const b = e.target.closest('.mem');
      if (!b || lock || b.classList.contains('open') || b.classList.contains('matched')) return;
      const c = deck[Number(b.dataset.j)];
      b.classList.add('open'); b.firstElementChild.hidden = false; b.lastChild.textContent = '';
      open.push({ b, c });
      if (open.length < 2) return;
      moves++; lock = true;
      const [x, y] = open;
      if (x.c.k === y.c.k && x.c.t !== y.c.t) {
        x.b.classList.replace('open', 'matched'); y.b.classList.replace('open', 'matched');
        matched++; open = []; lock = false; status();
        speakPlain(x.c.t === 'en' ? x.c.label : y.c.label);
        if (matched === pairs.length) {
          memDone = true;
          $('#mem-status').textContent = isRead(song.no) ? `🎉 ${moves}회 만에 전부 맞혔어요!` : `🎉 ${moves}회 만에 전부 맞혔어요! ② 가사 읽기 단계도 끝내야 1주차가 완료돼요.`;
          tryStage1();
        }
      } else {
        setTimeout(() => {
          [x, y].forEach((o) => { o.b.classList.remove('open'); o.b.firstElementChild.hidden = true; o.b.lastChild.textContent = '?'; });
          open = []; lock = false;
        }, 800);
      }
    };
    if (isDone(song.no, 1)) $('#mem-status').textContent = '✅ 이 곡의 1주차를 완료했어요. 다시 맞혀 복습할 수 있어요.';
  }

  /* ===== 2주차 · 문장 조립 ===== */
  function stageSentence(song, set, st) {
    const el = $('#activity');
    const lines = song.lines;
    let idx = 0, pool = [], picked = [], showKo = level === 'kids';

    if (isDone(song.no, st.id)) {
      el.innerHTML = `<div class="done-banner">✅ 2주차 문장 조립 완료 <button class="ghost sm" id="redo">다시 연습</button></div>`;
      $('#redo').onclick = () => { progress[`${song.no}:2`] = false; saveProgress(); stageSentence(song, set, st); };
      return;
    }
    const setup = () => {
      const toks = lines[idx][0].split(/\s+/);
      pool = shuffle(toks.map((t, i) => ({ t, i })));
      picked = [];
      showKo = level === 'kids';
    };
    const draw = () => {
      const [en, ko] = lines[idx];
      const kr = showKo ? `<span>${esc(ko)}</span>` : (level === 'high' ? '' : '<button class="ghost sm" data-ko>한글 뜻 보기</button>');
      el.innerHTML = `
        <div class="act-head"><span class="kicker">${st.week} · ${st.name}</span><h2>문장 조립 ${idx + 1}/${lines.length}</h2><p>단어를 눌러 올바른 순서로 문장을 완성하세요.</p></div>
        <div class="ko-hint">${kr}</div>
        <div class="build-slot" id="slot">${picked.length ? picked.map((p, j) => `<button class="chip-w on" data-back="${j}">${esc(p.t)}</button>`).join('') : '<span class="ph">단어를 차례로 눌러 보세요</span>'}</div>
        <div class="pool">${pool.map((p, j) => `<button class="chip-w ${picked.includes(p) ? 'gone' : ''}" data-pick="${j}">${esc(p.t)}</button>`).join('')}</div>
        <div class="row"><button class="ghost" data-reset>다시</button><button class="btn" data-check ${picked.length ? '' : 'disabled'}>확인</button><button type="button" class="spk" data-speak aria-label="문장 듣기">🔊</button></div>
        <div class="feedback" id="fb"></div>`;
    };
    setup(); draw();

    el.onclick = (e) => {
      const t = e.target;
      if (t.closest('[data-ko]')) { showKo = true; draw(); return; }
      if (t.closest('[data-speak]')) { speakPlain(lines[idx][0]); return; }
      const p = t.closest('[data-pick]');
      if (p) { picked.push(pool[Number(p.dataset.pick)]); draw(); return; }
      const bk = t.closest('[data-back]');
      if (bk) { picked.splice(Number(bk.dataset.back), 1); draw(); return; }
      if (t.closest('[data-reset]')) { picked = []; draw(); return; }
      if (t.closest('[data-check]')) {
        const want = lines[idx][0].split(/\s+/).map(norm);
        const got = picked.map((p) => norm(p.t));
        const fb = $('#fb');
        if (got.length === want.length && got.every((g, i) => g === want[i])) {
          speakPlain(lines[idx][0]);
          fb.className = 'feedback ok'; fb.textContent = '정답! 🙌';
          setTimeout(() => {
            idx++;
            if (idx >= lines.length) { completeStage(song.no, st.id); stageSentence(song, set, st); return; }
            setup(); draw();
          }, 700);
        } else {
          fb.className = 'feedback bad'; fb.textContent = '순서나 단어를 다시 확인해 보세요';
          el.querySelector('#slot').classList.add('shake');
          setTimeout(() => el.querySelector('#slot') && el.querySelector('#slot').classList.remove('shake'), 500);
        }
      }
    };
  }

  /* ===== 3주차 · 듣고 받아쓰기 ===== */
  function stageDictation(song, set, st) {
    const el = $('#activity');
    const k = blanksFor();
    const items = song.lines.map(([en, ko]) => {
      const toks = en.split(/\s+/);
      const cand = toks.map((t, i) => ({ t, i })).filter((o) => norm(o.t).length >= 3);
      const n = Math.min(k, cand.length);
      const chosen = new Set();
      for (let j = 0; j < n; j++) chosen.add(cand[Math.floor(((j + 0.5) * cand.length) / n)].i);
      return { toks, chosen, ko };
    });
    const lines = items.map((it, li) => `
      <div class="dline">
        <span class="ln">${String(li + 1).padStart(2, '0')}</span>
        <div>
          <div class="dwords">${it.toks.map((t, i) => it.chosen.has(i)
            ? `<input data-li="${li}" data-i="${i}" data-ans="${esc(norm(t))}" data-full="${esc(t.replace(/[^A-Za-z']/g, ''))}" size="${Math.max(3, norm(t).length)}" autocomplete="off" spellcheck="false" aria-label="빈칸 ${li + 1}-${i + 1}">`
            : `<span>${esc(t)}</span>`).join(' ')}</div>
          ${level === 'high' ? `<button class="hidden-ko" data-ko="${li}">한글 뜻 보기</button>` : `<small>${esc(it.ko)}</small>`}
        </div>
      </div>`).join('');
    el.innerHTML = `
      <div class="act-head"><span class="kicker">${st.week} · ${st.name}</span><h2>빈칸 받아쓰기</h2>
        <p>위 재생기로 찬양을 들으며 빈칸을 채워 보세요. 한 줄씩 멈추고, 다 쓴 뒤 <b>채점</b>을 눌러요.</p></div>
      <div class="dlines">${lines}</div>
      <div class="row"><button class="btn" data-grade>채점하기</button><button class="ghost" data-reveal>정답 보기</button></div>
      <div class="feedback" id="fb"></div>`;
    const inputs = () => [...el.querySelectorAll('input[data-ans]')];
    const grade = () => {
      let ok = 0;
      inputs().forEach((inp) => {
        const good = norm(inp.value) === inp.dataset.ans && inp.value.trim() !== '';
        inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good);
        if (good) ok++; else inp.title = '정답: ' + inp.dataset.full;
      });
      const total = inputs().length;
      const fb = $('#fb');
      if (ok === total) { fb.className = 'feedback ok'; fb.textContent = `🎧 완벽해요! ${total}/${total} 정답`; completeStage(song.no, st.id); }
      else { fb.className = 'feedback bad'; fb.textContent = `${ok}/${total} 정답 · 빨간 칸을 다시 들어 보세요 (칸에 마우스를 올리면 정답이 보여요)`; }
    };
    el.onclick = (e) => {
      if (e.target.closest('[data-grade]')) return grade();
      if (e.target.closest('[data-reveal]')) {
        inputs().forEach((inp) => { inp.value = inp.dataset.full; inp.classList.add('bad'); });
        $('#fb').className = 'feedback'; $('#fb').textContent = '정답을 확인하고 한 번 더 받아 적어 보세요';
        return;
      }
      const ko = e.target.closest('[data-ko]');
      if (ko) { const li = Number(ko.dataset.ko); ko.outerHTML = `<small>${esc(items[li].ko)}</small>`; }
    };
    el.onkeydown = (e) => {
      if (e.key !== 'Enter' || !e.target.matches('input[data-ans]')) return;
      const list = inputs(); const i = list.indexOf(e.target);
      if (i >= 0 && i < list.length - 1) list[i + 1].focus(); else grade();
    };
  }

  /* ===== 4주차 · 암송 & 묵상 ===== */
  function stageRecall(song, set, st) {
    const el = $('#activity');
    const noteKey = `note:${who()}:${song.no}`;
    const note = store.get(noteKey, '');
    const recallDone = { v: false };
    el.innerHTML = `
      <div class="act-head"><span class="kicker">${st.week} · ${st.name}</span><h2>가사 암송</h2>
        <p>한글 뜻을 보고 영어 가사를 떠올려 적어요. 80% 이상 맞으면 통과예요.</p></div>
      <div class="recall">${song.lines.map(([en, ko], i) => `
        <div class="rline" data-i="${i}">
          <span class="ln">${String(i + 1).padStart(2, '0')}</span>
          <div>
            ${level === 'high' ? `<button class="hidden-ko" data-ko="${i}">한글 뜻 보기</button>` : `<p class="ko">${esc(ko)}</p>`}
            <div class="rrow"><input data-i="${i}" placeholder="영어 가사를 떠올려 적어 보세요" autocomplete="off" spellcheck="false" aria-label="${i + 1}번 가사"><button class="ghost sm" data-hint="${i}">첫 글자 힌트</button></div>
            <small class="rres"></small>
          </div>
        </div>`).join('')}
      </div>
      <div class="row"><button class="btn" data-recall>암송 체크</button></div>
      <div class="pray">
        <h3>🙏 말씀 묵상</h3>
        <p>${esc(song.faith)}</p>
        <textarea id="note" placeholder="이 찬양을 부르며 주님이 주신 마음을 한두 문장으로 적어 보세요">${esc(note)}</textarea>
        <div class="row"><button class="ghost" data-note>묵상 저장</button><span class="ph" id="note-fb"></span></div>
      </div>
      <div class="feedback" id="fb"></div>`;

    const check = () => {
      let pass = 0;
      song.lines.forEach(([en], i) => {
        const row = el.querySelector(`.rline[data-i="${i}"]`);
        const input = row.querySelector('input');
        const want = en.split(/\s+/).map(norm).filter(Boolean);
        const pool = input.value.split(/\s+/).map(norm).filter(Boolean);
        let hit = 0;
        want.forEach((w) => { const j = pool.indexOf(w); if (j >= 0) { hit++; pool.splice(j, 1); } });
        const ok = want.length ? hit / want.length >= 0.8 : false;
        row.classList.toggle('pass', ok); row.classList.toggle('fail', !ok);
        row.querySelector('.rres').textContent = ok ? '✔ 통과' : `정답: ${en}`;
        if (ok) pass++;
      });
      const fb = $('#fb');
      const curNote = (el.querySelector('#note').value || '').trim();
      if (pass === song.lines.length) {
        recallDone.v = true;
        fb.className = 'feedback ok';
        fb.textContent = curNote ? '🙏 전부 외웠어요! 완료 처리됩니다.' : '🙏 전부 외웠어요! 묵상을 한 줄 적고 저장하면 4주차가 완료돼요.';
        if (curNote) { store.set(noteKey, curNote); completeStage(song.no, st.id); }
      } else {
        fb.className = 'feedback bad';
        fb.textContent = `${pass}/${song.lines.length} 통과 · 빨간 줄의 정답을 확인하고 다시 적어 보세요`;
      }
    };

    el.onclick = (e) => {
      const h = e.target.closest('[data-hint]');
      if (h) {
        const en = song.lines[Number(h.dataset.hint)][0];
        const hint = en.split(/\s+/).map((w) => w[0] + '_'.repeat(Math.max(0, w.replace(/[^A-Za-z]/g, '').length - 1))).join(' ');
        el.querySelector(`.rline[data-i="${h.dataset.hint}"] .rres`).textContent = `힌트: ${hint}`;
        return;
      }
      const ko = e.target.closest('[data-ko]');
      if (ko) { const i = Number(ko.dataset.ko); ko.outerHTML = `<p class="ko">${esc(song.lines[i][1])}</p>`; return; }
      if (e.target.closest('[data-recall]')) return check();
      if (e.target.closest('[data-note]')) {
        const text = (el.querySelector('#note').value || '').trim();
        if (!text) { $('#note-fb').textContent = '한 줄이라도 적어 주세요'; return; }
        store.set(noteKey, text);
        $('#note-fb').textContent = '저장했어요 ✔';
        if (recallDone.v) completeStage(song.no, st.id);
      }
    };
    el.onkeydown = (e) => {
      if (e.key !== 'Enter' || !e.target.matches('.rrow input')) return;
      const list = [...el.querySelectorAll('.rrow input')];
      const i = list.indexOf(e.target);
      if (i < list.length - 1) list[i + 1].focus();
    };
    if (isDone(song.no, st.id)) {
      const banner = document.createElement('div');
      banner.className = 'done-banner';
      banner.innerHTML = '✅ 4주차 암송 완료 · 이 곡을 외웠어요! <button class="ghost sm" data-again>다시 복습</button>';
      el.prepend(banner);
      banner.querySelector('[data-again]').onclick = () => banner.remove();
    }
  }

  /* ---------- 자기긍정 영어표현 (찬양팀 아이들) ---------- */
  function speakAt(text, rate, onEnd) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  }

  function renderAffirm(g, i) {
    const groups = window.AFFIRM_GROUPS || [];
    const AF = window.AFFIRM || [];
    const G = groups[g - 1] || groups[0];
    if (!G) return;
    g = groups.indexOf(G) + 1;
    const items = AF.slice(G.from - 1, G.to);
    i = Math.min(Math.max(1, i), items.length);
    const it = items[i - 1];
    const n = G.from + i - 1;
    const doneCount = items.filter((_, k) => progress['af:' + (G.from + k)]).length;
    const isDone = !!progress['af:' + n];
    const grammar = `
      <section class="card af-grammar">
        <div class="act-head"><span class="kicker">함께 익혀요</span><h2>사람을 가리키는 말 (인칭대명사)</h2>
          <p>문장 속에서 누구를 말하는지 바꿔 보면 쉽게 외워져요.</p></div>
        <div class="board-wrap"><table class="pron">
          <tr><th></th><th>나</th><th>너</th><th>우리</th><th>그</th><th>그녀</th><th>그들</th><th>그것</th></tr>
          <tr><th>주격 (~는, ~가)</th><td>I</td><td>you</td><td>we</td><td>he</td><td>she</td><td>they</td><td>it</td></tr>
          <tr><th>목적격 (~를, ~에게)</th><td>me</td><td>you</td><td>us</td><td>him</td><td>her</td><td>them</td><td>it</td></tr>
          <tr><th>소유격 (~의)</th><td>my</td><td>your</td><td>our</td><td>his</td><td>her</td><td>their</td><td>its</td></tr>
          <tr><th>소유대명사 (~의 것)</th><td>mine</td><td>yours</td><td>ours</td><td>his</td><td>hers</td><td>theirs</td><td>-</td></tr>
        </table></div>
        <p class="ph" style="margin-top:10px">예) I love myself. (나는 나 자신을 사랑해) → Many people like me. (많은 사람들은 나를 좋아해)</p>
      </section>`;
    $('#app').innerHTML = `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a>
        <h1>💖 자기긍정 표현<span>영어로 나를 칭찬하고 믿어요</span></h1></section>
      <div class="af-groups">${groups.map((x, k) => `<a class="af-pill ${k + 1 === g ? 'on' : ''}" href="#affirm/${k + 1}/1">${esc(x.title)}</a>`).join('')}</div>
      <section class="card af-card">
        <div class="af-top"><span class="tag">${n} / 100</span><span class="ph">이 묶음에서 외운 문장 ${doneCount}/${items.length}</span></div>
        <p class="af-en">${esc(it[0])}</p>
        <p class="af-ko">${esc(it[1])}</p>
        <div class="af-btns">
          <button type="button" class="spk big" data-af="say" aria-label="듣기">🔊</button>
          <button type="button" class="ghost" data-af="slow">🐢 천천히 듣기</button>
          <button type="button" class="ghost" data-af="speak">🎤 따라 말해보기</button>
        </div>
        <p class="feedback" id="af-fb"></p>
        <div class="af-nav">
          <a class="ghost" href="#affirm/${g}/${Math.max(1, i - 1)}">← 이전</a>
          <button type="button" class="btn ${isDone ? 'alt' : ''}" data-af="done">${isDone ? '✓ 외웠어요' : '외웠어요!'}</button>
          <a class="btn" href="#affirm/${g}/${Math.min(items.length, i + 1)}">다음 →</a>
        </div>
      </section>
      ${grammar}`;
    $('#app').onclick = (e) => {
      const b = e.target.closest('[data-af]'); if (!b) return;
      const fb = $('#af-fb');
      if (b.dataset.af === 'say') speakAt(it[0], 0.95);
      if (b.dataset.af === 'slow') speakAt(it[0], 0.55);
      if (b.dataset.af === 'done') {
        if (!progress['af:' + n]) { progress['af:' + n] = true; saveProgress(); addXp(5); pilsa('좋아요! 나를 칭찬하는 말을 외웠어요 💖'); }
        renderAffirm(g, i);
      }
      if (b.dataset.af === 'speak') {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { fb.textContent = 'Chrome에서 열면 말한 내용을 확인할 수 있어요.'; return; }
        const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false;
        fb.textContent = '🎤 말해 보세요…';
        rec.onresult = (ev) => {
          const said = ev.results[0][0].transcript;
          const want = it[0].toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
          const got = said.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
          const hit = want.filter((w) => got.includes(w)).length;
          const score = Math.round((hit / want.length) * 100);
          fb.textContent = `들린 말: “${said}” · ${score >= 80 ? '좋아요! 🎉' : '한 번 더 천천히 말해 봐요'}`;
        };
        rec.onerror = () => { fb.textContent = '소리를 듣지 못했어요. 다시 눌러 주세요.'; };
        rec.start();
      }
    };
  }

  /* 가사지: 송폼 순서대로 영어 · 한글 (인쇄용) */
  function renderSheet(no) {
    const song = songOf(no);
    if (!song) { location.hash = '#songs'; return; }
    const secs = (window.LYRICS || {})[no] || [{ label: '', lines: song.lines }];
    const body = secs.map((s) => `
      <div class="sheet-sec">
        ${s.label ? `<h3>${esc(s.label)}</h3>` : ''}
        ${s.lines.filter((l) => l[0]).map((l) => `<div class="sheet-line"><p class="se">${esc(l[0])}</p><p class="sk">${esc(l[1] || '')}</p></div>`).join('')}
      </div>`).join('');
    $('#app').innerHTML = `
      <section class="play-head no-print"><a class="back" href="#listen/${setOfSong(no).id}/${no}">← 곡 듣기로</a>
        <h1>📄 ${no === 0 ? '' : '#' + no + ' '}${esc(song.title)}<span>${esc(song.ko)} · 노래 순서대로 적은 가사지</span></h1></section>
      <section class="card sheet">
        ${body}
      </section>
      <div class="row no-print"><button class="btn" data-print>🖨️ 인쇄하기</button></div>`;
    $('#app').onclick = (e) => { if (e.target.closest('[data-print]')) window.print(); };
  }

  /* ---------- 말씀 암송 (초등 암송 메뉴) ---------- */
  const verseOf = (no) => VERSES.find((v) => v.no === no);
  const setOfSong = (no) => ALL_SETS.find((s) => s.songs.includes(no)) || ALL_SETS[ALL_SETS.length - 1];
  const verseDone = (no) => !!progress['v:' + no];
  function completeVerse(no) {
    if (progress['v:' + no]) return;
    progress['v:' + no] = true;
    saveProgress();
    addXp(20);
    pilsa('말씀을 외웠어요! 🙏 오늘도 하나님 말씀을 마음에 담았어요');
  }

  function renderVerses() {
    const groups = ALL_SETS.map((s) => {
      const c = conceptOf(s.id);
      const cards = s.songs.map((no) => {
        const v = verseOf(no);
        if (!v) return '';
        const songName = no === 0 ? '주기도문' : `#${no} ${songOf(no).title}`;
        return `<a class="card vcard" href="#verse/${no}" style="--c:${c.c}">
          <div class="vtop"><span class="tag">${esc(v.ref)}</span>${verseDone(no) ? '<span class="vdone">✅ 외움</span>' : ''}</div>
          <p class="ven">${esc(v.en)}</p>
          <p class="vko">${esc(v.ko)}</p>
          <p class="vref">— ${esc(v.refEn)} · ${esc(v.ref)}</p>
          <small>${esc(songName)}</small></a>`;
      }).join('');
      return `<section class="section"><div class="section-head"><h2>${c.title}</h2><p>${s.name}</p></div><div class="grid vgrid">${cards}</div></section>`;
    }).join('');
    $('#app').innerHTML = `
      <section class="section-head" style="margin-top:0"><div><h1>📖 말씀 암송</h1><p>찬양마다 한 구절씩 외워요. 듣고 → 빈칸 → 처음부터 외워 쓰기 순서예요.</p></div></section>
      ${groups}`;
  }

  function renderVerse(no) {
    const v = verseOf(no);
    if (!v) { location.hash = '#verses'; return; }
    const set = setOfSong(no);
    const c = conceptOf(set.id);
    const words = v.en.split(/\s+/);
    const every = level === 'kids' ? 4 : level === 'mid' ? 3 : 2;
    const blanks = new Set();
    words.forEach((w, i) => { if (i > 0 && (i % every) === every - 1 && norm(w).length >= 2) blanks.add(i); });
    const nxtNo = (() => { const list = VERSES.map((x) => x.no); const i = list.indexOf(no); return i >= 0 && i < list.length - 1 ? list[i + 1] : null; })();
    $('#app').innerHTML = `
      <section class="play-head" style="--c:${c.c}">
        <a class="back" href="#verses">← 말씀 암송 목록</a>
        <h1>${esc(v.ref)} <small>${esc(v.refEn)}</small><span>${no === 0 ? '주기도문' : '#' + no + ' ' + esc(songOf(no).title)} ${verseDone(no) ? '· ✅ 외웠어요' : ''}</span></h1>
      </section>
      <section class="card activity vpage" style="--c:${c.c}">
        <div class="vsteps"><span>① 듣고 따라 읽기</span><span>② 빈칸 채우기</span><span>③ 처음부터 외워 쓰기</span></div>
        <div class="act-head"><span class="kicker">① 듣고 따라 읽기</span><h2>말씀 소리 내어 읽기</h2><p>🔊을 누르면 읽어 줘요. 지나가는 단어가 색으로 보여요.</p></div>
        <div class="verse-card">
          <p class="verse-en" id="ven">${words.map((w, i) => `<span class="w" data-wi="${i}">${esc(w)}</span>`).join(' ')}</p>
          ${level === 'high' ? '<button class="hidden-ko" data-vko>한글 뜻 보기</button>' : `<p class="verse-ko">${esc(v.ko)}</p>`}
          <p class="vref">— ${esc(v.refEn)} · ${esc(v.ref)}</p>
          <div class="row"><button type="button" class="spk big" data-vsay aria-label="말씀 듣기">🔊</button><span class="ph">누르고 따라 읽어요</span></div>
        </div>
        <div class="divider"></div>
        <div class="act-head"><span class="kicker">② 빈칸 채우기</span><h2>빈칸에 알맞은 단어를 써요</h2></div>
        <div class="dwords verse-blank" id="vblank">${words.map((w, i) => blanks.has(i)
          ? `<input data-bi="${i}" data-ans="${esc(norm(w))}" size="${Math.max(3, norm(w).length)}" autocomplete="off" spellcheck="false" aria-label="빈칸">`
          : `<span>${esc(w)}</span>`).join(' ')}</div>
        <div class="row"><button class="btn" data-bcheck>확인</button></div>
        <div class="feedback" id="vfb"></div>
        <div class="divider"></div>
        <div class="act-head"><span class="kicker">③ 처음부터 외워 쓰기</span><h2>보지 않고 적어 보세요</h2><p>80% 이상 맞으면 말씀을 외운 거예요!</p></div>
        <textarea id="vfull" class="vfull" placeholder="말씀을 보지 않고 영어로 적어 보세요"></textarea>
        <div class="row"><button class="ghost" data-vhint>첫 글자 힌트</button><button class="btn" data-vfull>외워 쓴 것 확인</button><button class="ghost" data-vreveal>정답 보기</button></div>
        <div class="feedback" id="vfull-fb"></div>
      </section>
      <div class="play-foot"><a class="back" href="#verses">← 목록</a>${nxtNo !== null ? `<a class="btn" href="#verse/${nxtNo}">다음 말씀 →</a>` : ''}</div>`;

    const el = $('.vpage');
    el.onclick = (e) => {
      if (e.target.closest('[data-vsay]')) { speakLine($('#ven'), v.en); return; }
      if (e.target.closest('[data-vko]')) { e.target.outerHTML = `<p class="verse-ko">${esc(v.ko)}</p>`; return; }
      if (e.target.closest('[data-bcheck]')) {
        let ok = 0, total = 0;
        $$('#vblank input').forEach((inp) => {
          total++;
          const good = norm(inp.value) === inp.dataset.ans && inp.value.trim() !== '';
          inp.classList.toggle('ok', good); inp.classList.toggle('bad', !good);
          if (good) ok++;
        });
        const fb = $('#vfb');
        if (ok === total) { fb.className = 'feedback ok'; fb.textContent = `🎉 ${total}/${total} 정답! 이제 처음부터 외워 써 봐요.`; }
        else { fb.className = 'feedback bad'; fb.textContent = `${ok}/${total} 정답 · 빨간 칸을 다시 생각해 보세요`; }
        return;
      }
      if (e.target.closest('[data-vhint]')) {
        $('#vfull-fb').className = 'feedback';
        $('#vfull-fb').textContent = '힌트: ' + words.map((w) => w[0] + '_'.repeat(Math.max(0, w.replace(/[^A-Za-z]/g, '').length - 1))).join(' ');
        return;
      }
      if (e.target.closest('[data-vfull]')) {
        const want = words.map(norm).filter(Boolean);
        const pool = $('#vfull').value.split(/\s+/).map(norm).filter(Boolean);
        let hit = 0;
        want.forEach((w) => { const j = pool.indexOf(w); if (j >= 0) { hit++; pool.splice(j, 1); } });
        const ratio = want.length ? hit / want.length : 0;
        const fb = $('#vfull-fb');
        if (ratio >= 0.8) { fb.className = 'feedback ok'; fb.textContent = `🙏 ${Math.round(ratio * 100)}% 맞았어요! 말씀을 외웠어요.`; completeVerse(no); }
        else { fb.className = 'feedback bad'; fb.textContent = `${Math.round(ratio * 100)}% · 힌트를 보고 다시 적어 보세요`; }
        return;
      }
      if (e.target.closest('[data-vreveal]')) { $('#vfull-fb').className = 'feedback'; $('#vfull-fb').textContent = '정답: ' + v.en; }
    };
  }

  /* ---------- 외부 모듈(practice.js)과 공유 ---------- */
  window.YEM = {
    route,
    $, $$, esc, norm, store, STAGES, songOf, setOf, setOfSong, conceptOf, flatPairs, wordSpans, fmt, nextSong,
    flatLyrics, speakPlain, pilsa, markRead, isRead, completeStage, stageWords,
  };
  PRACTICE.init(window.YEM);
  LEARN.init(window.YEM);

  /* ---------- 시작 ---------- */
  loadStudent();
  renderTop();
  route();
  if (!students.length || !curStudent()) openStudents(!students.length);
})();

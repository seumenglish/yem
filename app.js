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
  // 'p:<인물 id>' = 성경 인물 캐릭터 그림, 그 밖에는 예전 동물 캐릭터 (예전에 고른 친구도 그대로 보여요)
  const art = (name) => (String(name).startsWith('p:') ? `assets/people/img/${String(name).slice(2)}.webp` : `assets/art/${name}.png`);
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
  // 학생 캐릭터: 아이들이 잘 아는 성경 친구 12명
  const AV_PEOPLE = {
    david: '찬양하는 다윗', noah: '방주를 지은 노아', moses: '바다를 건넌 모세', esther: '용감한 에스더',
    daniel: '기도하는 다니엘', samuel: '말씀 듣는 사무엘', ruth: '착한 룻', miriam: '춤추는 미리암',
    'mary-mother': '예수님의 엄마 마리아', peter: '어부 베드로', zacchaeus: '나무 위 삭개오', jonah: '물고기 속 요나',
  };
  Object.entries(AV_PEOPLE).forEach(([id, label]) => { AV['p:' + id] = label; });
  const AVATARS = Object.keys(AV_PEOPLE).map((id) => 'p:' + id);

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
    setTimeout(() => document.dispatchEvent(new CustomEvent('yem:stage-done', { detail: { no, stageId } })), 0);
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
  // 스토리북 · 카드(books.js)에서 쓰는 연결 고리
  window.YEM_HOOKS = {
    who: () => who(),
    addXp: (n) => addXp(n),
    sparkle: () => sparkle(),
    touch: () => store.set('last:' + who(), new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
  };

  /* ---------- 상단 바 ---------- */
  /* 메뉴: 컴퓨터 = 위 한 줄 (해외 CCM은 펼침 메뉴), 휴대폰 = 위 작은 바 + 아래 탭 */
  const CCM_LINKS = [['#songs', '🎧', '한 곡씩'], ['#months', '🎼', '월별'], ['#words', '🔤', '단어'], ['#sentences', '💬', '문장'], ['#verses', '📖', '말씀 암송']];
  const SECTION = (h) => {
    const p = (h || '#home').replace(/^#\/?/, '').split('/')[0] || 'home';
    if (['songs', 'months', 'words', 'sentences', 'verses', 'verse', 'listen', 'set', 'play', 'practice', 'sheet'].includes(p)) return 'ccm';
    if (p === 'books' || p === 'book') return 'books';
    if (p === 'people' || p === 'cards') return 'people';
    if (p === 'creed') return 'home';
    if (p === 'me' || p === 'board') return 'me';
    return 'home';
  };
  function renderTop() {
    const s = curStudent();
    const ccm = CCM_LINKS.map(([h, i, t]) => `<a href="${h}" role="menuitem"><span aria-hidden="true">${i}</span>${t}</a>`).join('');
    $('#top-right').innerHTML = `
      <nav class="mainnav" aria-label="주요 메뉴">
        <a class="nav-a" data-sec="home" href="#home">YEM 소개</a>
        <details class="nav-drop" data-sec="ccm"><summary class="nav-a">해외 CCM 배우기 <span class="caret" aria-hidden="true"></span></summary>
          <div class="nav-menu" role="menu">${ccm}</div></details>
        <a class="nav-a" data-sec="books" href="#books">스토리북</a>
        <a class="nav-a" data-sec="people" href="#people">성경 인물</a>
        <a class="nav-a" data-sec="me" href="#me">내 공부방</a>
      </nav>
      <div class="top-user">
        <button class="student-chip" id="who" aria-label="내 이름 등록 · 친구 바꾸기">${s ? `<img src="${art(s.avatar)}" alt="">${esc(s.name)}` : '👋 내 이름 등록'}</button>
        <a class="xp" href="#me" aria-label="내 공부방 · 경험치">⭐ ${xp} XP</a>
      </div>`;
    let tab = document.getElementById('tabbar');
    if (!tab) { tab = document.createElement('nav'); tab.id = 'tabbar'; tab.className = 'tabbar'; tab.setAttribute('aria-label', '아래 메뉴'); document.body.appendChild(tab); }
    tab.innerHTML = `
      <div class="tab-sheet" id="tab-sheet" hidden><p>해외 CCM 배우기</p>${ccm}</div>
      <a data-sec="home" href="#home"><span aria-hidden="true">💙</span>소개</a>
      <button type="button" data-sec="ccm" id="tab-ccm" aria-expanded="false"><span aria-hidden="true">🎧</span>CCM</button>
      <a data-sec="books" href="#books"><span aria-hidden="true">📚</span>스토리북</a>
      <a data-sec="people" href="#people"><span aria-hidden="true">🙋</span>성경 인물</a>
      <a data-sec="me" href="#me"><span aria-hidden="true">🏠</span>공부방</a>`;
    markNav();
  }
  /* 지금 보는 곳 표시 · 펼친 메뉴 닫기 */
  function markNav() {
    const sec = SECTION(location.hash);
    $$('[data-sec]').forEach((el) => el.classList.toggle('on', el.dataset.sec === sec));
    $$('.nav-drop[open]').forEach((d) => d.removeAttribute('open'));
    const sh = document.getElementById('tab-sheet');
    if (sh) sh.hidden = true;
    const tb = document.getElementById('tab-ccm');
    if (tb) tb.setAttribute('aria-expanded', 'false');
  }
  window.addEventListener('hashchange', markNav);
  document.addEventListener('click', (e) => {
    if (e.target.closest('#tab-ccm')) {
      const sh = document.getElementById('tab-sheet');
      sh.hidden = !sh.hidden;
      e.target.closest('#tab-ccm').setAttribute('aria-expanded', String(!sh.hidden));
      return;
    }
    if (!e.target.closest('.nav-drop')) $$('.nav-drop[open]').forEach((d) => d.removeAttribute('open'));
    if (!e.target.closest('#tabbar')) { const sh = document.getElementById('tab-sheet'); if (sh) sh.hidden = true; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') markNav(); });
  function renderXp() { renderTop(); }

  /* 상단 바 이벤트 */
  document.addEventListener('click', (e) => {
    const lv = e.target.closest('[data-level]');
    if (lv) { level = lv.dataset.level; store.set('level', level); renderTop(); route(); return; }
    if (e.target.closest('#who')) { openStudents(); }
    const toc = e.target.closest('.toc-item');
    if (toc) { $$('.toc-item.selected').forEach((x) => x.classList.remove('selected')); toc.classList.add('selected'); }
  });

  /* ---------- 학생 프로필 ---------- */
  /* 캐릭터 고르기: 인기 친구 · 구약 · 신약 · 동물 친구 */
  const AV_TABS = [['pop', '⭐ 인기'], ['OT', '📜 구약'], ['NT', '✝️ 신약'], ['animal', '🐻 동물 친구']];
  const ANIMALS = ['bear', 'bunny-piano', 'dog-harp', 'cat-flute', 'giraffe', 'squirrel-sing', 'snowman', 'pink-photo'];
  const avList = (tab) => {
    if (tab === 'pop') return AVATARS;
    if (tab === 'animal') return ANIMALS;
    return (window.PEOPLE || []).filter((p) => p.t === tab && p.id !== 'jesus').map((p) => 'p:' + p.id);
  };
  const avLabel = (k) => AV[k] || ((window.PEOPLE_ART && PEOPLE_ART.byId.get(String(k).slice(2))) || {}).koMain || '';

  /* 누가 찬양하나요? (친구 선택을 누를 때만 열려요) */
  function openStudents() {
    const root = $('#modal-root');
    let av = (curStudent() || {}).avatar || AVATARS[0];
    let nm = '';
    let adding = !students.length;
    let tab = 'pop';
    const draw = () => {
      root.innerHTML = `
        <div class="modal-bg" id="modal-bg">
          <div class="modal compact" role="dialog" aria-modal="true" aria-labelledby="st-title">
            <button type="button" class="bpm-x" id="close-st" aria-label="닫기">✕</button>
            <h2 id="st-title">누가 찬양하나요? 🎤</h2>
            <p class="st-sub">친구를 고르면 나의 기록이 따로 저장돼요. 그냥 시작해도 괜찮아요.</p>
            ${students.length ? `<div class="st-faces">${students.map((s) => `
              <span class="st-face ${s.id === curId ? 'on' : ''}">
                <button type="button" data-pick-st="${s.id}" aria-label="${esc(s.name)} 선택"><img src="${art(s.avatar)}" alt=""><b>${esc(s.name)}</b></button>
                <button type="button" class="st-del" data-del-st="${s.id}" aria-label="${esc(s.name)} 삭제">×</button>
              </span>`).join('')}</div>` : ''}
            <button class="btn st-go" id="go-st">▶ 바로 시작하기${curStudent() ? ` <small>(${esc(curStudent().name)})</small>` : ''}</button>
            ${adding ? `
            <div class="st-new">
              <h3>새 친구 등록</h3>
              <input type="text" id="new-name" value="${esc(nm)}" placeholder="이름 (예: 하율)" maxlength="10">
              <div class="af-groups st-tabs">${AV_TABS.map(([id, n]) => `<button type="button" class="af-pill ${id === tab ? 'on' : ''}" data-av-tab="${id}">${n}</button>`).join('')}</div>
              <div class="avatars st-avatars">
                ${avList(tab).map((k) => `<button type="button" class="avatar ${k === av ? 'on' : ''}" data-av="${k}" title="${esc(avLabel(k))}"><img src="${art(k)}" alt="" loading="lazy"><small>${esc(avLabel(k))}</small></button>`).join('')}
              </div>
              <button class="btn alt" id="add-st">등록하고 시작</button>
            </div>` : '<button type="button" class="ghost sm st-add" id="show-add">＋ 새 친구 등록</button>'}
          </div>
        </div>`;
    };
    draw();
    root.oninput = (e) => { if (e.target.id === 'new-name') nm = e.target.value; };
    root.onclick = (e) => {
      const tb = e.target.closest('[data-av-tab]');
      if (tb) { nm = ($('#new-name') || { value: nm }).value; tab = tb.dataset.avTab; draw(); return; }
      if (e.target.closest('#show-add')) { adding = true; draw(); const i = $('#new-name'); if (i) i.focus(); return; }
      if (e.target.closest('#go-st')) { root.innerHTML = ''; route(); return; }
      const av2 = e.target.closest('[data-av]');
      if (av2) {
        nm = ($('#new-name') || { value: nm }).value; av = av2.dataset.av;
        root.querySelectorAll('[data-av]').forEach((b) => b.classList.toggle('on', b === av2));
        return;
      }
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
        openStudents(); renderTop(); route(); return;
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
    if (now - lastPraise < 5 * 60 * 1000) return; // 5분에 한 번만
    lastPraise = now;
    praiseIdx = (praiseIdx + 1) % PRAISE.length;
    pilsa(PRAISE[praiseIdx]);
  };

  /* ---------- 필사 캐릭터 팝업 ---------- */
  let pilsaTimer = null;
  let lastPilsa = 0;
  function pilsa(msg, mood) {
    /* 집중을 방해하지 않도록: 큰 축하(곡 완주) 말고는 1분에 한 번만 */
    const now = Date.now();
    if (mood !== 'big' && now - lastPilsa < 60 * 1000) return;
    lastPilsa = now;
    const layer = $('#pilsa-layer');
    /* 응원은 슈퍼스타 윤희쌤이 해 줘요 */
    const YUNHEE = ['cheer', 'fist', 'pray', 'wow'];
    const pick = YUNHEE[Math.floor(Math.random() * YUNHEE.length)];
    layer.innerHTML = `<div class="pilsa-pop"><img src="assets/yunhee/${pick}.png" alt="윤희쌤"><div class="bubble">${esc(msg)}</div></div>`;
    const el = layer.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    clearTimeout(pilsaTimer);
    pilsaTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { if (layer.contains(el)) layer.innerHTML = ''; }, 500);
    }, mood === 'big' ? 3500 : 2200);
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
    if (!$$('.kline').length) return;
    const n = t.length; // 숨긴 악보 표시 줄이 있어도 시간표 번호 그대로
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
    routePage();
    addGuide();
  }
  function routePage() {
    const parts = (location.hash || '#home').replace(/^#\/?/, '').split('/');
    if (window.BOOKS_UI) BOOKS_UI.stop();
    if (window.CREED_UI) CREED_UI.stop();
    if (parts[0] === 'creed' && window.CREED_UI) {
      $('#app').innerHTML = CREED_UI.render();
      CREED_UI.bind($('#app'));
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    if (parts[0] === 'intro' && window.INTRO) {
      $('#app').innerHTML = INTRO.render();
      INTRO.bind($('#app'));
    }
    else if (parts[0] === 'cards' && window.CARDS_GUIDE) {
      $('#app').innerHTML = CARDS_GUIDE.render();
      CARDS_GUIDE.bind($('#app'));
    }
    else if ((parts[0] === 'books' || parts[0] === 'book') && window.BOOKS_UI) {
      const r = BOOKS_UI.render(parts);
      $('#app').innerHTML = r.html;
      BOOKS_UI.bind($('#app'), r);
    }
    else if (parts[0] === 'set') renderSet(parts[1]);
    else if (parts[0] === 'play') renderPlay(parts[1], Number(parts[2]), Number(parts[3]));
    else if (parts[0] === 'me') renderMe();
    else if (parts[0] === 'board') {
      renderBoard();
      $('#app').onclick = (e) => { const c = e.target.closest('[data-person]'); if (c) PEOPLE_ART.openDetail(c.dataset.person); };
    }
    else if (parts[0] === 'songs') renderSongs();
    else if (parts[0] === 'words' || parts[0] === 'sentences' || parts[0] === 'people') {
      if (parts[1] && parts[0] === 'words') LEARN.setTab(parts[1]);
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


  /* ---------- 대림절 스토리북 여행: 12월 31일까지 주마다 미션 (진도표 · 달성률) ----------
     주(월~주일)마다 스토리북 1권 + 그 주 찬양 2단계 + 그 주 암송 말씀. 날짜가 지나도 놓친 미션은 언제든 할 수 있어요. */
  const ADVENT = [
    { wk: 0, from: '2026-11-16', to: '2026-11-22', name: '출발 준비', sub: '이름 등록 · 책 맛보기 · 찬양 · 말씀', m: [{ t: 'name' }, { t: 'peek', bk: 1, n: 5 }, { t: 'song', no: 15, st: [1, 2] }, { t: 'verse', no: 15 }] },
    { wk: 1, from: '2026-11-23', to: '2026-11-29', name: '대림절 첫째 주', bk: 1, m: [{ t: 'book', bk: 1 }, { t: 'cards', bk: 1 }, { t: 'song', no: 16, st: [1, 2] }, { t: 'verse', no: 16 }] },
    { wk: 2, from: '2026-11-30', to: '2026-12-06', name: '대림절 둘째 주', bk: 2, m: [{ t: 'book', bk: 2 }, { t: 'cards', bk: 2 }, { t: 'song', no: 17, st: [1, 2] }, { t: 'verse', no: 17 }] },
    { wk: 3, from: '2026-12-07', to: '2026-12-13', name: '대림절 셋째 주', bk: 3, m: [{ t: 'book', bk: 3 }, { t: 'cards', bk: 3 }, { t: 'song', no: 18, st: [1, 2] }, { t: 'verse', no: 18 }] },
    { wk: 4, from: '2026-12-14', to: '2026-12-20', name: '대림절 넷째 주', bk: 4, m: [{ t: 'book', bk: 4 }, { t: 'cards', bk: 4 }, { t: 'song', no: 19, st: [1, 2] }, { t: 'verse', no: 19 }] },
    { wk: 5, from: '2026-12-21', to: '2026-12-27', name: '성탄 주간', bk: 5, m: [{ t: 'book', bk: 5 }, { t: 'cards', bk: 5 }, { t: 'song', no: 20, st: [1, 2] }, { t: 'verse', no: 20 }] },
    { wk: 6, from: '2026-12-28', to: '2026-12-31', name: '한 해 마무리', sub: '카드 완성 · 찬양 마스터', m: [{ t: 'allcards' }, { t: 'master', nos: [16, 17, 18, 19, 20] }] },
  ];
  const ymd = (str) => { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); };
  const md = (str) => { const d = ymd(str); return `${d.getMonth() + 1}/${d.getDate()}`; };
  function missionOf(x) {
    const SB = window.BOOKS_UI && BOOKS_UI.bookStats;
    if (x.t === 'name') return { ico: '👋', label: '내 이름 등록하기', p: curStudent() ? 1 : 0, note: curStudent() ? esc(curStudent().name) : '기록이 내 이름으로 쌓여요', href: '#me', act: 'name' };
    if (x.t === 'book') {
      const b = SB ? BOOKS_UI.bookStats(x.bk) : null;
      if (!b) return null;
      const p = Math.min(1, b.seen / Math.max(1, b.total - 1));
      return { ico: '📖', label: `Book ${x.bk} 끝까지 읽고 듣기`, p, note: `${b.seen}/${b.total}쪽`, href: `#book/${x.bk}` };
    }
    if (x.t === 'peek') {
      const b = SB ? BOOKS_UI.bookStats(x.bk) : null;
      if (!b) return null;
      return { ico: '👀', label: `Book ${x.bk} 맛보기 · 앞 ${x.n}쪽 듣기`, p: Math.min(1, b.seen / x.n), note: '대림절 첫 책을 미리 만나요', href: `#book/${x.bk}` };
    }
    if (x.t === 'cards') {
      const b = SB ? BOOKS_UI.bookStats(x.bk) : null;
      if (!b) return null;
      return { ico: '🃏', label: `Book ${x.bk} 성경 친구 카드 모으기`, p: b.cards / Math.max(1, b.cardsTotal), note: `${b.cards}/${b.cardsTotal}장`, href: `#book/${x.bk}` };
    }
    if (x.t === 'song') {
      const song = songOf(x.no);
      const set = setOfSong(x.no);
      const done = x.st.filter((id) => isDone(x.no, id)).length;
      const next = x.st.find((id) => !isDone(x.no, id)) || x.st[0];
      return { ico: '🎧', label: `찬양 #${x.no} STAGE ${x.st.join('–')}`, p: done / x.st.length, note: song ? esc(song.title) : '', href: `#play/${set.id}/${next}/${x.no}` };
    }
    if (x.t === 'verse') {
      const v = verseOf(x.no);
      return { ico: '✍️', label: '이번 주 암송 말씀', p: verseDone(x.no) ? 1 : 0, note: v ? esc(v.refEn) : '', href: `#verse/${x.no}` };
    }
    if (x.t === 'allcards') {
      let got = 0; let all = 0;
      [1, 2, 3, 4, 5].forEach((bk) => { const b = SB ? BOOKS_UI.bookStats(bk) : null; if (b) { got += b.cards; all += b.cardsTotal; } });
      return { ico: '📒', label: '5권 성경 친구 카드 완성', p: all ? got / all : 0, note: `${got}/${all}장`, href: '#me' };
    }
    if (x.t === 'master') {
      const best = x.nos.reduce((a, no) => (songStars(no) > songStars(a) ? no : a), x.nos[0]);
      const set = setOfSong(best);
      return { ico: '👑', label: '대림절 찬양 한 곡 MASTER', p: songStars(best) / STAGES.length, note: `#${best} ${esc(songOf(best).title)} · ${songStars(best)}/4`, href: `#play/${set.id}/${Math.min(4, songStars(best) + 1)}/${best}` };
    }
    return null;
  }
  function adventState(now = new Date()) {
    const weeks = ADVENT.map((w) => {
      const ms = w.m.map(missionOf).filter(Boolean);
      const pct = ms.length ? Math.round((ms.reduce((a, x) => a + x.p, 0) / ms.length) * 100) : 0;
      const end = ymd(w.to); end.setHours(23, 59, 59);
      const state = now > end ? 'past' : now >= ymd(w.from) ? 'now' : 'next';
      return { ...w, ms, pct, state };
    });
    const total = Math.round(weeks.reduce((a, w) => a + w.pct, 0) / weeks.length);
    let cur = weeks.find((w) => w.state === 'now');
    if (!cur) cur = now < ymd(ADVENT[0].from) ? weeks[0] : weeks[weeks.length - 1];
    const next = cur.ms.find((x) => x.p < 1) || weeks.flatMap((w) => w.ms).find((x) => x.p < 1) || null;
    const dleft = Math.max(0, Math.ceil((ymd(cur.to) - now) / 86400000));
    return { weeks, total, cur, next, dleft, over: now > ymd('2026-12-31') };
  }
  function adventHTML(compact) {
    const A = adventState();
    if (A.over) return '';
    const w = A.cur;
    const missions = w.ms.map((x) => `
      <a class="adv-m ${x.p >= 1 ? 'done' : ''}" href="${x.href}" ${x.act ? `data-adv="${x.act}"` : ''}>
        <span class="adv-ico" aria-hidden="true">${x.p >= 1 ? '✓' : x.ico}</span>
        <span class="adv-mt"><b>${x.label}</b><small>${x.note}</small></span>
        <span class="adv-mp"><i style="width:${Math.round(x.p * 100)}%"></i></span>
        <span class="adv-pc">${Math.round(x.p * 100)}%</span></a>`).join('');
    const timeline = A.weeks.map((x) => {
      const b = x.bk && window.BOOKS_UI ? BOOKS_UI.bookStats(x.bk) : null;
      return `<li class="adv-w ${x.state} ${x.pct >= 100 ? 'clear' : ''}">
        <span class="adv-thumb">${b ? `<img src="${b.cover}" alt="" loading="lazy">` : `<b>${x.wk === 0 ? 'GO' : '★'}</b>`}</span>
        <span class="adv-wt"><b>WEEK ${x.wk}</b><small>${md(x.from)}–${md(x.to)}</small></span>
        <span class="adv-wbar"><i style="width:${x.pct}%"></i></span><span class="adv-wpc">${x.pct}%</span></li>`;
    }).join('');
    return `
      <section class="adv ${compact ? 'compact' : ''}" aria-label="대림절 학습 진도표">
        <div class="adv-head">
          <div><p class="adv-kicker">ADVENT QUEST · 11/16 – 12/31</p>
            <h2>대림절 스토리북 여행</h2>
            <p class="adv-sub">12월 31일까지 매주 <b>스토리북 1권 · 찬양 · 말씀</b>을 함께 해요.</p></div>
          <div class="adv-total" style="--p:${A.total}"><b>${A.total}<small>%</small></b><span>전체 달성률</span></div>
        </div>
        <div class="adv-now">
          <div class="adv-now-h"><span class="adv-tag">이번 주 · WEEK ${w.wk}</span><b>${w.name}${w.bk ? ` · Book ${w.bk}` : ''}</b>
            <small>${md(w.from)}–${md(w.to)} · ${A.dleft ? `${A.dleft}일 남음` : '오늘까지'}</small><span class="adv-wk-pc">${w.pct}%</span></div>
          <div class="adv-ms">${missions}</div>
          ${A.next ? `<a class="hud-go adv-go" href="${A.next.href}" ${A.next.act ? `data-adv="${A.next.act}"` : ''}>지금 할 일 ▶ ${A.next.label}</a>` : '<p class="adv-clear">이번 주 미션을 모두 끝냈어요! 🎉 지난 주 미션이나 다음 주 책을 미리 읽어도 좋아요.</p>'}
        </div>
        ${compact ? '' : `<ol class="adv-line">${timeline}</ol>`}
      </section>`;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-adv="name"]');
    if (a) { e.preventDefault(); openStudents(); }
  });
  /* ---------- 방문 기록: 이 기기(브라우저)에 학생별로 날마다 한 번씩 쌓여요 ---------- */
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function visitInfo() {
    const today = new Date();
    const k = dayKey(today);
    const v = store.get('visit:' + who(), { days: [] });
    const first = v.days.length === 0;
    const newToday = !v.days.includes(k);
    if (newToday) { v.days.push(k); if (v.days.length > 400) v.days = v.days.slice(-400); store.set('visit:' + who(), v); }
    const set = new Set(v.days);
    let streak = 0;
    const d = new Date(today);
    while (set.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
    return { today, total: v.days.length, streak, first, newToday };
  }

  /* ---------- 페이지마다 슈퍼스타 윤희쌤이 말풍선으로 안내해요 ---------- */
  const GUIDE = {
    home: ['heart', 'YEM 영어예배부에 온 걸 환영해요! 예배 순서와 이번 주 말씀을 여기서 먼저 확인해요.'],
    songs: ['armup', '해외 CCM을 한 곡씩 배워요. 4단계를 모두 깨면 그 곡은 <b>MASTER</b>예요!'],
    months: ['armup', '달마다 4곡씩 돌아가며 배워요. 이번 달 찬양부터 시작해 볼까요?'],
    set: ['cheer', '이번 묶음 4곡이에요. 한 곡을 골라 STAGE 1부터 도전해요!'],
    play: ['cheer', '미션 보드에서 지금 STAGE를 확인하고, 아래에서 찬양을 들으며 도전해요. 한 단계마다 <b>+10 XP</b>!'],
    listen: ['wow', '먼저 찬양을 끝까지 들어 봐요. 가사를 보며 따라 부르면 금방 외워져요 🎵'],
    words: ['surprise', '찬양 속 단어를 카드로 익혀요. 같은 색 짝을 찾는 메모리 게임도 있어요!'],
    sentences: ['yay', '가사 문장을 원어민 목소리로 듣고 따라 말해요. 한 문장씩 천천히!'],
    verses: ['pray', '이번 주 말씀부터 외워요! 다 외우면 <b>주간 보너스 XP</b>를 줄게요 🎁'],
    verse: ['pray2', '듣고 → 빈칸 → 보지 않고 쓰기! 다 맞히면 빨간 동그라미 쳐 줄게요 ⭕'],
    books: ['yay', '책장을 넘기면 원어민이 읽어 줘요. 다 읽으면 <b>성경 친구 카드</b>를 받아요!'],
    booksAbout: ['heart', '말씀을 읽고 또 읽으며 <b>직접 만들었어요!</b> 마음껏 나눠 주세요 💕'],
    book: ['surprise', '책장을 넘겨 봐요! 등장인물마다 목소리가 달라요 🎭'],
    people: ['wow', '성경 친구 110명! 그림을 누르면 이야기를, 이름을 누르면 발음을 들려줘요.'],
    me: ['cheer', '여기는 나만의 공부방! 모은 XP와 카드가 <b>차곡차곡</b> 쌓여 있어요 💰'],
    creed: ['pray', '사도신경을 한 줄씩 들어요. 색이 지나가는 단어를 따라 읽어요!'],
    intro: ['yay', '우리 홈페이지에서 할 수 있는 모든 것을 소개할게요! 끝까지 보면 오늘 무엇부터 할지 딱 보여요 ✨'],
    cards: ['wow', '와우! 성경 친구 카드를 <b>실물 카드</b>로 만들어 볼 수 있어요! 만드는 법부터 노는 법까지 차근차근 알려 줄게요 🃏'],
    board: ['armup', '다 함께 쌓은 기록이에요. 우리 모두 화이팅!'],
  };
  function greetLine(vi) {
    const st = curStudent();
    const nm = st ? `${esc(st.name)}님` : '친구';
    const t = vi.today;
    const h = t.getHours();
    const dow = t.getDay();
    if (vi.first && !xp) return `처음 왔군요, 반가워요 ${nm}! 오늘은 ${t.getMonth() + 1}월 ${t.getDate()}일 ${DAYS[dow]}요일이에요.`;
    if (dow === 0) return `오늘은 주일이에요, ${nm}! 오후 2시 다윗홀에서 만나요 🙌`;
    if (dow === 6) return `내일은 주일이에요, ${nm}! 찬양 한 번 더 들어 볼까요?`;
    if (vi.streak >= 2) return `${nm}, ${vi.streak}일 연속으로 왔어요! 정말 대단해요 🔥`;
    const hi = h < 11 ? '좋은 아침이에요' : h < 17 ? '반가워요' : h < 21 ? '좋은 저녁이에요' : '늦은 시간에도 왔군요';
    return `${hi}, ${nm}! 오늘은 ${DAYS[dow]}요일, 주일까지 ${7 - dow}일 남았어요.`;
  }
  let guideVisit = null;
  function addGuide() {
    const app = $('#app');
    if (!app || app.querySelector('.yh-guide')) return;
    const parts = (location.hash || '#home').replace(/^#\/?/, '').split('/');
    let key = parts[0] || 'home';
    if (key === 'books' && parts[1] === 'about') key = 'booksAbout';
    let g = GUIDE[key] || GUIDE.home;
    if (key === 'home' || key === 'me') {
      const A = adventState();
      if (!A.over) {
        const done = A.cur.ms.filter((x) => x.p >= 1).length;
        g = [key === 'home' ? 'heart' : 'cheer', A.next
          ? `대림절 스토리북 여행 <b>WEEK ${A.cur.wk}</b>예요! 이번 주 미션 ${done}/${A.cur.ms.length} 완료 · 지금 바로 <a class="yh-go" href="${A.next.href}" ${A.next.act ? `data-adv="${A.next.act}"` : ''}>${A.next.label} ▶</a>`
          : `이번 주 미션을 모두 끝냈어요! 정말 멋져요 🎉 전체 달성률 <b>${A.total}%</b>`];
      }
    }
    if (!guideVisit || guideVisit.who !== who() || dayKey(guideVisit.today) !== dayKey(new Date())) guideVisit = { ...visitInfo(), who: who() };
    const vi = guideVisit;
    const t = vi.today;
    const cards = window.BOOKS_UI ? BOOKS_UI.collectCount() : 0;
    const chips = [
      `<span>📅 ${t.getMonth() + 1}월 ${t.getDate()}일 (${DAYS[t.getDay()]})</span>`,
      vi.streak >= 2 ? `<span class="hot">🔥 ${vi.streak}일 연속</span>` : '',
      `<span>👣 ${vi.total}번째 방문</span>`,
      `<span class="gold">⭐ ${xp} XP</span>`,
      cards ? `<span>🃏 카드 ${cards}장</span>` : '',
    ].join('');
    app.insertAdjacentHTML('afterbegin', `
      <aside class="yh-guide" aria-label="윤희쌤 안내">
        <img src="assets/yunhee/guide/${g[0]}.webp" alt="슈퍼스타 윤희쌤" width="102" height="150">
        <div class="yh-bubble">
          <p class="yh-hi">${greetLine(vi)}</p>
          <p class="yh-say">${g[1]}</p>
          <div class="yh-chips">${chips}</div>
        </div>
      </aside>`);
  }
  window.addEventListener('hashchange', route);

  /* ---------- 홈: 간단한 메뉴 화면 ---------- */
  /* 달력 → 찬양 묶음: 1~5월 = 1~5번째 묶음, 8~12월 = 1~5번째 묶음 (20곡 반복) */
  /* 이번 달 찬양: 5묶음(20곡)이 매달 하나씩 돌아요. 2026년 11월 = #13-16, 12월 = #17-20, 1월 = #1-4, 2월 = #5-8 … (빈 달 없이 계속) */
  function currentSetFor(date = new Date()) {
    const m = date.getMonth() + 1;
    const months = date.getFullYear() * 12 + (m - 1) - (2026 * 12 + 10); // 2026년 11월부터 지난 달 수
    const ROT = SETS.filter((s) => s.id !== 'bonus'); // 성탄 보너스(#21-22)는 돌지 않아요
    const idx = (((months + 3) % ROT.length) + ROT.length) % ROT.length;
    return { month: m, set: ROT[idx] };
  }

  const pilsaPic = (n) => `assets/pilsa/pilsa_${String(n).padStart(3, '0')}.png`;

  /* ---------- 레벨: XP가 쌓이면 내 성경 친구가 자라요 ---------- */
  const LEVELS = [[0, '새싹 찬양이'], [60, '찬양 친구'], [150, '말씀 탐험가'], [300, '찬양 용사'], [500, '빛의 친구'],
    [800, '찬양 리더'], [1200, '말씀 지킴이'], [1700, '슈퍼스타']];
  function levelOf(x) {
    let i = 0;
    LEVELS.forEach(([min], k) => { if (x >= min) i = k; });
    const next = LEVELS[i + 1];
    const base = LEVELS[i][0];
    return { lv: i + 1, title: LEVELS[i][1], next: next ? next[0] - x : 0, pct: next ? Math.round(((x - base) / (next[0] - base)) * 100) : 100, max: !next };
  }

  /* ---------- 내 공부방 ---------- */
  function renderMe() {
    const s = curStudent();
    const L = levelOf(xp);
    const avatar = s ? s.avatar : AVATARS[0];
    const cur = currentSetFor();
    const set = cur.set || SETS[0];
    const nextNo = set.songs.find((no) => !STAGES.every((st) => isDone(no, st.id))) || set.songs[0];
    const doneCount = set.songs.filter((no) => STAGES.every((st) => isDone(no, st.id))).length;
    const SB = window.STORYBOOKS || { books: {} };
    const lastBook = store.get('lastBook:' + who(), null);
    const lb = lastBook && SB.books[lastBook.bk];
    const firstBook = Object.values(SB.books)[0];
    const cardsGot = Object.keys(store.get('cards:' + who(), {})).length;
    const cardsAll = window.BOOKS_UI ? BOOKS_UI.collectCount() : 0;
    const today = new Date().toISOString().slice(0, 10);
    const notices = (window.YEM_NOTICE || []).filter((n) => !n.until || n.until >= today);
    const songDots = set.songs.map((no) => {
      const n = STAGES.filter((st) => isDone(no, st.id)).length;
      return `<a class="me-song" href="#listen/${set.id}/${no}"><span class="dot s${n}"></span><b>#${no}</b><small>${esc(songOf(no).title)}</small></a>`;
    }).join('');
    $('#app').innerHTML = `
      ${adventHTML(false)}
      <section class="me-hello">
        <div><p class="me-hi">안녕하세요, <b>${s ? esc(s.name) : '친구'}</b>님 👋</p>
          <p class="ph">${s ? '오늘도 찬양하고 말씀을 읽어 볼까요?' : '이름을 등록하면 나만의 기록과 카드가 저장돼요.'}</p></div>
        <button type="button" class="ghost sm" id="me-who">${s ? '👤 친구 바꾸기' : '👋 내 이름 등록'}</button>
      </section>

      <h2 class="menu-sec">🌱 내 성경 친구</h2>
      <section class="me-pet" data-lv="${L.lv}">
        <div class="me-pet-art"><img src="${art(avatar)}" alt=""><span class="me-lv">Lv.${L.lv}</span></div>
        <div class="me-pet-info">
          <p class="bp-kicker">${esc(L.title)}</p>
          <h3>${s ? esc(s.name) + '의 ' : ''}${esc(avLabel(avatar) || '성경 친구')}</h3>
          <div class="me-bar"><i style="width:${L.pct}%"></i></div>
          <p class="me-xp">누적 <b>${xp} XP</b> · ${L.max ? '최고 레벨이에요! 🎉' : `다음 레벨까지 <b>${L.next} XP</b>`}</p>
          <details class="me-how"><summary>경험치 얻는 법</summary><ul>
            <li>찬양 한 곡의 단계 하나 끝내기 <b>+10</b></li><li>찬양 한 곡 4단계 모두 끝내기 <b>+50</b></li>
            <li>말씀 한 구절 외우기 <b>+20</b></li><li>스토리북에서 새 친구 카드 얻기 <b>+5</b></li><li>칭찬하는 말 외우기 <b>+5</b></li></ul></details>
        </div>
      </section>

      <h2 class="menu-sec">▶ 이어서 하기</h2>
      <section class="me-next">
        <a class="me-card" href="#listen/${set.id}/${nextNo}"><span class="me-ico">🎧</span><b>${cur.month}월 찬양 이어서</b>
          <small>#${nextNo} ${esc(songOf(nextNo).title)} · ${doneCount}/${set.songs.length}곡 완주</small></a>
        <a class="me-card" href="${lb ? `#book/${lb.bk}/${lastBook.page}` : firstBook ? `#book/${firstBook.bk}` : '#books'}"><span class="me-ico">📚</span>
          <b>${lb ? `Book ${lb.bk} 이어 읽기` : '스토리북 읽기 시작'}</b><small>${lb ? `${esc(lb.ko)} · ${lastBook.page}쪽부터` : '예수님 탄생 이야기 5권'}</small></a>
        <a class="me-card" href="#board"><span class="me-ico">📒</span><b>내 카드첩</b><small>성경 친구 카드 ${cardsGot} / ${cardsAll}장</small></a>
      </section>
      <section class="card me-month"><p class="bp-kicker">${esc(set.name)}</p><div class="me-songs">${songDots}</div></section>

      ${notices.length ? `<h2 class="menu-sec">📢 공지사항</h2>
      <section class="me-notice">${notices.map((n) => `<article><span class="me-tag">${esc(n.tag || '공지')}</span><b>${esc(n.title)}</b><p>${esc(n.body || '')}</p></article>`).join('')}</section>` : ''}

      <h2 class="menu-sec">🙋 도움이 필요할 때</h2>
      <section class="me-help">
        <details><summary><b>처음 왔어요 · 어떻게 공부하나요?</b><small>찬양 · 스토리북 · 카드</small></summary>
          <ol><li><b>🎧 한 곡씩</b>이나 <b>🎼 월별</b>에서 이번 달 찬양을 골라요. 4단계(단어 → 문장 → 빈칸 → 외우기)를 차례로 해요.</li>
            <li><b>📚 스토리북</b>에서 책장을 넘기며 영어 · 중국어로 들어요. 친구 카드도 모여요.</li>
            <li><b>📋 내 기록</b>에서 모은 카드와 찬양 기록을 확인해요.</li></ol></details>
        <details><summary><b>부모님께 · 기록은 어디에 저장되나요?</b><small>이 기기 · 이 브라우저</small></summary>
          <p>기록과 카드는 지금 쓰는 휴대폰(또는 컴퓨터)의 브라우저에만 저장돼요. 다른 기기에서는 따로 쌓이고, 브라우저 기록을 지우면 함께 지워질 수 있어요. 형제자매는 <b>친구 선택</b>에서 이름을 따로 등록하면 기록이 섞이지 않아요.</p></details>
        <a class="me-link" href="#people"><b>성경 인물 카드 110명</b><small>이름 듣기 · 그림 속 이야기</small></a>
      </section>`;
    $('#app').onclick = (e) => { if (e.target.closest('#me-who')) openStudents(); };
  }

  function renderHome() {
    const cur = currentSetFor();
    const curSet = cur.set || SETS[0];
    const SB = window.STORYBOOKS || { series: [], books: {} };
    const sbReady = SB.series.filter((s) => s.ready).length;
    const card = (m) => `<a class="menu-card" href="${m.href}">${m.pic ? `<span class="menu-art menu-crowd">${m.pic}</span>` : m.art ? `<img class="menu-art" src="assets/art/${m.art}.png" alt="">` : `<span class="menu-ico">${m.ico}</span>`}<b>${m.t}</b><small>${m.d}</small></a>`;
    const praise = [
      { href: '#songs', art: 'bunny-piano', ico: '📁', t: '한 곡씩 불러요', d: '1번부터 22번까지 곡을 골라 듣고 따라 불러요' },
      { href: '#months', art: 'bear-concert', ico: '📁', t: '월별로 불러요', d: `이번 달은 ${cur.month}월 찬양이에요` },
      { href: '#words', art: 'dog-harp', ico: '📁', t: '단어를 배워요', d: '찬양 단어 · 하나님·예수님 · 성경 인물 · 성경 책' },
      { href: '#sentences', art: 'cat-flute', ico: '📁', t: '문장을 배워요', d: '가사 한 줄마다 원어민 발음 듣기' },
      { href: '#verses', art: 'squirrel-sing', ico: '📖', t: '말씀 암송', d: '찬양마다 한 구절씩 외워요' },
    ].map(card).join('');
    const story = [
      { href: '#books', ico: '📚', t: 'YEM 바이블 스토리북', d: `그림책 ${sbReady}권 · 원어민이 읽어 줘요 · 영어 · 中文`,
        pic: SB.books['1'] ? `<span class="crowd-books">${Object.values(SB.books).slice(0, 3).map((b) => `<img src="${b.cover}" alt="" loading="lazy">`).join('')}</span>` : '' },
      { href: '#people', art: '', ico: '🙋', t: '성경 인물 카드', d: `구약·신약 ${window.PEOPLE.length}명 · 이름 듣기 · 그림 속 이야기`, pic: PEOPLE_ART.crowd(['noah', 'moses', 'jesus', 'esther', 'paul']) },
      { href: '#board', ico: '📒', t: '내 기록 · 카드첩', d: `스토리북 친구 카드 모으기 · 찬양 기록`,
        pic: `<span class="crowd-cards">${['mary-mother', 'jesus', 'gabriel'].map((id) => `<img src="assets/people/img/${id}.webp" alt="" loading="lazy">`).join('')}</span>` },
    ].map(card).join('');
    const menu = `
      <h2 class="ab-sec" id="learn">🎧 해외 CCM 배우기 <small>THE 20 JOURNEY · 20 Songs of Faith &amp; Praise</small></h2>
      <section class="ab-ccm">
        <p>8월부터 12월까지 매달 네 곡씩, 다섯 달 동안 20곡의 영어 찬양(해외 CCM)을 마음에 새겨요.
          1 · 2주차에는 화면을 보며 함께 부르고, 3 · 4주차에는 가사를 외워 회중을 바라보며 담대히 찬양해요. 집에서도 듣고, 따라 부르고, 단어와 문장까지 익혀 보세요!</p>
        <a class="btn" href="#listen/${curSet.id}/${curSet.songs[0]}">🎤 ${cur.month}월 찬양 시작</a>
      </section>
      <div class="menu-grid">${praise}</div>
      <h2 class="ab-sec">📖 성경 이야기</h2><div class="menu-grid">${story}</div>`;
    $('#app').innerHTML = `
      ${adventHTML(false)}
      ${window.ABOUT ? ABOUT.html({ set: cur.set || curSet, month: cur.month }) : ''}
      ${menu}
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
      ${window.artHero({ img: 'songs', alt: '언덕 위 무대에서 성경 친구들과 천사들이 함께 찬양하는 그림', kicker: 'YEM Praise Songs', title: '영어 찬양을 함께 불러요!',
        body: '다윗은 수금을, 미리암은 소고를 들고 하나님을 찬양했어요.<br>우리도 한 곡씩 듣고, 따라 부르고, 가사를 외워 봐요.' })}
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
      ${window.artHero({ img: 'songs', alt: '언덕 위 무대에서 성경 친구들과 천사들이 함께 찬양하는 그림', kicker: 'YEM Praise Songs', title: '이번 달 찬양을 익혀요!',
        body: '한 달에 4곡씩, 4주 동안 같은 찬양을 반복해요.<br>듣고 · 따라 부르고 · 외우면 어느새 영어 찬양이 내 노래가 돼요.' })}
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
    const album = window.BOOKS_UI ? BOOKS_UI.albumHTML() : '';
    if (!students.length) {
      $('#app').innerHTML = `${album}<section class="card"><h2>📋 찬양 기록</h2><p>아직 등록된 친구가 없어요. 상단의 “친구 선택”에서 이름을 등록하면 찬양 기록도 남아요.</p></section>`;
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
    $('#app').innerHTML = `${album}
      <section class="section-head"><div><h1>📋 찬양 기록</h1><p>한 칸은 한 곡, 점의 색이 진할수록 많은 단계를 끝낸 거예요 (●1 ●2 ●3 ●4 단계)</p></div></section>
      <div class="board-wrap card" style="padding:0"><table class="board"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <p style="margin-top:14px">※ 기록은 이 기기(브라우저)에만 저장돼요. 다른 기기에서 공부한 친구의 기록은 여기에 보이지 않아요.</p>`;
  }

  /* ---------- 학습 페이지 ---------- */
  let lastGreetKey = '';
  let currentNo = null;
  /* ---------- 곡 배우기 (#play): 찬양 듣기 하나 · 곡 퀘스트 · 고른 주차 활동만 ---------- */
  const BADGES = [
    { ico: '🌱', name: '도전 시작' }, { ico: '🥉', name: '브론즈' }, { ico: '🥈', name: '실버' }, { ico: '🥇', name: '골드' }, { ico: '👑', name: '마스터' },
  ];
  const songStars = (no) => STAGES.filter((st) => isDone(no, st.id)).length;
  const badgeOf = (no) => BADGES[Math.min(songStars(no), BADGES.length - 1)];
  let curPlay = null; // { s, song, st }

  const TIERS = ['ROOKIE', 'BRONZE', 'SILVER', 'GOLD', 'MASTER'];
  const segsHTML = (no) => STAGES.map((x) => `<i class="${isDone(no, x.id) ? 'on' : ''}"></i>`).join('');
  function questHTML(s, song, st) {
    const n = songStars(song.no);
    const all = n === STAGES.length;
    const tiles = STAGES.map((x) => {
      const done = isDone(song.no, x.id);
      const here = x.id === st.id;
      const state = done ? 'done' : here ? 'now' : 'todo';
      return `<li class="qnode ${state} ${here ? 'here' : ''}"><a href="#play/${s.id}/${x.id}/${song.no}" ${here ? 'aria-current="step"' : ''}>
        <span class="q-lv">STAGE ${x.id}</span>
        <b class="q-name">${esc(x.name)}</b>
        <span class="q-week">${x.week}</span>
        <span class="q-pill">${done ? 'CLEAR' : here ? 'PLAYING' : '+10 XP'}</span></a></li>`;
    }).join('');
    return `
      <div class="hud-top">
        <span class="medal t${n}" aria-hidden="true"><b>${n}</b><small>/4</small></span>
        <div class="hud-title">
          <p class="hud-kicker">SONG QUEST · <span class="tier t${n}">${TIERS[n]}</span></p>
          <h2>${all ? '이 곡 마스터 완료!' : `마스터까지 <em>${STAGES.length - n}단계</em> 남았어요`}</h2>
        </div>
        <div class="hud-xp"><small>XP</small><b>${n * 10 + (all ? 50 : 0)}</b><small>/ 90</small></div>
      </div>
      <div class="hud-bar" role="img" aria-label="${n}/4 단계 완료">${segsHTML(song.no)}</div>
      <ol class="quest-path">${tiles}</ol>
      <div class="hud-foot">
        <span class="hud-bonus">${all ? '★ MASTER 배지 획득 · 보너스 +50 XP 받았어요' : '★ 4단계 ALL CLEAR 보너스 <b>+50 XP</b> · MASTER 배지'}</span>
        ${isDone(song.no, st.id) ? '' : `<button type="button" class="hud-go" data-go-activity>STAGE ${st.id} 시작 ▶</button>`}
      </div>`;
  }

  function songHeroHTML(s, song) {
    // 줄 번호(i)는 음원 시간표와 맞아야 해서 원래 순서를 그대로 쓰고, 표시만 깔끔하게 (악보 표시 줄은 숨김)
    const all = flatPairs(song);
    const audioOk = !!window.AUDIO_ENABLED;
    const karaoke = `<div class="karaoke" id="karaoke">${all.map((p, i) => (isJunkLine(p) ? '' : `
        <div class="kline" data-li="${i}"><span class="ken">${wordSpans(cleanLyric(p[0]))}</span><span class="kko">${esc(cleanKo(p[1]))}</span></div>`)).join('')}</div>`;
    return `
      <section class="card player song-hero" style="--c:${conceptOf(s.id).c}">
        <div class="sh-main">
          ${audioOk ? `<button type="button" class="sh-play" data-bigplay aria-label="찬양 듣기">${PLAY_ICON}</button>` : ''}
          <div class="sh-info">
            <p class="kicker">${song.no === 0 ? '주기도문' : '#' + song.no} · 찬양 듣기</p>
            <h1>${esc(song.title)}</h1>
            <p class="sh-ko">${esc(song.ko)}</p>
            ${audioOk ? `<div class="sh-bar"><span id="sh-cur">0:00</span><div class="sh-track" id="sh-track" role="slider" aria-label="재생 위치" tabindex="0"><i id="sh-fill"></i></div><span id="sh-dur">--:--</span></div>` : '<p class="ph">🎵 음원은 준비 중이에요.</p>'}
          </div>
        </div>
        ${audioOk ? `<audio id="song-audio" preload="metadata" src="${encodeURI(audioOf(song.no))}"></audio>` : ''}
        <details class="sh-more"><summary>🎤 가사 보며 듣기 · 속도 · 구간 반복</summary>
          <p class="ph">줄을 누르면 그 부분부터 찬양이 나와요.</p>
          ${karaoke}
          ${audioOk ? `<div class="speed"><small>속도</small>${[0.75, 1, 1.25].map((r) => `<button class="ghost sm ${r === 1 ? 'on' : ''}" data-rate="${r}">${r}x</button>`).join('')}
            <button class="ghost sm" data-seek="-5">⏪ 5초</button><button class="ghost sm" data-seek="5">5초 ⏩</button></div>
          <div class="range-tools"><small>구간</small>
            <button class="ghost sm" data-mark="a">A 찍기 <b id="pa">--:--</b></button><button class="ghost sm" data-mark="b">B 찍기 <b id="pb">--:--</b></button>
            <button class="btn sm" data-range="ab">A→B 재생</button><label class="loopchk"><input type="checkbox" id="loop"> 반복</label>
            <input id="seg-name" placeholder="구간 이름 (예: 후렴)" maxlength="20"><button class="ghost sm" data-seg-save>구간 저장</button></div>
          <div class="seg-list" id="seg-list">${segListHTML(store.get('seg:' + song.no, []))}</div>` : ''}
        </details>
      </section>`;
  }

  function renderPlay(setId, stageId, no) {
    const s = setOf(setId);
    const st = STAGES.find((x) => x.id === stageId);
    if (!s || !st) { location.hash = '#home'; return; }
    const song = songOf(no) || songOf(s.songs[0]);
    const c = conceptOf(s.id);
    curPlay = { s, song, st };
    const tabs = s.songs.map((n, i) => {
      const x = songOf(n);
      const m = songStars(n) === STAGES.length;
      return `<a class="track ${n === song.no ? 'active' : ''} ${m ? 'mastered' : ''}" href="#play/${s.id}/${st.id}/${n}" ${n === song.no ? 'aria-current="page"' : ''}>
        <span class="tr-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="tr-t"><b>${n === 0 ? '주기도문' : esc(x.title)}</b><small>${n === 0 ? 'Lord’s Prayer' : 'SONG #' + n}${m ? ' · MASTER' : ''}</small></span>
        <span class="tr-seg">${segsHTML(n)}</span></a>`;
    }).join('');
    const nxt = nextSong(s, song.no);
    const foot = nxt !== null
      ? `<a class="btn" href="#play/${s.id}/${st.id}/${nxt}">다음 곡 →</a>`
      : (STAGES[st.id] ? `<a class="btn" href="#play/${s.id}/${st.id + 1}/${s.songs[0]}">다음 주차 →</a>` : `<a class="btn" href="#set/${s.id}">묶음으로 돌아가기</a>`);

    $('#app').innerHTML = `
      <div class="play-top"><a class="back" href="#set/${s.id}">← ${esc(s.name)}</a><span>이번 묶음 ${s.songs.length}곡</span></div>
      <nav class="tracks" aria-label="이번 묶음 곡">${tabs}</nav>
      <section class="quest" id="quest">${questHTML(s, song, st)}</section>
      ${songHeroHTML(s, song)}
      <section class="card activity" id="activity" style="--c:${c.c}"></section>
      <div class="play-foot"><a class="back" href="#set/${s.id}">← 묶음 목록</a>${foot}</div>`;

    const key = `${setId}/${stageId}/${no}`;
    if (lastGreetKey !== key) { lastGreetKey = key; pilsa(STAGE_GREET[st.id]); }

    currentNo = song.no;
    wirePlayer(song);
    wireHeroBar();
    const renderers = { 1: stageWords, 2: stageSentence, 3: stageDictation, 4: stageRecall };
    renderers[st.id](song, s, st);
  }

  /* 큰 재생 버튼 옆 진행 막대 */
  function wireHeroBar() {
    const a = $('#song-audio');
    const tr = $('#sh-track');
    if (!a || !tr) return;
    const upd = () => {
      if (!a.duration || isNaN(a.duration) || !$('#sh-fill')) return;
      $('#sh-fill').style.width = `${(a.currentTime / a.duration) * 100}%`;
      $('#sh-cur').textContent = fmt(a.currentTime);
      $('#sh-dur').textContent = fmt(a.duration);
    };
    a.addEventListener('timeupdate', upd);
    a.addEventListener('loadedmetadata', upd);
    const seekTo = (x) => { const r = tr.getBoundingClientRect(); if (a.duration) a.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * a.duration; };
    tr.addEventListener('click', (e) => seekTo(e.clientX));
    tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') a.currentTime += 5; if (e.key === 'ArrowLeft') a.currentTime -= 5; });
  }

  /* 단계를 끝내면 퀘스트 · 배지를 바로 새로 그리고 축하해요 */
  document.addEventListener('yem:stage-done', (e) => {
    if (!curPlay || !$('#quest') || e.detail.no !== curPlay.song.no) return;
    const { s, song, st } = curPlay;
    $('#quest').innerHTML = questHTML(s, song, st);
    const node = $$('#quest .qnode')[e.detail.stageId - 1];
    if (node) node.classList.add('celebrate');
    const md = $('#quest .medal');
    if (md) md.classList.add('celebrate');
    const tr = $('.track.active');
    if (tr) {
      const seg = tr.querySelector('.tr-seg');
      if (seg) seg.innerHTML = segsHTML(song.no);
      if (songStars(song.no) === STAGES.length) tr.classList.add('mastered');
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-go-activity]')) return;
    const act = $('#activity');
    if (act) act.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

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
  /* 배우기용 가사: 악보 표시(Tag …, 빈칸 ____, 괄호로만 된 줄)와 해석 없는 줄은 빼요 */
  const lineKey = (en) => String(en).toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  function isJunkLine(l) {
    const en = String(l[0] || '').trim();
    // 괄호가 한쪽만 있는 줄 = 앞줄에서 이어진 설명 (예: …원곡 가사 기준: The Lord has promised good to me)
    const unbalanced = (en.match(/\(/g) || []).length !== (en.match(/\)/g) || []).length;
    return !en || !String(l[1] || '').trim() || /^tag\b/i.test(en) || /_{3,}/.test(en) || /^\(.*\)$/.test(en) || unbalanced;
  }
  /* 해석 끝에 닫히지 않은 설명 괄호는 잘라요 (예: … (원곡 가사 기준: ) */
  const cleanKo = (ko) => String(ko || '').replace(/\s*\([^)]*$/, '').trim();
  /* 괄호 정리: (So~) 같은 소리는 빼고, (Your)처럼 가사 단어는 괄호만 빼요 */
  const cleanLyric = (en) => String(en).replace(/\((?:so|oh|ooh|oh oh|yeah|hey|whoa)[~!.\s]*\)\s*/gi, '').replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  /* 문장 배우기: 위 줄을 빼고, 같은 문장은 한 번만. [깔끔한 영어, 해석, 원래 줄(음성용)] */
  function lessonPairs(song) {
    const seen = new Set();
    return flatPairs(song).filter((l) => {
      if (isJunkLine(l)) return false;
      const k = lineKey(cleanLyric(l[0]));
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).map((l) => [cleanLyric(l[0]), cleanKo(l[1]), l[0]]);
  }

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
          <div><b class="now-title">${esc(song.title)}</b><small>${esc(song.ko)} · 아래 ▶ 버튼을 누르면 찬양이 시작돼요</small></div>
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
    const seen = new Set(); // 같은 줄은 한 번만 (번호 i는 음원 시간과 맞춰야 해서 그대로 셈)
    const body = secs.map((s) => {
      const rows = s.lines.filter((l) => l[0]).map((l) => {
          const i = idx++;
          const k = lineKey(cleanLyric(l[0]));
          if (isJunkLine(l) || seen.has(k)) return '';
          seen.add(k);
          const has = t && t[i] != null;
          return `
          <div class="lline" data-li="${i}">
            <span class="len">${wordSpans(cleanLyric(l[0]))}</span>
            ${l[1] ? `<span class="lko ${level === 'high' ? 'blur' : ''}">${esc(cleanKo(l[1]))}</span>` : '<span></span>'}
            <span class="lctl"><button type="button" class="spk" data-say-line="${i}" aria-label="이 줄을 원어민 음성으로 두 번 듣기">🔊</button></span>
          </div>`;
        }).join('');
      if (!rows.trim()) return '';
      return `
      <div class="lsec">
        ${s.label ? `<span class="lsec-label">${esc(s.label)}</span>` : ''}
        ${rows}
      </div>`;
    }).join('');
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

  /* 메모리 게임 짝 색깔 [바탕, 글자] */
  const PAIR_COLORS = [['#ffd6e0', '#b0154f'], ['#ffe6a8', '#8a5200'], ['#cdeec9', '#23692b'], ['#cfe6ff', '#1557a8'],
    ['#e3d8ff', '#53309f'], ['#ffd9c4', '#b13d10'], ['#c4eeea', '#00695f'], ['#f6d0f2', '#86207f']];
  /* 짝을 찾았을 때 '뾰로롱' (파일 없이 소리를 직접 만들어요) */
  let sparkCtx = null;
  function sparkle() {
    try {
      sparkCtx = sparkCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = sparkCtx.currentTime;
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
        const o = sparkCtx.createOscillator(), g = sparkCtx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        const t = t0 + i * 0.07;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.connect(g).connect(sparkCtx.destination);
        o.start(t); o.stop(t + 0.4);
      });
    } catch (e) { /* 소리를 못 내는 기기면 그냥 넘어가요 */ }
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

    /* 메모리 게임: 짝끼리 같은 색 (단어를 몰라도 색으로 찾을 수 있게)
       영어 카드 → 남자 목소리로 한 번 · 뜻 카드 → 그 영어 단어를 여자 목소리로 한 번
       짝을 찾으면 뾰로롱 + 여자 → 남자 두 번 */
    const pairs = song.words.slice(0, 8);
    const deck = shuffle(pairs.flatMap((w, i) => [{ k: i, label: w[0], en: w[0], t: 'en' }, { k: i, label: w[1], en: w[0], t: 'ko' }]));
    let open = [], moves = 0, matched = 0, lock = false;
    const mem = $('#memory');
    mem.innerHTML = deck.map((c, j) => `<button class="mem ${c.t === 'ko' ? 'ko' : ''}" data-j="${j}" style="--pc:${PAIR_COLORS[c.k % PAIR_COLORS.length][0]};--pc-ink:${PAIR_COLORS[c.k % PAIR_COLORS.length][1]}" aria-label="카드 ${j + 1}"><span class="mtxt" hidden>${esc(c.label)}</span>?</button>`).join('');
    const status = () => { $('#mem-status').textContent = `시도 ${moves}회 · 맞춘 짝 ${matched}/${pairs.length}`; };
    const say = (text, seq) => { if (window.TTS) TTS.speak(text, { seq }); else speakPlain(text); };
    status();
    mem.onclick = (e) => {
      const b = e.target.closest('.mem');
      if (!b || lock || b.classList.contains('open') || b.classList.contains('matched')) return;
      const c = deck[Number(b.dataset.j)];
      b.classList.add('open'); b.firstElementChild.hidden = false; b.lastChild.textContent = '';
      open.push({ b, c });
      const isMatch = open.length === 2 && open[0].c.k === open[1].c.k && open[0].c.t !== open[1].c.t;
      if (!isMatch) say(c.en, c.t === 'en' ? ['m'] : ['f']);
      if (open.length < 2) return;
      moves++; lock = true;
      const [x, y] = open;
      if (isMatch) {
        x.b.classList.replace('open', 'matched'); y.b.classList.replace('open', 'matched');
        matched++; open = []; lock = false; status();
        sparkle();
        setTimeout(() => say(x.c.en, ['f', 'm']), 450);
        if (matched === pairs.length) {
          memDone = true;
          $('#mem-status').textContent = isRead(song.no) ? `🎉 ${moves}회 만에 전부 맞혔어요!` : `🎉 ${moves}회 만에 전부 맞혔어요! ② 가사 읽기 단계도 끝내야 1주차가 완료돼요.`;
          tryStage1();
        }
      } else {
        setTimeout(() => {
          [x, y].forEach((o) => { o.b.classList.remove('open'); o.b.firstElementChild.hidden = true; o.b.lastChild.textContent = '?'; });
          open = []; lock = false;
        }, 1300); // 두 번째 카드 발음을 들을 시간
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
    const { set, wv, ym } = weekInfo();
    if (set && set.songs.includes(no) && set.songs.every((n) => progress['v:' + n]) && !progress['mv:' + ym]) {
      progress['mv:' + ym] = true; saveProgress(); addXp(30);
      pilsa('이번 달 말씀 4개를 모두 모았어요! 👑 왕관 보너스 +30 XP', 'big');
    } else if (wv && wv.no === no && !progress['wv:' + ym + ':' + wv.wk]) {
      progress['wv:' + ym + ':' + wv.wk] = true; saveProgress(); addXp(10);
      pilsa('이번 주 미션 클리어! 🎁 보너스 +10 XP', 'big');
    } else {
      pilsa('말씀을 외웠어요! 🙏 오늘도 하나님 말씀을 마음에 담았어요');
    }
  }

  /* 이번 주 · 이번 달 말씀 (홈 화면과 같은 규칙) */
  function weekInfo() {
    const cur = currentSetFor();
    const set = cur.set;
    const wv = window.ABOUT && ABOUT.weekVerse ? ABOUT.weekVerse(set) : null;
    const t = new Date();
    const ym = `${t.getFullYear()}-${t.getMonth() + 1}`;
    return { cur, set, wv, ym };
  }
  function verseCardsHTML(nos, c) {
    return nos.map((no) => {
      const v = verseOf(no);
      if (!v) return '';
      const songName = no === 0 ? '주기도문' : `#${no} ${songOf(no).title}`;
      return `<a class="card vcard" href="#verse/${no}" style="--c:${c.c}">
          <div class="vtop"><span class="tag">${esc(v.ref)}</span>${verseDone(no) ? '<span class="vdone">✓ 외움</span>' : '<span class="vxp">+20 XP</span>'}</div>
          <p class="ven">${esc(v.en)}</p>
          <p class="vko">${esc(v.ko)}</p>
          <p class="vref">— ${esc(v.refEn)} · ${esc(v.ref)}</p>
          <small>${esc(songName)}</small></a>`;
    }).join('');
  }
  function renderVerses() {
    const { cur, set, wv } = weekInfo();
    const groups = ALL_SETS.map((s) => {
      const c = conceptOf(s.id);
      const done = s.songs.filter((no) => verseDone(no)).length;
      return `<section class="section"><div class="section-head"><h2>${c.title}</h2><p>${s.name} · ${done}/${s.songs.length}</p></div><div class="grid vgrid">${verseCardsHTML(s.songs, c)}</div></section>`;
    }).join('');
    const allDone = VERSES.filter((v) => verseDone(v.no)).length;
    let hero = '';
    if (wv) {
      const wDone = verseDone(wv.no);
      const slots = set.songs.map((no, i) => `<li class="${verseDone(no) ? 'on' : ''} ${no === wv.no ? 'now' : ''}"><a href="#verse/${no}"><b>${i + 1}주</b><span>${verseDone(no) ? '✓' : no === wv.no ? 'NOW' : '?'}</span></a></li>`).join('');
      const mDone = set.songs.filter((no) => verseDone(no)).length;
      hero = `
      <section class="vw-hero">
        <p class="vw-kicker">THIS WEEK · ${cur.month}월 ${wv.wk}주차 암송 말씀</p>
        <p class="vw-en" lang="en">“${esc(wv.en)}”</p>
        <p class="vw-ref">${esc(wv.refEn)} · ${esc(wv.ref)}</p>
        <p class="vw-ko">${esc(wv.ko)}</p>
        <div class="vw-act">
          ${wDone ? `<span class="vw-clear">WEEK CLEAR ✓</span><a class="ghost" href="#verse/${wv.no}">한 번 더 연습하기</a>`
            : `<a class="hud-go" href="#verse/${wv.no}">이 말씀 외우기 ▶</a><span class="vw-reward">+20 XP · 이번 주 보너스 <b>+10 XP</b></span>`}
        </div>
        <div class="vw-month">
          <p><b>${cur.month}월 말씀 모으기 ${mDone}/${set.songs.length}</b><span>4개를 모두 모으면 👑 <b>+30 XP</b></span></p>
          <ol>${slots}</ol>
        </div>
      </section>`;
    }
    $('#app').innerHTML = `
      <section class="section-head" style="margin-top:0"><div><p class="sb-kicker">BIBLE VERSE</p><h1>말씀 암송</h1><p>듣고 → 빈칸 → 처음부터 외워 쓰기 순서예요. 지금까지 <b>${allDone}</b>개 외웠어요.</p></div></section>
      ${hero}
      <details class="vw-more">
        <summary><span class="vw-q"><b>${wv && verseDone(wv.no) ? '이번 주 말씀 완료! 더 외워 볼까요?' : '더 외워 보시겠어요?'}</b><small>다른 찬양의 말씀도 도전해요 · 한 구절마다 +20 XP</small></span><span class="vw-yes">네, 더 할래요!</span></summary>
        ${groups}
      </details>`;
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
        <div class="vfull-wrap"><textarea id="vfull" class="vfull" placeholder="말씀을 보지 않고 영어로 적어 보세요"></textarea><div class="red-stamp" id="vstamp" hidden aria-hidden="true"></div></div>
        <p class="vfull-auto">다 적고 잠깐 기다리면 저절로 채점해 줘요 ✍️</p>
        <div class="vmarks" id="vmarks" aria-live="polite"></div>
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
        if (ok === total) {
          fb.className = 'feedback ok'; fb.textContent = `🎉 ${total}/${total} 정답! 정말 잘했어요! 원어민 목소리로 한 번 더 들어 봐요.`;
          sparkle(); pilsa(['빈칸을 모두 맞혔어요! 최고예요 👏', '말씀이 마음에 쏙 들어왔어요 💛', '와! 하나도 안 틀렸어요 ✨'][Math.floor(Math.random() * 3)]);
          setTimeout(() => speakLine($('#ven'), v.en), 600);
        }
        else { fb.className = 'feedback bad'; fb.textContent = `${ok}/${total} 정답 · 빨간 칸을 다시 생각해 보세요`; }
        return;
      }
      if (e.target.closest('[data-vhint]')) {
        $('#vfull-fb').className = 'feedback';
        $('#vfull-fb').textContent = '힌트: ' + words.map((w) => w[0] + '_'.repeat(Math.max(0, w.replace(/[^A-Za-z]/g, '').length - 1))).join(' ');
        return;
      }
      if (e.target.closest('[data-vfull]')) { gradeFull(true); return; }
      if (e.target.closest('[data-vreveal]')) { $('#vfull-fb').className = 'feedback'; $('#vfull-fb').textContent = '정답: ' + v.en; }
    };

    /* 보지 않고 쓰기 채점: 순서대로 단어를 맞춰 보고 (철자 하나 틀린 건 '거의!'), 80% 이상이면 빨간 동그라미 */
    let lastGraded = '';
    function gradeFull(byButton) {
      const typed = $('#vfull').value;
      if (!typed.trim()) { if (byButton) { $('#vfull-fb').className = 'feedback bad'; $('#vfull-fb').textContent = '먼저 말씀을 적어 보세요'; } return; }
      if (!byButton && typed === lastGraded) return;
      lastGraded = typed;
      const want = words.map((w) => ({ raw: w, n: norm(w) })).filter((x) => x.n);
      const got = typed.split(/\s+/).map(norm).filter(Boolean);
      const marks = alignWords(want.map((x) => x.n), got);
      const score = marks.filter((m) => m !== 'miss').length; // 철자 한 글자 차이는 맞은 걸로 (따로 알려 줘요)
      const nears = marks.filter((m) => m === 'near').length;
      const ratio = want.length ? score / want.length : 0;
      const pct = Math.round(ratio * 100);
      $('#vmarks').innerHTML = want.map((x, i) => `<span class="vm ${marks[i]}">${esc(x.raw)}${marks[i] === 'near' ? '<small>거의!</small>' : ''}</span>`).join(' ');
      const fb = $('#vfull-fb');
      const stamp = $('#vstamp');
      if (ratio >= 0.8) {
        fb.className = 'feedback ok';
        fb.textContent = `🙏 ${pct}% 맞았어요! ${pct === 100 && !nears ? '완벽해요!' : pct === 100 ? `노란 단어 철자 ${nears}개만 고치면 완벽해요!` : '거의 다 외웠어요!'} 말씀을 마음에 새겼어요.`;
        stamp.hidden = false;
        stamp.innerHTML = `<svg viewBox="0 0 200 200"><path d="M100 18 C 150 16, 184 52, 182 100 C 180 150, 146 184, 98 182 C 48 180, 16 146, 18 98 C 20 54, 52 22, 106 20" /></svg><b>참 잘했어요!</b><small>${pct}%</small>`;
        stamp.classList.remove('draw'); void stamp.offsetWidth; stamp.classList.add('draw');
        sparkle();
        completeVerse(no);
        pilsa(['말씀을 다 외웠어요! 하나님이 기뻐하세요 🙏', '보지 않고 썼어요! 정말 대단해요 🌟', '말씀 챔피언이에요! 👑'][Math.floor(Math.random() * 3)]);
        setTimeout(() => speakLine($('#ven'), v.en), 900);
      } else {
        stamp.hidden = true;
        fb.className = 'feedback bad';
        fb.textContent = `${pct}% 맞았어요 · 빨간 단어를 다시 떠올려 보세요. 힌트를 봐도 괜찮아요!`;
      }
    }
    let autoT = null;
    $('#vfull').addEventListener('input', () => {
      clearTimeout(autoT);
      $('#vstamp').hidden = true;
      const n = $('#vfull').value.split(/\s+/).filter(Boolean).length;
      if (n >= Math.ceil(words.length * 0.6)) autoT = setTimeout(() => gradeFull(false), 1500);
    });
  }

  /* 단어 맞추기: 순서대로 가장 많이 맞는 짝을 찾아요 (철자 한 글자 차이는 'near') */
  function editDist(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[a.length][b.length];
  }
  function alignWords(want, got) {
    const sim = (a, b) => (a === b ? 2 : (a.length >= 4 && editDist(a, b) <= 1) ? 1 : 0);
    const n = want.length, m = got.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
      const s2 = sim(want[i], got[j]);
      dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1], s2 ? s2 + dp[i + 1][j + 1] : 0);
    }
    const out = new Array(n).fill('miss');
    let i = 0, j = 0;
    while (i < n && j < m) {
      const s2 = sim(want[i], got[j]);
      if (s2 && dp[i][j] === s2 + dp[i + 1][j + 1]) { out[i] = s2 === 2 ? 'ok' : 'near'; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return out;
  }

  /* ---------- 외부 모듈(practice.js)과 공유 ---------- */
  window.YEM = {
    route,
    $, $$, esc, norm, store, STAGES, songOf, setOf, setOfSong, conceptOf, flatPairs, lessonPairs, wordSpans, fmt, nextSong,
    flatLyrics, speakPlain, pilsa, markRead, isRead, completeStage, stageWords,
  };
  PRACTICE.init(window.YEM);
  LEARN.init(window.YEM);

  /* ---------- 시작 ---------- */
  loadStudent();
  renderTop();
  route();
  // 처음 들어올 때는 친구 선택 창을 띄우지 않아요 (위의 '친구 선택'을 누를 때만)
})();

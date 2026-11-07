/* 영어예배부 찬양 학습 — 앱 로직 (해시 라우팅, 4주차 단계, 연령 단계, 필사 캐릭터 팝업) */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '');
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const PILSA_COUNT = 125;

  /* ---------- 저장소 ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('yem.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yem.' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 무시 */ } },
  };
  let progress = store.get('progress', {});
  let xp = store.get('xp', 0);
  let level = store.get('level', 'kids');

  /* ---------- 데이터 헬퍼 ---------- */
  const ALL_SETS = [...SETS, { id: 'prayer', name: '마치는 찬양 · 주기도문', tag: 'PRAYER', songs: [0], color: '#FCD34D' }];
  const songOf = (no) => (no === 0 ? PRAYER : SONGS.find((s) => s.no === no));
  const mediaOf = (no) => (no === 0 ? MEDIA.prayer : MEDIA[String(no)]);
  const setOf = (id) => ALL_SETS.find((s) => s.id === id);
  const isDone = (no, st) => !!progress[`${no}:${st}`];
  const blanksFor = () => (level === 'kids' ? 1 : level === 'mid' ? 2 : 3);

  function nextSong(set, no) {
    const i = set.songs.indexOf(no);
    return i >= 0 && i < set.songs.length - 1 ? set.songs[i + 1] : null;
  }

  function setProgress(set) {
    const total = set.songs.length * STAGES.length;
    let d = 0;
    set.songs.forEach((no) => STAGES.forEach((st) => { if (isDone(no, st.id)) d++; }));
    return Math.round((d / total) * 100);
  }

  /* 완료 처리: 단계 완료 시 XP, 곡의 4단계가 모두 끝나면 완주 보너스 */
  function completeStage(no, stageId) {
    const key = `${no}:${stageId}`;
    if (progress[key]) return;
    progress[key] = true;
    store.set('progress', progress);
    addXp(10);
    const songDone = STAGES.every((st) => progress[`${no}:${st.id}`]);
    if (songDone && !progress[`${no}:complete`]) {
      progress[`${no}:complete`] = true;
      store.set('progress', progress);
      addXp(50);
      pilsa('🎉 곡 완주! 이 찬양을 마음에 새겼어요', 'big');
    } else {
      pilsa(['좋아요! 한 단계 클리어 ✨', '완벽해요! 🙌', '잘하고 있어요! 💪'][Math.floor(Math.random() * 3)]);
    }
  }

  function addXp(n) {
    xp += n;
    store.set('xp', xp);
    renderXp();
  }

  function renderXp() { $('#xp').textContent = `⭐ ${xp} XP`; }

  function renderLevels() {
    $('#levels').innerHTML = LEVELS.map((l) => `<button data-level="${l.id}" class="${l.id === level ? 'on' : ''}" title="${esc(l.hint)}">${l.name}</button>`).join('');
  }

  $('#levels').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-level]');
    if (!b) return;
    level = b.dataset.level;
    store.set('level', level);
    renderLevels();
    route();
  });

  /* ---------- 필사 캐릭터 팝업 ---------- */
  let pilsaTimer = null;
  function pilsa(msg, mood) {
    const layer = $('#pilsa-layer');
    const n = String(1 + Math.floor(Math.random() * PILSA_COUNT)).padStart(3, '0');
    layer.innerHTML = `<div class="pilsa-pop${mood === 'big' ? ' big' : ''}"><img src="assets/pilsa/pilsa_${n}.png" alt="필사 캐릭터"><div class="bubble">${esc(msg)}</div></div>`;
    const el = layer.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    clearTimeout(pilsaTimer);
    pilsaTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { if (layer.contains(el)) layer.innerHTML = ''; }, 500);
    }, mood === 'big' ? 4200 : 2600);
  }

  const STAGE_GREET = {
    1: '단어부터 가볍게! 카드를 뒤집어 볼까요? 🔤',
    2: '문장을 조립해 볼게요. 어순을 생각해 보세요 🧩',
    3: '찬양을 들으며 빈칸을 채워 봐요 🎧',
    4: '이제 외워서 불러 볼 시간이에요. 묵상도 함께 🙏',
  };

  /* ---------- 발음 (브라우저 내장 음성) ---------- */
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  /* ---------- 라우팅 ---------- */
  function route() {
    const parts = (location.hash || '#home').replace(/^#\/?/, '').split('/');
    if (parts[0] === 'set') renderSet(parts[1]);
    else if (parts[0] === 'play') renderPlay(parts[1], Number(parts[2]), Number(parts[3]));
    else renderHome();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  window.addEventListener('hashchange', route);

  /* ---------- 홈 ---------- */
  function renderHome() {
    const flow = STAGES.map((st) => `
      <div class="card"><span class="num">${st.week.toUpperCase()}</span><div class="ico">${st.icon}</div><h3>${st.name}</h3><p>${st.desc}</p></div>`).join('');
    const sets = ALL_SETS.map((s) => {
      const p = setProgress(s);
      const list = s.songs.map((no) => `<li>${esc(songOf(no).title)}</li>`).join('');
      return `<a class="card set-card" href="#set/${s.id}" style="--c:${s.color}">
        <div class="set-top"><span class="tag">${s.tag}</span><span class="pct">${p}%</span></div>
        <h3>${s.name}</h3><ul>${list}</ul>
        <div class="bar"><i style="width:${p}%"></i></div></a>`;
    }).join('');
    $('#app').innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">English Worship · 찬양으로 배우는 영어</span>
          <h1>노래하며 익히고,<br><span class="grad">마음에 새기는</span> 찬양 학습</h1>
          <p>단어 → 문장 → 듣기 → 암송. 한 묶음 4곡을 4주 동안 단계별로 배우면서 영어와 말씀을 함께 붙잡아요.</p>
          <div class="hero-stats">
            <div><b>22</b><span>곡 + 주기도문</span></div>
            <div><b>4</b><span>주차 단계</span></div>
            <div><b>3</b><span>연령 단계</span></div>
          </div>
          <div class="row"><a class="btn primary" href="#set/aug">8월 묶음부터 시작 →</a><a class="btn" href="#set/prayer">주기도문 열기</a></div>
        </div>
        <div class="hero-art"><div class="orb"></div><img src="assets/pilsa/pilsa_002.png" alt="필사 캐릭터"></div>
      </section>
      <section class="section">
        <div class="section-head"><h2>이렇게 배워요</h2><p>매주 같은 묶음의 4곡을 다른 방식으로 깊이 파고들어요</p></div>
        <div class="flow">${flow}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2>월별 묶음</h2><p>한 묶음 = 찬양 4곡 · 4주 학습 · 보너스 성탄곡 2곡</p></div>
        <div class="grid sets">${sets}</div>
      </section>`;
  }

  /* ---------- 묶음 페이지 ---------- */
  function renderSet(id) {
    const s = setOf(id);
    if (!s) { location.hash = '#home'; return; }
    const songs = s.songs.map(songOf);
    const weeks = STAGES.map((st) => {
      const done = s.songs.filter((no) => isDone(no, st.id)).length;
      const pct = Math.round((done / s.songs.length) * 100);
      const chips = songs.map((x) => `<span class="chip ${isDone(x.no, st.id) ? 'on' : ''}">${x.no === 0 ? '주기도문' : '#' + x.no}</span>`).join('');
      return `<a class="card week-card" href="#play/${s.id}/${st.id}/${s.songs[0]}" style="--c:${s.color}">
        <div class="week-top"><span class="week-no">${st.week}</span><span class="week-ico">${st.icon}</span></div>
        <h3>${st.name}</h3><p>${st.desc}</p>
        <div class="chips">${chips}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <small>${done}/${s.songs.length} 곡 완료</small></a>`;
    }).join('');
    const list = songs.map((x) => `<li><b>${x.no === 0 ? '' : x.no + '.'}</b>${esc(x.title)}<span>${esc(x.ko)}</span></li>`).join('');
    $('#app').innerHTML = `
      <section class="set-head">
        <a href="#home" class="back">← 전체 묶음</a>
        <span class="tag" style="--c:${s.color}">${s.tag}</span>
        <h1>${s.name}</h1>
        <ol class="song-list">${list}</ol>
      </section>
      <section class="weeks">${weeks}</section>`;
  }

  /* ---------- 학습 페이지 ---------- */
  let lastGreetKey = '';
  function renderPlay(setId, stageId, no) {
    const s = setOf(setId);
    const st = STAGES.find((x) => x.id === stageId);
    if (!s || !st) { location.hash = '#home'; return; }
    const song = songOf(no) || songOf(s.songs[0]);
    const tabs = s.songs.map((n) => {
      const x = songOf(n);
      return `<a class="tab ${n === song.no ? 'active' : ''}" href="#play/${s.id}/${st.id}/${n}">${n === 0 ? '주기도문' : '#' + n + ' ' + esc(x.title)}${isDone(n, st.id) ? ' ✓' : ''}</a>`;
    }).join('');
    const stageTabs = STAGES.map((x) => `<a class="stage-tab ${x.id === st.id ? 'active' : ''}" href="#play/${s.id}/${x.id}/${song.no}">${x.week} · ${x.name}</a>`).join('');
    const nxt = nextSong(s, song.no);
    const foot = nxt !== null
      ? `<a class="btn primary" href="#play/${s.id}/${st.id}/${nxt}">다음 곡 →</a>`
      : (STAGES[st.id] ? `<a class="btn primary" href="#play/${s.id}/${st.id + 1}/${s.songs[0]}">다음 주차 →</a>` : `<a class="btn primary" href="#set/${s.id}">묶음으로 돌아가기</a>`);

    $('#app').innerHTML = `
      <section class="play-head">
        <a class="back" href="#set/${s.id}">← ${esc(s.name)}</a>
        <h1>${esc(song.title)}<span>${esc(song.ko)} · ${st.week} ${st.name}</span></h1>
        <div class="tabs">${tabs}</div>
        <div class="stage-tabs">${stageTabs}</div>
      </section>
      ${playerHTML(song)}
      <section class="card activity" id="activity"></section>
      <div class="play-foot"><a class="back" href="#set/${s.id}">← 묶음 목록</a>${foot}</div>`;

    const key = `${setId}/${stageId}/${no}`;
    if (lastGreetKey !== key) { lastGreetKey = key; pilsa(STAGE_GREET[st.id]); }

    wirePlayer();
    const renderers = { 1: stageWords, 2: stageSentence, 3: stageDictation, 4: stageRecall };
    renderers[st.id](song, s, st);
  }

  function playerHTML(song) {
    const src = window.AUDIO_ENABLED ? mediaOf(song.no) : null;
    const isPrayer = song.no === 0;
    return `
      <section class="card player">
        <div class="player-info"><span class="faith-badge">🙏 오늘의 말씀</span><p>${esc(song.faith)}</p></div>
        ${src ? `<audio id="song-audio" controls preload="none" src="${encodeURI(src)}"></audio>` : '<p class="ph">🎵 음원은 준비 중이에요. 아래 가사를 보며 따라 읽고 외워 보세요.</p>'}
        ${src ? `<div class="speed">
          <small>재생 속도</small>
          ${[0.75, 1, 1.25].map((r) => `<button class="ghost ${r === 1 ? 'on' : ''}" data-rate="${r}">${r}x</button>`).join('')}
          <button class="ghost" data-seek="-5">⏪ 5초</button>
          <button class="ghost" data-seek="5">5초 ⏩</button>
          ${isPrayer ? '' : '<small style="margin-left:auto">이 곡은 원본 영상에서 음원을 재생합니다</small>'}
        </div>` : ''}
      </section>`;
  }

  function wirePlayer() {
    const a = $('#song-audio');
    const wrap = document.querySelector('.player .speed');
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || !a) return;
      if (b.dataset.rate) {
        a.playbackRate = Number(b.dataset.rate);
        wrap.querySelectorAll('[data-rate]').forEach((x) => x.classList.toggle('on', x === b));
      }
      if (b.dataset.seek) a.currentTime = Math.max(0, a.currentTime + Number(b.dataset.seek));
    });
  }

  /* ===== 1주차 준비 · 전체 가사 먼저 읽기 ===== */
  const isRead = (no) => !!progress[`${no}:read`];
  function markRead(no) {
    if (progress[`${no}:read`]) return;
    progress[`${no}:read`] = true;
    store.set('progress', progress);
    pilsa('가사를 읽었어요! 이제 단어를 하나씩 익혀 볼까요? 🎵');
  }

  function lyricsPanel(song) {
    const secs = ((window.LYRICS || {})[song.no] || [{ label: '', lines: song.lines }])
      .filter((s) => s.lines.some((l) => l[0]));
    const read = isRead(song.no);
    const body = secs.map((s) => `
      <div class="lsec">
        ${s.label ? `<span class="lsec-label">${esc(s.label)}</span>` : ''}
        ${s.lines.filter((l) => l[0]).map((l) => `
          <div class="lline">
            <span class="len">${esc(l[0])}</span>
            ${l[1] ? `<span class="lko ${level === 'high' ? 'blur' : ''}">${esc(l[1])}</span>` : ''}
            <i class="spk" data-say="${esc(l[0])}" title="이 줄 발음 듣기">🔊</i>
          </div>`).join('')}
      </div>`).join('');
    return `
      <div class="lyrics-first">
        <div class="act-head"><span class="kicker">준비 · 가사 먼저 읽기</span><h2>${esc(song.title)} 전체 가사</h2>
          <p>단어를 배우기 전에 노래 가사를 처음부터 끝까지 읽어 보세요.${level === 'high' ? ' 뜻은 줄을 눌러 확인해요.' : ' 줄마다 🔊로 발음도 들을 수 있어요.'}</p></div>
        <div class="lyrics-box">${body}</div>
        <div class="row"><button class="btn primary" data-read ${read ? 'disabled' : ''}>${read ? '✔ 가사를 읽었어요' : '가사를 한 번 읽었어요'}</button></div>
      </div>`;
  }

  /* ===== 1주차 · 단어 파워 ===== */
  function stageWords(song, set, st) {
    const el = $('#activity');
    const cards = song.words.map((w, i) => `
      <button class="flip" data-i="${i}" aria-label="${esc(w[0])} 뒤집기">
        <span class="flip-in">
          <span class="face front"><em>${w[2]}</em><b>${esc(w[0])}</b>${level === 'kids' ? `<small>${esc(w[1])}</small>` : ''}<i class="spk" data-say="${esc(w[0])}" title="발음 듣기">🔊</i></span>
          <span class="face back"><b>${esc(w[1])}</b><small>${esc(w[0])}</small></span>
        </span>
      </button>`).join('');
    el.innerHTML = `
      ${lyricsPanel(song)}
      <div class="divider"></div>
      <div class="act-head"><span class="kicker">${st.week} · ${st.name}</span><h2>핵심 단어 ${song.words.length}개</h2><p>카드를 눌러 뜻을 확인하고, 🔊로 발음을 들어요.</p></div>
      <div class="flip-grid">${cards}</div>
      <div class="divider"></div>
      <div class="act-head"><span class="kicker">미니 게임</span><h2>단어 메모리 게임</h2><p>영어 카드와 뜻 카드를 짝 맞춰 보세요. 모든 짝을 맞추면 이 곡의 1주차가 완료돼요.</p></div>
      <div class="memory" id="memory"></div>
      <div class="mem-status" id="mem-status"></div>`;

    /* 1주차 완료 조건: 가사 읽기 + 메모리 게임 전부 맞히기 */
    let memDone = false;
    const tryStage1 = () => {
      if (memDone && isRead(song.no)) {
        completeStage(song.no, st.id);
        $('#mem-status').textContent = '🎉 1주차 완료! 가사를 읽고 단어까지 모두 익혔어요.';
      }
    };

    el.onclick = (e) => {
      const say = e.target.closest('[data-say]');
      if (say) { e.stopPropagation(); speak(say.dataset.say); return; }
      if (e.target.closest('[data-read]')) { markRead(song.no); tryStage1(); const b = el.querySelector('[data-read]'); if (b) { b.disabled = true; b.textContent = '✔ 가사를 읽었어요'; } return; }
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
        const en = x.c.t === 'en' ? x.c.label : y.c.label;
        speak(en);
        if (matched === pairs.length) {
          status();
          memDone = true;
          $('#mem-status').textContent = isRead(song.no)
            ? `🎉 ${moves}회 만에 전부 맞혔어요!`
            : `🎉 ${moves}회 만에 전부 맞혔어요! 위의 가사 읽기 버튼도 눌러 주세요.`;
          tryStage1();
        }
      } else {
        setTimeout(() => {
          [x, y].forEach((o) => { o.b.classList.remove('open'); o.b.firstElementChild.hidden = true; o.b.lastChild.textContent = '?'; });
          open = []; lock = false;
        }, 800);
      }
    };
    // 완료 상태 표시
    if (isDone(song.no, 1)) $('#mem-status').textContent = '✅ 이 곡의 1주차를 완료했어요. 다시 맞혀 복습할 수 있어요.';
  }

  /* ===== 2주차 · 문장 조립 ===== */
  function stageSentence(song, set, st) {
    const el = $('#activity');
    const lines = song.lines;
    let idx = 0, pool = [], picked = [], showKo = level === 'kids';

    if (isDone(song.no, st.id)) {
      el.innerHTML = `<div class="done-banner">✅ 2주차 문장 조립 완료 <button class="ghost sm" id="redo">다시 연습</button></div>`;
      $('#redo').onclick = () => { progress[`${song.no}:2`] = false; store.set('progress', progress); stageSentence(song, set, st); };
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
        <div class="row"><button class="ghost" data-reset>다시</button><button class="btn primary" data-check ${picked.length ? '' : 'disabled'}>확인</button>${level === 'high' ? '' : '<button class="ghost" data-speak>🔊 듣기</button>'}</div>
        <div class="feedback" id="fb"></div>`;
    };

    setup(); draw();

    el.onclick = (e) => {
      const t = e.target;
      const ko = t.closest('[data-ko]');
      if (ko) { showKo = true; draw(); return; }
      const sp = t.closest('[data-speak]');
      if (sp) { speak(lines[idx][0]); return; }
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
          speak(lines[idx][0]);
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
      <div class="row"><button class="btn primary" data-grade>채점하기</button><button class="ghost" data-reveal>정답 보기</button></div>
      <div class="feedback" id="fb"></div>`;

    const inputs = () => [...el.querySelectorAll('input[data-ans]')];
    const grade = () => {
      let ok = 0;
      inputs().forEach((inp) => {
        const good = norm(inp.value) === inp.dataset.ans && inp.value.trim() !== '';
        inp.classList.toggle('ok', good);
        inp.classList.toggle('bad', !good);
        if (good) ok++;
        else inp.title = '정답: ' + inp.dataset.full;
      });
      const total = inputs().length;
      const fb = $('#fb');
      if (ok === total) {
        fb.className = 'feedback ok';
        fb.textContent = `🎧 완벽해요! ${total}/${total} 정답`;
        completeStage(song.no, st.id);
      } else {
        fb.className = 'feedback bad';
        fb.textContent = `${ok}/${total} 정답 · 빨간 칸을 다시 들어 보세요 (칸에 마우스를 올리면 정답이 보여요)`;
      }
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
      const list = inputs();
      const i = list.indexOf(e.target);
      if (i >= 0 && i < list.length - 1) list[i + 1].focus(); else grade();
    };
  }

  /* ===== 4주차 · 암송 & 묵상 ===== */
  function stageRecall(song, set, st) {
    const el = $('#activity');
    const note = store.get('note:' + song.no, '');
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
      <div class="row"><button class="btn primary" data-recall>암송 체크</button></div>
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
        const have = input.value.split(/\s+/).map(norm).filter(Boolean);
        const pool = [...have];
        let hit = 0;
        want.forEach((w) => { const j = pool.indexOf(w); if (j >= 0) { hit++; pool.splice(j, 1); } });
        const ratio = want.length ? hit / want.length : 0;
        const ok = ratio >= 0.8;
        row.classList.toggle('pass', ok);
        row.classList.toggle('fail', !ok);
        row.querySelector('.rres').textContent = ok ? '✔ 통과' : `정답: ${en}`;
        if (ok) pass++;
      });
      const fb = $('#fb');
      const curNote = (el.querySelector('#note').value || '').trim();
      if (pass === song.lines.length) {
        recallDone.v = true;
        fb.className = 'feedback ok';
        fb.textContent = curNote
          ? '🙏 전부 외웠어요! 완료 처리됩니다.'
          : '🙏 전부 외웠어요! 묵상을 한 줄 적고 저장하면 4주차가 완료돼요.';
        if (curNote) finishRecall(curNote);
      } else {
        fb.className = 'feedback bad';
        fb.textContent = `${pass}/${song.lines.length} 통과 · 빨간 줄의 정답을 확인하고 다시 적어 보세요`;
      }
    };

    const finishRecall = (text) => {
      store.set('note:' + song.no, text);
      if (recallDone.v) completeStage(song.no, st.id);
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
        store.set('note:' + song.no, text);
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
      banner.querySelector('[data-again]').onclick = () => { banner.remove(); };
    }
  }

  /* ---------- 시작 ---------- */
  renderLevels();
  renderXp();
  route();
})();

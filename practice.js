/* 찬양 연습 흐름: ① 준비 → ② 가사 읽기 → ③ 핵심 단어(클래스 카드) → ④ 암송·묵상
   app.js의 YEM 도구를 사용합니다. 이 파일은 app.js보다 먼저 로드됩니다. */
window.PRACTICE = (() => {
  let Y = null;
  let deck = { song: null, idx: 0, known: new Set() };
  let rd = { mode: 'normal', timer: null, cur: -1, recs: {}, recorder: null, chunks: [] };

  const STEP_NAMES = [
    { id: 1, label: '① 곡 듣기' },
    { id: 2, label: '② 가사 읽기' },
    { id: 3, label: '③ 핵심 단어' },
    { id: 4, label: '④ 암송 · 묵상' },
  ];

  /* ---------- 단계 표시 ---------- */
  function stepper(setId, no, current) {
    return `<nav class="steps" aria-label="연습 단계">${STEP_NAMES.map((s) => {
      const href = s.id === 1 ? `#listen/${setId}/${no}` : s.id === 2 ? `#practice/${setId}/${no}/2` : s.id === 3 ? `#practice/${setId}/${no}/3` : `#play/${setId}/4/${no}`;
      return `<a class="step ${s.id === current ? 'on' : ''} ${s.id < current ? 'done' : ''}" href="${href}">${s.label}</a>`;
    }).join('')}</nav>`;
  }

  /* ---------- ① 준비 (게이트) ---------- */
  function renderReady(setId, no) {
    const song = Y.songOf(no); const s = Y.setOf(setId) || Y.setOfSong(no); const c = Y.conceptOf(s.id);
    Y.$('#app').innerHTML = `
      <section class="play-head" style="--c:${c.c}"><a class="back" href="#listen/${s.id}/${no}">← 곡 듣기로</a></section>
      ${stepper(s.id, no, 1)}
      <section class="card ready">
        <img src="assets/bg/bunny-mic.png" alt="">
        <h1>${no === 0 ? '' : '#' + no + ' '}${Y.esc(song.title)}</h1>
        <p>${Y.esc(song.ko)}</p>
        <button class="ready-btn" id="ready-btn">준비 됐나요? 🙋</button>
        <p class="ph">누르면 찬양 연습을 시작해요.</p>
      </section>
      <div class="praise" id="praise" hidden>Praise the Lord! 🎶</div>`;
    Y.$('#ready-btn').onclick = () => {
      const p = Y.$('#praise'); p.hidden = false; p.classList.add('show');
      Y.speakPlain('Praise the Lord!');
      setTimeout(() => { location.hash = `#practice/${s.id}/${no}/2`; }, 1400);
    };
  }

  /* ---------- ② 가사 읽기 ---------- */
  const MODES = [
    { id: 'normal', label: '🔊 빠르게', rate: 0.95, vol: 1 },
    { id: 'slow', label: '🐢 천천히', rate: 0.55, vol: 1 },
    { id: 'follow', label: '🎤 따라 읽기', rate: 0.85, vol: 0.2 },
  ];

  function clearFollow() { clearTimeout(rd.timer); rd.timer = null; rd.cur = -1; if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  /* 한 줄을 읽으며 지금 읽는 단어 표시 */
  function speakLine(lineEl, text, rate, vol, onEnd) {
    if (!('speechSynthesis' in window) || !lineEl) { if (onEnd) onEnd(); return; }
    speechSynthesis.cancel();
    const words = Y.$$('.w', lineEl);
    const toks = text.split(/\s+/);
    const starts = []; let pos = 0;
    toks.forEach((w) => { const i = text.indexOf(w, pos); starts.push(i); pos = i + w.length; });
    const setOn = (k) => words.forEach((w, j) => w.classList.toggle('on', j === k));
    lineEl.classList.add('speaking');
    let gotB = false; const timers = [];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate; u.volume = vol;
    u.onboundary = (e) => {
      if (e.name !== 'word') return; gotB = true;
      setOn(starts.findIndex((s, j) => e.charIndex >= s && (j === starts.length - 1 || e.charIndex < starts[j + 1])));
    };
    const done = () => { timers.forEach(clearTimeout); setOn(-1); lineEl.classList.remove('speaking'); if (onEnd) onEnd(); };
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
    const total = toks.reduce((n, w) => n + w.length + 1, 0);
    const dur = Math.max(1000, total * 75 / rate);
    let acc = 0;
    toks.forEach((w, k) => { timers.push(setTimeout(() => { if (!gotB) setOn(k); }, (acc / total) * dur + 120)); acc += w.length + 1; });
  }

  function setMode(m) {
    rd.mode = m; Y.store.set('readMode', m); clearFollow();
    Y.$$('[data-lmode]').forEach((b) => b.classList.toggle('on', b.dataset.lmode === m));
    Y.$$('.pl.cursor').forEach((x) => x.classList.remove('cursor'));
    const fb = Y.$('#follow-btn'); if (fb) fb.hidden = m !== 'follow';
  }

  function followNext(lines) {
    if (rd.cur + 1 >= lines.length) { stopFollow(); return; }
    rd.cur++;
    const el = Y.$(`.pl[data-i="${rd.cur}"]`);
    Y.$$('.pl.cursor').forEach((x) => x.classList.remove('cursor'));
    el.classList.add('cursor');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const m = MODES[2];
    speakLine(el, lines[rd.cur], m.rate, m.vol, () => {
      const words = lines[rd.cur].split(/\s+/).length;
      rd.timer = setTimeout(() => followNext(lines), Math.max(2500, words * 650)); // 따라 말할 시간
    });
  }
  function stopFollow() { clearFollow(); Y.$$('.pl.cursor').forEach((x) => x.classList.remove('cursor')); const b = Y.$('#follow-btn'); if (b) b.textContent = '▶ 따라 읽기 시작'; rd.running = false; }

  function renderLyrics(setId, no) {
    const song = Y.songOf(no); const s = Y.setOf(setId) || Y.setOfSong(no); const c = Y.conceptOf(s.id);
    const pairs = Y.flatPairs(song);
    rd.mode = Y.store.get('readMode', 'normal');
    rd.song = song; rd.pairs = pairs; rd.setId = s.id; rd.no = no;
    const keyMeaning = (tok) => { const w = song.words.find((x) => Y.norm(x[0]) === Y.norm(tok)); return w ? `${w[0]} = ${w[1]}` : ''; };
    const rows = pairs.map((p, i) => {
      const words = p[0].split(/\s+/).filter(Boolean).map((w, k) => {
        const m = keyMeaning(w);
        return `<span class="w" data-wi="${k}"${m ? ` title="${Y.esc(m)}"` : ''}>${Y.esc(w)}</span>`;
      }).join(' ');
      return `<div class="pl" data-i="${i}">
        <span class="pl-n">${i + 1}</span>
        <div class="pl-t"><div class="pl-en">${words}</div><div class="pl-ko">${Y.esc(p[1])}</div><div class="pl-fb" data-fb="${i}"></div></div>
        <div class="pl-ctl">
          <button type="button" class="spk" data-lsay="${i}" aria-label="이 줄 듣기">🔊</button>
          <button type="button" class="tool" data-lrec="${i}" aria-label="내 목소리 녹음">🎙️</button>
          <button type="button" class="tool" data-lmine="${i}" aria-label="내 목소리 듣기" ${rd.recs[i] ? '' : 'disabled'}>▶</button>
          <button type="button" class="tool" data-lcheck="${i}" aria-label="발음 확인">🗣️</button>
        </div></div>`;
    }).join('');
    Y.$('#activity').innerHTML = `
      <div class="act-head"><span class="kicker">② 가사 읽기</span><h2>${Y.esc(song.title)} 가사 읽기</h2>
        <p>가사에 마우스를 올리면 핵심 단어 뜻이 보여요. 🔊 · 🎙️녹음 · 🗣️발음 확인을 쓸 수 있어요.</p></div>
      <div class="modes">
        ${MODES.map((m) => `<button class="mode ${m.id === rd.mode ? 'on' : ''}" data-lmode="${m.id}">${m.label}</button>`).join('')}
        <button class="btn sm" id="follow-btn" data-lfollow ${rd.mode === 'follow' ? '' : 'hidden'}>▶ 따라 읽기 시작</button>
      </div>
      <p class="ph" id="rec-note">녹음은 이 화면을 떠나면 사라져요. 발음 확인은 Chrome 같은 브라우저에서 작동해요.</p>
      <div class="lyrics-box pl-box" id="pl-box">${rows}</div>
      <div class="row"><a class="btn" href="#practice/${s.id}/${no}/3" data-lnext>가사 다 읽었어요 → ③ 핵심 단어</a></div>`;
    Y.$('#activity').style.setProperty('--c', c.c);
  }

  /* 녹음 */
  async function toggleRecord(i, btn) {
    if (rd.recorder && rd.recorder.state === 'recording') { rd.recorder.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { Y.$('#rec-note').textContent = '이 브라우저에서는 녹음을 지원하지 않아요.'; return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      rd.chunks = [];
      const r = new MediaRecorder(stream);
      rd.recorder = r;
      r.ondataavailable = (e) => rd.chunks.push(e.data);
      r.onstop = () => {
        rd.recs[i] = URL.createObjectURL(new Blob(rd.chunks, { type: r.mimeType || 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
        btn.textContent = '🎙️'; btn.classList.remove('rec');
        const mine = Y.$(`[data-lmine="${i}"]`); if (mine) mine.disabled = false;
      };
      r.start();
      btn.textContent = '⏹'; btn.classList.add('rec');
      setTimeout(() => { if (r.state === 'recording') r.stop(); }, 12000);
    } catch (e) { Y.$('#rec-note').textContent = '마이크 사용을 허용해 주세요.'; }
  }

  /* 발음 확인: 말한 내용을 줄의 단어와 비교 */
  function checkPronunciation(i) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const fb = Y.$(`[data-fb="${i}"]`);
    if (!SR) { fb.textContent = '이 브라우저는 발음 확인을 지원하지 않아요. Chrome에서 열어 주세요.'; return; }
    const text = rd.pairs[i][0];
    const want = text.split(/\s+/).map(Y.norm).filter(Boolean);
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    fb.textContent = '🎤 말해 보세요…';
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript.split(/\s+/).map(Y.norm).filter(Boolean);
      const pool = [...said]; let hit = 0;
      const marks = text.split(/\s+/).map((w) => {
        const n = Y.norm(w); const j = pool.indexOf(n);
        if (n && j >= 0) { pool.splice(j, 1); hit++; return true; }
        return false;
      });
      Y.$$(`.pl[data-i="${i}"] .w`).forEach((el, k) => { el.classList.toggle('ok', !!marks[k]); el.classList.toggle('miss', !marks[k]); });
      const score = want.length ? Math.round((hit / want.length) * 100) : 0;
      fb.innerHTML = `발음 점수 <b>${score}점</b> · 들린 말: “${Y.esc(e.results[0][0].transcript)}”`;
      if (score >= 80) Y.pilsa('발음이 아주 좋아요! 🎉');
    };
    rec.onerror = () => { fb.textContent = '소리를 듣지 못했어요. 다시 눌러 주세요.'; };
    rec.start();
  }

  function bindLyrics(el) {
    el.onclick = (e) => {
      const t = e.target;
      const m = t.closest('[data-lmode]'); if (m) { setMode(m.dataset.lmode); return; }
      if (t.closest('[data-lfollow]')) {
        if (rd.running) { stopFollow(); return; }
        rd.running = true; rd.cur = -1; t.closest('[data-lfollow]').textContent = '⏹ 멈추기';
        followNext(rd.pairs.map((p) => p[0]));
        return;
      }
      const say = t.closest('[data-lsay]');
      if (say) {
        const i = Number(say.dataset.lsay); const mode = MODES.find((x) => x.id === rd.mode) || MODES[0];
        clearFollow();
        Y.$$('.pl.cursor').forEach((x) => x.classList.remove('cursor'));
        speakLine(Y.$(`.pl[data-i="${i}"]`), rd.pairs[i][0], mode.rate, mode.vol, null);
        return;
      }
      const rec = t.closest('[data-lrec]'); if (rec) { toggleRecord(Number(rec.dataset.lrec), rec); return; }
      const mine = t.closest('[data-lmine]');
      if (mine) { const url = rd.recs[Number(mine.dataset.lmine)]; if (url) new Audio(url).play(); return; }
      const chk = t.closest('[data-lcheck]'); if (chk) { checkPronunciation(Number(chk.dataset.lcheck)); return; }
      if (t.closest('[data-lnext]')) { Y.markRead(rd.no); }
    };
  }

  /* ---------- ③ 핵심 단어: 클래스 카드 ---------- */
  function deckHTML(song) {
    const cards = song.words.map((w, i) => `
      <div class="cc" data-cc="${i}">
        <div class="cc-in">
          <div class="cc-face cc-front"><span class="cc-em">${w[2]}</span><b>${Y.esc(w[0])}</b><small>카드를 눌러 뜻 보기</small>
            <button type="button" class="spk cc-say" data-cc-say="${Y.esc(w[0])}" aria-label="발음 듣기">🔊</button></div>
          <div class="cc-face cc-back"><b>${Y.esc(w[1])}</b><small>${Y.esc(w[0])}</small></div>
        </div></div>`).join('');
    return `
      <div class="cc-wrap" id="cc-wrap">
        <div class="cc-top"><span class="kicker">핵심 단어 카드</span><span class="cc-count" id="cc-count"></span></div>
        <div class="cc-stage">${cards}</div>
        <div class="cc-bar"><i id="cc-bar"></i></div>
        <div class="cc-ctrl">
          <button class="ghost" data-cc-prev>← 이전</button>
          <button class="ghost" data-cc-again>↺ 다시</button>
          <button class="btn alt" data-cc-known>✓ 알아요</button>
          <button class="ghost" data-cc-next>다음 →</button>
        </div>
        <p class="ph">← → 키로 넘기고, 스페이스로 뒤집을 수 있어요</p>
      </div>`;
  }
  function paintDeck() {
    const song = deck.song; if (!song) return;
    Y.$$('.cc').forEach((c, i) => { c.classList.toggle('active', i === deck.idx); if (i !== deck.idx) c.classList.remove('flipped'); c.classList.toggle('known', deck.known.has(i)); });
    const n = song.words.length;
    const cnt = Y.$('#cc-count'); if (cnt) cnt.textContent = `${deck.idx + 1} / ${n} · 아는 단어 ${deck.known.size}개`;
    const bar = Y.$('#cc-bar'); if (bar) bar.style.width = `${(deck.known.size / n) * 100}%`;
  }
  function bindDeck(song) { deck = { song, idx: 0, known: new Set() }; paintDeck(); }
  function deckKnownAll() { return !!deck.song && deck.known.size >= deck.song.words.length; }

  /* ---------- 공용 클릭 처리 (app.js의 단어 단계 화면에서 호출) ---------- */
  function handleClick(e) {
    const t = e.target;
    const say = t.closest('[data-cc-say]'); if (say) { e.stopPropagation(); Y.speakPlain(say.dataset.ccSay); return true; }
    const card = t.closest('.cc'); if (card && card.classList.contains('active')) { card.classList.toggle('flipped'); return true; }
    if (t.closest('[data-cc-next]')) { deck.idx = Math.min(deck.song.words.length - 1, deck.idx + 1); paintDeck(); return true; }
    if (t.closest('[data-cc-prev]')) { deck.idx = Math.max(0, deck.idx - 1); paintDeck(); return true; }
    if (t.closest('[data-cc-known]')) {
      deck.known.add(deck.idx);
      if (deck.idx < deck.song.words.length - 1) deck.idx++;
      paintDeck(); return true;
    }
    if (t.closest('[data-cc-again]')) { deck.known.delete(deck.idx); paintDeck(); return true; }
    return false;
  }
  function handleKey(e) {
    if (!deck.song || !Y.$('#cc-wrap')) return;
    if (e.key === 'ArrowRight') { deck.idx = Math.min(deck.song.words.length - 1, deck.idx + 1); paintDeck(); }
    if (e.key === 'ArrowLeft') { deck.idx = Math.max(0, deck.idx - 1); paintDeck(); }
    if (e.key === ' ' && Y.$('#cc-wrap')) { const c = Y.$(`.cc[data-cc="${deck.idx}"]`); if (c) c.classList.toggle('flipped'); e.preventDefault(); }
  }
  document.addEventListener('keydown', handleKey);

  /* ---------- ③ 단계 페이지 ---------- */
  function renderWords(setId, no) {
    const song = Y.songOf(no); const s = Y.setOf(setId) || Y.setOfSong(no); const c = Y.conceptOf(s.id);
    Y.$('#app').innerHTML = `
      <section class="play-head" style="--c:${c.c}"><a class="back" href="#practice/${s.id}/${no}/2">← 가사 읽기로</a>
        <h1>${no === 0 ? '' : '#' + no + ' '}${Y.esc(song.title)}<span>③ 핵심 단어</span></h1></section>
      ${stepper(s.id, no, 3)}
      <section class="card activity" id="activity" style="--c:${c.c}"></section>
      <div class="play-foot"><a class="back" href="#practice/${s.id}/${no}/2">← 가사 읽기</a><a class="btn" href="#play/${s.id}/2/${no}">④ 다음: 문장 조립 →</a></div>`;
    Y.stageWords(song, s, Y.STAGES[0]);
  }

  /* ---------- 라우터 ---------- */
  function render(setId, no, step) {
    const s = Y.setOf(setId) || Y.setOfSong(no);
    if (!s || !Y.songOf(no)) { location.hash = '#home'; return; }
    if (!step) return renderReady(setId, no);
    if (step === '2') {
      const song = Y.songOf(no); const c = Y.conceptOf(s.id);
      Y.$('#app').innerHTML = `
        <section class="play-head" style="--c:${c.c}"><a class="back" href="#listen/${s.id}/${no}">← 곡 듣기로</a>
          <h1>${no === 0 ? '' : '#' + no + ' '}${Y.esc(song.title)}<span>② 가사 읽기</span></h1></section>
        ${stepper(s.id, no, 2)}
        <section class="card activity" id="activity" style="--c:${c.c}"></section>`;
      renderLyrics(setId, no);
      bindLyrics(Y.$('#activity'));
      setMode(rd.mode);
      return;
    }
    if (step === '3') { renderWords(setId, no); return; }
    location.hash = `#play/${setId}/4/${no}`;
  }

  return {
    init(api) { Y = api; },
    render,
    stepper,
    deckHTML,
    bindDeck,
    handleClick,
    deckKnownAll,
    stop: () => { clearFollow(); },
  };
})();

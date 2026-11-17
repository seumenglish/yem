/* 사도신경 배우기 (#creed) — 영어예배부 2.0 주보의 영어 사도신경
   음성 · 단어 시간: creed-audio.js (C:/workspace/yem/사도신경/make_creed_audio.py)
   한국어 풀이 · 쉬운 설명 · 단어 풀이는 이 파일에서 고쳐요. */
window.CREED_UI = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = window.CREED_AUDIO || [];

  // 세 부분: 아버지 하나님 · 예수님 · 성령님과 교회
  const PARTS = [
    { from: 0, to: 1, cls: 'p1', title: '아버지 하나님을 믿어요', en: 'God the Father' },
    { from: 2, to: 12, cls: 'p2', title: '예수님을 믿어요', en: 'Jesus Christ the Son' },
    { from: 13, to: 16, cls: 'p3', title: '성령님과 교회를 믿어요', en: 'The Holy Spirit and the Church' },
  ];
  // [한국어 풀이, 쉽게 말하면]
  const KO = [
    ['나는 전능하신 아버지 하나님을 믿습니다.', '하나님은 무엇이든 하실 수 있고, 우리를 사랑하는 아버지 같은 분이에요.'],
    ['하늘과 땅을 지으신 분이십니다.', '하늘과 땅, 그리고 나까지 모두 하나님이 만드셨어요.'],
    ['그의 유일하신 아들, 우리 주 예수 그리스도를 믿습니다.', '예수님은 하나님의 아들이시고, 우리의 주인이 되시는 분이에요.'],
    ['예수님은 성령으로 잉태되어', '예수님은 성령님의 능력으로 마리아의 몸에 생기셨어요.'],
    ['동정녀 마리아에게서 나시고,', '그래서 아기 예수님으로 태어나셨어요. 이게 바로 크리스마스예요!'],
    ['본디오 빌라도에게 고난을 받으셨으며,', '빌라도라는 로마 총독 때에 큰 아픔을 겪으셨어요.'],
    ['십자가에 못 박혀 죽으시고 묻히셨습니다.', '우리 죄를 대신해 십자가에서 돌아가시고 무덤에 묻히셨어요.'],
    ['죽은 자들의 세계(음부)에 내려가셨다가', '정말로 돌아가셔서, 죽은 사람들이 있는 곳까지 가셨다는 뜻이에요.'],
    ['사흘 만에 죽은 자 가운데서 다시 살아나셨으며,', '그런데 사흘째 되는 날 다시 살아나셨어요. 부활절이에요!'],
    ['하늘에 오르시어 앉아 계시니,', '하늘로 올라가셔서 앉아 계세요.'],
    ['전능하신 아버지 하나님의 오른편이십니다.', '가장 높고 귀한 자리, 하나님 바로 옆이에요.'],
    ['그곳으로부터 오셔서 심판하실 것입니다.', '예수님은 언젠가 다시 오실 거예요.'],
    ['살아 있는 자와 죽은 자를.', '그때 모든 사람을 바르게 판단하실 거예요.'],
    ['나는 성령을 믿습니다.', '우리 마음에 계시며 늘 도와주시는 성령님을 믿어요.'],
    ['거룩한 공교회와', '세상 모든 곳의 교회는 하나님의 한 가족이에요.'],
    ['성도의 교제와 죄를 용서받는 것과', '서로 사랑하며 함께 지내고, 예수님 덕분에 죄를 용서받아요.'],
    ['몸이 다시 사는 것과 영원히 사는 것을 믿습니다. 아멘.', '우리도 다시 살아나 하나님과 영원히 함께 살아요. 아멘은 "정말 그래요!"라는 뜻이에요.'],
  ];
  // [단어, 발음기호, 뜻, 쉬운 설명]
  const WORDS = [
    ['believe', 'bɪˈliːv', '믿다', '마음으로 "정말 그래요" 하고 받아들여요'],
    ['almighty', 'ɔːlˈmaɪti', '전능한', '무엇이든 다 하실 수 있는'],
    ['creator', 'kriˈeɪtər', '창조주', '모든 것을 처음 만드신 분'],
    ['heaven', 'ˈhevən', '하늘', '하나님이 계신 곳'],
    ['earth', 'ɜːrθ', '땅, 세상', '우리가 사는 곳'],
    ['Lord', 'lɔːrd', '주님', '우리의 주인이 되시는 분'],
    ['conceived', 'kənˈsiːvd', '잉태되다', '엄마 몸에 아기가 생기다'],
    ['Holy Spirit', 'ˈhoʊli ˈspɪrɪt', '성령님', '우리와 함께하시며 도우시는 하나님'],
    ['Virgin', 'ˈvɜːrdʒɪn', '동정녀', '결혼하기 전의 처녀'],
    ['suffered', 'ˈsʌfərd', '고난을 받았다', '많이 아프고 힘든 일을 겪었다'],
    ['Pontius Pilate', 'ˈpɒntʃəs ˈpaɪlət', '본디오 빌라도', '예수님 때의 로마 총독'],
    ['crucified', 'ˈkruːsɪfaɪd', '십자가에 못 박힌', '십자가에서 돌아가신'],
    ['buried', 'ˈberid', '묻힌', '무덤에 장사된'],
    ['descended', 'dɪˈsendɪd', '내려갔다', '아래로 내려갔다'],
    ['rose again', 'roʊz əˈɡen', '다시 살아났다', '부활하셨다'],
    ['ascended', 'əˈsendɪd', '올라갔다', '하늘로 올라가셨다'],
    ['seated', 'ˈsiːtɪd', '앉아 계신', '자리에 앉아 계신'],
    ['judge', 'dʒʌdʒ', '심판하다', '옳고 그름을 바르게 판단하다'],
    ['universal', 'ˌjuːnɪˈvɜːrsəl', '보편적인 (공교회)', '세상 모든 곳의, 모두를 위한'],
    ['communion', 'kəˈmjuːniən', '교제', '사랑으로 함께 나누고 지내는 것'],
    ['saints', 'seɪnts', '성도들', '예수님을 믿는 사람들'],
    ['forgiveness', 'fərˈɡɪvnəs', '용서', '잘못을 없던 것처럼 해 주는 것'],
    ['sins', 'sɪnz', '죄', '하나님 말씀을 어긴 잘못'],
    ['resurrection', 'ˌrezəˈrekʃən', '부활', '죽었다가 다시 살아나는 것'],
    ['everlasting', 'ˌevərˈlæstɪŋ', '영원한', '끝없이 계속되는'],
    ['Amen', 'ˌɑːˈmen', '아멘', '"정말 그래요! 그렇게 믿어요!"'],
  ];
  const slug = (w) => w.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- 소리 ---------- */
  let audio = null, token = 0, raf = 0;
  let voice = 'f';
  let mode = null; // 'all' | 'repeat' | null
  function stop() {
    token++;
    cancelAnimationFrame(raf);
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    mode = null;
    document.querySelectorAll('.cr-line.now, .cr-w.on').forEach((e) => e.classList.remove('now', 'on'));
    document.querySelectorAll('[data-cr-mode]').forEach((b) => b.classList.remove('on'));
  }
  function playLine(i, onEnd) {
    const my = ++token;
    cancelAnimationFrame(raf);
    const L = A[i];
    if (!L) return onEnd && onEnd();
    const v = L[voice] || L.f;
    if (!audio) audio = new Audio();
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    document.querySelectorAll('.cr-line.now').forEach((e) => e.classList.remove('now'));
    const row = document.querySelector(`.cr-line[data-i="${i}"]`);
    if (row) { row.classList.add('now'); row.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    const spans = row ? [...row.querySelectorAll('.cr-w')] : [];
    const tick = () => {
      if (my !== token) return;
      const t = audio.currentTime;
      let k = -1;
      v.words.forEach((w, j) => { if (t >= w[0] - 0.03) k = j; });
      spans.forEach((s, j) => s.classList.toggle('on', j === k));
      raf = requestAnimationFrame(tick);
    };
    const done = () => {
      if (my !== token) return;
      cancelAnimationFrame(raf);
      spans.forEach((s) => s.classList.remove('on'));
      if (row) row.classList.remove('now');
      if (onEnd) onEnd(audio.duration || 3);
    };
    audio.onended = done;
    audio.onerror = done;
    audio.src = v.src;
    if (window.onVoicePlay) window.onVoicePlay(L.en);
    audio.play().then(() => { raf = requestAnimationFrame(tick); }).catch(done);
  }
  function playFrom(i, m) {
    if (i >= A.length) { stop(); celebrate(); return; }
    playLine(i, (dur) => {
      if (mode !== m) return;
      // 따라 말하기: 읽은 시간만큼 기다려 줘요
      setTimeout(() => { if (mode === m) playFrom(i + 1, m); }, m === 'repeat' ? Math.max(1500, dur * 1000 + 600) : 350);
    });
  }
  function celebrate() {
    if (window.YEM_HOOKS) YEM_HOOKS.sparkle();
    const t = document.getElementById('cr-done');
    if (t) { t.hidden = false; t.classList.remove('celebrate'); void t.offsetWidth; t.classList.add('celebrate'); }
  }

  /* ---------- 화면 ---------- */
  function lineHTML(i) {
    const L = A[i];
    const words = (L.f && L.f.words) ? L.f.words.map((w) => w[2]) : L.en.split(/\s+/);
    // 문장부호를 살려서 단어마다 감싸기
    const toks = L.en.split(/\s+/);
    const html = toks.map((tok, j) => `<span class="cr-w" data-j="${j}">${esc(tok)}</span>`).join(' ');
    void words;
    return `<li class="cr-line" data-i="${i}">
      <button type="button" class="cr-play" data-cr-line="${i}" aria-label="${i + 1}번째 줄 듣기"><span aria-hidden="true">▶</span></button>
      <div class="cr-text"><p class="cr-en" lang="en">${html}</p><p class="cr-ko">${esc(KO[i][0])}</p>
        <details class="cr-easy"><summary>쉽게 풀어 보기</summary><p>${esc(KO[i][1])}</p></details></div>
    </li>`;
  }
  function render() {
    if (!A.length) return '<section class="card"><p>사도신경 음성을 준비 중이에요.</p></section>';
    const parts = PARTS.map((p, k) => `
      <section class="cr-part ${p.cls}">
        <h3><span class="cr-pno">${k + 1}</span>${esc(p.title)} <small lang="en">${esc(p.en)}</small></h3>
        <ol class="cr-lines" start="${p.from + 1}">${A.slice(p.from, p.to + 1).map((_, j) => lineHTML(p.from + j)).join('')}</ol>
      </section>`).join('');
    const words = WORDS.map(([w, ipa, ko, easy]) => `<button type="button" class="cr-word" data-cr-word="${slug(w)}">
      <b lang="en">${esc(w)}</b><span class="ipa">/${esc(ipa)}/</span><span class="ko">${esc(ko)}</span><small>${esc(easy)}</small></button>`).join('');
    return `
      <section class="play-head"><a class="back" href="#home">← YEM 소개 · 예배 순서</a>
        <h1>📜 사도신경 <span lang="en">The Apostles’ Creed · 영어예배부 2.0 주보 버전</span></h1></section>

      <section class="cr-intro">
        <article><p class="kicker">WHAT IS IT?</p><h2>사도신경이 뭐예요?</h2>
          <p>사도신경은 <b>"우리가 무엇을 믿는지"</b>를 짧게 정리한 믿음의 고백이에요. 예수님의 제자들(사도)이 전해 준 가르침을 바탕으로, 초대 교회 성도들이 세례를 받을 때 함께 고백하던 말에서 시작되었어요. 그래서 "사도들의 신앙고백"이라는 뜻으로 사도신경이라고 불러요.</p>
          <p>천 년이 훨씬 넘는 오랜 세월 동안, 전 세계의 교회가 이 고백을 함께 해 왔어요.</p></article>
        <article><p class="kicker">WHY DO WE SAY IT?</p><h2>왜 예배 때 고백해요?</h2>
          <ul><li><b>하나님을 기억해요</b> · 아버지 하나님, 예수님, 성령님이 어떤 분인지 마음에 새겨요.</li>
            <li><b>한 가족이 돼요</b> · 같은 말로 함께 고백하면 우리 마음이 하나가 돼요.</li>
            <li><b>세계와 함께해요</b> · 영어로 고백하면, 세계 곳곳의 친구들과 같은 고백을 드리는 거예요. Your stage is the world!</li></ul></article>
      </section>

      <section class="card cr-player">
        <div class="cr-tools">
          <button type="button" class="btn" data-cr-mode="all">▶ 전체 듣기</button>
          <button type="button" class="btn alt" data-cr-mode="repeat">🗣️ 한 줄씩 따라 말하기</button>
          <button type="button" class="ghost" data-cr-stop>■ 멈춤</button>
          <span class="cr-voice" role="group" aria-label="목소리">
            <button type="button" class="af-pill on" data-cr-voice="f">여자 목소리</button>
            <button type="button" class="af-pill" data-cr-voice="m">남자 목소리</button></span>
        </div>
        <p class="ph">줄 앞의 ▶를 누르면 한 줄씩 들어요. 읽는 단어에 색이 지나가요. <b>따라 말하기</b>는 한 줄을 읽고 따라 할 시간을 줘요.</p>
        <p class="cr-done" id="cr-done" hidden>🎉 사도신경을 끝까지 들었어요! 이번 주일에는 친구들과 함께 소리 내어 고백해 봐요.</p>
      </section>

      <div class="cr-legend">${PARTS.map((p, k) => `<span class="${p.cls}"><b>${k + 1}</b>${esc(p.title)}</span>`).join('')}</div>
      ${parts}

      <section class="card cr-vocab"><p class="kicker">WORDS</p><h2>📝 단어 풀이 <small>누르면 발음을 들려줘요</small></h2>
        <div class="cr-words">${words}</div></section>`;
  }

  function bind(el) {
    stop();
    el.onclick = (e) => {
      const t = e.target.closest('[data-cr-line], [data-cr-mode], [data-cr-stop], [data-cr-voice], [data-cr-word]');
      if (!t) return;
      if (t.dataset.crLine !== undefined) { stop(); playLine(Number(t.dataset.crLine)); return; }
      if (t.dataset.crMode) {
        const m = t.dataset.crMode;
        stop();
        mode = m;
        t.classList.add('on');
        const d = document.getElementById('cr-done'); if (d) d.hidden = true;
        playFrom(0, m);
        return;
      }
      if (t.hasAttribute('data-cr-stop')) { stop(); return; }
      if (t.dataset.crVoice) {
        voice = t.dataset.crVoice;
        el.querySelectorAll('[data-cr-voice]').forEach((b) => b.classList.toggle('on', b === t));
        return;
      }
      if (t.dataset.crWord) {
        stop();
        if (!audio) audio = new Audio();
        audio.src = `assets/creed/w-${t.dataset.crWord}.mp3`;
        audio.play().catch(() => {});
      }
    };
  }

  return { render, bind, stop };
})();

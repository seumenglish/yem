/* 단어를 배워요 · 문장을 배워요 · 성경·예배 용어 — 발음기호, 🔊 음성(여성·남성), 예문 보기
   app.js의 YEM 도구를 사용합니다. 이 파일은 app.js보다 먼저 로드됩니다. */
window.LEARN = (() => {
  let Y = null;
  let wordTab = 'song';
  const TABS = [
    ['song', '🎵 찬양 단어'], ['god', '✝️ 하나님·예수님'], ['faith', '💛 마음·믿음'],
    ['word', '📖 신앙 말'], ['person', '👤 성경 인물'], ['book', '📚 성경 책'],
  ];
  const CAT = { god: '하나님·예수님', faith: '마음·믿음', word: '신앙 말', person: '성경 인물' };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const alpha = (i) => `assets/alpha/a${(i % 8) + 1}.png`;

  const btns = (text) => `
    <div class="wbtns">
      <button type="button" class="listen-btn" data-say="${esc(text)}"><span>🔊</span>듣기</button>
      <button type="button" class="mini-btn" data-slow="${esc(text)}">🐢 천천히</button>
    </div>`;

  /* 단어가 들어 있는 가사 줄 = 예문 (아이들이 부르는 노래의 문장) */
  function exampleFor(word) {
    const esc2 = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + esc2 + '\\b', 'i');
    for (const s of SONGS) {
      const hit = Y.flatPairs(s).find((p) => re.test(p[0]));
      if (hit) return { en: hit[0], ko: hit[1], song: `#${s.no} ${s.title}` };
    }
    return null;
  }

  function wordCards(list, withExample) {
    return list.map((w, i) => {
      const ex = withExample ? exampleFor(w.en) : null;
      return `
      <article class="wcard">
        ${w.pic ? `<div class="wpic wpic-person">${w.pic}</div>` : `<img class="wpic" src="${alpha(i)}" alt="">`}
        <div class="wtop"><b class="wen">${esc(w.en)}</b></div>
        ${w.ipa ? `<div class="wipa">${esc(w.ipa)}</div><div class="wread">한글 발음 · ${esc(w.read)}</div>` : ''}
        <div class="wko">${esc(w.ko)}</div>
        ${btns(w.en)}
        ${ex ? `<details class="ex"><summary>예문 보기</summary>
          <p class="ex-en">${esc(ex.en)}</p><p class="ex-ko">${esc(ex.ko)}</p>
          <button type="button" class="mini-btn" data-say="${esc(ex.en)}">🔊 예문 듣기</button>
          <small>${esc(ex.song)}</small></details>` : ''}
      </article>`;
    }).join('');
  }

  function songWordList() {
    const out = [];
    SONGS.forEach((s) => s.words.forEach((w) => out.push({ en: w[0], ko: `${w[1]} · ${s.ko}(#${s.no})`, ipa: '', read: '' })));
    return out;
  }

  function renderWords() {
    const tabs = `<div class="af-groups">${TABS.map(([id, n]) => `<button class="af-pill ${id === wordTab ? 'on' : ''}" data-tab="${id}">${n}</button>`).join('')}</div>`;
    let body;
    if (wordTab === 'song') {
      body = `<p class="ph">찬양에 나오는 핵심 단어예요. 🔊을 누르면 여성·남성 목소리로 두 번 들려줘요. 예문은 “예문 보기”를 누르면 펼쳐져요.</p>
        <div class="wgrid">${wordCards(songWordList(), true)}</div>`;
    } else if (wordTab === 'book') {
      body = `<p class="ph">성경 책 이름을 영어로도 읽어 봐요. 약자는 교회 자료와 같아요.</p>
        <div class="board-wrap"><table class="pron books">
          <tr><th>한글 약자</th><th>성경 책</th><th>English</th><th>한글 발음</th><th></th></tr>
          ${window.BIBLE_BOOKS.map((b) => `<tr><td>${esc(b[1])}</td><td>${esc(b[2])}</td><td class="bold">${esc(b[3])}</td><td>${esc(b[4])}</td><td><button type="button" class="mini-btn" data-say="${esc(b[3])}">🔊</button></td></tr>`).join('')}
        </table></div>`;
    } else if (wordTab === 'person') {
      const list = window.PEOPLE.map((p) => ({ en: p.en, ipa: p.ipa, read: p.read, ko: `${p.ko} (${p.desc})`, pic: PEOPLE_ART.portrait(p, { prop: false }) }));
      body = `<p class="ph">성경 인물 ${list.length}명의 영어 이름이에요. 카드로 크게 보고 인쇄용 PDF도 받을 수 있어요. <a class="btn sm" href="#people">🙋 성경 인물 카드 보기 →</a></p>
        <div class="wgrid">${wordCards(list, false)}</div>`;
    } else {
      const list = window.GLOSSARY.filter((g) => g[0] === CAT[wordTab]).map((g) => ({ en: g[1], ipa: g[2], read: g[3], ko: g[4] }));
      body = `<div class="wgrid">${wordCards(list, false)}</div>`;
    }
    return `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a>
        <h1>🔤 단어를 배워요<span>발음기호와 한글 발음, 🔊 발음 듣기, 예문 보기</span></h1></section>
      ${tabs}
      <section class="card activity">${body}</section>`;
  }

  function renderSentences() {
    const groups = SONGS.map((s) => {
      const pairs = Y.flatPairs(s);
      return `<details class="card sgroup">
        <summary><b>#${s.no} ${esc(s.title)}</b> <small>${esc(s.ko)}</small></summary>
        ${pairs.map((p) => `<div class="sline"><div><p class="se">${esc(p[0])}</p><p class="sk">${esc(p[1])}</p></div>
          <button type="button" class="listen-btn" data-say="${esc(p[0])}"><span>🔊</span>듣기</button></div>`).join('')}
      </details>`;
    }).join('');
    return `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a>
        <h1>💬 문장을 배워요<span>곡의 가사 한 줄마다 🔊로 원어민 발음을 들어요</span></h1></section>
      ${groups}`;
  }

  /* ---------- 성경 인물 카드 페이지 ---------- */
  let peopleTab = 'all';
  const PDF = 'assets/people/yem-bible-people-cards.pdf';
  function renderPeople() {
    const P = window.PEOPLE;
    const list = P.filter((p) => peopleTab === 'all' || p.t === peopleTab);
    const ot = P.filter((p) => p.t === 'OT').length;
    const pills = [['all', `전체 ${P.length}명`], ['OT', `📜 구약 ${ot}명`], ['NT', `✝️ 신약 ${P.length - ot}명`]]
      .map(([id, n]) => `<button class="af-pill ${id === peopleTab ? 'on' : ''}" data-ptab="${id}">${n}</button>`).join('');
    return `
      <section class="play-head"><a class="back" href="#home">← 처음으로</a>
        <h1>🙋 성경 인물 카드<span>영어 이름 · 우리말 이름 · 인물 이야기 · 성경 말씀 위치</span></h1></section>
      <section class="card people-hero">
        <div class="people-crowd">${PEOPLE_ART.crowd()}</div>
        <div class="people-intro">
          <h2>성경 속 친구 ${P.length}명을 만나요!</h2>
          <p>노아, 모세, 다윗, 에스더부터 베드로와 바울까지 — 하나님과 함께 걸어간 사람들이에요.
            카드를 누르면 뒷면이 보이고, 🔊을 누르면 영어 이름을 들을 수 있어요.</p>
          <p class="ph">카드 아래에 있는 성경 말씀을 찾아 읽으면 그 사람의 이야기를 만날 수 있어요.</p>
          <div class="row people-dl">
            <a class="btn alt" href="${PDF}" download>📥 인쇄용 카드 PDF 받기</a>
            <a class="ghost" href="${PDF}" target="_blank" rel="noopener">PDF 미리 보기</a>
          </div>
          <small>A4 가로 · 한 장에 4명 · 가운데 선을 접으면 앞뒷면 카드가 돼요</small>
        </div>
      </section>
      <div class="af-groups">${pills}</div>
      <section class="pgrid">${list.map((p) => `
        <div class="pc-wrap">
          <button type="button" class="pc-flip" data-flip aria-label="${esc(p.ko)} 카드 뒤집기">${PEOPLE_ART.front(p)}${PEOPLE_ART.back(p)}</button>
          <div class="wbtns"><button type="button" class="listen-btn" data-say="${esc(p.en)}"><span>🔊</span>듣기</button>
            <button type="button" class="mini-btn" data-slow="${esc(p.en)}">🐢 천천히</button></div>
        </div>`).join('')}</section>`;
  }

  function render(parts) {
    if (parts[0] === 'people') return { html: renderPeople() };
    const page = parts[0];
    if (page === 'words') return { html: renderWords() };
    if (page === 'sentences') return { html: renderSentences() };
    return null;
  }

  function bind(el) {
    el.onclick = (e) => {
      const t = e.target.closest('[data-tab], [data-say], [data-slow], [data-ptab], [data-flip]');
      if (!t) return;
      if (t.dataset.ptab) { peopleTab = t.dataset.ptab; Y.route(); return; }
      if (t.dataset.flip !== undefined) { t.classList.toggle('flipped'); return; }
      if (t.dataset.tab) { wordTab = t.dataset.tab; Y.route(); return; }
      const box = t.closest('.wcard, .sline, tr, .ex, .pc-wrap');
      if (t.dataset.say !== undefined) { TTS.speak(t.dataset.say, { el: box, rate: 1 }); return; }
      if (t.dataset.slow !== undefined) { TTS.speak(t.dataset.slow, { el: box, rate: 0.6 }); return; }
    };
  }

  return {
    init(api) { Y = api; },
    render,
    bind,
    setTab(id) { if (id) wordTab = id; },
  };
})();

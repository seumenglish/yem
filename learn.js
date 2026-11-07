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
        <img class="wpic" src="${alpha(i)}" alt="">
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

  function render(parts) {
    const page = parts[0];
    if (page === 'words') return { html: renderWords() };
    if (page === 'sentences') return { html: renderSentences() };
    return null;
  }

  function bind(el) {
    el.onclick = (e) => {
      const t = e.target.closest('[data-tab], [data-say], [data-slow]');
      if (!t) return;
      if (t.dataset.tab) { wordTab = t.dataset.tab; Y.route(); return; }
      const box = t.closest('.wcard, .sline, tr, .ex');
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

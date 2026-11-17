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
      ${window.yemBanner({ img: 'words', alt: '두루마리를 들고 별을 가리키는 이사야', kicker: 'WORDS · 단어', q: 'Your word is a lamp for my feet.', ko: '“주의 말씀은 내 발에 등이요”', ref: '시편 119:105', big: '영어<br><em>단어</em> 배우기', title: '🔤 발음기호 · 한글 발음 · 🔊 듣기' })}
      ${tabs}
      <section class="card activity">${body}</section>`;
  }

  function renderSentences() {
    const groups = SONGS.map((s) => {
      const pairs = Y.lessonPairs(s);
      return `<details class="card sgroup">
        <summary><b>#${s.no} ${esc(s.title)}</b> <small>${esc(s.ko)}</small></summary>
        ${pairs.map((p) => `<div class="sline"><div><p class="se">${esc(p[0])}</p><p class="sk">${esc(p[1])}</p></div>
          <button type="button" class="listen-btn" data-say="${esc(p[2] || p[0])}"><span>🔊</span>듣기</button></div>`).join('')}
      </details>`;
    }).join('');
    return `
      ${window.yemBanner({ img: 'sentences', alt: '오순절에 제자들이 여러 나라 사람들에게 하나님의 사랑을 전하는 그림', kicker: 'SENTENCES · 문장', q: 'Let everything that has breath praise the LORD.', ko: '“호흡이 있는 자마다 여호와를 찬양할지어다”', ref: '시편 150:6', big: '영어<br><em>문장</em> 배우기', title: '💬 가사 한 줄씩 원어민 발음' })}
      ${groups}`;
  }

  /* ---------- 성경 인물 카드 페이지 ---------- */
  let peopleTab = 'all';
  const peopleList = () => window.PEOPLE.filter((p) => peopleTab === 'all' || p.t === peopleTab);
  function renderPeople() {
    const P = window.PEOPLE;
    const list = peopleList();
    const ot = P.filter((p) => p.t === 'OT').length;
    const counts = { all: P.length, OT: ot, NT: P.length - ot };
    const pills = [['all', `전체 ${P.length}명`], ['OT', `📜 구약 ${ot}명`], ['NT', `✝️ 신약 ${P.length - ot}명`]]
      .map(([id, n]) => `<button class="af-pill ${id === peopleTab ? 'on' : ''}" data-ptab="${id}">${n}</button>`).join('');
    return `
      ${window.yemBanner({ img: 'people', alt: '목자들이 기뻐하며 예수님 소식을 전하는 그림', kicker: 'YEM BIBLE FRIENDS · PHOTO CARDS', big: '성경 인물<br><em>포토카드</em>', q: 'I have called you friends.', ko: '“너희를 친구라 하였노니”', ref: '요한복음 15:15', title: `📜 구약 ${counts.OT}명 · ✝️ 신약 ${counts.NT}명 · 모두 <em>${counts.all}명</em>` })}
      <section class="pc-intro">
        <div class="pc-intro-h"><p class="pc-intro-k">📸 PHOTO CARDS</p>
          <h2>성경 속 친구 <em>${counts.all}명</em>을 포토카드로 만나요</h2>
          <p>아담부터 누가까지, 하나님과 함께 걸어간 사람들이에요. 카드 한 장마다 <b>영어 이름 · 발음기호 · 우리말 이름 · 그림 속 성경 이야기</b>가 들어 있어요.</p></div>
        <ol class="pc-how">
          <li><span>🔊</span><b>영어 이름 누르기</b><small>두 번 읽어 줘요 · 처음엔 빠르게, 다음엔 천천히</small></li>
          <li><span>🖼️</span><b>그림 누르기</b><small>어떤 성경 이야기인지 영어로 알려 줘요</small></li>
          <li><span>📖</span><b>소개 누르기</b><small>그 인물의 이야기를 자세히 읽어요</small></li>
          <li><span>🖨️</span><b>인쇄용 카드</b><small>집에서 진짜 카드로 만들어요</small></li>
        </ol>
      </section>
      <div class="af-groups bp-tabs">${pills}<a class="ghost sm bp-print" href="#cards">🖨️ 인쇄용 카드 만들기</a></div>
      <section class="bgrid">${list.map(PEOPLE_ART.card).join('')}</section>`;
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
      const t = e.target.closest('[data-tab], [data-say], [data-slow], [data-ptab], [data-flip], [data-pname], [data-pinfo]');
      if (!t) return;
      if (t.dataset.ptab) { peopleTab = t.dataset.ptab; Y.route(); return; }
      if (t.dataset.pname) { PEOPLE_ART.sayName(PEOPLE_ART.byId.get(t.dataset.pname), t.closest('.bcard') || t); return; }
      if (t.dataset.pinfo) { PEOPLE_ART.openDetail(t.dataset.pinfo, peopleList()); return; }
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

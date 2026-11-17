/* YEM 소개 (홈페이지 첫 화면)
   - 글은 영어예배부 주보 · 찬양팀 공지의 말을 바탕으로 따뜻하게 풀어 썼어요.
   - 예배 순서는 2026.11.15 주보를 바탕으로 했어요. 순서가 바뀌면 ORDER만 고쳐요. 주보를 매주 올리지 않으니 날짜에 묶인 내용은 넣지 않아요.
   - '이번 주 암송 말씀'은 이번 달 찬양 4곡의 말씀(verses.js)에서 주마다 저절로 골라요.
   - 아이들 이름은 넣지 않아요 (팀 이름과 뜻만). 사진은 얼굴을 모자이크한 사진만 써요 (assets/about). */
window.ABOUT = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const VALUES = [
    ['🤗', 'A Place for Everyone', '누구나 환영받는 곳',
      '영어를 잘하지 못해도, 오늘 처음 왔어도 괜찮아요. 이곳은 시험을 보는 자리가 아니라 하나님의 사랑을 함께 누리는 자리예요. 여러 나라에서 온 가족들과 어린 친구들, 선생님들이 한 가족처럼 서로의 이름을 불러 주고, 작은 발걸음 하나도 크게 기뻐해 줘요.'],
    ['🎶', 'Praise in English', '영어로 찬양하고 말씀으로 자라요',
      '매달 네 곡씩, 다섯 달 동안 20곡의 영어 찬양을 마음에 새겨요. 처음엔 화면을 보며 따라 부르고, 어느새 가사를 외워 회중을 바라보며 담대히 찬양하게 돼요. 노래 한 줄, 말씀 한 구절이 쌓여 우리 아이들의 마음을 단단하게 채워 가요.'],
    ['🌏', 'Your Stage Is the World', '너의 무대는 세계야!',
      '이곳은 단순한 예배의 자리를 넘어, 세상을 향해 나아갈 비전이 시작되는 출발점이에요. 언어를 선물 삼아 하나님의 크신 꿈을 열방에 전하는 사람, 영적으로도 학문적으로도 빛나는 글로벌 리더로 자라도록 함께 기도하고 응원해요.'],
  ];

  // [영어, 한국어, 누가, 따뜻한 설명]
  const ORDER = [
    ['Call to Worship', '예배로의 부름 · 찬양', 'Worship Team',
      '모두 자리에서 일어나 스크린의 가사를 보며 기쁘게 찬양해요. 단어를 다 몰라도 괜찮아요. 박수를 치고 손을 들며 마음을 열면, 어느새 하나님께 드리는 우리만의 축제가 돼요.'],
    ['The Apostles’ Creed', '사도신경', 'Pastor Moon',
      '우리가 무엇을 믿는지 영어로 함께 고백해요. 주보 뒷면에 영어 사도신경이 있으니 천천히 따라 읽어 보세요. 한 목소리로 고백할 때 우리는 한 가족이 돼요.'],
    ['Congregational Prayer', '대표 기도', 'Teacher',
      '선생님들이 돌아가며 앞에 나와 우리 공동체와 가정, 나라와 열방을 위해 영어로 기도해요. 눈을 감고 같은 마음으로 "아멘" 하며 함께해요.'],
    ['Scripture Reading', '성경 봉독', 'Pastor Moon',
      '이번 주 말씀을 함께 읽어요. 핵심 구절이 스크린에 크게 나오니 성경책이 없어도 괜찮아요.'],
    ['Sermon', '말씀', 'Pastor Moon',
      '문새럴 목사님이 아이들 눈높이로 생명의 말씀을 전해 주세요. 설교의 핵심과 요약이 주보와 스크린에 함께 나와서, 영어 듣기가 아직 어려운 친구들도 말씀의 은혜를 넉넉히 따라갈 수 있어요.'],
    ['Closing Hymn — The Lord’s Prayer', '주기도문 찬양', 'Worship Team',
      '예수님이 가르쳐 주신 기도를 노래로 함께 불러요. "Our Father, who art in heaven…" 매주 부르다 보면 저절로 외워져요.'],
    ['Closing Prayer', '마침 기도', 'Pastor Moon',
      '오늘 받은 말씀을 마음에 품고 한 주를 살아갈 수 있도록 목사님이 기도해 주세요.'],
    ['Announcements', '광고 · 새가족 환영', 'Pastor Moon',
      '이번 주 소식을 나누고, 처음 온 친구와 가족을 큰 박수로 환영해요. 쑥스러워도 괜찮아요. 모두가 당신을 기다렸어요!'],
    ['Benediction', '축도', 'Pastor Moon',
      '목사님의 축복 기도로 예배를 마쳐요. 하나님의 복을 가득 안고 새로운 한 주를 시작해요.'],
    ['Closing', '찬양팀 나눔과 기도', 'Worship Team',
      '예배가 끝나면 찬양팀이 함께 모여 오늘의 예배를 돌아보고, 서로를 위해 기도하며 마무리해요.'],
  ];
  /* 예배 순서에서 누르면 갈 곳: 1 이번 달 찬양 · 2 사도신경 배우기 · 6 주기도문 찬양 */
  const LINKS = {
    0: (o) => (o.set ? { href: `#set/${o.set.id}`, label: `🎧 ${o.month || ''}월 찬양 배우러 가기 (${o.set.tag})` } : null),
    1: () => ({ href: '#creed', label: '📜 사도신경 배우러 가기' }),
    5: () => ({ href: '#play/prayer/1/0', label: '🙏 주기도문 찬양 배우러 가기' }),
  };
  const PREP = [['1:30', '찬양팀 리허설'], ['1:45', '연합 기도'], ['1:50', '설교 요약 나눔'], ['1:55', '예배 전 영상']];

  const FAQ = [
    ['영어를 정말 못하는데 괜찮을까요?', 'Absolutely NOT a problem! 예배는 언어 시험이 아니에요. 모든 단어를 알아듣지 못해도 찬양의 은혜와 예배의 감격은 충분히 누릴 수 있어요. 흐름을 따라가다 보면 금세 익숙해지고, 곁에 있는 다정한 친구와 선생님들이 언제든 도와줄 거예요. 미소와 열린 마음만 가져오세요!'],
    ['옷은 어떻게 입고 가요?', 'Come as you are. 가장 편안한 옷차림으로 오세요. 후드티, 청바지, 운동화 모두 환영해요.'],
    ['성경책을 가져가야 하나요?', "We've got you covered! 핵심 말씀이 스크린에 나와요. 가벼운 마음으로 오세요."],
    ['헌금은 어떻게 하나요?', '영어예배 시간에는 따로 헌금 순서가 없어요. 준비한 헌금은 3층 본당 헌금함에 넣어 주세요.'],
  ];

  const TEAM = [
    ['Alive Team', '1 · 3주', '살아 있는 예배자로 서는 팀이에요. 기쁨이 넘치는 찬양으로 예배의 문을 열어요.'],
    ['Believer Team', '2 · 4주', '담대한 믿음의 사람들로 서는 팀이에요. 믿음의 고백을 노래로 선포해요.'],
    ['United Worship Team', '5주', '그리스도 안에서 하나(United) 된 팀이에요. 두 팀이 모두 함께 무대에 서서 연합 찬양을 올려드려요.'],
    ['Seed Worshippers', '함께 준비', '찬양을 마음과 입술로 깊이 묵상하며 거룩한 씨앗을 심는 친구들이에요. 하나님의 때에 꽃을 피워 무대에 함께 서요.'],
  ];

  const PHOTOS = [
    ['thanksgiving', '추수감사절 예배 · 감사의 열매를 함께 나눈 날'],
    ['picnic', '숲속에서 다 함께 · 웃음이 가득했던 날'],
    ['stage', '예배를 마치고 · 모두가 주인공'],
    ['prayer', '손잡고 기도하는 시간'],
    ['outing', '함께 걸으며 사랑을 나눈 날'],
    ['together', '선생님과 친구들, 한 가족'],
  ];

  /* 이번 주 암송 말씀: 이번 달 찬양 4곡의 말씀을 주마다 하나씩 (따로 올리지 않아도 저절로 바뀌어요) */
  function weekVerse(set) {
    if (!set || typeof VERSES === 'undefined') return null;
    const wk = Math.min(set.songs.length - 1, Math.floor((new Date().getDate() - 1) / 7));
    const no = set.songs[wk];
    const v = VERSES.find((x) => x.no === no);
    return v ? { ...v, wk: wk + 1 } : null;
  }

  function html(opt = {}) {
    const v = weekVerse(opt.set);
    return `
      <section class="ab-hero">
        <img class="ab-hero-img" src="assets/hero/praise-team.webp" alt="예수님 둘레에서 성경 친구들이 함께 찬양하는 그림" width="1536" height="1024" fetchpriority="high">
        <div class="ab-hero-text">
          <p class="ab-kicker">YEM · Incheon Younglak Church English Ministry</p>
          <h1>Welcome Home!<span>어서 와, 영어예배부는 처음이지?</span></h1>
          <p class="ab-lead">“너의 무대는 세계야!” 작은 발걸음으로 찾아온 이곳에서, 세상을 품는 가장 큰 꿈이 시작돼요.
            영어로 찬양하고 말씀으로 자라는 우리, 오늘 당신을 진심으로 환영해요.</p>
          <div class="ab-info">
            <span><b>🕑 매주 주일 오후 2시</b><small>Sunday 2:00 PM</small></span>
            <span><b>📍 인천영락교회 2층 다윗홀</b><small>David Hall, 2F</small></span>
            <span><b>🙏 문새럴 목사님</b><small>Pastor Moon Shairal</small></span>
          </div>
          <div class="ab-cta">
            <a class="btn" href="#songs">🎧 해외 CCM 배우기</a>
            <a class="btn alt" href="#books">📚 스토리북</a>
            <a class="ghost" href="#me">🏠 내 공부방</a>
            <a class="ghost" href="#intro">🧭 홈페이지 소개</a>
          </div>
        </div>
      </section>

      <h2 class="ab-sec">💙 우리는 이런 공동체예요</h2>
      <section class="ab-values">${VALUES.map(([ico, en, ko, body]) => `
        <article><span class="ab-ico">${ico}</span><p class="ab-en" lang="en">${esc(en)}</p><h3>${esc(ko)}</h3><p>${esc(body)}</p></article>`).join('')}
      </section>

      ${v ? `<h2 class="ab-sec">📖 이번 주 암송 말씀 <small>${opt.month || ''}월 ${v.wk}주차 · 찬양과 함께 외워요</small></h2>
      <section class="ab-week">
        <p class="ab-en ab-verse" lang="en">“${esc(v.en)}”</p>
        <p class="ab-ref">${esc(v.refEn)} · ${esc(v.ref)}</p>
        <p class="ab-verse-ko">${esc(v.ko)}</p>
        <a class="btn alt" href="#verse/${v.no}">✍️ 이 말씀 외우기</a>
      </section>` : ''}

      <h2 class="ab-sec">🕊️ 예배 순서 <small>Order of Worship · 2:00 PM</small></h2>
      <section class="ab-order">
        <ol>${ORDER.map(([en, ko, who, body], i) => {
          const go = LINKS[i] && LINKS[i](opt);
          const inner = `<span class="ab-no">${i + 1}</span><div><p class="ab-o-head"><b lang="en">${esc(en)}</b><em>${esc(ko)}</em><span class="ab-who">${esc(who)}</span></p><p>${esc(body)}</p>
            ${go ? `<span class="ab-go">${go.label} <span aria-hidden="true">→</span></span>` : ''}</div>`;
          return go ? `<li class="ab-linked"><a href="${go.href}">${inner}</a></li>` : `<li>${inner}</li>`;
        }).join('')}
        </ol>
        <div class="ab-prep"><b>예배 전 1:30 – 2:00</b> ${PREP.map(([t, x]) => `<span><em>${t}</em>${esc(x)}</span>`).join('')}
          <small>찬양팀은 예배 30분 전부터 마이크를 세팅하고, 함께 기도하며 마음을 모아요. 세팅부터가 예배의 시작이에요.</small></div>
        <p class="ab-note">순서는 주마다 조금씩 달라질 수 있어요.</p>
      </section>

      <h2 class="ab-sec">🎤 함께 섬기는 사람들</h2>
      <section class="ab-people">
        <article class="ab-person"><span class="ab-badge" aria-hidden="true">🙏</span><div><p class="ab-en" lang="en">Pastor Moon Shairal</p><h3>문새럴 목사님</h3>
          <p>매주 생명의 말씀을 전하고 축복해 주시는 영어예배부 담당 목사님이에요. 아이들 한 명 한 명의 이름을 불러 주시며 하나님의 사랑을 전해 주세요. 궁금한 점이나 기도 제목이 있다면 언제든 목사님께 이야기해 주세요.</p></div></article>
        <article class="ab-person"><img src="assets/yunhee/logo.png" alt=""><div><p class="ab-en" lang="en">Worship Leader · Lucy</p><h3>찬양팀 리더 슈퍼스타 윤희쌤</h3>
          <p>"YEM 아이들을 한 명 한 명 모두 리더라고 불러요." 아이들이 영어 찬양을 마음에 새기고 담대히 선포하도록 곁에서 함께 노래하고 기도하는 찬양팀 리더예요. 이 홈페이지의 찬양 · 스토리북 · 성경 인물도 아이들을 위해 만들었어요.</p></div></article>
      </section>
      <section class="ab-team">${TEAM.map(([en, when, body]) => `
        <article><p class="ab-en" lang="en">${esc(en)}</p><span class="ab-when">${esc(when)}</span><p>${esc(body)}</p></article>`).join('')}
      </section>

      <h2 class="ab-sec">🙋 처음 오셨나요? <small>Real Talk</small></h2>
      <section class="ab-faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>

      <h2 class="ab-sec">📸 함께한 순간</h2>
      <section class="ab-photos">${PHOTOS.map(([f, cap]) => `
        <figure><img src="assets/about/${f}.webp" alt="${esc(cap)} (얼굴은 모자이크했어요)" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join('')}
      </section>
      <p class="ab-note">아이들을 지키기 위해 사진 속 얼굴은 모두 모자이크했어요.</p>

      <section class="ab-contact">
        <h2>STAY CONNECTED</h2>
        <p>궁금한 점이 있거나 기도가 필요할 땐 언제든 연락해 주세요. 당신의 자리는 언제나 여기 있어요.</p>
        <div class="ab-info"><span><b>🕑 매주 주일 오후 2시</b></span><span><b>📍 인천영락교회 2층 다윗홀</b></span><span><b>💬 담당 교역자 · 문새럴 목사님</b></span></div>
      </section>`;
  }

  return { html, weekVerse };
})();

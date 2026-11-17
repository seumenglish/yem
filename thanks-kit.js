/* 추수감사절 키트 상세페이지 (#thanks)
   - 파일: assets/thanks/*.webp (미리보기), assets/thanks/pdf/*.pdf (인쇄용)
   - 만드는 스크립트: C:/workspace/yem/thanksgiving/YEM_thanksgiving_2026/05_소스코드/site_kit_assets.py
   - 실제 예배 사진은 얼굴이 나오지 않는 사진만 써요. */
window.THANKS_KIT = (() => {
  const A = 'assets/thanks/';
  const P = A + 'pdf/';
  const img = (k, alt, w, h, cls) => `<img ${cls ? `class="${cls}" ` : ''}src="${A}${k}.webp" alt="${alt}" width="${w}" height="${h}" loading="lazy" data-zoom>`;
  const yh = (pic, html, side) => `
    <div class="cg-say ${side || ''}"><img src="assets/yunhee/guide/${pic}.webp" alt="슈퍼스타 윤희쌤" width="82" height="120" loading="lazy">
      <p class="cg-bub">${html}</p></div>`;
  const dl = (file, label, info, main) => `
    <a class="tk-dl${main ? ' main' : ''}" href="${P}${file}" target="_blank" rel="noopener">
      <span class="tk-dl-i" aria-hidden="true">${main ? '🖨️' : '📄'}</span>
      <span class="tk-dl-t"><b>${label}</b><small>${info}</small></span>
      <span class="tk-dl-go" aria-hidden="true">PDF ↓</span></a>`;

  /* 키트 구성 (SET 1 ~ 5) */
  const SETS = [
    {
      id: 'set1', no: 'SET 1', color: 'red', name: '가정 나눔 세트', en: 'Give Thanks at Home', paper: 'A4 · 컬러',
      lead: '예배가 끝나고 집으로 가져가는 세트예요. 감사가 교회에서 끝나지 않고 <b>우리 집 식탁</b>까지 이어지도록 만들었어요.',
      pics: [['a4-mat', '테이블 매트 컬러', 900, 636], ['a4-mat-line', '테이블 매트 컬러링', 900, 636], ['a4-guide1', '가정용 소개지 1쪽', 900, 1273], ['a4-guide2', '가정용 소개지 2쪽', 900, 1273], ['a4-verse1', '말씀카드 1', 900, 1273], ['a4-holder', '수저받침', 900, 636]],
      items: [
        ['🍽️ 테이블 매트 2종', '컬러 1장 + 아이가 직접 색칠하는 컬러링 1장. 영어 식탁 기도문과 “I’m thankful for ___” 칸이 있어요.'],
        ['🥢 수저받침', '오려서 접으면 세워지는 수저받침. 접는 선과 풀칠 자리가 표시되어 있어요.'],
        ['📖 말씀카드 10종', '감사에 대한 성경 구절 10개를 영어 + 한글로. 단어 하나씩 함께 익혀요.'],
        ['🏡 가정용 소개지 2쪽', '세트를 집에서 어떻게 쓰는지, 7일 감사기도 챌린지까지 한눈에 안내해요.'],
      ],
      files: [['yem-thanks-A4-all.pdf', '가정 나눔 세트 한 번에 인쇄', 'A4 · 8쪽 · 6.8MB', true], ['yem-thanks-A4-mat.pdf', '테이블 매트 (컬러 + 컬러링)', 'A4 가로 · 2쪽 · 3.1MB'], ['yem-thanks-A4-holder.pdf', '수저받침', 'A4 가로 · 2쪽 · 0.3MB'], ['yem-thanks-A4-verse-cards.pdf', '말씀카드 10종', 'A4 · 3쪽 · 1.3MB'], ['yem-thanks-A4-guide.pdf', '가정용 소개지', 'A4 · 2쪽 · 2.1MB']],
    },
    {
      id: 'set2', no: 'SET 2', color: 'orange', name: '과일 테이블 장식', en: 'Harvest Table Deco', paper: 'A3 · 컬러',
      lead: '각자 가져온 과일을 올려 두는 강대상 앞 <b>감사 테이블</b>을 꾸미는 세트예요. 과일 하나, 감사 한 줄이 모여 YEM의 감사 테이블이 완성돼요.',
      pics: [['a3-tent', '텐트 사인', 900, 636], ['a3-stand1', '스탠드 캐릭터 Thank You, God!', 900, 1273], ['a3-tree', '감사나무 포스터', 900, 1273], ['a3-names', '과일 영어 이름표', 900, 636], ['a3-garland', 'GIVE THANKS 가랜드', 900, 1273], ['a3-topper', '과일 토퍼', 900, 636]],
      items: [
        ['⛺ 텐트 사인', '“Thank You, Lord, for the Harvest!” 테이블 앞에 세우는 삼각 사인.'],
        ['🙌 스탠드 캐릭터 2종', '“Thank You, God!” · “God is Good!” 받침을 접어 혼자 서는 캐릭터.'],
        ['🍎 과일 영어 이름표', 'Apple · Pear · Persimmon … 이름표마다 “Thank You, God, for ___!” 문장이 있어요.'],
        ['🌳 감사나무 포스터 + 나뭇잎', '나뭇잎에 감사 한 줄을 써서 붙이면 우리 반 감사나무가 자라요.'],
        ['🚩 GIVE THANKS 가랜드', '12장 삼각기. 테이블 앞이나 벽에 길게 걸어요.'],
        ['🍊 과일 토퍼 · 감사카드', '과일에 꽂는 깃발과 동그란 토퍼, 과일 옆에 세우는 “I’m thankful for ___” 카드.'],
      ],
      files: [['yem-thanks-A3-table-deco.pdf', '과일 테이블 장식 한 번에 인쇄', 'A3 · 11쪽 · 6.0MB', true]],
    },
    {
      id: 'set3', no: 'SET 3', color: 'green', name: '7일 감사기도 챌린지', en: 'Thankful Prayer Challenge', paper: 'A4 · 카톡 이미지',
      lead: '추수감사 예배는 끝났지만 감사는 이제 시작! 일주일 동안 <b>가족이 식탁에서 영어로 감사기도</b>를 드리는 챌린지예요.',
      pics: [['ch-sheet', '7일 감사기도 체크표', 900, 1273], ['ch-plan', '7일 기도 플랜', 900, 1233], ['ch-cert', 'Thankful Family 인증서', 900, 636], ['ch-news1', '챌린지 카드뉴스 1', 900, 1125], ['ch-news3', '하루 한 문장 감사 말하기', 900, 1125], ['ch-news4', '매일 함께하는 식탁 기도', 900, 1125]],
      items: [
        ['✅ 7일 체크표', '하루 한 문장 영어 감사(God is good! → Thank You, Jesus!)와 체크 칸.'],
        ['🙏 식탁 기도문', '“Dear God, Thank You for this food and this harvest…” 영어 + 한글 뜻.'],
        ['🏆 Thankful Family 인증서', '7일을 완주한 가정에게 드리는 가족 인증서 (A4 가로).'],
        ['📱 카톡 카드뉴스', '참여 방법 · 인증샷 찍는 법 · 완주 선물을 안내하는 이미지.'],
      ],
      files: [['yem-thanks-challenge.pdf', '7일 감사기도 체크표', 'A4 · 1쪽 · 2.0MB', true], ['yem-thanks-certificate.pdf', 'Thankful Family 인증서', 'A4 가로 · 1쪽 · 3.0MB']],
    },
    {
      id: 'set4', no: 'SET 4', color: 'purple', name: '영어 감사 문장 50', en: 'Thankful Sentences 50', paper: 'A4 · 2쪽',
      lead: '“I’m thankful for my family.” 가족 · 친구 · 자연 · 하나님 · 나 자신… 주제별 영어 감사 문장 50개에 <b>한글 뜻과 발음</b>까지 달았어요.',
      pics: [['t50-1', '영어 감사 문장 50 1쪽', 900, 1273], ['t50-2', '영어 감사 문장 50 2쪽', 900, 1273]],
      items: [
        ['📝 주제별 50문장', '가족 · 하나님과 예수님 · 친구와 교회 · 음식과 추수 · 자연 · 나의 하루.'],
        ['🔤 한글 뜻 + 발음', '영어가 처음인 가족도 바로 소리 내어 읽을 수 있어요.'],
        ['✏️ 나만의 감사 문장', '마지막 칸에 “I’m thankful for ___” 를 직접 채워 봐요.'],
      ],
      files: [['yem-thankful-50.pdf', '영어 감사 문장 50', 'A4 · 2쪽 · 3.5MB', true]],
    },
    {
      id: 'set5', no: 'SET 5', color: 'blue', name: 'Jesus & Me 감사 굿즈', en: 'Jesus Series Goods', paper: 'A4 · 스티커 용지',
      lead: '7일 감사기도 챌린지에 참여한 가정에게 선물한 <b>예수님 시리즈 굿즈</b>예요. 아이들이 가장 좋아한 선물이었어요.',
      pics: [['st-gift', 'Jesus Series 선물 안내', 900, 1125], ['st-preview', 'Jesus & Me 스티커 미리보기', 1400, 357]],
      items: [
        ['😊 예수님 스티커 24개', 'A4 전지 스티커 용지에 인쇄해서 그대로 떼어 붙여요.'],
        ['💌 감사카드 7장 모으기', '하루에 한 장씩, 7장을 모으는 양면 카드.'],
        ['🔖 책갈피 4종 · 자석 키링 12종', '성경책에 꽂는 책갈피, 냉장고에 붙이는 자석.'],
      ],
      files: [['yem-jesus-stickers.pdf', '예수님 스티커 24개', 'A4 · 1쪽 · 4.2MB', true], ['yem-jesus-thanks-cards.pdf', '감사카드 7장 모으기 (양면)', 'A4 · 2쪽 · 3.8MB'], ['yem-jesus-bookmarks.pdf', '책갈피 4종', 'A4 · 1쪽 · 0.7MB'], ['yem-jesus-keyrings.pdf', '자석 키링 12종', 'A4 · 1쪽 · 4.2MB']],
    },
  ];

  const setHtml = (s) => `
    <section class="tk-set tk-${s.color}" id="${s.id}">
      <header class="tk-set-h">
        <span class="tk-no">${s.no}</span>
        <div><h3>${s.name}</h3><p class="tk-en">${s.en} · ${s.paper}</p></div>
      </header>
      <p class="tk-lead">${s.lead}</p>
      <div class="tk-gal">${s.pics.map(([k, alt, w, h]) => `<figure>${img(k, alt, w, h)}<figcaption>${alt}</figcaption></figure>`).join('')}</div>
      <ul class="tk-items">${s.items.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul>
      <div class="tk-dls">${s.files.map(([f, l, i, m]) => dl(f, l, i, m)).join('')}</div>
    </section>`;

  function render() {
    return `
      <div class="tk">
      <section class="tk-hero">
        <a class="back" href="#home">← YEM 소개</a>
        <div class="tk-hero-in">
          <div class="tk-hero-t">
            <p class="sb-kicker">YEM THANKSGIVING KIT · FREE PRINTABLE</p>
            <h1>교회에서 드린 감사가<br><em>우리 집 식탁</em>까지</h1>
            <p>인천영락교회 영어예배부(YEM)가 추수감사주일에 실제로 사용한 <b>추수감사절 키트</b>를 그대로 나눠요.
              과일 테이블 장식부터 가정 식탁 매트, 7일 감사기도 챌린지, 예수님 스티커까지 모두 영어와 한글로 담았어요.</p>
            <div class="tk-price">
              <div><small>키트 가격</small><b>₩0</b><span>Paid by Love 💛</span></div>
              <ul><li>PDF 13개 · 바로 인쇄</li><li>A4 · A3 컬러</li><li>영어 + 한글</li></ul>
            </div>
            <div class="sa-btns"><a class="btn" href="#tk-down" data-tk-jump>⬇️ 무료로 받기</a><a class="ghost" href="#tk-sets" data-tk-jump>구성 먼저 보기</a></div>
          </div>
          <div class="tk-hero-pics" aria-hidden="true">
            <img class="tk-hp1" src="${A}hero-altar.webp" alt="" width="900" height="675">
            <img class="tk-hp2" src="${A}hero-home.webp" alt="" width="900" height="675">
          </div>
        </div>
      </section>

      <nav class="tk-tabs" aria-label="키트 안 바로가기">
        <a href="#tk-sets" data-tk-jump>구성</a><a href="#tk-real" data-tk-jump>실제 사용</a><a href="#tk-flow" data-tk-jump>진행 순서</a><a href="#tk-print" data-tk-jump>인쇄 안내</a><a href="#tk-faq" data-tk-jump>자주 묻는 질문</a><a href="#tk-down" data-tk-jump>다운로드</a>
      </nav>

      <section class="sa-stats" aria-label="키트 한눈에">
        <div><b>5</b><span>세트 · 교회 + 가정</span></div>
        <div><b>30+</b><span>가지 도안</span></div>
        <div><b>7</b><span>일 감사기도 챌린지</span></div>
        <div><b>2</b><span>언어 · English 한국어</span></div>
      </section>

      ${yh('wow', '올해 YEM 추수감사절에 <b>진짜로 쓴 자료</b>예요! 각자 과일 하나씩 들고 와서 감사 테이블을 채우고, 서로 나누어 집으로 가져갔어요. 그 감사가 집 식탁까지 이어지도록 하나하나 정성껏 만들었어요 💕')}

      <section class="sa-sec tk-why">
        <p class="sb-kicker">OUR HEART</p>
        <h2>왜 만들었나요?</h2>
        <div class="tk-why-in">
          <div>
            <p>추수감사 예배에서 우리는 <b>과일 하나씩</b>을 들고 와 하나님께 감사를 드려요.
              그런데 이 감사가 예배당에서 끝나지 않고 <b>각 가정의 식탁</b>까지 이어졌으면 했어요.</p>
            <p>그래서 같은 매트, 같은 말씀, 같은 기도로 집에서도 하나 되는 <b>YEM 가족</b>이 되길 바라며 이 키트를 준비했어요.
              유치부 아이부터 어른까지, 영어가 처음인 가족도 함께할 수 있도록 모든 문장에 한글 뜻을 달았어요.</p>
          </div>
          <ul class="tk-points">
            <li><b>⛪ 교회에서</b><span>과일 테이블을 함께 꾸미고 영어로 감사해요.</span></li>
            <li><b>🎁 나눔으로</b><span>가져온 과일과 나눔 세트를 서로 나눠 집으로.</span></li>
            <li><b>🏡 가정에서</b><span>식탁 매트 위에서 가족이 영어로 감사기도.</span></li>
            <li><b>🌱 7일 동안</b><span>챌린지로 감사가 습관이 되도록.</span></li>
          </ul>
        </div>
      </section>

      <section class="sa-sec" id="tk-sets">
        <p class="sb-kicker">WHAT'S INSIDE</p>
        <h2>키트 구성</h2>
        <div class="tk-index">${SETS.map((s) => `<a class="tk-${s.color}" href="#${s.id}" data-tk-jump><span>${s.no}</span><b>${s.name}</b><small>${s.paper}</small></a>`).join('')}</div>
        ${SETS.map(setHtml).join('')}
      </section>

      ${yh('heart', '도안을 누르면 <b>크게</b> 볼 수 있어요. 인쇄하기 전에 어떤 모양인지 꼭 미리 확인해 보세요 😊', 'r')}

      <section class="sa-sec" id="tk-real">
        <p class="sb-kicker">REAL USE · THANKSGIVING SUNDAY</p>
        <h2>실제 예배에서 이렇게 썼어요</h2>
        <p>인천영락교회 2층 다윗홀, YEM 추수감사주일 예배 모습이에요. 가정마다 가져온 과일이 모여 풍성한 감사 테이블이 되었어요.</p>
        <div class="tk-real">
          <figure class="wide">${img('real-table', '과일 테이블 전체 모습', 900, 507)}<figcaption>강대상 앞 과일 감사 테이블</figcaption></figure>
          <figure>${img('real-apple', '텐트 사인과 사과', 900, 1200)}<figcaption>텐트 사인 · Thank You, Lord, for the Harvest!</figcaption></figure>
          <figure>${img('real-names', '과일 영어 이름표', 900, 675)}<figcaption>과일 영어 이름표 · Apple 사과</figcaption></figure>
          <figure>${img('real-stand', '스탠드 캐릭터', 900, 675)}<figcaption>스탠드 캐릭터 · Thank You, God!</figcaption></figure>
          <figure>${img('real-mat', '테이블 매트와 꽃', 900, 1200)}<figcaption>가정에 나눠 준 테이블 매트</figcaption></figure>
          <figure>${img('real-craft', '수저받침 오리기', 900, 675)}<figcaption>수저받침 · 오려서 접어요</figcaption></figure>
        </div>
      </section>

      <section class="sa-sec" id="tk-flow">
        <p class="sb-kicker">HOW IT GOES</p>
        <h2>땡스기빙데이 진행 순서</h2>
        <ol class="sa-how tk-flow">
          <li><b>과일 하나 들고 오기</b><span>각 가정이 감사의 과일을 하나씩 준비해요. 일주일 전 카톡으로 미리 안내하면 좋아요.</span></li>
          <li><b>과일 테이블에 올리기</b><span>과일 영어 이름표 옆에 과일을 올려요. “Thank You, God, for apples!” 소리 내어 읽어요.</span></li>
          <li><b>감사카드에 영어로 한 줄</b><span>“I’m thankful for ___.” 감사나무 나뭇잎이나 과일 옆 감사카드에 써요.</span></li>
          <li><b>영어로 함께 예배 · 기도</b><span>영어 찬양과 말씀, 그리고 다 같이 식탁 기도 “Dear God, Thank You for…”</span></li>
          <li><b>과일 나누기</b><span>예배 후 가져온 과일을 서로 나누어 담아요. 받아 가는 것이 더 많은 날이에요.</span></li>
          <li><b>나눔 세트 들고 집으로</b><span>매트 · 수저받침 · 말씀카드를 들고 가서 7일 감사기도 챌린지를 시작해요.</span></li>
        </ol>
      </section>

      <section class="sa-sec" id="tk-print">
        <p class="sb-kicker">PRINT GUIDE</p>
        <h2>인쇄 안내</h2>
        <ol class="cg-steps">
          <li><b>배율: 실제 크기 (100%)</b><span>‘페이지에 맞춤’을 끄고 <b>실제 크기</b>로 인쇄해야 접는 선과 크기가 정확해요.</span></li>
          <li><b>과일 테이블 장식은 A3</b><span>집에 A3 프린터가 없으면 동네 인쇄소 · 편의점 컬러 출력을 이용해요. A4로 줄여도 쓸 수는 있어요.</span></li>
          <li><b>종이 두께</b><span>매트 · 카드 · 스탠드는 <b>150~200g</b>, 텐트 사인과 스탠드 캐릭터는 <b>200~250g</b>이면 잘 서요. 스티커는 <b>A4 전지 스티커 용지</b>.</span></li>
          <li><b>양면 카드</b><span>감사카드 7장 모으기는 양면이에요. ‘긴 쪽으로 넘기기’로 인쇄하고, 먼저 1장만 시험해 보세요.</span></li>
        </ol>
        <div class="tk-paper">
          <div><b>A4 · 150~200g</b><span>테이블 매트 · 수저받침 · 말씀카드 · 소개지 · 감사 문장 50 · 챌린지 체크표 · 인증서</span></div>
          <div><b>A3 · 200~250g</b><span>텐트 사인 · 스탠드 캐릭터 · 감사나무 · 이름표 · 가랜드 · 토퍼 · 감사카드</span></div>
          <div><b>A4 스티커 용지</b><span>예수님 스티커 24개 · 자석 키링 (자석 시트에 붙여서)</span></div>
        </div>
      </section>

      ${yh('yay', '테이블 매트는 <b>코팅</b>해 두면 매일 식탁에서 써도 오래가요. 컬러링 매트는 아이와 함께 색칠하는 시간 자체가 감사 시간이 돼요! 🎨')}

      <section class="sa-sec" id="tk-faq">
        <p class="sb-kicker">FAQ</p>
        <h2>자주 묻는 질문</h2>
        <div class="tk-faq">
          <details><summary>정말 무료인가요?</summary><p>네, 무료예요. YEM 가족은 물론, 추수감사절을 준비하는 다른 교회 · 주일학교 · 가정도 자유롭게 인쇄해서 쓰실 수 있어요.</p></details>
          <details><summary>다른 교회에서 써도 되나요?</summary><p>물론이에요! 다만 판매는 하지 말아 주시고, 나눌 때는 <b>“인천영락교회 영어예배부 YEM”</b> 출처를 함께 적어 주세요. 도안에 YEM 이름이 들어 있어요.</p></details>
          <details><summary>영어를 잘 못해도 할 수 있나요?</summary><p>네. 모든 영어 문장에 한글 뜻이 있고, 감사 문장 50에는 한글 발음까지 달려 있어요. 아이가 먼저 읽고 부모님이 따라 읽어도 좋아요.</p></details>
          <details><summary>A3 프린터가 없어요.</summary><p>A3 파일을 A4로 ‘페이지에 맞춤’ 인쇄하면 조금 작아지지만 그대로 쓸 수 있어요. 테이블을 크게 꾸미고 싶다면 인쇄소에서 A3 컬러로 뽑는 것을 추천해요.</p></details>
          <details><summary>휴대폰으로도 받을 수 있나요?</summary><p>네. 다만 파일이 1~7MB라서 <b>와이파이</b>에서 받는 것을 추천해요. 열린 PDF에서 바로 인쇄하거나, 카톡으로 컴퓨터에 보내도 돼요.</p></details>        </div>
      </section>

      <section class="cg-print tk-down" id="tk-down">
        <p class="sb-kicker">DOWNLOAD · FREE</p>
        <h2>추수감사절 키트 받기</h2>
        <p class="tk-down-sub">필요한 세트만 골라 받아도 돼요. 파일을 누르면 열리고, 화면의 🖨️ 버튼으로 바로 인쇄할 수 있어요.</p>
        <div class="tk-down-grid">${SETS.map((s) => `
          <div class="tk-down-set tk-${s.color}"><p><span>${s.no}</span> ${s.name}</p>${s.files.map(([f, l, i, m]) => dl(f, l, i, m)).join('')}</div>`).join('')}
        </div>
        <p class="cg-small">무료로 인쇄하고 나눌 수 있어요. 다만 <b>판매하지 말아 주시고</b>, 나눌 때는 <b>“인천영락교회 영어예배부 YEM”</b> 출처를 함께 적어 주세요.</p>
      </section>

      ${yh('pray', '“Give thanks to the LORD, for he is good.” (Psalm 107:1) 이 키트로 감사하는 가정마다 하나님의 풍성한 은혜가 가득하길 기도해요. 사용한 사진을 보내 주시면 정말 기쁠 거예요! 🙏', 'r')}
      </div>
      <div class="tk-zoom" hidden><button type="button" aria-label="닫기">✕</button><img alt=""></div>`;
  }

  function bind(el) {
    const zoom = el.querySelector('.tk-zoom');
    const close = () => { zoom.hidden = true; document.body.style.overflow = ''; };
    el.onclick = (e) => {
      const j = e.target.closest('a[data-tk-jump]');
      if (j) {
        e.preventDefault();
        const t = el.querySelector(j.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const z = e.target.closest('img[data-zoom]');
      if (z) {
        const im = zoom.querySelector('img');
        im.src = z.src; im.alt = z.alt;
        zoom.hidden = false; document.body.style.overflow = 'hidden';
        return;
      }
      if (e.target.closest('.tk-zoom')) close();
    };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !zoom.hidden) close(); });
  }

  return { render, bind };
})();

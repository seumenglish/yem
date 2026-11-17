/* 성경 인물 카드 · 인쇄해서 실물 카드 만들기 안내 (#cards)
   - 인쇄용 PDF: assets/cards/YEM_BibleFriends_Cards_Print.pdf (C:/workspace/yem/카드/build_cards.py 로 만들어요)
   - A4 한 장에 카드 4장 (A6 105×148mm), 앞면 → 뒷면 순서, 긴 쪽 양면 인쇄용으로 뒷면이 좌우 바뀌어 있어요. */
window.CARDS_GUIDE = (() => {
  const PDF = 'assets/cards/YEM_BibleFriends_Cards_Print.pdf';
  const yh = (pic, html, side) => `
    <div class="cg-say ${side || ''}"><img src="assets/yunhee/guide/${pic}.webp" alt="슈퍼스타 윤희쌤" width="82" height="120" loading="lazy">
      <p class="cg-bub">${html}</p></div>`;

  function render() {
    return `
      <section class="cg-hero">
        <a class="back" href="#people">← 성경 인물</a>
        <div class="cg-hero-in">
          <div class="cg-hero-t">
            <p class="sb-kicker">YEM BIBLE FRIENDS CARDS · FREE PRINTABLE</p>
            <h1>화면 속 성경 친구 110명,<br><em>진짜 카드</em>로 만들어요</h1>
            <p>홈페이지에서 만난 성경 친구들을 집에서 인쇄해 손에 쥘 수 있는 카드로 만들어 보세요.
              이런 카드 자료는 보통 돈을 내고 사야 하지만, 우리 YEM 친구들과 가정에는 <b>무료로</b> 나눠요.
              대신 만드는 법과 노는 법을 하나하나 친절하게 알려 드릴게요.</p>
            <div class="sa-btns"><a class="btn" href="#cg-print">🖨️ 인쇄하러 가기</a><a class="ghost" href="#cg-how" data-cg-jump>만드는 법 먼저 보기</a></div>
          </div>
          <div class="cg-cards" aria-hidden="true">
            <img class="cg-back" src="assets/cards/sample-back.webp" alt="" width="420" height="592">
            <img class="cg-front" src="assets/cards/sample-front.webp" alt="" width="420" height="592">
          </div>
        </div>
      </section>

      ${yh('wow', '와우! 우리 아이가 매일 보는 성경 친구들을 <b>실물 카드</b>로 만들어 볼 수 있어요! 냉장고에 붙여도, 가방에 넣어도, 잠자리에서 한 장씩 읽어 줘도 좋아요 💕')}

      <section class="sa-stats" aria-label="카드 한눈에">
        <div><b>110</b><span>장 · 구약 62 · 신약 48</span></div>
        <div><b>A6</b><span>엽서 크기 105×148mm</span></div>
        <div><b>3</b><span>언어 · English 中文 한국어</span></div>
        <div><b>56</b><span>쪽 · A4 28장 양면</span></div>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">FRONT &amp; BACK</p>
        <h2>카드 한 장에 담긴 것</h2>
        <div class="cg-fb">
          <figure><img src="assets/cards/sample-front.webp" alt="예수님 카드 앞면" width="420" height="592" loading="lazy"><figcaption><b>앞면</b> 성경 친구 그림 · 영어 이름 · 발음기호 · 중국어(병음) · 한국어 이름 · 번호</figcaption></figure>
          <figure><img src="assets/cards/sample-back.webp" alt="예수님 카드 뒷면" width="420" height="592" loading="lazy"><figcaption><b>뒷면</b> 한 줄 소개 · 성경 구절 · 영어 이야기 · 한국어 이야기</figcaption></figure>
        </div>
        <p class="cg-note">테두리 색으로 바로 구분해요. <span class="cg-ot">주황 = 구약</span> <span class="cg-nt">파랑 = 신약</span></p>
      </section>

      <section class="sa-sec">
        <p class="sb-kicker">WHAT YOU NEED</p>
        <h2>준비물</h2>
        <div class="sa-grid">
          <div class="sa-item"><b>컬러 프린터</b><p>잉크젯 · 레이저 모두 괜찮아요. 그림이 많아서 <b>컬러 인쇄</b>를 꼭 추천해요. 집에 없으면 동네 인쇄소나 편의점 컬러 출력도 좋아요.</p></div>
          <div class="sa-item"><b>A4 두꺼운 종이</b><p>카드 느낌을 원하면 <b>180~250g 매트지(스노우지)</b>가 가장 좋아요. 일반 복사지(80g)도 되지만, 그때는 코팅을 추천해요.</p></div>
          <div class="sa-item"><b>자르는 도구</b><p>재단기가 있으면 깔끔하고, 없으면 <b>자 + 커터칼</b> 또는 가위로 충분해요. 아이와 함께라면 가위는 부모님이 도와주세요.</p></div>
          <div class="sa-item"><b>있으면 좋아요</b><p>모서리 펀치(둥근 모서리) · 코팅지 · 구멍 펀치와 카드링 · 카드 보관 상자나 지퍼백</p></div>
        </div>
      </section>

      ${yh('heart', '처음에는 <b>한 장만 먼저</b> 인쇄해서 앞뒤가 잘 맞는지 확인해 보세요. 그러면 종이도 잉크도 아낄 수 있어요 😊', 'r')}

      <section class="sa-sec" id="cg-set">
        <p class="sb-kicker">PRINT SETTINGS</p>
        <h2>인쇄 설정 (가장 중요해요!)</h2>
        <ol class="cg-steps">
          <li><b>용지 크기: A4</b><span>프린터 창에서 용지가 A4인지 확인해요.</span></li>
          <li><b>배율: 실제 크기 (100%)</b><span>‘페이지에 맞춤’ · ‘축소’를 끄고 <b>실제 크기</b>로 골라야 카드 크기가 정확해요.</span></li>
          <li><b>컬러 · 고품질</b><span>‘흑백’이 켜져 있지 않은지 보고, 품질은 ‘높음’으로 해요.</span></li>
          <li><b>양면 인쇄: 긴 쪽으로 넘기기</b><span>양면 인쇄를 켜고 <b>‘긴 쪽 가장자리로 넘기기 (Long edge)’</b>를 골라요. 그러면 앞면 뒤에 같은 친구의 이야기가 딱 맞게 나와요.</span></li>
          <li><b>양면이 안 되는 프린터라면</b><span>① ‘홀수 쪽만’ 인쇄 → ② 나온 종이를 뒤집어 다시 넣고 → ③ ‘짝수 쪽만’ 인쇄해요. 프린터마다 넣는 방향이 달라서 <b>1~2쪽으로 먼저 시험</b>해 보세요.</span></li>
        </ol>
        <div class="cg-tip"><b>잉크를 아끼고 싶다면 필요한 쪽만!</b>
          <p>대림절 · 성탄 친구들만 먼저 만들고 싶으면 <b>23–26쪽, 45–50쪽</b>만 인쇄하세요. 마리아 · 요셉 · 헤롯 · 예수님 · 사가랴 · 엘리사벳 · 가브리엘 · 목자들 · 동방박사 · 시므온 · 안나가 들어 있어요.</p>
          <p>쪽 번호 계산: 카드 번호를 4로 나눠 올림한 값이 <b>몇 번째 장</b>이에요. 그 장의 앞면은 (장×2−1)쪽, 뒷면은 (장×2)쪽이에요. 예) No.049 예수님 → 13번째 장 → 25쪽 · 26쪽</p></div>
      </section>

      <section class="sa-sec" id="cg-how">
        <p class="sb-kicker">HOW TO MAKE</p>
        <h2>만드는 법</h2>
        <ol class="sa-how">
          <li><b>인쇄하기</b><span>위의 설정대로 인쇄해요. A4 한 장에서 카드 4장이 나와요.</span></li>
          <li><b>잉크 말리기</b><span>잉크젯 프린터라면 5분쯤 펼쳐 두고 말려요. 손에 묻지 않고 번지지 않아요.</span></li>
          <li><b>네 조각으로 자르기</b><span>종이 한가운데의 <b>가로선 · 세로선</b>을 따라 자르면 똑같은 카드 4장이 돼요. 카드 둘레에 흰 여백이 있어서 조금 비뚤어져도 괜찮아요.</span></li>
          <li><b>모서리 둥글게 (선택)</b><span>모서리 펀치나 가위로 네 귀퉁이를 둥글게 다듬으면 진짜 카드처럼 보이고, 아이들 손도 안전해요.</span></li>
          <li><b>코팅하기 (선택)</b><span>코팅하면 오래 쓰고, 보드마커로 퀴즈 답을 쓰고 지울 수도 있어요.</span></li>
          <li><b>모아서 보관</b><span>카드링으로 묶으면 단어장처럼, 상자에 넣으면 카드 게임 세트가 돼요. 번호(No.) 순서대로 꽂으면 성경 순서가 돼요.</span></li>
        </ol>
      </section>

      ${yh('yay', '저는 코팅하고 구멍을 뚫어 <b>카드링</b>으로 묶어 두었어요. 예배 기다리는 시간에 한 장씩 넘기며 이름 맞히기를 하면 아이들이 정말 좋아해요! 🎉')}

      <section class="sa-sec">
        <p class="sb-kicker">HOW TO PLAY</p>
        <h2>이렇게 놀아요</h2>
        <div class="cg-play">
          <div><b>🙋 이름 퀴즈</b><p>그림만 보여 주고 영어 이름을 맞혀요. 맞히면 뒷면 이야기를 읽어 줘요.</p></div>
          <div><b>🌙 잠자리 이야기</b><p>자기 전에 한 장 골라 뒷면의 영어 · 한국어 이야기를 읽어 줘요. 하루 한 명, 110일이면 성경 한 바퀴!</p></div>
          <div><b>🃏 짝 맞추기</b><p>같은 카드를 두 세트 인쇄해 뒤집어 놓고 짝을 찾아요. 홈페이지 메모리 게임을 실물로!</p></div>
          <div><b>🧡💙 구약 · 신약 나누기</b><p>주황 테두리는 구약, 파랑 테두리는 신약. 섞어 두고 두 줄로 나눠 봐요.</p></div>
          <div><b>🔢 성경 순서 줄 세우기</b><p>No. 번호 순서대로 줄을 세우면 아담부터 바울까지 성경 이야기의 흐름이 보여요.</p></div>
          <div><b>📖 스토리북 친구 찾기</b><p>바이블 스토리북을 읽으면서 책에 나온 포토카드를 찾아 옆에 놓아요.</p></div>
          <div><b>🌏 세 나라 말 놀이</b><p>영어 · 중국어 · 한국어로 이름을 불러 봐요. 홈페이지 성경 인물에서 원어민 발음을 들을 수 있어요.</p></div>
          <div><b>⛪ 주일 반 활동</b><p>선생님이 매주 ‘이번 주 성경 친구’ 한 장을 뽑아 함께 이야기하고, 다 모으면 칭찬 스티커!</p></div>
        </div>
        <div class="sa-btns"><a class="ghost" href="#people">성경 인물에서 발음 듣기 →</a><a class="ghost" href="#books">스토리북 읽기 →</a></div>
      </section>

      <section class="cg-print" id="cg-print">
        <p class="sb-kicker">PRINT &amp; SHARE · FREE</p>
        <h2>이제 인쇄해 볼까요?</h2>
        <img class="cg-sheet" src="assets/cards/sample-sheet.webp" alt="A4 한 장에 카드 4장이 들어간 인쇄 화면 미리보기" width="744" height="1052" loading="lazy">
        <ul class="cg-check">
          <li>A4 · <b>실제 크기 100%</b> · 컬러</li>
          <li>양면: <b>긴 쪽으로 넘기기</b></li>
          <li>먼저 <b>1~2쪽만</b> 시험 인쇄</li>
        </ul>
        <div class="sa-btns cg-btns">
          <a class="btn cg-big" href="${PDF}" target="_blank" rel="noopener">🖨️ 프린트 하기 · 파일 열기</a>
          <a class="ghost" href="${PDF}" download="YEM_BibleFriends_Cards_Print.pdf">⬇️ 파일 내려받기</a>
        </div>
        <p class="cg-small">PDF 56쪽 · 약 30MB예요. 휴대폰이라면 <b>와이파이</b>에서 받아 주세요. 파일이 열리면 화면의 🖨️ 인쇄 버튼을 눌러요.</p>
        <p class="cg-small">무료로 인쇄하고 나눌 수 있어요. 다만 <b>판매하지 말아 주시고</b>, 나눌 때는 <b>“인천영락교회 영어예배부 YEM”</b> 출처를 함께 적어 주세요.</p>
      </section>

      ${yh('pray', '카드 한 장 한 장에 우리 아이들이 성경 친구들과 더 가까워지길 기도하며 만들었어요. 만든 카드 사진을 영어예배부에 보여 주면 저 정말 기뻐할 거예요! 🙏', 'r')}`;
  }

  function bind(el) {
    el.onclick = (e) => {
      const a = e.target.closest('a[href^="#cg-"]');
      if (!a) return;
      e.preventDefault();
      const t = el.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }

  return { render, bind };
})();

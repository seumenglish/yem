/* YEM 첫 화면 그림 넘기기: 예수님과 함께하는 슈퍼스타 윤희쌤 · 친구들 (바이블 그래머 그림)
   YH_SCENES.slider() → 홈 맨 위에 넣어요. 5초마다 넘어가고, 손가락으로 밀어도 돼요. */
window.YH_SCENES = (() => {
  const S = [
    ['walk', '예수님과 함께 걸어요', 'Walk with Jesus', '주일 오후 2시 · 인천영락교회 2층 다윗홀에서 만나요', '#welcome', '처음 오셨나요?'],
    ['story', '말씀을 들어요', "Listen to God's Word", '영어 · 중국어 성경동화를 원어민 목소리로 들어요', '#books', '스토리북 보기'],
    ['pray', '함께 기도해요', "Let's pray together", '7일 감사기도 챌린지 · 사진 한 장으로 참여해요', '#challenge', '리더 라운지'],
    ['award', '서로 칭찬해요', 'Well done, Leader!', '배지와 수료증을 모으며 한 뼘씩 자라요', '#me', '나의 공부방'],
  ];
  let timer = 0;
  function slider() {
    clearInterval(timer);
    setTimeout(start, 50);
    return `<section class="yhs" aria-label="YEM 그림 소개">
      <div class="yhs-track">${S.map(([img, ko, en, d, href, go], i) => `
        <a class="yhs-slide" href="${href}" aria-label="${ko}">
          <img src="assets/yh/${img}.webp" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1200" height="800">
          <span class="yhs-cap"><small lang="en">${en}</small><b>${ko}</b><em>${d}</em><i>${go} →</i></span>
        </a>`).join('')}</div>
      <div class="yhs-dots">${S.map((_, i) => `<button type="button" class="${i ? '' : 'on'}" data-yhs="${i}" aria-label="${i + 1}번 그림"></button>`).join('')}</div>
      <img class="yhs-pose" src="assets/yh/pose1.webp" alt="손 흔드는 슈퍼스타 윤희쌤">
    </section>`;
  }
  function start() {
    const box = document.querySelector('.yhs');
    if (!box) return;
    const tr = box.querySelector('.yhs-track');
    const dots = [...box.querySelectorAll('[data-yhs]')];
    const go = (i) => tr.scrollTo({ left: tr.clientWidth * i, behavior: 'smooth' });
    const cur = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
    tr.addEventListener('scroll', () => { const c = cur(); dots.forEach((d, k) => d.classList.toggle('on', k === c)); }, { passive: true });
    box.addEventListener('click', (e) => { const d = e.target.closest('[data-yhs]'); if (d) { go(+d.dataset.yhs); restart(); } });
    const restart = () => { clearInterval(timer); timer = setInterval(() => { if (!document.body.contains(tr)) { clearInterval(timer); return; } go((cur() + 1) % S.length); }, 5000); };
    tr.addEventListener('pointerdown', restart);
    restart();
  }
  return { slider };
})();

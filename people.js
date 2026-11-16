/* 성경 인물 카드 — 우리가 만든 캐릭터 그림 110명 (데이터: people-data.js)
   그림: assets/people/img/<id>.webp (원본 characters/웹), 장면·소품: assets/people/scene · prop
   이름 음성: assets/people/name/<id>.mp3 (보통 빠르기) → <id>-slow.mp3 (천천히) 순서로 두 번 */
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DIR = 'assets/people/';
  const splitKo = (ko) => { const m = String(ko).match(/^(.*?)\s*\((.+)\)\s*$/); return m ? [m[1], m[2]] : [ko, '']; };

  const ALL = (window.PEOPLE_DATA || [])
    .slice()
    .sort((a, b) => (a.t === b.t ? a.no - b.no : a.t === 'OT' ? -1 : 1))
    .map((p) => {
      const [koMain, koSub] = splitKo(p.ko);
      return {
        ...p,
        koMain,
        koSub,
        img: `${DIR}img/${p.id}.webp`,
        tag: `${p.t === 'OT' ? '구약' : '신약'} · No.${String(p.no).padStart(2, '0')}`,
        band: p.t === 'OT' ? '#5f9e76' : '#d9714f',
      };
    });
  const byId = new Map(ALL.map((p) => [p.id, p]));

  /* ---------- 그림 ---------- */
  function portrait(p, opts = {}) {
    return `<img class="${opts.cls || 'pp-img'}" src="${p.img}" alt="${esc(p.koMain)}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async" width="512" height="512">`;
  }

  /* 여러 인물이 겹쳐 서 있는 작은 그림 (홈 메뉴용) */
  function crowd(ids) {
    const pick = (ids || ['noah', 'moses', 'david', 'esther', 'jesus', 'peter', 'paul']).map((id) => byId.get(id)).filter(Boolean);
    return `<div class="crowd-imgs" role="img" aria-label="성경 인물들이 모여 있는 그림">${pick.map((p) => `<img src="${p.img}" alt="" loading="lazy">`).join('')}</div>`;
  }

  /* ---------- 성경 인물 페이지 맨 위: YEM 찬양팀 그림 (예수님 둘레에서 찬양하는 성경 친구들) ---------- */
  function hero(counts) {
    return `<section class="bp-hero">
      <img class="art-hero-img" src="assets/hero/praise-team.webp" alt="예수님 둘레에서 성경 친구들이 함께 찬양하는 YEM 찬양팀 그림" width="1536" height="1024" fetchpriority="high">
      <div class="bp-hero-text">
        <p class="bp-kicker">YEM Bible Friends</p>
        <h2>성경 속 친구 ${counts.all}명을 만나요!</h2>
        <p>아담부터 누가까지, 하나님과 함께 걸어간 사람들이에요.<br>
          <b>영어 이름</b>을 누르면 두 번 읽어 줘요. 처음엔 빠르게, 두 번째는 천천히!<br>
          <b>그림</b>을 누르면 이 그림이 어떤 성경 이야기에서 나왔는지 영어로 알려 줘요.</p>
        <div class="bp-stats"><span class="ot">📜 구약 ${counts.OT}명</span><span class="nt">✝️ 신약 ${counts.NT}명</span></div>
      </div>
    </section>`;
  }

  /* ---------- 카드 ---------- */
  function card(p) {
    return `<article class="bcard" data-t="${p.t}" data-id="${p.id}">
      <button type="button" class="bc-pic" data-pinfo="${p.id}" aria-label="${esc(p.koMain)} 그림 소개 보기">
        ${portrait(p)}<span class="bc-tip">📖 소개</span>
      </button>
      <span class="bc-tag">${p.tag}</span>
      <button type="button" class="bc-name" data-pname="${p.id}" aria-label="${esc(p.en)} 이름 두 번 듣기">
        <b lang="en">${esc(p.en)}</b><span class="bc-spk" aria-hidden="true">🔊</span>
      </button>
      <span class="bc-ipa">${esc(p.ipa)}</span>
      <span class="bc-ko">${esc(p.koMain)}${p.koSub ? `<small>${esc(p.koSub)}</small>` : ''}</span>
      ${p.desc ? `<span class="bc-desc">${esc(p.desc)}</span>` : ''}
    </article>`;
  }

  /* ---------- 이름 두 번 읽기: 빠르게 → 천천히 ---------- */
  let audio = null;
  let playing = null; // { el, token }
  function stopName() {
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (playing && playing.el) playing.el.classList.remove('speaking', 'slow');
    playing = null;
  }
  function sayName(p, el) {
    stopName();
    if (window.onVoicePlay) window.onVoicePlay(p.en);
    const token = {};
    playing = { el, token };
    const steps = [{ src: `${DIR}name/${p.id}.mp3`, rate: 1, slow: false }, { src: `${DIR}name/${p.id}-slow.mp3`, rate: 0.6, slow: true }];
    const mark = (slow) => { if (el) { el.classList.add('speaking'); el.classList.toggle('slow', slow); } };
    const done = () => { if (playing && playing.token === token) stopName(); };
    const say = (k) => {
      if (!playing || playing.token !== token) return;
      if (k >= steps.length) return done();
      const s = steps[k];
      mark(s.slow);
      if (!audio) audio = new Audio();
      audio.onended = () => setTimeout(() => say(k + 1), 350);
      audio.onerror = () => fallback(k);
      audio.src = s.src;
      audio.playbackRate = 1;
      audio.play().catch(() => fallback(k));
    };
    // 음성 파일을 못 쓰면 기기 음성으로
    const fallback = (k) => {
      if (!playing || playing.token !== token) return;
      if (!('speechSynthesis' in window)) return done();
      audio.onended = audio.onerror = null;
      const u = new SpeechSynthesisUtterance(p.en.replace(/[()]/g, ''));
      u.lang = 'en-US'; u.rate = steps[k].rate;
      mark(steps[k].slow);
      u.onend = () => (k + 1 < steps.length ? setTimeout(() => fallback(k + 1), 350) : done());
      u.onerror = done;
      speechSynthesis.speak(u);
    };
    say(0);
  }

  /* ---------- 그림 소개 창 ---------- */
  let modalList = ALL;
  function detailHtml(p) {
    const i = modalList.indexOf(p);
    const prev = modalList[(i - 1 + modalList.length) % modalList.length];
    const next = modalList[(i + 1) % modalList.length];
    return `<div class="modal-bg bp-modal-bg" data-close>
      <div class="bp-modal" role="dialog" aria-modal="true" aria-labelledby="bpm-name" data-t="${p.t}">
        <button type="button" class="bpm-x" data-close aria-label="닫기">✕</button>
        <div class="bpm-pic">${portrait(p, { eager: true, cls: 'bpm-img' })}</div>
        <span class="bc-tag">${p.tag}</span>
        <button type="button" class="bc-name bpm-name" id="bpm-name" data-pname="${p.id}" aria-label="${esc(p.en)} 이름 두 번 듣기">
          <b lang="en">${esc(p.en)}</b><span class="bc-spk" aria-hidden="true">🔊</span>
        </button>
        <p class="bpm-sub"><span class="bc-ipa">${esc(p.ipa)}</span>${p.read ? ` · ${esc(p.read)}` : ''}</p>
        <p class="bpm-ko">${esc(p.koMain)}${p.koSub ? ` <small>(${esc(p.koSub)})</small>` : ''}</p>
        ${p.ref || p.refEn ? `<p class="bpm-ref">📖 ${esc(p.ref)}${p.refEn ? ` <span lang="en">· ${esc(p.refEn)}</span>` : ''}</p>` : ''}
        <div class="bpm-story">
          <p class="bpm-en" lang="en">${esc(p.intro || 'The story card for this friend is coming soon!')}</p>
          ${p.introKo ? `<button type="button" class="bpm-more" data-ko aria-expanded="false">자세히 보기 · 한국어 풀이 ▾</button>
          <p class="bpm-kotext" hidden>${esc(p.introKo)}</p>` : ''}
        </div>
        <div class="bpm-nav">
          <button type="button" class="ghost sm" data-go="${prev.id}" aria-label="이전 인물"><span class="ar">←</span> ${esc(prev.koMain)}</button>
          <button type="button" class="ghost sm" data-go="${next.id}" aria-label="다음 인물">${esc(next.koMain)} <span class="ar">→</span></button>
        </div>
      </div>
    </div>`;
  }
  function closeDetail() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
    stopName();
  }
  function onKey(e) {
    if (e.key === 'Escape') closeDetail();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const btns = document.querySelectorAll('.bpm-nav [data-go]');
      const b = btns[e.key === 'ArrowLeft' ? 0 : 1];
      if (b) b.click();
    }
  }
  function openDetail(id, list) {
    const p = byId.get(id);
    const root = document.getElementById('modal-root');
    if (!p || !root) return;
    if (list && list.includes(p)) modalList = list;
    else if (!modalList.includes(p)) modalList = ALL;
    stopName();
    root.innerHTML = detailHtml(p);
    root.onclick = (e) => {
      const t = e.target;
      if (t.closest('[data-pname]')) { sayName(p, t.closest('[data-pname]')); return; }
      if (t.closest('[data-ko]')) {
        const b = t.closest('[data-ko]');
        const ko = root.querySelector('.bpm-kotext');
        const open = ko.hidden;
        ko.hidden = !open;
        b.setAttribute('aria-expanded', String(open));
        b.textContent = open ? '한국어 풀이 접기 ▴' : '자세히 보기 · 한국어 풀이 ▾';
        return;
      }
      if (t.closest('[data-go]')) { openDetail(t.closest('[data-go]').dataset.go); return; }
      if (t.closest('.bpm-x') || t.classList.contains('bp-modal-bg')) closeDetail();
    };
    document.removeEventListener('keydown', onKey);
    document.addEventListener('keydown', onKey);
    const x = root.querySelector('.bpm-x');
    if (x) x.focus({ preventScroll: true });
  }

  /* ---------- 인쇄용 카드 (people-cards.html) ---------- */
  const nameSize = (en) => Math.min(15, 86 / (en.length * 0.62)).toFixed(2);
  function front(p) {
    return `<div class="pcard pc-front" style="--band:${p.band}">
      <div class="pc-art">${portrait(p, { eager: true })}</div>
      <p class="pc-desc">${esc(p.desc)}</p>
      <div class="pc-band"><span style="font-size:${nameSize(p.en)}cqw">${esc(p.en)}</span></div>
      <div class="pc-ko">${esc(p.koMain)}</div>
      <div class="pc-foot"><span class="pc-ref">${esc(p.ref)}</span><i></i><span class="pc-meta"><small>YEM 성경 인물</small>${p.t === 'OT' ? '구약' : '신약'} No.${String(p.no).padStart(2, '0')}</span></div>
    </div>`;
  }
  function back(p) {
    return `<div class="pcard pc-back" style="--band:${p.band}">
      <img src="assets/yunhee/logo.png" alt="">
      <b>YEM</b><small>영어예배부 찬양학습</small>
      <div class="pc-no">${p.t === 'OT' ? '구약' : '신약'} No.${String(p.no).padStart(2, '0')}</div>
      <small class="pc-url">yem-brown.vercel.app</small>
    </div>`;
  }

  /* 다른 페이지(찬양 · 문장) 맨 위에도 같은 모양의 큰 그림 소개 */
  window.artHero = ({ img, alt, kicker, title, body }) => `<section class="bp-hero">
      <img class="art-hero-img" src="assets/hero/${img}.webp" alt="${esc(alt)}" width="1536" height="1024" fetchpriority="high">
      <div class="bp-hero-text"><p class="bp-kicker">${esc(kicker)}</p><h2>${esc(title)}</h2><p>${body}</p></div>
    </section>`;

  window.PEOPLE = ALL;
  window.PEOPLE_ART = { portrait, crowd, hero, card, sayName, stopName, openDetail, front, back, byId };
})();

/* YEM 사진 꾸미기 (리더 라운지 인증 사진)
   찍거나 고른 사진을 둥근 네모 프레임에 넣고, 날마다 다른 예수님(7가지)이 축복해 줘요.
   프레임 색 · 무늬 · 스티커는 아이 마음대로. 아기들도 누르기만 하면 돼요.
   PHOTO_FRAME.open(file, { day: 1~7, name }) → 꾸민 사진(dataURL) 또는 취소하면 null */
window.PHOTO_FRAME = (() => {
  const A = 'assets/frame/';
  const JESUS = [
    ['j1', 'God bless you!', '오늘도 축복해'],
    ['j2', 'Grow strong!', '쑥쑥 자라라'],
    ['j3', 'I love you!', '너를 사랑해'],
    ['j4', 'Well done!', '참 잘했어'],
    ['j5', 'I pray for you!', '너를 위해 기도해'],
    ['j6', 'You can do it!', '힘내, 할 수 있어'],
    ['j7', 'I am always with you!', '언제나 함께해'],
  ];
  const COLORS = [['#fff4d6', '#e9b64f'], ['#ffd6e3', '#f08cab'], ['#d9f0ff', '#6fb4e6'], ['#dff5e6', '#6cc48e'], ['#e8dcff', '#9a7be0'], ['#1a1530', '#ffd98a']];
  const PATTERNS = ['none', 'dots', 'stars', 'hearts'];
  const PAT_NAME = { none: '무늬 없음', dots: '땡땡이', stars: '별', hearts: '하트' };
  const STICKERS = ['s-heart', 's-sun', 's-flower', 's-rainbow', 's-dove', 's-pray'];
  const S = 1080; // 결과 사진 크기 (정사각형)
  const IN = { x: 72, y: 72, w: S - 144, h: S - 144, r: 96 }; // 사진이 들어가는 둥근 네모
  const cache = {};
  const load = (src) => cache[src] || (cache[src] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }));

  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function star(g, cx, cy, R) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr2 = i % 2 ? R * 0.45 : R; g.lineTo(cx + rr2 * Math.cos(a), cy + rr2 * Math.sin(a)); }
    g.closePath(); g.fill();
  }
  function heart(g, cx, cy, s) {
    g.beginPath(); g.moveTo(cx, cy + s * 0.35);
    g.bezierCurveTo(cx - s, cy - s * 0.35, cx - s * 0.45, cy - s, cx, cy - s * 0.45);
    g.bezierCurveTo(cx + s * 0.45, cy - s, cx + s, cy - s * 0.35, cx, cy + s * 0.35); g.fill();
  }

  async function draw(cv, st) {
    const g = cv.getContext('2d');
    const [bg, accent] = COLORS[st.color];
    // 프레임 바탕 + 무늬
    g.fillStyle = bg; g.fillRect(0, 0, S, S);
    g.save(); g.globalAlpha = st.color === 5 ? 0.35 : 0.45; g.fillStyle = accent;
    for (let y = 18, row = 0; y < S; y += 64, row++) {
      for (let x = row % 2 ? 50 : 18; x < S; x += 64) {
        if (st.pattern === 'dots') { g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); }
        if (st.pattern === 'stars') star(g, x, y, 13);
        if (st.pattern === 'hearts') heart(g, x, y + 4, 14);
      }
    }
    g.restore();
    // 사진 (둥근 네모 안에 꽉 차게)
    g.save(); rr(g, IN.x, IN.y, IN.w, IN.h, IN.r); g.clip();
    const p = st.photo;
    const k = Math.max(IN.w / p.width, IN.h / p.height);
    g.drawImage(p, IN.x + (IN.w - p.width * k) / 2, IN.y + (IN.h - p.height * k) / 2, p.width * k, p.height * k);
    g.restore();
    g.lineWidth = 12; g.strokeStyle = '#fff'; rr(g, IN.x, IN.y, IN.w, IN.h, IN.r); g.stroke();
    // 왼쪽 위 이름표
    const font = '"Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif';
    const tag = `YEM · DAY ${st.day}${st.name ? ` · ${st.name}` : ''}`;
    g.font = `900 34px ${font}`;
    const tw = g.measureText(tag).width + 48;
    g.fillStyle = '#1a1530'; rr(g, 36, 30, tw, 64, 32); g.fill();
    g.fillStyle = '#ffd98a'; g.textBaseline = 'middle'; g.fillText(tag, 60, 63);
    // 스티커
    for (const s of st.stickers) { const im = await load(A + s.id + '.webp'); const w = s.size; g.drawImage(im, s.x - w / 2, s.y - (w * im.height / im.width) / 2, w, w * im.height / im.width); }
    // 예수님 + 말풍선
    const J = JESUS[st.jesus];
    const jim = await load(A + J[0] + '.webp');
    const jw = 380, jh = jw * jim.height / jim.width;
    const jx = S - jw - 6, jy = S - jh - 4;
    g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 24; g.drawImage(jim, jx, jy, jw, jh); g.restore();
    g.font = `900 40px ${font}`; const w1 = g.measureText(J[1]).width;
    g.font = `800 32px ${font}`; const w2 = g.measureText(J[2]).width;
    const bw = Math.max(w1, w2) + 60, bh = 118;
    const bx = Math.max(24, jx - bw + 70), by = jy - bh + 30;
    g.fillStyle = '#fff'; g.save(); g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 18; rr(g, bx, by, bw, bh, 40); g.fill(); g.restore();
    g.beginPath(); g.moveTo(bx + bw - 120, by + bh - 2); g.lineTo(bx + bw - 70, by + bh + 34); g.lineTo(bx + bw - 60, by + bh - 2); g.fill();
    g.textAlign = 'center'; g.fillStyle = '#b5740f'; g.font = `900 40px ${font}`; g.fillText(J[1], bx + bw / 2, by + 42);
    g.fillStyle = '#1a1530'; g.font = `800 32px ${font}`; g.fillText(J[2], bx + bw / 2, by + 86);
    g.textAlign = 'left';
  }

  function open(file, opt = {}) {
    return new Promise(async (resolve) => {
      let photo;
      try { photo = await createImageBitmap(file); } catch (e) {
        try { photo = await load(URL.createObjectURL(file)); } catch (e2) { resolve(null); return; }
      }
      const st = { photo, day: opt.day || 1, name: opt.name || '', jesus: ((opt.day || 1) - 1) % 7, color: 0, pattern: 'none', stickers: [] };
      const el = document.createElement('div');
      el.className = 'pf';
      el.innerHTML = `<div class="pf-in" role="dialog" aria-modal="true" aria-label="사진 꾸미기">
        <p class="pf-h">예쁘게 꾸며요!</p>
        <div class="pf-cv"><canvas width="${S}" height="${S}"></canvas></div>
        <div class="pf-row" aria-label="프레임 색">${COLORS.map((c, i) => `<button type="button" class="pf-col ${i ? '' : 'on'}" data-col="${i}" style="--c:${c[0]};--a:${c[1]}" aria-label="색 ${i + 1}"></button>`).join('')}</div>
        <div class="pf-row" aria-label="무늬">${PATTERNS.map((p) => `<button type="button" class="pf-pat ${p === 'none' ? 'on' : ''}" data-pat="${p}">${PAT_NAME[p]}</button>`).join('')}</div>
        <div class="pf-row pf-st" aria-label="스티커 붙이기">${STICKERS.map((s) => `<button type="button" data-st="${s}"><img src="${A}${s}.webp" alt=""></button>`).join('')}<button type="button" class="pf-undo" data-undo>하나 빼기</button></div>
        <div class="pf-row pf-j" aria-label="예수님 고르기">${JESUS.map((j, i) => `<button type="button" class="${i === st.jesus ? 'on' : ''}" data-j="${i}"><img src="${A}${j[0]}.webp" alt="${j[2]}"></button>`).join('')}</div>
        <p class="pf-tip">스티커는 손가락으로 끌어서 옮겨요</p>
        <div class="pf-btns"><button type="button" class="pf-no" data-cancel>그만할래요</button><button type="button" class="pf-ok" data-ok>이대로 올리기</button></div>
      </div>`;
      document.body.appendChild(el);
      document.documentElement.classList.add('pf-lock');
      const cv = el.querySelector('canvas');
      let busy = false, again = false;
      const redraw = async () => { if (busy) { again = true; return; } busy = true; await draw(cv, st); busy = false; if (again) { again = false; redraw(); } };
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      redraw();
      const done = (v) => { el.remove(); document.documentElement.classList.remove('pf-lock'); resolve(v); };
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.col) { st.color = +b.dataset.col; el.querySelectorAll('.pf-col').forEach((x) => x.classList.toggle('on', x === b)); redraw(); }
        else if (b.dataset.pat) { st.pattern = b.dataset.pat; el.querySelectorAll('.pf-pat').forEach((x) => x.classList.toggle('on', x === b)); redraw(); }
        else if (b.dataset.st) {
          const n = st.stickers.length;
          st.stickers.push({ id: b.dataset.st, size: 190, x: IN.x + 140 + ((n * 170) % (IN.w - 420)), y: IN.y + 170 + (Math.floor(n / 3) * 180) % (IN.h - 520) });
          redraw();
        }
        else if (b.dataset.undo !== undefined) { st.stickers.pop(); redraw(); }
        else if (b.dataset.j) { st.jesus = +b.dataset.j; el.querySelectorAll('.pf-j button').forEach((x) => x.classList.toggle('on', x === b)); redraw(); }
        else if (b.dataset.cancel !== undefined) done(null);
        else if (b.dataset.ok !== undefined) done(cv.toDataURL('image/jpeg', 0.86));
      });
      // 스티커 끌어서 옮기기
      let drag = null;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * S, y: ((e.clientY - r.top) / r.height) * S }; };
      cv.addEventListener('pointerdown', (e) => {
        const p = pos(e);
        for (let i = st.stickers.length - 1; i >= 0; i--) {
          const s = st.stickers[i];
          if (Math.hypot(p.x - s.x, p.y - s.y) < s.size * 0.6) { drag = { s, dx: p.x - s.x, dy: p.y - s.y }; st.stickers.splice(i, 1); st.stickers.push(s); cv.setPointerCapture(e.pointerId); e.preventDefault(); return; }
        }
      });
      cv.addEventListener('pointermove', (e) => { if (!drag) return; const p = pos(e); drag.s.x = p.x - drag.dx; drag.s.y = p.y - drag.dy; redraw(); });
      const end = () => { drag = null; };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    });
  }
  return { open, JESUS };
})();

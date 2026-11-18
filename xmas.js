/* YEM 크리스마스 (#xmas · #frame · #card)
   - #frame : 휴대폰 카메라 / 앨범 사진에 스토리북 캐릭터 프레임 씌우기
   - #card  : 캐릭터 룸 · 장면을 고르고 캐릭터를 놓아 성탄 카드 만들기
   - 사진은 서버로 보내지 않아요. 모든 그림은 이 기기 안의 canvas에서 만들어져요.
   - 배경 그림: assets/xmas/bg/*.webp (만드는 스크립트: C:/workspace/yem/christmas/키트/make_xmas_assets.py)
   - 캐릭터: assets/people/img|scene|prop/*.webp (배경 투명) */
window.XMAS = (() => {
  const P = 'assets/people/';
  const PPL = (id) => `${P}img/${id}.webp`;
  const SCN = (id) => `${P}scene/${id}.webp`;
  const PRP = (id) => `${P}prop/${id}.webp`;
  const BG = (id) => `assets/xmas/bg/${id}.webp`;
  const YH = (k) => `assets/xmas/yh-${k}.webp`;
  const W = 1080, H = 1350;
  const TITLE = '"YemXmas", "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const BODY = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", "PingFang SC", "Microsoft YaHei", sans-serif';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 공통: 그림 불러오기 · 글꼴 · 그리기 도우미 ---------- */
  const cache = {};
  const load = (src) => cache[src] || (cache[src] = new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = src;
  }));
  let fontP = null;
  const fonts = () => fontP || (fontP = (async () => {
    try {
      const f = new FontFace('YemXmas', 'url(assets/font/Cafe24Ssurround.ttf)');
      document.fonts.add(await f.load());
      await document.fonts.load(`700 40px ${BODY}`, '가A');
    } catch (e) { /* 글꼴이 없으면 기본 글꼴로 그려요 */ }
  })());

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  /* 사진/그림을 칸에 꽉 차게 (가운데 맞춤, 필요하면 좌우 반전) */
  function cover(c, src, sw, sh, x, y, w, h, mirror, zoom = 1, ox = 0, oy = 0) {
    const s = Math.max(w / sw, h / sh) * zoom;
    const dw = sw * s, dh = sh * s;
    let dx = x + (w - dw) / 2 + ox, dy = y + (h - dh) / 2 + oy;
    dx = Math.min(x, Math.max(x + w - dw, dx));
    dy = Math.min(y, Math.max(y + h - dh, dy));
    c.save();
    if (mirror) { c.translate(x * 2 + w, 0); c.scale(-1, 1); dx = x * 2 + w - dx - dw; }
    c.drawImage(src, dx, dy, dw, dh);
    c.restore();
  }
  function star(c, x, y, r, col) {
    c.save(); c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i - Math.PI / 2, rad = i % 2 ? r * 0.38 : r;
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.closePath(); c.fill(); c.restore();
  }
  function fitText(c, text, font, size, maxW) {
    let s = size;
    do { c.font = font.replace('{s}', s); s -= 2; } while (c.measureText(text).width > maxW && s > 18);
  }
  function wrap(c, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '', yy = y;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (c.measureText(t).width > maxW && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t;
    }
    c.fillText(line, x, yy);
    return yy;
  }
  /* 저장 · 공유 (카톡으로 보내기) */
  async function share(canvas, name) {
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.92));
    const file = new File([blob], name, { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'YEM Merry Christmas' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function showResult(root, canvas, name) {
    const box = root.querySelector('.xm-result');
    const url = canvas.toDataURL('image/jpeg', 0.9);
    box.innerHTML = `<div class="xm-res-in"><img src="${url}" alt="완성된 사진">
      <p>📲 <b>저장 · 공유</b>를 누르면 갤러리에 저장하거나 카톡으로 바로 보낼 수 있어요.<br><small>안 되면 사진을 꾹 눌러 저장해 주세요.</small></p>
      <div class="xm-row"><button class="btn" data-xm="share">💾 저장 · 공유</button><button class="ghost" data-xm="close">다시 하기</button></div></div>`;
    box.hidden = false;
    box.onclick = (e) => {
      const b = e.target.closest('[data-xm]');
      if (!b && e.target !== box) return;
      if (b && b.dataset.xm === 'share') share(canvas, name);
      else { box.hidden = true; box.innerHTML = ''; }
    };
  }

  /* ---------- 포토 프레임 ---------- */
  // st: [그림, x, y, 크기]  (1080 × 1350 기준, 사진 칸은 40,200 ~ 1040,1160)
  const FRAMES = [
    { id: 'b1', name: '1권', title: 'God Keeps His Promise', ko: '약속을 지키시는 하나님', ref: 'Luke 1:37', main: '#4E7FD0', soft: '#E4EEFC', ink: '#2F5CA8',
      st: [[PPL('gabriel'), -30, 950, 330], [SCN('s07_mary-before-birth'), 780, 960, 320], [PRP('p10_scroll'), 880, 120, 190]] },
    { id: 'b2', name: '2권', title: 'Off to Bethlehem', ko: '베들레헴으로', ref: 'Matthew 1:21', main: '#4E7FD0', soft: '#E4EEFC', ink: '#2F5CA8',
      st: [[SCN('s03_road-to-bethlehem'), 760, 950, 340], [SCN('s06_no-room'), -30, 960, 320]] },
    { id: 'b3', name: '3권', title: 'Good News of Great Joy', ko: '큰 기쁨의 좋은 소식', ref: 'Luke 2:11', main: '#4E7FD0', soft: '#E4EEFC', ink: '#2F5CA8',
      st: [[PPL('shepherds'), -30, 950, 330], [SCN('s04_angel-choir'), 770, 950, 330], [PRP('p05_sheep-flock'), 870, 90, 190]] },
    { id: 'b4', name: '4권', title: 'Gifts for the King', ko: '왕께 드린 선물', ref: 'John 3:16', main: '#4E7FD0', soft: '#E4EEFC', ink: '#2F5CA8',
      st: [[PPL('wise-men'), -30, 950, 330], [PRP('p07_gifts'), 790, 1020, 290], [PRP('p01_star-of-bethlehem'), 870, 90, 210]] },
    { id: 'b5', name: '5권', title: 'Waiting for Jesus', ko: '예수님을 기다린 사람들', ref: 'Luke 2:40', main: '#4E7FD0', soft: '#E4EEFC', ink: '#2F5CA8',
      st: [[PPL('simeon'), -30, 950, 330], [PPL('anna'), 780, 950, 330], [PRP('p09_oil-lamp'), 890, 110, 170]] },
    { id: 'xmas', name: '성탄', title: 'Merry Christmas', ko: 'Jesus Is Born! 예수님이 태어나셨어요', ref: 'Luke 2:11', main: '#2F5CA8', soft: '#1E3F7A', ink: '#FFFFFF', night: true,
      st: [[SCN('s02_holy-family'), 760, 950, 340], [SCN('s04_angel-choir'), -30, 960, 320], [PRP('p01_star-of-bethlehem'), 860, 70, 230]] },
    { id: 'yem', name: 'YEM', title: 'I ♥ YEM', ko: '슈퍼스타 윤희쌤과 함께 Merry Christmas!', ref: '', main: '#D6457A', soft: '#FFF0F5', ink: '#B3305F',
      st: [[YH('cheer'), 800, 950, 330], [PRP('p12_gift-heart'), 0, 1040, 240], [PRP('p01_star-of-bethlehem'), 880, 100, 180]] },
  ];

  async function drawFrame(c, f, src, sw, sh, mirror, zoom) {
    await fonts();
    const imgs = await Promise.all(f.st.map((s) => load(s[0])));
    c.clearRect(0, 0, W, H);
    // 바탕
    const g = c.createLinearGradient(0, 0, 0, H);
    if (f.night) { g.addColorStop(0, '#162E5E'); g.addColorStop(1, '#2F5CA8'); } else { g.addColorStop(0, f.soft); g.addColorStop(1, '#FFF8EE'); }
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sc = f.night ? 'rgba(255,230,140,.9)' : 'rgba(227,154,47,.55)';
    [[70, 60, 16], [210, 150, 10], [990, 40, 12], [520, 30, 9], [40, 300, 9], [1046, 420, 10], [330, 1305, 11], [760, 1320, 9]].forEach(([x, y, r]) => star(c, x, y, r, sc));
    // 제목
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = f.night ? '#FFE07A' : f.main;
    c.font = `800 26px ${BODY}`; c.fillText('YEM CHRISTMAS 2026', W / 2, 52);
    c.fillStyle = f.ink;
    fitText(c, f.title, `{s}px ${TITLE}`, 76, 700); c.fillText(f.title, W / 2, 130);
    c.fillStyle = f.night ? '#E4EEFC' : '#50202F';
    fitText(c, f.ko, `700 {s}px ${BODY}`, 34, 680); c.fillText(f.ko, W / 2, 180);
    // 사진 칸
    const px = 40, py = 200, pw = 1000, ph = 960;
    c.save(); rr(c, px, py, pw, ph, 46); c.clip();
    if (src) cover(c, src, sw, sh, px, py, pw, ph, mirror, zoom);
    else {
      c.fillStyle = f.night ? '#3B5C9C' : '#F3E9E1'; c.fillRect(px, py, pw, ph);
      c.fillStyle = f.night ? 'rgba(255,255,255,.6)' : 'rgba(80,32,47,.35)'; c.font = `700 40px ${BODY}`;
      c.fillText('📷 여기에 사진이 들어가요', W / 2, py + ph / 2);
    }
    c.restore();
    c.lineWidth = 12; c.strokeStyle = '#FFFFFF'; rr(c, px, py, pw, ph, 46); c.stroke();
    // 아래 글
    c.fillStyle = f.night ? '#FFFFFF' : f.ink; c.font = `800 30px ${BODY}`;
    const foot = 'YEM 영어예배부' + (f.ref ? '  ·  ' + f.ref : ''); fitText(c, foot, `800 {s}px ${BODY}`, 30, 440); c.fillText(foot, W / 2, 1240);
    c.fillStyle = f.night ? 'rgba(255,255,255,.75)' : 'rgba(80,32,47,.6)'; c.font = `600 24px ${BODY}`;
    fitText(c, 'Incheon Younglak Church English Ministry', `600 {s}px ${BODY}`, 24, 440); c.fillText('Incheon Younglak Church English Ministry', W / 2, 1282);
    // 캐릭터
    f.st.forEach((s, i) => { const im = imgs[i]; if (!im) return; const k = s[3] / Math.max(im.width, im.height); c.drawImage(im, s[1], s[2], im.width * k, im.height * k); });
  }

  const frameState = { f: FRAMES[0], stream: null, video: null, facing: 'user', photo: null, raf: 0, zoom: 1, busy: false };

  function frameHTML() {
    return `<section class="xm xm-frame">
      <a class="back" href="#xmas">← 크리스마스</a>
      <h1 class="xm-h">📸 캐릭터 포토 프레임</h1>
      <p class="xm-lead">스토리북 친구들과 함께 사진을 찍어요! 사진은 <b>이 휴대폰 안에서만</b> 만들어지고 어디에도 올라가지 않아요.</p>
      <div class="xm-pick" role="list">${FRAMES.map((f, i) => `<button class="xm-chip${i ? '' : ' on'}" data-frame="${i}" style="--c:${f.main}">${f.name}<small>${esc(f.title)}</small></button>`).join('')}</div>
      <div class="xm-stage"><canvas class="xm-cv" width="${W / 2}" height="${H / 2}"></canvas>
        <div class="xm-count" hidden></div></div>
      <div class="xm-zoom"><span>🔍</span><input type="range" min="1" max="2.2" step="0.05" value="1" aria-label="사진 확대"></div>
      <div class="xm-row xm-ctrl">
        <button class="btn xm-cam">📷 카메라 켜기</button>
        <label class="ghost xm-file">🖼 앨범에서 고르기<input type="file" accept="image/*" hidden></label>
      </div>
      <div class="xm-row xm-shoot" hidden>
        <button class="ghost xm-flip" title="앞 · 뒤 카메라">🔄</button>
        <button class="xm-shutter" aria-label="찍기"><span></span></button>
        <button class="ghost xm-timer" aria-pressed="false" title="3초 타이머">⏱ 3초</button>
      </div>
      <button class="btn xm-save" hidden>✨ 프레임 사진 완성하기</button>
      <p class="xm-tip">💡 카카오톡 안에서 카메라가 안 켜지면 <b>오른쪽 위 ⋮ → 다른 브라우저로 열기</b>를 누르거나, <b>앨범에서 고르기</b>로 찍어 주세요.</p>
      <div class="xm-result" hidden></div>
    </section>`;
  }

  function bindFrame(root) {
    const s = frameState;
    s.f = FRAMES[0]; s.photo = null; s.zoom = 1;
    const cv = root.querySelector('.xm-cv'), c = cv.getContext('2d');
    c.setTransform(0.5, 0, 0, 0.5, 0, 0);
    const shoot = root.querySelector('.xm-shoot'), saveBtn = root.querySelector('.xm-save');
    const zoomIn = root.querySelector('.xm-zoom input');
    const srcOf = () => s.stream && s.video && s.video.videoWidth ? [s.video, s.video.videoWidth, s.video.videoHeight, s.facing === 'user'] : s.photo ? [s.photo, s.photo.width, s.photo.height, false] : [null, 0, 0, false];
    const redraw = () => { if (s.busy) return; s.busy = true; const [a, b, d, m] = srcOf(); drawFrame(c, s.f, a, b, d, m, s.zoom).finally(() => { s.busy = false; }); };
    const loop = () => { redraw(); s.raf = requestAnimationFrame(loop); };
    redraw();

    root.querySelector('.xm-pick').onclick = (e) => {
      const b = e.target.closest('[data-frame]'); if (!b) return;
      root.querySelectorAll('.xm-chip').forEach((x) => x.classList.toggle('on', x === b));
      s.f = FRAMES[+b.dataset.frame]; redraw();
    };
    zoomIn.oninput = () => { s.zoom = +zoomIn.value; redraw(); };

    async function startCam() {
      stopCam();
      try {
        s.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: s.facing, width: { ideal: 1440 }, height: { ideal: 1440 } }, audio: false });
      } catch (e) {
        alert('카메라를 켤 수 없어요. 카메라 권한을 허용하거나, "앨범에서 고르기"로 사진을 넣어 주세요.');
        return;
      }
      s.video = document.createElement('video');
      s.video.playsInline = true; s.video.muted = true; s.video.srcObject = s.stream;
      await s.video.play().catch(() => {});
      s.photo = null; shoot.hidden = false; saveBtn.hidden = true;
      cancelAnimationFrame(s.raf); loop();
    }
    root.querySelector('.xm-cam').onclick = startCam;
    root.querySelector('.xm-flip').onclick = () => { s.facing = s.facing === 'user' ? 'environment' : 'user'; startCam(); };
    const timerBtn = root.querySelector('.xm-timer');
    timerBtn.onclick = () => timerBtn.setAttribute('aria-pressed', timerBtn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');

    async function capture() {
      const [a, b, d, m] = srcOf(); if (!a) return;
      // 지금 화면을 그대로 멈춘 사진으로 바꿔요
      const snap = document.createElement('canvas'); snap.width = b; snap.height = d;
      const sc = snap.getContext('2d');
      if (m) { sc.translate(b, 0); sc.scale(-1, 1); }
      sc.drawImage(a, 0, 0, b, d);
      s.photo = snap; stopCam(); shoot.hidden = true;
      await finish();
    }
    async function finish() {
      const big = document.createElement('canvas'); big.width = W; big.height = H;
      await drawFrame(big.getContext('2d'), s.f, s.photo, s.photo.width, s.photo.height, false, s.zoom);
      redraw(); saveBtn.hidden = false;
      showResult(root, big, `YEM_Christmas_${s.f.id}.jpg`);
    }
    root.querySelector('.xm-shutter').onclick = async () => {
      if (timerBtn.getAttribute('aria-pressed') === 'true') {
        const cnt = root.querySelector('.xm-count');
        for (let i = 3; i > 0; i--) { cnt.hidden = false; cnt.textContent = i; await new Promise((r) => setTimeout(r, 900)); }
        cnt.hidden = true;
      }
      capture();
    };
    saveBtn.onclick = () => { if (s.photo) finish(); };
    root.querySelector('.xm-file input').onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const im = new Image();
      im.onload = () => { stopCam(); shoot.hidden = true; s.photo = im; redraw(); saveBtn.hidden = false; };
      im.src = URL.createObjectURL(file);
    };
  }
  function stopCam() {
    const s = frameState;
    cancelAnimationFrame(s.raf);
    if (s.stream) s.stream.getTracks().forEach((t) => t.stop());
    s.stream = null; s.video = null;
  }

  /* ---------- 캐릭터 룸 · 성탄 카드 ---------- */
  // 장면: 배경 + 처음 놓이는 캐릭터 [그림, x, y, 크기]
  const SCENES = [
    { id: 'stable', name: '마구간', st: [[SCN('s02_holy-family'), 300, 330, 480], [PRP('p04_ox'), 60, 560, 250], [PRP('p03_donkey'), 790, 520, 240]] },
    { id: 'night-field', name: '목자들의 들판', st: [[PPL('shepherds'), 90, 380, 420], [PRP('p05_sheep-flock'), 600, 560, 300], [PRP('p01_star-of-bethlehem'), 780, 70, 180]] },
    { id: 'glory-sky', name: '천사들의 찬양', st: [[SCN('s04_angel-choir'), 290, 230, 500], [PRP('p05_sheep-flock'), 60, 600, 230]] },
    { id: 'road', name: '베들레헴 가는 길', st: [[SCN('s03_road-to-bethlehem'), 300, 340, 480]] },
    { id: 'bethlehem-town', name: '베들레헴 마을', st: [[SCN('s06_no-room'), 620, 380, 400], [SCN('s03_road-to-bethlehem'), 70, 420, 400]] },
    { id: 'desert-star', name: '별을 따라', st: [[PPL('wise-men'), 120, 370, 430], [PRP('p06_camels'), 560, 560, 380]] },
    { id: 'bethlehem-house', name: '경배하는 집', st: [[PPL('mary-mother'), 600, 360, 400], [PPL('wise-men'), 80, 380, 420], [PRP('p07_gifts'), 430, 640, 200]] },
    { id: 'temple', name: '성전', st: [[PPL('simeon'), 160, 360, 420], [PPL('anna'), 560, 370, 410]] },
    { id: 'nazareth-house', name: '나사렛 집', st: [[PPL('gabriel'), 120, 300, 420], [SCN('s07_mary-before-birth'), 600, 380, 400]] },
    { id: 'cover-sky', name: '별이 빛나는 밤', st: [[SCN('s02_holy-family'), 320, 340, 450], [PPL('gabriel'), 40, 160, 300]] },
  ];
  // 나 (YEM 가족): 나와 닮은 친구를 골라요 (assets/xmas/fam, 만드는 스크립트: christmas/키트/fam_web.py)
  const FAMS = [['f01_baby-girl', '아기 (여)'], ['f02_baby-boy', '아기 (남)'], ['f03_girl-small', '유치부 (여)'], ['f04_boy-small', '유치부 (남)'],
    ['f05_girl-angel', '천사 (여)'], ['f06_boy-shepherd', '목자 (남)'], ['f07_girl-glasses', '초등 (여)'], ['f08_boy-curly', '초등 (남)'],
    ['f09_girl-wise', '박사 (여)'], ['f10_boy-teen', '청소년 (남)'], ['f11_girl-teen', '청소년 (여)'], ['f12_mom', '엄마'],
    ['f13_dad', '아빠'], ['f14_grandma', '할머니'], ['f15_grandpa', '할아버지'], ['f16_teacher', '선생님']];
  const LIB = [
    ['👨‍👩‍👧 나 (YEM 가족)', FAMS.map(([id, n]) => [`assets/xmas/fam/${id}.webp`, n])],
    ['친구들', [['mary-mother', '마리아'], ['joseph-nt', '요셉'], ['gabriel', '가브리엘'], ['shepherds', '목자들'], ['wise-men', '동방박사'], ['simeon', '시므온'], ['anna', '안나'], ['zechariah', '사가랴'], ['elizabeth', '엘리사벳']].map(([id, n]) => [PPL(id), n])],
    ['장면', [['s02_holy-family', '아기 예수님'], ['s04_angel-choir', '천사 합창'], ['s03_road-to-bethlehem', '베들레헴 길'], ['s07_mary-before-birth', '마리아'], ['s05_joseph-dream', '요셉의 꿈'], ['s06_no-room', '여관']].map(([id, n]) => [SCN(id), n])],
    ['소품', [['p01_star-of-bethlehem', '별'], ['p12_gift-heart', '선물 하트'], ['p07_gifts', '예물'], ['p05_sheep-flock', '양'], ['p03_donkey', '나귀'], ['p04_ox', '소'], ['p06_camels', '낙타'], ['p02_empty-manger', '구유'], ['p09_oil-lamp', '등불'], ['p11_shepherd-crook', '지팡이'], ['p10_scroll', '두루마리'], ['p08_straw', '짚']].map(([id, n]) => [PRP(id), n])],
    ['윤희쌤', [['cheer', '응원'], ['yay', '만세'], ['heart', '하트']].map(([k, n]) => [YH(k), n])],
  ];
  const MSGS = [
    { en: 'Merry Christmas!', ko: '메리 크리스마스!', zh: '圣诞快乐！' },
    { en: 'Jesus Is Born!', ko: '예수님이 태어나셨어요!', zh: '耶稣降生了！' },
    { en: 'Joy to the World!', ko: '온 세상에 기쁨을!', zh: '普世欢腾！' },
    { en: 'God Loves You!', ko: '하나님은 너를 사랑하셔요', zh: '神爱你！' },
    { en: "You're Invited!", ko: '성탄 예배에 초대해요', zh: '欢迎来参加圣诞礼拜！', invite: true },
  ];
  const VERSE = '“Today in the town of David a Savior has been born to you.”';
  const SX = 40, SY = 40, SW = 1000, SH = 820; // 장면 칸

  const card = { scene: SCENES[0], items: [], sel: -1, msg: 0, to: '', from: '' };

  async function drawCard(c, guides) {
    await fonts();
    const bg = await load(BG(card.scene.id));
    const ims = await Promise.all(card.items.map((it) => load(it.src)));
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#FFF8EE'; c.fillRect(0, 0, W, H);
    c.save(); rr(c, SX, SY, SW, SH, 44); c.clip();
    if (bg) cover(c, bg, bg.width, bg.height, SX, SY, SW, SH, false);
    card.items.forEach((it, i) => {
      const im = ims[i]; if (!im) return;
      const k = it.s / Math.max(im.width, im.height), w = im.width * k, h = im.height * k;
      c.save(); c.translate(it.x + it.s / 2, it.y + it.s / 2); if (it.flip) c.scale(-1, 1);
      c.drawImage(im, -w / 2, it.s / 2 - h, w, h); c.restore();
      if (guides && i === card.sel) { c.save(); c.setLineDash([16, 10]); c.lineWidth = 5; c.strokeStyle = '#D6457A'; c.strokeRect(it.x, it.y, it.s, it.s); c.restore(); }
    });
    c.restore();
    c.lineWidth = 10; c.strokeStyle = '#FFFFFF'; rr(c, SX, SY, SW, SH, 44); c.stroke();
    // 글 칸
    const m = MSGS[card.msg];
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#2F5CA8'; fitText(c, m.en, `{s}px ${TITLE}`, 86, 940); c.fillText(m.en, W / 2, 960);
    c.fillStyle = '#D9734E'; c.font = `800 36px ${BODY}`; c.fillText(`${m.ko}   ${m.zh}`, W / 2, 1012);
    c.fillStyle = '#50202F'; c.font = `800 40px ${BODY}`;
    c.textAlign = 'left'; c.fillText('To. ' + (card.to || '______'), 70, 1086);
    c.textAlign = 'right'; c.fillText('From. ' + (card.from || '______'), W - 70, 1086);
    c.textAlign = 'center';
    if (m.invite) {
      c.fillStyle = '#2F5CA8'; c.font = `800 30px ${BODY}`;
      c.fillText('YEM 영어예배 · 매주 주일 오후 2시', W / 2, 1160);
      c.fillStyle = '#50202F'; c.font = `600 28px ${BODY}`; c.fillText('인천영락교회 2층 다윗홀 · 함께 와요! 🎄', W / 2, 1204);
    } else {
      c.fillStyle = '#2F5CA8'; c.font = `600 italic 28px ${BODY}`; wrap(c, VERSE, W / 2, 1160, 900, 38);
      c.font = `800 26px ${BODY}`; c.fillText('Luke 2:11 (NIV)', W / 2, 1210);
    }
    c.fillStyle = 'rgba(80,32,47,.55)'; c.font = `700 22px ${BODY}`;
    c.fillText('YEM 영어예배부 · yem-brown.vercel.app', W / 2, 1300);
    [[60, 1300, 12], [1020, 1300, 12], [70, 940, 10], [1010, 930, 10]].forEach(([x, y, r]) => star(c, x, y, r, 'rgba(227,154,47,.7)'));
  }

  function cardHTML() {
    return `<section class="xm xm-card">
      <a class="back" href="#xmas">← 크리스마스</a>
      <h1 class="xm-h">🎄 캐릭터 룸 · 성탄 카드</h1>
      <p class="xm-lead"><b>나와 닮은 친구</b>를 고르고, 장면 속에 <b>손가락으로 끌어서</b> 놓아 보세요. 이름을 쓰면 나만의 성탄 카드가 완성돼요!</p>
      <div class="xm-stage"><canvas class="xm-cv" width="${W / 2}" height="${H / 2}"></canvas></div>
      <div class="xm-row xm-tools" hidden>
        <button class="ghost" data-t="big">➕ 크게</button><button class="ghost" data-t="small">➖ 작게</button>
        <button class="ghost" data-t="flip">↔ 뒤집기</button><button class="ghost" data-t="front">⬆ 앞으로</button><button class="ghost" data-t="del">🗑 빼기</button>
      </div>
      <h2 class="xm-sub">1. 장면 고르기</h2>
      <div class="xm-scenes">${SCENES.map((s, i) => `<button class="xm-scene${i ? '' : ' on'}" data-scene="${i}"><img src="${BG(s.id)}" alt="" loading="lazy"><span>${s.name}</span></button>`).join('')}</div>
      <h2 class="xm-sub">2. 친구 · 소품 더하기 <small>누르면 카드에 들어가요</small></h2>
      <div class="xm-tabs">${LIB.map(([n], i) => `<button class="xm-tab${i ? '' : ' on'}" data-tab="${i}">${n}</button>`).join('')}</div>
      <div class="xm-lib">${LIB.map(([, list], i) => `<div class="xm-libset" data-set="${i}"${i ? ' hidden' : ''}>${list.map(([src, n]) => `<button class="xm-item" data-add="${src}"><img src="${src}" alt="" loading="lazy"><span>${n}</span></button>`).join('')}</div>`).join('')}</div>
      <h2 class="xm-sub">3. 인사말 · 이름</h2>
      <div class="xm-msgs">${MSGS.map((m, i) => `<button class="xm-chip${i ? '' : ' on'}" data-msg="${i}" style="--c:#2F5CA8">${esc(m.en)}<small>${m.ko}</small></button>`).join('')}</div>
      <div class="xm-names"><label>To. <input maxlength="14" data-n="to" placeholder="받는 사람 (예: 지민)"></label><label>From. <input maxlength="14" data-n="from" placeholder="보내는 사람 (내 이름)"></label></div>
      <button class="btn xm-make">✨ 카드 완성하기</button>
      <div class="xm-result" hidden></div>
    </section>`;
  }

  function setScene(i) {
    card.scene = SCENES[i];
    card.items = card.scene.st.map(([src, x, y, s]) => ({ src, x, y, s, flip: false }));
    card.sel = -1;
  }

  function bindCard(root) {
    setScene(0); card.msg = 0;
    const cv = root.querySelector('.xm-cv'), c = cv.getContext('2d');
    c.setTransform(0.5, 0, 0, 0.5, 0, 0);
    const tools = root.querySelector('.xm-tools');
    let busy = false, again = false;
    const redraw = () => {
      tools.hidden = card.sel < 0;
      if (busy) { again = true; return; }
      busy = true;
      drawCard(c, true).finally(() => { busy = false; if (again) { again = false; redraw(); } });
    };
    redraw();

    // 끌어서 옮기기
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; };
    let drag = null;
    cv.addEventListener('pointerdown', (e) => {
      const [x, y] = pt(e);
      let hit = -1;
      for (let i = card.items.length - 1; i >= 0; i--) { const it = card.items[i]; if (x >= it.x && x <= it.x + it.s && y >= it.y && y <= it.y + it.s) { hit = i; break; } }
      card.sel = hit;
      if (hit >= 0) { drag = { dx: x - card.items[hit].x, dy: y - card.items[hit].y }; cv.setPointerCapture(e.pointerId); e.preventDefault(); }
      redraw();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag || card.sel < 0) return;
      const [x, y] = pt(e), it = card.items[card.sel];
      it.x = Math.max(SX - it.s / 2, Math.min(SX + SW - it.s / 2, x - drag.dx));
      it.y = Math.max(SY - it.s / 2, Math.min(SY + SH - it.s / 2, y - drag.dy));
      redraw();
    });
    const up = () => { drag = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    root.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      if (d.scene) { root.querySelectorAll('.xm-scene').forEach((x) => x.classList.toggle('on', x === b)); setScene(+d.scene); redraw(); }
      else if (d.tab) {
        root.querySelectorAll('.xm-tab').forEach((x) => x.classList.toggle('on', x === b));
        root.querySelectorAll('.xm-libset').forEach((x) => { x.hidden = x.dataset.set !== d.tab; });
      }
      else if (d.add) { const k = card.items.length; card.items.push({ src: d.add, x: [60, 720, 390, 220, 560][k % 5], y: 500 - (k % 2) * 60, s: 300, flip: false }); card.sel = card.items.length - 1; redraw(); }
      else if (d.msg) { root.querySelectorAll('[data-msg]').forEach((x) => x.classList.toggle('on', x === b)); card.msg = +d.msg; redraw(); }
      else if (d.t && card.sel >= 0) {
        const it = card.items[card.sel];
        if (d.t === 'big') { it.x -= 25; it.y -= 25; it.s = Math.min(900, it.s + 50); }
        if (d.t === 'small') { it.x += 25; it.y += 25; it.s = Math.max(100, it.s - 50); }
        if (d.t === 'flip') it.flip = !it.flip;
        if (d.t === 'front') { card.items.push(card.items.splice(card.sel, 1)[0]); card.sel = card.items.length - 1; }
        if (d.t === 'del') { card.items.splice(card.sel, 1); card.sel = -1; }
        redraw();
      }
      else if (b.classList.contains('xm-make')) {
        card.sel = -1; redraw();
        const big = document.createElement('canvas'); big.width = W; big.height = H;
        drawCard(big.getContext('2d'), false).then(() => showResult(root, big, `YEM_Christmas_Card${card.from ? '_' + card.from : ''}.jpg`));
      }
    };
    root.querySelectorAll('[data-n]').forEach((inp) => { inp.oninput = () => { card[inp.dataset.n] = inp.value.trim(); redraw(); }; });
  }

  /* ---------- 크리스마스 첫 화면 ---------- */
  function hubHTML() {
    return `<section class="xm xm-hub">
      <div class="xm-hero" style="--bg:url(${BG('cover-sky')})">
        <small>YEM CHRISTMAS 2026</small><h1>Merry Christmas!</h1>
        <p>스토리북 친구들과 함께 예수님 탄생을 축하해요 🎄</p></div>
      <div class="xm-go">
        <a class="xm-tile" href="#frame"><span class="xm-tile-art"><img src="${PPL('shepherds')}" alt=""><img src="${SCN('s04_angel-choir')}" alt=""></span>
          <b>📸 캐릭터 포토 프레임</b><em>셀카를 찍으면 책 속 친구들이 함께 들어와요. 프레임 7가지!</em><i>사진 찍으러 가기 →</i></a>
        <a class="xm-tile" href="#card"><span class="xm-tile-art"><img src="${SCN('s02_holy-family')}" alt=""><img src="${PRP('p01_star-of-bethlehem')}" alt=""></span>
          <b>🎄 캐릭터 룸 · 성탄 카드</b><em>장면을 고르고 친구들을 놓아 카드를 만들어 카톡으로 보내요.</em><i>카드 만들러 가기 →</i></a>
        <a class="xm-tile" href="#books"><span class="xm-tile-art"><img src="${PPL('wise-men')}" alt=""><img src="${PPL('simeon')}" alt=""></span>
          <b>📖 크리스마스 스토리북 5권</b><em>원어민 목소리로 듣고, 영어 · 중국어로 읽어요.</em><i>책 읽으러 가기 →</i></a>
      </div>
      <div class="xm-mission"><b>⭐ 이번 주 크리스마스 미션</b>
        <ol><li>이번 주 스토리북을 끝까지 들어요</li><li>그 권의 <b>포토 프레임</b>으로 가족과 한 장 찍어요</li><li>성탄 카드를 만들어 친구에게 보내요 💌</li></ol></div>
    </section>`;
  }

  function render(parts) {
    if (parts[0] === 'frame') return frameHTML();
    if (parts[0] === 'card') return cardHTML();
    return hubHTML();
  }
  function bind(root, parts) {
    if (parts[0] === 'frame') bindFrame(root);
    else if (parts[0] === 'card') bindCard(root);
  }
  return { render, bind, stop: stopCam };
})();

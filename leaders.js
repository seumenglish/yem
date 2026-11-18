/* YEM 리더 챌린지 (#challenge 아이 화면 · #admin 관리자 화면)
   기록은 비공개 서버(Supabase 함수 "yem")에만 저장돼요. 이 파일에는 이름 · 사진이 들어 있지 않아요.
   - 아이: YEM 인증 코드 → 부서 → 내 이름 → 오늘 사진 올리기 → 예수님 칭찬 스티커 → 7일이면 수료증
   - 관리자: 별도 비밀번호(이 창을 닫으면 다시 잠겨요) → 인증 현황 · 수동 인증 · 금요일 알림 · 수료증 수여 체크 */
window.LEADERS = (() => {
  const API = 'https://wtfeoakjzzjkcpstultn.supabase.co/functions/v1/yem';
  const CH = 'thanks2026';
  const DEPTS = [['유치부', '🧸', 'Kindergarten'], ['초등부', '🎒', 'Elementary'], ['중고등부', '🎧', 'Youth'], ['성인부', '🙏', 'Adults']];
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const DOW_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem('yem.lead.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yem.lead.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
    del(k) { try { localStorage.removeItem('yem.lead.' + k); } catch (e) { /* 무시 */ } },
  };
  // 관리자 열쇠는 창을 닫으면 사라져요 (엄마 폰을 아이가 써도 안전)
  const ss = {
    get(k) { try { return sessionStorage.getItem('yem.lead.' + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('yem.lead.' + k, v); } catch (e) { /* 무시 */ } },
    del(k) { try { sessionStorage.removeItem('yem.lead.' + k); } catch (e) { /* 무시 */ } },
  };
  const MSG = {
    bad_code: '코드가 맞지 않아요. 선생님께 YEM 코드를 물어봐요. (Wrong code)',
    bad_password: '비밀번호가 맞지 않아요.',
    bad_setup_key: '처음 설정 열쇠가 맞지 않아요.',
    weak: '비밀번호는 6자 이상, 코드는 4자 이상으로 정해 주세요.',
    not_open: '지금은 챌린지 기간이 아니에요.',
    auth: '다시 들어와 주세요. (로그인이 끝났어요)',
    forbidden: '이 기능은 리더 대표만 쓸 수 있어요.',
    too_big: '사진이 너무 커요. 다른 사진으로 해 주세요.',
    bad_image: '사진 파일만 올릴 수 있어요.',
    network: '인터넷 연결을 확인하고 다시 해 주세요.',
  };
  async function api(a, body = {}) {
    let r;
    try {
      r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a, challenge: CH, ...body }) });
    } catch (e) { throw new Error('network'); }
    const j = await r.json().catch(() => ({ error: 'server' }));
    if (!r.ok || j.error) throw new Error(j.error || 'server');
    return j;
  }
  const errText = (e) => MSG[e.message] || '잠시 후 다시 해 주세요. (' + esc(e.message) + ')';

  /* 사진 줄이기: 긴 쪽 1280px JPEG */
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad_image')); };
      img.src = url;
    });
  }
  const dayList = (ch) => Array.from({ length: ch.days }, (_, i) => {
    const d = new Date(Date.parse(ch.start) + i * 864e5);
    return { iso: d.toISOString().slice(0, 10), dow: d.getUTCDay(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), i };
  });
  // 이 기기의 "내 이름 · 캐릭터"(공부방)를 그대로 써요
  function localChar() {
    try {
      const st = JSON.parse(localStorage.getItem('yem.students') || '[]');
      const cur = JSON.parse(localStorage.getItem('yem.cur') || 'null');
      const s = st.find((x) => x.id === cur);
      return s ? s.name : '';
    } catch (e) { return ''; }
  }

  const banner = (big, title) => (window.yemBanner ? window.yemBanner({
    img: 'me', alt: '어린 예수님이 어린양과 함께 즐겁게 뛰어가는 그림', kicker: 'YEM LEADERS · 7-DAY THANKFUL PRAYER',
    q: 'Give thanks to the LORD, for he is good.', ko: '“여호와께 감사하라 그는 선하시며”', ref: '시편 107:1', big, title,
  }) : `<h1>${big}</h1>`);

  /* =====================================================================
     아이 화면 (#challenge)
     ===================================================================== */
  const kid = { root: null, data: null, busy: false };
  const profiles = () => ls.get('profiles', []);
  const curProfile = () => { const ps = profiles(); return ps.find((p) => p.mid === ls.get('cur', null)) || ps[0] || null; };

  function renderKid(root) {
    kid.root = root;
    const p = curProfile();
    if (!p) { kidJoin(); return; }
    kidHome(p);
  }
  function kidShell(inner) {
    kid.root.innerHTML = `${banner('감사기도<br><em>챌린지</em>', '🙏 하루 한 장 · 7일이면 수료증!')}<section class="ld-wrap">${inner}</section>`;
  }

  /* 1) 코드 → 2) 부서 → 3) 이름 */
  function kidJoin(step = ls.get('jt', null) ? 'dept' : 'code', dept = '') {
    if (step === 'code') {
      kidShell(`
        <div class="ld-card ld-center">
          <img class="ld-yh" src="assets/yunhee/guide/heart.webp" alt="">
          <h2>YEM 리더 입장하기 <small>Enter YEM Code</small></h2>
          <p class="ld-muted">선생님이 알려 준 <b>YEM 코드</b>를 넣어요.</p>
          <form data-ld-code class="ld-form">
            <input name="code" autocomplete="off" autocapitalize="characters" inputmode="text" placeholder="YEM 코드" aria-label="YEM 코드" required>
            <button class="ld-big" type="submit">들어가기 · Enter</button>
          </form>
          <p class="ld-err" hidden></p>
        </div>`);
      return;
    }
    if (step === 'dept') {
      kidShell(`
        <div class="ld-card ld-center">
          <h2>나는 어느 부서예요? <small>Choose your group</small></h2>
          <div class="ld-depts">${DEPTS.map(([d, e, en]) => `<button type="button" class="ld-dept" data-ld-dept="${d}"><span>${e}</span><b>${d}</b><small>${en}</small></button>`).join('')}</div>
          ${profiles().length ? '<button type="button" class="ld-link" data-ld-back>← 돌아가기</button>' : ''}
        </div>`);
      return;
    }
    kidShell(`<div class="ld-card ld-center"><p class="ld-muted">이름을 불러오고 있어요…</p></div>`);
    api('roster', { jt: ls.get('jt', ''), dept }).then(({ list }) => {
      kidShell(`
        <div class="ld-card">
          <h2>${esc(dept)} · 내 이름을 눌러요 <small>Tap your name</small></h2>
          <div class="ld-names">${list.map((m) => `<button type="button" class="ld-name" data-ld-pick="${m.id}" data-n="${esc(m.name_ko)}"><b>${esc(m.name_ko)}</b>${m.name_en ? `<small>${esc(m.name_en)}</small>` : ''}</button>`).join('') || '<p class="ld-muted">이 부서에 이름이 없어요. 선생님께 말해 주세요.</p>'}</div>
          <p class="ld-muted ld-small">내 이름이 없으면 선생님께 말해 주세요. 다른 친구 이름은 누르지 않아요 🤫</p>
          <button type="button" class="ld-link" data-ld-dept-back>← 부서 다시 고르기</button>
        </div>`);
    }).catch((e) => {
      if (e.message === 'auth') { ls.del('jt'); kidJoin('code'); return; }
      kidShell(`<div class="ld-card ld-center"><p class="ld-err">${errText(e)}</p><button class="ld-link" data-ld-dept-back>← 다시</button></div>`);
    });
  }

  async function kidHome(p, opts = {}) {
    if (!kid.data || kid.data.me.id !== p.mid || opts.reload) {
      kidShell(`<div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div>`);
      try { kid.data = await api('me', { mt: p.mt }); }
      catch (e) {
        if (e.message === 'auth') { ls.set('profiles', profiles().filter((x) => x.mid !== p.mid)); renderKid(kid.root); return; }
        kidShell(`<div class="ld-card ld-center"><p class="ld-err">${errText(e)}</p><button class="ld-big" data-ld-retry>다시 해 보기</button></div>`); return;
      }
    }
    const D = kid.data;
    const ch = D.challenge;
    const days = dayList(ch);
    const got = new Set(D.entries.map((e) => e.day));
    const n = got.size;
    const ti = days.findIndex((d) => d.iso === D.today);
    const open = ti >= 0;
    const todayDone = got.has(D.today);
    const t = open ? ch.texts[ti] : null;
    const label = p.label || D.me.name_en || D.me.name_ko;
    const nextDay = days.find((d) => d.iso > D.today && !got.has(d.iso));
    const cheer = D.cert ? '🎉 챌린지 성공! 축하합니다!' : n
      ? `${n}일 성공! ${nextDay ? `${DOW[nextDay.dow]}요일도 도전하세요!` : ''}` : '오늘부터 시작해요!';
    const ps = profiles();
    kidShell(`
      <div class="ld-me">
        <div class="ld-me-who"><span class="ld-ava">${esc(label.slice(0, 1))}</span><div><small>YEM Leader</small><b>${esc(label)}</b></div></div>
        <div class="ld-me-sw">
          ${ps.length > 1 ? ps.map((x) => `<button type="button" class="ld-chip ${x.mid === p.mid ? 'on' : ''}" data-ld-switch="${x.mid}">${esc(x.label)}</button>`).join('') : ''}
          <button type="button" class="ld-chip add" data-ld-add>＋ 가족 추가</button>
        </div>
      </div>
      ${D.cert ? certCard(D, label) : ''}
      ${open ? `
      <div class="ld-today">
        <div class="ld-day-tag">DAY ${ti + 1} · ${days[ti].m}/${days[ti].d} ${DOW_EN[days[ti].dow]}</div>
        <p class="ld-say" lang="en">${esc(t.en)}</p>
        <p class="ld-say-ko">${esc(t.ko)} <span>[${esc(t.say)}]</span></p>
        <p class="ld-pray">🙏 ${esc(t.pray)}</p>
        <label class="ld-shot ${todayDone ? 'done' : ''}">
          <input type="file" accept="image/*" data-ld-photo hidden>
          <span>${todayDone ? '✅ 오늘 인증 완료! <small>사진 바꾸기</small>' : '📸 오늘 사진 올리기 <small>Upload today’s photo</small>'}</span>
        </label>
        <p class="ld-err" hidden></p>
      </div>` : `<div class="ld-today"><p class="ld-say-ko">${D.today < ch.start ? '챌린지가 곧 시작해요!' : '챌린지 기간이 끝났어요. 수고했어요! 💛'}</p></div>`}
      <div class="ld-card">
        <h3>나의 7일 <small>${esc(cheer)}</small></h3>
        <ol class="ld-week">${days.map((d) => `<li class="${got.has(d.iso) ? 'ok' : ''} ${d.iso === D.today ? 'now' : ''}"><small>${DOW[d.dow]}</small><b>${got.has(d.iso) ? '<img src="assets/people/img/jesus.webp" alt="스티커">' : d.iso < D.today ? '·' : '⬜'}</b><em>${d.m}/${d.d}</em></li>`).join('')}</ol>
        <p class="ld-muted ld-small">사진을 올리면 <b>예수님 칭찬 스티커</b>가 붙어요. 7개를 모으면 <b>수료증</b>이 바로 나와요!</p>
        ${D.entries.some((e) => e.photo) ? `<div class="ld-pics">${D.entries.filter((e) => e.photo).map((e) => `<img src="${esc(e.photo)}" alt="${esc(e.day)} 인증 사진" loading="lazy">`).join('')}</div>` : ''}
      </div>
      <p class="ld-muted ld-small ld-center">내 기록은 나와 선생님만 볼 수 있어요 🔒</p>`);
  }

  function certCard(D, label) {
    return `<div class="ld-cert">
      <div class="ld-cert-pic"><canvas data-ld-cert width="1600" height="1131" aria-label="수료증"></canvas></div>
      <div class="ld-cert-t"><b>🏅 챌린지 성공! 축하합니다 🎉</b><p>7일 동안 감사기도를 했어요. 주일에 실물 수료증도 받아요!</p>
      <button type="button" class="ld-big" data-ld-save>📥 수료증 저장하기</button></div></div>`;
  }
  function drawCert(cv, D) {
    const img = new Image();
    img.onload = () => {
      const g = cv.getContext('2d');
      g.drawImage(img, 0, 0, cv.width, cv.height);
      const bg = g.getImageData(560, 470, 1, 1).data;
      g.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      g.fillRect(560, 472, 480, 36);
      g.textAlign = 'center';
      g.fillStyle = '#5b3a1e';
      g.font = '900 52px "Pretendard", "Noto Sans KR", sans-serif';
      g.fillText(`${D.me.name_ko}${D.me.name_en ? ' ' + D.me.name_en : ''}`, 800, 454);
      g.font = '500 22px "Pretendard", "Noto Sans KR", sans-serif';
      g.fillStyle = '#9a8a78';
      g.fillText('YEM Leader · 7-Day Thankful Prayer Challenge', 800, 494);
      const day = (D.cert && D.cert.issued_at) ? new Date(Date.parse(D.cert.issued_at) + 9 * 3600e3).getUTCDate() : 22;
      g.font = '800 22px "Pretendard", sans-serif';
      g.fillStyle = '#5b3a1e';
      g.fillText(String(day), 1093, 1047);
    };
    img.src = 'assets/leaders/cert-thanks.webp';
  }

  async function onKidUpload(file) {
    if (kid.busy || !file) return;
    const p = curProfile();
    const lab = kid.root.querySelector('.ld-shot');
    const err = kid.root.querySelector('.ld-today .ld-err');
    kid.busy = true;
    if (lab) { lab.classList.add('busy'); lab.querySelector('span').innerHTML = '⏳ 올리는 중… <small>잠깐만 기다려요</small>'; }
    try {
      const image = await shrink(file);
      const r = await api('upload', { mt: p.mt, image });
      kid.data = r;
      kidHome(p);
      if (r.first) {
        stickerPop(r.done);
        if (window.YEM_HOOKS && window.YEM_HOOKS.addXp) window.YEM_HOOKS.addXp(r.done ? 50 : 20);
      }
    } catch (e) {
      if (lab) { lab.classList.remove('busy'); lab.querySelector('span').innerHTML = '📸 다시 올리기'; }
      if (err) { err.hidden = false; err.innerHTML = errText(e); }
    } finally { kid.busy = false; }
  }
  function stickerPop(done) {
    const el = document.createElement('div');
    el.className = 'ld-pop';
    el.innerHTML = `<div class="ld-pop-in"><img src="assets/people/img/jesus.webp" alt=""><b>${done ? '챌린지 성공! 🎉' : '예수님 칭찬 스티커!'}</b><p>${done ? 'Congratulations! 수료증이 나왔어요!' : 'Great job! 오늘도 감사기도 성공 ✨'}</p></div>`;
    document.body.appendChild(el);
    const bye = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
    el.addEventListener('click', bye);
    setTimeout(bye, 2600);
  }

  function bindKid(root) {
    root.addEventListener('submit', async (e) => {
      const f = e.target.closest('[data-ld-code]');
      if (!f) return;
      e.preventDefault();
      const err = root.querySelector('.ld-err');
      const btn = f.querySelector('button');
      btn.disabled = true;
      try { const { jt } = await api('join', { code: f.code.value }); ls.set('jt', jt); kidJoin('dept'); }
      catch (x) { err.hidden = false; err.textContent = MSG[x.message] || '다시 해 주세요.'; btn.disabled = false; }
    });
    root.addEventListener('click', async (e) => {
      const t = e.target;
      const dp = t.closest('[data-ld-dept]');
      if (dp) { kidJoin('names', dp.dataset.ldDept); return; }
      if (t.closest('[data-ld-dept-back]')) { kidJoin('dept'); return; }
      if (t.closest('[data-ld-back]')) { renderKid(root); return; }
      if (t.closest('[data-ld-retry]')) { renderKid(root); return; }
      const pk = t.closest('[data-ld-pick]');
      if (pk) {
        if (!confirm(`${pk.dataset.n} — 내 이름이 맞나요?`)) return;
        try {
          const ch = localChar();
          const r = await api('pick', { jt: ls.get('jt', ''), member_id: pk.dataset.ldPick, char_name: ch || undefined });
          const label = (profiles().length ? '' : ch) || r.me.char_name || r.me.name_en || r.me.name_ko;
          ls.set('profiles', [...profiles().filter((x) => x.mid !== r.me.id), { mid: r.me.id, mt: r.mt, label }]);
          ls.set('cur', r.me.id);
          kid.data = r;
          kidHome(curProfile());
        } catch (x) { alert(errText(x)); }
        return;
      }
      const sw = t.closest('[data-ld-switch]');
      if (sw) { ls.set('cur', sw.dataset.ldSwitch); kid.data = null; renderKid(root); return; }
      if (t.closest('[data-ld-add]')) { kidJoin(ls.get('jt', null) ? 'dept' : 'code'); return; }
      if (t.closest('[data-ld-save]')) {
        const cv = root.querySelector('[data-ld-cert]');
        const a = document.createElement('a');
        a.download = 'YEM_감사기도챌린지_수료증.png';
        a.href = cv.toDataURL('image/png');
        a.click();
      }
    });
    root.addEventListener('change', (e) => {
      const inp = e.target.closest('[data-ld-photo]');
      if (inp && inp.files && inp.files[0]) onKidUpload(inp.files[0]);
    });
    // 수료증 그리기 (화면이 바뀔 때마다)
    new MutationObserver(() => {
      const cv = root.querySelector('[data-ld-cert]:not([data-drawn])');
      if (cv && kid.data) { cv.dataset.drawn = '1'; drawCert(cv, kid.data); }
    }).observe(root, { childList: true, subtree: true });
  }

  /* =====================================================================
     관리자 화면 (#admin)
     ===================================================================== */
  const adm = { root: null, data: null, staff: null, tab: 'board', dept: '전체' };
  const ROLE = { leader_admin: '리더 대표', pastor: '목사님', exec_staff: '운영진', leader: '리더' };

  async function renderAdmin(root) {
    adm.root = root;
    if (!ss.get('at')) { adminGate(); return; }
    root.innerHTML = `${banner('관리자<br><em>화면</em>', '🔒 YEM 리더 대표 · 목사님 전용')}<section class="ld-wrap"><div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div></section>`;
    try { adm.data = await api('a_overview', { at: ss.get('at') }); adminDraw(); }
    catch (e) { if (e.message === 'auth') { ss.del('at'); adminGate(); } else root.querySelector('.ld-wrap').innerHTML = `<p class="ld-err">${errText(e)}</p>`; }
  }
  async function adminGate() {
    const root = adm.root;
    root.innerHTML = `${banner('관리자<br><em>화면</em>', '🔒 YEM 리더 대표 · 목사님 전용')}<section class="ld-wrap"><div class="ld-card ld-center"><p class="ld-muted">확인 중…</p></div></section>`;
    let setup = false;
    try { setup = (await api('status')).setup; } catch (e) { /* 아래 로그인 화면 */ }
    root.querySelector('.ld-wrap').innerHTML = setup ? `
      <div class="ld-card">
        <h2>처음 설정하기 <small>딱 한 번만 해요</small></h2>
        <p class="ld-muted">리더 대표 비밀번호와 아이들이 넣을 <b>YEM 인증 코드</b>를 정해요.</p>
        <form class="ld-form col" data-ld-setup>
          <label>처음 설정 열쇠 (Claude가 알려 준 8자리)<input name="setup_key" autocomplete="off" required></label>
          <label>이름<input name="name" value="슈퍼스타 윤희쌤" required></label>
          <label>관리자 비밀번호 (6자 이상)<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
          <label>YEM 인증 코드 (아이들용, 4자 이상)<input name="code" autocomplete="off" minlength="4" required placeholder="예: YEM2026"></label>
          <button class="ld-big" type="submit">설정 완료</button>
        </form><p class="ld-err" hidden></p>
      </div>` : `
      <div class="ld-card ld-center">
        <h2>관리자 비밀번호 <small>Admin</small></h2>
        <p class="ld-muted">비밀번호를 넣어야 열려요. 창을 닫으면 다시 잠겨요.</p>
        <form class="ld-form" data-ld-login>
          <input name="password" type="password" autocomplete="current-password" placeholder="비밀번호" aria-label="비밀번호" required>
          <button class="ld-big" type="submit">열기</button>
        </form><p class="ld-err" hidden></p>
      </div>`;
  }

  const nm = (m) => `${esc(m.name_ko)}${m.name_en ? ` <small>${esc(m.name_en)}</small>` : ''}`;
  function adminDraw() {
    const D = adm.data;
    const ch = D.challenge;
    const days = dayList(ch);
    const isPastor = D.role === 'pastor';
    const head = `
      <div class="ld-adm-top">
        <div><b>${esc(ROLE[D.role] || D.role)} 모드</b><small>${esc(ch.title)} · ${ch.start.slice(5).replace('-', '/')}~${ch.end.slice(5).replace('-', '/')}</small></div>
        <div class="ld-adm-act">
          <button type="button" class="ld-chip" data-ld-reload>↻ 새로고침</button>
          <button type="button" class="ld-chip" data-ld-logout>🔒 잠그기</button>
        </div>
      </div>
      ${D.alert.on ? `<div class="ld-alert"><b>⏰ 주일 수료증을 준비해 주세요!</b><p>5일 이상 인증한 사람 <b>${D.alert.list.length}명</b> (금요일 낮 12시 기준 알림)</p>
        <ul>${D.alert.list.map((m) => `<li>${nm(m)} <em>${esc(m.dept)} · ${m.n}일</em></li>`).join('') || '<li>아직 없어요</li>'}</ul></div>`
        : `<div class="ld-alert soft"><b>⏰ 금요일(${D.alert.fri.slice(5).replace('-', '/')}) 낮 12시</b>에 “5일 이상 인증한 사람” 명단이 여기에 떠요. 지금 ${D.alert.list.length}명.</div>`}
      <div class="ld-tiles">
        <div><b>${D.counts.members}</b><small>전체 명단</small></div>
        <div><b>${D.counts.joined}</b><small>참여한 사람</small></div>
        <div><b>${D.counts.stickerToday}</b><small>오늘 스티커</small></div>
        <div><b>${D.counts.certs}</b><small>수료증</small></div>
      </div>`;
    if (isPastor) {
      adm.root.querySelector('.ld-wrap').innerHTML = `${head}
        <div class="ld-card"><h3>🏅 수료증 받을 사람</h3><ul class="ld-list">${D.certs.map((m) => `<li>${nm(m)} <em>${esc(m.dept)}${m.awarded ? ' · 수여 완료' : ''}</em></li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul></div>
        <p class="ld-muted ld-small">기도 제목 · 답장 보내기는 다음 단계에서 열려요.</p>`;
      return;
    }
    const depts = ['전체', ...DEPTS.map((d) => d[0])];
    const rows = D.members.filter((m) => adm.dept === '전체' || m.dept === adm.dept);
    const tabs = [['board', '📋 인증 현황'], ['add', '➕ 수동 인증'], ['today', '⭐ 오늘 스티커'], ['certs', '🏅 수료증'], ...(D.role === 'leader_admin' ? [['set', '⚙️ 설정']] : [])];
    let body = '';
    if (adm.tab === 'board') {
      body = `<div class="ld-seg">${depts.map((d) => `<button type="button" class="ld-chip ${adm.dept === d ? 'on' : ''}" data-ld-fdept="${d}">${d}</button>`).join('')}</div>
        <div class="ld-tbl-wrap"><table class="ld-tbl"><thead><tr><th>이름</th>${days.map((d) => `<th class="${d.iso === D.today ? 'now' : ''}">${DOW[d.dow]}<small>${d.m}/${d.d}</small></th>`).join('')}<th>합계</th></tr></thead>
        <tbody>${rows.map((m) => {
          const by = Object.fromEntries(m.days.map((x) => [x.day, x]));
          return `<tr><td class="ld-tn">${nm(m)}<em>${esc(m.dept)}</em></td>${days.map((d) => {
            const x = by[d.iso];
            return `<td><button type="button" class="ld-cell ${x ? (x.method === 'manual' ? 'man' : 'ok') : ''}" data-ld-cell="${m.id}" data-day="${d.iso}" aria-label="${esc(m.name_ko)} ${d.m}/${d.d}">${x ? (x.photo ? '📷' : '✅') : ''}</button></td>`;
          }).join('')}<td class="ld-sum ${m.days.length >= ch.days ? 'full' : m.days.length >= 5 ? 'five' : ''}">${m.days.length}${m.cert ? ' 🏅' : ''}</td></tr>`;
        }).join('')}</tbody></table></div>
        <p class="ld-muted ld-small">📷 사진 있음 · ✅ 사진 없이 인증 · 노란 칸 = 선생님이 넣은 기록. 빈칸을 누르면 수동 인증, 채운 칸을 누르면 사진 보기 · 지우기.</p>`;
    } else if (adm.tab === 'add') {
      body = `<div class="ld-card"><h3>카톡으로 받은 사진 넣기</h3>
        <form class="ld-form col" data-ld-add-form>
          <label>이름<select name="member_id" required><option value="">이름 고르기</option>${DEPTS.map(([d]) => `<optgroup label="${d}">${D.members.filter((m) => m.dept === d).map((m) => `<option value="${m.id}">${esc(m.name_ko)}${m.name_en ? ' ' + esc(m.name_en) : ''}</option>`).join('')}</optgroup>`).join('')}</select></label>
          <label>날짜<select name="day" required>${days.map((d) => `<option value="${d.iso}" ${d.iso === D.today ? 'selected' : ''}>DAY ${d.i + 1} · ${d.m}/${d.d} (${DOW[d.dow]})</option>`).join('')}</select></label>
          <label>사진 (없으면 비워 두세요)<input type="file" name="photo" accept="image/*"></label>
          <button class="ld-big" type="submit">인증 추가하기</button>
        </form><p class="ld-ok" hidden></p><p class="ld-err" hidden></p></div>`;
    } else if (adm.tab === 'today') {
      body = `<div class="ld-card"><h3>⭐ 오늘(${D.today.slice(5).replace('-', '/')}) 예수님 스티커 받은 사람 · ${D.stickerToday.length}명</h3>
        <ul class="ld-list">${D.stickerToday.map((m) => `<li>${nm(m)}</li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul>
        <h3>이번 주 스티커 받은 사람 · ${D.members.filter((m) => m.days.length).length}명</h3>
        <ul class="ld-list">${D.members.filter((m) => m.days.length).sort((a, b) => b.days.length - a.days.length).map((m) => `<li>${nm(m)} <em>${m.days.length}개</em></li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul></div>`;
    } else if (adm.tab === 'certs') {
      body = `<div class="ld-card"><h3>🏅 수료증 (7일 완주 시 자동 발급)</h3>
        <ul class="ld-list">${D.members.filter((m) => m.cert).map((m) => `<li>${nm(m)} <em>${esc(m.dept)}</em>
          <label class="ld-check"><input type="checkbox" data-ld-award="${m.id}" ${m.cert.awarded ? 'checked' : ''}> 실물 수여 완료</label></li>`).join('') || '<li class="ld-muted">아직 7일을 채운 사람이 없어요.</li>'}</ul></div>`;
    } else {
      body = `<div class="ld-card"><h3>🔑 YEM 인증 코드 바꾸기</h3>
          <form class="ld-form" data-ld-code-set><input name="code" autocomplete="off" minlength="4" placeholder="새 코드" required><button class="ld-big" type="submit">바꾸기</button></form>
          <p class="ld-muted ld-small">바꾸면 새로 들어오는 사람만 새 코드를 넣어요. 이미 이름을 고른 휴대폰은 그대로예요.</p></div>
        <div class="ld-card"><h3>👥 관리자 비밀번호 (사람별)</h3>
          <ul class="ld-list" data-ld-staff>${(adm.staff || []).map((s) => `<li>${esc(s.name)} <em>${esc(ROLE[s.role] || s.role)}</em>${s.role !== 'leader_admin' ? ` <button type="button" class="ld-chip" data-ld-staff-del="${s.id}">삭제</button>` : ''}</li>`).join('') || '<li class="ld-muted">불러오는 중…</li>'}</ul>
          <form class="ld-form col" data-ld-staff-form>
            <label>이름<input name="name" placeholder="예: 샤를 목사님" required></label>
            <label>역할<select name="role"><option value="pastor">목사님 (인원 · 수료자 명단만)</option><option value="leader">리더 (인증 넣기 가능)</option><option value="exec_staff">운영진</option></select></label>
            <label>비밀번호 (6자 이상)<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
            <button class="ld-big" type="submit">추가하기</button>
          </form></div>
        <div class="ld-card"><h3>🙋 새 사람 명단에 추가</h3>
          <form class="ld-form col" data-ld-member-form>
            <label>한글 이름<input name="name_ko" required></label>
            <label>영어 이름<input name="name_en"></label>
            <label>나이 (한국 나이, 어른이면 비워 두기)<input name="age" type="number" min="1" max="99"></label>
            <button class="ld-big" type="submit">추가하기</button>
          </form></div>`;
      if (!adm.staff) api('a_staff_list', { at: ss.get('at') }).then((r) => { adm.staff = r.list; if (adm.tab === 'set') adminDraw(); }).catch(() => {});
    }
    adm.root.querySelector('.ld-wrap').innerHTML = `${head}
      <div class="ld-tabs">${tabs.map(([k, l]) => `<button type="button" class="ld-tab ${adm.tab === k ? 'on' : ''}" data-ld-tab="${k}">${l}</button>`).join('')}</div>
      ${body}`;
  }

  function modal(html) {
    const el = document.createElement('div');
    el.className = 'ld-modal';
    el.innerHTML = `<div class="ld-modal-in" role="dialog" aria-modal="true">${html}<button type="button" class="ld-x" data-ld-close aria-label="닫기">✕</button></div>`;
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-ld-close]')) el.remove(); });
    document.body.appendChild(el);
    return el;
  }
  async function cellClick(mid, day) {
    const D = adm.data;
    const m = D.members.find((x) => x.id === mid);
    const x = m.days.find((d) => d.day === day);
    const at = ss.get('at');
    const dd = day.slice(5).replace('-', '/');
    if (!x) {
      const el = modal(`<h3>${nm(m)} · ${dd} 인증 넣기</h3>
        <form class="ld-form col" data-ld-cell-add><label>사진 (없으면 비워 두세요)<input type="file" name="photo" accept="image/*"></label><button class="ld-big" type="submit">인증 추가</button></form><p class="ld-err" hidden></p>`);
      el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = '저장 중…';
        try {
          const f = e.target.photo.files[0];
          adm.data = await api('a_add', { at, member_id: mid, day, image: f ? await shrink(f) : undefined });
          el.remove(); adminDraw();
        } catch (er) { const p = el.querySelector('.ld-err'); p.hidden = false; p.innerHTML = errText(er); btn.disabled = false; btn.textContent = '인증 추가'; }
      });
      return;
    }
    const el = modal(`<h3>${nm(m)} · ${dd}</h3><p class="ld-muted">${x.method === 'manual' ? `선생님이 넣은 기록${x.by ? ` (${esc(x.by)})` : ''}` : '아이가 직접 올렸어요'}</p>
      <div class="ld-modal-pic">${x.photo ? '<p class="ld-muted">사진 불러오는 중…</p>' : '<p class="ld-muted">사진 없이 인증했어요.</p>'}</div>
      <button type="button" class="ld-chip danger" data-ld-del>이 날 인증 지우기</button>`);
    if (x.photo) api('a_photo', { at, member_id: mid, day }).then((r) => { el.querySelector('.ld-modal-pic').innerHTML = r.url ? `<img src="${esc(r.url)}" alt="인증 사진">` : ''; }).catch(() => {});
    el.querySelector('[data-ld-del]').addEventListener('click', async () => {
      if (!confirm(`${m.name_ko} ${dd} 인증을 지울까요? 사진도 함께 지워져요.`)) return;
      try { adm.data = await api('a_del', { at, member_id: mid, day }); el.remove(); adminDraw(); } catch (er) { alert(errText(er)); }
    });
  }

  function bindAdmin(root) {
    root.addEventListener('submit', async (e) => {
      const f = e.target;
      const err = f.parentElement.querySelector('.ld-err');
      const ok = f.parentElement.querySelector('.ld-ok');
      const show = (er) => { if (err) { err.hidden = false; err.innerHTML = errText(er); } else alert(errText(er)); };
      const at = ss.get('at');
      if (f.matches('[data-ld-login]')) {
        e.preventDefault();
        try { const r = await api('login', { password: f.password.value }); ss.set('at', r.at); renderAdmin(root); } catch (er) { show(er); }
      } else if (f.matches('[data-ld-setup]')) {
        e.preventDefault();
        try { const r = await api('setup', { setup_key: f.setup_key.value, name: f.name.value, password: f.password.value, code: f.code.value }); ss.set('at', r.at); renderAdmin(root); } catch (er) { show(er); }
      } else if (f.matches('[data-ld-add-form]')) {
        e.preventDefault();
        const btn = f.querySelector('button'); btn.disabled = true;
        try {
          const ph = f.photo.files[0];
          const who = f.member_id.selectedOptions[0].textContent;
          adm.data = await api('a_add', { at, member_id: f.member_id.value, day: f.day.value, image: ph ? await shrink(ph) : undefined });
          const msg = `✅ ${who} · ${f.day.selectedOptions[0].textContent} 인증을 넣었어요.`;
          adminDraw();
          const okEl = root.querySelector('.ld-ok'); if (okEl) { okEl.hidden = false; okEl.textContent = msg; }
        } catch (er) { show(er); btn.disabled = false; }
      } else if (f.matches('[data-ld-code-set]')) {
        e.preventDefault();
        try { await api('a_code', { at, code: f.code.value }); alert('YEM 인증 코드를 바꿨어요.'); f.reset(); } catch (er) { show(er); }
      } else if (f.matches('[data-ld-staff-form]')) {
        e.preventDefault();
        try { adm.staff = (await api('a_staff', { at, name: f.name.value, role: f.role.value, password: f.password.value })).list; adminDraw(); } catch (er) { show(er); }
      } else if (f.matches('[data-ld-member-form]')) {
        e.preventDefault();
        try { adm.data = await api('a_member', { at, name_ko: f.name_ko.value, name_en: f.name_en.value, age: f.age.value }); alert('명단에 추가했어요.'); adminDraw(); } catch (er) { show(er); }
      }
    });
    root.addEventListener('click', async (e) => {
      const t = e.target;
      const at = ss.get('at');
      const tb = t.closest('[data-ld-tab]');
      if (tb) { adm.tab = tb.dataset.ldTab; adminDraw(); return; }
      const fd = t.closest('[data-ld-fdept]');
      if (fd) { adm.dept = fd.dataset.ldFdept; adminDraw(); return; }
      const c = t.closest('[data-ld-cell]');
      if (c) { cellClick(c.dataset.ldCell, c.dataset.day); return; }
      if (t.closest('[data-ld-reload]')) { renderAdmin(root); return; }
      if (t.closest('[data-ld-logout]')) { ss.del('at'); adm.staff = null; adminGate(); return; }
      const sd = t.closest('[data-ld-staff-del]');
      if (sd && confirm('이 관리자 비밀번호를 지울까요?')) {
        try { adm.staff = (await api('a_staff_del', { at, id: sd.dataset.ldStaffDel })).list; adminDraw(); } catch (er) { alert(errText(er)); }
      }
    });
    root.addEventListener('change', async (e) => {
      const cb = e.target.closest('[data-ld-award]');
      if (!cb) return;
      try { adm.data = await api('a_award', { at: ss.get('at'), member_id: cb.dataset.ldAward, awarded: cb.checked }); } catch (er) { alert(errText(er)); cb.checked = !cb.checked; }
    });
  }

  return {
    kid(root) { kid.data = null; renderKid(root); bindKid(root); },
    admin(root) { renderAdmin(root); bindAdmin(root); },
  };
})();

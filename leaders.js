/* YEM 리더 (#challenge 아이 화면 · #admin 관리자 화면)
   기록은 비공개 서버(Supabase 함수 "yem")에만 있어요. 이 파일에는 이름 · 사진이 들어 있지 않아요.
   서버가 매번 권한을 검사해요: 아이 열쇠 = 자기 기록만, 관리자 열쇠 = 역할별(리더 대표 · 임명 리더 · 목사님 · 운영진). */
window.LEADERS = (() => {
  const API = 'https://wtfeoakjzzjkcpstultn.supabase.co/functions/v1/yem';
  const SITE = 'https://yem-brown.vercel.app';
  const DEPTS = [['유치부', '🧸', 'Kindergarten'], ['초등부', '🎒', 'Elementary'], ['중고등부', '🎧', 'Youth'], ['성인부', '🙏', 'Adults']];
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const DOW_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const ROLE = { leader_admin: '리더 대표', pastor: '목사님', exec_staff: '최고 운영진', leader: '임명 리더' };
  const IDLE_MIN = 20; // 관리자 화면: 20분 동안 안 쓰면 자동으로 잠겨요
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s) => esc(s).replace(/\n/g, '<br>');
  const ls = {
    get(k, d) { try { const v = localStorage.getItem('yem.lead.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yem.lead.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
    del(k) { try { localStorage.removeItem('yem.lead.' + k); } catch (e) { /* 무시 */ } },
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem('yem.lead.' + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('yem.lead.' + k, v); } catch (e) { /* 무시 */ } },
    del(k) { try { sessionStorage.removeItem('yem.lead.' + k); } catch (e) { /* 무시 */ } },
  };
  const MSG = {
    bad_code: '코드가 맞지 않아요. 선생님께 YEM 코드를 물어봐요. (Wrong code)',
    bad_password: '비밀번호가 맞지 않아요.',
    bad_setup_key: '처음 설정 열쇠가 맞지 않아요.',
    weak: '빈칸을 채워 주세요. (비밀번호 6자 이상, 코드 4자 이상)',
    not_open: '지금은 챌린지 기간이 아니에요.',
    auth: '다시 들어와 주세요.',
    forbidden: '이 기능은 볼 수 있는 권한이 없어요.',
    too_big: '사진이 너무 커요. 다른 사진으로 해 주세요.',
    bad_image: '사진 파일만 올릴 수 있어요.',
    already: '이미 저장되어 있어요.',
    network: '인터넷 연결을 확인하고 다시 해 주세요.',
  };
  async function api(a, body = {}) {
    let r;
    try { r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a, ...body }) }); }
    catch (e) { throw new Error('network'); }
    const j = await r.json().catch(() => ({ error: 'server' }));
    if (!r.ok || j.error) throw new Error(j.error || 'server');
    return j;
  }
  const errText = (e) => MSG[e.message] || `잠시 후 다시 해 주세요. (${esc(e.message)})`;
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
  const md = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
  // 이 기기의 "내 이름 · 캐릭터"(공부방)와 XP, 찬양 완주 곡 수
  function local() {
    try {
      const st = JSON.parse(localStorage.getItem('yem.students') || '[]');
      const cur = JSON.parse(localStorage.getItem('yem.cur') || 'null');
      const who = cur || 'guest';
      const p = JSON.parse(localStorage.getItem('yem.p:' + who) || '{}');
      return { name: (st.find((x) => x.id === cur) || {}).name || '', xp: Number(localStorage.getItem('yem.xp:' + who) || 0), songs: Object.keys(p).filter((k) => /:complete$/.test(k)).length };
    } catch (e) { return { name: '', xp: 0, songs: 0 }; }
  }
  const banner = (big, title) => (window.yemBanner ? window.yemBanner({
    img: 'me', alt: '어린 예수님이 어린양과 함께 즐겁게 뛰어가는 그림', kicker: 'YEM LEADERS · 나의 리더 방',
    q: 'Give thanks to the LORD, for he is good.', ko: '“여호와께 감사하라 그는 선하시며”', ref: '시편 107:1', big, title,
  }) : `<h1>${big}</h1>`);
  function modal(html) {
    const el = document.createElement('div');
    el.className = 'ld-modal';
    el.innerHTML = `<div class="ld-modal-in" role="dialog" aria-modal="true">${html}<button type="button" class="ld-x" data-ld-close aria-label="닫기">✕</button></div>`;
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-ld-close]')) el.remove(); });
    document.body.appendChild(el);
    return el;
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (x) { /* 무시 */ }
      ta.remove(); return ok;
    }
  }

  /* ---------- 배지 모양 (그림은 나중에 GPT로 바꿔요) ---------- */
  const BADGE_LOOK = {
    sprout: ['🌱', 'white'], bronze: ['🥉', 'bronze'], silver: ['🥈', 'silver'], gold: ['👑', 'gold'],
    challenge: ['🙏', 'rainbow'], serve: ['🤲', 'rainbow'], welcome: ['🤝', 'rainbow'], journal7: ['✏️', 'rainbow'], attend4: ['⛪', 'rainbow'], birthday: ['🎂', 'rainbow'],
  };
  const BADGE_ALL = [
    ['sprout', '새싹 배지', '처음 YEM 리더가 되면'], ['bronze', '브론즈 배지', '찬양 5곡 완주'], ['silver', '실버 배지', '찬양 10곡 완주'], ['gold', '골드 리더 배지', '찬양 20곡 완주'],
    ['challenge', '챌린지 수료 배지', '챌린지를 끝까지'], ['serve', '섬김 배지', '숨은 섬김을 하면'], ['welcome', '환영 배지', '새 친구 짝꿍이 되면'], ['journal7', '감사 일기 배지', '감사 일기 7번'],
    ['attend4', '예배 개근 배지', '주일 예배 4번'], ['birthday', '생일 축하 배지', '생일 주간에'],
  ];
  const badgeIcon = (key, on = true) => { const [e, c] = BADGE_LOOK[key.split(':')[0]] || ['🏅', 'rainbow']; return `<span class="ld-badge ${c} ${on ? '' : 'off'}"><i>${e}</i></span>`; };

  /* =====================================================================
     아이 화면 (#challenge)
     ===================================================================== */
  const kid = { root: null, data: null, view: 'home', busy: false };
  const profiles = () => ls.get('profiles', []);
  const curProfile = () => { const ps = profiles(); return ps.find((p) => p.mid === ls.get('cur', null)) || ps[0] || null; };
  const shell = (inner, title = '🙏 감사기도 · 배지 · 감사 일기 · 메시지') => {
    kid.root.innerHTML = `${banner('나의<br><em>리더 방</em>', title)}<section class="ld-wrap">${inner}</section>`;
  };

  function renderKid() {
    const p = curProfile();
    if (!p) { kidJoin(); return; }
    kidLoad(p);
  }

  /* 입장: 코드 → 부서 → 이름 (또는 처음 왔어요) */
  function kidJoin(step = ls.get('jt', null) ? 'dept' : 'code', dept = '') {
    if (step === 'code') {
      shell(`<div class="ld-card ld-center">
          <img class="ld-yh" src="assets/yunhee/guide/heart.webp" alt="">
          <h2>YEM 리더 입장하기 <small>Enter YEM Code</small></h2>
          <p class="ld-muted">선생님이 알려 준 <b>YEM 코드</b>를 넣어요.</p>
          <form data-ld-code class="ld-form">
            <input name="code" autocomplete="off" autocapitalize="characters" placeholder="YEM 코드" aria-label="YEM 코드" required>
            <button class="ld-big" type="submit">들어가기 · Enter</button>
          </form><p class="ld-err" hidden></p>
          ${profiles().length ? '<button type="button" class="ld-link" data-ld-back>← 돌아가기</button>' : ''}
        </div>`);
      return;
    }
    if (step === 'dept') {
      shell(`<div class="ld-card ld-center">
          <h2>나는 어느 부서예요? <small>Choose your group</small></h2>
          <div class="ld-depts">${DEPTS.map(([d, e, en]) => `<button type="button" class="ld-dept" data-ld-dept="${d}"><span>${e}</span><b>${d}</b><small>${en}</small></button>`).join('')}</div>
          <button type="button" class="ld-link" data-ld-new>🙋 명단에 내 이름이 없어요 · 처음 왔어요</button>
          ${profiles().length ? '<button type="button" class="ld-link" data-ld-back>← 돌아가기</button>' : ''}
        </div>`);
      return;
    }
    if (step === 'new') {
      shell(`<div class="ld-card">
          <h2>🙋 처음 왔어요 <small>Welcome, new friend!</small></h2>
          <form class="ld-form col" data-ld-newform>
            <label>한글 이름<input name="name_ko" required></label>
            <label>영어 이름 (없으면 비워 두세요)<input name="name_en"></label>
            <label>생년월일<input name="birth_date" type="date"></label>
            <label>캐릭터 이름 (공부방에서 부를 이름)<input name="char_name" value="${esc(local().name)}"></label>
            <label class="ld-check2"><input type="checkbox" name="consent" required> 부모님(보호자)이 등록에 동의했어요</label>
            <label class="ld-check2"><input type="checkbox" name="photo_consent"> 챌린지 사진을 선생님이 보는 것에 동의해요</label>
            <button class="ld-big" type="submit">등록하기</button>
          </form><p class="ld-err" hidden></p>
          <p class="ld-muted ld-small">선생님이 확인하면 명단에 들어가요. 그 전에도 챌린지 사진은 올릴 수 있어요.</p>
          <button type="button" class="ld-link" data-ld-dept-back>← 부서 고르기</button>
        </div>`);
      return;
    }
    shell(`<div class="ld-card ld-center"><p class="ld-muted">이름을 불러오고 있어요…</p></div>`);
    api('roster', { jt: ls.get('jt', ''), dept }).then(({ list }) => {
      shell(`<div class="ld-card">
          <h2>${esc(dept)} · 내 이름을 눌러요 <small>Tap your name</small></h2>
          <div class="ld-names">${list.map((m) => `<button type="button" class="ld-name" data-ld-pick="${m.id}" data-n="${esc(m.name_ko)}"><b>${esc(m.name_ko)}</b>${m.name_en ? `<small>${esc(m.name_en)}</small>` : ''}</button>`).join('') || '<p class="ld-muted">이 부서에 이름이 없어요.</p>'}</div>
          <p class="ld-muted ld-small">다른 친구 이름은 누르지 않아요 🤫</p>
          <button type="button" class="ld-link" data-ld-new>🙋 내 이름이 없어요 · 처음 왔어요</button>
          <button type="button" class="ld-link" data-ld-dept-back>← 부서 다시 고르기</button>
        </div>`);
    }).catch((e) => {
      if (e.message === 'auth') { ls.del('jt'); kidJoin('code'); return; }
      shell(`<div class="ld-card ld-center"><p class="ld-err">${errText(e)}</p><button class="ld-link" data-ld-dept-back>← 다시</button></div>`);
    });
  }
  function addProfile(r) {
    const L = local();
    const label = (profiles().length ? '' : L.name) || r.me.char_name || r.me.name_en || r.me.name_ko;
    ls.set('profiles', [...profiles().filter((x) => x.mid !== r.me.id), { mid: r.me.id, mt: r.mt, label }]);
    ls.set('cur', r.me.id);
    kid.data = r; kid.view = 'home';
    kidDraw();
  }

  async function kidLoad(p, view) {
    if (view) kid.view = view;
    shell(`<div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div>`);
    try { kid.data = await api('home', { mt: p.mt, songs: local().songs }); }
    catch (e) {
      if (e.message === 'auth') { ls.set('profiles', profiles().filter((x) => x.mid !== p.mid)); ls.del('cur'); renderKid(); return; }
      shell(`<div class="ld-card ld-center"><p class="ld-err">${errText(e)}</p><button class="ld-big" data-ld-retry>다시 해 보기</button></div>`); return;
    }
    kidDraw();
  }

  function topBar(p, D) {
    const L = local();
    const label = p.label || D.me.char_name || D.me.name_en || D.me.name_ko;
    const ps = profiles();
    return `<div class="ld-me">
        <div class="ld-me-who"><span class="ld-ava">${esc(label.slice(0, 1))}<em>⭐</em></span><div><small>YEM LEADER</small><b>${esc(label)}</b><span class="ld-xp">⭐ ${L.xp} XP</span></div></div>
        <div class="ld-me-sw">
          ${ps.length > 1 ? ps.filter((x) => x.mid !== p.mid).map((x) => `<button type="button" class="ld-chip" data-ld-switch="${x.mid}">${esc(x.label)}</button>`).join('') : ''}
          <button type="button" class="ld-chip" data-ld-add>${ps.length > 1 ? '＋ 가족' : '다른 사람으로 바꾸기'}</button>
        </div>
      </div>
      ${D.me.approved === false ? '<p class="ld-note">🙋 새 친구 등록을 선생님이 확인하고 있어요. 그동안 사진은 올릴 수 있어요!</p>' : ''}`;
  }

  function kidDraw() {
    const p = curProfile();
    const D = kid.data;
    if (!p || !D) return;
    // 생일 주간 축하 (하루 한 번)
    const bk = `bday:${D.me.id}:${D.today}`;
    if (D.birthday && !ls.get(bk, false)) { ls.set(bk, true); birthdayParty(D); }
    const ch = D.challenge;
    const open = ch && D.today >= ch.start && D.today <= ch.end;
    const todayDone = D.entries.some((e) => e.day === D.today);
    if (kid.view === 'home') {
      shell(`${topBar(p, D)}
        <div class="ld-four">
          ${open ? `<button type="button" class="ld-tile photo ${todayDone ? 'done' : ''}" data-ld-view="challenge"><span>📸</span><b>${todayDone ? '오늘 인증 완료!' : '오늘 사진 올리기'}</b><small>${todayDone ? '✅ Done today' : 'Upload today’s photo'}</small></button>`
            : ch && D.cert ? `<button type="button" class="ld-tile photo" data-ld-view="challenge"><span>🎓</span><b>나의 수료증</b><small>My certificate</small></button>`
            : `<button type="button" class="ld-tile photo off" data-ld-view="challenge"><span>📸</span><b>챌린지</b><small>곧 시작해요</small></button>`}
          <button type="button" class="ld-tile badge" data-ld-view="badges"><span>🏅</span><b>나의 배지함</b><small>${D.badges.length}개 · My badges</small></button>
          <button type="button" class="ld-tile journal" data-ld-view="journal"><span>✏️</span><b>감사 일기</b><small>${D.journalDays.includes(D.today) ? '오늘 썼어요 ✅' : 'One thankful line'}</small></button>
          <button type="button" class="ld-tile inbox" data-ld-view="inbox"><span>💌</span><b>받은 메시지</b><small>${D.unread ? `새 메시지 ${D.unread}개` : 'Messages'}</small>${D.unread ? '<i class="ld-dot"></i>' : ''}</button>
        </div>
        ${!D.me.has_birth && !ls.get('bdask:' + D.me.id, false) ? `<div class="ld-card ld-bdask"><b>🎂 생일이 언제예요?</b><p class="ld-muted ld-small">생일 주간에 성경 친구들이 축하해 줘요!</p>
          <form class="ld-form" data-ld-bday><input type="date" name="bd" required aria-label="생년월일"><button class="ld-big" type="submit">저장</button></form>
          <button type="button" class="ld-link" data-ld-bdskip>나중에 할게요</button></div>` : ''}
        <p class="ld-muted ld-small ld-center">내 기록은 나와 선생님만 볼 수 있어요 🔒</p>`);
      return;
    }
    const back = '<button type="button" class="ld-back" data-ld-view="home">← 처음으로</button>';
    if (kid.view === 'challenge') {
      if (!ch) { shell(`${topBar(p, D)}${back}<div class="ld-card ld-center"><p>지금은 진행 중인 챌린지가 없어요. 곧 새 챌린지가 열려요!</p></div>`); return; }
      const days = dayList(ch);
      const got = new Set(D.entries.map((e) => e.day));
      const ti = days.findIndex((d) => d.iso === D.today);
      const t = ti >= 0 ? (ch.texts[ti] || {}) : null;
      const nextDay = days.find((d) => d.iso > D.today && !got.has(d.iso));
      const cheer = D.cert ? '🎉 챌린지 성공! 축하합니다!' : got.size ? `${got.size}일 성공! ${nextDay ? `${DOW[nextDay.dow]}요일도 도전하세요!` : ''}` : '오늘부터 시작해요!';
      shell(`${topBar(p, D)}${back}
        ${D.cert ? certCard() : ''}
        ${t ? `<div class="ld-today">
          <div class="ld-day-tag">DAY ${ti + 1} · ${days[ti].m}/${days[ti].d} ${DOW_EN[days[ti].dow]}</div>
          <p class="ld-say" lang="en">${esc(t.en)}</p>
          <p class="ld-say-ko">${esc(t.ko)} ${t.say ? `<span>[${esc(t.say)}]</span>` : ''}</p>
          ${t.pray ? `<p class="ld-pray">🙏 ${esc(t.pray)}</p>` : ''}
          <label class="ld-shot ${todayDone ? 'done' : ''}"><input type="file" accept="image/*" data-ld-photo hidden>
            <span>${todayDone ? '✅ 오늘 인증 완료! <small>사진 바꾸기</small>' : '📸 오늘 사진 올리기 <small>Upload today’s photo</small>'}</span></label>
          <p class="ld-err" hidden></p></div>`
          : `<div class="ld-today"><p class="ld-say-ko">${D.today < ch.start ? '챌린지가 곧 시작해요!' : '챌린지 기간이 끝났어요. 수고했어요! 💛'}</p></div>`}
        <div class="ld-card"><h3>${esc(ch.title)} <small>${esc(cheer)}</small></h3>
          <ol class="ld-week">${days.map((d) => `<li class="${got.has(d.iso) ? 'ok' : ''} ${d.iso === D.today ? 'now' : ''}"><small>${DOW[d.dow]}</small><b>${got.has(d.iso) ? '<img src="assets/people/img/jesus.webp" alt="스티커">' : d.iso < D.today ? '·' : '⬜'}</b><em>${d.m}/${d.d}</em></li>`).join('')}</ol>
          <p class="ld-muted ld-small">사진을 올리면 <b>예수님 칭찬 스티커</b>가 붙어요. ${ch.days}개를 모으면 <b>수료증</b>이 바로 나와요!</p>
          ${D.entries.some((e) => e.photo) ? `<div class="ld-pics">${D.entries.filter((e) => e.photo).map((e) => `<img src="${esc(e.photo)}" alt="${esc(md(e.day))} 인증 사진" loading="lazy">`).join('')}</div>` : ''}
        </div>`);
      return;
    }
    if (kid.view === 'badges') {
      const have = Object.fromEntries(D.badges.map((b) => [b.badge.split(':')[0] === 'challenge' ? 'challenge' : b.badge, b]));
      const chBadges = D.badges.filter((b) => b.badge.startsWith('challenge:'));
      shell(`${topBar(p, D)}${back}
        <div class="ld-card"><h2>🏅 나의 배지함 <small>배지와 수료증이 계속 쌓여요 · ${D.badges.length}개</small></h2>
          <h3 class="ld-sub">단계 배지 <small>찬양을 완주할수록 자라요 (지금 ${D.me.songs}곡)</small></h3>
          <div class="ld-badges">${BADGE_ALL.slice(0, 4).map(([k, n, w]) => `<button type="button" class="ld-bslot" data-ld-badge="${k}">${badgeIcon(k, !!have[k])}<b>${n}</b><small>${have[k] ? md(have[k].at.slice(0, 10)) : w}</small></button>`).join('')}</div>
          <h3 class="ld-sub">특별 배지 <small>무지개 테두리</small></h3>
          <div class="ld-badges">${BADGE_ALL.slice(4).map(([k, n, w]) => `<button type="button" class="ld-bslot" data-ld-badge="${k}">${badgeIcon(k, !!have[k])}<b>${n}${k === 'challenge' && chBadges.length > 1 ? ` ×${chBadges.length}` : ''}</b><small>${have[k] ? md(have[k].at.slice(0, 10)) : w}</small></button>`).join('')}</div>
        </div>`);
      return;
    }
    if (kid.view === 'journal') { journalView(p, D, back); return; }
    if (kid.view === 'inbox') { inboxView(p, D, back); }
  }

  function certCard() {
    return `<div class="ld-cert">
      <div class="ld-cert-pic"><canvas data-ld-cert width="1600" height="1131" aria-label="수료증"></canvas></div>
      <div class="ld-cert-t"><b>🏅 챌린지 성공! 축하합니다 🎉</b><p>주일에 강대상에서 <b>실물 수료증</b>을 받아요!</p>
      <button type="button" class="ld-big" data-ld-save>📥 수료증 저장하기</button></div></div>`;
  }
  function drawCert(cv, D, cert) {
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
      const c = cert || D.cert;
      const day = c && c.issued_at ? new Date(Date.parse(c.issued_at) + 9 * 3600e3).getUTCDate() : '';
      g.font = '800 22px "Pretendard", sans-serif';
      g.fillStyle = '#5b3a1e';
      g.fillText(String(day), 1093, 1047);
    };
    img.src = 'assets/leaders/cert-thanks.webp';
  }

  async function journalView(p, D, back) {
    shell(`${topBar(p, D)}${back}<div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div>`);
    let J;
    try { J = await api('journal_list', { mt: p.mt }); } catch (e) { return; }
    const todayJ = J.journals.find((j) => j.day === J.today);
    const written = new Set(J.journals.map((j) => j.day));
    const t = new Date(Date.parse(J.today));
    const y = t.getUTCFullYear(), mo = t.getUTCMonth();
    const first = new Date(Date.UTC(y, mo, 1)).getUTCDay();
    const last = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    const cells = [...Array(first).fill(''), ...Array.from({ length: last }, (_, i) => i + 1)];
    const iso = (d) => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    shell(`${topBar(p, D)}${back}
      <div class="ld-card"><h2>✏️ 오늘의 감사 한 줄 <small>한국어도 영어도 좋아요 · Korean or English</small></h2>
        ${todayJ && todayJ.feedback ? `<p class="ld-jbody">“${esc(todayJ.body)}”</p><p class="ld-muted ld-small">오늘 일기에 선생님이 답장했어요. 내일 또 써요!</p>`
          : `<form class="ld-form col" data-ld-journal><textarea name="body" maxlength="300" rows="2" placeholder="예: 엄마가 맛있는 밥을 해 주셔서 감사해요 / I'm thankful for my friends." required>${esc(todayJ ? todayJ.body : '')}</textarea>
          <button class="ld-big" type="submit">${todayJ ? '고쳐서 저장하기' : '저장하기 · Save'}</button></form>`}
      </div>
      <div class="ld-card"><h3>${mo + 1}월 감사 달력 <small>${[...written].filter((d) => d.startsWith(iso(1).slice(0, 7))).length}일 썼어요</small></h3>
        <div class="ld-cal">${DOW.map((d) => `<b>${d}</b>`).join('')}${cells.map((d) => (d ? `<span class="${written.has(iso(d)) ? 'on' : ''} ${iso(d) === J.today ? 'now' : ''}">${d}</span>` : '<span></span>')).join('')}</div>
      </div>
      <div class="ld-card"><h3>내 감사 일기</h3>
        <ul class="ld-jlist">${J.journals.map((j) => `<li><em>${md(j.day)}에 썼어요</em><p>${esc(j.body)}</p>${j.feedback ? `<div class="ld-fb"><b>💌 선생님이 답장해 주셨어요!</b><p>${br(j.feedback)}</p></div>` : ''}</li>`).join('') || '<li class="ld-muted">아직 없어요. 오늘 첫 줄을 써 봐요!</li>'}</ul>
      </div>`);
  }
  async function inboxView(p, D, back) {
    shell(`${topBar(p, D)}${back}<div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div>`);
    let I;
    try { I = await api('inbox', { mt: p.mt }); } catch (e) { return; }
    D.unread = 0;
    const KIND = { praise: ['💛', '칭찬 편지'], feedback: ['✏️', '감사 일기 답장'], prayer: ['🙏', '기도 답장'], badge: ['🏅', '배지'], birthday: ['🎂', '생일'], notice: ['📢', '알림'] };
    const sender = (m) => (m.sender_role === 'pastor' ? `👤 ${esc(m.sender)}` : m.sender === 'YEM' ? 'YEM' : `💖 ${esc(m.sender || '선생님')}`);
    shell(`${topBar(p, D)}${back}
      <div class="ld-card"><h2>💌 받은 메시지 <small>Messages</small></h2>
        <ul class="ld-msgs">${I.list.map((m) => `<li class="${m.read ? '' : 'new'}"><span class="ld-mi">${(KIND[m.kind] || ['💌'])[0]}</span><div><small>${(KIND[m.kind] || ['', '메시지'])[1]} · ${sender(m)} · ${md(new Date(Date.parse(m.created_at) + 9 * 3600e3).toISOString().slice(0, 10))}</small><p>${br(m.body)}</p></div></li>`).join('') || '<li class="ld-muted">아직 메시지가 없어요.</li>'}</ul>
      </div>
      <div class="ld-card ld-small-card"><h3>🙏 기도 제목 나누기 <small>선생님이 함께 기도해요</small></h3>
        <form class="ld-form" data-ld-prayer><input name="body" maxlength="300" placeholder="한 줄로 써요" aria-label="기도 제목" required><button class="ld-chip" type="submit">올리기</button></form>
        <ul class="ld-plist">${I.prayers.map((x) => `<li><p>${esc(x.body)}</p><small>${x.status === 'new' ? '선생님께 전달됐어요' : '🙏 선생님이 기도하고 있어요'}</small></li>`).join('')}</ul>
      </div>`);
  }
  function birthdayParty(D) {
    const pals = ['jesus', 'mary-mother', 'gabriel', 'shepherds', 'wise-men', 'david', 'esther'];
    const el = modal(`<div class="ld-bday">
      <div class="ld-bday-pals">${pals.map((x) => `<img src="assets/people/img/${x}.webp" alt="">`).join('')}</div>
      <h2>🎂 Happy Birthday, YEM Leader!</h2>
      <p class="ld-say-en" lang="en">You are a gift from God!</p>
      <p><b>당신은 YEM 리더예요. 하나님의 선물이에요. 축하해요!</b></p>
      <button type="button" class="ld-big" data-ld-close>고마워요! 💛</button></div>`);
    el.classList.add('party');
  }
  function stickerPop(done) {
    const el = document.createElement('div');
    el.className = 'ld-pop';
    el.innerHTML = `<div class="ld-pop-in"><img src="assets/people/img/jesus.webp" alt=""><b>${done ? '챌린지 성공! 축하합니다 🎉' : '예수님 칭찬 스티커!'}</b><p>${done ? 'Congratulations! 수료증이 나왔어요!' : 'Great job! 오늘도 감사기도 성공 ✨'}</p></div>`;
    document.body.appendChild(el);
    const bye = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
    el.addEventListener('click', bye);
    setTimeout(bye, 2800);
  }
  async function onKidUpload(file) {
    if (kid.busy || !file) return;
    const p = curProfile();
    const lab = kid.root.querySelector('.ld-shot');
    const err = kid.root.querySelector('.ld-today .ld-err');
    kid.busy = true;
    if (lab) { lab.classList.add('busy'); lab.querySelector('span').innerHTML = '⏳ 올리는 중… <small>잠깐만 기다려요</small>'; }
    try {
      const r = await api('upload', { mt: p.mt, image: await shrink(file) });
      kid.data = r;
      kidDraw();
      if (r.first) { stickerPop(r.done); if (window.YEM_HOOKS && window.YEM_HOOKS.addXp) window.YEM_HOOKS.addXp(r.done ? 50 : 20); }
    } catch (e) {
      if (lab) { lab.classList.remove('busy'); lab.querySelector('span').innerHTML = '📸 다시 올리기'; }
      if (err) { err.hidden = false; err.innerHTML = errText(e); }
    } finally { kid.busy = false; }
  }
  function badgeInfo(key) {
    const D = kid.data;
    const list = D.badges.filter((b) => (key === 'challenge' ? b.badge.startsWith('challenge:') : b.badge === key));
    const meta = BADGE_ALL.find((x) => x[0] === key) || [key, key, ''];
    const el = modal(`<div class="ld-center">${badgeIcon(key, !!list.length)}<h3>${esc(meta[1])}</h3>
      ${list.length ? list.map((b) => `<p><b>${md(b.at.slice(0, 10))}</b>에 받았어요 · ${esc(b.reason || b.why || '')}</p>`).join('') : `<p class="ld-muted">아직이에요. ${esc(meta[2])} 받아요!</p>`}
      ${key === 'challenge' && list.length ? '<div data-ld-certbox></div>' : ''}</div>`);
    if (key === 'challenge' && list.length) {
      const box = el.querySelector('[data-ld-certbox]');
      box.innerHTML = '<canvas width="1600" height="1131" class="ld-cert-mini"></canvas><p class="ld-muted ld-small">연결된 수료증</p>';
      const c = (D.certs || []).find((x) => x.challenge_id === list[0].challenge_id);
      drawCert(box.querySelector('canvas'), D, c);
    }
  }

  function bindKid(root) {
    root.addEventListener('submit', async (e) => {
      const f = e.target;
      e.preventDefault();
      const err = f.parentElement.querySelector('.ld-err');
      const show = (x) => { if (err) { err.hidden = false; err.innerHTML = errText(x); } else alert(errText(x).replace(/<[^>]+>/g, '')); };
      const btn = f.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
      try {
        const p = curProfile();
        if (f.matches('[data-ld-code]')) { const { jt } = await api('join', { code: f.code.value }); ls.set('jt', jt); kidJoin('dept'); }
        else if (f.matches('[data-ld-newform]')) {
          const r = await api('join_new', { jt: ls.get('jt', ''), name_ko: f.name_ko.value, name_en: f.name_en.value, birth_date: f.birth_date.value, char_name: f.char_name.value, consent: f.consent.checked, photo_consent: f.photo_consent.checked, songs: local().songs });
          addProfile(r);
        } else if (f.matches('[data-ld-bday]')) { kid.data = await api('birthday_set', { mt: p.mt, birth_date: f.bd.value }); kidDraw(); }
        else if (f.matches('[data-ld-journal]')) {
          const r = await api('journal_add', { mt: p.mt, body: f.body.value });
          if (r.first && window.YEM_HOOKS && window.YEM_HOOKS.addXp) window.YEM_HOOKS.addXp(10);
          kid.data.journalDays = r.journals.map((j) => j.day);
          journalView(p, kid.data, '<button type="button" class="ld-back" data-ld-view="home">← 처음으로</button>');
        } else if (f.matches('[data-ld-prayer]')) {
          await api('prayer_add', { mt: p.mt, body: f.body.value });
          inboxView(p, kid.data, '<button type="button" class="ld-back" data-ld-view="home">← 처음으로</button>');
        }
      } catch (x) {
        if (x.message === 'auth' && f.matches('[data-ld-newform]')) { ls.del('jt'); kidJoin('code'); return; }
        show(x); if (btn) btn.disabled = false;
      }
    });
    root.addEventListener('click', async (e) => {
      const t = e.target;
      const v = t.closest('[data-ld-view]');
      if (v) { kid.view = v.dataset.ldView; if (kid.view === 'home') kidLoad(curProfile()); else kidDraw(); window.scrollTo(0, 0); return; }
      const dp = t.closest('[data-ld-dept]');
      if (dp) { kidJoin('names', dp.dataset.ldDept); return; }
      if (t.closest('[data-ld-new]')) { kidJoin('new'); return; }
      if (t.closest('[data-ld-dept-back]')) { kidJoin('dept'); return; }
      if (t.closest('[data-ld-back]') || t.closest('[data-ld-retry]')) { renderKid(); return; }
      if (t.closest('[data-ld-bdskip]')) { ls.set('bdask:' + kid.data.me.id, true); kidDraw(); return; }
      const bd = t.closest('[data-ld-badge]');
      if (bd) { badgeInfo(bd.dataset.ldBadge); return; }
      const pk = t.closest('[data-ld-pick]');
      if (pk) {
        if (!confirm(`${pk.dataset.n} — 내 이름이 맞나요?`)) return;
        try { addProfile(await api('pick', { jt: ls.get('jt', ''), member_id: pk.dataset.ldPick, char_name: local().name || undefined, songs: local().songs })); }
        catch (x) { if (x.message === 'auth') { ls.del('jt'); kidJoin('code'); } else alert(errText(x)); }
        return;
      }
      const sw = t.closest('[data-ld-switch]');
      if (sw) { ls.set('cur', sw.dataset.ldSwitch); kid.view = 'home'; renderKid(); return; }
      if (t.closest('[data-ld-add]')) { kidJoin(ls.get('jt', null) ? 'dept' : 'code'); return; }
      if (t.closest('[data-ld-save]')) {
        const cv = root.querySelector('[data-ld-cert]');
        const a = document.createElement('a');
        a.download = 'YEM_챌린지_수료증.png';
        a.href = cv.toDataURL('image/png');
        a.click();
      }
    });
    root.addEventListener('change', (e) => {
      const inp = e.target.closest('[data-ld-photo]');
      if (inp && inp.files && inp.files[0]) onKidUpload(inp.files[0]);
    });
    new MutationObserver(() => {
      const cv = root.querySelector('[data-ld-cert]:not([data-drawn])');
      if (cv && kid.data) { cv.dataset.drawn = '1'; drawCert(cv, kid.data); }
    }).observe(root, { childList: true, subtree: true });
  }

  /* =====================================================================
     관리자 화면 (#admin)
     ===================================================================== */
  const adm = { root: null, data: null, tab: 'home', dept: '전체', staff: null, extra: {}, idle: 0 };
  const at = () => ss.get('at');
  const nm = (m) => `${esc(m.name_ko)}${m.name_en ? ` <small>${esc(m.name_en)}</small>` : ''}${m.dept ? ` <em class="ld-tag">${esc(m.dept)}${m.char_name ? ` · ${esc(m.char_name)}` : ''}</em>` : ''}`;
  const nmPlain = (m) => `${m.name_ko}${m.name_en ? ' ' + m.name_en : ''}`;
  function touchIdle() {
    clearTimeout(adm.idle);
    adm.idle = setTimeout(() => { if (at()) { ss.del('at'); if (location.hash.startsWith('#admin')) { adminGate(); alert('오래 쓰지 않아서 관리자 화면을 잠갔어요 🔒'); } } }, IDLE_MIN * 60e3);
  }
  const shellA = (inner) => { adm.root.innerHTML = `${banner('관리자<br><em>화면</em>', '🔒 리더 대표 · 임명 리더 · 목사님 · 운영진 전용')}<section class="ld-wrap">${inner}</section>`; };

  async function renderAdmin() {
    if (!at()) { adminGate(); return; }
    touchIdle();
    shellA('<div class="ld-card ld-center"><p class="ld-muted">불러오는 중…</p></div>');
    try { adm.data = await api('a_home', { at: at() }); adminDraw(); }
    catch (e) { if (e.message === 'auth') { ss.del('at'); adminGate(); } else shellA(`<p class="ld-err">${errText(e)}</p>`); }
  }
  async function adminGate() {
    shellA('<div class="ld-card ld-center"><p class="ld-muted">확인 중…</p></div>');
    let setup = false;
    try { setup = (await api('status')).setup; } catch (e) { /* 로그인 화면 */ }
    adm.root.querySelector('.ld-wrap').innerHTML = `${setup ? `
      <div class="ld-card">
        <h2>처음 설정하기 <small>딱 한 번만 해요</small></h2>
        <p class="ld-muted">리더 대표 비밀번호와 아이들이 넣을 <b>YEM 인증 코드</b>를 정해요.</p>
        <form class="ld-form col" data-ld-setup>
          <label>처음 설정 열쇠 (8자리)<input name="setup_key" autocomplete="off" required></label>
          <label>이름<input name="name" value="슈퍼스타 유니쌤" required></label>
          <label>관리자 비밀번호 (6자 이상)<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
          <label>YEM 인증 코드 (아이들용, 4자 이상)<input name="code" autocomplete="off" minlength="4" required placeholder="예: YEM2026"></label>
          <button class="ld-big" type="submit">설정 완료</button>
        </form><p class="ld-err" hidden></p>
      </div>` : ''}
      <div class="ld-card ld-center">
        <h2>관리자 비밀번호 <small>Admin</small></h2>
        <p class="ld-muted">비밀번호를 넣어야 열려요. 창을 닫거나 ${IDLE_MIN}분 동안 안 쓰면 다시 잠겨요.</p>
        <form class="ld-form" data-ld-login>
          <input name="password" type="password" autocomplete="current-password" placeholder="비밀번호" aria-label="비밀번호" required>
          <button class="ld-big" type="submit">열기</button>
        </form><p class="ld-err" hidden></p>
      </div>`;
  }

  /* 탭: 역할마다 보이는 것만 (서버도 똑같이 막아요) */
  function tabsFor(D) {
    const r = D.role, sc = D.scope || [];
    if (r === 'exec_staff') return [['share', '📢 운영진 방']];
    if (r === 'pastor') return [['home', '🏠 이번 주'], ['prayer', '🙏 기도 제목'], ['share', '📢 운영진 방']];
    if (r === 'leader') return [['home', '🏠 오늘'], ...(sc.includes('challenge') ? [['challenge', '📋 챌린지']] : []), ...(sc.includes('attendance') ? [['attend', '✅ 출석'], ['newcomer', '🙋 새신자']] : []), ['share', '📢 운영진 방']];
    return [['home', '🏠 오늘 할 일'], ['challenge', '📋 챌린지'], ['attend', '✅ 출석'], ['newcomer', '🙋 새신자'], ['members', '👥 명단'], ['journal', '✏️ 감사 일기'], ['prayer', '🙏 기도 · 메시지'], ['share', '📢 운영진 방'], ['set', '⚙️ 설정']];
  }
  function adminDraw() {
    const D = adm.data;
    const tabs = tabsFor(D);
    if (!tabs.some((t) => t[0] === adm.tab)) adm.tab = tabs[0][0];
    const head = `<div class="ld-adm-top">
        <div><b>${esc(ROLE[D.role] || D.role)} 모드 · ${esc(D.name)}</b><small>${D.challenge ? `${esc(D.challenge.title)} · ${md(D.challenge.start)}~${md(D.challenge.end)}` : '진행 중인 챌린지 없음'}</small></div>
        <div class="ld-adm-act"><button type="button" class="ld-chip" data-ld-reload>↻</button><button type="button" class="ld-chip" data-ld-logout>🔒 잠그기</button></div>
      </div>
      <div class="ld-tabs">${tabs.map(([k, l]) => `<button type="button" class="ld-tab ${adm.tab === k ? 'on' : ''}" data-ld-tab="${k}">${l}</button>`).join('')}</div>`;
    adm.root.querySelector('.ld-wrap').innerHTML = `${head}<div data-ld-body></div>`;
    const body = adm.root.querySelector('[data-ld-body]');
    const fn = { home: tabHome, challenge: tabChallenge, attend: tabAttend2, newcomer: tabNewcomer, members: tabMembers, journal: tabJournal, prayer: tabPrayer, share: tabShare, set: tabSet }[adm.tab];
    fn(body, D);
  }
  const shareBtn = (title, text) => `<button type="button" class="ld-chip share" data-ld-share data-title="${esc(title)}" data-body="${esc(text)}">📢 운영진 방에 공유</button>`;

  function tabHome(el, D) {
    if (D.role === 'pastor') {
      el.innerHTML = `
        ${alertCard(D)}
        <div class="ld-tiles"><div><b>${D.attendance.count}</b><small>${md(D.attendance.sunday)} 출석</small></div><div><b>${D.counts.joined}</b><small>챌린지 참여</small></div><div><b>${D.counts.certs}</b><small>수료증</small></div><div><b>${D.pending.prayers}</b><small>새 기도 제목</small></div></div>
        <div class="ld-card"><h3>📌 진행 중인 프로젝트</h3><p>${D.challenge ? `${esc(D.challenge.title)} (${md(D.challenge.start)}~${md(D.challenge.end)})` : '지금은 없어요'}</p>
          <p class="ld-muted ld-small">다음 프로젝트: 대림절 스토리북 · 크리스마스 준비</p></div>
        <div class="ld-card"><h3>🏅 수료증 받을 아이</h3><ul class="ld-list">${(D.certs || []).map((m) => `<li>${nm(m)}${m.awarded ? ' <em>수여 완료</em>' : ''}</li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul>
          ${shareBtn('수료증 받을 아이 명단', (D.certs || []).map(nmPlain).join('\n') || '아직 없어요')}</div>`;
      return;
    }
    const gm = D.groupMessage;
    el.innerHTML = `
      ${gm ? `<div class="ld-card ld-todo"><h3>📋 오늘 단톡방 메시지 <small>${gm.ready ? '매일 아침 9시에 준비돼요' : '아침 9시에 준비돼요 (미리 보기)'}${gm.copied ? ' · 오늘 복사함 ✅' : ''}</small></h3>
        <textarea data-ld-gm rows="5">${esc(gm.body)}</textarea>
        <div class="ld-row"><button type="button" class="ld-big" data-ld-gm-copy>📋 복사하기</button><button type="button" class="ld-chip" data-ld-gm-save>고친 문구 저장</button></div>
        <p class="ld-muted ld-small">카톡 단톡방에 붙여넣어 보내 주세요. (카톡 자동 발송은 안 돼요)</p></div>` : ''}
      ${alertCard(D)}
      ${D.birthdays ? `<div class="ld-card ld-todo"><h3>🎂 이번 주 생일</h3>${D.birthdays.length ? `<p>이번 주는 <b>${D.birthdays.map((m) => esc(m.char_name || m.name_ko)).join(', ')}</b>의 생일이에요. 모두 함께 축하해 주세요!</p><ul class="ld-list">${D.birthdays.map((m) => `<li>${nm(m)} <em>${md(m.birth_date)}</em></li>`).join('')}</ul>` : '<p class="ld-muted">이번 주 생일인 사람이 없어요.</p>'}</div>` : ''}
      ${raceCard(D)}
      <div class="ld-card ld-todo"><h3>⭐ 이번 주 예수님 스티커 · ${D.stickerWeek ? D.stickerWeek.length : 0}명</h3>
        <ul class="ld-list">${(D.stickerWeek || []).sort((a, b) => b.n - a.n).map((m) => `<li>${nm(m)} <em>${m.n}개</em></li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul></div>
      ${D.absent ? `<div class="ld-card ld-todo"><h3>💛 결석 알림 · 2주 연속</h3>${D.absent.length ? `<p class="ld-muted ld-small">보고 싶다고 연락해 주세요.</p><ul class="ld-list">${D.absent.map((m) => `<li>${nm(m)}</li>`).join('')}</ul>` : '<p class="ld-muted">없어요. 출석 체크가 쌓이면 여기에 떠요.</p>'}</div>` : ''}
      ${D.pending ? `<div class="ld-tiles">
        <button type="button" data-ld-tab="journal"><b>${D.pending.journals}</b><small>✏️ 피드백 기다리는 일기</small></button>
        <button type="button" data-ld-tab="prayer"><b>${D.pending.prayers}</b><small>🙏 새 기도 제목</small></button>
        <button type="button" data-ld-tab="newcomer"><b>${D.pending.newcomers}</b><small>🙋 새신자 · 승인 대기</small></button>
        <button type="button" data-ld-tab="attend"><b>${D.attendance.count}</b><small>✅ ${md(D.attendance.sunday)} 출석</small></button></div>` : ''}
      ${D.code_set === false ? '<p class="ld-err">⚠️ YEM 인증 코드가 아직 없어요. ⚙️ 설정에서 정해 주세요.</p>' : ''}`;
  }
  function alertCard(D) {
    if (!D.alert) return '';
    const txt = `5일 이상 인증한 아이들 — 주일 수료증을 준비해 주세요\n${D.alert.list.map((m) => `${nmPlain(m)} (${m.n}일)`).join('\n')}`;
    return D.alert.on ? `<div class="ld-alert"><b>🎓 주일 수료증을 준비해 주세요!</b><p>5일 이상 인증한 사람 <b>${D.alert.list.length}명</b> (금요일 낮 12시 알림)</p>
        <ul>${D.alert.list.map((m) => `<li>${nm(m)} <em>${m.n}일</em></li>`).join('') || '<li>아직 없어요</li>'}</ul>${shareBtn('주일 수료증 준비 명단', txt)}</div>`
      : `<div class="ld-alert soft"><b>🎓 ${md(D.alert.fri)}(금) 낮 12시</b>부터 “5일 이상 인증한 사람” 명단이 크게 떠요. 지금 ${D.alert.list.length}명.</div>`;
  }

  function tabChallenge(el, D) {
    const ch = D.challenge;
    if (!ch || !D.members) { el.innerHTML = '<div class="ld-card"><p class="ld-muted">진행 중인 챌린지가 없어요.</p></div>' + (D.role === 'leader_admin' ? challengeForm() : ''); return; }
    const days = dayList(ch);
    const q = (adm.extra.q || '').trim().toLowerCase();
    const rows = D.members.filter((m) => (adm.dept === '전체' || m.dept === adm.dept) && (!q || `${m.name_ko} ${m.name_en || ''}`.toLowerCase().includes(q)));
    const manual = D.role === 'leader_admin' || (D.scope || []).includes('manual');
    el.innerHTML = `${raceCard(D)}
      <div class="ld-tiles"><div><b>${D.counts.members}</b><small>전체 명단</small></div><div><b>${D.counts.joined}</b><small>참여한 사람</small></div><div><b>${D.counts.stickerWeek}</b><small>이번 주 스티커</small></div><div><b>${D.counts.certs}</b><small>수료증</small></div></div>
      ${manual ? '<p class="ld-note">👆 <b>아이 이름을 누르면</b> 그 아이의 7일 칸이 열려요. 카톡으로 받은 사진을 날짜마다 넣거나, 직접 못 올리는 아이 대신 올려 줄 수 있어요.</p>' : ''}
      <div class="ld-seg">${['전체', ...DEPTS.map((d) => d[0])].map((d) => `<button type="button" class="ld-chip ${adm.dept === d ? 'on' : ''}" data-ld-fdept="${d}">${d}</button>`).join('')}</div>
      <input class="ld-search" type="search" placeholder="🔎 이름 찾기 (한글 · 영어)" value="${esc(adm.extra.q || '')}" data-ld-q aria-label="이름 찾기">
      <div class="ld-tbl-wrap"><table class="ld-tbl"><thead><tr><th>이름</th>${days.map((d) => `<th class="${d.iso === D.today ? 'now' : ''}">${DOW[d.dow]}<small>${d.m}/${d.d}</small></th>`).join('')}<th>합계</th></tr></thead>
      <tbody>${rows.map((m) => {
        const by = Object.fromEntries(m.days.map((x) => [x.day, x]));
        return `<tr><td class="ld-tn"><button type="button" class="ld-kidbtn" data-ld-kid="${m.id}">${esc(m.name_ko)}${m.name_en ? ` <small>${esc(m.name_en)}</small>` : ''}<em>${esc(m.dept)}</em></button></td>${days.map((d) => {
          const x = by[d.iso];
          return `<td><button type="button" class="ld-cell ${x ? (x.method === 'manual' ? 'man' : 'ok') : ''}" data-ld-cell="${m.id}" data-day="${d.iso}" aria-label="${esc(m.name_ko)} ${d.m}/${d.d}">${x ? (x.photo ? '📷' : '✅') : ''}</button></td>`;
        }).join('')}<td class="ld-sum ${m.days.length >= ch.days ? 'full' : m.days.length >= 5 ? 'five' : ''}">${m.days.length}${m.cert ? ' 🏅' : ''}</td></tr>`;
      }).join('')}</tbody></table></div>
      <p class="ld-muted ld-small">📷 사진 있음 · ✅ 사진 없이 인증 · 노란 칸 = 선생님이 넣은 기록. ${manual ? '빈칸을 누르면 수동 인증, 채운 칸을 누르면 사진 보기 · 지우기.' : '칸을 누르면 사진을 볼 수 있어요.'}</p>
      ${manual ? `<div class="ld-card"><h3>➕ 카톡으로 받은 사진 넣기 (수동 인증)</h3>
        <form class="ld-form col" data-ld-add-form>
          <label>이름<select name="member_id" required><option value="">이름 고르기</option>${DEPTS.map(([d]) => `<optgroup label="${d}">${D.members.filter((m) => m.dept === d).map((m) => `<option value="${m.id}">${esc(nmPlain(m))}</option>`).join('')}</optgroup>`).join('')}</select></label>
          <label>날짜<select name="day" required>${days.map((d) => `<option value="${d.iso}" ${d.iso === D.today ? 'selected' : ''}>DAY ${d.i + 1} · ${d.m}/${d.d} (${DOW[d.dow]})</option>`).join('')}</select></label>
          <label>사진 (없으면 비워 두세요)<input type="file" name="photo" accept="image/*"></label>
          <button class="ld-big" type="submit">인증 추가하기</button>
        </form><p class="ld-ok" hidden></p><p class="ld-err" hidden></p></div>
      <div class="ld-card"><h3>🏅 수료증 · 실물 수여 체크</h3>
        <ul class="ld-list">${D.members.filter((m) => m.cert).map((m) => `<li>${nm(m)} <label class="ld-check"><input type="checkbox" data-ld-award="${m.id}" ${m.cert.awarded ? 'checked' : ''}> 실물 수여 완료</label></li>`).join('') || `<li class="ld-muted">아직 ${ch.days}일을 채운 사람이 없어요.</li>`}</ul></div>` : ''}
      ${D.role === 'leader_admin' ? challengeForm() : ''}`;
  }
  function challengeForm() {
    return `<details class="ld-card"><summary><b>🆕 새 챌린지 만들기</b></summary>
      <form class="ld-form col" data-ld-ch-form>
        <label>챌린지 이름<input name="title" required placeholder="예: 대림절 말씀 챌린지"></label>
        <label>영어 이름<input name="title_en" placeholder="Advent Verse Challenge"></label>
        <label>시작일<input name="start" type="date" required></label>
        <label>총 일수<input name="days" type="number" min="1" max="60" value="7"></label>
        <label>요일별 문구 (한 줄에 하루: 영어 | 한국어 | 기도 한 줄)<textarea name="texts" rows="7" placeholder="God is good! | 하나님은 좋으신 분이에요 | 하나님이 좋으신 분임을 고백해요"></textarea></label>
        <button class="ld-big" type="submit">만들기</button>
      </form><p class="ld-muted ld-small">요일별 문구는 아이 화면과 매일 아침 단톡방 메시지에 쓰여요.</p></details>`;
  }

  async function tabAttend(el, D) {
    const sun = adm.extra.attDay || D.attendance.sunday;
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_attend_list', { at: at(), day: sun }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    const sundays = Array.from({ length: 8 }, (_, i) => new Date(Date.parse(D.attendance.sunday) - i * 7 * 864e5).toISOString().slice(0, 10));
    const groups = DEPTS.map(([d]) => [d, r.list.filter((m) => m.dept === d)]);
    el.innerHTML = `<div class="ld-card"><h3>✅ 주일 출석 체크 <small>이름을 누르면 체크돼요 · ${r.list.filter((m) => m.on).length}명</small></h3>
      <div class="ld-seg">${sundays.map((s) => `<button type="button" class="ld-chip ${s === r.day ? 'on' : ''}" data-ld-attday="${s}">${md(s)}</button>`).join('')}</div>
      ${groups.map(([d, ms]) => (ms.length ? `<h4 class="ld-sub">${d}</h4><div class="ld-names att">${ms.map((m) => `<button type="button" class="ld-name ${m.on ? 'on' : ''}" data-ld-att="${m.id}" data-day="${r.day}"><b>${esc(m.name_ko)}</b>${m.name_en ? `<small>${esc(m.name_en)}</small>` : ''}</button>`).join('')}</div>` : '')).join('')}
      ${shareBtn(`${md(r.day)} 출석 요약`, `${md(r.day)} 주일 출석 ${r.list.filter((m) => m.on).length}명\n${DEPTS.map(([d]) => `${d} ${r.list.filter((m) => m.on && m.dept === d).length}명`).join(' · ')}`)}
      </div>
      ${D.role === 'leader_admin' ? '<div class="ld-card" data-ld-stats><p class="ld-muted">월별 통계 불러오는 중…</p></div>' : ''}`;
    if (D.role === 'leader_admin') {
      api('a_stats', { at: at(), month: r.day.slice(0, 7) }).then((s) => {
        const box = el.querySelector('[data-ld-stats]');
        if (box) box.innerHTML = `<h3>📊 ${Number(s.month.slice(5))}월 통계</h3>
          <div class="ld-tiles"><div><b>${s.people}</b><small>예배 온 사람</small></div><div><b>${s.newcomers}</b><small>새신자</small></div><div><b>${s.badges}</b><small>받은 배지</small></div><div><b>${s.certs}</b><small>수료증</small></div></div>
          <ul class="ld-list">${Object.entries(s.sundays).sort().map(([d, n]) => `<li>${md(d)} 주일 <em>${n}명</em></li>`).join('') || '<li class="ld-muted">아직 출석 기록이 없어요</li>'}</ul>`;
      }).catch(() => {});
    }
  }

  async function tabMembers(el) {
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_members', { at: at() }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    adm.extra.members = r.list;
    const pend = r.list.filter((m) => !m.approved);
    const missing = r.list.filter((m) => m.active && (!m.name_en || (m.dept !== '성인부' && !m.birth_date)));
    const dup = r.list.filter((m, i, a) => a.findIndex((x) => x.name_ko === m.name_ko) !== i);
    el.innerHTML = `
      ${pend.length ? `<div class="ld-card ld-todo"><h3>🙋 새신자 승인 · ${pend.length}명</h3><ul class="ld-list">${pend.map((m) => `<li>${nm(m)} <button type="button" class="ld-chip" data-ld-approve="${m.id}">승인</button> <button type="button" class="ld-chip" data-ld-edit="${m.id}">보기</button></li>`).join('')}</ul></div>` : ''}
      <div class="ld-card"><h3>👥 명단 · ${r.list.filter((m) => m.active).length}명 <small>이름을 누르면 고치기 · 배지 · 칭찬 편지</small></h3>
        <div class="ld-row"><button type="button" class="ld-chip" data-ld-edit="">＋ 새 사람 추가</button><button type="button" class="ld-chip" data-ld-pairopen>🤝 새 친구 짝꿍 정하기</button></div>
        ${DEPTS.map(([d]) => { const ms = r.list.filter((m) => m.dept === d && m.approved); return ms.length ? `<h4 class="ld-sub">${d} · ${ms.filter((m) => m.active).length}</h4><div class="ld-names">${ms.map((m) => `<button type="button" class="ld-name ${m.active ? '' : 'off'}" data-ld-edit="${m.id}"><b>${esc(m.name_ko)}</b><small>${esc(m.name_en || '')}${m.age ? ` · ${m.age}살` : ''}</small><span class="ld-mini">${m.badges.length ? `🏅${m.badges.length}` : ''}${m.photo_consent ? ' 📷' : ''}${m.birth_date ? ' 🎂' : ''}</span></button>`).join('')}</div>` : ''; }).join('')}
      </div>
      ${missing.length || dup.length ? `<div class="ld-card"><h3>🔎 확인해 주세요</h3>
        ${dup.length ? `<p><b>같은 이름</b>: ${dup.map((m) => esc(m.name_ko)).join(', ')}</p>` : ''}
        <p class="ld-muted ld-small">빈칸이 있는 사람 (영어 이름 또는 생년월일)</p><p>${missing.map((m) => `<button type="button" class="ld-chip" data-ld-edit="${m.id}">${esc(m.name_ko)}${m.name_en ? '' : ' · 영어 이름'}${m.dept !== '성인부' && !m.birth_date ? ' · 생일' : ''}</button>`).join(' ')}</p></div>` : ''}`;
  }
  function memberModal(id) {
    const m = (adm.extra.members || []).find((x) => x.id === id) || { active: true, approved: true };
    const el = modal(`<h3>${id ? esc(m.name_ko) : '새 사람 추가'}</h3>
      <form class="ld-form col" data-ld-mform>
        <label>한글 이름<input name="name_ko" value="${esc(m.name_ko || '')}" required></label>
        <label>영어 이름<input name="name_en" value="${esc(m.name_en || '')}"></label>
        <label>생년월일<input name="birth_date" type="date" value="${esc(m.birth_date || '')}"></label>
        <label>또는 한국 나이 (생년월일이 없을 때, 어른은 비워 두기)<input name="age" type="number" min="1" max="99" value="${m.birth_date ? '' : esc(m.age || '')}"></label>
        <label class="ld-check2"><input type="checkbox" name="photo_consent" ${m.photo_consent ? 'checked' : ''}> 부모님 사진 · AI 캐릭터 동의</label>
        <label class="ld-check2"><input type="checkbox" name="active" ${m.active !== false ? 'checked' : ''}> 활성 (끄면 명단에서 숨겨요)</label>
        <button class="ld-big" type="submit">저장</button>
      </form>
      ${id ? `<hr><h4>💛 칭찬 편지 보내기</h4><form class="ld-form col" data-ld-praise><textarea name="text" rows="2" required placeholder="오늘 의자 정리를 도와줘서 고마워요!"></textarea><button class="ld-chip" type="submit">보내기</button></form>
      <h4>🏅 배지 주기</h4><div class="ld-row"><button type="button" class="ld-chip" data-ld-give="serve">🤲 섬김 배지</button><button type="button" class="ld-chip" data-ld-give="welcome">🤝 환영 배지</button></div>
      <p class="ld-muted ld-small">받은 배지: ${(m.badges || []).join(', ') || '없음'} · 찬양 완주 ${m.songs || 0}곡</p>` : ''}<p class="ld-err" hidden></p>`);
    el.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const err = el.querySelector('.ld-err');
      try {
        if (f.matches('[data-ld-mform]')) {
          await api('a_member_save', { at: at(), id: id || undefined, name_ko: f.name_ko.value, name_en: f.name_en.value, birth_date: f.birth_date.value, age: f.age.value, photo_consent: f.photo_consent.checked, active: f.active.checked, approved: true });
          el.remove(); tabMembers(adm.root.querySelector('[data-ld-body]'));
        } else if (f.matches('[data-ld-praise]')) {
          await api('a_message', { at: at(), member_id: id, text: f.text.value }); f.reset(); alert('칭찬 편지를 보냈어요 💛');
        }
      } catch (x) { err.hidden = false; err.innerHTML = errText(x); }
    });
    el.addEventListener('click', async (e) => {
      const g = e.target.closest('[data-ld-give]');
      if (!g) return;
      const reason = prompt('어떤 일로 주나요? (예: 의자 정리)', '') || '';
      try { await api('a_badge', { at: at(), member_id: id, badge: g.dataset.ldGive, reason }); alert('배지를 줬어요 🏅'); } catch (x) { alert(errText(x)); }
    });
  }
  function pairModal() {
    const ms = (adm.extra.members || []).filter((m) => m.active);
    const opts = ms.map((m) => `<option value="${m.id}">${esc(nmPlain(m))} · ${esc(m.dept)}</option>`).join('');
    const el = modal(`<h3>🤝 새 친구 짝꿍</h3><form class="ld-form col" data-ld-pair><label>새 친구<select name="a" required><option value="">고르기</option>${opts}</select></label><label>짝꿍 리더<select name="b" required><option value="">고르기</option>${opts}</select></label><button class="ld-big" type="submit">짝꿍 정하기 (둘 다 환영 배지)</button></form>`);
    el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api('a_pair', { at: at(), newcomer_id: e.target.a.value, buddy_id: e.target.b.value }); el.remove(); alert('짝꿍을 정하고 둘 다 환영 배지를 줬어요 🤝'); } catch (x) { alert(errText(x)); }
    });
  }

  /* 감사 일기 피드백 초안 (템플릿 · AI 없이) */
  const VERSES = ['“Give thanks to the LORD, for he is good.” (Psalm 107:1)', '“Give thanks in all circumstances.” (1 Thessalonians 5:18)', '“This is the day the LORD has made; let us rejoice and be glad in it.” (Psalm 118:24)', '“Every good and perfect gift is from above.” (James 1:17)', '“The LORD is my shepherd, I lack nothing.” (Psalm 23:1)'];
  function draft(j) {
    const n = j.who.char_name || j.who.name_en || j.who.name_ko;
    const v = VERSES[Math.abs([...j.id].reduce((s, c) => s + c.charCodeAt(0), 0)) % VERSES.length];
    const mid = j.lang === 'ko'
      ? '영어로는 이렇게 말해 볼 수 있어요:\n"I\'m thankful for ________."'
      : 'Great English! 이렇게도 말할 수 있어요:\n"________"';
    return `${n}, 오늘도 감사한 마음을 찾아냈네요! 정말 멋져요 🙌 하나님이 기뻐하세요.\n${mid}\n📖 ${v}\n다음 감사 일기도 기대할게요! 💛 — 유니쌤`;
  }
  async function tabJournal(el) {
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_journals', { at: at(), all: !!adm.extra.jAll }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    adm.extra.journals = r.list;
    el.innerHTML = `<div class="ld-card"><h3>✏️ ${adm.extra.jAll ? '모든 감사 일기' : '피드백 기다리는 일기'} · ${r.list.length}개</h3>
      <div class="ld-row"><button type="button" class="ld-chip ${adm.extra.jAll ? '' : 'on'}" data-ld-jall="0">기다리는 것</button><button type="button" class="ld-chip ${adm.extra.jAll ? 'on' : ''}" data-ld-jall="1">전체</button></div>
      <ul class="ld-jlist">${r.list.map((j) => `<li><em>${md(j.day)} · ${nm(j.who)} · ${j.lang === 'ko' ? '한국어' : '영어'}</em><p>${esc(j.body)}</p>${j.feedback ? `<div class="ld-fb"><b>보낸 답장 (${esc(j.feedback_by || '')})</b><p>${br(j.feedback)}</p></div>` : `<button type="button" class="ld-chip" data-ld-fb="${j.id}">💌 피드백 쓰기</button>`}</li>`).join('') || '<li class="ld-muted">기다리는 일기가 없어요.</li>'}</ul></div>`;
  }
  function feedbackModal(id) {
    const j = adm.extra.journals.find((x) => x.id === id);
    const el = modal(`<h3>💌 ${nm(j.who)} · ${md(j.day)}</h3><p class="ld-jbody">“${esc(j.body)}”</p>
      <p class="ld-muted ld-small">유니쌤 말투 초안이에요. ______ 부분을 채우고 고쳐서 보내요.</p>
      <form class="ld-form col" data-ld-fbform><textarea name="text" rows="8" required>${esc(draft(j))}</textarea><button class="ld-big" type="submit">아이에게 보내기</button></form>`);
    el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (/_{4,}/.test(e.target.text.value) && !confirm('______ 빈칸이 남아 있어요. 그대로 보낼까요?')) return;
      try { await api('a_feedback', { at: at(), id, text: e.target.text.value }); el.remove(); tabJournal(adm.root.querySelector('[data-ld-body]')); } catch (x) { alert(errText(x)); }
    });
  }

  /* 기도 답장 추천 3가지 (템플릿) */
  function replies(p) {
    const n = p.who.char_name || p.who.name_en || p.who.name_ko;
    const t = p.body;
    const sets = [
      [/아프|병|감기|다쳐|수술|건강|열이|sick|hurt|ill/i, [`${n}, 빨리 낫도록 선생님이 기도하고 있어요. 예수님이 꼭 안아 주실 거예요 💛`, `하나님은 우리를 고치시는 분이에요. 오늘도 ${n}을 위해 함께 기도할게요 🙏`, `아픈 몸과 마음을 예수님께 맡겨요. "The LORD is my strength." 힘내요!`]],
      [/시험|공부|학교|숙제|성적|대회|발표|test|exam|school/i, [`${n}, 지혜를 주시는 하나님께 함께 기도할게요. 최선을 다하면 충분해요 ✨`, `"If any of you lacks wisdom, you should ask God." 하나님이 도와주실 거예요!`, `떨리는 마음도 하나님이 아세요. 선생님이 응원하고 기도하고 있어요 🙏`]],
      [/엄마|아빠|가족|동생|언니|형|누나|오빠|할머니|할아버지|family|mom|dad/i, [`${n}의 가족을 위해 선생님도 이름을 불러 기도할게요 💛`, `가족을 사랑하는 ${n}의 마음이 참 예뻐요. 하나님이 우리 가족을 지켜 주세요 🙏`, `"As for me and my household, we will serve the LORD." 함께 기도해요!`]],
      [/친구|짝|따돌|싸웠|friend/i, [`${n}, 친구를 위해 기도하는 마음이 예수님을 닮았어요 💛`, `좋은 친구를 주시고 관계를 지켜 주시도록 함께 기도할게요 🙏`, `"Love one another." 하나님이 ${n}과 친구 사이를 따뜻하게 해 주실 거예요!`]],
    ];
    const hit = sets.find(([re]) => re.test(t));
    return hit ? hit[1] : [`${n}, 기도 제목 고마워요. 선생님이 기도하고 있어요 🙏`, `하나님은 ${n}의 기도를 다 들으세요. 함께 기도할게요 💛`, `"Do not be anxious about anything, but pray." 예수님께 맡기고 기다려요!`];
  }
  async function tabPrayer(el, D) {
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_prayers', { at: at() }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    adm.extra.prayers = r.list;
    el.innerHTML = `<div class="ld-card"><h3>🙏 기도 제목 · 새로 온 것 ${r.list.filter((p) => p.status === 'new').length}개</h3>
      <ul class="ld-jlist">${r.list.map((p) => `<li class="${p.status === 'new' ? 'new' : ''}"><em>${md(new Date(Date.parse(p.created_at) + 9 * 3600e3).toISOString().slice(0, 10))} · ${nm(p.who)}</em><p>${esc(p.body)}</p>
        ${p.replies.map((x) => `<div class="ld-fb"><b>${esc(x.sender)}의 답장</b><p>${br(x.body)}</p></div>`).join('')}
        <button type="button" class="ld-chip" data-ld-pr="${p.id}">🙏 답장 보내기</button></li>`).join('') || '<li class="ld-muted">아직 기도 제목이 없어요.</li>'}</ul></div>
      ${D.role === 'leader_admin' ? '<div class="ld-card" data-ld-sent><p class="ld-muted">보낸 메시지 불러오는 중…</p></div>' : ''}`;
    if (D.role === 'leader_admin') {
      api('a_sent', { at: at() }).then((s) => {
        const box = el.querySelector('[data-ld-sent]');
        if (box) box.innerHTML = `<h3>📤 보낸 메시지 (목사님 메시지 포함)</h3><ul class="ld-jlist">${s.list.map((m) => `<li><em>${esc(m.sender)} → ${nm(m.who)} · ${({ praise: '칭찬', prayer: '기도 답장', feedback: '일기 피드백' })[m.kind]}${m.read ? ' · 읽음' : ''}</em><p>${br(m.body)}</p></li>`).join('') || '<li class="ld-muted">아직 없어요</li>'}</ul>`;
      }).catch(() => {});
    }
  }
  function prayerModal(id) {
    const p = adm.extra.prayers.find((x) => x.id === id);
    const rs = replies(p);
    const el = modal(`<h3>🙏 ${nm(p.who)}</h3><p class="ld-jbody">“${esc(p.body)}”</p>
      <p class="ld-muted ld-small">추천 답장 3가지 · 하나를 누르고 고쳐서 보내요</p>
      <div class="ld-sugg">${rs.map((x, i) => `<button type="button" class="ld-chip" data-ld-sg="${i}">${esc(x)}</button>`).join('')}</div>
      <form class="ld-form col" data-ld-prform><textarea name="text" rows="4" required>${esc(rs[0])}</textarea><button class="ld-big" type="submit">아이 폰으로 보내기</button></form>`);
    el.addEventListener('click', (e) => { const s = e.target.closest('[data-ld-sg]'); if (s) el.querySelector('textarea').value = rs[Number(s.dataset.ldSg)]; });
    el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api('a_prayer_reply', { at: at(), id, text: e.target.text.value }); el.remove(); tabPrayer(adm.root.querySelector('[data-ld-body]'), adm.data); } catch (x) { alert(errText(x)); }
    });
  }

  async function tabShare(el, D) {
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_shared', { at: at() }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    const canWrite = D.role === 'leader_admin' || D.role === 'pastor';
    el.innerHTML = `${canWrite ? `<div class="ld-card"><h3>📢 공지하기 · 공유하기</h3><form class="ld-form col" data-ld-shareform><input name="title" placeholder="제목" required><textarea name="body" rows="4" placeholder="운영진에게 알릴 내용" required></textarea><button class="ld-big" type="submit">운영진 방에 올리기</button></form></div>` : ''}
      <div class="ld-card"><h3>📢 YEM 최고 운영진 방 <small>공유된 글만 보여요 · 아이 개인 기록은 볼 수 없어요</small></h3>
      <ul class="ld-jlist">${r.list.map((x) => `<li><em>${esc(x.author)} · ${esc(ROLE[x.role] || x.role)} · ${md(new Date(Date.parse(x.created_at) + 9 * 3600e3).toISOString().slice(0, 10))}</em><b>${esc(x.title)}</b><p>${br(x.body)}</p></li>`).join('') || '<li class="ld-muted">아직 올라온 글이 없어요.</li>'}</ul></div>`;
  }
  async function doShare(title, body) {
    const sensitive = /기도|일기|생일|결석/.test(title + body);
    if (!confirm(`${sensitive ? '⚠️ 아이 개인 정보가 들어 있을 수 있어요.\n' : ''}“${title}”을(를) 최고 운영진 방에 올릴까요?`)) return;
    try { await api('a_share', { at: at(), title, body }); alert('운영진 방에 올렸어요 📢'); } catch (x) { alert(errText(x)); }
  }

  async function tabSet(el) {
    el.innerHTML = `<div class="ld-card"><h3>🔑 YEM 인증 코드 바꾸기</h3>
        <form class="ld-form" data-ld-code-set><input name="code" autocomplete="off" minlength="4" placeholder="새 코드" required><button class="ld-big" type="submit">바꾸기</button></form>
        <p class="ld-muted ld-small">이미 이름을 고른 휴대폰은 그대로 들어와요.</p></div>
      <div class="ld-card"><h3>🔒 내 비밀번호 바꾸기</h3><form class="ld-form" data-ld-pw><input name="password" type="password" minlength="6" autocomplete="new-password" placeholder="새 비밀번호 (6자 이상)" required><button class="ld-big" type="submit">바꾸기</button></form></div>
      <div class="ld-card"><h3>👥 관리자 · 권한 <small>사람마다 비밀번호가 따로예요</small></h3><div data-ld-staff><p class="ld-muted">불러오는 중…</p></div>
        <form class="ld-form col" data-ld-staff-form>
          <label>이름<input name="name" placeholder="예: 샤를 목사님" required></label>
          <label>역할<select name="role"><option value="leader">임명 리더</option><option value="pastor">목사님</option><option value="exec_staff">최고 운영진</option></select></label>
          <fieldset class="ld-scope"><legend>임명 리더 권한</legend><label><input type="checkbox" name="sc" value="attendance" checked> 출석</label><label><input type="checkbox" name="sc" value="challenge" checked> 챌린지 현황</label><label><input type="checkbox" name="sc" value="manual" checked> 수동 인증 · 수여 체크</label></fieldset>
          <label>비밀번호 (6자 이상)<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
          <button class="ld-big" type="submit">추가하기</button>
        </form></div>
      <p class="ld-muted ld-small ld-center">챌린지 사진은 1년이 지나면 자동으로 지워져요 (인증 기록은 남아요).</p>`;
    drawStaff(el, (await api('a_staff_list', { at: at() }).catch(() => ({ list: [] }))).list);
  }
  function drawStaff(el, list) {
    const box = el.querySelector('[data-ld-staff]');
    if (!box) return;
    box.innerHTML = `<ul class="ld-list">${(list || []).map((s) => `<li><b>${esc(s.name)}</b> <em>${esc(ROLE[s.role] || s.role)}</em>
      ${s.role === 'leader' ? ['attendance', 'challenge', 'manual'].map((k) => `<label class="ld-check"><input type="checkbox" data-ld-scope="${s.id}" value="${k}" ${(s.scope || []).includes(k) ? 'checked' : ''}> ${({ attendance: '출석', challenge: '현황', manual: '수동 인증' })[k]}</label>`).join('') : ''}
      ${s.role !== 'leader_admin' ? `<button type="button" class="ld-chip" data-ld-staff-del="${s.id}">해제</button>` : ''}</li>`).join('')}</ul>`;
  }


  /* ---------- 🏇 챌린지 달리기 판: 도전 중인 아이만, 귀엽게 ---------- */
  const SPROUT = ['🌱', '🌱', '🌿', '🌿', '🌳', '🌳', '🍎'];
  function raceCard(D) {
    const ch = D.challenge;
    if (!ch || !D.members) return '';
    const list = D.members.filter((m) => m.days.length).sort((a, b) => b.days.length - a.days.length || a.name_ko.localeCompare(b.name_ko));
    const month = Number(ch.start.slice(5, 7));
    return `<div class="ld-race">
      <div class="ld-race-h"><span class="ld-race-ico">🏇</span><div><b>${month}월 챌린지 · 도전 중인 리더들</b><small>${esc(ch.title)} · <em>${list.length}명</em>이 다그닥 다그닥 달리는 중!</small></div></div>
      ${list.length ? `<ul class="ld-race-list">${list.map((m, i) => {
        const n = m.days.length;
        const pct = Math.min(100, Math.round((n / ch.days) * 100));
        const done = n >= ch.days;
        return `<li class="c${i % 5}">
          <button type="button" class="ld-race-name" data-ld-kid="${m.id}">${esc(m.name_ko)}${m.name_en ? `<small>${esc(m.name_en)}</small>` : ''}</button>
          <div class="ld-track"><div class="ld-track-fill" style="width:${pct}%"></div>
            <div class="ld-track-steps">${Array.from({ length: ch.days }, (_, k) => `<span>${k < n ? SPROUT[Math.min(SPROUT.length - 1, Math.floor((k / Math.max(1, ch.days - 1)) * (SPROUT.length - 1)))] : '·'}</span>`).join('')}</div>
            <span class="ld-runner ${done ? 'won' : ''}" style="left:calc(${pct}% - ${pct ? 18 : 0}px)">${done ? '👑' : '🏇'}</span>
            ${done ? '' : '<span class="ld-finish">🏁</span>'}</div>
          <b class="ld-race-n">${n}<small>회</small>${done ? '<em>완주!</em>' : ''}</b></li>`;
      }).join('')}</ul>` : '<p class="ld-race-empty">첫 사진이 올라오면 여기서 출발해요! 🐴💨</p>'}
    </div>`;
  }

  /* ---------- 새신자 ---------- */
  const NC_API = 'https://wtfeoakjzzjkcpstultn.supabase.co/functions/v1/yem-nc';
  async function nc(a, body = {}) {
    let r;
    try { r = await fetch(NC_API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a, at: at(), ...body }) }); }
    catch (e) { throw new Error('network'); }
    const j = await r.json().catch(() => ({ error: 'server' }));
    if (!r.ok || j.error) throw new Error(j.error || 'server');
    return j;
  }
  const WELCOME_DEFAULT = `🌟 {이름}, YEM에 온 걸 환영해요! 🎉
인천영락교회 영어예배부 Youngnak English Ministry(YEM)예요.

⛪ 예배: 매주 주일 오후 2시 · 2층 다윗홀
📖 예배 순서와 YEM 이야기 한눈에 보기
👉 ${SITE}/#welcome

📚 영어 스토리북 · 🎧 영어 찬양도 집에서 함께해요!
📲 휴대폰 홈 화면에 앱처럼 추가하기
👉 ${SITE}/#addhome

궁금한 건 언제든 물어봐 주세요. 다음 주일에 또 만나요! 💛`;
  const FOLLOW_KEYS = [['msg', '💌 환영 메시지'], ['app', '📲 홈페이지 안내'], ['buddy', '🤝 짝꿍'], ['call', '📞 보호자 인사'], ['second', '🔁 두 번째 방문']];
  function ncForm(day, onDone) {
    const el = modal(`<h3>🙋 새신자 등록 <small class="ld-muted">${md(day)} 주일 출석으로 함께 체크돼요</small></h3>
      <form class="ld-form col" data-ld-ncform>
        <label>한글 이름<input name="name_ko" required></label>
        <label>영어 이름 (없으면 비워 두기)<input name="name_en"></label>
        <div class="ld-two"><label>한국 나이<input name="age" type="number" min="1" max="99" placeholder="예: 7"></label><label>또는 생년월일<input name="birth_date" type="date"></label></div>
        <label>나이를 모르면 부서<select name="dept"><option value="">고르기</option>${DEPTS.map(([d]) => `<option>${d}</option>`).join('')}</select></label>
        <label>메모 (누구 소개 · 보호자 연락 방법 등, 관리자만 봐요)<input name="note" maxlength="200"></label>
        <label class="ld-check2"><input type="checkbox" name="photo_consent"> 보호자가 사진 · AI 캐릭터에 동의했어요</label>
        <button class="ld-big" type="submit">등록하고 출석 체크</button>
      </form><p class="ld-err" hidden></p>`);
    el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const btn = f.querySelector('button'); btn.disabled = true;
      try {
        const r = await nc('nc_add', { name_ko: f.name_ko.value, name_en: f.name_en.value, age: f.age.value, birth_date: f.birth_date.value, dept: f.dept.value, note: f.note.value, photo_consent: f.photo_consent.checked, day });
        el.remove(); onDone && onDone(r);
      } catch (x) { const p = el.querySelector('.ld-err'); p.hidden = false; p.innerHTML = errText(x); btn.disabled = false; }
    });
  }

  async function tabAttend2(el, D) {
    const sun = adm.extra.attDay || D.attendance.sunday;
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await api('a_attend_list', { at: at(), day: sun }); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    const sundays = Array.from({ length: 10 }, (_, i) => new Date(Date.parse(D.attendance.sunday) - i * 7 * 864e5).toISOString().slice(0, 10));
    const count = () => el.querySelectorAll('.ld-att-chip.on').length;
    el.innerHTML = `
      <div class="ld-att-hero">
        <div class="ld-att-num"><small>${Number(r.day.slice(5, 7))}월 ${Number(r.day.slice(8))}일 주일</small><b data-ld-attcount>${r.list.filter((m) => m.on).length}</b><span>명 출석 🎉</span></div>
        <button type="button" class="ld-big" data-ld-ncopen>🙋 새신자 등록</button>
      </div>
      <div class="ld-pills">${sundays.map((s) => `<button type="button" class="${s === r.day ? 'on' : ''}" data-ld-attday="${s}">${md(s)}</button>`).join('')}</div>
      <p class="ld-muted ld-small ld-center">이름을 톡 누르면 출석 ✅ · 한 번 더 누르면 취소</p>
      ${DEPTS.map(([d, e], i) => { const ms = r.list.filter((m) => m.dept === d); return ms.length ? `<section class="ld-att-dept d${i}">
        <h4><span>${e}</span>${d}<em data-ld-deptcount="${d}">${ms.filter((m) => m.on).length} / ${ms.length}</em></h4>
        <div class="ld-att-grid">${ms.map((m) => `<button type="button" class="ld-att-chip ${m.on ? 'on' : ''}" data-ld-att="${m.id}" data-day="${r.day}" data-dept="${d}"><span class="av">${esc(m.name_ko.slice(-2, -1) || m.name_ko.slice(0, 1))}</span><b>${esc(m.name_ko)}</b>${m.name_en ? `<small>${esc(m.name_en)}</small>` : ''}</button>`).join('')}</div>
      </section>` : ''; }).join('')}
      <div class="ld-row ld-center-row">${shareBtn(`${md(r.day)} 출석 요약`, `${md(r.day)} 주일 출석 ${r.list.filter((m) => m.on).length}명\n${DEPTS.map(([d]) => `${d} ${r.list.filter((m) => m.on && m.dept === d).length}명`).join(' · ')}`)}</div>
      ${D.role === 'leader_admin' ? '<div class="ld-card" data-ld-stats><p class="ld-muted">월별 통계 불러오는 중…</p></div>' : ''}`;
    el.addEventListener('click', async (e) => {
      const ab = e.target.closest('[data-ld-att]');
      if (ab) {
        e.stopPropagation();
        const on = !ab.classList.contains('on');
        ab.classList.toggle('on', on); ab.classList.add('pop'); setTimeout(() => ab.classList.remove('pop'), 300);
        const upd = () => {
          el.querySelector('[data-ld-attcount]').textContent = count();
          const d = ab.dataset.dept; const all = el.querySelectorAll(`[data-dept="${d}"]`);
          el.querySelector(`[data-ld-deptcount="${d}"]`).textContent = `${[...all].filter((x) => x.classList.contains('on')).length} / ${all.length}`;
        };
        upd();
        try { await api('a_attend', { at: at(), member_id: ab.dataset.ldAtt, day: ab.dataset.day, on }); } catch (x) { ab.classList.toggle('on', !on); upd(); alert(errText(x)); }
        return;
      }
      if (e.target.closest('[data-ld-ncopen]')) { e.stopPropagation(); ncForm(r.day, () => tabAttend2(adm.root.querySelector('[data-ld-body]'), adm.data)); }
    });
    if (D.role === 'leader_admin') {
      api('a_stats', { at: at(), month: r.day.slice(0, 7) }).then((s) => {
        const box = el.querySelector('[data-ld-stats]');
        if (box) box.innerHTML = `<h3>📊 ${Number(s.month.slice(5))}월 통계</h3>
          <div class="ld-tiles"><div><b>${s.people}</b><small>예배 온 사람</small></div><div><b>${s.newcomers}</b><small>새신자</small></div><div><b>${s.badges}</b><small>받은 배지</small></div><div><b>${s.certs}</b><small>수료증</small></div></div>
          <div class="ld-bars">${Object.entries(s.sundays).sort().map(([d, n]) => `<div><i style="height:${Math.min(100, n * 3)}px"></i><b>${n}</b><small>${md(d)}</small></div>`).join('') || '<p class="ld-muted">아직 출석 기록이 없어요</p>'}</div>`;
      }).catch(() => {});
    }
  }

  async function tabNewcomer(el, D) {
    el.innerHTML = '<div class="ld-card"><p class="ld-muted">불러오는 중…</p></div>';
    let r;
    try { r = await nc('nc_list'); } catch (e) { el.innerHTML = `<p class="ld-err">${errText(e)}</p>`; return; }
    const tmpl = r.welcome || WELCOME_DEFAULT;
    const months = [...new Set(r.list.map((m) => m.first.slice(0, 7)))].sort().reverse();
    const msgFor = (m) => tmpl.replace(/\{이름\}/g, m ? (m.name_en || m.name_ko) : '').replace(/^ ?, /, '');
    el.innerHTML = `
      <div class="ld-card ld-nc-top"><h3>🙋 새신자 관리 <small>등록 → 환영 메시지 → 홈페이지 안내 → 짝꿍 → 두 번째 방문까지</small></h3>
        <div class="ld-row"><button type="button" class="ld-big" data-ld-ncopen>＋ 새신자 등록</button>
        <button type="button" class="ld-chip" data-ld-copylink="${SITE}/#welcome">🔗 YEM 한눈에 보기 링크 복사</button>
        <a class="ld-chip" href="#welcome" target="_blank" rel="noopener">👀 미리 보기</a></div></div>
      ${months.map((mo) => { const ms = r.list.filter((m) => m.first.startsWith(mo)); return `<div class="ld-card"><h3>${Number(mo.slice(5))}월 새신자 · ${ms.length}명</h3>
        <ul class="ld-nc-list">${ms.map((m) => {
          const f = { ...m.follow }; if (m.visits >= 2) f.second = f.second || 'auto'; if (m.buddy) f.buddy = f.buddy || 'auto';
          const doneN = FOLLOW_KEYS.filter(([k]) => f[k]).length;
          return `<li>
            <div class="ld-nc-head"><span class="av">${esc(m.name_ko.slice(0, 1))}</span><div><b>${esc(m.name_ko)}</b>${m.name_en ? ` <small>${esc(m.name_en)}</small>` : ''} <em class="ld-tag">${esc(m.dept)}${m.age ? ` · ${m.age}살` : ''}</em>${m.approved ? '' : ' <em class="ld-tag warn">스스로 등록 · 승인 전</em>'}
              <p class="ld-muted ld-small">첫 방문 ${md(m.first)} · 출석 ${m.visits}번${m.last ? ` · 최근 ${md(m.last)}` : ''}${m.buddy ? ` · 짝꿍 ${esc(m.buddy)}` : ''}</p></div>
              <span class="ld-nc-step">${doneN}/${FOLLOW_KEYS.length}</span></div>
            <div class="ld-nc-follow">${FOLLOW_KEYS.map(([k, l]) => `<button type="button" class="${f[k] ? 'on' : ''}" data-ld-follow="${m.id}" data-k="${k}" ${f[k] === 'auto' ? 'disabled' : ''}>${l}${f[k] && f[k] !== 'auto' ? `<small>${md(f[k])}</small>` : ''}</button>`).join('')}</div>
            <div class="ld-row"><button type="button" class="ld-chip" data-ld-ncmsg="${m.id}">📋 환영 메시지 복사</button>
              <input class="ld-nc-note" data-ld-ncnote="${m.id}" value="${esc(m.note)}" placeholder="메모 (관리자만)" maxlength="200"></div>
          </li>`;
        }).join('')}</ul></div>`; }).join('') || '<div class="ld-card"><p class="ld-muted">아직 새신자가 없어요. 출석 탭이나 위 버튼으로 등록해요.</p></div>'}
      <details class="ld-card"${r.list.length ? '' : ' open'}><summary><b>✏️ 환영 메시지 문구 고치기</b> <small class="ld-muted">{이름} 자리에 이름이 들어가요</small></summary>
        <textarea data-ld-wtmpl rows="12">${esc(tmpl)}</textarea>
        <div class="ld-row"><button type="button" class="ld-chip" data-ld-wsave>저장</button><button type="button" class="ld-chip" data-ld-wreset>기본 문구로</button><button type="button" class="ld-chip" data-ld-wcopy>📋 이름 없이 복사</button></div></details>
      <div class="ld-card ld-howto"><h3>📒 매주 새신자, 이렇게 해요</h3><ol>
        <li><b>주일 예배 중</b> ✅ 출석 탭 → <b>🙋 새신자 등록</b> (이름 · 나이만 넣어도 돼요). 그날 출석도 같이 체크돼요.</li>
        <li><b>예배 직후</b> 여기서 <b>📋 환영 메시지 복사</b> → 보호자 카톡에 붙여넣기 → 💌 체크.</li>
        <li>메시지 속 <b>YEM 한눈에 보기</b> 링크로 예배 순서 · 홈페이지 쓰는 법을 알려 줘요 → 📲 체크.</li>
        <li>👥 명단 탭 → <b>🤝 새 친구 짝꿍 정하기</b>. 둘 다 환영 배지를 받아요 (짝꿍은 저절로 체크).</li>
        <li><b>다음 주일</b> 다시 오면 🔁 두 번째 방문이 저절로 체크돼요. 2주 연속 안 오면 🏠 오늘 할 일에 결석 알림이 떠요.</li>
      </ol></div>`;
    el.addEventListener('click', async (e) => {
      const t = e.target;
      if (t.closest('[data-ld-ncopen]')) { e.stopPropagation(); ncForm(D.today && new Date(Date.parse(D.today)).getUTCDay() === 0 ? D.today : D.attendance.sunday, () => tabNewcomer(adm.root.querySelector('[data-ld-body]'), adm.data)); return; }
      const cl = t.closest('[data-ld-copylink]');
      if (cl) { e.stopPropagation(); cl.textContent = (await copyText(cl.dataset.ldCopylink)) ? '✅ 링크를 복사했어요' : cl.dataset.ldCopylink; return; }
      const fo = t.closest('[data-ld-follow]');
      if (fo) {
        e.stopPropagation();
        try { await nc('nc_follow', { id: fo.dataset.ldFollow, key: fo.dataset.k, val: !fo.classList.contains('on') }); tabNewcomer(adm.root.querySelector('[data-ld-body]'), adm.data); } catch (x) { alert(errText(x)); }
        return;
      }
      const mm = t.closest('[data-ld-ncmsg]');
      if (mm) {
        e.stopPropagation();
        const m = r.list.find((x) => x.id === mm.dataset.ldNcmsg);
        const ok = await copyText(msgFor(m).replace(/^🌟 \s*,/, '🌟'));
        mm.textContent = ok ? '✅ 복사했어요! 카톡에 붙여넣기' : '복사가 안 돼요';
        if (ok && !m.follow.msg) nc('nc_follow', { id: m.id, key: 'msg', val: true }).catch(() => {});
        return;
      }
      if (t.closest('[data-ld-wsave]')) { e.stopPropagation(); try { await nc('nc_welcome', { text: el.querySelector('[data-ld-wtmpl]').value }); alert('환영 메시지 문구를 저장했어요.'); } catch (x) { alert(errText(x)); } return; }
      if (t.closest('[data-ld-wreset]')) { e.stopPropagation(); el.querySelector('[data-ld-wtmpl]').value = WELCOME_DEFAULT; return; }
      if (t.closest('[data-ld-wcopy]')) { e.stopPropagation(); const b = t.closest('button'); b.textContent = (await copyText(el.querySelector('[data-ld-wtmpl]').value.replace(/\{이름\},?\s?/g, ''))) ? '✅ 복사했어요' : '복사가 안 돼요'; }
    });
    el.addEventListener('change', async (e) => {
      const n = e.target.closest('[data-ld-ncnote]');
      if (n) { try { await nc('nc_note', { id: n.dataset.ldNcnote, note: n.value }); n.classList.add('saved'); } catch (x) { alert(errText(x)); } }
    });
  }

  /* 아이 한 명의 7일 칸: 날짜마다 사진 넣기 · 바꾸기 · 지우기 (유니쌤이 대신 해 줘요) */
  function kidPanel(mid) {
    const D = adm.data;
    const ch = D.challenge;
    const manual = D.role === 'leader_admin' || (D.scope || []).includes('manual');
    const days = dayList(ch);
    const el = modal('<div data-ld-kp></div>');
    el.classList.add('wide');
    const box = el.querySelector('[data-ld-kp]');
    const draw = () => {
      const m = adm.data.members.find((x) => x.id === mid);
      const by = Object.fromEntries(m.days.map((x) => [x.day, x]));
      box.innerHTML = `<h3>${nm(m)}</h3>
        <p class="ld-muted ld-small">${m.days.length}/${ch.days}일 · ${m.cert ? '🏅 수료증 발급됨' : `${ch.days}일을 채우면 수료증이 자동으로 나와요`}</p>
        <div class="ld-kp">${days.map((d) => {
          const x = by[d.iso];
          return `<div class="ld-kp-day ${x ? 'ok' : ''} ${d.iso === D.today ? 'now' : ''}">
            <b>${DOW[d.dow]} ${d.m}/${d.d}</b>
            <div class="ld-kp-pic" data-ld-kpic="${d.iso}">${x ? (x.photo ? '<span class="ld-muted ld-small">불러오는 중…</span>' : '<span class="ld-kp-ok">✅</span>') : '<span class="ld-kp-empty">＋</span>'}</div>
            <small>${x ? (x.method === 'manual' ? `선생님이 넣음${x.by ? ` · ${esc(x.by)}` : ''}` : '아이가 올림') : '아직 없어요'}</small>
            ${manual ? `<label class="ld-chip ld-kp-up">📷 ${x && x.photo ? '사진 바꾸기' : '사진 넣기'}<input type="file" accept="image/*" data-ld-kpup="${d.iso}" hidden></label>
            ${x ? `<button type="button" class="ld-chip danger" data-ld-kpdel="${d.iso}">지우기</button>` : `<button type="button" class="ld-chip" data-ld-kpnone="${d.iso}">사진 없이 ✅</button>`}` : ''}
          </div>`;
        }).join('')}</div>
        <p class="ld-err" hidden></p>`;
      m.days.filter((x) => x.photo).forEach((x) => {
        api('a_photo', { at: at(), member_id: mid, day: x.day }).then((r) => {
          const c = box.querySelector(`[data-ld-kpic="${x.day}"]`);
          if (c && r.url) c.innerHTML = `<img src="${esc(r.url)}" alt="${md(x.day)} 인증 사진">`;
        }).catch(() => {});
      });
    };
    const save = async (day, file, del) => {
      const err = box.querySelector('.ld-err');
      const slot = box.querySelector(`[data-ld-kpic="${day}"]`);
      if (slot) slot.innerHTML = '<span class="ld-muted ld-small">⏳ 저장 중…</span>';
      try {
        adm.data = del ? await api('a_del', { at: at(), member_id: mid, day })
          : await api('a_add', { at: at(), member_id: mid, day, image: file ? await shrink(file) : undefined });
        draw();
        adminDraw();
      } catch (er) { draw(); err.hidden = false; err.innerHTML = errText(er); }
    };
    box.addEventListener('change', (e) => { const i = e.target.closest('[data-ld-kpup]'); if (i && i.files[0]) save(i.dataset.ldKpup, i.files[0]); });
    box.addEventListener('click', (e) => {
      const n = e.target.closest('[data-ld-kpnone]');
      if (n) { save(n.dataset.ldKpnone); return; }
      const d = e.target.closest('[data-ld-kpdel]');
      if (d && confirm(`${md(d.dataset.ldKpdel)} 인증을 지울까요? 사진도 함께 지워져요.`)) save(d.dataset.ldKpdel, null, true);
    });
    draw();
  }

  async function cellClick(mid, day) {
    const D = adm.data;
    const m = D.members.find((x) => x.id === mid);
    const x = m.days.find((d) => d.day === day);
    const manual = D.role === 'leader_admin' || (D.scope || []).includes('manual');
    if (!x) {
      if (!manual) return;
      const el = modal(`<h3>${nm(m)} · ${md(day)} 인증 넣기</h3>
        <form class="ld-form col"><label>사진 (없으면 비워 두세요)<input type="file" name="photo" accept="image/*"></label><button class="ld-big" type="submit">인증 추가</button></form><p class="ld-err" hidden></p>`);
      el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = '저장 중…';
        try {
          const f = e.target.photo.files[0];
          adm.data = await api('a_add', { at: at(), member_id: mid, day, image: f ? await shrink(f) : undefined });
          el.remove(); adminDraw();
        } catch (er) { const p = el.querySelector('.ld-err'); p.hidden = false; p.innerHTML = errText(er); btn.disabled = false; btn.textContent = '인증 추가'; }
      });
      return;
    }
    const el = modal(`<h3>${nm(m)} · ${md(day)}</h3><p class="ld-muted">${x.method === 'manual' ? `선생님이 넣은 기록${x.by ? ` (${esc(x.by)})` : ''}` : '아이가 직접 올렸어요'}</p>
      <div class="ld-modal-pic">${x.photo ? '<p class="ld-muted">사진 불러오는 중…</p>' : '<p class="ld-muted">사진 없이 인증했어요.</p>'}</div>
      ${manual ? '<button type="button" class="ld-chip danger" data-ld-del>이 날 인증 지우기</button>' : ''}`);
    if (x.photo) api('a_photo', { at: at(), member_id: mid, day }).then((r) => { el.querySelector('.ld-modal-pic').innerHTML = r.url ? `<img src="${esc(r.url)}" alt="인증 사진">` : ''; }).catch(() => {});
    const del = el.querySelector('[data-ld-del]');
    if (del) del.addEventListener('click', async () => {
      if (!confirm(`${m.name_ko} ${md(day)} 인증을 지울까요? 사진도 함께 지워져요.`)) return;
      try { adm.data = await api('a_del', { at: at(), member_id: mid, day }); el.remove(); adminDraw(); } catch (er) { alert(errText(er)); }
    });
  }

  function bindAdmin(root) {
    ['click', 'keydown', 'touchstart'].forEach((ev) => root.addEventListener(ev, () => { if (at()) touchIdle(); }, { passive: true }));
    root.addEventListener('submit', async (e) => {
      const f = e.target;
      e.preventDefault();
      const err = f.parentElement.querySelector('.ld-err');
      const show = (er) => { if (err) { err.hidden = false; err.innerHTML = errText(er); } else alert(errText(er).replace(/<[^>]+>/g, '')); };
      const btn = f.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
      const done = () => { if (btn) btn.disabled = false; };
      try {
        if (f.matches('[data-ld-login]')) { const r = await api('login', { password: f.password.value }); ss.set('at', r.at); adm.tab = 'home'; renderAdmin(); }
        else if (f.matches('[data-ld-setup]')) { const r = await api('setup', { setup_key: f.setup_key.value, name: f.name.value, password: f.password.value, code: f.code.value }); ss.set('at', r.at); renderAdmin(); }
        else if (f.matches('[data-ld-add-form]')) {
          const ph = f.photo.files[0];
          const who = f.member_id.selectedOptions[0].textContent;
          const when = f.day.selectedOptions[0].textContent;
          adm.data = await api('a_add', { at: at(), member_id: f.member_id.value, day: f.day.value, image: ph ? await shrink(ph) : undefined });
          adminDraw();
          const ok = adm.root.querySelector('.ld-ok'); if (ok) { ok.hidden = false; ok.textContent = `✅ ${who} · ${when} 인증을 넣었어요.`; }
        } else if (f.matches('[data-ld-ch-form]')) {
          const texts = f.texts.value.split('\n').filter((l) => l.trim()).map((l) => { const [en, ko, pray] = l.split('|').map((x) => (x || '').trim()); return { en, ko, pray }; });
          await api('a_challenge_save', { at: at(), title: f.title.value, title_en: f.title_en.value, start: f.start.value, days: f.days.value, texts });
          alert('챌린지를 만들었어요. 시작일부터 아이 화면에 나와요!'); renderAdmin();
        } else if (f.matches('[data-ld-code-set]')) { await api('a_code', { at: at(), code: f.code.value }); alert('YEM 인증 코드를 바꿨어요.'); f.reset(); done(); }
        else if (f.matches('[data-ld-pw]')) { await api('a_password', { at: at(), password: f.password.value }); alert('비밀번호를 바꿨어요.'); f.reset(); done(); }
        else if (f.matches('[data-ld-staff-form]')) {
          const scope = [...f.querySelectorAll('[name=sc]:checked')].map((x) => x.value);
          const r = await api('a_staff', { at: at(), name: f.name.value, role: f.role.value, password: f.password.value, scope });
          f.reset(); drawStaff(root, r.list); done();
        } else if (f.matches('[data-ld-shareform]')) { await doShare(f.title.value, f.body.value); f.reset(); tabShare(root.querySelector('[data-ld-body]'), adm.data); }
        else done();
      } catch (er) { show(er); done(); }
    });
    root.addEventListener('click', async (e) => {
      const t = e.target;
      const tb = t.closest('[data-ld-tab]');
      if (tb) { adm.tab = tb.dataset.ldTab; adminDraw(); return; }
      const fd = t.closest('[data-ld-fdept]');
      if (fd) { adm.dept = fd.dataset.ldFdept; adminDraw(); return; }
      const kb = t.closest('[data-ld-kid]');
      if (kb) { kidPanel(kb.dataset.ldKid); return; }
      const c = t.closest('[data-ld-cell]');
      if (c) { cellClick(c.dataset.ldCell, c.dataset.day); return; }
      if (t.closest('[data-ld-reload]')) { renderAdmin(); return; }
      if (t.closest('[data-ld-logout]')) { ss.del('at'); clearTimeout(adm.idle); adminGate(); return; }
      const sh = t.closest('[data-ld-share]');
      if (sh) { doShare(sh.dataset.title, sh.dataset.body); return; }
      if (t.closest('[data-ld-gm-copy]')) {
        const v = root.querySelector('[data-ld-gm]').value;
        const ok = await copyText(v);
        t.closest('button').textContent = ok ? '✅ 복사했어요!' : '복사가 안 돼요. 길게 눌러 복사해요';
        api('a_group_save', { at: at(), body: v, copied: true }).catch(() => {});
        return;
      }
      if (t.closest('[data-ld-gm-save]')) { try { await api('a_group_save', { at: at(), body: root.querySelector('[data-ld-gm]').value }); alert('오늘 문구를 저장했어요.'); } catch (x) { alert(errText(x)); } return; }
      const ad = t.closest('[data-ld-attday]');
      if (ad) { adm.extra.attDay = ad.dataset.ldAttday; adminDraw(); return; }
      const ab = t.closest('[data-ld-att]');
      if (ab) {
        const on = !ab.classList.contains('on');
        ab.classList.toggle('on', on);
        try { await api('a_attend', { at: at(), member_id: ab.dataset.ldAtt, day: ab.dataset.day, on }); } catch (x) { ab.classList.toggle('on', !on); alert(errText(x)); }
        return;
      }
      const ed = t.closest('[data-ld-edit]');
      if (ed) { memberModal(ed.dataset.ldEdit); return; }
      const ap = t.closest('[data-ld-approve]');
      if (ap) {
        const m = adm.extra.members.find((x) => x.id === ap.dataset.ldApprove);
        try { await api('a_member_save', { at: at(), id: m.id, name_ko: m.name_ko, name_en: m.name_en, birth_date: m.birth_date, age: m.birth_date ? '' : m.age, photo_consent: m.photo_consent, active: true, approved: true }); tabMembers(root.querySelector('[data-ld-body]')); } catch (x) { alert(errText(x)); }
        return;
      }
      if (t.closest('[data-ld-pairopen]')) { pairModal(); return; }
      const ja = t.closest('[data-ld-jall]');
      if (ja) { adm.extra.jAll = ja.dataset.ldJall === '1'; tabJournal(root.querySelector('[data-ld-body]')); return; }
      const fb = t.closest('[data-ld-fb]');
      if (fb) { feedbackModal(fb.dataset.ldFb); return; }
      const pr = t.closest('[data-ld-pr]');
      if (pr) { prayerModal(pr.dataset.ldPr); return; }
      const sd = t.closest('[data-ld-staff-del]');
      if (sd && confirm('이 사람의 관리자 권한을 해제할까요?')) {
        try { drawStaff(root, (await api('a_staff_del', { at: at(), id: sd.dataset.ldStaffDel })).list); } catch (x) { alert(errText(x)); }
      }
    });
    root.addEventListener('input', (e) => {
      const q = e.target.closest('[data-ld-q]');
      if (!q) return;
      adm.extra.q = q.value;
      const pos = q.selectionStart;
      adminDraw();
      const nq = root.querySelector('[data-ld-q]');
      if (nq) { nq.focus(); nq.setSelectionRange(pos, pos); }
    });
    root.addEventListener('change', async (e) => {
      const cb = e.target.closest('[data-ld-award]');
      if (cb) {
        try { adm.data = await api('a_award', { at: at(), member_id: cb.dataset.ldAward, awarded: cb.checked }); } catch (er) { alert(errText(er)); cb.checked = !cb.checked; }
        return;
      }
      const sc = e.target.closest('[data-ld-scope]');
      if (sc) {
        const id = sc.dataset.ldScope;
        const scope = [...root.querySelectorAll(`[data-ld-scope="${id}"]:checked`)].map((x) => x.value);
        try { drawStaff(root, (await api('a_staff_scope', { at: at(), id, scope })).list); } catch (er) { alert(errText(er)); }
      }
    });
  }

  return {
    kid(root) { kid.root = root; kid.data = null; kid.view = 'home'; renderKid(); bindKid(root); },
    admin(root) { adm.root = root; adm.extra = {}; renderAdmin(); bindAdmin(root); },
  };
})();

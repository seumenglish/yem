/* YEM 선 아이콘: 리더 라운지 · 관리자 · 새 친구 안내 · 메뉴에 있는 이모티콘을
   깔끔한 선 그림으로 바꿔요. (달리기 판 🏇처럼 일부러 쓴 귀여운 그림은 그대로) */
(function () {
  const P = {
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    pray: '<path d="M12 4c-1.3 0-2 1-2.3 2.3L8.2 13 5 16.2a1 1 0 0 0 0 1.4l2.4 2.4a1 1 0 0 0 1.4 0L12 17"/><path d="M12 4c1.3 0 2 1 2.3 2.3l1.5 6.7 3.2 3.2a1 1 0 0 1 0 1.4L16.6 20a1 1 0 0 1-1.4 0L12 17"/><path d="M12 4v13"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>',
    tick: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
    pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    megaphone: '<path d="m3 11 16-7v16L3 13Z"/><path d="M3 11v2"/><path d="M7 13.5V18a2 2 0 0 0 4 0v-3"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s1.5 1 4 1 4-2 4-2 1.5 2 4 2 4-1 4-1"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3"/><path d="M7 4h.01M12 4h.01M17 4h.01"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
    party: '<path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="m22 2-2.2.8a2.9 2.9 0 0 0-1.9 3.2c.1.9-.5 1.7-1.4 1.8L15 8"/><path d="M11 13c1.9 1.9 2.7 4.2 1.7 5.2s-3.3.2-5.2-1.7-2.7-4.2-1.7-5.2 3.3-.2 5.2 1.7Z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
    sprout: '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 7 9.5 4.5 5 4.5 5 9 7.5 11 12 11Z"/><path d="M12 13c0-3 2-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5Z"/>',
    hourglass: '<path d="M6 2h12M6 22h12"/><path d="M17 2v4.2a3 3 0 0 1-1 2.2L12 12l-4-3.6a3 3 0 0 1-1-2.2V2M7 22v-4.2a3 3 0 0 1 1-2.2L12 12l4 3.6a3 3 0 0 1 1 2.2V22"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 11.5 9-9M16 7l3 3M19 4l2 2"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
    crown: '<path d="m2 7 5 5 5-8 5 8 5-5-2 12H4Z"/><path d="M4 22h16"/>',
    church: '<path d="M12 2v5M10 4h4"/><path d="M6 22V11l6-4 6 4v11"/><path d="M2 22h20M10 22v-4a2 2 0 0 1 4 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    alert: '<path d="m10.3 3.9-8.2 14A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-3.1l-8.2-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/>',
    x: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    shh: '<circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 9h.01M12 13v5"/><path d="M10.5 15h3"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    bag: '<path d="M6 8h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3M8 14h8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    family: '<circle cx="8" cy="6" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 21v-4a5 5 0 0 1 10 0v4M14 21v-3a3 3 0 0 1 6 0v3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    cards: '<rect x="3" y="6" width="13" height="16" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  };
  // 이모티콘 → 선 아이콘 ('' = 꾸밈 이모티콘이라 그냥 빼요)
  const MAP = {
    '💛': 'heart', '💖': 'heart', '💙': 'heart', '💕': 'heart', '💞': 'heart',
    '🙏': 'pray', '🤲': 'hand', '✅': 'check', '✔': 'tick', '✓': 'tick', '🔒': 'lock', '🙋': 'hand', '🙌': 'party',
    '🏅': 'award', '🎓': 'award', '🥇': 'award', '🥈': 'award', '🥉': 'award', '🏆': 'award',
    '✏️': 'pencil', '✍️': 'pencil', '💌': 'mail', '📢': 'megaphone', '📣': 'megaphone', '📋': 'clipboard',
    '🤝': 'users', '👥': 'users', '👤': 'user', '🎂': 'cake', '🌟': 'star', '⭐': 'star', '🎉': 'party',
    '📸': 'camera', '📷': 'camera', '⚙️': 'gear', '🎧': 'headphones', '🏠': 'home', '📊': 'chart',
    '🌱': 'sprout', '🌿': 'leaf', '🌳': 'sprout', '⏳': 'hourglass', '🔎': 'search', '🔍': 'search', '🔑': 'key',
    '📲': 'phone', '📱': 'phone', '📞': 'call', '👑': 'crown', '⛪': 'church', '👀': 'eye', '⚠️': 'alert',
    '📖': 'book', '📚': 'book', '📒': 'book', '👉': 'arrow', '👆': 'arrow', '🔁': 'refresh', '🔄': 'refresh', '↻': 'refresh',
    '🙅': 'x', '📥': 'inbox', '📌': 'pin', '📍': 'pin', '➕': 'plus', '📤': 'send', '🔗': 'link', '🎶': 'music', '🎵': 'music',
    '📦': 'box', '🤫': 'shh', '🧸': 'smile', '🎒': 'bag', '🕑': 'clock', '🌏': 'globe', '🎁': 'gift', '📜': 'scroll',
    '🎤': 'mic', '🔔': 'bell', '📅': 'calendar', '🗓️': 'calendar', '🤗': 'smile', '👋': 'hand', '👣': 'user', '🃏': 'cards', '🎴': 'cards',
    '👨‍👩‍👧‍👦': 'family', '🍎': 'sprout',
    '✨': '', '😉': '', '😮': '', '💨': '', '😊': '', '🥰': '',
  };
  const svg = (n, extra = '') => `<svg class="ic ic-${n}${extra}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
  const keys = Object.keys(MAP).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const RE = new RegExp(`(?:${keys.join('|')})️?`, 'gu');
  const HAS = new RegExp(RE.source, 'u');
  const SCOPE = '.ld-root, .wl-wrap, .mainnav, #tabbar, .yh-guide, .topbar, .sb-banner-pill, .adv.grow, .dash';
  const SKIP = 'textarea, input, script, style, svg, .ld-race, [data-noic]';
  const iconOf = (m) => MAP[m] ?? MAP[m.replace(/️$/, '')] ?? MAP[m + '️'];

  function convert(root) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (t) => (HAS.test(t.data) && !(t.parentElement && t.parentElement.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const list = [];
    for (let t = walk.nextNode(); t; t = walk.nextNode()) list.push(t);
    list.forEach((t) => {
      const html = t.data.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
        .replace(new RegExp(RE.source + ' ?', 'gu'), (m) => { const n = iconOf(m.trim()); return n ? svg(n) + (m.endsWith(' ') ? ' ' : '') : ''; });
      const span = document.createElement('span');
      span.innerHTML = html;
      const frag = document.createDocumentFragment();
      while (span.firstChild) frag.appendChild(span.firstChild);
      t.replaceWith(frag);
    });
    root.querySelectorAll('[placeholder], [title], [aria-label]').forEach((el) => {
      ['placeholder', 'title', 'aria-label'].forEach((a) => {
        const v = el.getAttribute(a);
        if (v && HAS.test(v)) el.setAttribute(a, v.replace(RE, '').trim());
      });
    });
  }
  let queued = false;
  function sweep() {
    queued = false;
    document.querySelectorAll(SCOPE).forEach(convert);
  }
  const queue = () => { if (!queued) { queued = true; queueMicrotask(sweep); } };
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', queue);
  queue();

  // 알림 창(alert · confirm · prompt)에서도 이모티콘을 빼요
  const strip = (s) => (typeof s === 'string' ? s.replace(RE, '').replace(/ {2,}/g, ' ').trim() : s);
  ['alert', 'confirm', 'prompt'].forEach((k) => {
    const f = window[k].bind(window);
    window[k] = (msg, ...rest) => f(strip(msg), ...rest);
  });
  window.ICON = { svg, P, MAP };
})();

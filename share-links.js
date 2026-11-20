/* 카톡으로 보내기: 찬양곡 · 찬양 묶음 · 스토리북 쪽마다 그 쪽 그림이 미리보기로 나오는 주소를 보내요.
   주소 /listen/<묶음>/<곡>, /set/<묶음>, /book/<책> 은 tools/og/make_share.py 가 만들어요. */
(() => {
  const SITE = 'https://yem-brown.vercel.app';
  function target() {
    const p = location.hash.replace(/^#/, '').split('/');
    if (p[0] === 'listen' && p[1] && p[2] !== undefined && p[2] !== '') return { path: `listen/${p[1]}/${Number(p[2])}`, what: '이 찬양' };
    if (p[0] === 'set' && p[1]) return { path: `set/${p[1]}`, what: '이 찬양 묶음' };
    if (p[0] === 'book' && p[1]) return { path: `book/${p[1]}`, what: '이 스토리북' };
    return null;
  }
  async function send(btn, t) {
    const url = `${SITE}/${t.path}`;
    const title = (document.querySelector('#app h1, #app .sb-banner-big') || {}).textContent || 'YEM 영어예배부';
    if (navigator.share) {
      try { await navigator.share({ title: title.trim(), url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); } catch (e) { prompt('이 주소를 복사해서 카톡에 붙여 넣어요', url); return; }
    const old = btn.textContent;
    btn.textContent = '링크를 복사했어요! 카톡에 붙여 넣어요';
    setTimeout(() => { btn.textContent = old; }, 2600);
  }
  function place() {
    const t = target();
    const app = document.getElementById('app');
    if (!t || !app) return;
    const have = app.querySelector('.yem-share');
    if (have && have.dataset.path === t.path) return;
    if (have) have.remove();
    const anchor = app.querySelector('.sb-banner') || app.querySelector('.back');
    if (!anchor) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'yem-share no-print';
    b.dataset.path = t.path;
    b.textContent = `카톡으로 ${t.what} 보내기`;
    b.addEventListener('click', () => send(b, t));
    anchor.insertAdjacentElement('afterend', b);
  }
  const css = document.createElement('style');
  css.textContent = '.yem-share{display:inline-flex;align-items:center;gap:6px;margin:-8px 0 16px;padding:9px 18px;border-radius:999px;border:0;background:#FEE500;color:#191600;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12)}.yem-share::before{content:"";width:18px;height:18px;background:no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath fill=%27%23191600%27 d=%27M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1 3.6 4.2-2.8c.7.1 1.4.2 2.1.2 5.5 0 10-3.5 10-7.8S17.5 3 12 3z%27/%3E%3C/svg%3E")}@media(max-width:640px){.yem-share{margin:0 0 14px;font-size:14px}}';
  document.head.appendChild(css);
  let queued = false;
  const go = () => { if (queued) return; queued = true; setTimeout(() => { queued = false; place(); }, 30); };
  window.addEventListener('hashchange', go);
  new MutationObserver(go).observe(document.documentElement, { childList: true, subtree: true });
  go();
})();

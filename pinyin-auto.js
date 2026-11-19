/* 홈페이지의 모든 중국어 한자 아래에 한어병음을 붙여요 (윤희쌤 규칙: 한자는 무조건 병음과 함께)
   - 사전: pinyin-map.js (site/tools_make_pinyin_map.py 로 다시 만들어요)
   - 이미 병음이 따로 있는 곳은 data-nopy 를 붙이면 건너뛰어요. 그림 속 글자는 그림에 이미 병음이 있어요. */
(function () {
  const M = window.YEM_PY || { R: {}, C: {} };
  const HAN = /[一-鿿]+/g;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'RT', 'RUBY', 'TITLE', 'NOSCRIPT', 'svg', 'SVG', 'CODE']);

  function readRun(run) {
    const whole = M.R[run];
    if (whole) return whole.split(' ');
    // 사전에 통째로 없으면: 사전에 있는 더 긴 글을 앞에서부터 찾고, 없으면 한 글자씩
    const out = [];
    let i = 0;
    while (i < run.length) {
      let hit = '';
      for (let j = run.length; j > i + 1; j--) { if (M.R[run.slice(i, j)]) { hit = run.slice(i, j); break; } }
      if (hit) { out.push(...M.R[hit].split(' ')); i += hit.length; } else { out.push(M.C[run[i]] || ''); i += 1; }
    }
    return out;
  }

  function skip(el) {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      if (SKIP.has(e.tagName) || e.isContentEditable || (e.dataset && 'nopy' in e.dataset) || e.classList.contains('py-done')) return true;
    }
    return false;
  }

  function fix(node) {
    const t = node.nodeValue;
    HAN.lastIndex = 0;
    if (!HAN.test(t)) return;
    if (skip(node.parentElement)) return;
    const frag = document.createDocumentFragment();
    let last = 0;
    t.replace(HAN, (run, at) => {
      if (at > last) frag.appendChild(document.createTextNode(t.slice(last, at)));
      const py = readRun(run);
      const rb = document.createElement('ruby');
      rb.className = 'yem-py';
      [...run].forEach((c, k) => {
        rb.appendChild(document.createTextNode(c));
        const rt = document.createElement('rt');
        rt.textContent = py[k] || '';
        rb.appendChild(rt);
      });
      frag.appendChild(rb);
      last = at + run.length;
      return run;
    });
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { fix(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (/[一-鿿]/.test(n.nodeValue) ? 1 : 3) });
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(fix);
  }

  let busy = false;
  const queue = new Set();
  const obs = new MutationObserver((ms) => {
    if (busy) return;
    ms.forEach((m) => {
      if (m.type === 'characterData') queue.add(m.target);
      m.addedNodes.forEach((n) => queue.add(n));
    });
    requestAnimationFrame(flush);
  });
  function flush() {
    if (!queue.size) return;
    busy = true;
    const items = [...queue];
    queue.clear();
    items.forEach((n) => { if (n.isConnected) scan(n); });
    obs.takeRecords();
    busy = false;
  }
  function start() {
    busy = true; scan(document.body); busy = false;
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  window.YEM_PY_SCAN = scan;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

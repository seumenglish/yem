/* 발음 듣기: 한 번 누르면 여성 목소리 → 남성 목소리 순서로 두 번 들려줍니다.
   음성 파일은 assets/tts (f = 여성, m = 남성). 파일이 없으면 기기 음성으로 대신 읽습니다. */
window.TTS = (() => {
  const index = new Map((window.TTS_TEXTS || []).map((t, i) => [t, i]));
  let audio = null;
  const getAudio = () => { if (!audio) audio = new Audio(); return audio; };

  function clearMarks(el) {
    if (!el) return;
    el.classList.remove('speaking');
    delete el.dataset.voice;
    el.querySelectorAll('.w.on').forEach((w) => w.classList.remove('on'));
  }

  /* 기기 음성으로 대신 읽기 (파일이 없을 때) */
  function fallback(text, opts) {
    if (!('speechSynthesis' in window)) { if (opts.onEnd) opts.onEnd(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = opts.rate || 0.9;
    if (opts.el) opts.el.classList.add('speaking');
    const done = () => { clearMarks(opts.el); if (opts.onEnd) opts.onEnd(); };
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
  }

  function speak(text, opts = {}) {
    const key = String(text || '').trim();
    const i = index.get(key);
    if (i === undefined) return fallback(key, opts);
    const el = opts.el || null;
    const rate = opts.rate || 1;
    const seq = ['f', 'm'];
    const a = getAudio();
    let k = 0;
    const id = String(i).padStart(4, '0');

    /* 단어 하이라이트: 재생 위치에 맞춰 지금 읽히는 단어를 표시 */
    const words = el ? Array.from(el.querySelectorAll('.w')) : [];
    const mark = () => {
      if (!el || !a.duration || isNaN(a.duration)) return;
      el.classList.add('speaking');
      el.dataset.voice = seq[k - 1] === 'f' ? 'f' : 'm';
      if (words.length) {
        const n = Math.min(words.length - 1, Math.floor((a.currentTime / a.duration) * words.length));
        words.forEach((w, j) => w.classList.toggle('on', j === n));
      }
    };

    const next = () => {
      if (k >= seq.length) {
        clearMarks(el);
        if (opts.onEnd) opts.onEnd();
        return;
      }
      const src = `assets/tts/${seq[k]}/${id}.mp3`;
      k++;
      a.onended = next;
      a.onerror = () => { clearMarks(el); fallback(key, opts); };
      a.ontimeupdate = mark;
      a.src = src;
      a.playbackRate = rate;
      el && el.classList.add('speaking');
      a.play().catch(() => { /* 자동 재생이 막히면 다음 누름에서 다시 */ });
    };
    a.pause();
    next();
  }

  return { speak };
})();

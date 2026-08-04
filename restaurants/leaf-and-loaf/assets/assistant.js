/* ==========================================================================
   Leaf & Loaf assistant.

   Replaces the shared chat.brahmando.com widget ON THESE PAGES ONLY. It speaks
   exactly the same API — POST /api/embed/{tenant}/stream, origin-checked, no
   key in the browser — so nothing changes server-side and other tenants keep
   the widget they have.

   Why a separate client rather than a patch to the shared one: the shared
   widget deploys through the cluster, and the last change to that repo has
   been sitting unmerged for a while. This page is static and deploys in a
   minute. The improvements below are worth landing upstream too, but this way
   they are not blocked on a rollout.

   What it does that the shared widget does not:

     * resizes, by dragging its top-left corner, and remembers the size
     * shows transport failures instead of hanging on them. A 403 or a 404 on
       the stream used to leave the typing indicator running forever, which is
       how a broken tenant looked identical to a slow one.
     * keeps the conversation across a page change within the session
     * a composer that behaves: autogrowing, Enter sends, Shift+Enter newlines
     * renders the assistant's bold, lists and paragraphs rather than dumping
       raw text with asterisks in it
     * says who powers it, and links there
   ========================================================================== */

'use strict';

(function () {

  const TENANT = 'leafandloaf';
  const BASE = 'https://chat.brahmando.com';
  const STREAM = `${BASE}/api/embed/${TENANT}/stream`;

  const SIZE_KEY = 'll-chat-size';
  const CONV_KEY = 'll-chat-conv';
  const SESS_KEY = 'll-chat-session';

  const MIN_W = 320, MIN_H = 340;
  const MAX_W = 720, MAX_H = 900;

  const COPY = {
    en: {
      launch: 'Ask about the menu',
      title: 'Leaf & Loaf Assistant',
      sub: 'Menu, allergens and what is nearby',
      placeholder: 'Ask about a dish, an allergen, or what is nearby…',
      send: 'Send', close: 'Close', clear: 'Start again',
      resize: 'Drag to resize',
      poweredBy: 'Powered by',
      opener: 'Ask me about the menu — what is in a dish, what is gluten free, how much protein, or what is worth seeing near Bíldshöfði.',
      samples: [
        'What is in the Caesar salad?',
        'Which dishes are gluten free?',
        'How much protein is in the quinoa bowl?',
        'What is worth seeing near Bíldshöfði?',
      ],
      errNet: 'I could not reach the kitchen just now. Check your connection and try again.',
      errOrigin: 'This assistant is not enabled for this address yet.',
      errServer: 'Something went wrong at our end. Please try again in a moment.',
      thinking: 'Thinking',
      fromMenu: 'From the menu',
    },
    is: {
      launch: 'Spurðu um matseðilinn',
      title: 'Leaf & Loaf aðstoð',
      sub: 'Matseðill, ofnæmisvaldar og nágrennið',
      placeholder: 'Spurðu um rétt, ofnæmisvald eða hvað er nálægt…',
      send: 'Senda', close: 'Loka', clear: 'Byrja upp á nýtt',
      resize: 'Dragðu til að breyta stærð',
      poweredBy: 'Keyrt af',
      opener: 'Spurðu mig um matseðilinn — hvað er í rétti, hvað er glútenlaust, hversu mikið prótein, eða hvað er þess virði að skoða nálægt Bíldshöfða.',
      samples: [
        'Hvað er í Caesar salatinu?',
        'Hvaða réttir eru glútenlausir?',
        'Hversu mikið prótein er í kínóaskálinni?',
        'Hvað er hægt að skoða nálægt Bíldshöfða?',
      ],
      errNet: 'Ég næ ekki sambandi við eldhúsið núna. Athugaðu nettenginguna og reyndu aftur.',
      errOrigin: 'Aðstoðin er ekki virk fyrir þetta vistfang enn.',
      errServer: 'Eitthvað fór úrskeiðis hjá okkur. Reyndu aftur eftir augnablik.',
      thinking: 'Hugsa',
      fromMenu: 'Af matseðlinum',
    },
  };

  const lang = () => (window.LL && LL.lang) || document.documentElement.lang || 'is';
  const t = () => COPY[lang()] || COPY.is;

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Minimal, safe formatting. The model emits **bold**, "- " bullets and blank
     lines; dumping that as textContent left asterisks and run-on paragraphs on
     screen. Everything is escaped BEFORE any markup is introduced, so no model
     output can inject HTML. */
  function format(text) {
    const safe = esc(text);
    const blocks = safe.split(/\n{2,}/);
    return blocks.map(block => {
      const lines = block.split('\n');
      const bullets = lines.filter(l => /^\s*[-•*]\s+/.test(l));
      if (bullets.length && bullets.length === lines.filter(l => l.trim()).length) {
        const items = lines.filter(l => l.trim())
          .map(l => `<li>${bold(l.replace(/^\s*[-•*]\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${bold(lines.join('<br>'))}</p>`;
    }).join('');
  }
  const bold = s => s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  /* --------------------------------------------------------------- state */
  let panel, list, input, launcher, sendBtn, busy = false;
  let sessionId = null;

  function loadSession() {
    try {
      sessionId = sessionStorage.getItem(SESS_KEY);
      if (!sessionId) {
        sessionId = 'll-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(SESS_KEY, sessionId);
      }
    } catch (_) {
      sessionId = 'll-' + Math.random().toString(36).slice(2);
    }
  }

  const readConv = () => {
    try { return JSON.parse(sessionStorage.getItem(CONV_KEY) || '[]'); } catch (_) { return []; }
  };
  const writeConv = turns => {
    try { sessionStorage.setItem(CONV_KEY, JSON.stringify(turns.slice(-40))); } catch (_) {}
  };

  /* ---------------------------------------------------------------- build */
  function build() {
    launcher = document.createElement('button');
    launcher.className = 'llchat-launch';
    launcher.type = 'button';
    launcher.innerHTML =
      `<span class="llchat-launch__dot" aria-hidden="true"></span>
       <span class="llchat-launch__txt"></span>`;
    launcher.addEventListener('click', () => toggle(true));

    panel = document.createElement('section');
    panel.className = 'llchat';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.hidden = true;
    panel.innerHTML = `
      <span class="llchat__grip" id="llchatGrip" title="" aria-hidden="true"></span>

      <header class="llchat__head">
        <span class="llchat__mark" aria-hidden="true"></span>
        <span class="llchat__id">
          <b class="llchat__title"></b>
          <span class="llchat__sub"></span>
        </span>
        <button class="llchat__icon" id="llchatClear" type="button" title="">↺</button>
        <button class="llchat__icon" id="llchatClose" type="button" title="">×</button>
      </header>

      <div class="llchat__list" id="llchatList" aria-live="polite" aria-atomic="false"></div>

      <form class="llchat__composer" id="llchatForm">
        <textarea id="llchatInput" rows="1" autocomplete="off"></textarea>
        <button class="llchat__send" id="llchatSend" type="submit" aria-label="">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12h15M13 6l6 6-6 6"/>
          </svg>
        </button>
      </form>

      <footer class="llchat__foot">
        <a href="https://brahmexa.com" target="_blank" rel="noopener">
          <span class="llchat__by"></span>
          <img src="" alt="" class="llchat__logo" width="16" height="16" />
          <b>@brahmexa</b>
        </a>
      </footer>`;

    document.body.append(launcher, panel);

    list = panel.querySelector('#llchatList');
    input = panel.querySelector('#llchatInput');
    sendBtn = panel.querySelector('#llchatSend');

    /* The logo lives beside styles.css, so derive its path from the stylesheet
       the page already loaded. That is correct from the restaurant page
       (assets/…) and from /panta/ or /party/ (../assets/…) without this script
       needing to know how deep it is. */
    const sheet = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
    const base = sheet ? sheet.getAttribute('href').replace(/styles\.css.*$/, '') : 'assets/';
    panel.querySelector('.llchat__logo').src = base + 'brahmexa-logo.png';

    panel.querySelector('#llchatClose').addEventListener('click', () => toggle(false));
    panel.querySelector('#llchatClear').addEventListener('click', reset);
    panel.querySelector('#llchatForm').addEventListener('submit', e => { e.preventDefault(); send(); });

    input.addEventListener('input', autogrow);
    input.addEventListener('keydown', e => {
      // Enter sends, Shift+Enter makes a newline. The shared widget had no
      // multiline at all, so a long question had to be one run-on line.
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) toggle(false);
    });

    wireResize();
    restoreSize();
    applyCopy();
    restoreConversation();
  }

  function applyCopy() {
    const c = t();
    launcher.querySelector('.llchat-launch__txt').textContent = c.launch;
    launcher.setAttribute('aria-label', c.launch);
    panel.querySelector('.llchat__title').textContent = c.title;
    panel.querySelector('.llchat__sub').textContent = c.sub;
    panel.querySelector('.llchat__by').textContent = c.poweredBy;
    panel.querySelector('#llchatClose').title = c.close;
    panel.querySelector('#llchatClear').title = c.clear;
    panel.querySelector('#llchatGrip').title = c.resize;
    input.placeholder = c.placeholder;
    sendBtn.setAttribute('aria-label', c.send);
  }

  /* --------------------------------------------------------------- resize
     A grip on the TOP-LEFT corner: the panel is anchored to the bottom right,
     so growing it has to move that corner outwards. A native `resize: both`
     handle would sit at the bottom-right and drag the panel off-screen. */
  function wireResize() {
    const grip = panel.querySelector('#llchatGrip');
    let startX, startY, startW, startH;

    const move = e => {
      const p = e.touches ? e.touches[0] : e;
      const w = Math.min(MAX_W, Math.max(MIN_W, startW + (startX - p.clientX)));
      const h = Math.min(MAX_H, Math.max(MIN_H, startH + (startY - p.clientY)));
      panel.style.width = w + 'px';
      panel.style.height = h + 'px';
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchend', up);
      panel.classList.remove('is-resizing');
      try {
        localStorage.setItem(SIZE_KEY, JSON.stringify({
          w: parseInt(panel.style.width, 10), h: parseInt(panel.style.height, 10),
        }));
      } catch (_) {}
    };
    const down = e => {
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX; startY = p.clientY;
      const r = panel.getBoundingClientRect();
      startW = r.width; startH = r.height;
      panel.classList.add('is-resizing');
      document.addEventListener('mousemove', move);
      document.addEventListener('touchmove', move, { passive: true });
      document.addEventListener('mouseup', up);
      document.addEventListener('touchend', up);
      e.preventDefault();
    };
    grip.addEventListener('mousedown', down);
    grip.addEventListener('touchstart', down, { passive: false });
  }

  function restoreSize() {
    try {
      const s = JSON.parse(localStorage.getItem(SIZE_KEY) || 'null');
      if (s && s.w && s.h) {
        panel.style.width = Math.min(MAX_W, Math.max(MIN_W, s.w)) + 'px';
        panel.style.height = Math.min(MAX_H, Math.max(MIN_H, s.h)) + 'px';
      }
    } catch (_) {}
  }

  /* -------------------------------------------------------------- messages */
  function addTurn(role, text, opts = {}) {
    const el = document.createElement('div');
    el.className = `llmsg llmsg--${role}` + (opts.error ? ' llmsg--error' : '');

    /* Say where an answer came from. "From the menu" is a stronger claim than
       anything the assistant can make, and a visitor deciding whether to trust
       an allergen answer deserves to know which one they are reading. */
    const tag = opts.source === 'menu'
      ? `<span class="llmsg__src">${esc(t().fromMenu)}</span>` : '';

    el.innerHTML =
      `<div class="llmsg__body">${role === 'user' ? `<p>${esc(text)}</p>` : format(text)}${tag}</div>`;
    list.append(el);
    scroll();
    return el.querySelector('.llmsg__body');
  }

  function addSamples() {
    const wrap = document.createElement('div');
    wrap.className = 'llchips';
    t().samples.forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'llchip';
      b.textContent = q;
      b.addEventListener('click', () => { input.value = q; send(); });
      wrap.append(b);
    });
    list.append(wrap);
    scroll();
  }

  function scroll() { list.scrollTop = list.scrollHeight; }

  function autogrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(120, input.scrollHeight) + 'px';
  }

  function restoreConversation() {
    const turns = readConv();
    if (!turns.length) {
      addTurn('bot', t().opener);
      addSamples();
      return;
    }
    turns.forEach(turn => addTurn(turn.r, turn.t, { source: turn.s }));
  }

  function reset() {
    writeConv([]);
    try { sessionStorage.removeItem(SESS_KEY); } catch (_) {}
    loadSession();
    list.innerHTML = '';
    addTurn('bot', t().opener);
    addSamples();
    input.focus();
  }

  /* ------------------------------------------------------------------ send */
  async function send() {
    const text = input.value.trim();
    if (!text || busy) return;

    list.querySelectorAll('.llchips').forEach(c => c.remove());

    addTurn('user', text);
    const turns = readConv(); turns.push({ r: 'user', t: text }); writeConv(turns);

    input.value = '';
    autogrow();

    /* Menu questions are answered from the menu, not by a model.
       Asked in Icelandic what is in the Caesar, the model replied in English
       and invented romaine and breaded chicken; the menu says iceberg,
       spinach and roast chicken. Somebody may be asking because of a coeliac
       diagnosis, so a confident wrong answer is a safety problem rather than
       a quality one. Anything the data covers is returned straight from it —
       instantly, in the asker's language, with no way to invent an
       ingredient. Only what the data does not cover goes to the assistant. */
    const local = window.LL_ANSWERS && LL_ANSWERS.tryAnswer(text, lang());
    if (local) {
      addTurn('bot', local, { source: 'menu' });
      const kept = readConv(); kept.push({ r: 'bot', t: local, s: 'menu' }); writeConv(kept);
      input.focus();
      return;
    }

    busy = true;
    sendBtn.disabled = true;

    const thinking = document.createElement('div');
    thinking.className = 'llmsg llmsg--bot';
    thinking.innerHTML = `<div class="llmsg__body llthinking"><span></span><span></span><span></span></div>`;
    list.append(thinking);
    scroll();

    try {
      const res = await fetch(STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      /* The shared widget threw here and left the typing dots running, so a
         403 looked exactly like a slow answer. Each status gets its own
         sentence instead. */
      if (!res.ok) {
        thinking.remove();
        const msg = res.status === 403 ? t().errOrigin
                  : res.status === 404 ? t().errOrigin
                  : t().errServer;
        addTurn('bot', msg, { error: true });
        return;
      }

      thinking.remove();
      const body = addTurn('bot', '');
      let full = '';

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          if (data.startsWith('{')) {
            try {
              const meta = JSON.parse(data);
              if (meta.session_id) sessionId = meta.session_id;
            } catch (_) {}
            continue;
          }
          full += data;
          body.innerHTML = format(full);
          scroll();
        }
      }

      if (!full.trim()) {
        body.innerHTML = format(t().errServer);
      } else {
        const all = readConv(); all.push({ r: 'bot', t: full }); writeConv(all);
      }
    } catch (err) {
      thinking.remove();
      addTurn('bot', t().errNet, { error: true });
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  /* ----------------------------------------------------------------- open */
  function toggle(open) {
    panel.hidden = !open;
    launcher.classList.toggle('is-hidden', open);
    if (open) { input.focus(); scroll(); }
    else launcher.focus();
  }

  /* ------------------------------------------------------------------ boot */
  function init() {
    loadSession();
    build();
    // Follow the page's language toggle without a reload.
    document.addEventListener('click', e => {
      if (e.target.closest('#langBtn')) setTimeout(applyCopy, 60);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

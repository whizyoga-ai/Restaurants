/* ==========================================================================
   Shared chrome: the five views and the language toggle.

   Loaded by BOTH the main page and the party page. It lives in its own file so
   the two cannot drift — a view added here appears in both pickers, and a
   visitor who picks Norðurljós on one page still sees it on the other, because
   the preference is one key in localStorage rather than two.
   ========================================================================== */

'use strict';

window.LL = (function () {

  const VIEWS = [
    { id: 'daylight',       en: ['Daylight',             'Pale Nordic light'],
                            is: ['Dagsljós',             'Fölt norrænt dagsljós'] },
    { id: 'fireandice',     en: ['Land of Fire and Ice', 'Basalt and ember'],
                            is: ['Eldur og Ís',          'Hraun og glóð'] },
    { id: 'northernlights', en: ['Northern Lights',      'An evening under the aurora'],
                            is: ['Norðurljós',           'Kvöld undir norðurljósum'] },
    { id: 'menuboard',      en: ['The Menu',             'The whole card, up front'],
                            is: ['Matseðillinn',         'Allur seðillinn, fremst'] },
    { id: 'winternight',    en: ['Winter Night',         'The dark one'],
                            is: ['Vetrarnótt',           'Dökka útgáfan'] },
  ];

  /* Defaults. Icelandic first, because the customers standing at this counter
     are in Reykjavík — an English default treats the locals as the exception.
     Daylight always, regardless of the operating system's dark preference: the
     view is an editorial choice about how the restaurant presents itself, not
     a system setting, and Vetrarnótt is one of five rather than the automatic
     answer for anyone whose laptop is in dark mode. */
  const DEFAULT_LANG = 'is';
  const DEFAULT_VIEW = 'daylight';

  const LANG_KEY = 'll-lang';
  const VIEW_KEY = 'll-season';

  let lang = DEFAULT_LANG;
  let view = DEFAULT_VIEW;

  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* storage blocked */ }
  }

  function restore() {
    const savedLang = read(LANG_KEY);
    if (savedLang === 'is' || savedLang === 'en') lang = savedLang;

    const savedView = read(VIEW_KEY);
    if (VIEWS.some(v => v.id === savedView)) view = savedView;

    document.documentElement.setAttribute('data-season', view);
    document.documentElement.lang = lang;
    return { lang, view };
  }

  function setLang(next) {
    lang = next === 'is' ? 'is' : 'en';
    write(LANG_KEY, lang);
    document.documentElement.lang = lang;
    return lang;
  }

  function toggleLang() { return setLang(lang === 'en' ? 'is' : 'en'); }

  function setView(next) {
    if (!VIEWS.some(v => v.id === next)) return view;
    view = next;
    write(VIEW_KEY, view);
    document.documentElement.setAttribute('data-season', view);
    return view;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  /**
   * Format a króna amount the Icelandic way: 18300 -> "18.300".
   *
   * toLocaleString('is-IS') cannot be trusted for this. Browsers without
   * Icelandic locale data fall back silently — Intl.NumberFormat('is-IS')
   * resolves to en-US in Chromium here — so prices were rendering as "18,300"
   * with a comma, which in Iceland reads as a decimal point. A comma in a
   * price on an Icelandic restaurant's site is not a cosmetic difference.
   *
   * Grouping with a period unconditionally is correct for this one currency
   * and cannot be undone by whatever locale data a visitor's browser happens
   * to ship.
   */
  function isk(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Build the picker menu and keep the button label in step.
   * onPick runs after the view has been applied, so a page can re-render
   * anything that depends on it.
   */
  function renderPicker(menuEl, labelEl, onPick) {
    if (!menuEl) return;
    menuEl.innerHTML = '';
    VIEWS.forEach(v => {
      const [name, note] = v[lang];
      const b = document.createElement('button');
      b.className = 'viewpick__opt';
      b.type = 'button';
      b.role = 'menuitemradio';
      b.dataset.view = v.id;
      b.setAttribute('aria-checked', String(v.id === view));
      b.innerHTML =
        `<span class="viewpick__sw sw--${v.id}" aria-hidden="true"></span>` +
        `<span class="viewpick__txt"><b>${esc(name)}</b><span>${esc(note)}</span></span>`;
      menuEl.appendChild(b);
    });
    const active = VIEWS.find(v => v.id === view) || VIEWS[0];
    if (labelEl) labelEl.textContent = active[lang][0];
    if (onPick) onPick();
  }

  /** Open/close behaviour for the picker, shared by both pages. */
  function wirePicker(root, button, menu, label, onChange) {
    if (!root || !button || !menu) return;

    const close = () => { root.dataset.open = 'false'; button.setAttribute('aria-expanded', 'false'); };
    const open = () => { root.dataset.open = 'true'; button.setAttribute('aria-expanded', 'true'); };

    button.addEventListener('click', e => {
      e.stopPropagation();
      root.dataset.open === 'true' ? close() : open();
    });
    document.addEventListener('click', e => { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    menu.addEventListener('click', e => {
      const opt = e.target.closest('.viewpick__opt');
      if (!opt) return;
      setView(opt.dataset.view);
      renderPicker(menu, label);
      close();
      button.focus();
      if (onChange) onChange();
    });

    renderPicker(menu, label);
  }

  return {
    VIEWS,
    restore, esc, isk,
    get lang() { return lang; },
    get view() { return view; },
    setLang, toggleLang, setView,
    renderPicker, wirePicker,
  };
})();

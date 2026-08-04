/* ==========================================================================
   Shared chrome: theme, language, and the mobile navigation drawer.

   Loaded by all three pages (menu, panta, party) so they cannot drift — a
   change here lands everywhere, and a visitor who switches to dark on one page
   is still in dark on the next, because the preference is one key in
   localStorage rather than one per page.

   HISTORY — WHY THESE FOUR AND NOT THE OLD FIVE.

   This file used to offer five "views" (Dagsljós, Eldur og Ís, Norðurljós,
   Matseðillinn, Vetrarnótt), and each one did not merely recolour the page: it
   rearranged the menu into a different layout. That is a design showcase, not a
   restaurant website. A customer arriving to read a menu was being handed a
   design decision first, and the same dish looked like four different products
   depending on a dropdown they never asked for.

   Client feedback asked for a clean, focused site, so that was cut to light and
   dark. Two more light themes were then requested — `bright`, in the visual
   language of xoisland.is, and `nordic`, that same energy in Icelandic colour.

   The difference from the old five is the constraint, which is enforced in
   styles.css and repeated here because this is where someone would add a sixth:
   a theme sets colour, typeface and corner radius. A theme never moves
   anything. All four share one DOM and one layout.

   Retired ids are migrated on read (see restore), so a returning visitor with
   an old preference saved is never left on a theme the stylesheet dropped.
   ========================================================================== */

'use strict';

window.LL = (function () {

  /* [name, one-line description] per language. The description is what makes a
     four-item list choosable without trying all four. */
  const THEMES = [
    { id: 'light',  en: ['Light',  'Warm paper and green'],
                    is: ['Ljóst',  'Hlýtt og rólegt'] },
    { id: 'dark',   en: ['Dark',   'The same page at night'],
                    is: ['Dökkt',  'Sama síðan að kvöldi'] },
    { id: 'bright', en: ['Bright', 'Bold, yellow and black'],
                    is: ['Bjart',  'Djarft, gult og svart'] },
    { id: 'nordic', en: ['Nordic', 'Bold, in Icelandic colours'],
                    is: ['Norrænt','Djarft, í íslenskum litum'] },
  ];

  /* Icelandic first: the customers standing at this counter are in Reykjavík,
     and an English default treats the locals as the exception.

     Light always, regardless of the operating system's dark preference — the
     restaurant's own daylight look is how it presents itself, and dark is a
     choice the visitor makes rather than one their laptop makes for them. */
  const DEFAULT_LANG = 'is';
  const DEFAULT_THEME = 'light';

  const LANG_KEY  = 'll-lang';
  const THEME_KEY = 'll-theme';
  const OLD_KEY   = 'll-season';   // the five-view era; read once, then retired

  /* Old saved values -> what they become now. Mapped by what the visitor was
     actually looking at: the three light views land on light, the two night
     ones on dark. */
  const MIGRATE = {
    daylight: 'light', fireandice: 'light', menuboard: 'light',
    northernlights: 'dark', winternight: 'dark',
  };

  let lang  = DEFAULT_LANG;
  let theme = DEFAULT_THEME;

  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* storage blocked */ }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (_) { /* storage blocked */ }
  }

  function restore() {
    const savedLang = read(LANG_KEY);
    if (savedLang === 'is' || savedLang === 'en') lang = savedLang;

    const saved = read(THEME_KEY);
    if (THEMES.some(t => t.id === saved)) {
      theme = saved;
    } else {
      const old = read(OLD_KEY);
      if (old) {
        theme = MIGRATE[old] || DEFAULT_THEME;
        write(THEME_KEY, theme);
        drop(OLD_KEY);
      }
    }

    apply();
    return { lang, theme };
  }

  function apply() {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = lang;
  }

  function setLang(next) {
    lang = next === 'is' ? 'is' : 'en';
    write(LANG_KEY, lang);
    document.documentElement.lang = lang;
    return lang;
  }

  function toggleLang() { return setLang(lang === 'en' ? 'is' : 'en'); }

  function setTheme(next) {
    if (!THEMES.some(t => t.id === next)) return theme;
    theme = next;
    write(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }

  function toggleTheme() { return setTheme(theme === 'light' ? 'dark' : 'light'); }

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

  /* ------------------------------------------------------------ theme picker
     Two themes were a toggle. Four need a list.

     The button itself is one small circle showing the current theme's swatch,
     so the header gains no words — and the list, with a short description on
     each row, only appears when someone asks for it. The markup is built here
     rather than in each page so the three pages cannot drift apart. */

  const THEME_LABEL = { en: 'Change the look', is: 'Breyta útliti' };

  function swatch(id, cls) {
    return `<span class="themepick__sw sw--${id}${cls ? ' ' + cls : ''}" aria-hidden="true"></span>`;
  }

  /** Paint the button and the menu for the current theme and language. */
  function renderThemePicker(button, menu) {
    if (button) {
      button.innerHTML = swatch(theme);
      const active = THEMES.find(t => t.id === theme) || THEMES[0];
      const label = `${THEME_LABEL[lang] || THEME_LABEL.en} (${active[lang][0]})`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
    if (!menu) return;

    menu.innerHTML = '';
    THEMES.forEach(t => {
      const [name, note] = t[lang] || t.en;
      const b = document.createElement('button');
      b.className = 'themepick__opt';
      b.type = 'button';
      b.role = 'menuitemradio';
      b.dataset.theme = t.id;
      b.setAttribute('aria-checked', String(t.id === theme));
      b.innerHTML = swatch(t.id) +
        `<span class="themepick__txt"><b>${esc(name)}</b><span>${esc(note)}</span></span>`;
      menu.appendChild(b);
    });
  }

  /**
   * Wire the picker. onChange runs after the theme has been applied, for any
   * page that needs to re-render something colour-dependent.
   *
   * Escape and click-away both close it, so it can never be left stuck open on
   * a touch device where there is no pointer to move away.
   */
  function wireThemePicker(root, button, menu, onChange) {
    if (!root || !button || !menu) return;

    const close = () => { root.dataset.open = 'false'; button.setAttribute('aria-expanded', 'false'); };
    const open  = () => { root.dataset.open = 'true';  button.setAttribute('aria-expanded', 'true'); };

    button.addEventListener('click', e => {
      e.stopPropagation();
      root.dataset.open === 'true' ? close() : open();
    });

    document.addEventListener('click', e => { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    menu.addEventListener('click', e => {
      const opt = e.target.closest('.themepick__opt');
      if (!opt) return;
      setTheme(opt.dataset.theme);
      renderThemePicker(button, menu);
      close();
      button.focus();
      if (onChange) onChange(theme);
    });

    close();
    renderThemePicker(button, menu);
  }

  /* -------------------------------------------------------- mobile nav drawer
     The header nav used to be `display: none` below 940px with nothing in its
     place, so on a phone — where most people read a restaurant menu — there was
     no way to reach Panta, Veislur, Hádegismatur or Finndu okkur except by
     scrolling the whole page. This is the fix: a labelled button that opens the
     same links as a drawer.

     Escape closes it, a click outside closes it, following a link closes it,
     and growing the window past the breakpoint closes it — otherwise an open
     drawer survives a rotation and covers a desktop layout. */
  function wireNav(toggle, panel) {
    if (!toggle || !panel) return;

    const close = () => {
      document.documentElement.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      document.documentElement.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    panel.addEventListener('click', e => { if (e.target.closest('a')) close(); });

    document.addEventListener('click', e => {
      if (!isOpen()) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // Matches the breakpoint in styles.css where .nav becomes a drawer.
    const wide = window.matchMedia('(min-width: 941px)');
    const onWide = e => { if (e.matches) close(); };
    wide.addEventListener ? wide.addEventListener('change', onWide)
                          : wide.addListener(onWide);   // older Safari

    close();
  }

  const NAV_LABEL = { en: 'Menu', is: 'Valmynd' };

  /** Keep the nav button's accessible label in the current language. */
  function renderNavToggle(toggle) {
    if (!toggle) return;
    const label = NAV_LABEL[lang] || NAV_LABEL.en;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  return {
    THEMES,
    restore, esc, isk,
    get lang()  { return lang; },
    get theme() { return theme; },
    setLang, toggleLang, setTheme, toggleTheme,
    renderThemePicker, wireThemePicker,
    wireNav, renderNavToggle,
  };
})();

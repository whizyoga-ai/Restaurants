/* ==========================================================================
   Leaf & Loaf — Mathöll Höfða, Reykjavík
   Bilingual (EN / ÍS), seasonal palette, editorial menu with nutrition.

   Every fact here is sourced from the client brief or from Mathöll Höfða's
   own site. Nutrition figures are kitchen ESTIMATES from the listed
   ingredients — they are labelled as such everywhere they appear, and the
   copy sends allergen questions to the counter. Do not present them as
   laboratory-verified values.
   ========================================================================== */

'use strict';

/* ------------------------------------------------------------------- venue */
/* TODO(client): confirm the real enquiry inbox before go-live. Mathöll Höfða's
   site offers an email contact form but does not publish an address, so this
   is a deliberate placeholder — it must not ship to production unchanged. */
const ENQUIRY_EMAIL = 'REPLACE-ME@leafandloaf.is';

const VENUE = {
  hall: 'Mathöll Höfða',
  street: 'Bíldshöfða 9',
  city: '110 Reykjavík',
  country: 'Ísland / Iceland',
  opens: '11:30',
  closes: '21:00',
  mapQuery: 'Mathöll Höfða, Bíldshöfða 9, 110 Reykjavík',
};

/* -------------------------------------------------------------------- menu */
/* price: ISK. kcal/protein/carbs/fat: per-serving estimates.               */
const MENU = LL_MENU.items;   // canonical copy lives in assets/menu-data.js


const COURSES = LL_MENU.courses;


const FILTERS = [
  { id: 'all',          en: 'Everything',   is: 'Allt' },
  { id: 'vegetarian',   en: 'Vegetarian',   is: 'Grænmetis' },
  { id: 'gluten-free',  en: 'Gluten free',  is: 'Glútenlaust' },
  { id: 'high-protein', en: 'High protein', is: 'Próteinríkt' },
];

/* ------------------------------------------------------------------ i18n */
const T = {
  en: {
    langLabel: 'ÍSL',
    place: 'Mathöll Höfða · Reykjavík',
    navMenu: 'Menu', navOrder: 'Order ahead', navParty: 'Party orders', navOffice: 'Office lunch', navFind: 'Find us',
    order: 'Order ahead',
    heroEyebrow: 'Fresh food, honestly made',
    heroTitleA: 'Leaves, loaves and', heroTitleB: 'nothing hiding',
    heroLede: 'Vibrant salads and artisan focaccia, made to order inside Mathöll Höfða. Every dish lists what is in it and roughly what it gives you.',
    ctaMenu: 'See the menu', ctaDirections: 'Directions',
    metaHours: 'Open daily', metaWhere: 'Inside', metaPrice: 'Most dishes',
    ribbonStatus: 'Right now', ribbonHours: 'Opening hours', ribbonFind: 'Where we are', ribbonDiet: 'Dietary',
    open: 'Open — serving until', closed: 'Closed — opens',
    everyDay: 'Every day of the week',
    dietLine: 'Gluten-free and vegetarian choices on every counter.',
    menuEyebrow: 'The menu',
    menuTitleA: 'Everything we make,', menuTitleB: 'and what is in it',
    menuLede: 'Tap any dish to see its ingredients and an estimated nutrition breakdown.',
    nutrition: 'Nutrition', close: 'Close',
    kcal: 'Energy', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
    contains: 'Ingredients',
    estimate: 'Nutrition figures are kitchen estimates based on the listed ingredients and a standard portion. They are a guide, not a laboratory analysis. If you have an allergy, please tell the counter before you order.',
    counterPrice: 'At the counter',
    slabQuote: 'Bread baked this morning. Leaves cut this hour.',
    officeEyebrow: 'For teams',
    officeTitleA: 'Lunch for the office,', officeTitleB: 'without the fuss',
    officeLede: 'We deliver salad and focaccia trays to workplaces around Höfði, Borgartún and Grandi. Kennitala invoicing, one delivery, no per-person admin.',
    p1t: 'Kennitala invoicing', p1d: 'One monthly invoice to the company, not nine card payments.',
    p2t: 'A standing order or a one-off', p2d: 'Weekly, three days a week, or a single board meeting.',
    p3t: 'Diets handled up front', p3d: 'Tell us the counts for vegetarian, gluten free and high protein.',
    p4t: 'Delivered around Höfði', p4d: 'Bíldshöfði and the surrounding business district.',
    quoterTitle: 'Estimate a team order',
    quoterHint: 'Indicative only. We confirm the real figure by email.',
    people: 'People', perWeek: 'Days per week', style: 'What they eat',
    styleSalad: 'Salad bowls', styleFocaccia: 'Focaccia trays', styleMixed: 'A mix of both',
    perPerson: 'Per person', perMonth: 'Per month, roughly',
    company: 'Company', kt: 'Kennitala', contact: 'Your name', email: 'Work email',
    send: 'Send this enquiry',
    findEyebrow: 'Find us',
    findTitleA: 'Inside the food hall', findTitleB: 'on Bíldshöfði',
    findLede: 'Leaf & Loaf is one of ten kitchens in Mathöll Höfða. Order at our counter, sit anywhere in the hall.',
    nearby: 'Nearby',
    footHours: 'Opening hours', footFind: 'Address', footHall: 'The food hall',
    hallNote: 'Mathöll Höfða hosts ten independent kitchens under one roof. Shared seating, separate counters.',
    builtBy: 'Site by Brahmexa',
    photoNote: 'Dish photographs are serving suggestions, cropped from house photography — not a shot of each individual plate.',
    chatHintTitle: 'Ask about the menu',
    chatHintSub: 'Allergens, nutrition, what is nearby',
    toastOrder: 'Order-ahead is not connected yet — please order at the counter for now.',
    toastSent: 'Opening your email app with the enquiry filled in.',
  },
  is: {
    langLabel: 'ENG',
    place: 'Mathöll Höfða · Reykjavík',
    navMenu: 'Matseðill', navOrder: 'Panta', navParty: 'Veislur', navOffice: 'Hádegismatur', navFind: 'Finndu okkur',
    order: 'Panta fyrirfram',
    heroEyebrow: 'Ferskur matur, heiðarlega gerður',
    heroTitleA: 'Salat, brauð og', heroTitleB: 'ekkert falið',
    heroLede: 'Litrík salöt og handgert focaccia, útbúið eftir pöntun í Mathöll Höfða. Hver réttur segir hvað er í honum og hvað hann gefur þér.',
    ctaMenu: 'Skoða matseðil', ctaDirections: 'Leiðarlýsing',
    metaHours: 'Opið alla daga', metaWhere: 'Inni í', metaPrice: 'Flestir réttir',
    ribbonStatus: 'Núna', ribbonHours: 'Opnunartími', ribbonFind: 'Hvar við erum', ribbonDiet: 'Fæði',
    open: 'Opið — við afgreiðum til', closed: 'Lokað — opnum',
    everyDay: 'Alla daga vikunnar',
    dietLine: 'Glútenlausir og grænmetisréttir í boði alla daga.',
    menuEyebrow: 'Matseðillinn',
    menuTitleA: 'Allt sem við gerum,', menuTitleB: 'og hvað er í því',
    menuLede: 'Smelltu á rétt til að sjá hráefni og áætlaða næringu.',
    nutrition: 'Næring', close: 'Loka',
    kcal: 'Orka', protein: 'Prótein', carbs: 'Kolvetni', fat: 'Fita',
    contains: 'Hráefni',
    estimate: 'Næringartölur eru áætlun eldhússins byggð á upptöldum hráefnum og venjulegum skammti. Þær eru til viðmiðunar, ekki rannsóknarstofugreining. Ef þú ert með ofnæmi, láttu vita við afgreiðsluborðið áður en þú pantar.',
    counterPrice: 'Við afgreiðslu',
    slabQuote: 'Brauð bakað í morgun. Salat skorið á þessari stundu.',
    officeEyebrow: 'Fyrir vinnustaði',
    officeTitleA: 'Hádegismatur fyrir skrifstofuna,', officeTitleB: 'án vesens',
    officeLede: 'Við sendum salat- og focacciabakka á vinnustaði í Höfða, Borgartúni og Grandi. Reikningur á kennitölu, ein sending, engin umsýsla á mann.',
    p1t: 'Reikningur á kennitölu', p1d: 'Einn mánaðarreikningur á fyrirtækið, ekki níu kortafærslur.',
    p2t: 'Fastur samningur eða stakt skipti', p2d: 'Vikulega, þrisvar í viku, eða einn stjórnarfundur.',
    p3t: 'Fæði afgreitt fyrirfram', p3d: 'Segðu okkur fjöldann fyrir grænmetis, glútenlaust og próteinríkt.',
    p4t: 'Sent um Höfðahverfið', p4d: 'Bíldshöfði og nærliggjandi atvinnusvæði.',
    quoterTitle: 'Áætlaðu pöntun fyrir teymið',
    quoterHint: 'Aðeins til viðmiðunar. Við staðfestum rétta tölu í tölvupósti.',
    people: 'Fjöldi', perWeek: 'Dagar í viku', style: 'Hvað þau borða',
    styleSalad: 'Salatskálar', styleFocaccia: 'Focacciabakkar', styleMixed: 'Blanda af hvoru tveggja',
    perPerson: 'Á mann', perMonth: 'Á mánuði, um það bil',
    company: 'Fyrirtæki', kt: 'Kennitala', contact: 'Nafn þitt', email: 'Vinnunetfang',
    send: 'Senda fyrirspurn',
    findEyebrow: 'Finndu okkur',
    findTitleA: 'Inni í mathöllinni', findTitleB: 'á Bíldshöfða',
    findLede: 'Leaf & Loaf er eitt af tíu eldhúsum í Mathöll Höfða. Pantaðu við borðið okkar, sestu hvar sem er í höllinni.',
    nearby: 'Í nágrenninu',
    footHours: 'Opnunartími', footFind: 'Heimilisfang', footHall: 'Mathöllin',
    hallNote: 'Mathöll Höfða hýsir tíu sjálfstæð eldhús undir einu þaki. Sameiginleg sæti, aðskilin afgreiðsluborð.',
    builtBy: 'Vefur frá Brahmexa',
    photoNote: 'Myndir af réttum eru til viðmiðunar, klipptar úr myndefni hússins — ekki mynd af hverjum einstökum rétti.',
    chatHintTitle: 'Spurðu um matseðilinn',
    chatHintSub: 'Ofnæmisvaldar, næring, hvað er nálægt',
    toastOrder: 'Forpöntun er ekki tengd enn — vinsamlegast pantaðu við afgreiðsluborðið.',
    toastSent: 'Opna póstforritið þitt með fyrirspurninni.',
  },
};

/* Nearby — walking/driving landmarks around Bíldshöfði 9. Kept factual and
   deliberately short; the assistant handles the long tail. */
const NEARBY = [
  { en: 'Elliðaárdalur valley walks',     is: 'Elliðaárdalur — gönguleiðir',   dist: '~2 km' },
  { en: 'Árbæjarsafn open-air museum',    is: 'Árbæjarsafn',                   dist: '~3 km' },
  { en: 'Grafarvogur coastal path',       is: 'Grafarvogur — strandstígur',     dist: '~3 km' },
  { en: 'Laugardalur park & pools',       is: 'Laugardalur — garður og laugar', dist: '~4 km' },
  { en: 'Reykjavík city centre',          is: 'Miðborg Reykjavíkur',            dist: '~6 km' },
];

/* ------------------------------------------------------------------- views
   Five looks. Four are light; Vetrarnótt is kept because it was already
   shipped and some people genuinely prefer a dark page at night.

   The three added views are drawn in CSS rather than photographed — see the
   note in styles.css for why the available photographs could not be used. */
const VIEWS = LL.VIEWS;   // shared with the party page, see assets/views.js

/* ------------------------------------------------------------------ state
   lang and season are mirrors of LL (assets/views.js), which owns the
   defaults and the localStorage keys and is shared with the party page. */
let lang = 'is';
let season = 'daylight';
let filter = 'all';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const t  = () => T[lang];
const isk = n => LL.isk(n);   // period grouping, see views.js

/* -------------------------------------------------------------------- boot */
document.addEventListener('DOMContentLoaded', () => {
  restorePrefs();
  wireChrome();
  renderFilters();
  renderMenu();
  renderNearby();
  renderHeroMenu();
  wireQuoter();
  applyLang();
  updateStatus();
  observeReveals();
  setInterval(updateStatus, 60_000);
});

function restorePrefs() {
  const state = LL.restore();
  lang = state.lang;
  season = state.view;
}

function savePref(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

/* ------------------------------------------------------------ page chrome */
function wireChrome() {
  const head = $('.masthead');
  const onScroll = () => head.classList.toggle('is-stuck', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'is' : 'en';
    savePref('ll-lang', lang);
    document.documentElement.lang = lang === 'is' ? 'is' : 'en';
    renderFilters();
    renderMenu();
    renderNearby();
    renderViewPicker();
    renderHeroMenu();
    applyLang();
    updateStatus();
    updateQuote();
  });

  wireViewPicker();

  $$('[data-order]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    toast(t().toastOrder);
  }));

  wireChatHint();
}

/**
 * Show the label beside the assistant, once the widget has actually loaded.
 *
 * The widget is a third-party script from another origin; if it fails to load
 * — blocked, offline, the service down — a label pointing at a bubble that is
 * not there is worse than no label. So it only appears after #bc-bubble exists,
 * and it hides itself again while the chat panel is open.
 */
function wireChatHint() {
  const hint = $('#chatHint');
  if (!hint) return;

  const bubble = () => document.getElementById('bc-bubble');

  const reveal = () => {
    if (!bubble()) return false;
    hint.hidden = false;
    return true;
  };

  if (!reveal()) {
    // Poll briefly rather than forever — the widget either arrives or it does not.
    let tries = 0;
    const timer = setInterval(() => {
      if (reveal() || ++tries > 40) clearInterval(timer);
    }, 250);
  }

  hint.addEventListener('click', () => {
    bubble()?.click();                 // one code path for opening the panel
    hint.classList.add('is-gone');
  });

  // If the visitor opens the chat by the bubble itself, retire the label too.
  document.addEventListener('click', e => {
    if (e.target.closest('#bc-bubble')) hint.classList.add('is-gone');
  });
}

function wireViewPicker() {
  const pick = $('#viewPick');
  const btn = $('#viewBtn');
  const menu = $('#viewMenu');

  const close = () => { pick.dataset.open = 'false'; btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { pick.dataset.open = 'true'; btn.setAttribute('aria-expanded', 'true'); };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    pick.dataset.open === 'true' ? close() : open();
  });

  // Click-away and Escape, so the menu is never stuck open on a touch device.
  document.addEventListener('click', e => { if (!pick.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  menu.addEventListener('click', e => {
    const opt = e.target.closest('.viewpick__opt');
    if (!opt) return;
    setView(opt.dataset.view);
    close();
    btn.focus();
  });

  renderViewPicker();
}

function renderViewPicker() {
  const menu = $('#viewMenu');
  menu.innerHTML = '';
  VIEWS.forEach(v => {
    const [name, note] = v[lang];
    const b = document.createElement('button');
    b.className = 'viewpick__opt';
    b.type = 'button';
    b.role = 'menuitemradio';
    b.dataset.view = v.id;
    b.setAttribute('aria-checked', String(v.id === season));
    b.innerHTML =
      `<span class="viewpick__sw sw--${v.id}" aria-hidden="true"></span>` +
      `<span class="viewpick__txt"><b>${esc(name)}</b><span>${esc(note)}</span></span>`;
    menu.appendChild(b);
  });

  const active = VIEWS.find(v => v.id === season) || VIEWS[0];
  $('#viewBtnLabel').textContent = active[lang][0];
}

function setView(id) {
  if (!VIEWS.some(v => v.id === id)) return;
  season = id;
  savePref('ll-season', season);
  document.documentElement.setAttribute('data-season', season);
  renderViewPicker();
  renderHeroMenu();
}

/* The hero menu card, for the Matseðillinn view. Built from MENU so it cannot
   drift out of step with the menu section further down the page. */
function renderHeroMenu() {
  const box = $('#heroMenu');
  if (!box) return;
  if (season !== 'menuboard') { box.innerHTML = ''; return; }

  const head =
    `<div class="hero-menu__head">
       <h2>${esc(lang === 'en' ? 'Menu' : 'Matseðill')}</h2>
       <p>${esc(VENUE.hall)} · ${esc(VENUE.opens)}–${esc(VENUE.closes)}</p>
     </div>`;

  const groups = COURSES.map(course => {
    const rows = MENU.filter(d => d.course === course.id).map(d => {
      const price = d.price === null
        ? esc(t().counterPrice)
        : `${isk(d.price)} ISK`;
      return `<div class="hero-menu__row">
                <span>${esc(d[lang].name)}</span>
                <span class="dots"></span>
                <span class="price">${price}</span>
              </div>`;
    }).join('');
    return `<div class="hero-menu__group"><h3>${esc(course[lang][0])}</h3>${rows}</div>`;
  }).join('');

  box.innerHTML = head + groups;
}

/* --------------------------------------------------------- open / closed */
function updateStatus() {
  /* Iceland is UTC year-round (no DST), so we can read the venue clock
     directly from UTC and be correct for a visitor in any timezone. */
  const now = new Date();
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  const [oh, om] = VENUE.opens.split(':').map(Number);
  const [ch, cm] = VENUE.closes.split(':').map(Number);
  const open = mins >= oh * 60 + om && mins < ch * 60 + cm;

  const dot = $('#statusDot');
  const txt = $('#statusText');
  dot.className = 'open-dot' + (open ? '' : ' open-dot--closed');
  txt.textContent = open ? `${t().open} ${VENUE.closes}` : `${t().closed} ${VENUE.opens}`;
}

/* -------------------------------------------------------------- menu render */
function renderFilters() {
  const box = $('#filters');
  box.innerHTML = '';
  FILTERS.forEach(f => {
    const b = document.createElement('button');
    b.className = 'filter';
    b.type = 'button';
    b.textContent = f[lang];
    b.setAttribute('aria-pressed', String(filter === f.id));
    b.addEventListener('click', () => { filter = f.id; renderFilters(); renderMenu(); });
    box.appendChild(b);
  });
}

function renderMenu() {
  const root = $('#menu');
  root.innerHTML = '';

  COURSES.forEach(course => {
    const dishes = MENU.filter(d =>
      d.course === course.id && (filter === 'all' || d.diet.includes(filter)));
    if (!dishes.length) return;

    const sec = document.createElement('div');
    sec.className = 'course reveal';

    const [title, note] = course[lang];
    sec.innerHTML = `<div class="course__label"><h3>${esc(title)}</h3><span>${esc(note)}</span></div>`;

    dishes.forEach(d => sec.appendChild(dishNode(d)));
    root.appendChild(sec);
  });

  observeReveals();
}

function dishNode(d) {
  const c = d[lang];
  const el = document.createElement('article');
  el.className = 'dish';

  const priceHtml = d.price === null
    ? `<span class="dish__price"><small>${esc(t().counterPrice)}</small></span>`
    : `<span class="dish__price">${isk(d.price)}<small>ISK</small></span>`;

  const tags = c.tags.map((tag, i) =>
    `<span class="tag${i === 0 ? '' : ' tag--muted'}">${esc(tag)}</span>`).join('');

  /* The photo is a sibling of the head, not a child, so the image-led layouts
     can put it beside the text or above it without restructuring the DOM per
     view. Hidden by CSS everywhere except Eldur og Ís and Vetrarnótt. */
  const photoHtml = d.photo
    ? `<span class="dish__photo"><img src="${d.photo}" alt="${esc(c.name)}" loading="lazy" /></span>`
    : `<span class="dish__photo dish__photo--none" aria-hidden="true">${LL_ILLUS.forId(d.id)}</span>`;

  el.innerHTML = photoHtml + `
    <button class="dish__head" type="button" aria-expanded="false">
      <span class="dish__name">${esc(c.name)}</span>
      ${priceHtml}
      <span class="dish__desc">${esc(c.desc)}</span>
      <span class="tags">${tags}</span>
      <span class="dish__chevron">${esc(t().nutrition)}
        <svg width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
          <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </span>
    </button>
    <div class="dish__panel">
      <div class="panel-inner">
        <dl class="nutri">
          <div><dt>${esc(t().kcal)}</dt><dd>${d.kcal}<span>kcal</span></dd></div>
          <div><dt>${esc(t().protein)}</dt><dd>${d.protein}<span>g</span></dd></div>
          <div><dt>${esc(t().carbs)}</dt><dd>${d.carbs}<span>g</span></dd></div>
          <div><dt>${esc(t().fat)}</dt><dd>${d.fat}<span>g</span></dd></div>
        </dl>
        <p class="ingredients"><b>${esc(t().contains)}:</b> ${esc(c.ingredients)}</p>
        <p class="disclaimer">${esc(t().estimate)}</p>
      </div>
    </div>`;

  const head = el.querySelector('.dish__head');
  head.addEventListener('click', () => {
    const open = el.classList.toggle('is-open');
    head.setAttribute('aria-expanded', String(open));
  });

  return el;
}

function renderNearby() {
  const ul = $('#nearby');
  ul.innerHTML = '';
  NEARBY.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(n[lang])}</span><span>${esc(n.dist)}</span>`;
    ul.appendChild(li);
  });
}

/* ----------------------------------------------------------- office quoter */
/* Base rates are per person per meal, in ISK, derived from the counter menu:
   salad bowls average the three salads, focaccia averages the three breads. */
const RATES = { salad: 3230, focaccia: 3050, mixed: 3140 };

function wireQuoter() {
  ['#qPeople', '#qDays', '#qStyle'].forEach(s => {
    $(s).addEventListener('input', updateQuote);
    $(s).addEventListener('change', updateQuote);
  });
  updateQuote();

  $('#officeForm').addEventListener('submit', e => {
    e.preventDefault();
    const people = $('#qPeople').value;
    const days = $('#qDays').value;
    const styleTxt = $('#qStyle').selectedOptions[0].textContent;

    const subject = `Office lunch enquiry — ${$('#fCompany').value}`;
    const body = [
      `Company: ${$('#fCompany').value}`,
      `Kennitala: ${$('#fKt').value}`,
      `Contact: ${$('#fContact').value}`,
      `Email: ${$('#fEmail').value}`,
      '',
      `People: ${people}`,
      `Days per week: ${days}`,
      `Style: ${styleTxt}`,
      `Indicative monthly estimate: ${$('#qMonth').textContent}`,
      '',
      'Sent from leafandloaf on manailab.com',
    ].join('\n');

    window.location.href =
      `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast(t().toastSent);
  });
}

function updateQuote() {
  const people = Number($('#qPeople').value);
  const days = Number($('#qDays').value);
  const rate = RATES[$('#qStyle').value] || RATES.mixed;

  /* Volume tiers, stated plainly so the number is explainable to a client. */
  const factor = people >= 50 ? 0.85 : people >= 25 ? 0.90 : 1;
  const perPerson = Math.round(rate * factor);
  const monthly = Math.round(perPerson * people * days * 4.33);

  $('#qPeopleOut').textContent = people;
  $('#qDaysOut').textContent = days;
  $('#qPerson').textContent = `${isk(perPerson)} ISK`;
  $('#qMonth').textContent = `${isk(monthly)} ISK`;
}

/* ------------------------------------------------------------------ i18n dom */
function applyLang() {
  const d = t();
  $$('[data-t]').forEach(el => {
    const key = el.dataset.t;
    if (d[key] !== undefined) el.textContent = d[key];
  });

  $('#langBtn').textContent = d.langLabel;
  $('#mapFrame').title = `${VENUE.hall}, ${VENUE.street}`;

  $$('[data-order]').forEach(b => { b.textContent = d.order; });
}

/* ------------------------------------------------------------------ helpers */
function esc(s) {
  return String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-up');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-up'), 4600);
}

let revealObserver;
function observeReveals() {
  /* A reveal that never fires means invisible content, which is a far worse
     failure than no animation. If IntersectionObserver is missing or throttled
     (some in-app webviews never deliver entries for a backgrounded frame),
     show everything and move on. */
  if (!('IntersectionObserver' in window)) { revealAll(); return; }

  clearTimeout(revealFailsafe);
  revealFailsafe = setTimeout(revealAll, 3000);

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  $$('.reveal:not(.is-in)').forEach(el => revealObserver.observe(el));
}

let revealFailsafe;
function revealAll() { $$('.reveal').forEach(el => el.classList.add('is-in')); }

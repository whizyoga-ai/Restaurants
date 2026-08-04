/* ==========================================================================
   Leaf & Loaf — Mathöll Höfða, Reykjavík
   Bilingual (EN / ÍS), light and dark, photo-led menu with nutrition.

   Every fact here is sourced from the client brief or from Mathöll Höfða's
   own site. Nutrition figures are kitchen ESTIMATES from the listed
   ingredients — they are labelled as such everywhere they appear, and the
   copy sends allergen questions to the counter. Do not present them as
   laboratory-verified values.

   VOICE. The copy is written to be read quickly by someone standing in a food
   hall, in their second language, on a phone.

   The rules, taken from how Icelandic food-hall sites actually write (see
   xoisland.is, which the client pointed at): short sentences. Ordinary words.
   One idea per sentence. No metaphors, no wordplay, and no em-dash asides —
   if a sentence needs a dash to hold a second thought, make it two sentences.
   Avoid words a non-native reader has to stop at: "fuss", "indicative",
   "editorial", "artisan", "the working". Say the plain thing.

   Earlier drafts said "Leaves, loaves and nothing hiding", "Bread baked this
   morning, leaves cut this hour" and "Lunch for the office, without the fuss".
   All pretty, all harder work than reading a menu should be.
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
    navMenu: 'Menu', navOrder: 'Order ahead', navParty: 'Party orders',
    navOffice: 'Office lunch', navReviews: 'Reviews', navFind: 'Find us',
    order: 'Order ahead',
    heroEyebrow: 'Fresh food, made to order',
    heroTitleA: 'Fresh salads and', heroTitleB: 'warm focaccia',
    heroLede: 'We make every salad and sandwich to order, inside the Mathöll Höfða food hall. Every dish shows what is in it.',
    ctaMenu: 'See the menu', ctaDirections: 'Get directions',
    metaHours: 'Open every day', metaWhere: 'Inside', metaPrice: 'Most dishes',
    ribbonStatus: 'Right now', ribbonHours: 'Opening hours', ribbonFind: 'Where we are', ribbonDiet: 'Food choices',
    open: 'Open until', closed: 'Closed. We open at',
    everyDay: 'Every day of the week',
    dietLine: 'Gluten-free and vegetarian dishes every day.',
    menuEyebrow: 'The menu',
    menuTitleA: 'Our menu,', menuTitleB: 'and what is in it',
    menuLede: 'Tap a dish to see its ingredients and nutrition.',
    nutrition: 'Nutrition', close: 'Close',
    kcal: 'Energy', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
    contains: 'Ingredients',
    estimate: 'These numbers are our kitchen’s estimate for a normal portion. They are a guide, not a lab test. If you have an allergy, please tell us at the counter before you order.',
    counterPrice: 'Price at the counter',
    slabQuote: 'Fresh bread every morning. Salads made to order.',
    reviewsEyebrow: 'Customer feedback',
    reviewsTitleA: 'What our', reviewsTitleB: 'customers say',
    reviewsLede: 'Reviews from people who have eaten with us.',
    reviewsFoot: 'Have you eaten with us? Tell us at the counter or send us an email. We would like to hear from you.',
    reviewsNotice: 'These are example reviews, not real customers. They will be replaced with real reviews before this site goes live.',
    reviewsNoticeTag: 'Example content',
    starsOf: 'out of 5',
    officeEyebrow: 'For teams',
    officeTitleA: 'Lunch for your team,', officeTitleB: 'easy to order',
    officeLede: 'We deliver salad and focaccia trays to workplaces in Höfði, Borgartún and Grandi. One delivery, one invoice to the company.',
    p1t: 'One invoice', p1d: 'We invoice the company on its kennitala. Nobody has to pay by card.',
    p2t: 'Every week or just once', p2d: 'Every week, three days a week, or one meeting.',
    p3t: 'Tell us what they eat', p3d: 'Tell us how many people need vegetarian, gluten free or high protein.',
    p4t: 'Delivered around Höfði', p4d: 'Bíldshöfði and the business area around it.',
    quoterTitle: 'Estimate a team order',
    quoterHint: 'This is only an estimate. We confirm the real price by email.',
    people: 'People', perWeek: 'Days per week', style: 'What they eat',
    styleSalad: 'Salad bowls', styleFocaccia: 'Focaccia trays', styleMixed: 'A mix of both',
    perPerson: 'Per person', perMonth: 'Per month',
    company: 'Company', kt: 'Kennitala', contact: 'Your name', email: 'Work email',
    send: 'Send this enquiry',
    findEyebrow: 'Find us',
    findTitleA: 'Inside the food hall', findTitleB: 'on Bíldshöfði',
    findLede: 'Leaf & Loaf is one of ten kitchens in Mathöll Höfða. Order at our counter and sit anywhere in the hall.',
    nearby: 'Nearby',
    footHours: 'Opening hours', footFind: 'Address', footHall: 'The food hall',
    hallNote: 'Mathöll Höfða has ten kitchens under one roof. Shared seating, separate counters.',
    builtBy: 'Site by Brahmexa',
    photoNote: 'The photos show how a dish is usually served. They are not a photo of each plate.',
    toastOrder: 'Order ahead is not ready yet. Please order at the counter.',
    toastSent: 'Opening your email app with the enquiry filled in.',
  },
  is: {
    langLabel: 'ENG',
    place: 'Mathöll Höfða · Reykjavík',
    navMenu: 'Matseðill', navOrder: 'Panta', navParty: 'Veislur',
    navOffice: 'Hádegismatur', navReviews: 'Umsagnir', navFind: 'Finndu okkur',
    order: 'Panta fyrirfram',
    heroEyebrow: 'Ferskur matur, gerður eftir pöntun',   // “made to order”, the plain phrase
    heroTitleA: 'Fersk salöt og', heroTitleB: 'heitt focaccia',
    heroLede: 'Við gerum hvert salat og hverja samloku eftir pöntun, inni í Mathöll Höfða. Hver réttur sýnir hvað er í honum.',
    ctaMenu: 'Skoða matseðil', ctaDirections: 'Sjá á korti',
    metaHours: 'Opið alla daga', metaWhere: 'Inni í', metaPrice: 'Flestir réttir',
    ribbonStatus: 'Núna', ribbonHours: 'Opnunartími', ribbonFind: 'Hvar við erum', ribbonDiet: 'Fæði',
    open: 'Opið til', closed: 'Lokað. Við opnum kl.',
    everyDay: 'Alla daga vikunnar',
    dietLine: 'Glútenlausir og grænmetisréttir alla daga.',
    menuEyebrow: 'Matseðillinn',
    menuTitleA: 'Matseðillinn okkar,', menuTitleB: 'og hvað er í honum',
    menuLede: 'Smelltu á rétt til að sjá hráefni og næringu.',
    nutrition: 'Næring', close: 'Loka',
    kcal: 'Orka', protein: 'Prótein', carbs: 'Kolvetni', fat: 'Fita',
    contains: 'Hráefni',
    estimate: 'Þessar tölur eru áætlun eldhússins fyrir venjulegan skammt. Þær eru til viðmiðunar, ekki rannsóknarstofugreining. Ef þú ert með ofnæmi, láttu okkur vita við afgreiðsluborðið áður en þú pantar.',
    counterPrice: 'Verð við afgreiðslu',
    slabQuote: 'Ferskt brauð á hverjum morgni. Salat gert eftir pöntun.',
    reviewsEyebrow: 'Umsagnir',
    reviewsTitleA: 'Það sem', reviewsTitleB: 'viðskiptavinir segja',
    reviewsLede: 'Umsagnir frá fólki sem hefur borðað hjá okkur.',
    reviewsFoot: 'Hefur þú borðað hjá okkur? Segðu okkur frá því við afgreiðsluborðið eða sendu okkur tölvupóst. Við viljum heyra frá þér.',
    reviewsNotice: 'Þetta eru sýnishorn af umsögnum, ekki raunverulegir viðskiptavinir. Þeim verður skipt út fyrir alvöru umsagnir áður en vefurinn fer í loftið.',
    reviewsNoticeTag: 'Sýnishorn',
    starsOf: 'af 5',
    officeEyebrow: 'Fyrir vinnustaði',
    officeTitleA: 'Hádegismatur fyrir teymið,', officeTitleB: 'einfalt að panta',
    officeLede: 'Við sendum salat- og focacciabakka á vinnustaði í Höfða, Borgartúni og Grandi. Ein sending, einn reikningur á fyrirtækið.',
    p1t: 'Einn reikningur', p1d: 'Við sendum reikning á kennitölu fyrirtækisins. Enginn þarf að borga með korti.',
    p2t: 'Í hverri viku eða bara einu sinni', p2d: 'Í hverri viku, þrisvar í viku, eða einn fundur.',
    p3t: 'Segðu okkur hvað þau borða', p3d: 'Segðu okkur hversu margir þurfa grænmetis, glútenlaust eða próteinríkt.',
    p4t: 'Sent um Höfða', p4d: 'Bíldshöfði og atvinnusvæðið í kring.',
    quoterTitle: 'Áætlaðu pöntun fyrir teymið',
    quoterHint: 'Þetta er aðeins áætlun. Við staðfestum rétt verð í tölvupósti.',
    people: 'Fjöldi', perWeek: 'Dagar í viku', style: 'Hvað þau borða',
    styleSalad: 'Salatskálar', styleFocaccia: 'Focacciabakkar', styleMixed: 'Blanda af hvoru tveggja',
    perPerson: 'Á mann', perMonth: 'Á mánuði',
    company: 'Fyrirtæki', kt: 'Kennitala', contact: 'Nafn þitt', email: 'Vinnunetfang',
    send: 'Senda fyrirspurn',
    findEyebrow: 'Finndu okkur',
    findTitleA: 'Inni í mathöllinni', findTitleB: 'á Bíldshöfða',
    findLede: 'Leaf & Loaf er eitt af tíu eldhúsum í Mathöll Höfða. Pantaðu við borðið okkar og sestu hvar sem er í höllinni.',
    nearby: 'Í nágrenninu',
    footHours: 'Opnunartími', footFind: 'Heimilisfang', footHall: 'Mathöllin',
    hallNote: 'Mathöll Höfða hefur tíu eldhús undir einu þaki. Sameiginleg sæti, aðskilin afgreiðsluborð.',
    builtBy: 'Vefur frá Brahmexa',
    photoNote: 'Myndirnar sýna hvernig rétturinn er venjulega borinn fram. Þær eru ekki mynd af hverjum rétti.',
    toastOrder: 'Forpöntun er ekki tilbúin enn. Vinsamlegast pantaðu við afgreiðsluborðið.',
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

/* ------------------------------------------------------------------ state
   lang and theme are mirrors of LL (assets/views.js), which owns the defaults
   and the localStorage keys and is shared with the panta and party pages. */
let lang = 'is';
let filter = 'all';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const t  = () => T[lang];
const isk = n => LL.isk(n);   // period grouping, see views.js

/* -------------------------------------------------------------------- boot */
document.addEventListener('DOMContentLoaded', () => {
  lang = LL.restore().lang;
  wireChrome();
  renderFilters();
  renderMenu();
  renderReviews();
  renderNearby();
  wireQuoter();
  applyLang();
  updateStatus();
  observeReveals();
  setInterval(updateStatus, 60_000);
});

/* ------------------------------------------------------------ page chrome */
function wireChrome() {
  const head = $('.masthead');
  const onScroll = () => head.classList.toggle('is-stuck', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  LL.wireThemePicker($('#themePick'), $('#themeBtn'), $('#themeMenu'));
  LL.wireNav($('#navToggle'), $('#primaryNav'));

  $('#langBtn').addEventListener('click', () => {
    lang = LL.toggleLang();
    renderFilters();
    renderMenu();
    renderReviews();
    renderNearby();
    applyLang();
    updateStatus();
    updateQuote();
  });

  $$('[data-order]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    toast(t().toastOrder);
  }));
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

    const sec = document.createElement('section');
    sec.className = 'course reveal';

    const [title, note] = course[lang];
    sec.innerHTML =
      `<div class="course__label"><h3>${esc(title)}</h3><span>${esc(note)}</span></div>` +
      `<div class="course__items"></div>`;

    const items = sec.querySelector('.course__items');
    dishes.forEach(d => items.appendChild(dishNode(d)));
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

  /* The three drinks carry no photograph — there is no juice or coffee shot in
     the house set, and a picture captioned "Fresh Pressed Juice" that is not
     one would be a small lie. They get a drawn tile instead. */
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

/* ==========================================================================
   CUSTOMER FEEDBACK

   The reviews are data (assets/reviews.js), not markup, so changing them never
   means editing HTML. While that file's `placeholder` flag is true, a visible
   notice is printed above the cards — a sample review that reaches a live site
   without one is an invented customer, and this section exists to earn trust
   rather than to spend it.
   ========================================================================== */

const STAR_FULL =
  '<svg viewBox="0 0 20 19" width="15" height="15" fill="currentColor" aria-hidden="true">' +
  '<path d="M10 0l2.9 6.2 6.6.9-4.8 4.7 1.2 6.8L10 15.4 4.1 18.6l1.2-6.8L.5 7.1l6.6-.9z"/></svg>';

const STAR_EMPTY =
  '<svg viewBox="0 0 20 19" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" ' +
  'stroke-linejoin="round" class="is-empty" aria-hidden="true">' +
  '<path d="M10 1l2.6 5.6 6 .8-4.4 4.3 1.1 6.1L10 14.9 4.7 17.8l1.1-6.1L1.4 7.4l6-.8z"/></svg>';

function renderReviews() {
  const grid = $('#reviewsGrid');
  const noticeBox = $('#reviewsNotice');
  if (!grid) return;

  const data = window.LL_REVIEWS || { items: [], placeholder: false };
  const items = Array.isArray(data.items) ? data.items : [];

  /* No reviews at all is a legitimate state — it is what the section looks
     like between "we removed the samples" and "we pasted the real ones". Hide
     the whole section rather than showing an empty grid under a heading, and
     hide its nav link with it so the menu has no entry that goes nowhere. */
  const empty = items.length === 0;
  const section = $('#reviews');
  if (section) section.hidden = empty;
  $$('#primaryNav a[href="#reviews"]').forEach(a => { a.hidden = empty; });
  if (empty) { grid.innerHTML = ''; if (noticeBox) noticeBox.innerHTML = ''; return; }

  if (noticeBox) {
    noticeBox.innerHTML = data.placeholder
      ? `<p class="reviews__notice"><b>${esc(t().reviewsNoticeTag)}:</b> ${esc(t().reviewsNotice)}</p>`
      : '';
  }

  grid.innerHTML = items.map(r => {
    const stars = Math.max(0, Math.min(5, Math.round(Number(r.stars) || 0)));
    const starsHtml = STAR_FULL.repeat(stars) + STAR_EMPTY.repeat(5 - stars);
    const meta = [r.where, r.date].filter(Boolean).join(' · ');

    return `
      <figure class="review reveal">
        <div class="review__stars" role="img" aria-label="${stars} ${esc(t().starsOf)}">${starsHtml}</div>
        <blockquote class="review__quote">${esc(r[lang] || r.en || '')}</blockquote>
        <figcaption class="review__who">
          <span class="review__name">${esc(r.name || '')}</span>
          ${meta ? `<span class="review__meta">${esc(meta)}</span>` : ''}
        </figcaption>
      </figure>`;
  }).join('');

  observeReveals();
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
      `Estimated monthly total: ${$('#qMonth').textContent}`,
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

  // Both controls carry their label in the accessible name only, so they have
  // to be repainted when the language changes.
  LL.renderThemePicker($('#themeBtn'), $('#themeMenu'));
  LL.renderNavToggle($('#navToggle'));

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

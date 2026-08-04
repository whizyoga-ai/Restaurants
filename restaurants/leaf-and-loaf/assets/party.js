/* ==========================================================================
   Veisluþjónusta — party orders.

   PRICING IS ARITHMETIC, NOT INVENTION.

   Every platter below is priced as (what goes on it) x (its menu price). The
   page shows that working openly — "6 x 3.050 kr" — for two reasons. It is
   honest: no number here was made up to look like a catering price. And it is
   the argument: a customer can see there is no party markup, which is a better
   pitch than any adjective.

   The counts and portion sizes ARE a proposal. Leaf & Loaf has not confirmed
   that it caters, how many pieces a platter holds, or what notice it needs.
   The page says so rather than presenting a proposal as an existing service.
   ========================================================================== */

'use strict';

const ENQUIRY_EMAIL = 'REPLACE-ME@leafandloaf.is';   // same placeholder as the main page

/* Menu prices, mirrored from app.js. Keeping the numbers here rather than
   importing the whole menu keeps this page independent, and the platter
   builder below reads them so a price change flows into every total. */
const PRICES = {
  caesar: 3290, quinoa: 3250, medi: 3150,
  focSalmon: 3200, focChicken: 3050, focVeg: 2900,
};

const avg = (...ns) => Math.round(ns.reduce((a, b) => a + b, 0) / ns.length);

const PLATTERS = [
  {
    id: 'focaccia',
    photo: 'assets/images/dishes/focaccia-sandwiches.jpg',
    parts: [{ n: 6, price: avg(PRICES.focSalmon, PRICES.focChicken, PRICES.focVeg) }],
    serves: '8–12',
    pieces: 24,
    en: { name: 'Focaccia platter',
          desc: 'Six focaccia quartered — smoked salmon, chicken and roasted vegetable, mixed on one board.',
          working: 'six focaccia at the menu price' },
    is: { name: 'Focacciabakki',
          desc: 'Sex focaccia skorin í fernt — reyktur lax, kjúklingur og ofnbakað grænmeti á einum bakka.',
          working: 'sex focaccia á matseðilsverði' },
  },
  {
    id: 'salad',
    photo: 'assets/images/dishes/salad-bowls.jpg',
    parts: [{ n: 9, price: avg(PRICES.caesar, PRICES.quinoa, PRICES.medi) }],
    serves: '9–12',
    pieces: null,
    en: { name: 'Salad table',
          desc: 'Three large bowls — the Caesar, the Quinoa & Beet and the Mediterranean — with serving tongs.',
          working: 'nine menu portions across three bowls' },
    is: { name: 'Salatborð',
          desc: 'Þrjár stórar skálar — Caesar, Kínóa & Rauðrófur og Miðjarðarhafssalat — með framreiðslutöngum.',
          working: 'níu skammtar í þremur skálum' },
  },
  {
    id: 'counter',
    photo: 'assets/images/dishes/salad-greens.jpg',
    parts: [
      { n: 4, price: avg(PRICES.focSalmon, PRICES.focChicken, PRICES.focVeg) },
      { n: 6, price: avg(PRICES.caesar, PRICES.quinoa, PRICES.medi) },
    ],
    serves: '12–16',
    pieces: 16,
    en: { name: 'The whole counter',
          desc: 'Four focaccia quartered and two large salad bowls. What we would bring if you left it to us.',
          working: 'four focaccia plus six salad portions' },
    is: { name: 'Allt borðið',
          desc: 'Fjögur focaccia skorin í fernt og tvær stórar salatskálar. Það sem við myndum koma með ef þú lætur okkur ráða.',
          working: 'fjögur focaccia auk sex salatskammta' },
  },
  {
    id: 'green',
    photo: 'assets/images/dishes/focaccia-plain.jpg',
    parts: [{ n: 6, price: PRICES.focVeg }],
    serves: '8–12',
    pieces: 24,
    en: { name: 'All-green platter',
          desc: 'Six roasted vegetable focaccia, quartered. Vegetarian throughout, no substitutions needed.',
          working: 'six vegetable focaccia at 2.900 kr' },
    is: { name: 'Grænn bakki',
          desc: 'Sex focaccia með ofnbökuðu grænmeti, skorin í fernt. Alveg grænmetisfæði.',
          working: 'sex grænmetisfocaccia á 2.900 kr' },
  },
  {
    id: 'glutenfree',
    photo: null,
    parts: [{ n: 9, price: avg(PRICES.quinoa, PRICES.medi) }],
    serves: '9–12',
    pieces: null,
    en: { name: 'Gluten-free table',
          desc: 'Three large bowls of the two salads that are gluten free as served — Quinoa & Beet and Mediterranean. No bread on the board at all.',
          working: 'nine portions of the two gluten-free salads' },
    is: { name: 'Glútenlaust borð',
          desc: 'Þrjár stórar skálar af þeim tveimur söltum sem eru glútenlaus — Kínóa & Rauðrófur og Miðjarðarhafssalat. Ekkert brauð á borðinu.',
          working: 'níu skammtar af glútenlausu söltunum' },
  },
];

const total = p => p.parts.reduce((sum, part) => sum + part.n * part.price, 0);

/* ------------------------------------------------------------------- i18n */
const T = {
  en: {
    navMenu: 'Menu', navParty: 'Party orders', navOffice: 'Office lunch', navFind: 'Find us',
    back: 'Back to the restaurant',
    eyebrow: 'Veisluþjónusta',
    titleA: 'Is there a party', titleB: 'coming up?',
    lede: 'Salad bowls and focaccia boards for a room full of people, from the same counter and the same kitchen. Tell us the numbers and the date and we will confirm by email.',
    ctaPlatters: 'See the platters', ctaEnquire: 'Send an enquiry',
    plattersEyebrow: 'The platters',
    plattersTitleA: 'Five boards,', plattersTitleB: 'priced from the menu',
    plattersLede: 'Every total below is the menu price multiplied by what goes on the board. Nothing is marked up for being a party — the working is printed on each one.',
    serves: 'Serves', pieces: 'pieces', from: 'from',
    howEyebrow: 'How it works',
    howTitle: 'Three steps, no account',
    s1t: 'Choose the boards', s1d: 'Pick from the five above, or tell us the headcount and let us put it together.',
    s2t: 'Give us two days', s2d: 'Everything is made the morning of your party, so we ask for two working days.',
    s3t: 'We deliver, you host', s3d: 'Delivered around Höfði, Borgartún and Grandi. Boards and tongs come with it.',
    termsEyebrow: 'The practical part',
    termsTitle: 'What we would agree',
    t1t: 'Two working days notice', t1d: 'Sooner if we can — ask, and we will say honestly.',
    t2t: 'Delivery around Reykjavík', t2d: 'Free within the Höfði district on orders of three boards or more.',
    t3t: 'Kennitala invoicing', t3d: 'One invoice to the company rather than a card at the door.',
    t4t: 'Allergies handled first', t4d: 'Tell us on the enquiry and we will build the boards around them, not around the menu.',
    proposal: 'This page is a proposal. Leaf & Loaf has not yet confirmed that it caters, nor the piece counts, notice period or delivery terms above — those are our suggestion, and they are here so there is something concrete to agree or change. The dishes and their prices are real and come straight from the menu.',
    formEyebrow: 'Send an enquiry',
    formTitle: 'Tell us about the party',
    fName: 'Your name', fEmail: 'Email', fPhone: 'Phone', fCompany: 'Company (optional)',
    fDate: 'Date of the party', fGuests: 'How many people', fBoards: 'Which boards',
    fNotes: 'Allergies, timing, anything else',
    fSend: 'Send the enquiry',
    fNote: 'This opens your email app with the details filled in. Nothing is sent from this page.',
    anyBoards: 'Not sure — suggest something',
    estimate: 'Indicative total',
  },
  is: {
    navMenu: 'Matseðill', navParty: 'Veislur', navOffice: 'Hádegismatur', navFind: 'Finndu okkur',
    back: 'Til baka á veitingastaðinn',
    eyebrow: 'Veisluþjónusta',
    titleA: 'Er veisla', titleB: 'framundan?',
    lede: 'Salatskálar og focacciabakkar fyrir fullt hús, úr sama eldhúsi og sama borði. Segðu okkur fjöldann og dagsetninguna og við staðfestum í tölvupósti.',
    ctaPlatters: 'Skoða bakkana', ctaEnquire: 'Senda fyrirspurn',
    plattersEyebrow: 'Bakkarnir',
    plattersTitleA: 'Fimm bakkar,', plattersTitleB: 'verðlagðir af matseðlinum',
    plattersLede: 'Hver upphæð hér að neðan er matseðilsverðið margfaldað með því sem fer á bakkann. Ekkert er hækkað fyrir það eitt að vera veisla — útreikningurinn fylgir hverjum bakka.',
    serves: 'Dugar fyrir', pieces: 'bitar', from: 'frá',
    howEyebrow: 'Hvernig það virkar',
    howTitle: 'Þrjú skref, enginn aðgangur',
    s1t: 'Veldu bakkana', s1d: 'Veldu af þeim fimm hér að ofan, eða segðu okkur fjöldann og láttu okkur um afganginn.',
    s2t: 'Gefðu okkur tvo daga', s2d: 'Allt er útbúið að morgni veisludagsins, því biðjum við um tvo virka daga.',
    s3t: 'Við sendum, þú tekur á móti', s3d: 'Sent um Höfða, Borgartún og Granda. Bakkar og töng fylgja.',
    termsEyebrow: 'Praktíska hliðin',
    termsTitle: 'Það sem við myndum semja um',
    t1t: 'Tveggja virkra daga fyrirvari', t1d: 'Fyrr ef við getum — spurðu og við svörum hreinskilnislega.',
    t2t: 'Sending um Reykjavík', t2d: 'Frítt innan Höfðahverfis fyrir þrjá bakka eða fleiri.',
    t3t: 'Reikningur á kennitölu', t3d: 'Einn reikningur á fyrirtækið í stað korts við dyrnar.',
    t4t: 'Ofnæmi fyrst', t4d: 'Segðu okkur frá því í fyrirspurninni og við byggjum bakkana í kringum það.',
    proposal: 'Þessi síða er tillaga. Leaf & Loaf hefur ekki staðfest veisluþjónustu, né fjölda bita, fyrirvara eða sendingarskilmála hér að ofan — það er okkar tillaga, sett fram svo hægt sé að samþykkja eða breyta. Réttirnir og verðin eru raunveruleg og koma beint af matseðlinum.',
    formEyebrow: 'Senda fyrirspurn',
    formTitle: 'Segðu okkur frá veislunni',
    fName: 'Nafn', fEmail: 'Netfang', fPhone: 'Sími', fCompany: 'Fyrirtæki (valfrjálst)',
    fDate: 'Dagsetning veislunnar', fGuests: 'Fjöldi gesta', fBoards: 'Hvaða bakkar',
    fNotes: 'Ofnæmi, tímasetning, annað',
    fSend: 'Senda fyrirspurn',
    fNote: 'Þetta opnar póstforritið þitt með upplýsingunum. Ekkert er sent frá þessari síðu.',
    anyBoards: 'Ekki viss — stingið upp á einhverju',
    estimate: 'Áætluð upphæð',
  },
};

/* ------------------------------------------------------------------ boot */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const isk = n => LL.isk(n);   // period grouping, see views.js
const esc = s => LL.esc(s);

let lang = 'is';

document.addEventListener('DOMContentLoaded', () => {
  const state = LL.restore();
  lang = state.lang;

  LL.wirePicker($('#viewPick'), $('#viewBtn'), $('#viewMenu'), $('#viewBtnLabel'));

  $('#langBtn').addEventListener('click', () => {
    lang = LL.toggleLang();
    LL.renderPicker($('#viewMenu'), $('#viewBtnLabel'));
    render();
  });

  wireForm();
  render();
  observeReveals();
});

function t() { return T[lang]; }

function render() {
  $('#langBtn').textContent = lang === 'en' ? 'ÍSL' : 'ENG';
  $$('[data-t]').forEach(el => {
    const key = el.dataset.t;
    if (t()[key] !== undefined) el.textContent = t()[key];
  });
  renderPlatters();
  renderBoardOptions();
  updateEstimate();
}

function renderPlatters() {
  const grid = $('#platters');
  grid.innerHTML = '';
  PLATTERS.forEach(p => {
    const c = p[lang];
    const sum = total(p);
    const card = document.createElement('article');
    card.className = 'platter reveal';

    const media = p.photo
      ? `<span class="platter__photo"><img src="${p.photo}" alt="${esc(c.name)}" loading="lazy" /></span>`
      : '<span class="platter__photo platter__photo--none" aria-hidden="true"></span>';

    const meta = [
      `${esc(t().serves)} ${esc(p.serves)}`,
      p.pieces ? `${p.pieces} ${esc(t().pieces)}` : null,
    ].filter(Boolean).join(' · ');

    card.innerHTML = `
      ${media}
      <div class="platter__body">
        <h3 class="platter__name">${esc(c.name)}</h3>
        <p class="platter__meta">${meta}</p>
        <p class="platter__desc">${esc(c.desc)}</p>
        <div class="platter__foot">
          <span class="platter__price">${isk(sum)}<small>ISK</small></span>
          <span class="platter__working">${esc(c.working)}</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  observeReveals();
}

function renderBoardOptions() {
  const sel = $('#fBoards');
  const keep = sel.value;
  sel.innerHTML = `<option value="">${esc(t().anyBoards)}</option>` +
    PLATTERS.map(p => `<option value="${p.id}">${esc(p[lang].name)} — ${isk(total(p))} ISK</option>`).join('');
  if (keep) sel.value = keep;
}

function updateEstimate() {
  const p = PLATTERS.find(x => x.id === $('#fBoards').value);
  const guests = parseInt($('#fGuests').value || '0', 10);
  const out = $('#estimateOut');

  if (!p) { out.textContent = '—'; return; }
  // If a headcount is given, scale to it rather than quoting one board for 40.
  const perBoard = total(p);
  const mid = parseInt(String(p.serves).split('–')[1] || '10', 10);
  const boards = guests > 0 ? Math.max(1, Math.ceil(guests / mid)) : 1;
  out.textContent = `${isk(perBoard * boards)} ISK` + (boards > 1 ? ` (${boards}×)` : '');
}

function wireForm() {
  ['#fBoards', '#fGuests'].forEach(s => {
    $(s).addEventListener('input', updateEstimate);
    $(s).addEventListener('change', updateEstimate);
  });

  $('#partyForm').addEventListener('submit', e => {
    e.preventDefault();
    const val = id => $(id).value.trim();
    const board = PLATTERS.find(x => x.id === $('#fBoards').value);

    const subject = `Veisluþjónusta — ${val('#fDate') || 'date to confirm'} — ${val('#fGuests') || '?'} guests`;
    const body = [
      `Name:     ${val('#fName')}`,
      `Email:    ${val('#fEmail')}`,
      `Phone:    ${val('#fPhone')}`,
      `Company:  ${val('#fCompany')}`,
      '',
      `Date:     ${val('#fDate')}`,
      `Guests:   ${val('#fGuests')}`,
      `Boards:   ${board ? board.en.name : 'suggest something'}`,
      `Estimate: ${$('#estimateOut').textContent}`,
      '',
      'Notes:',
      val('#fNotes'),
      '',
      'Sent from the Leaf & Loaf party order page',
    ].join('\n');

    window.location.href =
      `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

/* Same failsafe as the main page: a reveal that never fires is invisible
   content, which is worse than no animation. */
let revealObserver, revealTimer;
function observeReveals() {
  const all = () => $$('.reveal').forEach(el => el.classList.add('is-in'));
  if (!('IntersectionObserver' in window)) { all(); return; }
  clearTimeout(revealTimer);
  revealTimer = setTimeout(all, 3000);
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  }
  $$('.reveal:not(.is-in)').forEach(el => revealObserver.observe(el));
}

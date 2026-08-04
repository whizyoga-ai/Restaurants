/* ==========================================================================
   Panta — order ahead.

   WHAT THIS IS AND IS NOT.

   It is a real order builder: pick dishes and quantities, choose a collection
   time inside opening hours, see the total with VAT split out, and send the
   order. It is NOT a payment system. Nothing is charged here and no card is
   taken; the order goes to the kitchen by email and is paid for at the counter
   on collection.

   That distinction is stated on the page rather than left for a customer to
   discover after filling in a basket. Taking payment needs the Order-to-Cash
   vertical behind it, which is exactly what the admin console is selling.

   The convention comes from the food hall itself: Tandoori Palace, Beef and
   Buns and Skipperinn each run ordering at <vendor>.is/panta, linked from
   mathollhofda.is. This is the same shape, at the same path.
   ========================================================================== */

'use strict';

const ENQUIRY_EMAIL = 'REPLACE-ME@leafandloaf.is';   // same placeholder as elsewhere

const HOURS = { open: '11:30', close: '21:00' };
const LEAD_MINUTES = 20;      // the kitchen makes everything to order

/* Mirrored from the menu. Ids match app.js so the drawn illustrations line up. */
const ITEMS = [
  { id: 'caesar',           course: 'salads',   price: 3290, photo: '../assets/images/dishes/salad-greens.jpg',
    en: 'Leaf & Loaf Caesar',            is: 'Leaf & Loaf Caesar' },
  { id: 'quinoa-beet',      course: 'salads',   price: 3250, photo: '../assets/images/dishes/salad-bowls.jpg',
    en: 'Quinoa & Beet',                 is: 'Kínóa & Rauðrófur' },
  { id: 'mediterranean',    course: 'salads',   price: 3150, photo: '../assets/images/dishes/salad-table.jpg',
    en: 'Mediterranean',                 is: 'Miðjarðarhafssalat' },
  { id: 'focaccia-salmon',  course: 'focaccia', price: 3200, photo: '../assets/images/dishes/focaccia-salmon.jpg',
    en: 'Smoked Salmon Focaccia',        is: 'Focaccia með reyktum laxi' },
  { id: 'focaccia-chicken', course: 'focaccia', price: 3050, photo: '../assets/images/dishes/focaccia-sandwiches.jpg',
    en: 'Chicken Focaccia',              is: 'Focaccia með kjúklingi' },
  { id: 'focaccia-veg',     course: 'focaccia', price: 2900, photo: '../assets/images/dishes/focaccia-plain.jpg',
    en: 'Roasted Vegetable Focaccia',    is: 'Focaccia með ofnbökuðu grænmeti' },
  /* Drinks carry no price on the menu — they are priced at the counter, so the
     order records the request and the total says so rather than guessing. */
  { id: 'juice',      course: 'drinks', price: null, photo: null, en: 'Fresh Pressed Juice', is: 'Ferskpressaður safi' },
  { id: 'smoothie',   course: 'drinks', price: null, photo: null, en: 'Smoothie',            is: 'Þeytingur' },
  { id: 'coffee-tea', course: 'drinks', price: null, photo: null, en: 'Coffee & Herbal Tea', is: 'Kaffi & jurtate' },
];

const COURSES = [
  { id: 'salads',   en: 'Salads',   is: 'Salöt' },
  { id: 'focaccia', en: 'Focaccia', is: 'Focaccia' },
  { id: 'drinks',   en: 'Drinks',   is: 'Drykkir' },
];

const VAT_RATE = 0.11;   // Iceland's reduced rate on food; menu prices include it

const T = {
  en: {
    navMenu: 'Menu', navOrder: 'Order ahead', navParty: 'Party orders',
    navOffice: 'Office lunch', navReviews: 'Reviews', navFind: 'Find us',
    eyebrow: 'Order ahead',
    titleA: 'Made to order,', titleB: 'ready when you are',
    lede: 'Choose what you want and when you will collect it. We make it fresh so it is ready when you arrive.',
    pickTitle: 'Choose your dishes',
    whenTitle: 'When will you collect it?',
    whenLabel: 'Collection time', today: 'Today',
    yourOrder: 'Your order', emptyOrder: 'Nothing chosen yet.',
    subtotal: 'Total', vatLine: 'of which VAT at 11%', atCounter: 'priced at the counter',
    nameLabel: 'Your name', phoneLabel: 'Phone', notesLabel: 'Anything we should know',
    send: 'Send the order',
    payNote: 'No payment is taken here. You pay at the counter when you collect. Sending opens your email app with the order filled in.',
    toIntegrate: 'To be integrated',
    toIntegrateBody: 'Today this order arrives by email. Once Order-to-Cash is switched on, it goes straight to the kitchen screen, takes card payment, and appears in the daily sales report. No email in the middle.',
    closedNow: 'We are closed now. This order will be for the next opening.',
    hoursNote: 'Collection between 11:30 and 21:00, every day. Give us 20 minutes.',
    remove: 'Remove',
    hallLink: 'See the whole of Mathöll Höfða',
  },
  is: {
    navMenu: 'Matseðill', navOrder: 'Panta', navParty: 'Veislur',
    navOffice: 'Hádegismatur', navReviews: 'Umsagnir', navFind: 'Finndu okkur',
    eyebrow: 'Panta fyrirfram',
    titleA: 'Útbúið eftir pöntun,', titleB: 'tilbúið þegar þú kemur',
    lede: 'Veldu það sem þú vilt og hvenær þú sækir. Við gerum það ferskt svo það sé tilbúið þegar þú kemur.',
    pickTitle: 'Veldu réttina',
    whenTitle: 'Hvenær sækir þú?',
    whenLabel: 'Afhendingartími', today: 'Í dag',
    yourOrder: 'Pöntunin þín', emptyOrder: 'Ekkert valið enn.',
    subtotal: 'Samtals', vatLine: 'þar af VSK 11%', atCounter: 'verð við afgreiðslu',
    nameLabel: 'Nafn', phoneLabel: 'Sími', notesLabel: 'Eitthvað sem við ættum að vita',
    send: 'Senda pöntun',
    payNote: 'Engin greiðsla fer fram hér. Þú greiðir við afgreiðsluborðið þegar þú sækir. Sending opnar póstforritið þitt með pöntuninni.',
    toIntegrate: 'Á eftir að samþætta',
    toIntegrateBody: 'Í dag berst pöntunin í tölvupósti. Þegar Order-to-Cash er virkjað fer hún beint á eldhússkjáinn, tekur við kortagreiðslu og skilar sér í dagsuppgjörið. Enginn tölvupóstur á milli.',
    closedNow: 'Það er lokað núna. Þessi pöntun verður fyrir næstu opnun.',
    hoursNote: 'Afhending milli 11:30 og 21:00, alla daga. Gefðu okkur 20 mínútur.',
    remove: 'Fjarlægja',
    hallLink: 'Sjá alla Mathöll Höfða',
  },
};

/* ------------------------------------------------------------------- state */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const isk = n => LL.isk(n);
const esc = s => LL.esc(s);

let lang = 'is';
const cart = new Map();          // id -> quantity

document.addEventListener('DOMContentLoaded', () => {
  lang = LL.restore().lang;
  LL.wireThemePicker($('#themePick'), $('#themeBtn'), $('#themeMenu'));
  LL.wireNav($('#navToggle'), $('#primaryNav'));

  $('#langBtn').addEventListener('click', () => {
    lang = LL.toggleLang();
    render();
  });

  buildTimes();
  wireForm();
  render();
});

const t = () => T[lang];

/* --------------------------------------------------------- collection times
   Slots every 15 minutes inside opening hours. Iceland keeps UTC year-round,
   so the venue clock can be read straight off UTC and a visitor in another
   timezone still sees Reykjavík times rather than their own. */
function buildTimes() {
  const sel = $('#pickupTime');
  const now = new Date();
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const [oh, om] = HOURS.open.split(':').map(Number);
  const [ch, cm] = HOURS.close.split(':').map(Number);
  const openMin = oh * 60 + om, closeMin = ch * 60 + cm;

  const earliest = Math.max(openMin, nowMin + LEAD_MINUTES);
  const first = Math.ceil(earliest / 15) * 15;

  sel.innerHTML = '';
  for (let m = first; m <= closeMin; m += 15) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const o = document.createElement('option');
    o.value = `${hh}:${mm}`;
    o.textContent = `${hh}:${mm}`;
    sel.appendChild(o);
  }

  // Past closing, or before opening: the slots are for the next opening day.
  $('#closedNote').hidden = !(nowMin >= closeMin || nowMin < openMin);
  if (sel.options.length === 0) {
    for (let m = openMin; m <= closeMin; m += 15) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      sel.insertAdjacentHTML('beforeend', `<option value="${hh}:${mm}">${hh}:${mm}</option>`);
    }
  }
}

/* ------------------------------------------------------------------ render */
function render() {
  $('#langBtn').textContent = lang === 'en' ? 'ÍSL' : 'ENG';
  // Both carry their label in the accessible name only, so they need
  // repainting whenever the language changes.
  LL.renderThemePicker($('#themeBtn'), $('#themeMenu'));
  LL.renderNavToggle($('#navToggle'));
  $$('[data-t]').forEach(el => {
    const k = el.dataset.t;
    if (t()[k] !== undefined) el.textContent = t()[k];
  });
  renderItems();
  renderCart();
}

function renderItems() {
  const root = $('#items');
  root.innerHTML = '';
  COURSES.forEach(course => {
    const list = ITEMS.filter(i => i.course === course.id);
    if (!list.length) return;

    const sec = document.createElement('div');
    sec.className = 'ordercourse';
    sec.innerHTML = `<h3 class="ordercourse__label">${esc(course[lang])}</h3>`;

    list.forEach(item => {
      const qty = cart.get(item.id) || 0;
      const media = item.photo
        ? `<span class="orderitem__pic"><img src="${item.photo}" alt="" loading="lazy" /></span>`
        : `<span class="orderitem__pic orderitem__pic--drawn">${LL_ILLUS.forId(item.id)}</span>`;

      const price = item.price === null
        ? `<span class="orderitem__price orderitem__price--counter">${esc(t().atCounter)}</span>`
        : `<span class="orderitem__price">${isk(item.price)}<small>ISK</small></span>`;

      const row = document.createElement('div');
      row.className = 'orderitem' + (qty ? ' is-chosen' : '');
      row.innerHTML = `
        ${media}
        <span class="orderitem__name">${esc(item[lang])}</span>
        ${price}
        <span class="stepper">
          <button type="button" class="stepper__b" data-dec="${item.id}" aria-label="−">−</button>
          <span class="stepper__n" data-qty="${item.id}">${qty}</span>
          <button type="button" class="stepper__b" data-inc="${item.id}" aria-label="+">+</button>
        </span>`;
      sec.appendChild(row);
    });
    root.appendChild(sec);
  });

  root.querySelectorAll('[data-inc]').forEach(b =>
    b.addEventListener('click', () => bump(b.dataset.inc, +1)));
  root.querySelectorAll('[data-dec]').forEach(b =>
    b.addEventListener('click', () => bump(b.dataset.dec, -1)));
}

function bump(id, delta) {
  const next = Math.max(0, (cart.get(id) || 0) + delta);
  if (next === 0) cart.delete(id); else cart.set(id, next);
  renderItems();
  renderCart();
}

function renderCart() {
  const box = $('#cartLines');
  const chosen = ITEMS.filter(i => cart.has(i.id));

  if (!chosen.length) {
    box.innerHTML = `<p class="cart__empty">${esc(t().emptyOrder)}</p>`;
    $('#cartTotal').textContent = '—';
    $('#cartVat').textContent = '';
    $('#sendOrder').disabled = true;
    return;
  }

  box.innerHTML = chosen.map(i => {
    const q = cart.get(i.id);
    const line = i.price === null ? esc(t().atCounter) : `${isk(i.price * q)} ISK`;
    return `<div class="cart__line">
              <span class="cart__q">${q}×</span>
              <span class="cart__name">${esc(i[lang])}</span>
              <span class="cart__amt">${line}</span>
            </div>`;
  }).join('');

  const priced = chosen.filter(i => i.price !== null);
  const sum = priced.reduce((a, i) => a + i.price * cart.get(i.id), 0);
  const unpriced = chosen.length - priced.length;

  $('#cartTotal').textContent = `${isk(sum)} ISK`;
  $('#cartVat').textContent =
    `${esc(t().vatLine)} ${isk(sum - Math.round(sum / (1 + VAT_RATE)))} ISK` +
    (unpriced ? ` · ${unpriced} × ${t().atCounter}` : '');
  $('#sendOrder').disabled = false;
}

/* -------------------------------------------------------------------- send */
function wireForm() {
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const chosen = ITEMS.filter(i => cart.has(i.id));
    if (!chosen.length) return;

    const lines = chosen.map(i => {
      const q = cart.get(i.id);
      const amt = i.price === null ? '(priced at the counter)' : `${isk(i.price * q)} ISK`;
      return `  ${q} x ${i.en}  ${amt}`;
    });

    const body = [
      `Collection: ${$('#pickupTime').value} today`,
      `Name:       ${$('#custName').value}`,
      `Phone:      ${$('#custPhone').value}`,
      '',
      'Order:',
      ...lines,
      '',
      `Total: ${$('#cartTotal').textContent}  (paid at the counter)`,
      '',
      'Notes:',
      $('#custNotes').value || '—',
      '',
      'Sent from the Leaf & Loaf order-ahead page. No payment was taken.',
    ].join('\n');

    window.location.href =
      `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent('Pöntun / Order — ' + $('#pickupTime').value)}` +
      `&body=${encodeURIComponent(body)}`;
  });
}

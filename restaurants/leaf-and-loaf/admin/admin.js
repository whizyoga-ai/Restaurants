/* ==========================================================================
   Leaf & Loaf — admin console (demonstration build)

   Design principle: everything here is REAL except the purchase gate.

   The nutrition engine actually computes from an ingredient table. The REACH
   composer actually writes a caption from the dish you picked. The SEO panel
   actually fetches the live page and reads its structured data. Only the final
   commit — run the workflow, publish the campaign — is locked.

   A mockup that only pretends to work sells nothing, because the person being
   sold to can tell. Something that visibly works right up to the checkout is a
   different conversation.
   ========================================================================== */

'use strict';

/* ------------------------------------------------------------------ gate
   READ THIS BEFORE REUSING ANY OF IT.

   This is a preview gate, not authentication. The page is static, served from
   GitHub Pages, and everything below ships to the browser — so anyone who
   opens devtools can read the check and walk straight past it. Hashing the
   passwords keeps them out of plain sight in view-source; it does not make
   this secure, and nothing behind it is secret.

   Real per-customer auth exists: services/customer-portal in
   Brahmando-ai/Brahmando — argon2, server-side revocable sessions, CSRF,
   throttling, audit. Point this at that before any real customer data.
   ---------------------------------------------------------------------- */
const GATE = [
  // sha256("yoga:yoga")
  { user: 'yoga', hash: 'b19af02aec5f35152e22c0bcc9bbb73cce5f59cd8f472752976807ee97358f6d' },
  // sha256("Leaf:Loaf@324")
  { user: 'Leaf', hash: 'f5ad495168f1aa2cb7a2e6310ad3ff990f6b26bdde6451b3be295a715aa7e9c8' },
];

/* SHA-256 in plain JavaScript.
 *
 * This used to call crypto.subtle.digest, which broke login on the live site
 * while working perfectly in local testing. crypto.subtle only exists in a
 * SECURE CONTEXT — https, or localhost. manailab.com is served over plain http
 * until the certificate finishes issuing, so on the real site crypto.subtle was
 * undefined, sha256() threw, the submit handler rejected, and the form did
 * nothing at all. localhost is a secure context by definition, which is exactly
 * why local testing could never have caught it.
 *
 * Doing the digest here removes the dependency on how the page is served. */
const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(text) {
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const bytes = new TextEncoder().encode(text);
  const len = bytes.length;

  // message + 0x80 + zero padding + 64-bit big-endian bit length
  const padded = new Uint8Array((((len + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLen = len * 8;
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLen >>> 0, false);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }

  return h.map(x => x.toString(16).padStart(8, '0')).join('');
}

/* ------------------------------------------------------------- nutrition
   Per 100 g, from public composition tables. These are reference values for
   generic ingredients, not measurements of this kitchen's recipes — which is
   exactly what the customer-facing site says about its own figures, and the
   panel below repeats it rather than quietly dropping the caveat.        */
const NUTRIENTS = {
  // protein
  chicken:      { kcal: 165, p: 31,   c: 0,    f: 3.6,  tags: [] },
  bacon:        { kcal: 541, p: 37,   c: 1.4,  f: 42,   tags: [] },
  salmon:       { kcal: 208, p: 20,   c: 0,    f: 13,   tags: ['fish'] },
  shrimp:       { kcal: 99,  p: 24,   c: 0.2,  f: 0.3,  tags: ['shellfish'] },
  egg:          { kcal: 155, p: 13,   c: 1.1,  f: 11,   tags: ['egg'] },
  // dairy
  feta:         { kcal: 264, p: 14,   c: 4.1,  f: 21,   tags: ['dairy'] },
  parmesan:     { kcal: 431, p: 38,   c: 4.1,  f: 29,   tags: ['dairy'] },
  burrata:      { kcal: 330, p: 17,   c: 2,    f: 28,   tags: ['dairy'] },
  skyr:         { kcal: 63,  p: 11,   c: 4,    f: 0.2,  tags: ['dairy'] },
  // grain
  focaccia:     { kcal: 271, p: 8,    c: 44,   f: 7,    tags: ['gluten'] },
  croutons:     { kcal: 407, p: 11,   c: 66,   f: 11,   tags: ['gluten'] },
  quinoa:       { kcal: 120, p: 4.4,  c: 21,   f: 1.9,  tags: [] },
  rye:          { kcal: 259, p: 8.5,  c: 48,   f: 3.3,  tags: ['gluten'] },
  // veg & fruit
  beetroot:     { kcal: 43,  p: 1.6,  c: 10,   f: 0.2,  tags: [] },
  tomato:       { kcal: 18,  p: 0.9,  c: 3.9,  f: 0.2,  tags: [] },
  cucumber:     { kcal: 15,  p: 0.7,  c: 3.6,  f: 0.1,  tags: [] },
  spinach:      { kcal: 23,  p: 2.9,  c: 3.6,  f: 0.4,  tags: [] },
  lettuce:      { kcal: 14,  p: 0.9,  c: 3,    f: 0.1,  tags: [] },
  greens:       { kcal: 20,  p: 2,    c: 3.5,  f: 0.3,  tags: [] },
  pepper:       { kcal: 31,  p: 1,    c: 6,    f: 0.3,  tags: [] },
  olives:       { kcal: 115, p: 0.8,  c: 6,    f: 11,   tags: [] },
  avocado:      { kcal: 160, p: 2,    c: 9,    f: 15,   tags: [] },
  // fats, nuts, dressing
  'olive oil':  { kcal: 884, p: 0,    c: 0,    f: 100,  tags: [] },
  pistachios:   { kcal: 562, p: 20,   c: 28,   f: 45,   tags: ['nuts'] },
  walnuts:      { kcal: 654, p: 15,   c: 14,   f: 65,   tags: ['nuts'] },
  'caesar dressing': { kcal: 340, p: 2, c: 4,  f: 35,   tags: ['dairy', 'egg', 'fish'] },
  vinaigrette:  { kcal: 290, p: 0.2,  c: 4,    f: 30,   tags: [] },
  lemon:        { kcal: 29,  p: 1.1,  c: 9,    f: 0.3,  tags: [] },
};

/* Words that mean the same ingredient. Keeps the estimator useful when
   somebody types "rocket" or "kjúklingur" instead of the table key. */
const ALIASES = {
  'iceberg': 'lettuce', 'rocket': 'greens', 'arugula': 'greens', 'mixed greens': 'greens',
  'kjuklingur': 'chicken', 'kjúklingur': 'chicken', 'lax': 'salmon', 'raekjur': 'shrimp',
  'rækjur': 'shrimp', 'beets': 'beetroot', 'beet': 'beetroot', 'roasted beets': 'beetroot',
  'red peppers': 'pepper', 'roasted red peppers': 'pepper', 'bread croutons': 'croutons',
  'parmesan cheese': 'parmesan', 'feta cheese': 'feta', 'tomatoes': 'tomato',
  'cucumbers': 'cucumber', 'brauð': 'focaccia', 'bread': 'focaccia',
};

const ALLERGEN_LABEL = {
  gluten: 'Contains gluten', dairy: 'Contains dairy', nuts: 'Contains nuts',
  fish: 'Contains fish', egg: 'Contains egg', shellfish: 'Contains shellfish',
};

function lookup(name) {
  const key = name.trim().toLowerCase();
  if (NUTRIENTS[key]) return { key, ...NUTRIENTS[key] };
  if (ALIASES[key] && NUTRIENTS[ALIASES[key]]) return { key: ALIASES[key], ...NUTRIENTS[ALIASES[key]] };
  // last resort: substring match, so "wild arctic shrimp" still finds shrimp
  const hit = Object.keys(NUTRIENTS).find(k => key.includes(k));
  return hit ? { key: hit, ...NUTRIENTS[hit] } : null;
}

/**
 * Estimate a dish from lines of "ingredient, grams".
 * Returns totals plus which lines could not be matched — showing the misses is
 * the difference between a tool you can trust and one that quietly guesses.
 */
function estimate(lines) {
  const total = { kcal: 0, p: 0, c: 0, f: 0 };
  const allergens = new Set();
  const matched = [];
  const unmatched = [];

  lines.forEach(raw => {
    const line = raw.trim();
    if (!line) return;
    const m = line.match(/^(.*?)[,:]\s*(\d+(?:\.\d+)?)\s*g?$/i);
    const name = m ? m[1] : line;
    const grams = m ? parseFloat(m[2]) : 100;

    const found = lookup(name);
    if (!found) { unmatched.push(line); return; }

    const factor = grams / 100;
    total.kcal += found.kcal * factor;
    total.p += found.p * factor;
    total.c += found.c * factor;
    total.f += found.f * factor;
    found.tags.forEach(t => allergens.add(t));
    matched.push({ name: name.trim(), key: found.key, grams });
  });

  return {
    kcal: Math.round(total.kcal),
    protein: Math.round(total.p),
    carbs: Math.round(total.c),
    fat: Math.round(total.f),
    allergens: [...allergens],
    matched,
    unmatched,
  };
}

/* --------------------------------------------------------------- storage */
/* v2: the seed gained photos and two more dishes. The key is versioned because
   loadMenu() prefers whatever is in localStorage, so anyone who had opened the
   console before would otherwise keep a photoless four-dish menu forever and
   never see the change. */
const STORE_KEY = 'll-admin-menu-v2';

/* Photos are the same crops the public site uses, one directory up. */
const SEED = [
  { id: 'caesar', name: 'Leaf & Loaf Caesar', course: 'Salads', price: 3290,
    photo: '../assets/images/dishes/salad-greens.jpg',
    recipe: 'chicken, 120\nlettuce, 80\nspinach, 40\nbacon, 25\ncroutons, 30\nparmesan, 20\ncaesar dressing, 30' },
  { id: 'quinoa', name: 'Quinoa & Beet', course: 'Salads', price: 3250,
    photo: '../assets/images/dishes/salad-bowls.jpg',
    recipe: 'beetroot, 120\nquinoa, 90\ngreens, 60\nfeta, 45\npistachios, 20\nvinaigrette, 25' },
  { id: 'medi', name: 'Mediterranean', course: 'Salads', price: 3150,
    recipe: 'tomato, 140\ncucumber, 100\nolives, 40\nfeta, 50\npepper, 70\nolive oil, 15' },
  { id: 'foc-salmon', name: 'Smoked Salmon Focaccia', course: 'Focaccia', price: 3200,
    photo: '../assets/images/dishes/focaccia-salmon.jpg',
    recipe: 'focaccia, 140\nsalmon, 70\ngreens, 30\nlemon, 10' },
  { id: 'foc-chicken', name: 'Chicken Focaccia', course: 'Focaccia', price: 3050,
    photo: '../assets/images/dishes/focaccia-sandwiches.jpg',
    recipe: 'focaccia, 140\nchicken, 90\ngreens, 30\nolive oil, 8' },
  { id: 'foc-veg', name: 'Roasted Vegetable Focaccia', course: 'Focaccia', price: 2900,
    photo: '../assets/images/dishes/focaccia-plain.jpg',
    recipe: 'focaccia, 145\npepper, 80\ncucumber, 40\ngreens, 30\nolive oil, 12' },
];

function loadMenu() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* corrupt or blocked storage — fall through to the seed */ }
  return structuredClone(SEED);
}

function saveMenu(items) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); return true; }
  catch (_) { return false; }   // quota, or storage disabled — caller warns
}

/* ------------------------------------------------------------------ VAT
   Iceland charges the reduced 11% rate on food. Menu prices in Iceland are
   quoted inclusive, so the useful direction is price -> net, not net -> price. */
const VAT_RATE = 0.11;
const netOf = gross => Math.round(gross / (1 + VAT_RATE));
const vatOf = gross => gross - netOf(gross);

/* ------------------------------------------------------------------ boot */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const isk = n => Number(n).toLocaleString('is-IS');

let MENU = [];
let selectedId = null;

document.addEventListener('DOMContentLoaded', () => {
  wireGate();
  if (sessionStorage.getItem('ll-admin-in') === '1') enterConsole();
});

function wireGate() {
  const form = $('#gateForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#gateErr');

    // Anything thrown in here used to vanish and leave the button doing
    // nothing, which is indistinguishable from a wrong password. Say what
    // happened instead.
    try {
      const u = $('#gu').value.trim();
      const p = $('#gp').value;
      const digest = sha256(`${u}:${p}`);
      const ok = GATE.some(g => g.user === u && g.hash === digest);

      if (!ok) {
        err.textContent = 'That username and password did not match.';
        err.hidden = false;
        $('#gp').value = '';
        return;
      }
      sessionStorage.setItem('ll-admin-in', '1');
      sessionStorage.setItem('ll-admin-user', u);
      enterConsole();
    } catch (ex) {
      err.textContent = `Sign-in failed: ${ex && ex.message ? ex.message : ex}`;
      err.hidden = false;
    }
  });

  $('#signOut').addEventListener('click', () => {
    sessionStorage.removeItem('ll-admin-in');
    location.reload();
  });
}

function enterConsole() {
  $('#gate').hidden = true;
  $('#console').hidden = false;
  $('#whoami').textContent = sessionStorage.getItem('ll-admin-user') || 'admin';

  MENU = loadMenu();
  renderList();
  select(MENU[0]?.id);
  wireEditor();
  wireTabs();
  wireLocks();
  wireReach();
  wireFlows();
  loadSeoPanel();
}

/* ------------------------------------------------------------------ tabs */
function wireTabs() {
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.setAttribute('aria-selected', String(x === t)));
    $$('.panel').forEach(p => { p.hidden = p.id !== t.dataset.panel; });

    // Start a flow the first time its tab is opened, never before — an SVG
    // animating inside a hidden panel is wasted, and getTotalLength on a
    // display:none path returns 0, which would put every packet at the origin.
    if (t.dataset.panel === 'p-flow') flows.o2c?.play();
    if (t.dataset.panel === 'p-reach') flows.reach?.play();
  }));
}

/* --------------------------------------------------------------- workflows */
const flows = {};

function wireFlows() {
  if (!window.FLOWS) return;
  const { FLOW_REACH, FLOW_O2C, mountFlow } = window.FLOWS;
  flows.reach = mountFlow('#flowReach', '#logReach', '#runReach', FLOW_REACH);
  flows.o2c = mountFlow('#flowO2C', '#logO2C', '#runO2C', FLOW_O2C);
}

/* ------------------------------------------------------------- menu studio */
function renderList() {
  const list = $('#dishList');
  list.innerHTML = '';
  MENU.forEach(d => {
    const b = document.createElement('button');
    b.className = 'dishitem' + (d.id === selectedId ? ' is-on' : '');
    b.type = 'button';
    b.innerHTML =
      `<span class="dishitem__thumb">${d.photo ? `<img src="${d.photo}" alt="">` : '<span></span>'}</span>` +
      `<span class="dishitem__txt"><b>${escapeHtml(d.name)}</b><span>${escapeHtml(d.course)} · ${isk(d.price)} ISK</span></span>`;
    b.addEventListener('click', () => select(d.id));
    list.appendChild(b);
  });
}

function select(id) {
  selectedId = id;
  const d = MENU.find(x => x.id === id);
  renderList();
  if (!d) { $('#editor').hidden = true; return; }
  $('#editor').hidden = false;

  $('#fName').value = d.name;
  $('#fCourse').value = d.course;
  $('#fPrice').value = d.price;
  $('#fRecipe').value = d.recipe || '';
  $('#photoPreview').innerHTML = d.photo ? `<img src="${d.photo}" alt="">` : '<span class="ph">No photo yet</span>';

  recalc();
}

function wireEditor() {
  ['#fName', '#fCourse', '#fPrice', '#fRecipe'].forEach(sel =>
    $(sel).addEventListener('input', () => { commit(); recalc(); }));

  $('#fPhoto').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('That file is not an image.'); return; }
    // 2 MB, because these are base64'd into localStorage and the quota is ~5 MB
    // for the whole origin — a couple of phone photos would blow it silently.
    if (file.size > 2 * 1024 * 1024) { toast('Keep photos under 2 MB for this demo.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const d = MENU.find(x => x.id === selectedId);
      d.photo = reader.result;
      if (!saveMenu(MENU)) toast('Photo too large to store locally — not saved.');
      $('#photoPreview').innerHTML = `<img src="${reader.result}" alt="">`;
      renderList();
      syncReach();          // the new picture shows up in the REACH mock-up too
    };
    reader.readAsDataURL(file);
  });

  $('#addDish').addEventListener('click', () => {
    const id = 'd' + Date.now().toString(36);
    MENU.push({ id, name: 'New dish', course: 'Salads', price: 2900, recipe: '' });
    saveMenu(MENU);
    select(id);
    $('#fName').select();
  });

  $('#delDish').addEventListener('click', () => {
    if (!selectedId || MENU.length <= 1) { toast('Keep at least one dish.'); return; }
    MENU = MENU.filter(d => d.id !== selectedId);
    saveMenu(MENU);
    select(MENU[0].id);
  });

  $('#resetMenu').addEventListener('click', () => {
    MENU = structuredClone(SEED);
    saveMenu(MENU);
    select(MENU[0].id);
    toast('Menu reset to the published one.');
  });
}

function commit() {
  const d = MENU.find(x => x.id === selectedId);
  if (!d) return;
  d.name = $('#fName').value;
  d.course = $('#fCourse').value;
  d.price = Math.max(0, parseInt($('#fPrice').value || '0', 10));
  d.recipe = $('#fRecipe').value;
  saveMenu(MENU);
  renderList();
  syncReach();
}

/**
 * Push Menu studio edits into the REACH panel.
 *
 * The campaign copy is generated from the dish's name, price and computed
 * nutrition, so an edit here should be visible there — otherwise the claim
 * that REACH writes from your own menu is only true until you touch it.
 * Selection is preserved across the rebuild so the option list can change
 * (rename, add, delete) without the preview jumping to another dish.
 */
function syncReach() {
  const sel = $('#reachDish');
  if (!sel) return;                        // REACH not wired yet during boot
  const keep = sel.value;
  populateReachDishes();
  if (MENU.some(d => d.id === keep)) sel.value = keep;
  renderCampaign();
}

function recalc() {
  const d = MENU.find(x => x.id === selectedId);
  if (!d) return;

  const n = estimate((d.recipe || '').split('\n'));

  $('#nKcal').textContent = n.kcal;
  $('#nP').textContent = n.protein;
  $('#nC').textContent = n.carbs;
  $('#nF').textContent = n.fat;

  // macro split bar — shows at a glance whether a dish is fat- or carb-led
  const kP = n.protein * 4, kC = n.carbs * 4, kF = n.fat * 9;
  const sum = kP + kC + kF || 1;
  $('#barP').style.width = `${(kP / sum) * 100}%`;
  $('#barC').style.width = `${(kC / sum) * 100}%`;
  $('#barF').style.width = `${(kF / sum) * 100}%`;

  const tags = $('#allergenTags');
  tags.innerHTML = n.allergens.length
    ? n.allergens.map(a => `<span class="tag tag--warn">${ALLERGEN_LABEL[a] || a}</span>`).join('')
    : '<span class="tag">No listed allergens detected</span>';

  const miss = $('#unmatched');
  if (n.unmatched.length) {
    miss.hidden = false;
    miss.innerHTML = `<b>Not in the ingredient table:</b> ${n.unmatched.map(escapeHtml).join(', ')}. ` +
      `These contribute nothing to the figures above.`;
  } else {
    miss.hidden = true;
  }

  $('#vatGross').textContent = `${isk(d.price)} ISK`;
  $('#vatNet').textContent = `${isk(netOf(d.price))} ISK`;
  $('#vatAmt').textContent = `${isk(vatOf(d.price))} ISK`;
}

/* ------------------------------------------------------------------ REACH */
function wireReach() {
  $('#reachDish').addEventListener('change', renderCampaign);
  $('#reachTone').addEventListener('change', renderCampaign);
  populateReachDishes();
  renderCampaign();
}

function populateReachDishes() {
  const sel = $('#reachDish');
  sel.innerHTML = MENU.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
}

/* Writes a real caption from the real dish. Nothing here is a placeholder —
   which is the point: the customer sees their own menu turned into copy. */
function renderCampaign() {
  const d = MENU.find(x => x.id === $('#reachDish').value) || MENU[0];
  if (!d) return;
  const n = estimate((d.recipe || '').split('\n'));
  const tone = $('#reachTone').value;

  const openers = {
    warm: [`Today at the counter: ${d.name}.`, `Made to order, all day.`],
    brisk: [`${d.name}. ${isk(d.price)} ISK.`, `In and out in ten minutes.`],
    proud: [`${d.name} — built the way we would eat it ourselves.`, ''],
  }[tone];

  const macro = n.kcal ? `About ${n.kcal} kcal, ${n.protein} g protein.` : '';
  const where = 'Mathöll Höfða, Bíldshöfða 9 · 11:30–21:00 daily.';

  const caption = [openers[0], openers[1], macro, where].filter(Boolean).join('\n');
  const tags = ['#Reykjavík', '#MathöllHöfða', '#LeafAndLoaf',
    n.allergens.includes('gluten') ? '' : '#GlutenFree',
    d.course === 'Salads' ? '#SaladBowl' : '#Focaccia'].filter(Boolean).join(' ');

  /* The post carries the dish's own photo — including one uploaded a minute
     ago in the Menu studio, since both read the same record. Seeing your own
     picture in the mock-up is most of what sells this panel. */
  const img = $('#reachImg');
  if (d.photo) {
    img.innerHTML = `<img src="${escapeHtml(d.photo)}" alt="${escapeHtml(d.name)}" />`;
  } else {
    img.innerHTML = '<span>No photo on this dish yet — add one in the Menu studio</span>';
  }

  $('#reachPreview').textContent = `${caption}\n\n${tags}`;
  $('#reachMeta').textContent =
    `${caption.length + tags.length + 2} characters · fits Instagram, Facebook and a Google Business post`;
}

/* ------------------------------------------------------------------ locks */
function wireLocks() {
  $$('[data-lock]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    openLock(el.dataset.lock, el.dataset.lockNote || '');
  }));
  $('#lockClose').addEventListener('click', () => $('#lockModal').close());
  $('#lockModal').addEventListener('click', e => { if (e.target.id === 'lockModal') $('#lockModal').close(); });
}

const LOCK_COPY = {
  'order-to-cash': {
    title: 'Restaurant Order-to-Cash',
    blurb: 'The full flow — counter order, kitchen ticket, payment, daily close and kennitala invoicing for office accounts — running on your own Brahmexa workspace.',
    bullets: ['Orders, tickets and payments in one chain', 'Monthly invoicing for company accounts',
              'Daily close and takings, without a spreadsheet', 'Runs on the same workflows shown here'],
    href: 'https://saas.brahmexa.com/smb/restaurant/',
  },
  reach: {
    title: 'REACH — digital marketing',
    blurb: 'The caption you just watched write itself, scheduled and posted across your channels, with the results coming back to one place.',
    bullets: ['Brief to post, from your own menu', 'Instagram, Facebook and Google Business',
              'A campaign calendar instead of a reminder', 'Reuses the dish photos you already uploaded'],
    href: 'https://saas.brahmexa.com/reach/',
  },
  orbit: {
    title: 'ORBIT — hosting and search',
    blurb: 'Hosting that keeps the structured data on this page correct as the menu changes, so search engines keep showing the right prices and hours.',
    bullets: ['Menu and hours published as structured data', 'Rich results in Google, not a plain blue link',
              'Prices update in search when you update them here', 'Events and ticketing when you want them'],
    href: 'https://orbit.brahmexa.com/',
  },
};

/* Exposed so workflow.js can open it when a node on the canvas is clicked. */
window.openLock = openLock;

function openLock(kind, note) {
  const c = LOCK_COPY[kind];
  if (!c) return;
  $('#lockTitle').textContent = c.title;
  $('#lockBlurb').textContent = note || c.blurb;
  $('#lockList').innerHTML = c.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('');
  $('#lockLink').href = c.href;
  $('#lockModal').showModal();
}

/* -------------------------------------------------------------- ORBIT / SEO
   Reads the ACTUAL published page rather than describing it. If the JSON-LD
   ever breaks, this panel says so instead of continuing to claim it is fine. */
async function loadSeoPanel() {
  const out = $('#seoFindings');
  try {
    const res = await fetch('../index.html', { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const findings = [];

    const ld = doc.querySelector('script[type="application/ld+json"]');
    if (ld) {
      const data = JSON.parse(ld.textContent);
      findings.push(['ok', 'Structured data present',
        `Schema.org ${data['@type']} — name, address, opening hours and price range are machine-readable.`]);
      if (data.address) findings.push(['ok', 'Address is structured',
        `${data.address.streetAddress}, ${data.address.postalCode} ${data.address.addressLocality} — eligible for map and local results.`]);
      if (data.openingHoursSpecification) findings.push(['ok', 'Opening hours are structured',
        `${data.openingHoursSpecification[0].opens}–${data.openingHoursSpecification[0].closes}, seven days — Google can show "Open now".`]);
      if (!data.telephone) findings.push(['gap', 'No telephone in the schema',
        'Local results favour a callable number. Nothing to add until the client confirms one.']);
      if (!data.menu) findings.push(['gap', 'Menu is not yet published as data',
        'The menu exists as HTML but not as a schema.org Menu, so search engines cannot show dishes and prices directly. This is what ORBIT adds.']);
    } else {
      findings.push(['bad', 'No structured data found', 'Search engines see a plain page.']);
    }

    const title = doc.querySelector('title')?.textContent || '';
    findings.push([title.length > 15 && title.length <= 65 ? 'ok' : 'gap', 'Title tag',
      `${title.length} characters — ${title.length > 65 ? 'Google will truncate it.' : 'within the length Google shows in full.'}`]);

    const desc = doc.querySelector('meta[name="description"]')?.content || '';
    findings.push([desc.length > 70 && desc.length <= 160 ? 'ok' : 'gap', 'Meta description',
      `${desc.length} characters — ${desc.length > 160 ? 'will be cut off.' : 'a usable length.'}`]);

    findings.push([doc.querySelector('link[rel="canonical"]') ? 'ok' : 'gap', 'Canonical URL',
      doc.querySelector('link[rel="canonical"]') ? 'Set, so the two hostnames will not compete with each other.' : 'Missing.']);

    findings.push([doc.querySelector('meta[property="og:image"]') ? 'ok' : 'gap', 'Social preview',
      doc.querySelector('meta[property="og:image"]') ? 'Open Graph image set — shared links show a photo, not a bare URL.' : 'Missing.']);

    out.innerHTML = findings.map(([state, label, detail]) =>
      `<li class="finding finding--${state}">
         <span class="finding__dot"></span>
         <span><b>${escapeHtml(label)}</b><span>${escapeHtml(detail)}</span></span>
       </li>`).join('');

    const good = findings.filter(f => f[0] === 'ok').length;
    $('#seoScore').textContent = `${good} / ${findings.length}`;
    $('#seoNote').textContent =
      'Read live from the published page just now — not a stored report.';
  } catch (err) {
    out.innerHTML = `<li class="finding finding--bad"><span class="finding__dot"></span>
      <span><b>Could not read the published page</b><span>${escapeHtml(String(err))}</span></span></li>`;
    $('#seoScore').textContent = '—';
  }
}

/* ----------------------------------------------------------------- helpers */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-up');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-up'), 3800);
}

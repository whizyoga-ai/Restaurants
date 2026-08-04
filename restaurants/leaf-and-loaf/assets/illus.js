/* ==========================================================================
   Drawn illustrations for the items that have no photograph.

   There is no juice, smoothie or coffee shot anywhere in the house set, and a
   picture of a water carafe captioned "Fresh Pressed Juice" would be a small
   lie. The first attempt filled those slots with one generic leaf glyph, which
   was worse than nothing: identical across three different drinks, so the tiles
   read as a failed load rather than a choice.

   These are drawn per item instead — a tall glass with a citrus wheel, a
   smoothie with berries, a cup with steam, a bowl with a struck-through wheat
   ear. Line art in the same weight as the L&L mark.

   They are inserted as inline <svg>, not as background-image, specifically so
   `stroke="currentColor"` resolves against the theme. A data-URI background
   cannot inherit colour, which is why the aurora view would otherwise show a
   moss-green drawing on a midnight card.
   ========================================================================== */

'use strict';

window.LL_ILLUS = (function () {

  const wrap = inner =>
    `<svg class="illus" viewBox="0 0 120 120" fill="none" aria-hidden="true"
          stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const ART = {

    /* Tall tumbler, pressed juice sitting below the rim, a wheel of citrus on
       the lip and a straw leaning out of it. */
    juice: wrap(`
      <path d="M42 26 h36 l-5 68 a7 7 0 0 1-7 6 h-12 a7 7 0 0 1-7-6z"/>
      <path d="M45 48 q15 5 30 0" stroke-width="2"/>
      <path d="M74 14 q3 4-2 10 l-8 22" stroke-width="2"/>
      <circle cx="84" cy="34" r="11"/>
      <path d="M84 23 v22 M73 34 h22 M76.5 26.5 l15 15 M91.5 26.5 l-15 15" stroke-width="1.4"/>
      <path d="M52 62 q4 6 0 12 M62 66 q4 6 0 12" stroke-width="1.6" opacity=".6"/>`),

    /* Rounded-bottom glass, a swirl through the middle, berries heaped on top
       and a sprig of mint. */
    smoothie: wrap(`
      <path d="M40 40 h40 v30 a20 20 0 0 1-40 0z"/>
      <path d="M40 40 q20 -7 40 0" stroke-width="2"/>
      <circle cx="52" cy="33" r="6.5"/>
      <circle cx="64" cy="29" r="7.5"/>
      <circle cx="75" cy="34" r="6"/>
      <path d="M69 20 q7-6 12-3 q-3 8-12 3z" stroke-width="2"/>
      <path d="M46 56 q14 8 28 0" stroke-width="1.8" opacity=".65"/>
      <path d="M48 68 q14 8 26 0" stroke-width="1.8" opacity=".45"/>`),

    /* Cup and saucer with two curls of steam. */
    coffee: wrap(`
      <path d="M34 50 h44 v22 a22 22 0 0 1-44 0z"/>
      <path d="M78 55 a13 13 0 0 1 0 16" />
      <path d="M26 96 h68" />
      <path d="M40 88 h34" stroke-width="1.8" opacity=".5"/>
      <path d="M50 36 q-5-7 0-13 q5-6 0-11" stroke-width="2" opacity=".75"/>
      <path d="M64 36 q-5-7 0-13 q5-6 0-11" stroke-width="2" opacity=".55"/>`),

    /* A bowl of leaves beside a wheat ear struck through — the plainest way to
       say "this one has no bread in it". */
    glutenfree: wrap(`
      <path d="M22 62 h50 a25 25 0 0 1-50 0z"/>
      <path d="M22 62 q25-8 50 0" stroke-width="2"/>
      <path d="M38 54 q-4-12 6-18 q7 8 1 18" stroke-width="2"/>
      <path d="M55 55 q6-10 15-9 q-2 9-15 9z" stroke-width="2"/>
      <path d="M96 30 v42" stroke-width="2"/>
      <path d="M96 38 q-8-4-9-11 q8 1 9 8 M96 38 q8-4 9-11 q-8 1-9 8" stroke-width="1.8"/>
      <path d="M96 52 q-8-4-9-11 q8 1 9 8 M96 52 q8-4 9-11 q-8 1-9 8" stroke-width="1.8"/>
      <path d="M82 20 l30 60" stroke-width="2.8"/>`),

    /* Fallback: the house leaf, for anything not drawn yet. */
    leaf: wrap(`
      <path d="M60 18 q26 18 26 40 q0 24-26 42 q-26-18-26-42 q0-22 26-40z"/>
      <path d="M60 28 v62" stroke-width="2"/>
      <path d="M60 46 l13-8 M60 62 l15-9 M60 46 l-13-8 M60 62 l-15-9" stroke-width="1.8"/>`),
  };

  /* Which drawing belongs to which item. Keyed on the ids used by the menu and
     by the party platters, so both pages ask the same question. */
  const BY_ID = {
    juice: 'juice',
    smoothie: 'smoothie',
    'coffee-tea': 'coffee',
    glutenfree: 'glutenfree',
  };

  function forId(id) {
    return ART[BY_ID[id] || 'leaf'] || ART.leaf;
  }

  return { forId, ART };
})();

# Restaurants

Restaurant sites built by Brahmexa, served from **manailab.com** via GitHub Pages.

```
/                                 manailab.com landing
                                  → Leaf & Loaf circle, then the Brahmexa SMB
                                    offering in a borderless iframe
/restaurants/leaf-and-loaf/       Leaf & Loaf — Mathöll Höfða, Reykjavík
/knowledge/leaf-and-loaf/         Knowledge pack for the site's AI assistant
/docs/DEPLOY.md                   Hosting, DNS and chatbot provisioning
```

## Leaf & Loaf

A salad and focaccia counter inside **Mathöll Höfða**, Bíldshöfða 9,
110 Reykjavík — open daily 11:30–21:00.

Static, no build step. Open `restaurants/leaf-and-loaf/index.html` over any
local HTTP server and it runs.

| | |
|---|---|
| Design | One layout, four themes, chosen from the swatch button in the header. |
| Languages | English and Icelandic, switched client-side, remembered in `localStorage`. |
| Menu | Photo-led card grid. Each dish expands to ingredients and an estimated nutrition breakdown. |
| Reviews | Customer feedback section. Content lives in `assets/reviews.js` — **samples today**, see below. |
| Navigation | Below 940px the header nav becomes a drawer (`LL.wireNav` in `assets/views.js`). |
| Assistant | `chat.brahmando.com` widget, tenant `leafandloaf`. No API key in the browser. |

### Themes

| id | Look |
|---|---|
| `light` | The house look. Warm paper, spruce green, Cormorant Garamond + Inter. |
| `dark` | The same page at night. |
| `bright` | Fast-casual: white, black, a signature yellow, condensed uppercase display type, near-square corners. |
| `nordic` | Bright's confidence in Icelandic colour — birch paper, deep spruce, cloudberry buttons. |

**The one rule: a theme sets colour, typeface and corner radius. A theme never
moves anything.** All four share one DOM and one layout, and each palette block
in `styles.css` sets the same fixed list of variables — there is deliberately no
layout variable to reach for. If you are about to write
`[data-theme="x"] .course { display: grid }`, stop.

That rule exists because the site previously offered five "views" that each
rearranged the menu into a different layout — a gallery grid, a centred column,
a printed card, a photo essay. It was a design showcase rather than a restaurant
site, and it was cut on client feedback. Old saved preferences are migrated on
read in `assets/views.js`, so a returning visitor is never left on a theme the
stylesheet no longer defines.

`bright` was built after the client pointed at **xoisland.is** as a reference.
It takes that site's visual *language* — yellow-and-black, fully round pill
buttons, big condensed uppercase headings — and none of its assets, logo,
photography or copy. `nordic` is the same treatment rebuilt in the palette this
brand already uses.

### Ground rules for this site

The published content is limited to what is verifiable — the client brief and
Mathöll Höfða's own site. In particular the site does **not** claim a phone
number, a Tripadvisor rating, additional locations, or table reservations,
because none of those are established. An earlier draft of this project
asserted all four plus a menu belonging to two other restaurants; that content
was removed rather than kept.

The same rule governs the customer feedback section. The reviews in
`assets/reviews.js` are **samples**, and while that file's `placeholder` flag is
`true` the page prints a visible notice above them saying so. Replace them with
real reviews and set the flag to `false`; do not invent entries to fill the
list. There is deliberately no `aggregateRating` in the page's structured data
either, because that would put a rating built from sample text into Google's
search results.

Nutrition figures are kitchen estimates derived from the listed ingredients.
They are labelled as estimates everywhere they appear, on the page and in the
assistant's knowledge pack, and allergen questions are routed to counter staff.

### Before go-live

- [ ] Replace `ENQUIRY_EMAIL` in `restaurants/leaf-and-loaf/assets/app.js` —
      it currently holds a deliberate `REPLACE-ME@` placeholder.
- [ ] Confirm drink prices with the client, or leave them as "at the counter".
- [ ] Replace the sample reviews in `restaurants/leaf-and-loaf/assets/reviews.js`
      with real ones, then set `placeholder: false`.
- [ ] Have a native Icelandic speaker read the `is` strings in `app.js`,
      `order.js`, `party.js` and `reviews.js`. The copy was simplified in the
      2026-08 feedback round and the Icelandic has not been read by a native
      speaker since.
- [ ] Confirm the focaccia prices; the brief gave a 2,900–3,200 ISK range and
      the three individual prices here are an even split across it.

## manailab.com landing

The Leaf & Loaf circle uses the Brahmexa mark grammar from
`Brahmando-ai/Brahmando` → `assets/brahmexa-logo.css`: circular, no ring, a
breathing halo, one rare "glance" tip, and all motion disabled under
`prefers-reduced-motion`. Below it, `https://saas.brahmexa.com/smb/` fills the
viewport in a borderless iframe.

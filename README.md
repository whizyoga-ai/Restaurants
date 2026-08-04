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
| Design | Nordic editorial. Two palettes: *daylight* and *winter night*. |
| Languages | English and Icelandic, switched client-side, remembered in `localStorage`. |
| Menu | Editorial list, not a card grid. Each dish expands to ingredients and an estimated nutrition breakdown. |
| Assistant | `chat.brahmando.com` widget, tenant `leafandloaf`. No API key in the browser. |

### Ground rules for this site

The published content is limited to what is verifiable — the client brief and
Mathöll Höfða's own site. In particular the site does **not** claim a phone
number, a Tripadvisor rating, additional locations, or table reservations,
because none of those are established. An earlier draft of this project
asserted all four plus a menu belonging to two other restaurants; that content
was removed rather than kept.

Nutrition figures are kitchen estimates derived from the listed ingredients.
They are labelled as estimates everywhere they appear, on the page and in the
assistant's knowledge pack, and allergen questions are routed to counter staff.

### Before go-live

- [ ] Replace `ENQUIRY_EMAIL` in `restaurants/leaf-and-loaf/assets/app.js` —
      it currently holds a deliberate `REPLACE-ME@` placeholder.
- [ ] Confirm drink prices with the client, or leave them as "at the counter".
- [ ] Have a native Icelandic speaker read the `is` strings in `app.js`.
- [ ] Confirm the focaccia prices; the brief gave a 2,900–3,200 ISK range and
      the three individual prices here are an even split across it.

## manailab.com landing

The Leaf & Loaf circle uses the Brahmexa mark grammar from
`Brahmando-ai/Brahmando` → `assets/brahmexa-logo.css`: circular, no ring, a
breathing halo, one rare "glance" tip, and all motion disabled under
`prefers-reduced-motion`. Below it, `https://saas.brahmexa.com/smb/` fills the
viewport in a borderless iframe.

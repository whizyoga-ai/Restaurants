/* ==========================================================================
   CUSTOMER FEEDBACK — the only file you need to edit to change the reviews.

   ┌────────────────────────────────────────────────────────────────────────┐
   │  READ THIS BEFORE THE SITE GOES LIVE.                                  │
   │                                                                        │
   │  The reviews below are SAMPLES. They are not real customers and no     │
   │  real person said any of them. They exist so the section can be built, │
   │  reviewed and signed off with something in it.                         │
   │                                                                        │
   │  While `placeholder` is true, the page prints a visible notice above   │
   │  the reviews saying they are examples, so nothing here can be mistaken │
   │  for a real customer by a visitor.                                     │
   │                                                                        │
   │  TO GO LIVE:                                                           │
   │    1. Replace every entry in ITEMS with a real review.                 │
   │    2. Set `placeholder` to false. The notice disappears.               │
   │                                                                        │
   │  Do not invent reviews to fill the list. Four real ones read better    │
   │  than nine invented ones, and an invented one is the kind of claim     │
   │  that costs a restaurant its reputation when a customer spots it.      │
   └────────────────────────────────────────────────────────────────────────┘

   Each entry:
     stars   1–5, whole numbers
     name    who said it, as you would print it
     where   optional — "Reykjavík", "Office lunch customer", the platform it
             came from, or null to leave it off
     date    optional — "March 2026", or null
     en/is   the quote itself, in each language

   If a review only exists in one language, put the same text in both rather
   than translating it yourself — a quote you translated is no longer a quote.
   ========================================================================== */

'use strict';

window.LL_REVIEWS = {

  /* true = these are samples and the page says so. Set to false once ITEMS
     below holds real reviews. */
  placeholder: true,

  items: [
    {
      stars: 5,
      name: 'Sample review — replace this',
      where: 'Reykjavík',
      date: null,
      en: 'The salad was made in front of me and the bread was still warm. Easy to find inside the food hall, and quick even at midday.',
      is: 'Salatið var útbúið fyrir framan mig og brauðið var enn heitt. Auðvelt að finna inni í mathöllinni og fljótlegt þótt það sé hádegi.',
    },
    {
      stars: 5,
      name: 'Sample review — replace this',
      where: 'Office lunch customer',
      date: null,
      en: 'We order lunch for the team most weeks. It arrives on time, the vegetarian and gluten-free boxes are always labelled, and we get one invoice.',
      is: 'Við pöntum hádegismat fyrir teymið flestar vikur. Það kemur á réttum tíma, grænmetis- og glútenlausu boxin eru alltaf merkt og við fáum einn reikning.',
    },
    {
      stars: 4,
      name: 'Sample review — replace this',
      where: null,
      date: null,
      en: 'Good portions and honest prices. I like that every dish tells you what is in it.',
      is: 'Góðir skammtar og heiðarlegt verð. Mér líkar að hver réttur segir hvað er í honum.',
    },
    {
      stars: 5,
      name: 'Sample review — replace this',
      where: 'Reykjavík',
      date: null,
      en: 'I have an allergy and the staff took it seriously. They checked and told me exactly what I could have.',
      is: 'Ég er með ofnæmi og starfsfólkið tók því alvarlega. Þau athuguðu og sögðu mér nákvæmlega hvað ég mátti fá.',
    },
    {
      stars: 5,
      name: 'Sample review — replace this',
      where: 'Party order',
      date: null,
      en: 'We ordered platters for a birthday. Everything was fresh, it looked good on the table, and nothing was left over.',
      is: 'Við pöntuðum bakka fyrir afmæli. Allt var ferskt, það leit vel út á borðinu og ekkert varð eftir.',
    },
  ],
};

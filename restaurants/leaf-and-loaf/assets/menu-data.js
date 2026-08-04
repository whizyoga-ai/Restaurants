/* ==========================================================================
   The menu, once.

   This was living in three places — the full array in app.js, a trimmed copy
   in order.js, and just the prices in party.js. Three copies of a price list
   is three chances for the site to quote a customer a number the counter does
   not recognise. Everything now reads from here.

   `allergens` is new and structured. The tags were prose ("Contains gluten"),
   which is fine to print and useless to reason over — the answer engine needs
   to compute "which dishes are gluten free" rather than pattern-match English.

   Nutrition figures are kitchen ESTIMATES from the listed ingredients and a
   standard portion. Every surface that shows them says so.
   ========================================================================== */

'use strict';

window.LL_MENU = (function () {

  const items = [
    /* ---------------------------------------------------------- salads --- */
    {
      id: 'caesar', course: 'salads',
      driverEn: 'The dressing, Parmesan and bacon carry most of the fat.', driverIs: 'Dressingin, Parmesan og beikon bera mest af fitunni.',
      photo: 'assets/images/dishes/salad-greens.jpg',
      price: 3290,
      kcal: 620, protein: 38, carbs: 24, fat: 40,
      allergens: ['gluten', 'dairy', 'egg', 'fish'],   // anchovy in the dressing
      diet: ['high-protein'],
      match: ['caesar', 'sesar'],
      en: {
        name: 'Leaf & Loaf Caesar',
        desc: 'Chicken, iceberg and spinach, bacon, bread croutons, lemon, Parmesan and Caesar dressing.',
        ingredients: 'Chicken, iceberg lettuce, spinach, bacon, bread croutons, lemon, Parmesan, Caesar dressing.',
        tags: ['High protein', 'Contains gluten', 'Contains dairy'],
      },
      is: {
        name: 'Leaf & Loaf Caesar',
        desc: 'Kjúklingur, jöklasalat og spínat, beikon, brauðteningar, sítróna, Parmesan og Caesar-dressing.',
        ingredients: 'Kjúklingur, jöklasalat, spínat, beikon, brauðteningar, sítróna, Parmesan, Caesar-dressing.',
        tags: ['Próteinríkt', 'Inniheldur glúten', 'Inniheldur mjólk'],
      },
    },
    {
      id: 'quinoa-beet', course: 'salads',
      driverEn: 'Pistachios, feta and the vinaigrette drive the fat; quinoa the carbohydrate.', driverIs: 'Pistasíur, feta og vinaigrette bera fituna; kínóa kolvetnin.',
      photo: 'assets/images/dishes/salad-bowls.jpg',
      price: 3250,
      kcal: 520, protein: 16, carbs: 45, fat: 30,
      allergens: ['dairy', 'nuts'],
      diet: ['vegetarian', 'gluten-free'],
      match: ['quinoa', 'kinoa', 'kínóa', 'beet', 'raudrofur', 'rauðrófur', 'beetroot'],
      en: {
        name: 'Quinoa & Beet',
        desc: 'Roasted beets, quinoa, mixed greens, feta, pistachios and a lemon vinaigrette.',
        ingredients: 'Roasted beetroot, quinoa, mixed greens, feta cheese, pistachios, lemon vinaigrette.',
        tags: ['Vegetarian', 'Gluten free', 'Contains dairy', 'Contains nuts'],
      },
      is: {
        name: 'Kínóa & Rauðrófur',
        desc: 'Ofnbakaðar rauðrófur, kínóa, blandað salat, fetaostur, pistasíuhnetur og sítrónuvinaigrette.',
        ingredients: 'Ofnbakaðar rauðrófur, kínóa, blandað salat, fetaostur, pistasíuhnetur, sítrónuvinaigrette.',
        tags: ['Grænmetisréttur', 'Glútenlaust', 'Inniheldur mjólk', 'Inniheldur hnetur'],
      },
    },
    {
      id: 'mediterranean', course: 'salads',
      driverEn: 'Olive oil and feta. Otherwise it is mostly vegetables, which is why it is the lightest.', driverIs: 'Ólífuolía og feti. Að öðru leyti aðallega grænmeti, þess vegna er hann léttastur.',
      photo: 'assets/images/dishes/salad-table.jpg',
      price: 3150,
      kcal: 380, protein: 11, carbs: 18, fat: 29,
      allergens: ['dairy'],
      diet: ['vegetarian', 'gluten-free'],
      match: ['mediterranean', 'midjardarhafs', 'miðjarðarhafs', 'medi'],
      en: {
        name: 'Mediterranean',
        desc: 'Tomatoes, cucumber, olives, feta, roasted red peppers and an olive oil dressing.',
        ingredients: 'Tomatoes, cucumber, olives, feta cheese, roasted red peppers, olive oil dressing.',
        tags: ['Vegetarian', 'Gluten free', 'Contains dairy'],
      },
      is: {
        name: 'Miðjarðarhafssalat',
        desc: 'Tómatar, gúrka, ólífur, fetaostur, ofnbakaðar paprikur og ólífuolíudressing.',
        ingredients: 'Tómatar, gúrka, ólífur, fetaostur, ofnbakaðar rauðar paprikur, ólífuolíudressing.',
        tags: ['Grænmetisréttur', 'Glútenlaust', 'Inniheldur mjólk'],
      },
    },

    /* -------------------------------------------------------- focaccia --- */
    {
      id: 'focaccia-salmon', course: 'focaccia',
      driverEn: 'The focaccia carries nearly all the carbohydrate; the salmon the protein.', driverIs: 'Focaccia ber nánast öll kolvetnin; laxinn próteinið.',
      photo: 'assets/images/dishes/focaccia-salmon.jpg',
      price: 3200,
      kcal: 560, protein: 27, carbs: 52, fat: 26,
      allergens: ['gluten', 'fish'],
      diet: ['high-protein'],
      match: ['salmon', 'lax', 'reyktum laxi', 'smoked'],
      en: {
        name: 'Smoked Salmon Focaccia',
        desc: 'Freshly baked focaccia with cold-smoked salmon and seasonal toppings.',
        ingredients: 'House focaccia, cold-smoked salmon, seasonal leaves and toppings.',
        tags: ['High protein', 'Contains gluten', 'Contains fish'],
      },
      is: {
        name: 'Focaccia með reyktum laxi',
        desc: 'Nýbakað focaccia með köldreyktum laxi og árstíðabundnu áleggi.',
        ingredients: 'Focaccia hússins, köldreyktur lax, árstíðabundið salat og álegg.',
        tags: ['Próteinríkt', 'Inniheldur glúten', 'Inniheldur fisk'],
      },
    },
    {
      id: 'focaccia-chicken', course: 'focaccia',
      driverEn: 'Bread for the carbohydrate, chicken for the protein — the highest of the three breads.', driverIs: 'Brauðið fyrir kolvetnin, kjúklingurinn fyrir próteinið — hæst af brauðunum þremur.',
      photo: 'assets/images/dishes/focaccia-sandwiches.jpg',
      price: 3050,
      kcal: 590, protein: 34, carbs: 53, fat: 25,
      allergens: ['gluten'],
      diet: ['high-protein'],
      match: ['chicken focaccia', 'kjuklingi', 'kjúklingi', 'kjuklinga'],
      en: {
        name: 'Chicken Focaccia',
        desc: 'Freshly baked focaccia with roast chicken and seasonal toppings.',
        ingredients: 'House focaccia, roast chicken, seasonal leaves and toppings.',
        tags: ['High protein', 'Contains gluten'],
      },
      is: {
        name: 'Focaccia með kjúklingi',
        desc: 'Nýbakað focaccia með ofnsteiktum kjúklingi og árstíðabundnu áleggi.',
        ingredients: 'Focaccia hússins, ofnsteiktur kjúklingur, árstíðabundið salat og álegg.',
        tags: ['Próteinríkt', 'Inniheldur glúten'],
      },
    },
    {
      id: 'focaccia-veg', course: 'focaccia',
      driverEn: 'The bread accounts for most of it. The least expensive dish and the least protein of the breads.', driverIs: 'Brauðið stendur undir mestu. Ódýrasti rétturinn og minnst prótein af brauðunum.',
      photo: 'assets/images/dishes/focaccia-plain.jpg',
      price: 2900,
      kcal: 470, protein: 13, carbs: 56, fat: 21,
      allergens: ['gluten'],
      diet: ['vegetarian'],
      match: ['vegetable', 'grænmeti', 'graenmeti', 'veg focaccia', 'roasted vegetable'],
      en: {
        name: 'Roasted Vegetable Focaccia',
        desc: 'Freshly baked focaccia with roasted vegetables and seasonal toppings.',
        ingredients: 'House focaccia, roasted vegetables, seasonal leaves and toppings.',
        tags: ['Vegetarian', 'Contains gluten'],
      },
      is: {
        name: 'Focaccia með ofnbökuðu grænmeti',
        desc: 'Nýbakað focaccia með ofnbökuðu grænmeti og árstíðabundnu áleggi.',
        ingredients: 'Focaccia hússins, ofnbakað grænmeti, árstíðabundið salat og álegg.',
        tags: ['Grænmetisréttur', 'Inniheldur glúten'],
      },
    },

    /* ---------------------------------------------------------- drinks --- */
    {
      id: 'juice', course: 'drinks', photo: null,
      driverEn: 'Fruit sugars, nothing added.', driverIs: 'Ávaxtasykur, engu bætt við.',
      price: null,
      kcal: 120, protein: 2, carbs: 27, fat: 0,
      allergens: [],
      diet: ['vegetarian', 'gluten-free', 'vegan'],
      match: ['juice', 'safi', 'safa', 'pressed'],
      en: { name: 'Fresh Pressed Juice', desc: 'Pressed to order. Ask what is on today.',
            ingredients: 'Seasonal fruit and vegetables, pressed to order.',
            tags: ['Vegan', 'Gluten free'] },
      is: { name: 'Ferskpressaður safi', desc: 'Pressaður eftir pöntun. Spurðu hvað er í boði í dag.',
            ingredients: 'Árstíðabundnir ávextir og grænmeti, pressað eftir pöntun.',
            tags: ['Vegan', 'Glútenlaust'] },
    },
    {
      id: 'smoothie', course: 'drinks', photo: null,
      driverEn: 'Fruit and the base. A dairy base puts it higher than a plant one.', driverIs: 'Ávextir og grunnurinn. Mjólkurgrunnur hækkar hann umfram jurtagrunn.',
      price: null,
      kcal: 230, protein: 6, carbs: 40, fat: 4,
      allergens: ['dairy'],          // unless a plant base is asked for
      diet: ['vegetarian', 'gluten-free'],
      match: ['smoothie', 'þeytingur', 'theytingur'],
      en: { name: 'Smoothie', desc: 'Blended fruit and berries. Ask what is on today.',
            ingredients: 'Fruit, berries and a dairy or plant base.',
            tags: ['Vegetarian', 'Gluten free'] },
      is: { name: 'Þeytingur', desc: 'Ávextir og ber. Spurðu hvað er í boði í dag.',
            ingredients: 'Ávextir, ber og mjólkur- eða jurtagrunnur.',
            tags: ['Grænmetisréttur', 'Glútenlaust'] },
    },
    {
      id: 'coffee-tea', course: 'drinks', photo: null,
      driverEn: 'Black, or unsweetened tea. Milk and syrup add to it.', driverIs: 'Svart, eða ósætt te. Mjólk og síróp bæta við.',
      price: null,
      kcal: 10, protein: 0, carbs: 1, fat: 0,
      allergens: [],
      diet: ['vegetarian', 'gluten-free', 'vegan'],
      match: ['coffee', 'kaffi', 'tea', 'te', 'jurtate', 'espresso'],
      en: { name: 'Coffee & Herbal Tea', desc: 'Espresso drinks and a rotating selection of herbal teas.',
            ingredients: 'Coffee, herbal tea, milk or plant milk on request.',
            tags: ['Vegan option', 'Gluten free'] },
      is: { name: 'Kaffi & jurtate', desc: 'Espressódrykkir og úrval af jurtatei.',
            ingredients: 'Kaffi, jurtate, mjólk eða jurtamjólk eftir ósk.',
            tags: ['Vegan valkostur', 'Glútenlaust'] },
    },
  ];

  const courses = [
    { id: 'salads',   en: ['Salads', 'Bowls, pressed to order'],       is: ['Salöt', 'Skálar, útbúnar eftir pöntun'] },
    { id: 'focaccia', en: ['Focaccia', 'On bread baked this morning'], is: ['Focaccia', 'Á brauði bökuðu í morgun'] },
    { id: 'drinks',   en: ['Drinks', 'Juices, smoothies, coffee'],     is: ['Drykkir', 'Safar, þeytingar, kaffi'] },
  ];

  const venue = {
    hall: 'Mathöll Höfða',
    street: 'Bíldshöfða 9',
    city: '110 Reykjavík',
    opens: '11:30',
    closes: '21:00',
    vatRate: 0.11,
  };

  const byId = id => items.find(i => i.id === id);
  const priced = () => items.filter(i => i.price !== null);

  return { items, courses, venue, byId, priced };
})();

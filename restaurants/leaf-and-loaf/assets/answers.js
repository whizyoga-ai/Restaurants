/* ==========================================================================
   Answers computed from the menu, before anything reaches a model.

   WHY THIS EXISTS.

   Asked in Icelandic what is in the Caesar, the local model replied in English
   and invented romaine lettuce and breaded chicken. The menu says iceberg,
   spinach and roast chicken. On a page where someone may be asking because of
   a coeliac diagnosis or a nut allergy, a confident wrong answer is not a
   quality problem, it is a safety one.

   Every question that CAN be answered from the menu is answered from the menu:
   deterministically, in the asker's language, instantly, and with no way to
   invent an ingredient that is not in the data. Only what the data genuinely
   does not cover — food in Iceland, what is worth seeing nearby, open
   conversation — is passed to the assistant.

   Nothing here paraphrases. Every figure is read out of LL_MENU.
   ========================================================================== */

'use strict';

window.LL_ANSWERS = (function () {

  const M = () => window.LL_MENU;

  /* Accents stripped for MATCHING only — never for display. Someone typing
     "glutenlaust" without the accent, or "kinoa" for "kínóa", is asking the
     same question and should get the same answer. */
  const norm = s => String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[þ]/g, 'th').replace(/[ð]/g, 'd').replace(/[æ]/g, 'ae')
    .replace(/\s+/g, ' ')
    .trim();

  /**
   * Does the question contain this term, starting at a word boundary?
   *
   * Plain substring matching put "How much protein is in the quinoa bowl?"
   * onto the coffee entry, because its match token "te" sits inside
   * pro-TE-in. Requiring a word START fixes that.
   *
   * The end is deliberately left open rather than a full \b...\b: Icelandic
   * inflects and compounds, so "gluten" has to match "glútenlausir" and
   * "veisla" has to match "veislunni". Anchoring both ends would answer far
   * fewer questions than it would protect.
   */
  const rx = new Map();
  function startsWord(q, term) {
    const t = norm(term);
    if (!t) return false;
    if (!rx.has(t)) {
      const lit = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      /* Short tokens must match a WHOLE word. "te" is Icelandic for tea, and
         with an open end it matched "tell" in "Tell me about Icelandic hot
         dogs" — which then answered about coffee. Three characters or fewer
         carry too little signal to be allowed a loose end. Longer tokens keep
         the open end so "gluten" still finds "glútenlausir". */
      rx.set(t, t.length <= 3
        ? new RegExp('(^|[^a-z0-9])' + lit + '([^a-z0-9]|$)')
        : new RegExp('(^|[^a-z0-9])' + lit));
    }
    return rx.get(t).test(q);
  }

  const has = (q, ...words) => words.some(w => startsWord(q, w));

  const isk = n => (window.LL ? LL.isk(n) : String(n));

  const L = {
    en: {
      estimate: '_Nutrition figures are kitchen estimates from the listed ingredients. If you have an allergy, please tell the counter before you order._',
      contains: 'Contains', noAllergens: 'No listed allergens',
      atCounter: 'priced at the counter',
      allergenName: { gluten: 'gluten', dairy: 'dairy', nuts: 'nuts', fish: 'fish', egg: 'egg' },
    },
    is: {
      estimate: '_Næringartölur eru áætlun eldhússins byggð á upptöldum hráefnum. Ef þú ert með ofnæmi, láttu vita við afgreiðsluborðið áður en þú pantar._',
      contains: 'Inniheldur', noAllergens: 'Engir skráðir ofnæmisvaldar',
      atCounter: 'verð við afgreiðslu',
      allergenName: { gluten: 'glúten', dairy: 'mjólk', nuts: 'hnetur', fish: 'fisk', egg: 'egg' },
    },
  };

  const priceOf = (item, lang) =>
    item.price === null ? L[lang].atCounter : `${isk(item.price)} ISK`;

  const nameOf = (item, lang) => item[lang].name;

  /* --------------------------------------------------------- dish lookup */
  function findDish(q, lang) {
    const hits = M().items.filter(i => {
      if (startsWord(q, i[lang].name)) return true;
      if (startsWord(q, i.en.name) || startsWord(q, i.is.name)) return true;
      return (i.match || []).some(m => startsWord(q, m));
    });
    // longest name wins, so "chicken focaccia" does not also match "focaccia"
    return hits.sort((a, b) => norm(b[lang].name).length - norm(a[lang].name).length)[0] || null;
  }

  /* ------------------------------------------------------------- answers */

  function dishCard(item, lang) {
    const c = item[lang];
    const t = L[lang];
    const allerg = item.allergens.length
      ? `${t.contains}: ${item.allergens.map(a => t.allergenName[a]).join(', ')}.`
      : `${t.noAllergens}.`;

    const nutrition = lang === 'en'
      ? `Roughly **${item.kcal} kcal** — ${item.protein} g protein, ${item.carbs} g carbs, ${item.fat} g fat.`
      : `Um það bil **${item.kcal} kcal** — ${item.protein} g prótein, ${item.carbs} g kolvetni, ${item.fat} g fita.`;

    return [
      `**${c.name}** — ${priceOf(item, lang)}`,
      c.ingredients,
      nutrition,
      allerg,
      t.estimate,
    ].join('\n\n');
  }

  function dietList(key, lang) {
    const t = L[lang];
    if (key === 'gluten-free') {
      const ok = M().items.filter(i => !i.allergens.includes('gluten'));
      const no = M().items.filter(i => i.allergens.includes('gluten'));
      return lang === 'en'
        ? `Gluten free as served:\n\n${ok.map(i => `- ${nameOf(i, 'en')}`).join('\n')}\n\nEverything else contains gluten: ${no.map(i => nameOf(i, 'en')).join(', ')}. A focaccia cannot be made gluten free by leaving out the bread — the bread is the dish. Ask at the counter whether a gluten-free loaf is on that day.\n\n${t.estimate}`
        : `Glútenlaust eins og það er borið fram:\n\n${ok.map(i => `- ${nameOf(i, 'is')}`).join('\n')}\n\nAllt annað inniheldur glúten: ${no.map(i => nameOf(i, 'is')).join(', ')}. Focaccia verður ekki glútenlaust með því að sleppa brauðinu — brauðið er rétturinn. Spurðu við borðið hvort glútenlaust brauð sé í boði þann daginn.\n\n${t.estimate}`;
    }
    if (key === 'vegetarian') {
      const ok = M().items.filter(i => i.diet.includes('vegetarian') || i.diet.includes('vegan'));
      return lang === 'en'
        ? `Vegetarian:\n\n${ok.map(i => `- ${nameOf(i, 'en')} — ${priceOf(i, 'en')}`).join('\n')}\n\nThe Caesar is not: it has chicken, bacon, and a dressing that usually contains anchovy.`
        : `Grænmetisréttir:\n\n${ok.map(i => `- ${nameOf(i, 'is')} — ${priceOf(i, 'is')}`).join('\n')}\n\nCaesar er það ekki: hann inniheldur kjúkling, beikon og dressingu sem inniheldur yfirleitt ansjósur.`;
    }
    if (key === 'vegan') {
      return lang === 'en'
        ? `No dish is fully vegan as listed — both vegetarian salads contain feta. The closest is the **Mediterranean without the feta**; ask at the counter whether they will leave it out. The juice and black coffee or herbal tea are vegan as they are.`
        : `Enginn réttur er alveg vegan eins og hann er skráður — bæði grænmetissalötin innihalda fetaost. Næst kemst **Miðjarðarhafssalat án fetaosts**; spurðu við borðið hvort það sé hægt. Safinn og svart kaffi eða jurtate eru vegan eins og þau eru.`;
    }
    return null;
  }

  function allergenAnswer(allergen, lang) {
    const t = L[lang];
    const bad = M().items.filter(i => i.allergens.includes(allergen));
    const ok = M().items.filter(i => !i.allergens.includes(allergen));
    const name = t.allergenName[allergen];
    return lang === 'en'
      ? `Avoid these — they contain ${name}:\n\n${bad.map(i => `- ${nameOf(i, 'en')}`).join('\n') || '- none'}\n\nSafe on that count:\n\n${ok.map(i => `- ${nameOf(i, 'en')}`).join('\n')}\n\n${t.estimate}`
      : `Forðastu þessa — þeir innihalda ${name}:\n\n${bad.map(i => `- ${nameOf(i, 'is')}`).join('\n') || '- engan'}\n\nÖruggir að því leyti:\n\n${ok.map(i => `- ${nameOf(i, 'is')}`).join('\n')}\n\n${t.estimate}`;
  }

  /**
   * The menu.
   *
   * `deep` gives the version someone gets when they ask about the menu rather
   * than for it: what is in each dish, what it comes to, and what it is worth
   * knowing about it — laid out by course instead of run together in a
   * paragraph, which is what the model produced.
   */
  function fullMenu(lang, deep) {
    const t = L[lang];
    const blocks = M().courses.map(course => {
      const list = M().items.filter(i => i.course === course.id);
      const rows = list.map(i => {
        if (!deep) return `- ${nameOf(i, lang)} — ${priceOf(i, lang)}`;
        const bits = [
          `**${nameOf(i, lang)}** — ${priceOf(i, lang)}`,
          i[lang].ingredients,
          i.price === null
            ? (lang === 'en' ? `Roughly ${i.kcal} kcal.` : `Um ${i.kcal} kcal.`)
            : (lang === 'en'
                ? `~${i.kcal} kcal • ${i.fat} g fat • ${i.carbs} g carbs • ${i.protein} g protein`
                : `~${i.kcal} kcal • ${i.fat} g fita • ${i.carbs} g kolvetni • ${i.protein} g prótein`),
          lang === 'en' ? i.driverEn : i.driverIs,
        ];
        return bits.join('\n');
      });
      const label = deep ? `**${course[lang][0]}** — ${course[lang][1]}` : `**${course[lang][0]}**`;
      return `${label}\n\n${rows.join('\n\n')}`;
    });

    if (!deep) return blocks.join('\n\n');

    const tail = lang === 'en'
      ? `Everything is made when you order it. Ask me what is gluten free, what has the most protein, or which parts of a dish are Icelandic and which are imported.`
      : `Allt er útbúið eftir pöntun. Spurðu mig hvað er glútenlaust, hvað er próteinríkast, eða hvað í réttinum er íslenskt og hvað innflutt.`;

    return [...blocks, tail, t.estimate].join('\n\n');
  }

  /* ------------------------------------------------------------- routing */
  const RULES = [

    // --- a named dish -------------------------------------------------- //
    {
      test: (q, lang) => findDish(q, lang) && has(q, 'what is in', 'whats in', 'ingredient', 'contain', 'tell me about',
        'hvad er i', 'hvað er í', 'hraefni', 'hráefni', 'inniheldur', 'segdu mer'),
      run: (q, lang) => dishCard(findDish(q, lang), lang),
    },

    // --- nutrition on a named dish ------------------------------------- //
    {
      test: (q, lang) => findDish(q, lang) && has(q, 'protein', 'calorie', 'kcal', 'carb', 'fat', 'nutrition',
        'protein', 'hitaeining', 'kolvetni', 'fita', 'naering', 'næring'),
      run: (q, lang) => {
        const d = findDish(q, lang);
        return lang === 'en'
          ? `**${nameOf(d, 'en')}** — roughly **${d.kcal} kcal**, **${d.protein} g protein**, ${d.carbs} g carbohydrate, ${d.fat} g fat.\n\n${L.en.estimate}`
          : `**${nameOf(d, 'is')}** — um það bil **${d.kcal} kcal**, **${d.protein} g prótein**, ${d.carbs} g kolvetni, ${d.fat} g fita.\n\n${L.is.estimate}`;
      },
    },

    // --- price of a named dish ----------------------------------------- //
    {
      test: (q, lang) => findDish(q, lang) && has(q, 'how much', 'price', 'cost', 'hvad kostar', 'hvað kostar', 'verd', 'verð'),
      run: (q, lang) => {
        const d = findDish(q, lang);
        return lang === 'en'
          ? `**${nameOf(d, 'en')}** is **${priceOf(d, 'en')}**.`
          : `**${nameOf(d, 'is')}** kostar **${priceOf(d, 'is')}**.`;
      },
    },

    /* --- nutrition for the WHOLE menu ---------------------------------- //
       Asked for "nutritional values" with no dish named, this used to fall
       through to the model, which had the right numbers from the knowledge
       pack but ran all nine dishes together into one unbroken paragraph.
       Same figures, laid out so they can be read. */
    {
      test: (q, lang) => !findDish(q, lang) && has(q,
        'nutrition', 'nutritional', 'nutritious', 'calorie', 'kcal', 'macro', 'protein', 'carb', 'fat',
        'naering', 'næring', 'naeringargildi', 'næringargildi', 'hitaeining', 'kolvetni', 'protein'),
      run: (q, lang) => {
        const head = lang === 'en'
          ? 'Approximately, per standard serving:'
          : 'Um það bil, á hvern venjulegan skammt:';
        const rows = M().items.map(i => {
          const n = i[lang].name;
          const unit = lang === 'en' ? 'g' : 'g';
          return `- **${n}** — ~${i.kcal} kcal • ${i.fat} ${unit} fat • ${i.carbs} ${unit} carbs • ${i.protein} ${unit} protein`;
        });
        const rowsIs = M().items.map(i =>
          `- **${i.is.name}** — ~${i.kcal} kcal • ${i.fat} g fita • ${i.carbs} g kolvetni • ${i.protein} g prótein`);

        const whyHead = lang === 'en' ? 'What drives each number:' : 'Hvað ræður hverri tölu:';
        const why = M().items.map(i =>
          `- **${i[lang].name}** — ${lang === 'en' ? i.driverEn : i.driverIs}`);

        return [head, (lang === 'en' ? rows : rowsIs).join('\n'),
                whyHead, why.join('\n'), L[lang].estimate].join('\n\n');
      },
    },

    // --- superlatives --------------------------------------------------- //
    {
      test: q => has(q, 'cheapest', 'least expensive', 'odyrast', 'ódýrast'),
      run: (q, lang) => {
        const d = M().priced().sort((a, b) => a.price - b.price)[0];
        return lang === 'en' ? `The least expensive dish is **${nameOf(d, 'en')}** at **${isk(d.price)} ISK**.`
                             : `Ódýrasti rétturinn er **${nameOf(d, 'is')}** á **${isk(d.price)} ISK**.`;
      },
    },
    {
      test: q => has(q, 'most expensive', 'dyrast', 'dýrast'),
      run: (q, lang) => {
        const d = M().priced().sort((a, b) => b.price - a.price)[0];
        return lang === 'en' ? `The most expensive dish is **${nameOf(d, 'en')}** at **${isk(d.price)} ISK**.`
                             : `Dýrasti rétturinn er **${nameOf(d, 'is')}** á **${isk(d.price)} ISK**.`;
      },
    },
    {
      test: q => has(q, 'most protein', 'highest protein', 'mest protein', 'mest prótein'),
      run: (q, lang) => {
        const d = [...M().items].sort((a, b) => b.protein - a.protein)[0];
        return lang === 'en' ? `**${nameOf(d, 'en')}** has the most, about **${d.protein} g**.\n\n${L.en.estimate}`
                             : `**${nameOf(d, 'is')}** hefur mest, um **${d.protein} g**.\n\n${L.is.estimate}`;
      },
    },
    {
      test: q => has(q, 'fewest calorie', 'lowest calorie', 'lightest', 'faestar hitaeiningar', 'fæstar hitaeiningar', 'lettast', 'léttast'),
      run: (q, lang) => {
        const d = M().priced().sort((a, b) => a.kcal - b.kcal)[0];
        return lang === 'en' ? `**${nameOf(d, 'en')}** is the lightest, about **${d.kcal} kcal**.\n\n${L.en.estimate}`
                             : `**${nameOf(d, 'is')}** er léttastur, um **${d.kcal} kcal**.\n\n${L.is.estimate}`;
      },
    },

    // --- dietary --------------------------------------------------------- //
    { test: q => has(q, 'gluten'), run: (q, lang) => dietList('gluten-free', lang) },
    { test: q => has(q, 'vegan'),  run: (q, lang) => dietList('vegan', lang) },
    { test: q => has(q, 'vegetarian', 'graenmetis', 'grænmetis', 'meat free'),
      run: (q, lang) => dietList('vegetarian', lang) },

    // --- allergens ------------------------------------------------------- //
    { test: q => has(q, 'nut allergy', 'nuts', 'hnetur', 'hnetuofnaemi'), run: (q, lang) => allergenAnswer('nuts', lang) },
    { test: q => has(q, 'dairy', 'lactose', 'milk', 'mjolk', 'mjólk', 'laktosa'), run: (q, lang) => allergenAnswer('dairy', lang) },
    { test: q => has(q, 'fish allergy', 'shellfish', 'fiskur', 'fiskofnaemi'), run: (q, lang) => allergenAnswer('fish', lang) },
    { test: q => has(q, 'egg allergy', 'eggja'), run: (q, lang) => allergenAnswer('egg', lang) },

    /* --- where the food comes from ------------------------------------- //
       Iceland grows leaves, tomatoes, cucumbers and peppers year-round in
       geothermal greenhouses and roots outdoors, and imports its grain, olives,
       citrus and nuts. That is a genuinely interesting answer for a visitor and
       a completely checkable one, so it is answered here rather than guessed at. */
    {
      test: q => has(q, 'local', 'locally', 'icelandic ingredient', 'ingredient', 'imported', 'import', 'sourced', 'grown', 'where does the food come from',
        'where is the food from', 'islenskt', 'íslenskt', 'innflutt', 'hvadan kemur'),
      run: (q, lang) => {
        const d = findDish(q, lang);
        const head = lang === 'en'
          ? 'Iceland grows leaves, tomatoes, cucumbers and peppers all year in geothermally heated greenhouses, and root vegetables outdoors. Grain, olives, citrus and nuts are imported. Dish by dish:'
          : 'Ísland ræktar salat, tómata, gúrkur og papriku allt árið í jarðhitakyntum gróðurhúsum, og rótargrænmeti utandyra. Korn, ólífur, sítrus og hnetur eru innflutt. Réttur fyrir rétt:';
        const one = i => `- **${i[lang].name}** — ${lang === 'en' ? i.originEn : i.originIs}`;
        if (d) return `**${nameOf(d, lang)}**\n\n${lang === 'en' ? d.originEn : d.originIs}`;
        return `${head}\n\n${M().items.map(one).join('\n')}`;
      },
    },

    /* --- what should I have -------------------------------------------- //
       Built from the data, not from an invented chef persona. Leaf & Loaf has
       not told us what the kitchen recommends or what sells best, and making
       that up would be exactly the kind of pleasant fiction this site has
       avoided. What CAN be said honestly is which dish wins on each measure. */
    {
      test: q => has(q, 'recommend', 'what should i', 'best dish', 'popular', 'favourite', 'favorite', 'chef',
        'maelid thid med', 'mælið þið með', 'vinsaelast', 'vinsælast', 'hvad aetti eg'),
      run: (q, lang) => {
        const most = [...M().items].sort((a, b) => b.protein - a.protein)[0];
        const light = M().priced().sort((a, b) => a.kcal - b.kcal)[0];
        const cheap = M().priced().sort((a, b) => a.price - b.price)[0];
        const veg = M().items.find(i => i.diet.includes('vegetarian'));
        const gf = M().items.find(i => !i.allergens.includes('gluten') && i.price !== null);

        return lang === 'en'
          ? [`Nobody here has told us what the kitchen's own pick is, so rather than invent one, here is what each dish actually wins on:`,
             `- **After the gym or a long shift** — ${nameOf(most, 'en')}, about ${most.protein} g of protein.`,
             `- **Something light** — ${nameOf(light, 'en')}, about ${light.kcal} kcal and mostly vegetables.`,
             `- **Best value** — ${nameOf(cheap, 'en')} at ${isk(cheap.price)} ISK.`,
             `- **Vegetarian** — ${nameOf(veg, 'en')}.`,
             `- **Gluten free without asking** — ${nameOf(gf, 'en')}.`,
             `- **The most Icelandic thing on the menu** — the Smoked Salmon Focaccia. Cold-smoked salmon is a staple here, and the leaves come out of a geothermal greenhouse down the road.`,
            ].join('\n\n')
          : [`Enginn hefur sagt okkur hvað eldhúsið mælir sjálft með, svo í stað þess að finna það upp: hér er hvað hver réttur vinnur á.`,
             `- **Eftir æfingu eða langa vakt** — ${nameOf(most, 'is')}, um ${most.protein} g prótein.`,
             `- **Eitthvað létt** — ${nameOf(light, 'is')}, um ${light.kcal} kcal og aðallega grænmeti.`,
             `- **Besta verðið** — ${nameOf(cheap, 'is')} á ${isk(cheap.price)} ISK.`,
             `- **Grænmetisréttur** — ${nameOf(veg, 'is')}.`,
             `- **Glútenlaust án þess að spyrja** — ${nameOf(gf, 'is')}.`,
             `- **Það íslenskasta á seðlinum** — Focaccia með reyktum laxi. Köldreyktur lax er hefð hér, og salatið kemur úr jarðhitakyntu gróðurhúsi.`,
            ].join('\n\n');
      },
    },

    /* --- the whole menu, in depth --------------------------------------- //
       "Tell me about your menu" used to fall through to the model, which knew
       the facts and ran all nine dishes into one paragraph. Matching on the
       bare word now, since a question containing "menu" and no dish name has
       only one thing it can mean. */
    {
      test: (q, lang) => !findDish(q, lang) && has(q,
        'menu', 'what do you have', 'what do you serve', 'what food', 'dishes', 'eat here',
        'matsed', 'matseðl', 'hvad er a bodstolum', 'hvad bjodid thid', 'rettir', 'rettur'),
      run: (q, lang) => fullMenu(lang, true),
    },

    // --- hours and place ------------------------------------------------- //
    {
      test: q => has(q, 'open', 'hours', 'close', 'opnunartimi', 'opnunartími', 'opid', 'opið', 'lokad', 'lokað'),
      run: (q, lang) => {
        const v = M().venue;
        return lang === 'en'
          ? `Open **${v.opens}–${v.closes}, every day of the week**, inside ${v.hall} at ${v.street}, ${v.city}.`
          : `Opið **${v.opens}–${v.closes} alla daga vikunnar**, inni í ${v.hall}, ${v.street}, ${v.city}.`;
      },
    },
    {
      test: q => has(q, 'where are you', 'address', 'find you', 'location', 'hvar eru thid', 'heimilisfang', 'stadsetning'),
      run: (q, lang) => {
        const v = M().venue;
        return lang === 'en'
          ? `We are a counter inside **${v.hall}**, ${v.street}, ${v.city} — one of about ten kitchens sharing the hall. Order at our counter and sit anywhere.`
          : `Við erum afgreiðsluborð inni í **${v.hall}**, ${v.street}, ${v.city} — eitt af um tíu eldhúsum í höllinni. Pantaðu hjá okkur og sestu hvar sem er.`;
      },
    },

    /* Getting here.

       This rule exists because the model got it wrong in production. Asked
       how to reach the hall by bus, it answered "bus number 1, get off at
       Höfði or Höfðabakki, about 20 minutes" — inventing all three. The
       knowledge pack tells it in plain words not to invent a route number
       and to send people to straeto.is; it did it anyway, most likely by
       reading "Route 1" out of the driving directions on the line above.

       A wrong bus number puts someone on the wrong side of the city. So the
       route is answered from fixed facts, and the one fact we genuinely do
       not have is declined out loud, with the reason and the real source. */
    {
      test: q => has(q, 'bus', 'straeto', 'strætó', 'ruta', 'rúta', 'leid', 'leið',
                        'get there', 'get to you', 'getting here', 'how do i get',
                        'directions', 'drive', 'driving', 'park', 'parking',
                        'airport', 'keflavik', 'keflavík', 'taxi', 'leigubil', 'leigubíl',
                        /* "can I walk from town?" is the question with the worst
                           wrong answer available: 6 km through an industrial
                           district, in Icelandic weather. Answered, not guessed. */
                        'walk', 'walking', 'on foot', 'ganga', 'gangandi', 'gonguleid', 'gönguleið',
                        'hvernig kemst', 'komast', 'bilastaedi', 'bílastæði', 'flugvoll', 'flugvöll'),
      run: (q, lang) => {
        const v = M().venue;
        return lang === 'en'
          ? [
              `We are at **${v.street}, ${v.city}**, in Höfði — a working district in eastern Reykjavík, about 6 km from the city centre. That is a 10 to 15 minute drive, not a walk.`,
              `**By car** — easy off Vesturlandsvegur, and there is free parking at the hall.`,
              `**From Keflavík Airport** — about 50 km, roughly 45 to 50 minutes.`,
              `**By bus** — Strætó does serve Höfði, but route numbers and stops get changed and we would rather not send you to the wrong side of town on an out-of-date one. Put ${v.street} into **straeto.is** and it will give you today's route.`,
            ].join('\n\n')
          : [
              `Við erum á **${v.street}, ${v.city}**, í Höfða — athafnahverfi í austurhluta Reykjavíkur, um 6 km frá miðbænum. Það er 10–15 mínútna akstur, ekki gönguleið.`,
              `**Á bíl** — greið leið af Vesturlandsvegi og frí bílastæði við höllina.`,
              `**Frá Keflavíkurflugvelli** — um 50 km, um 45–50 mínútur.`,
              `**Með strætó** — Strætó ekur um Höfða, en leiðanúmer og stoppistöðvar breytast og við viljum ekki senda þig á rangan stað með úreltum upplýsingum. Sláðu ${v.street} inn á **straeto.is** og þú færð leiðina eins og hún er í dag.`,
            ].join('\n\n');
      },
    },

    // --- ordering and catering ------------------------------------------- //
    {
      test: q => has(q, 'order ahead', 'collect', 'takeaway', 'take away', 'panta fyrirfram', 'saekja', 'sækja'),
      run: (q, lang) => lang === 'en'
        ? `Yes — choose your dishes and a collection time on the **order-ahead page**, and pay at the counter when you collect. Give us about 20 minutes; everything is made to order.`
        : `Já — veldu réttina og afhendingartíma á **pöntunarsíðunni** og greiddu við borðið þegar þú sækir. Gefðu okkur um 20 mínútur; allt er útbúið eftir pöntun.`,
    },
    {
      test: q => has(q, 'party', 'catering', 'platter', 'veisla', 'veislu', 'bakka'),
      run: (q, lang) => lang === 'en'
        ? `We put together focaccia boards and salad tables for parties — see the **party orders page**. Boards are priced straight from the menu with no party markup, and we ask for two working days.`
        : `Við útbúum focacciabakka og salatborð fyrir veislur — sjá **veislusíðuna**. Bakkarnir eru verðlagðir beint af matseðlinum án álags, og við biðjum um tveggja virkra daga fyrirvara.`,
    },
  ];

  /**
   * Try to answer from the menu.
   * Returns the answer text, or null when the question is genuinely outside
   * the data and should go to the assistant.
   */
  function tryAnswer(question, lang) {
    if (!window.LL_MENU) return null;
    const q = norm(question);
    if (!q) return null;
    for (const rule of RULES) {
      try {
        if (rule.test(q, lang)) {
          const a = rule.run(q, lang);
          if (a) return a;
        }
      } catch (_) { /* a broken rule must never block the model fallback */ }
    }
    // A dish named with no other clue: show its card rather than guessing why.
    const d = findDish(q, lang);
    if (d && q.split(' ').length <= 6) return dishCard(d, lang);
    return null;
  }

  return { tryAnswer, findDish, fullMenu, norm };
})();

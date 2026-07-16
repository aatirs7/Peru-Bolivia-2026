import type { Destination } from "@/types";

export const DESTINATIONS: Destination[] = [
  // ---- LIMA ----
  {
    id: "lima",
    name: "Lima",
    dayNumbers: [1, 2, 3, 4],
    intro:
      "Coastal capital and one of the world's great food cities. Your base is Miraflores; Barranco and the Historic Center are the other two neighborhoods worth your time.",
    halalNote:
      "Few dedicated halal spots; seafood (ceviche), vegetarian, and Middle Eastern/Turkish places in Miraflores are your easiest bets · verify on Zabihah/HalalTrip.",
    practical: [
      "Don't walk between districts · use taxis/Uber; within Miraflores, Barranco, and the Historic Center it's walkable.",
      "Do the Historic Center in the morning (brighter, livelier, feels safer).",
    ],
    suggestions: [
      { name: "Malecón & Parque Kennedy", blurb: "Cliff-top ocean promenade and the lively central park (famous for its cats).", category: "walk", onItinerary: true, tip: "Sunset over the Pacific is the move; long bike/jog path along the cliffs." },
      { name: "Larcomar", blurb: "Cliffside mall built into the bluff with ocean views.", category: "relax", onItinerary: true },
      { name: "Barranco · Bridge of Sighs & street art", blurb: "Bohemian district of murals, galleries, and a sandy little beach.", category: "walk", onItinerary: true, tip: "Best in late afternoon into the evening." },
      { name: "Historic Center · Plaza Mayor", blurb: "Cathedral, Government Palace, and mustard colonial facades framing the square.", category: "see", onItinerary: true },
      { name: "San Francisco Monastery catacombs", blurb: "Beautiful cloisters above eerie bone-lined catacombs.", category: "see", onItinerary: true },
      { name: "Museo Larco", blurb: "Pre-Columbian art in a garden mansion, with a well-loved café.", category: "see", onItinerary: true, tip: "Open late; the garden café is a nice slow lunch." },
      { name: "Huaca Pucllana", blurb: "A 1,500-year-old adobe pyramid right in Miraflores, ~10 min from the park.", category: "see", tip: "Guided entry ~$5; atmospheric on the evening tour." },
      { name: "Circuito Mágico del Agua", blurb: "Illuminated musical fountain park (Parque de la Reserva) after dark.", category: "see", tip: "Go in the evening for the light show." },
      { name: "Parque del Amor", blurb: "Clifftop park with the 'El Beso' statue and mosaic walls.", category: "viewpoint" },
      { name: "Free walking tour", blurb: "Tip-based orientation walks of the Historic Center, Miraflores, and Barranco.", category: "walk", tip: "Meet at the Miraflores tourist center; tours ~10:30 AM / 3:30 PM / 4:30 PM." },
      { name: "Barrio Chino (Chinatown)", blurb: "Lima's Chinatown by the Historic Center · dim sum and chifa.", category: "eat" },
      { name: "Paragliding over Miraflores", blurb: "Tandem flights off the cliffs above the Malecón.", category: "active", tip: "Weather-dependent; book with a reputable operator." },
      { name: "Ceviche & Peruvian classics", blurb: "The city's signature · plus anticuchos, lomo saltado, and picarones for dessert.", category: "eat", onItinerary: true, tip: "La Lucha for sandwiches; ceviche is best at lunch when it's freshest." },
    ],
  },

  // ---- CUSCO ----
  {
    id: "cusco",
    name: "Cusco",
    dayNumbers: [5, 6, 11],
    intro:
      "The old Inca capital at 3,400 m · colonial squares built on Inca stone, a great food scene, and the launch pad for Rainbow Mountain and the Sacred Valley.",
    altitudeNote:
      "3,400 m. Take Day 5 easy, hydrate, coca tea. Rainbow Mountain (Day 6) tops 5,000 m · the one buffer day before it matters.",
    halalNote:
      "Inland, so less seafood; trout, vegetarian Andean plates, and grilled meats are widely available. No dedicated halal · verify anything specific.",
    practical: [
      "A Boleto Turístico covers Sacsayhuamán, Q'enqo, Tambomachay, and Sacred Valley sites · buy in person, carry cash + ID.",
      "The free walking tour (meets at the Plaza de Armas Inca statue) is the best first-day orientation.",
    ],
    suggestions: [
      { name: "Plaza de Armas", blurb: "The heart of the city; the cathedral and churches are beautifully lit after dark.", category: "see", onItinerary: true, tip: "Come back at night for the lit-up square." },
      { name: "Qorikancha", blurb: "The Inca sun temple, later built over by the Santo Domingo convent · stonework you won't forget.", category: "see", onItinerary: true },
      { name: "San Blas neighborhood", blurb: "Bohemian uphill lanes, artisan shops, cafés, and rooftop views.", category: "walk", onItinerary: true, tip: "Wander up on your own after the walking tour." },
      { name: "San Pedro Market", blurb: "Local market for juices, cheese, and cheap authentic food stalls.", category: "market", onItinerary: true },
      { name: "Rainbow Mountain (Vinicunca)", blurb: "The 5,000 m+ striped peak · your booked ATV day trip.", category: "active", onItinerary: true, tip: "Very early start, freezing mornings, bring cash for horses/snacks." },
      { name: "Sacsayhuamán", blurb: "Massive Inca fortress above the city with enormous fitted stones and a huge panorama.", category: "see", tip: "Go early (7–9 AM) or late afternoon for light; wait until you're acclimatized for the uphill walk." },
      { name: "Cristo Blanco & San Cristóbal viewpoint", blurb: "White Christ statue and belfry viewpoints over the red rooftops.", category: "viewpoint", tip: "Cristo Blanco is ~10 min from Sacsayhuamán; combine them." },
      { name: "Q'enqo, Tambomachay & Puka Pukara", blurb: "A half-day circuit of smaller Inca ruins just outside town.", category: "see", tip: "Covered by the Boleto Turístico; pair with Sacsayhuamán." },
      { name: "Hatun Rumiyoc (12-angle stone)", blurb: "Famous perfectly-fitted Inca wall stone on the way to San Blas.", category: "walk", tip: "Quick stop; look for the crowd taking photos." },
      { name: "ChocoMuseo", blurb: "Bean-to-bar chocolate workshop · fun, hands-on, family-friendly.", category: "active" },
      { name: "Cooking class", blurb: "Market visit plus hands-on Peruvian cooking; a great rainy-afternoon option.", category: "active" },
      { name: "Andean food to try", blurb: "Alpaca steak, trout, chicharrón, and (if adventurous) cuy; markets for juices.", category: "eat", tip: "Morena and Cicciolina near the plaza are reliable sit-down picks." },
    ],
  },

  // ---- SACRED VALLEY ----
  {
    id: "sacred-valley",
    name: "Sacred Valley",
    dayNumbers: [7],
    intro:
      "A string of Inca sites along the Urubamba River, lower and warmer than Cusco (great for acclimatizing). A clockwise day loop hits the big ones.",
    altitudeNote:
      "Lower than Cusco (valley towns ~2,700–2,900 m) · many people feel noticeably better here.",
    practical: [
      "You need the Boleto Turístico for Pisac, Moray, Chinchero, and Ollantaytambo · buy in person (COSITUC), cash + ID.",
      "Start early (7–7:30 AM), go clockwise to beat crowds, lunch in Urubamba.",
    ],
    suggestions: [
      { name: "Pisac ruins & market", blurb: "Superb terraced hillside citadel above a well-known craft market.", category: "see", onItinerary: true, tip: "The ruins sit high above town · the most underrated major Inca site." },
      { name: "Ollantaytambo fortress & old town", blurb: "Living Inca town with a huge sun-temple complex · also your Machu Picchu railhead.", category: "see", onItinerary: true },
      { name: "Maras Salt Mines", blurb: "Thousands of terraced salt pools stepping down a canyon · surreal visuals.", category: "see", onItinerary: true, tip: "Late-morning light is best on the pans." },
      { name: "Moray", blurb: "Concentric circular terraces · an Inca agricultural 'laboratory' of microclimates.", category: "see", onItinerary: true },
      { name: "Chinchero", blurb: "Andean village with a colonial church on Inca foundations and live weaving demos.", category: "walk", tip: "A common add-on and a nice sunset stop on the way back to Cusco." },
      { name: "Lunch in Urubamba", blurb: "The valley's main lunch town, midway around the loop.", category: "eat", tip: "Book ahead on weekends." },
    ],
  },

  // ---- AGUAS CALIENTES / MACHU PICCHU ----
  {
    id: "aguas-calientes",
    name: "Aguas Calientes & Machu Picchu",
    dayNumbers: [8, 9, 10],
    intro:
      "The small town below Machu Picchu (a.k.a. Machu Picchu Pueblo). Most of your time is the citadel itself; the town is compact with a few worthwhile add-ons.",
    halalNote: "Limited options; trout and vegetarian/pizza spots are easiest.",
    practical: [
      "Bring your ORIGINAL physical passport for Machu Picchu · strictly enforced, no photocopies.",
      "Buses up to the citadel run from town; queue ~1 hr before your entry time.",
    ],
    suggestions: [
      { name: "Machu Picchu · Circuit 2", blurb: "The main event: your booked 2.5-hr guided walk through the citadel.", category: "see", onItinerary: true, tip: "Your entry time is set at ticket pickup · plan the bus around it." },
      { name: "Hot springs (Baños Termales)", blurb: "The thermal baths the town is named for · a good post-Machu Picchu soak.", category: "relax", onItinerary: true },
      { name: "Mandor Gardens & Waterfall", blurb: "Easy ~1 hr riverside walk to a waterfall, good for birdlife.", category: "walk", tip: "A calm alternative for the free half-day (Day 10)." },
      { name: "Machu Picchu Site Museum", blurb: "Manuel Chávez Ballón museum near Puente Ruinas · context on the site.", category: "see" },
      { name: "Mariposario (butterfly house)", blurb: "Small butterfly sanctuary near the museum · quick, family-friendly.", category: "relax" },
      { name: "Artisan market by the station", blurb: "Souvenir stalls clustered around the train station.", category: "market" },
    ],
  },

  // ---- LA PAZ ----
  {
    id: "la-paz",
    name: "La Paz",
    dayNumbers: [12, 13, 17, 18],
    intro:
      "The world's highest capital, spilling down a dramatic Andean bowl. Cable cars are the signature way to see it, with markets, viewpoints, and big day trips around.",
    altitudeNote:
      "~3,600 m (El Alto airport ~4,060 m) · take the first day gently, hydrate, coca tea.",
    halalNote:
      "Dedicated halal is rare; lean on vegetarian, trout, and simple grilled options. Salteñas often contain meat · ask about fillings.",
    practical: [
      "Mi Teleférico (cable car) is cheap and the best way to move and sightsee at once · ride a few lines.",
      "Get bolivianos; cards are less accepted than in Peru.",
    ],
    suggestions: [
      { name: "Mi Teleférico cable cars", blurb: "A whole network of gondolas gliding over the city · commute and sightseeing in one.", category: "viewpoint", onItinerary: true, tip: "Red, Yellow, and Green lines have the best views; ride at least a couple." },
      { name: "Witches' Market (Mercado de las Brujas)", blurb: "Aymara ritual goods, remedies, and curios in the old center.", category: "market", onItinerary: true },
      { name: "Plaza Murillo & San Francisco", blurb: "The main square (Presidential Palace, Congress) and the grand basilica nearby.", category: "see", onItinerary: true },
      { name: "Valle de la Luna", blurb: "Eroded clay spires just ~10 km out · short marked trails, ~2–3 hrs.", category: "see", onItinerary: true, tip: "Morning light (9–11 AM) is best; entry a couple USD." },
      { name: "Mirador Killi Killi", blurb: "Panoramic viewpoint over the whole bowl of the city.", category: "viewpoint" },
      { name: "Calle Jaén", blurb: "Pretty colonial cobblestone street lined with small museums.", category: "walk" },
      { name: "Tiwanaku", blurb: "Pre-Inca UNESCO ruins ~1.5–2 hrs away · a solid half/full-day trip.", category: "daytrip", tip: "Guided is worth it; there's a lot to interpret." },
      { name: "MUSEF (Ethnography & Folklore)", blurb: "Well-regarded museum of Bolivia's cultures and textiles.", category: "see" },
      { name: "Cholita wrestling", blurb: "Theatrical lucha libre with costumed Aymara women in El Alto.", category: "active", tip: "Usually set show nights · check the schedule; touristy but fun." },
      { name: "Death Road (Yungas) biking", blurb: "The famous downhill mountain-bike descent for the adventurous.", category: "active", tip: "Full-day, adrenaline-heavy · only with a top safety operator; optional." },
      { name: "Salteñas & Bolivian bites", blurb: "Juicy mid-morning pastries; api con pastel for breakfast; Zona Sur for upscale dining.", category: "eat", tip: "Salteñas are a late-morning snack, not all-day." },
    ],
  },

  // ---- UYUNI ----
  {
    id: "uyuni",
    name: "Uyuni & the Salt Flats",
    dayNumbers: [14, 15, 16],
    intro:
      "Gateway town to the Salar de Uyuni, the world's largest salt flat. Your booked full-day tour covers the classic sights; evenings and the town fill the rest.",
    altitudeNote:
      "~3,660 m, cold high desert · pack real layers, sunglasses, and sunscreen (glare is intense).",
    halalNote: "Very limited; pizza, pasta, and vegetarian are the easy options in town.",
    practical: [
      "August is dry season: expect the crisp endless-white flats and superb clear skies · NOT the wet-season mirror reflections.",
      "Tour balance is due on site; bring cash for small entry fees the tour doesn't cover.",
    ],
    suggestions: [
      { name: "Salar de Uyuni", blurb: "The vast white salt expanse · your booked full-day 4x4 tour.", category: "see", onItinerary: true, tip: "Dry season = blinding white horizon and perspective photos; no mirror unless it's rained." },
      { name: "Train Cemetery (Cementerio de Trenes)", blurb: "Rusting antique locomotives on the town's edge.", category: "see", onItinerary: true },
      { name: "Colchani salt village", blurb: "Salt-harvesting town where you see processing and buy salt crafts.", category: "market", onItinerary: true },
      { name: "Isla Incahuasi", blurb: "Cactus-covered rocky island in the middle of the flats with 360° views.", category: "see", onItinerary: true },
      { name: "Sunset & stargazing", blurb: "One of the clearest night skies on Earth · the Milky Way is staggering.", category: "active", tip: "Do a stargazing add-on or just step outside at night; dress very warm." },
      { name: "Uyuni town", blurb: "Plaza Arce, the artisan/railway market, and cozy cafés for empanadas and pizza.", category: "walk", tip: "Minuteman Pizza is a well-known warm-up spot." },
      { name: "Tunupa volcano & Coquesa mummies", blurb: "Longer trip to the volcano's edge and pre-Columbian burial caves.", category: "daytrip", tip: "Needs extra time beyond the standard day tour · optional." },
    ],
  },
];

import mysql from 'mysql2/promise';
import 'dotenv/config';

async function main() {
  const url = process.env.DATABASE_URL;
  const regex = /mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (!match) {
    console.error('Invalid DATABASE_URL');
    return;
  }
  const [_, user, password, host, port, database] = match;

  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    });

    console.log('Clearing database tables...');
    // We disable foreign key checks to safely truncate/delete
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE reviews');
    await connection.query('TRUNCATE TABLE cart');
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding new categories (Homme, Femme, Mixte)...');
    const categories = [
      ['Homme', 'homme', 'Premium luxury fragrances designed for men.'],
      ['Femme', 'femme', 'Elegant and captivating floral-infused scents for women.'],
      ['Mixte', 'mixte', 'Sophisticated unisex compositions blending the best of both worlds.']
    ];

    for (const [name, slug, desc] of categories) {
      await connection.query(
        'INSERT INTO categories (name, slug, description, createdAt) VALUES (?, ?, ?, ?)',
        [name, slug, desc, new Date()]
      );
    }

    const [catRows] = await connection.query('SELECT id, name FROM categories');
    const catMap = Object.fromEntries(catRows.map(c => [c.name, c.id]));

    console.log('Seeding 50 luxury Moroccan perfumes...');
    
    // The exact 50 products provided by the user
    const productsData = [
      { n: 1, ar: "سلطان الليل", en: "Sultan Al Layl", cat: "Homme", p100: 449, img: "sultan.png", desc: "A majestic, deep nocturnal fragrance tailored for the modern nobleman. Enriched with rare dark oud, smoked cedar wood, and hints of velvet incense." },
      { n: 2, ar: "ابن الملك", en: "Ibn Al Malik", cat: "Homme", p100: 429, img: "ibn_lmalik.png", desc: "The son of the king. An imposing masculine blend of noble white musk, crisp amber, and warm spices that leave a trace of pure royalty." },
      { n: 3, ar: "أمير الصحراء", en: "Amir Al Sahara", cat: "Homme", p100: 399, img: "amir_alsahra.png", desc: "A wild yet highly refined dry woody perfume. Captures the hot breeze of the Saharan dunes with golden ambergris, leather, and black pepper." },
      { n: 4, ar: "برود الفجر", en: "Broud Al Fajr", cat: "Homme", p100: 389, img: "baroud.png", desc: "An invigorating cold metallic freshness. Blends icy juniper berries, clean vetiver, and crisp mountain mint, representing the clarity of dawn." },
      { n: 5, ar: "ذهب الريح", en: "Dahab Al Rih", cat: "Homme", p100: 449, img: "gold.png", desc: "Golden notes carried on the wind. An opulent fusion of rich saffron, sweet amber, and elegant cashmere wood." },
      { n: 6, ar: "أسد الجبل", en: "Asad Al Jabal", cat: "Homme", p100: 419, img: "assad.png", desc: "A bold, powerful signature representing the steadfast mountain lion. Earthy oakmoss, dark leather, and spicy patchouli." },
      { n: 7, ar: "نار الشوق", en: "Nar Al Shawq", cat: "Homme", p100: 399, img: "nar_alshawq.png", desc: "A fiery passionate scent. Deep red roses entwined with smoky tobacco leaves, warm vanilla, and sweet cardamom." },
      { n: 8, ar: "قيد القمر", en: "Qayd Al Qamar", cat: "Homme", p100: 419, img: "qayd_alqamar.png", desc: "A mysterious lunar capture. Cool white musk, smoky agarwood, and exotic spices beneath a veil of midnight mist." },
      { n: 9, ar: "ملوك المغرب", en: "Molouk Al Maghrib", cat: "Homme", p100: 479, img: "fes.png", desc: "The Kings of Morocco. A legendary royal composition of rare aged agarwood, Grasse rose, Atlas honey, and warm resins." },
      { n: 10, ar: "صقر الريح", en: "Saqr Al Rih", cat: "Homme", p100: 399, img: "saqer.png", desc: "A majestic bird soaring. High-altitude ozone, clean bergamot, and rich dry cedar wood for the adventurous masculine soul." },
      { n: 11, ar: "سيف الغياب", en: "Sayf Al Ghiyab", cat: "Homme", p100: 419, img: "sayf_lghiyab.png", desc: "A sharp, melancholic fragrance. Clean black pepper, silver birch, cold leather, and sophisticated vetiver roots." },
      { n: 12, ar: "أعماق البحر", en: "A'maq Al Bahr", cat: "Homme", p100: 399, img: "albehr.png", desc: "Deep oceanic depths. Fresh sea salt, wet driftwood, crisp seaweed, and clean marine musk." },
      { n: 13, ar: "رماد الغابة", en: "Rmad Al Ghaba", cat: "Homme", p100: 379, img: "remad_lghaba.png", desc: "Ash of the burnt forest. Smoky wood, dry vetiver, charred cedarwood, and a sophisticated touch of grey amber." },
      { n: 14, ar: "نسيم الصبح", en: "Nassim Al Sobh", cat: "Homme", p100: 359, img: "nasim.png", desc: "Morning breeze. Energizing key lime, sparkling mandarin, fresh mint, and clean white cedar." },
      { n: 15, ar: "خيوط الذهب", en: "Khyout Al Dahab", cat: "Homme", p100: 449, img: "gold.png", desc: "Threads of pure gold. Luxurious saffron, warm liquid amber, sandalwood, and sweet vanilla beans." },
      { n: 16, ar: "قوة الأرز", en: "Qouwat Al Arz", cat: "Homme", p100: 399, img: "aruz.png", desc: "Strength of the Atlas cedarwood. Deep, earthy forest notes, dry wood, and sweet smoky ambergris." },
      { n: 17, ar: "تاج المنصور", en: "Taj Al Mansour", cat: "Homme", p100: 479, img: "taj_elmansour.png", desc: "Crown of the Victorious. Seductive black orchid, spicy Cambodian oud, heavy leather, and warm vanilla." },
      { n: 18, ar: "صمت الجبال", en: "Samt Al Jibal", cat: "Homme", p100: 389, img: "samt_aljibal.png", desc: "Silence of the peaks. Mountain juniper, icy lavender, clean pine needles, and crisp mineral notes." },
      { n: 19, ar: "وهج المساء", en: "Wahaj Al Masa", cat: "Homme", p100: 399, img: "wahaj_elmasa.png", desc: "Glow of the evening. Warm cognac, spicy cinnamon, oakwood barrel, and smooth sweet benzoin." },
      { n: 20, ar: "حرارة الكهرمان", en: "Hararat Al Kahraman", cat: "Homme", p100: 449, img: "hararat.png", desc: "The heat of natural amber. Spicy ginger, hot cardamom, molten amber, and sweet heavy musk." },
      { n: 21, ar: "وردة الملكة", en: "Warda Al Malika", cat: "Femme", p100: 419, img: "almalika.png", desc: "Rose of the Queen. An elegant floral masterpiece starring royal Damask rose, soft pink peony, and delicate white honey." },
      { n: 22, ar: "سر الفردوس", en: "Sirr Al Firdaws", cat: "Femme", p100: 449, img: "sirr elferdawss.png", desc: "Secret of Paradise. Sweet jasmine blossoms, smooth orange flower petals, and clean cashmere musk." },
      { n: 23, ar: "نور القمر", en: "Nour Al Qamar", cat: "Femme", p100: 419, img: "nour_alqamar.png", desc: "Shine of the moon. Silky vanilla orchid, powdered musk, sweet white amber, and morning dew." },
      { n: 24, ar: "عطر البستان", en: "Itr Al Bostan", cat: "Femme", p100: 379, img: "albosstan.png", desc: "Scent of the orchard. Sparkling lemon verbena, fresh apple blossom, sweet peach skin, and light cedar." },
      { n: 25, ar: "حلم الجنة", en: "Hilm Al Janna", cat: "Femme", p100: 449, img: "hilm aljanna.png", desc: "Dream of Heaven. Exotic ylang-ylang, soft powdered rose, sweet vanilla pods, and creamy sandalwood." },
      { n: 26, ar: "عروس الفجر", en: "Aroussa Al Fajr", cat: "Femme", p100: 399, img: "arouss_alfajr.png", desc: "Bride of the dawn. Soft white iris, morning lily, fresh jasmine petals, and crystal musk." },
      { n: 27, ar: "ضوء النجمة", en: "Daw Al Najma", cat: "Femme", p100: 429, img: "al_najma.png", desc: "Starlight. Fruity red berries, velvet damask rose, warm praline, and seductive amber." },
      { n: 28, ar: "خمرة الياسمين", en: "Khamra Al Yasmin", cat: "Femme", p100: 449, img: "khamra yasmine.png", desc: "Jasmine elixir. Heavy sambac jasmine, warm sweet almond, dates, and dry woody cedar." },
      { n: 29, ar: "أميرة الأطلس", en: "Amira Al Atlas", cat: "Femme", p100: 419, img: "amira atlass.png", desc: "Princess of the Atlas. Bright orange blossoms, wild mountain honey, creamy sandalwood, and white musk." },
      { n: 30, ar: "بريق الندى", en: "Bariq Al Nada", cat: "Femme", p100: 399, img: "bari9.png", desc: "Glimmer of the dew. Fresh freesia flowers, crisp green tea, sweet pear, and airy skin musk." },
      { n: 31, ar: "سحر الليالي", en: "Sihr Al Layali", cat: "Femme", p100: 449, img: "sihr_layalli.png", desc: "Magic of the nights. Mysterious black orchid, sweet dark plum, warm vanilla, and heavy golden patchouli." },
      { n: 32, ar: "لآلئ المطر", en: "La'ali Al Matar", cat: "Femme", p100: 399, img: "matar.png", desc: "Pearls of the rain. Clean ozonic water, fresh violet leaves, white lotus flower, and delicate bamboo wood." },
      { n: 33, ar: "رياحين الروح", en: "Riyahin Al Rouh", cat: "Femme", p100: 379, img: "riyah.png", desc: "Sweet basil of the soul. Fresh green leaves, wild sweet lavender, clean sage, and smooth sandalwood." },
      { n: 34, ar: "مرايا الحرير", en: "Maraya Al Harir", cat: "Femme", p100: 449, img: "maraya.png", desc: "Mirrors of silk. Silky almond blossom, soft heliotrope, powdered vanilla, and clean white musk." },
      { n: 35, ar: "حنين الزهرة", en: "Hnin Al Zahra", cat: "Femme", p100: 399, img: "hanin zahra.png", desc: "Nostalgia of the flower. Romantic wild violet, powdered mimosa, juicy red apple, and warm amber." },
      { n: 36, ar: "ليلة الياقوت", en: "Laylat Al Yaqout", cat: "Femme", p100: 479, img: "layla lyaqout.png", desc: "Night of Sapphire. Luxurious dark rose petals, sweet raspberry coulis, warm clove, and rich golden amber." },
      { n: 37, ar: "جنة الورد", en: "Jannat Al Ward", cat: "Femme", p100: 419, img: "jannnat lworod.png", desc: "Paradise of flowers. Rich blooming gardenia, white lily, sweet jasmine, and clean sandalwood." },
      { n: 38, ar: "فتنة الزعفران", en: "Fitnat Al Za'fran", cat: "Femme", p100: 419, img: "zaafaran.png", desc: "Allure of Saffron. Expensive red saffron filaments, delicate jasmine tea, dry warm woods, and white amber." },
      { n: 39, ar: "عبق الأندلس", en: "Abaq Al Andalus", cat: "Femme", p100: 449, img: "andaluss.png", desc: "Fragrance of Andalusia. Historic orange tree blossom, sweet neroli, bitter almond, and sweet honey." },
      { n: 40, ar: "طلة الصباح", en: "Talla Al Sabah", cat: "Femme", p100: 379, img: "sabbah.png", desc: "Morning outlook. Sparkling bergamot, fresh pink grapefruit, clean wild peony, and sheer musk." },
      { n: 41, ar: "روح المغرب", en: "Rouh Al Maghrib", cat: "Mixte", p100: 419, img: "rouh lmaghrib.png", desc: "The Soul of Morocco. A legendary unisex masterpiece. Blends golden Atlas honey, rare saffron, ancient cedarwood, and rich warm amber." },
      { n: 42, ar: "أسرار فاس", en: "Asrar Fas", cat: "Mixte", p100: 449, img: "fes.png", desc: "Secrets of Fez. A majestic, noble historic blend of deep Cambodian agarwood, rich leather, dark rose, and heavy spices." },
      { n: 43, ar: "نفس الجبل", en: "Nafas Al Jabal", cat: "Mixte", p100: 399, img: "nefss_ljabel.png", desc: "Breath of the mountain. Crispy wild juniper berries, clean mountain lavender, fresh mineral stone, and soft white oakmoss." },
      { n: 44, ar: "أنين الكهوف", en: "Anin Al Kouhof", cat: "Mixte", p100: 379, img: "anin_lkohof.png", desc: "Echos of the deep caves. Earthy warm patchouli, smoky vetiver roots, damp cedar wood, and dark gold resins." },
      { n: 45, ar: "شعاع الشمس", en: "Sho'a Al Shams", cat: "Mixte", p100: 399, img: "al shamss.png", desc: "Glow of the sun. Sunny warm orange flower, sparkling lemon zests, sweet rich ambergris, and golden musk." },
      { n: 46, ar: "صمود الصخر", en: "Soumoud Al Sakhr", cat: "Mixte", p100: 419, img: "soumoud.png", desc: "Resilience of the rock. Mineral flint notes, dry clean vetiver, rich birch tar, and tough warm leather." },
      { n: 47, ar: "كنز الجنوب", en: "Kanz Al Janoub", cat: "Mixte", p100: 449, img: "kanz eljanoub.png", desc: "Treasure of the south. Warm dried dates, sweet rich honey, creamy sandalwood, and a soft sillage of Cambodian oud." },
      { n: 48, ar: "حرية الريح", en: "Hurriya Al Rih", cat: "Mixte", p100: 399, img: "riyah.png", desc: "Freedom of the wind. Fresh marine sea breezes, green tea leaves, zesty lemon verbena, and airy white woods." },
      { n: 49, ar: "مدار الذاكرة", en: "Madar Al Dhakira", cat: "Mixte", p100: 419, img: "madar.png", desc: "Orbit of memory. Powdered iris roots, clean iris flowers, smooth creamy sandalwood, and warm leather." },
      { n: 50, ar: "الأصل الملكي", en: "Al Asl Al Malaki", cat: "Mixte", p100: 549, img: "asal_elmalaki.png", desc: "The Royal Heritage. Our absolute flagship masterpiece. Unites premium aged agarwood, expensive amber, royal saffron, and smooth golden musk." }
    ];

    for (const p of productsData) {
      const slug = p.en.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
      const imageUrl = `/images/${p.img}`;
      const imagesArray = JSON.stringify([imageUrl, '/images/bottle_shot.png']);

      await connection.query(
        `INSERT INTO products 
        (name, slug, description, price, categoryId, brand, stock, rating, reviewCount, image, images, isFeatured, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${p.en} (${p.ar})`, 
          slug, 
          p.desc, 
          p.p100, 
          catMap[p.cat], 
          'Oud Royale', 
          100, // stock
          (4.4 + Math.random() * 0.5).toFixed(1), // rating
          Math.floor(20 + Math.random() * 80), // reviewCount
          imageUrl,
          imagesArray,
          p.n <= 8 || p.n === 50, // make first 8 and the flagship featured
          true,
          new Date(),
          new Date()
        ]
      );
    }

    console.log('Database seeding complete successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error during seeding:', err.message);
  }
}

main();

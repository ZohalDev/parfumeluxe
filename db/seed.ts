import { getDb } from "../api/queries/connection";
import { categories, products } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed categories
  const categoryData = [
    { name: "Floral", slug: "floral", description: "Elegant floral fragrances with notes of rose, jasmine, and lily", image: "/images/perfume4.jpg" },
    { name: "Oriental", slug: "oriental", description: "Rich exotic scents with oud, amber, and spices", image: "/images/perfume2.jpg" },
    { name: "Fresh", slug: "fresh", description: "Clean citrus and aquatic fragrances for everyday wear", image: "/images/perfume3.jpg" },
    { name: "Woody", slug: "woody", description: "Warm earthy scents with sandalwood, cedar, and musk", image: "/images/perfume5.jpg" },
    { name: "Marine", slug: "marine", description: "Ocean-inspired fresh and salty fragrances", image: "/images/perfume6.jpg" },
  ];

  await db.insert(categories).values(categoryData);
  console.log("Categories seeded");

  // Get inserted categories
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));

  // Seed products
  const productData = [
    {
      name: "Fleur Noire",
      slug: "fleur-noire",
      description: "A mysterious and seductive blend of black rose, dark vanilla, and smoky oud. This captivating fragrance envelops you in an aura of intrigue and sophistication.",
      price: "185.00",
      comparePrice: "220.00",
      image: "/images/perfume1.jpg",
      images: JSON.stringify(["/images/perfume1.jpg"]),
      categoryId: catMap.get("floral"),
      brand: "Maison Luxe",
      scentNotes: "Black Rose, Dark Vanilla, Smoky Oud, Patchouli",
      volume: "100ml",
      stock: 25,
      isFeatured: true,
      rating: "4.8",
      reviewCount: 42,
    },
    {
      name: "Oud Imperial",
      slug: "oud-imperial",
      description: "An opulent oriental masterpiece featuring rare oud wood, golden amber, and exotic spices. A fragrance that commands attention and leaves a lasting impression.",
      price: "245.00",
      comparePrice: "290.00",
      image: "/images/perfume2.jpg",
      images: JSON.stringify(["/images/perfume2.jpg"]),
      categoryId: catMap.get("oriental"),
      brand: "Royal Parfums",
      scentNotes: "Rare Oud, Golden Amber, Saffron, Cardamom",
      volume: "100ml",
      stock: 18,
      isFeatured: true,
      rating: "4.9",
      reviewCount: 67,
    },
    {
      name: "Citrus Verve",
      slug: "citrus-verve",
      description: "A vibrant burst of Italian bergamot, Sicilian lemon, and fresh verbena. This energizing fragrance brings sunshine and vitality to your day.",
      price: "120.00",
      comparePrice: "150.00",
      image: "/images/perfume3.jpg",
      images: JSON.stringify(["/images/perfume3.jpg"]),
      categoryId: catMap.get("fresh"),
      brand: "Maison Luxe",
      scentNotes: "Bergamot, Lemon, Verbena, White Musk",
      volume: "100ml",
      stock: 45,
      isFeatured: false,
      rating: "4.5",
      reviewCount: 28,
    },
    {
      name: "Eclat de Fleurs",
      slug: "eclat-de-fleurs",
      description: "A romantic bouquet of Bulgarian rose, white jasmine, and peony petals. This enchanting floral fragrance celebrates femininity and grace.",
      price: "165.00",
      comparePrice: "195.00",
      image: "/images/perfume4.jpg",
      images: JSON.stringify(["/images/perfume4.jpg"]),
      categoryId: catMap.get("floral"),
      brand: "Belle Essence",
      scentNotes: "Bulgarian Rose, Jasmine, Peony, Sandalwood",
      volume: "100ml",
      stock: 32,
      isFeatured: true,
      rating: "4.7",
      reviewCount: 55,
    },
    {
      name: "Velvet Musk",
      slug: "velvet-musk",
      description: "A sensual embrace of white musk, tonka bean, and creamy vanilla. This warm and intimate fragrance wraps you in a soft, luxurious cocoon.",
      price: "155.00",
      comparePrice: "180.00",
      image: "/images/perfume5.jpg",
      images: JSON.stringify(["/images/perfume5.jpg"]),
      categoryId: catMap.get("woody"),
      brand: "Royal Parfums",
      scentNotes: "White Musk, Tonka Bean, Vanilla, Cashmere Wood",
      volume: "100ml",
      stock: 20,
      isFeatured: false,
      rating: "4.6",
      reviewCount: 33,
    },
    {
      name: "Mare Blu",
      slug: "mare-blu",
      description: "An invigorating ocean breeze captured in a bottle. Notes of sea salt, driftwood, and Mediterranean citrus transport you to sun-kissed shores.",
      price: "135.00",
      comparePrice: "160.00",
      image: "/images/perfume6.jpg",
      images: JSON.stringify(["/images/perfume6.jpg"]),
      categoryId: catMap.get("marine"),
      brand: "Maison Luxe",
      scentNotes: "Sea Salt, Driftwood, Grapefruit, Seaweed",
      volume: "100ml",
      stock: 38,
      isFeatured: false,
      rating: "4.4",
      reviewCount: 19,
    },
    {
      name: "Saffron Amber",
      slug: "saffron-amber",
      description: "A luxurious blend of precious saffron, golden amber, and warm spices. This exotic fragrance evokes the mystery of ancient trade routes and distant bazaars.",
      price: "210.00",
      comparePrice: "250.00",
      image: "/images/perfume7.jpg",
      images: JSON.stringify(["/images/perfume7.jpg"]),
      categoryId: catMap.get("oriental"),
      brand: "Royal Parfums",
      scentNotes: "Saffron, Amber, Cinnamon, Frankincense",
      volume: "100ml",
      stock: 15,
      isFeatured: true,
      rating: "4.8",
      reviewCount: 48,
    },
    {
      name: "Pure Blanc",
      slug: "pure-blanc",
      description: "A minimalist masterpiece of white cotton, peony, and soft musk. Clean, airy, and effortlessly elegant — the perfect everyday signature scent.",
      price: "110.00",
      comparePrice: "130.00",
      image: "/images/perfume8.jpg",
      images: JSON.stringify(["/images/perfume8.jpg"]),
      categoryId: catMap.get("fresh"),
      brand: "Belle Essence",
      scentNotes: "White Cotton, Peony, Musk, Lily of the Valley",
      volume: "100ml",
      stock: 50,
      isFeatured: false,
      rating: "4.3",
      reviewCount: 22,
    },
  ];

  await db.insert(products).values(productData);
  console.log("Products seeded");

  console.log("Done.");
  process.exit(0);
}

seed();

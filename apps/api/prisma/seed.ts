/**
 * Ekorafon seed — realistic Aba/Abia State manufacturing data
 * Run: npx prisma db seed   OR   npx tsx prisma/seed.ts
 *
 * Password for ALL accounts: Test1234!
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const HASH       = await bcrypt.hash("Test1234!", 10);
  const ADMIN_HASH = await bcrypt.hash("Admin2026!", 10);

  // ── Admin ────────────────────────────────────────────────────────────────────

  await prisma.user.upsert({
    where:  { email: "admin@ekorafon.com" },
    update: {},
    create: {
      email:         "admin@ekorafon.com",
      name:          "Ekorafon Admin",
      passwordHash:  ADMIN_HASH,
      role:          "ADMIN",
      emailVerified: true,
      permissions:   [],
    },
  });

  console.log("✓ admin user");

  // ── Buyers ──────────────────────────────────────────────────────────────────

  const buyers = await Promise.all([
    prisma.user.upsert({
      where:  { email: "adaeze.obi@gmail.com" },
      update: {},
      create: { email: "adaeze.obi@gmail.com",            name: "Adaeze Obi",  passwordHash: HASH, role: "BUYER", emailVerified: true },
    }),
    prisma.user.upsert({
      where:  { email: "emeka.nwosu@tradehub.ng" },
      update: {},
      create: { email: "emeka.nwosu@tradehub.ng",         name: "Emeka Nwosu", passwordHash: HASH, role: "BUYER", emailVerified: true },
    }),
    prisma.user.upsert({
      where:  { email: "chioma.eze@fashionwholesale.com" },
      update: {},
      create: { email: "chioma.eze@fashionwholesale.com", name: "Chioma Eze",  passwordHash: HASH, role: "BUYER", emailVerified: true },
    }),
  ]);

  console.log(`✓ ${buyers.length} buyers`);

  // ── Suppliers ────────────────────────────────────────────────────────────────

  type VerifLevel =
    | "UNVERIFIED"
    | "VERIFIED_BUSINESS"
    | "VERIFIED_FACILITY"
    | "FACTORY_CERTIFIED"
    | "EXPORT_CERTIFIED";

  const supplierData: {
    email: string;
    name:  string;
    factory: {
      businessName:      string;
      description:       string;
      address:           string;
      lga:               string;
      teamSize:          number;
      yearsOfOperation:  number;
      productCategories: string[];
      moq:               number;
      exportReady:       boolean;
      phone:             string;
      verificationLevel: VerifLevel;
    };
  }[] = [
    {
      email: "info@abafootwear.com",
      name:  "Onyekachi Nwachukwu",
      factory: {
        businessName:      "Aba Premier Footwear",
        description:       "Leading manufacturer of men's and women's leather footwear in Aba. We produce over 5,000 pairs monthly for domestic and export markets, specialising in oxford shoes, sandals, and corporate footwear.",
        address:           "12 Ariaria Market Road, Aba",
        lga:               "Aba North",
        teamSize:          45,
        yearsOfOperation:  12,
        productCategories: ["Footwear", "Leather Goods"],
        moq:               100,
        exportReady:       true,
        phone:             "+234 803 456 7890",
        verificationLevel: "EXPORT_CERTIFIED",
      },
    },
    {
      email: "sales@abagarments.ng",
      name:  "Ifeoma Okonkwo",
      factory: {
        businessName:      "Ifeoma Fashion House",
        description:       "Full-service garment manufacturer producing school uniforms, corporate wear, and fashion collections. ISO-aligned quality processes, fast turnaround, and competitive pricing per dozen.",
        address:           "5 Cloth Market Street, Ariaria, Aba",
        lga:               "Aba South",
        teamSize:          30,
        yearsOfOperation:  8,
        productCategories: ["Garments & Textiles", "Bags & Accessories"],
        moq:               50,
        exportReady:       false,
        phone:             "+234 806 234 5678",
        verificationLevel: "FACTORY_CERTIFIED",
      },
    },
    {
      email: "production@kelechi-bags.com",
      name:  "Kelechi Uchenna",
      factory: {
        businessName:      "Kelechi Leather Works",
        description:       "Specialist in handcrafted leather bags, wallets, belts, and accessories. We supply boutiques, fashion houses, and export buyers in UK and USA. Custom branding and private label available.",
        address:           "Obohia Road, Aba",
        lga:               "Osisioma Ngwa",
        teamSize:          22,
        yearsOfOperation:  6,
        productCategories: ["Bags & Accessories", "Leather Goods"],
        moq:               30,
        exportReady:       true,
        phone:             "+234 808 123 4567",
        verificationLevel: "VERIFIED_FACILITY",
      },
    },
    {
      email: "info@abaplasticworks.ng",
      name:  "Chukwuemeka Ogbu",
      factory: {
        businessName:      "Aba Plastic Industries",
        description:       "Manufacturer of industrial and consumer plastic products including containers, crates, household items, and custom injection-moulded parts for the FMCG sector.",
        address:           "Industrial Layout, Aba-Owerri Road",
        lga:               "Aba South",
        teamSize:          60,
        yearsOfOperation:  15,
        productCategories: ["Plastics", "Packaging"],
        moq:               500,
        exportReady:       false,
        phone:             "+234 802 345 6789",
        verificationLevel: "FACTORY_CERTIFIED",
      },
    },
    {
      email: "orders@uguru-furniture.com",
      name:  "Uguru Nwoye",
      factory: {
        businessName:      "Uguru Furniture Makers",
        description:       "Custom furniture manufacturer for offices, schools, and homes. We produce executive desks, chairs, wardrobes, and classroom furniture using locally sourced hardwood.",
        address:           "Aba-Port Harcourt Road, Aba",
        lga:               "Isiala Ngwa South",
        teamSize:          18,
        yearsOfOperation:  9,
        productCategories: ["Furniture"],
        moq:               10,
        exportReady:       false,
        phone:             "+234 805 678 9012",
        verificationLevel: "VERIFIED_BUSINESS",
      },
    },
    {
      email: "info@abafoodprocessing.ng",
      name:  "Ngozi Achebe",
      factory: {
        businessName:      "Ngozi Foods Processing",
        description:       "NAFDAC-certified food processing company producing packaged palm oil, groundnut oil, dried pepper, and spice blends. We supply supermarkets and distributors nationwide.",
        address:           "Obikabia Road, Aba",
        lga:               "Ugwunagbo",
        teamSize:          25,
        yearsOfOperation:  7,
        productCategories: ["Food Processing", "Packaging"],
        moq:               200,
        exportReady:       true,
        phone:             "+234 807 890 1234",
        verificationLevel: "VERIFIED_FACILITY",
      },
    },
    {
      email: "contact@nwankwo-autoparts.com",
      name:  "Nwankwo Okafor",
      factory: {
        businessName:      "Nwankwo Auto Components",
        description:       "Manufacturer and assembler of automotive accessories including seat covers, floor mats, panel linings, and trunk organizers for passenger vehicles and commercial vehicles.",
        address:           "Trans-Ekulu Extension, Aba",
        lga:               "Aba North",
        teamSize:          35,
        yearsOfOperation:  11,
        productCategories: ["Auto Parts", "Leather Goods"],
        moq:               50,
        exportReady:       false,
        phone:             "+234 803 234 5670",
        verificationLevel: "VERIFIED_BUSINESS",
      },
    },
    {
      email: "sales@ababuilding.ng",
      name:  "Chinonso Eke",
      factory: {
        businessName:      "Chinonso Building Materials",
        description:       "Manufacturer of precast concrete products, blocks, interlocking tiles, and paving stones. We serve real estate developers, individual homebuilders, and construction firms across South-East Nigeria.",
        address:           "Aba-Owerri Road, km 3",
        lga:               "Aba South",
        teamSize:          40,
        yearsOfOperation:  10,
        productCategories: ["Building Materials"],
        moq:               100,
        exportReady:       false,
        phone:             "+234 809 012 3456",
        verificationLevel: "UNVERIFIED",
      },
    },
  ];

  const suppliers: (typeof buyers)[0][] = [];
  for (const s of supplierData) {
    const user = await prisma.user.upsert({
      where:  { email: s.email },
      update: {},
      create: { email: s.email, name: s.name, passwordHash: HASH, role: "SUPPLIER", emailVerified: true },
    });
    await prisma.factoryProfile.upsert({
      where:  { userId: user.id },
      update: {},
      create: { ...s.factory, userId: user.id, photos: [] },
    });
    suppliers.push(user);
  }

  console.log(`✓ ${suppliers.length} suppliers + factory profiles`);

  // ── ETRS ────────────────────────────────────────────────────────────────────

  const etrsData = [
    { idx: 0, score: 91, ordersCompleted: 148, deliverySuccessRate: 0.97, avgRating: 4.8, disputeCount: 2 },
    { idx: 1, score: 78, ordersCompleted:  62, deliverySuccessRate: 0.91, avgRating: 4.4, disputeCount: 3 },
    { idx: 2, score: 67, ordersCompleted:  29, deliverySuccessRate: 0.86, avgRating: 4.2, disputeCount: 2 },
    { idx: 3, score: 84, ordersCompleted:  95, deliverySuccessRate: 0.94, avgRating: 4.6, disputeCount: 4 },
    { idx: 4, score: 55, ordersCompleted:  18, deliverySuccessRate: 0.82, avgRating: 3.8, disputeCount: 2 },
    { idx: 5, score: 72, ordersCompleted:  41, deliverySuccessRate: 0.90, avgRating: 4.3, disputeCount: 2 },
    { idx: 6, score: 61, ordersCompleted:  33, deliverySuccessRate: 0.87, avgRating: 4.0, disputeCount: 3 },
  ];

  for (const e of etrsData) {
    await prisma.eTRS.upsert({
      where:  { userId: suppliers[e.idx].id },
      update: {},
      create: {
        userId:              suppliers[e.idx].id,
        score:               e.score,
        ordersCompleted:     e.ordersCompleted,
        deliverySuccessRate: e.deliverySuccessRate,
        avgRating:           e.avgRating,
        disputeCount:        e.disputeCount,
      },
    });
  }

  for (const buyer of buyers) {
    await prisma.eTRS.upsert({
      where:  { userId: buyer.id },
      update: {},
      create: { userId: buyer.id, score: 70 },
    });
  }

  console.log("✓ ETRS scores");

  // ── Products ─────────────────────────────────────────────────────────────────

  const allFactories = await prisma.factoryProfile.findMany({
    where: { userId: { in: suppliers.map((s) => s.id) } },
  });
  const factoryByUser = new Map(allFactories.map((f) => [f.userId, f]));

  type ProductRow = {
    sup: number; name: string; desc: string; cat: string;
    price: number; moq: number; unit: string; lead: number;
  };

  const productsData: ProductRow[] = [
    // Aba Premier Footwear (idx 0)
    { sup: 0, name: "Men's Oxford Leather Shoes",      desc: "Full-grain leather oxford, double-stitched sole, sizes 39–46. Black and brown colourways.",                           cat: "Footwear",            price: 12500,  moq: 100,  unit: "pairs",   lead: 14 },
    { sup: 0, name: "Women's Court Heels",             desc: "3-inch patent leather court heels, cushioned insole, slip-resistant sole. Black, nude, wine.",                        cat: "Footwear",            price: 9800,   moq: 100,  unit: "pairs",   lead: 14 },
    { sup: 0, name: "Children's School Sandals",       desc: "PVC-reinforced leather sandals for ages 3–12. Velcro fastening, anti-bacterial lining.",                              cat: "Footwear",            price: 4200,   moq: 200,  unit: "pairs",   lead: 10 },
    { sup: 0, name: "Men's Leather Belt",              desc: "Full-grain cowhide belt, 35mm width, single-prong buckle. Waist sizes 28–46. Black and tan.",                         cat: "Leather Goods",       price: 3500,   moq: 200,  unit: "pieces",  lead: 7  },
    { sup: 0, name: "Casual Canvas Sneakers",          desc: "Lightweight canvas-upper sneakers with rubber sole. Bright colours and white. Unisex sizing 36–45.",                  cat: "Footwear",            price: 7500,   moq: 150,  unit: "pairs",   lead: 12 },
    // Ifeoma Fashion House (idx 1)
    { sup: 1, name: "School Uniform Set (Primary)",    desc: "Khaki shorts/skirt + white shirt. Colourfast, pre-shrunk. Ages 4–12. School logo embroidery available.",              cat: "Garments & Textiles", price: 6500,   moq: 50,   unit: "sets",    lead: 10 },
    { sup: 1, name: "Corporate Shirt (Men's)",         desc: "100% combed cotton, wrinkle-resistant. Sizes S–4XL. White, blue, striped. Custom logo on chest pocket.",              cat: "Garments & Textiles", price: 4800,   moq: 100,  unit: "pieces",  lead: 12 },
    { sup: 1, name: "Ankara Fabric Tote Bag",          desc: "Handmade wax-print tote, reinforced handles, 40×35cm, interior pocket, zip closure. Mix of prints.",                  cat: "Bags & Accessories",  price: 2800,   moq: 50,   unit: "pieces",  lead: 7  },
    { sup: 1, name: "Chef's Apron & Cap Set",          desc: "Cotton canvas apron + cap, breast pocket, neck and waist ties. White and black. Food-industry grade.",                cat: "Garments & Textiles", price: 3200,   moq: 100,  unit: "sets",    lead: 8  },
    { sup: 1, name: "Aso-Ebi Cord Lace Fabric",       desc: "High-quality cord lace, 5-yard cut. Royal blue, gold, red. Events and wedding orders welcome.",                        cat: "Garments & Textiles", price: 18000,  moq: 20,   unit: "pieces",  lead: 5  },
    // Kelechi Leather Works (idx 2)
    { sup: 2, name: "Executive Leather Briefcase",     desc: "Full-grain cowhide briefcase, 15 inch laptop compartment, brass hardware, combination lock. Black and brown.",         cat: "Bags & Accessories",  price: 35000,  moq: 30,   unit: "pieces",  lead: 21 },
    { sup: 2, name: "Ladies' Leather Handbag",         desc: "Structured leather handbag, magnetic closure, adjustable strap, card slots. 28x20x10cm. Multiple colours.",           cat: "Bags & Accessories",  price: 22000,  moq: 30,   unit: "pieces",  lead: 18 },
    { sup: 2, name: "Men's Leather Wallet",            desc: "Slim bifold wallet, 8 card slots, bill compartment, RFID-blocking layer. Black, brown, tan.",                         cat: "Leather Goods",       price: 5500,   moq: 100,  unit: "pieces",  lead: 10 },
    { sup: 2, name: "Leather Laptop Sleeve",           desc: "Padded leather sleeve for 13–15 inch laptops, zip closure, front pocket. Caramel, black, olive.",                     cat: "Bags & Accessories",  price: 12000,  moq: 50,   unit: "pieces",  lead: 14 },
    // Aba Plastic Industries (idx 3)
    { sup: 3, name: "20L Jerry Can (HDPE)",            desc: "UN-certified HDPE jerry can, tamper-evident cap. Fuel, water, chemicals. Custom colours available.",                  cat: "Plastics",            price: 1850,   moq: 500,  unit: "pieces",  lead: 7  },
    { sup: 3, name: "Plastic Crate (40 Bottle)",       desc: "PP crate for 40x60cl bottles. Stackable, UV-stabilised, heavy-duty base. Red, blue, green.",                         cat: "Plastics",            price: 3200,   moq: 200,  unit: "pieces",  lead: 5  },
    { sup: 3, name: "Food Container Set (5-Piece)",    desc: "BPA-free PP containers: 0.5L, 1L, 2L, 3L, 5L, airtight lids. Dishwasher safe. Clear + coloured lids.",              cat: "Plastics",            price: 2400,   moq: 300,  unit: "sets",    lead: 5  },
    { sup: 3, name: "Industrial Drum Liner Bag",       desc: "LLDPE liners for 200L drums, 0.15mm, heat-sealed base. 50 liners per roll. Chemical-resistant.",                     cat: "Packaging",           price: 8500,   moq: 100,  unit: "rolls",   lead: 3  },
    { sup: 3, name: "PP Woven Sack (50kg)",            desc: "50kg PP woven sack, laminated or unlaminated, custom print available. Rice, grain, fertiliser grade.",                cat: "Packaging",           price: 480,    moq: 1000, unit: "pieces",  lead: 7  },
    // Uguru Furniture (idx 4)
    { sup: 4, name: "Executive Office Desk (L-Shape)", desc: "Mahogany veneer L-desk, cable management, 3 lockable drawers. 180x160x76cm.",                                        cat: "Furniture",           price: 185000, moq: 5,    unit: "pieces",  lead: 30 },
    { sup: 4, name: "Classroom Desk & Bench Set",      desc: "Plywood desk + bench, steel frame, anti-scratch surface. Stackable. Ages 6–15.",                                      cat: "Furniture",           price: 18500,  moq: 20,   unit: "sets",    lead: 21 },
    { sup: 4, name: "4-Door Steel Wardrobe",           desc: "Cold-rolled steel wardrobe, 4 doors, 6 shelves, hanging rail, key lock. 180x90x45cm. White and cream.",               cat: "Furniture",           price: 95000,  moq: 5,    unit: "pieces",  lead: 28 },
    // Ngozi Foods (idx 5)
    { sup: 5, name: "Red Palm Oil (25L Keg)",          desc: "Grade A unrefined red palm oil, NAFDAC-certified, cold-pressed, zero additives. Bright orange, rich flavour.",        cat: "Food Processing",     price: 28000,  moq: 50,   unit: "kegs",    lead: 5  },
    { sup: 5, name: "Groundnut Oil (20L Keg)",         desc: "Cold-pressed groundnut oil, NAFDAC-certified, zero cholesterol. Clear, light flavour. For frying and salads.",        cat: "Food Processing",     price: 34000,  moq: 50,   unit: "kegs",    lead: 5  },
    { sup: 5, name: "Dried Pepper Mix (1kg Pack)",     desc: "Sun-dried, milled chilli + bell pepper blend (75:25). No additives. Food-grade laminated pouches.",                   cat: "Food Processing",     price: 4500,   moq: 200,  unit: "packs",   lead: 3  },
    { sup: 5, name: "Ogiri (Fermented Locust Bean)",   desc: "Traditional ogiri, fermented, 50g discs. 20 discs per pack. NAFDAC-certified. Rich umami flavour.",                   cat: "Food Processing",     price: 3800,   moq: 200,  unit: "packs",   lead: 5  },
    // Nwankwo Auto Parts (idx 6)
    { sup: 6, name: "Car Seat Cover Set (5-Piece)",    desc: "PU leather seat covers, universal fit for most sedans. Front + rear + head rests. Black, grey, tan, wine.",           cat: "Auto Parts",          price: 28500,  moq: 50,   unit: "sets",    lead: 10 },
    { sup: 6, name: "Rubber Floor Mat Set (4-Piece)",  desc: "Heavy-duty rubber mats, universal trim-to-fit, raised edges to trap dirt. Black.",                                    cat: "Auto Parts",          price: 7500,   moq: 100,  unit: "sets",    lead: 7  },
    { sup: 6, name: "Steering Wheel Cover",            desc: "Microfibre leather cover, 37–39cm diameter, anti-slip, breathable. Black with red stitching.",                        cat: "Auto Parts",          price: 4200,   moq: 200,  unit: "pieces",  lead: 5  },
    // Chinonso Building Materials (idx 7)
    { sup: 7, name: "9-Inch Sandcrete Block",          desc: "Machine-vibrated 9-inch hollow block, 450x225x225mm. Grade A compressive strength 2.5N/mm2.",                        cat: "Building Materials",  price: 750,    moq: 500,  unit: "pieces",  lead: 3  },
    { sup: 7, name: "Interlocking Paving Tile",        desc: "60mm concrete interlocking tile, 200x100mm, various colours. Driveways, paths, car parks.",                           cat: "Building Materials",  price: 580,    moq: 1000, unit: "pieces",  lead: 5  },
    { sup: 7, name: "Precast Fence Post",              desc: "Reinforced concrete post, 2.1m x 125x125mm, 4 holes for infill panels. Treated surface. Standard grey.",              cat: "Building Materials",  price: 8500,   moq: 50,   unit: "pieces",  lead: 7  },
  ];

  const createdProducts: { id: string; supplierId: string; unitPrice: number }[] = [];

  for (const p of productsData) {
    const sup     = suppliers[p.sup];
    const factory = factoryByUser.get(sup.id);
    if (!factory) continue;

    const product = await prisma.product.create({
      data: {
        supplierId:   sup.id,
        factoryId:    factory.id,
        name:         p.name,
        description:  p.desc,
        category:     p.cat,
        unitPrice:    p.price,
        moq:          p.moq,
        unit:         p.unit,
        leadTimeDays: p.lead,
        inStock:      true,
        images:       [],
      },
    });
    createdProducts.push({ id: product.id, supplierId: sup.id, unitPrice: product.unitPrice });
  }

  console.log(`✓ ${createdProducts.length} products`);

  // ── RFQs ──────────────────────────────────────────────────────────────────────

  type RFQStatus = "OPEN" | "REVIEWING" | "AWARDED" | "CLOSED" | "CANCELLED";

  const rfqData: {
    buyer: number; title: string; desc: string; cat: string;
    qty: number; budMin: number; budMax: number;
    loc: string; deadline: Date; status: RFQStatus;
  }[] = [
    { buyer: 0, title: "500 Pairs Corporate Oxford Shoes — Black",    desc: "500 pairs of black leather oxford shoes for corporate staff. Sizes 38–46. Company logo embossed on insole.",                    cat: "Footwear",            qty: 500,    budMin: 4000000,   budMax: 7000000,   loc: "Lagos Island, Lagos",         deadline: daysFromNow(14), status: "OPEN"      },
    { buyer: 1, title: "School Uniform — 200 Primary Sets",           desc: "200 primary school uniform sets (khaki shorts + white shirt). Sizes ages 6–12. Badge embroidery on breast pocket.",            cat: "Garments & Textiles", qty: 200,    budMin: 900000,    budMax: 1500000,   loc: "Enugu State",                 deadline: daysFromNow(21), status: "OPEN"      },
    { buyer: 2, title: "Branded Tote Bags — Ankara Print (300 pcs)", desc: "300 Ankara tote bags for an NGO conference. Logo print on front panel. Ready in 4 weeks.",                                      cat: "Bags & Accessories",  qty: 300,    budMin: 700000,    budMax: 1200000,   loc: "Abuja FCT",                   deadline: daysFromNow(28), status: "REVIEWING"  },
    { buyer: 0, title: "5,000 HDPE Jerry Cans (20L) — UN Certified",  desc: "5,000 UN-certified 20L HDPE jerry cans for lubricant packaging line. Red colour preferred.",                                    cat: "Plastics",            qty: 5000,   budMin: 7000000,   budMax: 10000000,  loc: "Aba, Abia State",             deadline: daysFromNow(10), status: "OPEN"      },
    { buyer: 1, title: "Office Furniture — 20 Executive Desks",       desc: "20 L-shaped executive desks for new head office. Mahogany finish, cable management trays, pedestal drawers.",                  cat: "Furniture",           qty: 20,     budMin: 2500000,   budMax: 4000000,   loc: "Port Harcourt, Rivers State", deadline: daysFromNow(45), status: "AWARDED"   },
    { buyer: 2, title: "Palm Oil Supply — 100 Kegs Monthly",          desc: "Consistent monthly supply of 100 x 25L kegs of red palm oil, Grade A, for restaurant chain.",                                  cat: "Food Processing",     qty: 100,    budMin: 2200000,   budMax: 3000000,   loc: "Onitsha, Anambra State",      deadline: daysFromNow(7),  status: "OPEN"      },
    { buyer: 0, title: "500,000 Sandcrete Blocks — 9-Inch",           desc: "Estate development in Aba. 500,000 x 9-inch blocks in 3 batches over 6 months.",                                               cat: "Building Materials",  qty: 500000, budMin: 300000000, budMax: 420000000, loc: "Aba, Abia State",             deadline: daysFromNow(30), status: "OPEN"      },
    { buyer: 1, title: "Car Seat Cover Sets — 200 Units",             desc: "200 PU leather seat cover sets for accessories retail shop. Black, grey, tan (60/40/20 split).",                               cat: "Auto Parts",          qty: 200,    budMin: 4000000,   budMax: 6500000,   loc: "Lagos, Ikeja",                deadline: daysFromNow(18), status: "OPEN"      },
    { buyer: 2, title: "200 Leather Briefcases — Corporate Gifting",  desc: "200 executive briefcases, company logo hot-stamped in gold. Premium packaging required.",                                      cat: "Bags & Accessories",  qty: 200,    budMin: 5000000,   budMax: 8000000,   loc: "Lagos, Victoria Island",      deadline: daysFromNow(35), status: "REVIEWING"  },
    { buyer: 0, title: "Groundnut Oil — 300 Kegs",                    desc: "300 x 20L cold-pressed groundnut oil kegs for distribution to retail shops in Enugu and Anambra.",                             cat: "Food Processing",     qty: 300,    budMin: 8000000,   budMax: 11000000,  loc: "Enugu State",                 deadline: daysFromNow(12), status: "CLOSED"    },
    { buyer: 1, title: "PP Woven Sacks — 50,000 Pieces",              desc: "50,000 x 50kg PP woven sacks for rice processing mill. White with custom print. Food-grade certified.",                        cat: "Packaging",           qty: 50000,  budMin: 18000000,  budMax: 28000000,  loc: "Kebbi State",                 deadline: daysFromNow(20), status: "OPEN"      },
    { buyer: 2, title: "School Sandals — 1,000 Pairs",                desc: "1,000 pairs of children's school sandals for retail network. Brown and black, sizes 28–36. Velcro fastening.",                cat: "Footwear",            qty: 1000,   budMin: 3000000,   budMax: 5000000,   loc: "Anambra State",               deadline: daysAgo(3),      status: "CANCELLED" },
  ];

  const createdRFQs: { id: string; buyerId: string; status: string }[] = [];

  for (const r of rfqData) {
    const rfq = await prisma.rFQ.create({
      data: {
        buyerId:               buyers[r.buyer].id,
        title:                 r.title,
        description:           r.desc,
        category:              r.cat,
        quantity:              r.qty,
        budgetMin:             r.budMin,
        budgetMax:             r.budMax,
        deliveryLocation:      r.loc,
        deadline:              r.deadline,
        status:                r.status,
        customizationRequired: false,
      },
    });
    createdRFQs.push({ id: rfq.id, buyerId: rfq.buyerId, status: rfq.status });
  }

  console.log(`✓ ${createdRFQs.length} RFQs`);

  // ── Quotes ────────────────────────────────────────────────────────────────────

  type QuoteStatus = "PENDING" | "ACCEPTED" | "REJECTED";

  const quoteData: {
    rfq: number; sup: number; unitP: number; totalP: number;
    lead: number; notes: string; validDays: number; status: QuoteStatus;
  }[] = [
    { rfq: 0,  sup: 0, unitP: 11500,  totalP: 5750000,  lead: 14, notes: "Full-grain leather. Custom insole logo included.",                                     validDays: 20, status: "PENDING"  },
    { rfq: 0,  sup: 1, unitP: 13000,  totalP: 6500000,  lead: 18, notes: "Premium chromium-tanned leather. 2-year sole warranty.",                               validDays: 15, status: "PENDING"  },
    { rfq: 1,  sup: 1, unitP: 6200,   totalP: 1240000,  lead: 12, notes: "Pre-shrunk poly-cotton blend. Badge embroidery included. Can batch-deliver.",           validDays: 21, status: "PENDING"  },
    { rfq: 2,  sup: 1, unitP: 2800,   totalP: 840000,   lead: 10, notes: "Genuine Ankara wax print from Kano. Logo screen-printed on front.",                    validDays: 14, status: "PENDING"  },
    { rfq: 2,  sup: 2, unitP: 3200,   totalP: 960000,   lead: 8,  notes: "Premium finish, reinforced handles and inner pocket. Sample available.",                validDays: 14, status: "PENDING"  },
    { rfq: 3,  sup: 3, unitP: 1800,   totalP: 9000000,  lead: 7,  notes: "UN-certified mould. Custom red colour. Minimum 5-day lead time.",                      validDays: 10, status: "PENDING"  },
    { rfq: 4,  sup: 4, unitP: 175000, totalP: 3500000,  lead: 30, notes: "Solid mahogany veneer. Installation team included for Port Harcourt site.",             validDays: 30, status: "ACCEPTED" },
    { rfq: 4,  sup: 3, unitP: 195000, totalP: 3900000,  lead: 35, notes: "MFC board with veneer overlay. Cheaper but highly durable.",                           validDays: 20, status: "REJECTED" },
    { rfq: 5,  sup: 5, unitP: 26500,  totalP: 2650000,  lead: 5,  notes: "NAFDAC cert A1-2345. Guaranteed monthly supply. Free delivery to Onitsha.",             validDays: 15, status: "PENDING"  },
    { rfq: 7,  sup: 6, unitP: 26000,  totalP: 5200000,  lead: 10, notes: "Universal fit confirmed on Toyota, Honda, Kia. Samples available in Lagos.",            validDays: 14, status: "PENDING"  },
    { rfq: 8,  sup: 2, unitP: 33000,  totalP: 6600000,  lead: 25, notes: "Full-grain bovine leather. Gold foil hot-stamping included. Premium gift box.",         validDays: 21, status: "PENDING"  },
    { rfq: 8,  sup: 0, unitP: 37000,  totalP: 7400000,  lead: 21, notes: "Semi-aniline calfskin. Comes with dust bag and authenticity card.",                    validDays: 18, status: "PENDING"  },
    { rfq: 10, sup: 3, unitP: 470,    totalP: 23500000, lead: 7,  notes: "Food-grade cert available. 50-ton/week capacity. Custom 2-colour print.",               validDays: 12, status: "PENDING"  },
  ];

  const createdQuotes: { id: string; rfqId: string; supplierId: string }[] = [];

  for (const q of quoteData) {
    try {
      const quote = await prisma.quote.create({
        data: {
          rfqId:        createdRFQs[q.rfq].id,
          supplierId:   suppliers[q.sup].id,
          unitPrice:    q.unitP,
          totalPrice:   q.totalP,
          leadTimeDays: q.lead,
          notes:        q.notes,
          validUntil:   daysFromNow(q.validDays),
          status:       q.status,
        },
      });
      createdQuotes.push({ id: quote.id, rfqId: quote.rfqId, supplierId: quote.supplierId });
    } catch {
      // skip on unique conflict
    }
  }

  // Wire awardedQuoteId on RFQ 4
  const awardedQuote = createdQuotes.find(
    (q) => q.rfqId === createdRFQs[4].id && q.supplierId === suppliers[4].id
  );
  if (awardedQuote) {
    await prisma.rFQ.update({ where: { id: createdRFQs[4].id }, data: { awardedQuoteId: awardedQuote.id } });
  }

  console.log(`✓ ${createdQuotes.length} quotes`);

  // ── Orders ────────────────────────────────────────────────────────────────────

  type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED";
  type OrderSource = "DIRECT" | "RFQ";

  type OrderDef = {
    buyerIdx: number;
    supIdx:   number;
    prodIdx:  number;
    qty:      number;
    status:   OrderStatus;
    source:   OrderSource;
    address:  string;
    notes?:   string;
    daysAgoN: number;
  };

  async function makeOrder(opts: OrderDef) {
    const buyer  = buyers[opts.buyerIdx];
    const sup    = suppliers[opts.supIdx];
    const prods  = createdProducts.filter((p) => p.supplierId === sup.id);
    if (!prods.length) return null;
    const prod   = prods[opts.prodIdx % prods.length];
    const total  = prod.unitPrice * opts.qty;

    return prisma.order.create({
      data: {
        buyerId:         buyer.id,
        supplierId:      sup.id,
        status:          opts.status,
        source:          opts.source,
        totalAmount:     total,
        deliveryAddress: opts.address,
        notes:           opts.notes,
        createdAt:       daysAgo(opts.daysAgoN),
        items: {
          create: [{
            productId: prod.id,
            quantity:  opts.qty,
            unitPrice: prod.unitPrice,
            total,
          }],
        },
      },
    });
  }

  const orderDefs: OrderDef[] = [
    // PENDING
    { buyerIdx: 0, supIdx: 0, prodIdx: 0, qty: 200,  status: "PENDING",       source: "DIRECT", address: "14 Broad Street, Lagos Island, Lagos",              daysAgoN: 1  },
    { buyerIdx: 1, supIdx: 3, prodIdx: 0, qty: 2000, status: "PENDING",       source: "DIRECT", address: "Trans Amadi Industrial Layout, Port Harcourt",       daysAgoN: 0  },
    // CONFIRMED
    { buyerIdx: 2, supIdx: 1, prodIdx: 0, qty: 100,  status: "CONFIRMED",     source: "DIRECT", address: "7 Awolowo Way, Ikeja, Lagos",    notes: "Include school logo on breast pocket", daysAgoN: 5 },
    { buyerIdx: 0, supIdx: 5, prodIdx: 0, qty: 50,   status: "CONFIRMED",     source: "DIRECT", address: "Upper Iweka Road, Onitsha",                          daysAgoN: 4  },
    // IN_PRODUCTION
    { buyerIdx: 1, supIdx: 0, prodIdx: 1, qty: 150,  status: "IN_PRODUCTION", source: "DIRECT", address: "Oguta Road, Owerri, Imo State", notes: "Black only, corporate heel height", daysAgoN: 10 },
    { buyerIdx: 2, supIdx: 3, prodIdx: 1, qty: 500,  status: "IN_PRODUCTION", source: "DIRECT", address: "Nnewi Industrial Market, Anambra",                   daysAgoN: 8  },
    // SHIPPED
    { buyerIdx: 0, supIdx: 6, prodIdx: 0, qty: 100,  status: "SHIPPED",       source: "DIRECT", address: "7 Airport Road, Ikeja, Lagos",                       daysAgoN: 15 },
    { buyerIdx: 1, supIdx: 2, prodIdx: 0, qty: 50,   status: "SHIPPED",       source: "DIRECT", address: "Gwarinpa Estate, Abuja FCT",                          daysAgoN: 12 },
    // DELIVERED
    { buyerIdx: 0, supIdx: 5, prodIdx: 1, qty: 100,  status: "DELIVERED",     source: "DIRECT", address: "Onitsha Head Bridge, Anambra",                       daysAgoN: 30 },
    { buyerIdx: 1, supIdx: 0, prodIdx: 0, qty: 300,  status: "DELIVERED",     source: "DIRECT", address: "Victoria Island, Lagos",                              daysAgoN: 25 },
    { buyerIdx: 2, supIdx: 4, prodIdx: 0, qty: 10,   status: "DELIVERED",     source: "RFQ",    address: "GRA Phase 2, Port Harcourt",                          daysAgoN: 40 },
    { buyerIdx: 0, supIdx: 1, prodIdx: 3, qty: 200,  status: "DELIVERED",     source: "DIRECT", address: "Garki, Abuja FCT",                                    daysAgoN: 45 },
    // CANCELLED
    { buyerIdx: 2, supIdx: 7, prodIdx: 0, qty: 500,  status: "CANCELLED",     source: "DIRECT", address: "Calabar, Cross River State",                         daysAgoN: 20 },
    // DISPUTED
    { buyerIdx: 1, supIdx: 7, prodIdx: 1, qty: 2000, status: "DISPUTED",      source: "DIRECT", address: "Kano City, Kano State", notes: "Wrong specification received", daysAgoN: 35 },
  ];

  const createdOrders: NonNullable<Awaited<ReturnType<typeof makeOrder>>>[] = [];
  for (const def of orderDefs) {
    const o = await makeOrder(def);
    if (o) createdOrders.push(o);
  }

  console.log(`✓ ${createdOrders.length} orders`);

  // ── Payments ──────────────────────────────────────────────────────────────────

  const payableStatuses = new Set(["CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED"]);
  const payableOrders   = createdOrders.filter((o) => payableStatuses.has(o.status));

  for (let i = 0; i < payableOrders.length; i++) {
    const o      = payableOrders[i];
    const ref    = `EKO-SEED-${o.id.slice(0, 8)}-${i}`;
    const status = (o.status === "DELIVERED" || o.status === "SHIPPED") ? "SUCCESS" : "PENDING";
    await prisma.payment.upsert({
      where:  { paystackRef: ref },
      update: {},
      create: { orderId: o.id, paystackRef: ref, amount: o.totalAmount, status },
    });
  }

  console.log(`✓ ${payableOrders.length} payments`);

  // ── Reviews ───────────────────────────────────────────────────────────────────

  const deliveredOrders = createdOrders.filter((o) => o.status === "DELIVERED");

  const reviewTexts = [
    { rating: 5, comment: "Outstanding quality. The finish exceeded our expectations and delivery was 3 days ahead of schedule." },
    { rating: 5, comment: "Best supplier we have worked with. Communication was excellent throughout production. Will order again." },
    { rating: 4, comment: "Good product, solid quality. Minor colour consistency issue on 3 pieces but resolved quickly." },
    { rating: 4, comment: "On-time delivery and good packaging. Price is competitive. Happy to recommend." },
  ];

  for (let i = 0; i < Math.min(deliveredOrders.length, reviewTexts.length); i++) {
    const o = deliveredOrders[i];
    try {
      await prisma.review.create({
        data: {
          orderId:    o.id,
          buyerId:    o.buyerId,
          supplierId: o.supplierId,
          rating:     reviewTexts[i].rating,
          comment:    reviewTexts[i].comment,
          createdAt:  daysAgo(2),
        },
      });
    } catch {
      // skip duplicate orderId
    }
  }

  console.log(`✓ ${Math.min(deliveredOrders.length, reviewTexts.length)} reviews`);

  // ── Verification Requests ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.verificationRequest.create({ data: { userId: suppliers[4].id, targetLevel: "VERIFIED_FACILITY",  message: "Facility expanded to 800sqm and ready for inspection.", documents: [], status: "PENDING"  } }),
    prisma.verificationRequest.create({ data: { userId: suppliers[6].id, targetLevel: "VERIFIED_FACILITY",  message: "Facility ready. We supply Slot and Ruff n Tumble.",     documents: [], status: "PENDING"  } }),
    prisma.verificationRequest.create({ data: { userId: suppliers[7].id, targetLevel: "VERIFIED_BUSINESS",  message: "CAC cert available. Operating since 2015.",             documents: [], status: "PENDING"  } }),
    prisma.verificationRequest.create({ data: { userId: suppliers[2].id, targetLevel: "FACTORY_CERTIFIED",  message: "Passed facility visit. Requesting certification upgrade.", documents: [], status: "APPROVED", adminNote: "Inspection passed 2026-05-12. Approved." } }),
  ]);

  console.log("✓ verification requests");

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Ekorafon seed complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ADMIN (role: ADMIN)
  ────────────────────────────────────────────────────
  admin@ekorafon.com              password: Admin2026!

  BUYERS (role: BUYER)
  ────────────────────────────────────────────────────
  adaeze.obi@gmail.com
  emeka.nwosu@tradehub.ng
  chioma.eze@fashionwholesale.com

  SUPPLIERS (role: SUPPLIER)
  ────────────────────────────────────────────────────
  info@abafootwear.com            EXPORT_CERTIFIED  91
  sales@abagarments.ng            FACTORY_CERTIFIED 78
  production@kelechi-bags.com     VERIFIED_FACILITY 67
  info@abaplasticworks.ng         FACTORY_CERTIFIED 84
  orders@uguru-furniture.com      VERIFIED_BUSINESS 55
  info@abafoodprocessing.ng       VERIFIED_FACILITY 72
  contact@nwankwo-autoparts.com   VERIFIED_BUSINESS 61
  sales@ababuilding.ng            UNVERIFIED

  PASSWORD (buyers + suppliers): Test1234!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

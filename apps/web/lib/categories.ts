/**
 * Category landing page content for /manufacturers/[category].
 * `name` must match the productCategories values used by the API.
 * Copy is unique per category — each page targets its own keyword cluster.
 */

export interface CategoryFaq {
  q: string;
  a: string;
}

export interface CategoryContent {
  slug: string;
  name: string;
  h1: string;
  title: string;
  description: string;
  intro: string[];
  faqs: CategoryFaq[];
}

export const CATEGORY_PAGES: CategoryContent[] = [
  {
    slug: "footwear",
    name: "Footwear",
    h1: "Shoe & Footwear Manufacturers in Aba, Nigeria",
    title: "Aba Shoe Manufacturers — Wholesale Made-in-Aba Footwear",
    description:
      "Source made-in-Aba shoes, sandals and slippers wholesale from verified Nigerian footwear manufacturers. Compare MOQs, post a free RFQ and get direct factory quotes.",
    intro: [
      "Aba is the footwear capital of West Africa — its shoe clusters around Ariaria International Market produce over a million pairs of shoes, sandals and slippers every week, supplying markets across Nigeria, Ghana, Cameroon and beyond. Made-in-Aba shoes are known for quality leatherwork at a fraction of import prices.",
      "On Ekorafon you can browse verified Aba shoe manufacturers, compare minimum order quantities and trade reputation scores, and request custom production — from men's leather shoes and ladies' footwear to school sandals, safety boots and slippers — directly from the factory, with no sourcing agents in between.",
    ],
    faqs: [
      {
        q: "What is the typical MOQ for made-in-Aba shoes?",
        a: "Minimum order quantities vary by factory and style, but many Aba footwear producers accept orders from a few dozen pairs for standard designs. Each manufacturer profile on Ekorafon lists its MOQ, so you can filter for factories that match your order size before requesting a quote.",
      },
      {
        q: "Can Aba shoe factories produce my own custom design?",
        a: "Yes. Custom production is Aba's specialty — factories routinely produce shoes to a buyer's sample, photo or specification, including private-label branding. Post a request for quotation on Ekorafon describing your design, quantity and budget, and verified footwear manufacturers will respond with pricing and lead times.",
      },
    ],
  },
  {
    slug: "leather-goods",
    name: "Leather Goods",
    h1: "Leather Goods Manufacturers in Aba, Nigeria",
    title: "Leather Goods Manufacturers in Nigeria — Belts, Wallets & More",
    description:
      "Buy wholesale leather belts, wallets, sandals and accessories direct from verified Aba leather manufacturers. Post a free RFQ and compare factory quotes on Ekorafon.",
    intro: [
      "Aba's leather workers have built a reputation across Africa for genuine leather craftsmanship — belts, wallets, sandals, watch straps and bespoke leather accessories produced by hand and by machine in the workshops of Abia State. Nigerian leather, tanned locally in Kano and Aba, competes with imports on both quality and price.",
      "Ekorafon connects you to verified leather goods manufacturers in Aba so you can source wholesale or commission custom production. Check each factory's verification badge, ETRS trade reputation score and minimum order quantity, then request quotes directly — no middlemen, no agent fees.",
    ],
    faqs: [
      {
        q: "Is made-in-Aba leather genuine leather?",
        a: "Reputable Aba leather factories work with genuine locally tanned hides as well as synthetic alternatives, and will state the material grade in their quote. On Ekorafon, verification badges and ETRS reputation scores help you identify manufacturers with a track record of delivering the material quality they promise.",
      },
      {
        q: "Can I order branded leather goods for my business?",
        a: "Yes. Aba leather manufacturers commonly emboss or print customer logos on belts, wallets and bags for corporate gifts and private labels. Describe your branding requirements in your RFQ and factories will include customization in their quotes.",
      },
    ],
  },
  {
    slug: "garments-textiles",
    name: "Garments & Textiles",
    h1: "Clothing & Garment Manufacturers in Aba, Nigeria",
    title: "Wholesale Clothing Manufacturers in Aba, Nigeria",
    description:
      "Find verified garment factories in Aba for wholesale clothing, uniforms, Ankara fashion and custom apparel. Post a free RFQ and get direct quotes from Nigerian manufacturers.",
    intro: [
      "Often called the \"Japan of Africa\", Aba is Nigeria's garment manufacturing hub — thousands of tailoring workshops and textile factories produce ready-made clothing, school and corporate uniforms, Ankara fashion, sportswear and traditional attire at wholesale prices that undercut imports.",
      "Whether you need five hundred polo shirts, branded workwear or a full cut-and-sew production run to your own design, Ekorafon lets you compare verified clothing manufacturers in Aba by MOQ, team size and trade reputation, then collect quotes with a single free request for quotation.",
    ],
    faqs: [
      {
        q: "What clothing can I produce wholesale in Aba?",
        a: "Aba garment factories produce virtually every category: T-shirts and polos, school and corporate uniforms, suits and native wear, Ankara and African-print fashion, sportswear, children's clothing and workwear. Most factories handle both ready-made stock and custom cut-and-sew orders to your specification.",
      },
      {
        q: "How do lead times work for garment orders from Nigeria?",
        a: "Lead times depend on quantity and complexity — small runs of standard items can ship in days, while large custom orders typically take a few weeks. Each quote you receive through Ekorafon's RFQ system states the factory's lead time so you can compare speed as well as price.",
      },
    ],
  },
  {
    slug: "bags-accessories",
    name: "Bags & Accessories",
    h1: "Bag Manufacturers in Aba, Nigeria",
    title: "Bag Manufacturers in Nigeria — Wholesale Bags from Aba",
    description:
      "Source wholesale handbags, tote bags, backpacks and travel bags direct from verified Aba bag manufacturers. Compare MOQs and get free factory quotes on Ekorafon.",
    intro: [
      "From handbags and tote bags to backpacks, travel luggage and laptop bags, Aba's bag makers supply traders across Nigeria and West Africa. Buying bulk bags directly from an Aba factory means wholesale pricing, flexible customization and designs adapted to your market.",
      "Ekorafon's verified directory lets you find bag and accessories manufacturers in Aba, review their minimum order quantities and trade reputation, and post a free request for quotation — factories respond directly with wholesale prices and production lead times.",
    ],
    faqs: [
      {
        q: "Where can I buy bulk tote bags in Aba?",
        a: "Instead of travelling to Ariaria International Market, you can source bulk tote bags online through Ekorafon: browse verified bag manufacturers in Aba, check their MOQs, and post a free RFQ describing the size, material and print you need. Factories quote you directly with wholesale pricing.",
      },
      {
        q: "Can Aba bag factories print my logo on bags?",
        a: "Yes — branded tote bags, souvenir bags and corporate gift bags are a core Aba specialty. Include your logo artwork and quantity in your RFQ, and manufacturers will quote with printing or embroidery included.",
      },
    ],
  },
  {
    slug: "auto-parts",
    name: "Auto Parts",
    h1: "Auto Parts Manufacturers in Aba, Nigeria",
    title: "Auto Parts Manufacturers & Suppliers in Nigeria",
    description:
      "Source Nigerian-made auto parts and components wholesale from verified Aba manufacturers. Post a free RFQ and compare direct factory quotes on Ekorafon.",
    intro: [
      "Aba's fabrication cluster produces a growing range of automotive components — from rubber bushings, gaskets and filters to fabricated metal parts and re-manufactured components that keep Nigeria's vehicle fleet on the road at a fraction of import cost.",
      "Use Ekorafon to find verified auto parts manufacturers in Aba, review their capabilities and trade reputation, and request quotes for wholesale supply or custom fabrication to your sample or drawing.",
    ],
    faqs: [
      {
        q: "Can Nigerian factories fabricate a part to my sample?",
        a: "Yes. Many Aba fabricators specialize in reverse-engineering: provide a sample or technical drawing in your RFQ and manufacturers will quote for a custom production run, including tooling where needed.",
      },
      {
        q: "How do I check the quality of an auto parts supplier?",
        a: "Every factory on Ekorafon carries a verification level — from Verified Business to Export Certified — plus an ETRS trade reputation score built from completed transactions. Review both before you accept a quote.",
      },
    ],
  },
  {
    slug: "plastics",
    name: "Plastics",
    h1: "Plastic Products Manufacturers in Aba, Nigeria",
    title: "Plastic Manufacturers in Nigeria — Wholesale & Custom Molding",
    description:
      "Find verified plastic manufacturers in Aba for household plastics, containers and custom injection molding. Post a free RFQ for direct wholesale factory quotes.",
    intro: [
      "Nigeria's plastics industry turns out household wares, storage containers, crates, buckets, packaging inserts and custom-molded components — and Aba's plastic factories serve wholesalers across the South-East and beyond with competitive factory-gate pricing.",
      "On Ekorafon you can compare verified plastic products manufacturers by MOQ and reputation, then post a free request for quotation for stock items or custom injection-molded production with your own molds or designs.",
    ],
    faqs: [
      {
        q: "Do Aba plastic factories offer custom injection molding?",
        a: "Several do — for custom molds, describe your product, dimensions and quantities in an RFQ. Factories will quote for mold-making (where required) and per-unit production, with lead times for each stage.",
      },
      {
        q: "What is the usual minimum order for wholesale plastic products?",
        a: "Stock household items are typically sold by the carton or dozen with low MOQs, while custom molded products carry higher minimums to justify mold costs. Each manufacturer profile lists its MOQ so you can filter before you request quotes.",
      },
    ],
  },
  {
    slug: "furniture",
    name: "Furniture",
    h1: "Furniture Manufacturers in Aba, Nigeria",
    title: "Furniture Manufacturers in Nigeria — Wholesale & Custom Made",
    description:
      "Order wholesale and custom furniture direct from verified Aba furniture makers — home, office and commercial. Post a free RFQ and compare factory quotes on Ekorafon.",
    intro: [
      "Aba's carpenters and furniture factories build sofas, beds, office desks, school furniture and commercial fit-outs from locally sourced hardwood and upholstery — made-to-order craftsmanship at prices well below imported furniture.",
      "Ekorafon lets you source furniture manufacturers in Aba with verified profiles and trade reputation scores. Post a free RFQ for bulk orders — hotel or school furniture, office fit-outs, retail displays — and receive direct quotes from workshops that can build to your drawings or photos.",
    ],
    faqs: [
      {
        q: "Can I order furniture built to my own design?",
        a: "Yes — custom builds are the norm in Aba. Attach photos, dimensions or drawings to your RFQ and furniture makers will quote for materials, finish options and delivery timelines.",
      },
      {
        q: "Do Aba furniture makers handle bulk institutional orders?",
        a: "Many factories supply schools, hotels, churches and offices at scale. Check each profile's team size and years of operation on Ekorafon to gauge capacity, and state your full quantity in the RFQ so factories can quote realistic lead times.",
      },
    ],
  },
  {
    slug: "packaging",
    name: "Packaging",
    h1: "Packaging Manufacturers in Aba, Nigeria",
    title: "Packaging Manufacturers in Nigeria — Boxes, Labels & Nylon",
    description:
      "Source cartons, boxes, labels, nylon and branded packaging wholesale from verified Nigerian packaging manufacturers. Post a free RFQ for direct factory quotes.",
    intro: [
      "Every product needs packaging — and Nigerian packaging factories in and around Aba produce corrugated cartons, paper boxes, printed labels, nylon bags and branded pouches for food, cosmetics, fashion and industrial customers.",
      "Find verified packaging manufacturers on Ekorafon, compare minimum order quantities, and post a free request for quotation with your artwork and specifications to receive wholesale printing and production quotes directly from the factory.",
    ],
    faqs: [
      {
        q: "Can I get branded packaging printed in Nigeria?",
        a: "Yes — full-color printed cartons, labels, pouches and nylon are produced locally. Include your artwork files, dimensions and quantities in your RFQ and packaging factories will quote with plate/setup costs and per-unit pricing.",
      },
      {
        q: "What quantities do packaging factories accept?",
        a: "Printed packaging usually starts at a few hundred to a few thousand units depending on the format, because printing setup dominates small-run costs. MOQs are listed on each Ekorafon factory profile so you can match a supplier to your order size.",
      },
    ],
  },
  {
    slug: "food-processing",
    name: "Food Processing",
    h1: "Food Processing Companies in Aba, Nigeria",
    title: "Food Processing & Packaged Food Manufacturers in Nigeria",
    description:
      "Source packaged foods, snacks and food ingredients wholesale from verified Nigerian food processors. Post a free RFQ and get direct quotes on Ekorafon.",
    intro: [
      "Nigeria's food processors turn local produce into packaged staples — garri, palm oil, spices, snacks, beverages and more — for wholesale distribution at home and export abroad. Aba and the wider South-East sit at the heart of this supply chain.",
      "On Ekorafon you can find verified food processing companies, review their certifications and trade reputation, and post a free RFQ for wholesale supply, white-label production or export-ready packaged foods.",
    ],
    faqs: [
      {
        q: "Can I white-label Nigerian food products for my brand?",
        a: "Yes — many processors offer contract or white-label production. Describe your product, packaging and target quantities in an RFQ and food manufacturers will quote for production under your brand.",
      },
      {
        q: "Are Ekorafon food processors export-ready?",
        a: "Factories with the Export Certified badge meet international-grade standards. For regulated products, confirm NAFDAC registration and export documentation with the supplier during the quote process — their profile and ETRS score reflect their track record.",
      },
    ],
  },
  {
    slug: "building-materials",
    name: "Building Materials",
    h1: "Building Materials Manufacturers in Aba, Nigeria",
    title: "Building Materials Suppliers & Manufacturers in Nigeria",
    description:
      "Buy building materials wholesale — blocks, roofing, doors, fittings — direct from verified Nigerian manufacturers. Post a free RFQ for direct factory pricing.",
    intro: [
      "From concrete blocks, interlocking pavers and roofing sheets to doors, window frames and plumbing fittings, Nigerian building materials factories supply the country's construction boom at factory-gate prices.",
      "Ekorafon connects builders, developers and traders with verified building materials manufacturers in Aba and beyond. Compare suppliers by verification level and trade reputation, then post a free RFQ with your bill of quantities to receive direct wholesale quotes.",
    ],
    faqs: [
      {
        q: "Can I order building materials in bulk for a construction project?",
        a: "Yes — that's exactly what the RFQ system is for. Post your bill of quantities with delivery location and timeline, and manufacturers respond with bulk pricing. Larger orders typically attract better factory-gate rates.",
      },
      {
        q: "Do manufacturers deliver building materials to site?",
        a: "Delivery terms vary by factory and order size — many arrange haulage for bulk orders. State your site location in the RFQ so quotes include (or itemize) delivery to your project.",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryContent | undefined {
  return CATEGORY_PAGES.find((c) => c.slug === slug);
}

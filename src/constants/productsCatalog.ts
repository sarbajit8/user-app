export interface CatalogProduct {
  id: number | string;
  name: string;
  brand?: string;
  vendor?: string;
  vendorRating?: number;
  price: number;
  mrp?: number;
  originalPrice?: number;
  discount?: number;
  bankOfferPrice?: number;
  bankOfferText?: string;
  rating?: number;
  reviews?: string | number;
  reviewsCount?: string | number;
  delivery?: string;
  stockLeft?: number;
  soldPercent?: number;
  image: string;
  images?: string[];
  colors?: { name: string; colorHex: string; borderHex?: string; image?: string }[];
  colorImageMap?: Record<string, string>;
  color_variety_title?: string;
  text_variety_title?: string;
  variants?: any[];
  sizes?: (string | number)[];
  description?: string;
  highlights?: string[];
  details?: Record<string, string>;
  moreInfo?: { label: string; value: string; icon: string }[];
  category?: string;
}

export const ALL_PRODUCTS_CATALOG: CatalogProduct[] = [
  // 1. Adonik Prime Wireless ANC Headphones Pro (Admin Direct)
  {
    id: 1,
    name: 'Adonik Prime Wireless ANC Headphones Pro',
    brand: 'Adonik Prime',
    vendor: 'Adonik Official Store (Admin)',
    vendorRating: 4.9,
    price: 4999,
    mrp: 8999,
    discount: 44,
    rating: 4.9,
    reviews: 342,
    reviewsCount: 342,
    delivery: 'Free Express Delivery by Tomorrow',
    bankOfferPrice: 4699,
    bankOfferText: 'with HDFC Bank offer',
    stockLeft: 65,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      {
        name: 'Matte Black',
        colorHex: '#18181B',
        borderHex: '#3F3F46',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Silver White',
        colorHex: '#E2E8F0',
        borderHex: '#CBD5E1',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Midnight Blue',
        colorHex: '#1E3A8A',
        borderHex: '#1E40AF',
        image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      },
    ],
    colorImageMap: {
      'Matte Black': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'Silver White': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'Midnight Blue': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    },
    sizes: ['Over-Ear Studio Fit'],
    description:
      'Flagship active noise-cancelling over-ear wireless headphones engineered directly by Adonik. Features 40mm custom beryllium acoustic drivers, 45-hour ultra battery lifespan, multi-device Bluetooth 5.3 connectivity, and quad-mic beamforming ENC for crystal-clear HD calling.',
    highlights: [
      '40mm Custom Beryllium Acoustic Drivers',
      'Up to 45 Hours Playback with ANC Enabled',
      'Hybrid Active Noise Cancellation (-42dB)',
      'Bluetooth 5.3 Multipoint Dual-Device Pairing',
      'Fast Charging: 10 mins charge = 5 hours listening',
    ],
    details: {
      'Driver Size': '40mm Beryllium Acoustic Drivers',
      'Battery Life': '45 Hours (ANC On) / 60 Hours (ANC Off)',
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Gold-Plated AUX',
      'Noise Cancellation': 'Hybrid Active Noise Cancellation (up to -42dB)',
      'Charging': 'USB-C Fast Charging (10 mins = 5 hrs playback)',
      'Warranty': '2 Years Comprehensive Adonik Shield Warranty',
    },
    moreInfo: [
      { label: 'Warranty', value: '2 Years Comprehensive Adonik Shield Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Delivery', value: 'Free Express Delivery by Tomorrow', icon: 'cube-outline' },
      { label: 'Return Policy', value: '7-Day Replacement Guarantee', icon: 'repeat-outline' },
      { label: 'Payment', value: 'Cash on Delivery & UPI Accepted', icon: 'cash-outline' },
    ],
  },

  // 2. Adonik Titan Fast-Charge PowerBank 20000mAh 65W (Admin Direct)
  {
    id: 2,
    name: 'Adonik Titan Fast-Charge PowerBank 20000mAh 65W',
    brand: 'Adonik Power',
    vendor: 'Adonik Official Store (Admin)',
    vendorRating: 4.8,
    price: 2499,
    mrp: 4999,
    discount: 50,
    rating: 4.8,
    reviews: 512,
    reviewsCount: 512,
    delivery: 'Free Delivery within 2 Days',
    bankOfferPrice: 2299,
    bankOfferText: 'with SBI Card offer',
    stockLeft: 120,
    category: 'Mobile Accessories',
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Graphite Grey', colorHex: '#334155', borderHex: '#475569' },
      { name: 'Deep Black', colorHex: '#0F172A', borderHex: '#1E293B' },
    ],
    sizes: ['20,000 mAh High Capacity'],
    description:
      '65W Power Delivery multi-port rapid battery pack designed by Adonik. Capable of super-fast charging laptops, MacBooks, tablets, and flagship smartphones simultaneously. Aircraft-safe lithium-polymer core with 12-layer Smart IC short circuit protection.',
    highlights: [
      '65W Ultra-High Output Power Delivery 3.0 / PPS',
      'Charges MacBooks, Laptops & Flagship Phones',
      'Triple Port Simultaneous Charging (2x USB-C + 1x USB-A)',
      'Real-time Digital LED Battery & Power Display',
      'Airline Approved & 12-Layer Safety Shield',
    ],
    details: {
      'Capacity': '20,000 mAh / 74Wh Li-Polymer',
      'Max Output': '65W Power Delivery 3.0 / PPS / QC 4.0+',
      'Ports': '2x USB-C (In/Out 65W) + 1x USB-A (22.5W)',
      'Display': 'Real-time Digital LED Voltage & % Monitor',
      'Weight': '380 grams',
      'Warranty': '18 Months Adonik Replacement Warranty',
    },
    moreInfo: [
      { label: 'Warranty', value: '18 Months Adonik Replacement Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Flight Safe', value: 'Complies with UN38.3 Aviation Standards', icon: 'airplane-outline' },
      { label: 'Return Policy', value: '7-Day Return / Replacement', icon: 'repeat-outline' },
    ],
  },

  // 3. Apple iPhone 15 Pro Max (TechZone Store)
  {
    id: 3,
    name: 'Apple iPhone 15 Pro Max (256GB, Natural Titanium)',
    brand: 'Apple',
    vendor: 'TechZone Store',
    vendorRating: 4.9,
    price: 134900,
    mrp: 159900,
    discount: 16,
    rating: 4.9,
    reviews: 289,
    reviewsCount: 289,
    delivery: 'Free Priority Delivery by Tomorrow',
    bankOfferPrice: 128900,
    bankOfferText: 'with ICICI Bank Credit Card',
    stockLeft: 18,
    category: 'Mobiles & Tablets',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      {
        name: 'Natural Titanium',
        colorHex: '#9E978E',
        borderHex: '#B5AFA8',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      },
      { name: 'Blue Titanium', colorHex: '#2E3B4E', borderHex: '#40526B' },
      { name: 'Black Titanium', colorHex: '#212224', borderHex: '#3A3C3E' },
      { name: 'White Titanium', colorHex: '#F2F2EC', borderHex: '#D5D5CF' },
    ],
    sizes: ['256GB', '512GB', '1TB'],
    description:
      'Forged in aerospace-grade titanium with the breakthrough A17 Pro chip, customisable Action button, 48MP main camera system with 5x telephoto optical zoom, and USB-C connectivity with USB 3 speeds.',
    highlights: [
      'Aerospace-Grade Grade 5 Titanium Design',
      'A17 Pro Chip with 6-Core Pro GPU',
      '48MP Pro Camera System with 5x Optical Telephoto',
      'Super Retina XDR Display with ProMotion 120Hz',
      'All-Day Battery Life & USB 3 Connectivity',
    ],
    details: {
      'Display': '6.7-inch Super Retina XDR OLED (120Hz ProMotion)',
      'Processor': 'Apple A17 Pro (3nm architecture)',
      'Storage': '256GB NVMe',
      'Camera': '48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto',
      'Build': 'Grade 5 Titanium Band with Ceramic Shield Front',
      'Operating System': 'iOS 18',
    },
    moreInfo: [
      { label: 'Warranty', value: '1 Year Apple India Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Authenticity', value: '100% Genuine Apple Sealed Pack', icon: 'ribbon-outline' },
      { label: 'Return Policy', value: '7-Day Return / Replacement', icon: 'repeat-outline' },
    ],
  },

  // 4. Nike Air Force 1 '07 Premium Retro Sneakers (FashionHub India)
  {
    id: 4,
    name: "Nike Air Force 1 '07 Premium Retro Sneakers",
    brand: 'Nike',
    vendor: 'FashionHub India',
    vendorRating: 4.7,
    price: 7495,
    mrp: 9995,
    discount: 25,
    rating: 4.7,
    reviews: 178,
    reviewsCount: 178,
    delivery: 'Free Standard Delivery',
    bankOfferPrice: 6995,
    bankOfferText: 'with Axis Bank Offer',
    stockLeft: 42,
    category: 'Shoes & Footwear',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Triple White', colorHex: '#FFFFFF', borderHex: '#CBD5E1' },
      { name: 'Black White', colorHex: '#0F172A', borderHex: '#334155' },
      { name: 'Retro Royal', colorHex: '#1D4ED8', borderHex: '#2563EB' },
    ],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    description:
      'The radiance lives on in the Nike Air Force 1 ’07. Crossing hardwood comfort with off-court flair, this hoops original pairs crisp full-grain leather with stitched overlays and legendary encapsulated Nike Air cushioning.',
    highlights: [
      'Full-Grain Calfskin Stitched Leather Upper',
      'Encapsulated Nike Air-Sole Heel Cushioning',
      'Padded Low-Cut Collar for Sleek Comfort',
      'Pivot Circle Solid Rubber Traction Outsole',
      'Embossed AF-1 Metallic Lace Dubrae',
    ],
    details: {
      'Upper Material': '100% Genuine Full-Grain Calfskin Leather',
      'Sole': 'Non-marking Pivot-Circle Solid Gum Rubber',
      'Cushioning': 'Encapsulated Nike Air-Sole unit in heel',
      'Closure': 'Lace-up with metallic AF1 dubrae',
      'Origin': 'Imported / Nike India Certified Vendor',
    },
    moreInfo: [
      { label: 'Guarantee', value: '100% Verified Original Nike Product', icon: 'checkmark-circle-outline' },
      { label: 'Returns', value: '10-Day Easy Size Exchange & Return', icon: 'repeat-outline' },
    ],
  },

  // 5. Samsung Galaxy S24 Ultra 5G (GadgetBazaar)
  {
    id: 5,
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)',
    brand: 'Samsung',
    vendor: 'GadgetBazaar',
    vendorRating: 4.8,
    price: 129999,
    mrp: 144999,
    discount: 10,
    rating: 4.8,
    reviews: 94,
    reviewsCount: 94,
    delivery: 'Free Express Delivery',
    bankOfferPrice: 124999,
    bankOfferText: 'with HDFC Bank Credit Card',
    stockLeft: 8,
    category: 'Mobiles & Tablets',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Titanium Gray', colorHex: '#64748B', borderHex: '#475569' },
      { name: 'Titanium Black', colorHex: '#1E293B', borderHex: '#334155' },
      { name: 'Titanium Violet', colorHex: '#581C87', borderHex: '#7E22CE' },
    ],
    sizes: ['256GB', '512GB', '1TB'],
    description:
      'Meet Galaxy S24 Ultra, with a sturdy shield of titanium built into the frame and Corning Gorilla Armor glass. Features Galaxy AI photo editing, Live Call Translation, 200MP Quad Tele camera, and embedded S-Pen stylus.',
    highlights: [
      'Galaxy AI with Live Call Translation & Circle to Search',
      '200MP Quad Telephoto Camera System with 100x Space Zoom',
      'Built-in Bluetooth Enabled S-Pen Stylus',
      'Corning Gorilla Armor Anti-Reflective Display',
      '5000mAh Battery with 45W Super Fast Charging 2.0',
    ],
    details: {
      'Display': '6.8-inch Dynamic AMOLED 2X QHD+ (2600 nits peak)',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'RAM / Storage': '12GB LPDDR5X / 512GB UFS 4.0',
      'Camera': '200MP + 50MP (5x) + 10MP (3x) + 12MP Ultra-wide',
      'Battery': '5000 mAh with 45W Super Fast Charging 2.0',
      'Stylus': 'Embedded S-Pen with Bluetooth Air Actions',
    },
    moreInfo: [
      { label: 'Warranty', value: '1 Year Samsung India Brand Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Return Policy', value: '7-Day Return / Replacement', icon: 'repeat-outline' },
    ],
  },

  // 6. Seiko Presage Cocktail Time Automatic Watch (Aura Lifestyle)
  {
    id: 6,
    name: 'Seiko Presage Cocktail Time Automatic Wrist Watch',
    brand: 'Seiko',
    vendor: 'Aura Lifestyle',
    vendorRating: 4.9,
    price: 38500,
    mrp: 45000,
    discount: 14,
    rating: 4.9,
    reviews: 67,
    reviewsCount: 67,
    delivery: 'Free Insured Express Delivery',
    bankOfferPrice: 36500,
    bankOfferText: 'with Federal Bank offer',
    stockLeft: 14,
    category: 'Smart Watches & Luxury',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfa63096aa?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Sunburst Blue', colorHex: '#1E3A8A', borderHex: '#3B82F6' },
      { name: 'Champagne Silver', colorHex: '#E2E8F0', borderHex: '#CBD5E1' },
    ],
    sizes: ['40.5mm Dial'],
    description:
      'Japanese automatic mechanical watch inspired by the glamorous skybar cocktail culture. Features shimmering sunburst dial, box-shaped Hardlex crystal, caliber 4R35 movement with 41-hour power reserve, and alligator-grain calfskin leather strap.',
    highlights: [
      'Caliber 4R35 Japanese Automatic Mechanical Movement',
      'Box-Shaped Scratch-Resistant Hardlex Crystal',
      'Exhibition See-Through Exhibition Case Back',
      'Calfskin Leather Strap with Three-Fold Deployant Clasp',
      '50 Meters / 5 Bar Water Resistance',
    ],
    details: {
      'Movement': 'Caliber 4R35 Automatic with Manual Winding',
      'Case Diameter': '40.5mm Stainless Steel (Exhibition case back)',
      'Power Reserve': 'Approx. 41 Hours (21,600 vibrations/hr)',
      'Crystal': 'Box-shaped anti-reflective Hardlex',
      'Water Resistance': '50 Meters / 5 Bar',
      'Strap': 'Brown Alligator-embossed Calfskin with Deployant Clasp',
    },
    moreInfo: [
      { label: 'Warranty', value: '3 Years International Seiko Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Packaging', value: 'Includes Seiko Luxury Presentation Box', icon: 'gift-outline' },
    ],
  },

  // 7. Heavyweight Boxy Fit Cotton Hoodie (Urban Edge Apparel)
  {
    id: 7,
    name: 'Heavyweight Boxy Fit Cotton Hoodie (Oatmeal Melange)',
    brand: 'Urban Edge',
    vendor: 'Urban Edge Apparel',
    vendorRating: 4.6,
    price: 2199,
    mrp: 3999,
    discount: 45,
    rating: 4.6,
    reviews: 215,
    reviewsCount: 215,
    delivery: 'Free Standard Delivery',
    bankOfferPrice: 1999,
    bankOfferText: 'with UPI Payment',
    stockLeft: 55,
    category: 'Men Fashion',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Oatmeal Melange', colorHex: '#E5E5E0', borderHex: '#D4D4CE' },
      { name: 'Washed Charcoal', colorHex: '#27272A', borderHex: '#3F3F46' },
      { name: 'Sage Green', colorHex: '#4D6B53', borderHex: '#608668' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      '420 GSM ultra-heavyweight combed French terry cotton. Drop-shoulder relaxed boxy silhouette with double-layered hood, ribbed cuffs, and minimal interior fleece lining for all-season breathability and luxury drape.',
    highlights: [
      '420 GSM Ultra-Heavy Combed French Terry Cotton',
      'Relaxed Boxy Drop-Shoulder Contemporary Fit',
      'Double-Layered Thermal Hood without Drawstrings',
      'Heavy Ribbed Cuffs and Hem',
      'Pre-Shrunk Fade-Resistant Reactive Dye',
    ],
    details: {
      'Fabric': '100% Ring-Spun Combed Cotton (420 GSM French Terry)',
      'Fit': 'Oversized Boxy Silhouette with Drop Shoulders',
      'Hood': 'Double-layer thermal lined without drawstrings',
      'Wash Care': 'Pre-shrunk, machine wash cold inside out',
      'Origin': 'Crafted in Tirupur, India',
    },
    moreInfo: [
      { label: 'Returns', value: '14-Day Hassle-Free Size Exchange', icon: 'repeat-outline' },
      { label: 'Care', value: 'Machine wash cold with like colors', icon: 'water-outline' },
    ],
  },

  // 8. Ergonomic Executive Mesh Office Chair (HomeDecor Plus)
  {
    id: 8,
    name: 'Ergonomic Executive Mesh Office Chair with Lumbar Support',
    brand: 'ErgoPro',
    vendor: 'HomeDecor Plus',
    vendorRating: 4.5,
    price: 11999,
    mrp: 19999,
    discount: 40,
    rating: 4.5,
    reviews: 143,
    reviewsCount: 143,
    delivery: 'Free Doorstep Assembly & Delivery',
    bankOfferPrice: 11299,
    bankOfferText: 'with Bank EMI offer',
    stockLeft: 22,
    category: 'Home & Furniture',
    image: 'https://images.unsplash.com/photo-1580481077195-c3f25c753066?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3f25c753066?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Obsidian Black', colorHex: '#18181B', borderHex: '#27272A' },
      { name: 'Executive Grey', colorHex: '#64748B', borderHex: '#475569' },
    ],
    sizes: ['High Back Ergonomic Standard'],
    description:
      'BIFMA-certified ergonomic swivel chair with breathable Korean mesh back, 3D adjustable armrests, multi-lock recline mechanism (90°–135°), and self-adaptive dynamic lumbar pressure relief.',
    highlights: [
      'BIFMA & SGS Certified Ergonomic Architecture',
      'Self-Adaptive Dynamic Lumbar Support',
      '3D Multidirectional Adjustable Armrests',
      'Synchronous Tilt-Lock Recline (90° - 135°)',
      'Heavy Duty Class 4 Hydraulic Piston (Up to 150kg)',
    ],
    details: {
      'Mesh Type': 'High-tensile breathable Korean Wintex Mesh',
      'Armrests': '3D Polyurethane padded (Height, Depth & Angle adjustable)',
      'Gas Lift': 'Class 4 Heavy-duty SGS certified hydraulic piston',
      'Weight Capacity': 'Up to 150 kg weight tolerance',
      'Recline': 'Synchronous tilt-lock between 90° and 135°',
      'Base': 'Cast aluminum alloy with 60mm silent nylon castors',
    },
    moreInfo: [
      { label: 'Warranty', value: '3 Years Complete Structure Warranty', icon: 'shield-checkmark-outline' },
      { label: 'Assembly', value: 'Free Expert Assembly at Delivery', icon: 'construct-outline' },
    ],
  },

  // 9. Botanical Vitamin C Brightening Facial Serum (Glamour Beauty)
  {
    id: 9,
    name: 'Botanical Vitamin C Brightening Facial Serum (50ml)',
    brand: 'Botanica Pure',
    vendor: 'Glamour Beauty',
    vendorRating: 4.7,
    price: 899,
    mrp: 1599,
    discount: 44,
    rating: 4.7,
    reviews: 388,
    reviewsCount: 388,
    delivery: 'Free Delivery on Orders Above ₹499',
    bankOfferPrice: 799,
    bankOfferText: 'with Prepaid orders',
    stockLeft: 90,
    category: 'Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-45e3ea30219c?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Amber Dropper Bottle (50ml)', colorHex: '#D97706', borderHex: '#B45309' },
    ],
    sizes: ['50 ml Glass Dropper Bottle'],
    description:
      'Dermatologist-formulated potent antioxidant serum with 15% Ethyl Ascorbic Acid, Ferulic Acid, and Hyaluronic Acid. Fades dark spots, evens skin tone, stimulates collagen synthesis, and provides 24-hour hydration.',
    highlights: [
      '15% Potent Stabilized Ethyl Ascorbic Acid',
      '1% Natural Ferulic Acid + Multi-Molecular Hyaluronic Acid',
      'Clinically Proven Dark Spot Reduction in 2 Weeks',
      'Fragrance-Free, Non-Comedogenic & Cruelty-Free',
      'Amber UV-Protected Pharmaceutical Glass Bottle',
    ],
    details: {
      'Active Ingredients': '15% Ethyl Ascorbic Acid + 1% Ferulic Acid + Hyaluronic Acid',
      'Skin Type': 'All skin types, non-comedogenic & fragrance free',
      'Volume': '50 ml / 1.7 fl oz with amber UV-protected glass dropper',
      'Certifications': 'Cruelty-Free, Paraben-Free, FDA Approved formulation',
    },
    moreInfo: [
      { label: 'Safety', value: 'Dermatologically Tested on Sensitive Skin', icon: 'fitness-outline' },
      { label: 'Shelf Life', value: '24 Months from Manufacturing Date', icon: 'time-outline' },
    ],
  },

  // 10. SoundKraft Dolby Atmos Cinema Soundbar (SoundKraft Audio)
  {
    id: 10,
    name: 'SoundKraft Dolby Atmos Cinema Soundbar with Subwoofer (300W)',
    brand: 'SoundKraft Audio',
    vendor: 'SoundKraft Audio',
    vendorRating: 4.8,
    price: 14999,
    mrp: 24999,
    discount: 40,
    rating: 4.8,
    reviews: 182,
    reviewsCount: 182,
    delivery: 'Free Next-Day Delivery',
    bankOfferPrice: 13999,
    bankOfferText: 'with HDFC Bank Credit Card',
    stockLeft: 30,
    category: 'Audio & Sound',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    ],
    colors: [
      { name: 'Metallic Matte Black', colorHex: '#0F172A', borderHex: '#334155' },
    ],
    sizes: ['300W 3.1 Channel System'],
    description:
      '3.1 channel cinema soundbar with wireless down-firing subwoofer, true Dolby Atmos 3D spatial acoustic decoding, HDMI eARC, Optical, and Bluetooth 5.3 streaming. Fills your room with theater-quality bass and dialogue clarity.',
    highlights: [
      '300W Peak System Audio Output Power',
      'Dolby Atmos Spatial 3D Audio Decoding',
      'Dedicated Wireless Down-Firing Subwoofer',
      'HDMI eARC Lossless Sound Transmission + Optical + AUX',
      'Preset EQ Modes: Movie, Music, Dialogue & Game',
    ],
    details: {
      'Power Output': '300W RMS Peak (Subwoofer 140W + Bar 160W)',
      'Channels': '3.1 Channel Acoustic Setup',
      'Connectivity': 'HDMI eARC, Optical, Bluetooth 5.3, USB, AUX',
      'Subwoofer': '6.5-inch Wireless Long-Throw Down-Firing Woofer',
      'Warranty': '1 Year SoundKraft Home Service Warranty',
    },
    moreInfo: [
      { label: 'Warranty', value: '1 Year SoundKraft Doorstep Service Warranty', icon: 'shield-checkmark-outline' },
      { label: 'In the Box', value: 'Soundbar, Subwoofer, HDMI Cable, Wall Mount Kit, Remote', icon: 'cube-outline' },
    ],
  },

  // 11. Ethnic Banarasi Silk Saree (Preserved for Fashion catalog)
  {
    id: 100,
    name: 'Royal Banarasi Katan Pure Silk Handloom Saree',
    brand: 'Shruti Creation',
    vendor: 'Shruti Creation',
    vendorRating: 4.8,
    price: 2399,
    mrp: 2999,
    discount: 20,
    rating: 4.8,
    reviews: 124,
    reviewsCount: 124,
    delivery: 'Free Shipping on Orders Above ₹999',
    stockLeft: 25,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=900&auto=format&fit=crop&q=80',
    ],
    colors: [
      {
        name: 'Purple',
        colorHex: '#701A75',
        borderHex: '#86198F',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
      },
      {
        name: 'Red',
        colorHex: '#DC2626',
        borderHex: '#B91C1C',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
      },
      {
        name: 'Olive Green',
        colorHex: '#4D7C0F',
        borderHex: '#365314',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
      },
    ],
    colorImageMap: {
      Purple: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
      Red: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
      'Olive Green': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    },
    sizes: ['Free Size (Includes Blouse Piece)'],
    description:
      'Graceful and timeless, this Banarasi silk saree brings together traditional craftsmanship and royal elegance. Handwoven with gold zari motifs, perfect for weddings, festivals and special occasions.',
    highlights: [
      'Premium Banarasi Silk Fabric',
      'Intricate Zari Weaving',
      'Lightweight & Comfortable',
      'Comes with Matching Blouse Piece',
    ],
    details: {
      'Fabric': 'Banarasi Silk',
      'Work': 'Zari Weaving',
      'Saree Length': '5.5 m (approx)',
      'Blouse Piece': '0.8 m (approx)',
    },
  },
];

export function findProductById(id: number | string): CatalogProduct | undefined {
  if (id === undefined || id === null) return undefined;
  const strId = String(id).trim();
  const numId = Number(strId);

  // Exact ID match
  const directMatch = ALL_PRODUCTS_CATALOG.find((p) => String(p.id) === strId);
  if (directMatch) return directMatch;

  // Alias match for 1..10 <=> 101..110
  if (!isNaN(numId)) {
    if (numId >= 1 && numId <= 10) {
      const match = ALL_PRODUCTS_CATALOG.find((p) => Number(p.id) === numId || Number(p.id) === numId + 100);
      if (match) return match;
    }
    if (numId >= 101 && numId <= 110) {
      const match = ALL_PRODUCTS_CATALOG.find((p) => Number(p.id) === numId - 100 || Number(p.id) === numId);
      if (match) return match;
    }
  }

  return undefined;
}

export function findProductByName(name: string): CatalogProduct | undefined {
  if (!name || typeof name !== 'string') return undefined;
  const target = name.toLowerCase().trim();
  return ALL_PRODUCTS_CATALOG.find((p) => {
    const pName = p.name.toLowerCase();
    return pName.includes(target) || target.includes(pName);
  });
}

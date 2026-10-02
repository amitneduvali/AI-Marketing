import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductReview {
  id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_slug: string;
  category_id?: string;
  category_name?: string;
  title: string;
  slug: string;
  description?: string;
  brand?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  status: "draft" | "published" | "archived";
  stock_quantity: number;
  is_featured: boolean;
  attributes: Record<string, any>;
  specifications: Record<string, any>;
  tags: string[];
  images: string[];
  avg_rating: number;
  review_count: number;
  reviews?: ProductReview[];
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductInput {
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  category_id?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  stock_quantity: number;
  status: "draft" | "published" | "archived";
  is_featured?: boolean;
  specifications?: Record<string, any>;
  attributes?: Record<string, any>;
  tags?: string[];
  images?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Initial Electronic Products Catalog
const INITIAL_ELECTRONICS_PRODUCTS: Product[] = [
  {
    id: "p1010101-0001-0000-0000-000000000001",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "NeuralFlow Hyper-Adaptive ANC Headphones",
    slug: "neuralflow-hyper-adaptive-anc-headphones",
    description: "Premium active noise cancellation headphones with real-time neural auditory response modeling, 40mm beryllium drivers, and 38-hour battery longevity.",
    brand: "NeuralFlow Acoustics",
    price: 349.00,
    compare_at_price: 399.00,
    sku: "NF-ANC-01",
    status: "published",
    stock_quantity: 24,
    is_featured: true,
    attributes: { color: "Obsidian Black", wireless: true, battery: "38h" },
    specifications: {
      "Driver Unit": "40mm custom beryllium dynamic drivers",
      "Frequency Response": "5Hz - 45,000Hz",
      "Connectivity": "Bluetooth 5.4, Multipoint LE Audio, 3.5mm analog",
      "Weight": "248g",
    },
    tags: ["audio", "headphones", "anc", "wireless", "electronics"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.9,
    review_count: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0002-0000-0000-000000000002",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Cortex Spatial Ergonomic Mechanical Keyboard",
    slug: "cortex-spatial-ergonomic-mechanical-keyboard",
    description: "Split wireless mechanical keyboard engineered with CNC-anodized aluminum unibody, hot-swappable tactile silent switches, and programmable rotary macro encoders.",
    brand: "Cortex Engineering",
    price: 219.50,
    compare_at_price: 249.00,
    sku: "CTX-KB-75",
    status: "published",
    stock_quantity: 18,
    is_featured: true,
    attributes: { layout: "75% Split Ortholinear", switches: "Tactile Silent 62g" },
    specifications: {
      "Case Material": "6063 CNC Anodized Aluminum",
      "Mounting Style": "Gasket-mounted silicone vibration dampers",
      "Battery Capacity": "4000mAh dual-cell rechargeable",
      "Polling Rate": "1000Hz 2.4GHz / Wired USB-C",
    },
    tags: ["keyboard", "ergonomic", "mechanical", "cortex", "wireless"],
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.8,
    review_count: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0003-0000-0000-000000000003",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "PulseVision Quantum Micro-OLED 4K Smart Display",
    slug: "pulsevision-quantum-micro-oled-smart-display",
    description: "Ultra-slim 32-inch 4K 165Hz Micro-OLED studio monitor with 99.8% DCI-P3 color reproduction, hardware HDR1000, and integrated 96W Thunderbolt 4 hub.",
    brand: "OptiPulse",
    price: 589.00,
    compare_at_price: 649.00,
    sku: "PV-OLED-32",
    status: "published",
    stock_quantity: 12,
    is_featured: true,
    attributes: { panel: "Micro-OLED", refresh_rate: "165Hz", resolution: "3840x2160" },
    specifications: {
      "Panel Type": "True RGB Quantum Micro-OLED",
      "Color Accuracy": "Delta E < 1.0 calibrated",
      "Peak Brightness": "1000 nits HDR",
      "Ports": "2x Thunderbolt 4 (96W PD), 1x DP 1.4, 2x HDMI 2.1",
    },
    tags: ["monitor", "display", "oled", "hardware", "studio", "4k"],
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 5.0,
    review_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0004-0000-0000-000000000004",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "BioSync Precision Health & Cognitive Tracker Ring",
    slug: "biosync-health-tracker-ring",
    description: "Medical-grade titanium biometric ring with continuous sleep stage analysis, heart rate variability (HRV) telemetry, and 7-day battery life.",
    brand: "BioSync Labs",
    price: 279.00,
    compare_at_price: 299.00,
    sku: "BS-RING-TITAN",
    status: "published",
    stock_quantity: 35,
    is_featured: false,
    attributes: { material: "Grade 5 Titanium", water_resistance: "100m" },
    specifications: {
      "Weight": "3.5 grams",
      "Sensors": "Photoplethysmography (PPG), Skin Temp Sensor, 3D Accelerometer",
      "Battery": "Up to 7 days wireless charge",
    },
    tags: ["wearable", "health", "smart-ring", "biometrics"],
    images: [
      "/images/products/biosync_smart_ring.jpg",
    ],
    avg_rating: 4.7,
    review_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0005-0000-0000-000000000005",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "MacBook Pro 16\" Liquid Retina XDR (M3 Max)",
    slug: "macbook-pro-16-m3-max",
    description: "Pro-grade portable workstation featuring Apple M3 Max 16-core CPU, 40-core GPU, 64GB unified memory, and 1TB SSD storage with 22 hours of battery performance.",
    brand: "Apple",
    price: 2499.00,
    compare_at_price: 2799.00,
    sku: "MBP-16-M3MAX",
    status: "published",
    stock_quantity: 15,
    is_featured: true,
    attributes: { ram: "64GB Unified", storage: "1TB SSD", screen: "16.2 inch 120Hz XDR" },
    specifications: {
      "Chip": "Apple M3 Max (16-core CPU, 40-core GPU)",
      "Display": "16.2-inch Liquid Retina XDR (3456 x 2234 at 254 ppi)",
      "Memory": "64GB Unified Memory",
      "Battery": "100-watt-hour lithium-polymer, up to 22h playback",
    },
    tags: ["laptop", "apple", "macbook", "workstation", "hardware", "electronics"],
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.95,
    review_count: 57,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0006-0000-0000-000000000006",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    slug: "sony-wh1000xm5-wireless-anc-headphones",
    description: "Industry-leading noise canceling with two processors and 8 microphones, Auto NC Optimizer, crystal clear hands-free calling, and up to 30 hours of quick-charging battery.",
    brand: "Sony",
    price: 399.99,
    compare_at_price: 449.99,
    sku: "SONY-WH-XM5-SLV",
    status: "published",
    stock_quantity: 30,
    is_featured: true,
    attributes: { color: "Platinum Silver", anc: "Auto NC Optimizer", battery: "30h" },
    specifications: {
      "Noise Cancellation": "Integrated Processor V1 & HD Noise Cancelling Processor QN1",
      "Driver Unit": "30mm precision-engineered carbon fiber composite",
      "Battery Life": "30 hours with ANC on (3-min charge for 3 hours)",
      "Audio Formats": "LDAC, AAC, SBC",
    },
    tags: ["sony", "audio", "headphones", "bluetooth", "noise-cancelling"],
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.9,
    review_count: 84,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0007-0000-0000-000000000007",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "Samsung Galaxy S24 Ultra 5G (Galaxy AI Enabled)",
    slug: "samsung-galaxy-s24-ultra-5g",
    description: "Flagship titanium frame smartphone with 200MP AI-enhanced camera system, built-in S Pen stylus, Snapdragon 8 Gen 3 for Galaxy, and real-time live call translation.",
    brand: "Samsung",
    price: 1199.99,
    compare_at_price: 1299.99,
    sku: "SAMS-S24U-512",
    status: "published",
    stock_quantity: 20,
    is_featured: true,
    attributes: { storage: "512GB", color: "Titanium Gray", screen: "6.8 inch 120Hz Dynamic AMOLED 2X" },
    specifications: {
      "Processor": "Qualcomm Snapdragon 8 Gen 3 (4nm)",
      "Rear Cameras": "200MP Wide + 50MP Periscope + 12MP Ultra-wide + 10MP Telephoto",
      "Battery": "5,000mAh with 45W Super Fast Charging",
      "Display": "6.8\" QHD+ (3120 x 1440) 2600 nits peak",
    },
    tags: ["smartphone", "samsung", "galaxy", "5g", "ai", "electronics"],
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.88,
    review_count: 63,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0008-0000-0000-000000000008",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    slug: "logitech-mx-master-3s-mouse",
    description: "Quiet Click ergonomic mouse with 8000 DPI track-on-glass optical sensor, MagSpeed electromagnetic scroll wheel, and ergonomic sculpted thumb rest.",
    brand: "Logitech",
    price: 99.99,
    compare_at_price: 119.99,
    sku: "LOGI-MX3S-GRY",
    status: "published",
    stock_quantity: 48,
    is_featured: false,
    attributes: { sensor: "8000 DPI Darkfield", connectivity: "Bluetooth & Bolt Receiver" },
    specifications: {
      "Battery": "Rechargeable Li-Po (500mAh) lasts up to 70 days",
      "Buttons": "7 custom programmable buttons",
      "Weight": "141g",
      "Compatibility": "macOS, Windows, Linux, iPadOS",
    },
    tags: ["mouse", "logitech", "ergonomic", "wireless", "workstation"],
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.92,
    review_count: 112,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0009-0000-0000-000000000009",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "Apple Watch Ultra 2 (Titanium GPS + Cellular)",
    slug: "apple-watch-ultra-2-titanium",
    description: "Rugged aerospace titanium 49mm case with precision dual-frequency GPS, 3000 nits brightest display, customizable Action button, and 36-hour endurance.",
    brand: "Apple",
    price: 799.00,
    compare_at_price: 849.00,
    sku: "AW-ULTRA2-TI",
    status: "published",
    stock_quantity: 18,
    is_featured: true,
    attributes: { case: "49mm Titanium", strap: "Ocean Band Dark Grey", cellular: true },
    specifications: {
      "Display": "Always-On Retina display up to 3000 nits",
      "Chip": "S9 SiP with 4-core Neural Engine & Double Tap gesture",
      "Water Resistance": "100m water resistant, depth gauge to 40m",
      "Battery": "Up to 36 hours regular / 72 hours Low Power Mode",
    },
    tags: ["smartwatch", "apple", "wearables", "gps", "titanium", "electronics"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.89,
    review_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0010-0000-0000-000000000010",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "Anker Prime 20,000mAh 200W Fast Power Bank & Base",
    slug: "anker-prime-20000mah-200w-power-bank",
    description: "Ultra-compact high-output multi-device power bank with smart digital LCD telemetry screen, 200W combined total output, and dual USB-C ultra fast charging.",
    brand: "Anker",
    price: 129.99,
    compare_at_price: 149.99,
    sku: "ANK-PRIME-20K",
    status: "published",
    stock_quantity: 40,
    is_featured: false,
    attributes: { capacity: "20,000mAh", max_output: "200W", ports: "2x USB-C, 1x USB-A" },
    specifications: {
      "Capacity": "20,000mAh (72Wh)",
      "Single Port Max": "100W Power Delivery 3.0",
      "Digital Display": "Shows live input/output watts, capacity percentage, time to full",
      "Weight": "540g",
    },
    tags: ["powerbank", "anker", "charger", "fast-charging", "electronics"],
    images: [
      "/images/products/anker_powerbank.jpg",
    ],
    avg_rating: 4.94,
    review_count: 73,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0011-0000-0000-000000000011",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "Apple iPhone 18 Pro Max Titanium (Apple Intelligence)",
    slug: "apple-iphone-18-pro-max-titanium",
    description: "Next-generation flagship with aerospace Grade 5 titanium unibody, A19 Pro 2nm Bionic Neural Engine, 6.9-inch 120Hz ProMotion XDR display, and 48MP Quad-Prism optical periscope system.",
    brand: "Apple",
    price: 1499.00,
    compare_at_price: 1599.00,
    sku: "APL-IP18PM-1TB",
    status: "published",
    stock_quantity: 25,
    is_featured: true,
    attributes: { storage: "1TB", color: "Natural Titanium", chip: "A19 Pro Bionic", display: "6.9 inch OLED ProMotion" },
    specifications: {
      "Processor": "Apple A19 Pro (2nm architecture with 16-core Neural Engine)",
      "Camera System": "48MP Main + 48MP Ultra Wide + 48MP 5x Periscope Telephoto",
      "Display": "6.9\" Super Retina XDR OLED (3000 nits peak brightness, 1-120Hz ProMotion)",
      "Battery": "Up to 34 hours video playback, 30W wireless MagSafe charging",
      "Security": "Under-display Face ID and Action Button",
    },
    tags: ["apple", "iphone", "iphone 18 pro max", "smartphone", "mobile", "ai", "electronics"],
    images: [
      "/images/products/iphone_18_pro.jpg",
    ],
    avg_rating: 4.98,
    review_count: 96,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0012-0000-0000-000000000012",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "HP Spectre x360 16 2-in-1 4K OLED Touch Laptop",
    slug: "hp-spectre-x360-16-oled-laptop",
    description: "Premium convertible 2-in-1 laptop with Intel Core Ultra 9 185H processor, NVIDIA GeForce RTX 4060 graphics, 32GB LPDDR5x RAM, and 16-inch 4K 120Hz gesture-touch OLED display.",
    brand: "HP",
    price: 1799.00,
    compare_at_price: 1999.00,
    sku: "HP-SPEC-16-OLED",
    status: "published",
    stock_quantity: 14,
    is_featured: true,
    attributes: { processor: "Intel Core Ultra 9", ram: "32GB", storage: "2TB NVMe SSD", gpu: "RTX 4060 8GB" },
    specifications: {
      "Display": "16-inch UHD+ 4K (3840 x 2400) OLED Touch, 120Hz, 100% DCI-P3, HDR 500",
      "Processor": "Intel Core Ultra 9 185H (16 cores, 22 threads, up to 5.1GHz, Intel AI Boost NPU)",
      "Graphics": "NVIDIA GeForce RTX 4060 Laptop GPU (8GB GDDR6)",
      "Audio": "Poly Studio quad speakers with DTS:X Ultra",
      "Battery": "83Wh 6-cell lithium-ion polymer, up to 13 hours battery life",
    },
    tags: ["hp", "laptop", "spectre", "touchscreen", "oled", "intel", "computer"],
    images: [
      "/images/products/hp_spectre_laptop.jpg",
    ],
    avg_rating: 4.88,
    review_count: 38,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0013-0000-0000-000000000013",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "HP OMEN 17 Pro Gaming Laptop (RTX 4080 & 240Hz QHD)",
    slug: "hp-omen-17-pro-gaming-laptop",
    description: "Extreme high-performance gaming powerhouse with AMD Ryzen 9 8945HX, NVIDIA GeForce RTX 4080 12GB, 32GB DDR5 5600MHz, and 240Hz 3ms G-SYNC IPS display.",
    brand: "HP",
    price: 2199.00,
    compare_at_price: 2399.00,
    sku: "HP-OMEN-17-4080",
    status: "published",
    stock_quantity: 10,
    is_featured: true,
    attributes: { processor: "AMD Ryzen 9 8945HX", gpu: "RTX 4080 12GB", refresh: "240Hz QHD" },
    specifications: {
      "Display": "17.3-inch QHD (2560 x 1440) 240Hz, 3ms, IPS, Micro-edge, Anti-glare, 100% sRGB",
      "Cooling": "OMEN Tempest Cooling Technology with 3-sided venting and 5-way airflow",
      "Keyboard": "Optical-mechanical per-key RGB backlit keyboard",
      "Network": "Wi-Fi 7 (2x2) and Bluetooth 5.4 wireless card",
    },
    tags: ["hp", "omen", "gaming", "laptop", "rtx 4080", "hardware"],
    images: [
      "/images/products/hp_omen_laptop.jpg",
    ],
    avg_rating: 4.91,
    review_count: 51,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0014-0000-0000-000000000014",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "iQOO 12 Pro 5G Flagship (BMW M Motorsport Edition)",
    slug: "iqoo-12-pro-5g-flagship",
    description: "Esports monster powered by Qualcomm Snapdragon 8 Gen 3 with dedicated Supercomputing Q1 chip, 2K Samsung E7 144Hz AMOLED, 120W FlashCharge, and 50MP periscope telephoto.",
    brand: "iQOO",
    price: 799.00,
    compare_at_price: 899.00,
    sku: "IQOO-12PRO-WHT",
    status: "published",
    stock_quantity: 28,
    is_featured: true,
    attributes: { ram: "16GB LPDDR5X", storage: "512GB UFS 4.0", charging: "120W Wired + 50W Wireless" },
    specifications: {
      "Processor": "Qualcomm Snapdragon 8 Gen 3 (4nm) + Self-developed Q1 Gaming Chip",
      "Display": "6.78\" 2K (3200 x 1440) Samsung E7 AMOLED, 144Hz, 3000 nits peak, LTPO 4.0",
      "Cameras": "50MP 1/1.3\" Custom VCS OmniVision + 50MP Ultra-wide + 64MP 3x Periscope",
      "Charging": "5100mAh dual-cell with 120W Ultra-Fast FlashCharge (0-100% in 20 mins)",
      "Haptics": "Ultra-large X-axis linear vibration motor with Dual stereo speakers",
    },
    tags: ["iqoo", "mobile", "smartphone", "5g", "gaming", "snapdragon"],
    images: [
      "/images/products/iqoo_12_pro.jpg",
    ],
    avg_rating: 4.87,
    review_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0015-0000-0000-000000000015",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "iQOO Neo 9 Pro 5G Performance Edition (Dual-Chip)",
    slug: "iqoo-neo-9-pro-5g",
    description: "Maximum gaming performance value with flagship Snapdragon 8 Gen 2 processor, independent graphics chip, 1.5K 144Hz LTPO display, and 120W super-charge technology.",
    brand: "iQOO",
    price: 469.00,
    compare_at_price: 529.00,
    sku: "IQOO-NEO9P-RED",
    status: "published",
    stock_quantity: 32,
    is_featured: false,
    attributes: { ram: "12GB", storage: "256GB", color: "Fiery Red Leather", charging: "120W" },
    specifications: {
      "Processor": "Qualcomm Snapdragon 8 Gen 2 + Supercomputing Chip Q1",
      "Screen": "6.78-inch 1.5K (2800 x 1260) 144Hz 8T LTPO OLED display",
      "Camera": "50MP Sony IMX920 with OIS + 8MP Ultra-wide angle lens",
      "Cooling": "6043mm² Ultra-large Liquid VC heat dissipation system",
    },
    tags: ["iqoo", "mobile", "neo9", "smartphone", "5g", "electronics"],
    images: [
      "/images/products/iqoo_neo9_pro.jpg",
    ],
    avg_rating: 4.83,
    review_count: 49,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0016-0000-0000-000000000016",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "Apple iPad Pro 13\" Ultra Retina XDR (M4 Chip)",
    slug: "apple-ipad-pro-13-m4-chip",
    description: "The thinnest Apple product ever, engineered with pioneering Tandem OLED Ultra Retina XDR display, breakthrough M4 chip with 38-trillion-ops Neural Engine, and Apple Pencil Pro support.",
    brand: "Apple",
    price: 1299.00,
    compare_at_price: 1399.00,
    sku: "APL-IPAD13-M4",
    status: "published",
    stock_quantity: 19,
    is_featured: true,
    attributes: { storage: "256GB", color: "Space Black", screen: "13-inch Tandem OLED" },
    specifications: {
      "Chip": "Apple M4 (9-core CPU, 10-core GPU, Hardware-accelerated ray tracing)",
      "Display": "13-inch Tandem OLED Ultra Retina XDR (2752 x 2064, 1600 nits peak HDR)",
      "Thickness": "Super-thin 5.1mm aerospace unibody aluminum",
      "Camera": "12MP Wide back camera with LiDAR scanner, Landscape 12MP Center Stage front",
    },
    tags: ["apple", "ipad", "tablet", "m4", "hardware", "electronics"],
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.96,
    review_count: 62,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0017-0000-0000-000000000017",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Apple AirPods Pro 2nd Gen (MagSafe Case USB-C)",
    slug: "apple-airpods-pro-2-usb-c",
    description: "Pro-level Active Noise Cancellation with Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and dust, sweat, and water resistance.",
    brand: "Apple",
    price: 249.00,
    compare_at_price: 279.00,
    sku: "APL-APP2-USBC",
    status: "published",
    stock_quantity: 50,
    is_featured: true,
    attributes: { chip: "Apple H2", connector: "USB-C & MagSafe", anc: "2x Active Noise Cancellation" },
    specifications: {
      "Audio Technology": "Custom high-excursion Apple driver, custom high dynamic range amplifier",
      "Case": "MagSafe Charging Case (USB-C) with speaker and lanyard loop (Find My U1)",
      "Battery Life": "Up to 6 hours listening with ANC on (up to 30 hours with case)",
    },
    tags: ["apple", "airpods", "audio", "anc", "wireless", "earbuds"],
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.93,
    review_count: 140,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Audio & Acoustics (Additions)
  {
    id: "p1010101-0018-0000-0000-000000000018",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Bose QuietComfort Ultra Spatial Audio Headphones",
    slug: "bose-quietcomfort-ultra-headphones",
    description: "Breakthrough spatialized audio with Bose Immersive Audio, custom acoustic architecture, CustomTune sound calibration, and ultra-plush synthetic leather earcups.",
    brand: "Bose",
    price: 429.00,
    compare_at_price: 479.00,
    sku: "BOSE-QC-ULTRA",
    status: "published",
    stock_quantity: 26,
    is_featured: true,
    attributes: { color: "White Smoke", battery: "24h with Immersive Audio" },
    specifications: {
      "Immersive Audio": "Proprietary digital signal processing for dynamic head tracking",
      "Noise Cancellation": "Quiet Mode, Aware Mode with ActiveSense, Immersion Mode",
      "Bluetooth": "Bluetooth 5.3 with Snapdragon Sound certification",
    },
    tags: ["bose", "audio", "headphones", "anc", "spatial-audio"],
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.88,
    review_count: 53,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0019-0000-0000-000000000019",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Marshall Stanmore III Bluetooth Wireless Home Speaker",
    slug: "marshall-stanmore-iii-speaker",
    description: "Legendary vintage rock sound re-engineered for immersive room-filling home audio with outward-angled tweeters and updated waveguides.",
    brand: "Marshall",
    price: 379.99,
    compare_at_price: 399.99,
    sku: "MARSH-STAN-3",
    status: "published",
    stock_quantity: 18,
    is_featured: false,
    attributes: { color: "Black & Brass", connectivity: "Bluetooth 5.2, RCA, 3.5mm" },
    specifications: {
      "Amplifiers": "One 50 Watt Class D amp for woofer, Two 15 Watt Class D amps for tweeters",
      "Frequency Range": "45–20,000 Hz",
      "Placement Compensation": "Dynamic Loudness acoustic tonal balance adjustment",
    },
    tags: ["marshall", "speaker", "audio", "vintage", "bluetooth"],
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.92,
    review_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0020-0000-0000-000000000020",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Shure SM7B Studio Cardioid Dynamic Vocal Microphone",
    slug: "shure-sm7b-dynamic-microphone",
    description: "The gold standard for broadcast, podcasting, and studio vocal tracking with smooth, flat, wide-range frequency response and advanced electromagnetic shielding.",
    brand: "Shure",
    price: 399.00,
    compare_at_price: 449.00,
    sku: "SHURE-SM7B-PRO",
    status: "published",
    stock_quantity: 34,
    is_featured: false,
    attributes: { polar_pattern: "Cardioid", connector: "3-pin XLR" },
    specifications: {
      "Frequency Response": "50 to 20,000 Hz",
      "Shock Isolation": "Internal air suspension shock isolation eliminates mechanical noise",
      "Pop Filter": "Detachable A7WS windscreen included for close-talk vocals",
    },
    tags: ["shure", "microphone", "audio", "studio", "podcast"],
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.97,
    review_count: 180,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0021-0000-0000-000000000021",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c1111111-1111-1111-1111-111111111111",
    category_name: "Audio & Acoustics",
    title: "Sennheiser Momentum 4 Wireless Studio Headphones",
    slug: "sennheiser-momentum-4-wireless",
    description: "Audiophile-inspired 42mm transducer system delivering incredible musicality, adaptive noise cancellation, and class-leading 60-hour continuous battery life.",
    brand: "Sennheiser",
    price: 349.95,
    compare_at_price: 379.95,
    sku: "SENN-MOM4-BLK",
    status: "published",
    stock_quantity: 22,
    is_featured: false,
    attributes: { battery: "60h", codec: "aptX Adaptive, AAC, SBC" },
    specifications: {
      "Transducer": "42mm dynamic audiophile transducer",
      "Battery": "60 hours playback via Bluetooth with ANC enabled",
      "Microphones": "2x2 digital beamforming array for crystal-clear calls",
    },
    tags: ["sennheiser", "audio", "headphones", "audiophile", "wireless"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.89,
    review_count: 76,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Computer Hardware (Additions)
  {
    id: "p1010101-0022-0000-0000-000000000022",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "ASUS ROG Swift 32\" 4K 240Hz OLED Gaming Monitor",
    slug: "asus-rog-swift-32-4k-oled",
    description: "32-inch 4K UHD (3840 x 2160) QD-OLED gaming monitor with blazing 240Hz refresh rate, 0.03ms response time, custom heatsink cooling, and 99% DCI-P3 gamut.",
    brand: "ASUS ROG",
    price: 1299.00,
    compare_at_price: 1399.00,
    sku: "ROG-PG32UCDM",
    status: "published",
    stock_quantity: 11,
    is_featured: true,
    attributes: { refresh: "240Hz", resolution: "3840x2160", panel: "3rd Gen QD-OLED" },
    specifications: {
      "Panel": "31.5-inch 4K QD-OLED anti-reflection coating",
      "Response Time": "0.03ms (gray to gray)",
      "Ports": "DisplayPort 1.4 (DSC), HDMI 2.1, USB-C (90W Power Delivery)",
    },
    tags: ["asus", "rog", "monitor", "gaming", "oled", "4k"],
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.96,
    review_count: 41,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0023-0000-0000-000000000023",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c2222222-2222-2222-2222-222222222222",
    category_name: "Computer Hardware",
    title: "NVIDIA GeForce RTX 4090 Founders Edition 24GB",
    slug: "nvidia-geforce-rtx-4090-fe",
    description: "The ultimate desktop GPU featuring NVIDIA Ada Lovelace architecture, 24GB G6X memory, 16,384 CUDA cores, 3rd Gen RT Cores, and DLSS 3.5 neural frame generation.",
    brand: "NVIDIA",
    price: 1599.00,
    compare_at_price: 1799.00,
    sku: "NV-RTX4090-FE",
    status: "published",
    stock_quantity: 8,
    is_featured: true,
    attributes: { vram: "24GB GDDR6X", cuda_cores: 16384, architecture: "Ada Lovelace" },
    specifications: {
      "Memory Interface": "384-bit GDDR6X with 1008 GB/s bandwidth",
      "Ray Tracing": "3rd Gen Ray Tracing Cores, 4th Gen Tensor Cores",
      "Power": "450W TGP, recommended 850W+ PSU",
    },
    tags: ["nvidia", "rtx4090", "gpu", "graphics-card", "hardware", "gaming"],
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.99,
    review_count: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Smart Wearables (Additions)
  {
    id: "p1010101-0024-0000-0000-000000000024",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "Garmin Fenix 7 Pro Solar Sapphire Multisport GPS",
    slug: "garmin-fenix-7-pro-solar-sapphire",
    description: "Ultimate rugged outdoor smartwatch with Power Sapphire solar charging lens, built-in LED flashlight, multi-band GPS tracking, and up to 37 days battery life.",
    brand: "Garmin",
    price: 799.99,
    compare_at_price: 899.99,
    sku: "GRM-FENIX7P-SOL",
    status: "published",
    stock_quantity: 16,
    is_featured: true,
    attributes: { case: "47mm Titanium", battery: "Up to 37 days with solar" },
    specifications: {
      "Lens": "Power Sapphire solar charging scratch-resistant glass",
      "Sensors": "Wrist-based heart rate, Pulse Ox, SatIQ multi-band GNSS",
      "Flashlight": "Variable intensity white and red safety strobe LED",
    },
    tags: ["garmin", "smartwatch", "wearables", "gps", "solar", "fitness"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.93,
    review_count: 54,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0025-0000-0000-000000000025",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "Samsung Galaxy Watch Ultra Titanium 47mm LTE",
    slug: "samsung-galaxy-watch-ultra-titanium",
    description: "Extreme outdoor titanium smartwatch with Cushion Design unibody, 3nm processor, 10ATM water resistance, Quick Button, and Galaxy AI health coaching metrics.",
    brand: "Samsung",
    price: 649.99,
    compare_at_price: 699.99,
    sku: "SAMS-GW-ULTRA-TI",
    status: "published",
    stock_quantity: 21,
    is_featured: false,
    attributes: { case: "Grade 4 Titanium", display: "1.5\" Super AMOLED 3000 nits" },
    specifications: {
      "Durability": "MIL-STD-810H certified, 10ATM / IP68 ocean-ready water resistance",
      "Sensors": "BioActive Sensor (Optical Heart + Electrical Heart + Bioimpedance)",
      "Battery": "Up to 100 hours in Power Saving mode (590mAh)",
    },
    tags: ["samsung", "galaxy", "smartwatch", "wearables", "titanium"],
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.86,
    review_count: 39,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0026-0000-0000-000000000026",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "Ray-Ban Meta Wayfarer Smart Glasses with AI Video",
    slug: "ray-ban-meta-wayfarer-smart-glasses",
    description: "Next-gen smart eyewear with 12MP ultra-wide camera, open-ear spatial audio speakers, 5-mic array, and Meta AI voice assistant with real-time video understanding.",
    brand: "Ray-Ban Meta",
    price: 299.00,
    compare_at_price: 329.00,
    sku: "RB-META-WAY-BLK",
    status: "published",
    stock_quantity: 28,
    is_featured: true,
    attributes: { frame: "Matte Black Wayfarer", camera: "12MP Ultra-wide 1080p 60fps" },
    specifications: {
      "Audio": "Custom open-ear speakers with directional audio privacy",
      "Camera": "12MP ultra-wide captures vertical photos and 1080p video",
      "Case": "Charging case provides up to 36 hours of total operational battery",
    },
    tags: ["rayban", "meta", "smart-glasses", "ai", "wearables"],
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.91,
    review_count: 94,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0027-0000-0000-000000000027",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "Oura Ring Horizon Gen 3 Titanium Smart Ring",
    slug: "oura-ring-horizon-gen3-titanium",
    description: "Sleek circular titanium ring tracking sleep score, readiness, activity metrics, body temperature trends, and cardiovascular age with 7-day battery life.",
    brand: "Oura",
    price: 349.00,
    compare_at_price: 399.00,
    sku: "OURA-HORIZON-STEALTH",
    status: "published",
    stock_quantity: 24,
    is_featured: false,
    attributes: { material: "Titanium with PVD Coating", weight: "4 to 6 grams" },
    specifications: {
      "Sensors": "Research-grade infrared and red PPG sensors, negative temperature coefficient sensors",
      "Water Resistance": "Up to 100m (330 ft) water resistant",
      "Battery": "4 to 7 days battery on a single 20-80 minute charge",
    },
    tags: ["oura", "smart-ring", "sleep-tracker", "wearables", "health"],
    images: [
      "/images/products/biosync_smart_ring.jpg",
    ],
    avg_rating: 4.84,
    review_count: 61,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0028-0000-0000-000000000028",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c3333333-3333-3333-3333-333333333333",
    category_name: "Smart Wearables",
    title: "WHOOP 4.0 Biometric Performance Health Band",
    slug: "whoop-4-biometric-performance-band",
    description: "Screen-free continuous biometric sensor tracking strain, recovery, sleep stages, skin temperature, and blood oxygen with wireless on-the-go waterproof charging.",
    brand: "WHOOP",
    price: 239.00,
    compare_at_price: 269.00,
    sku: "WHOOP-40-ONYX",
    status: "published",
    stock_quantity: 33,
    is_featured: false,
    attributes: { band: "SuperKnit Onyx", battery: "4-5 days wireless pack" },
    specifications: {
      "Sensors": "5 LEDs (3 green, 1 red, 1 infrared) with 4 photodiodes",
      "Telemetry": "Calculates daily recovery score and recommended cardiovascular exertion strain",
    },
    tags: ["whoop", "fitness-tracker", "wearables", "biometrics"],
    images: [
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.82,
    review_count: 47,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Ergonomics & Workstations (Additions)
  {
    id: "p1010101-0029-0000-0000-000000000029",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Herman Miller Aeron Ergonomic Task Chair (Graphite)",
    slug: "herman-miller-aeron-chair",
    description: "The benchmark for ergonomic office seating with breathable Pellicle 8Z suspension, PostureFit SL adjustable sacral/lumbar support, and harmonic tilt mechanism.",
    brand: "Herman Miller",
    price: 1395.00,
    compare_at_price: 1495.00,
    sku: "HM-AERON-SIZE-B",
    status: "published",
    stock_quantity: 12,
    is_featured: true,
    attributes: { size: "Size B (Medium)", color: "Graphite", support: "PostureFit SL" },
    specifications: {
      "Material": "Recycled ocean-bound plastic with 8Z Pellicle elastomeric mesh",
      "Adjustability": "Fully adjustable arms, tilt limiter with forward angle, lumbar depth",
      "Warranty": "12-year 3-shift warranty",
    },
    tags: ["chair", "ergonomic", "herman-miller", "workstation", "office"],
    images: [
      "https://images.unsplash.com/photo-1580481077195-c3a8a37f714c?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.97,
    review_count: 110,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0030-0000-0000-000000000030",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Secretlab TITAN Evo Ergonomic Gaming Chair (Stealth)",
    slug: "secretlab-titan-evo-stealth",
    description: "Award-winning gaming chair featuring cold-cure foam, 4-way L-ADAPT lumbar support system, CloudSwap magnetic armrest tops, and magnetic memory foam head pillow.",
    brand: "Secretlab",
    price: 549.00,
    compare_at_price: 599.00,
    sku: "SEC-TITAN-EVO-REG",
    status: "published",
    stock_quantity: 20,
    is_featured: false,
    attributes: { upholstery: "NEO Hybrid Leatherette", recline: "165-degree tilt" },
    specifications: {
      "Lumbar Support": "4-way built-in ergonomic internal lumbar adjustment",
      "Armrests": "Full-metal 4D armrests with magnetic CloudSwap replacement tops",
    },
    tags: ["chair", "secretlab", "gaming", "ergonomics", "desk"],
    images: [
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.91,
    review_count: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0031-0000-0000-000000000031",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    slug: "keychron-q1-pro-mechanical-keyboard",
    description: "Full CNC machined 6063 aluminum 75% mechanical keyboard with hot-swappable switches, double-gasket design, programmable rotary knob, and Bluetooth 5.1.",
    brand: "Keychron",
    price: 199.00,
    compare_at_price: 219.00,
    sku: "KC-Q1P-KNOB-RED",
    status: "published",
    stock_quantity: 27,
    is_featured: false,
    attributes: { layout: "75%", body: "Full CNC Aluminum", switches: "K Pro Red Linear" },
    specifications: {
      "Mounting": "Double-gasket acoustic vibration isolation structure",
      "Keycaps": "KSA double-shot PBT keycaps",
      "Firmware": "QMK/VIA open-source custom mapping supported",
    },
    tags: ["keyboard", "keychron", "mechanical", "custom-keyboard", "wireless"],
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.89,
    review_count: 65,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0032-0000-0000-000000000032",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "Uplift V2 Commercial 72x30 Solid Walnut Standing Desk",
    slug: "uplift-v2-standing-desk-walnut",
    description: "Commercial dual-motor height-adjustable motorized sit-stand desk with 1.75-inch thick solid American walnut hardwood top and advanced memory keypad.",
    brand: "Uplift Desk",
    price: 899.00,
    compare_at_price: 999.00,
    sku: "UPL-V2-7230-WAL",
    status: "published",
    stock_quantity: 9,
    is_featured: true,
    attributes: { desktop: "Solid Walnut 72\" x 30\"", capacity: "355 lbs lifting weight" },
    specifications: {
      "Motors": "Dual quiet German-engineered height adjustment motors",
      "Height Range": "25.3\" to 50.9\" with 4 one-touch programmable presets",
    },
    tags: ["desk", "standing-desk", "ergonomics", "workstation", "walnut"],
    images: [
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.95,
    review_count: 58,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0033-0000-0000-000000000033",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c4444444-4444-4444-4444-444444444444",
    category_name: "Ergonomics & Workstations",
    title: "BenQ ScreenBar Halo LED Wireless Controller Light",
    slug: "benq-screenbar-halo-monitor-light",
    description: "Patented asymmetric optical monitor desk lamp with wireless rotary controller, dual front/back ambient lighting, and zero reflective screen glare.",
    brand: "BenQ",
    price: 179.00,
    compare_at_price: 199.00,
    sku: "BENQ-SB-HALO",
    status: "published",
    stock_quantity: 36,
    is_featured: false,
    attributes: { control: "Wireless 2.4GHz Dial", illumination: "Front & Rear Backlight" },
    specifications: {
      "Optical Design": "Asymmetric optical design prevents direct eye strain and screen reflection",
      "Color Temp": "Adjustable from 2700K warm amber to 6500K cool white",
    },
    tags: ["benq", "desk-lamp", "lighting", "screenbar", "workstation"],
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.93,
    review_count: 82,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // AI Edge Devices (Additions)
  {
    id: "p1010101-0034-0000-0000-000000000034",
    seller_id: "s-apex-dynamics",
    seller_name: "Apex Dynamics Studio",
    seller_slug: "apex-dynamics",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "Google Pixel 9 Pro Fold AI Smartphone (512GB Obsidian)",
    slug: "google-pixel-9-pro-fold-512gb",
    description: "The thinnest foldable with Google Tensor G4 AI chip, 8-inch Super Actua Flex inner display, Magic Editor multimodal AI tools, and aerospace-grade multi-alloy steel hinge.",
    brand: "Google",
    price: 1799.00,
    compare_at_price: 1899.00,
    sku: "GOOG-PX9FOLD-512",
    status: "published",
    stock_quantity: 15,
    is_featured: true,
    attributes: { storage: "512GB", ram: "16GB", chip: "Google Tensor G4 AI" },
    specifications: {
      "Display": "Outer: 6.3\" Actua 120Hz; Inner: 8.0\" Super Actua Flex OLED 120Hz",
      "AI Features": "Gemini Live multimodal voice assistance, Pixel Studio image generation, Add Me photo compositor",
      "Camera": "Triple rear system with 48MP Quad PD main, 5x telephoto with 20x Super Res Zoom",
    },
    tags: ["google", "pixel", "foldable", "smartphone", "gemini", "ai"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.88,
    review_count: 36,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p1010101-0035-0000-0000-000000000035",
    seller_id: "s-optipulse",
    seller_name: "OptiPulse Technologies",
    seller_slug: "optipulse",
    category_id: "c5555555-5555-5555-5555-555555555555",
    category_name: "AI Edge Devices",
    title: "NVIDIA Jetson Orin Nano Developer AI Edge Kit",
    slug: "nvidia-jetson-orin-nano-dev-kit",
    description: "Compact embedded AI powerhouse delivering up to 40 TOPS of real-time edge AI inference performance for vision AI, robotics, neural pipelines, and autonomous machines.",
    brand: "NVIDIA",
    price: 499.00,
    compare_at_price: 549.00,
    sku: "NV-JETSON-NANO-8GB",
    status: "published",
    stock_quantity: 20,
    is_featured: false,
    attributes: { compute: "40 TOPS AI", memory: "8GB 128-bit LPDDR5", architecture: "NVIDIA Ampere" },
    specifications: {
      "GPU": "1024-core NVIDIA Ampere architecture GPU with 32 Tensor Cores",
      "CPU": "6-core Arm Cortex-A78AE v8.2 64-bit CPU",
      "Connectivity": "M.2 Key M NVMe, Gigabit Ethernet, 4x USB 3.2 Gen2",
    },
    tags: ["nvidia", "jetson", "ai-edge", "developer", "robotics", "hardware"],
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    ],
    avg_rating: 4.95,
    review_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Client-side local memory fallback cache
let _localProductsCache: Product[] = [...INITIAL_ELECTRONICS_PRODUCTS];

// =============================================================================
// CATEGORIES
// =============================================================================

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/categories`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend /api/v1/categories, falling back to defaults", err);
  }

  // Fallback default categories
  return [
    {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Audio & Acoustics",
      slug: "audio-acoustics",
      description: "High-fidelity audio, noise-canceling headphones, and studio gear.",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      display_order: 1,
      is_active: true,
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      name: "Computer Hardware",
      slug: "computer-hardware",
      description: "Workstation components, high-performance inputs, and displays.",
      image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      display_order: 2,
      is_active: true,
    },
    {
      id: "c3333333-3333-3333-3333-333333333333",
      name: "Smart Wearables",
      slug: "smart-wearables",
      description: "Next-generation bio-metric wearables and spatial computing optics.",
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      display_order: 3,
      is_active: true,
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      name: "Ergonomics & Workstations",
      slug: "ergonomics-workstations",
      description: "Adaptive desks, ergonomic mechanical keyboards, and studio seating.",
      image_url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
      display_order: 4,
      is_active: true,
    },
    {
      id: "c5555555-5555-5555-5555-555555555555",
      name: "AI Edge Devices",
      slug: "ai-edge-devices",
      description: "Edge inference hardware, neural co-processors, and smart sensors.",
      image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      display_order: 5,
      is_active: true,
    },
  ];
}

// =============================================================================
// PRODUCTS
// =============================================================================

export async function fetchProducts(params: {
  category?: string;
  search?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  dealsOnly?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sort_by", params.sortBy);
  if (params.minPrice !== undefined && params.minPrice > 0) query.set("min_price", String(params.minPrice));
  if (params.maxPrice !== undefined && params.maxPrice < 10000) query.set("max_price", String(params.maxPrice));
  if (params.minRating !== undefined && params.minRating > 0) query.set("min_rating", String(params.minRating));
  if (params.dealsOnly) query.set("deals_only", "true");
  if (params.isFeatured !== undefined) query.set("is_featured", String(params.isFeatured));
  query.set("page", String(params.page || 1));
  query.set("page_size", String(params.pageSize || 12));

  try {
    const res = await fetch(`${API_BASE}/api/v1/products?${query.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data: ProductListResponse = await res.json();
      _localProductsCache = data.items;
      return data;
    }
  } catch (err) {
    console.warn("Could not reach backend /api/v1/products, checking cache", err);
  }

  // Fallback pagination
  let items = [..._localProductsCache];
  if (params.category && params.category !== "all") {
    const rawCat = params.category.toLowerCase().trim();
    const cleanCat = rawCat.replace(/[^a-z0-9]/g, "");
    items = items.filter((p) => {
      const cId = (p.category_id || "").toLowerCase();
      const cName = (p.category_name || "").toLowerCase();
      const cCleanName = cName.replace(/[^a-z0-9]/g, "");
      const cSlug = cName.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      return (
        cId === rawCat ||
        cSlug === rawCat ||
        cName === rawCat ||
        cCleanName === cleanCat ||
        cCleanName.includes(cleanCat) ||
        cleanCat.includes(cCleanName)
      );
    });
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        (p.brand && p.brand.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 12;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: paged,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  };
}

export async function fetchProductById(idOrSlug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products/${idOrSlug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend for product detail:", err);
  }

  return (
    _localProductsCache.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ||
    null
  );
}

// =============================================================================
// SELLER PRODUCT MANAGEMENT
// =============================================================================

export async function fetchSellerProducts(token?: string): Promise<ProductListResponse> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/seller/products?page=1&page_size=50`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch seller products from backend:", err);
  }

  return {
    items: _localProductsCache,
    total: _localProductsCache.length,
    page: 1,
    page_size: 50,
    total_pages: 1,
  };
}

export async function createProduct(
  input: ProductInput,
  token?: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/seller/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const created: Product = await res.json();
      _localProductsCache.unshift(created);
      return { success: true, product: created };
    }
    const errData = await res.json();
    return { success: false, error: errData.detail || "Failed to create product" };
  } catch (err: unknown) {
    console.warn("Backend API offline or unreachable, falling back to local state:", err);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      seller_id: "seller-1",
      seller_name: "Apex Electronics",
      seller_slug: "apex-electronics",
      category_id: input.category_id,
      category_name: "Electronics",
      title: input.title,
      slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: input.description,
      brand: input.brand,
      price: input.price,
      compare_at_price: input.compare_at_price,
      sku: input.sku || `SKU-${Date.now()}`,
      status: input.status || "published",
      stock_quantity: input.stock_quantity ?? 10,
      is_featured: input.is_featured ?? false,
      attributes: input.attributes || {},
      specifications: input.specifications || {},
      tags: input.tags || [],
      images: input.images?.length
        ? input.images
        : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
      avg_rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _localProductsCache.unshift(newProduct);
    return { success: true, product: newProduct };
  }
}

export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>,
  token?: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/seller/products/${productId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const updated: Product = await res.json();
      const idx = _localProductsCache.findIndex((p) => p.id === productId);
      if (idx !== -1) _localProductsCache[idx] = updated;
      return { success: true, product: updated };
    }
    const errData = await res.json();
    return { success: false, error: errData.detail || "Failed to update product" };
  } catch (err: unknown) {
    console.warn("Backend API offline or unreachable, updating local state:", err);
    const idx = _localProductsCache.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      _localProductsCache[idx] = {
        ..._localProductsCache[idx],
        ...input,
        updated_at: new Date().toISOString(),
      };
      return { success: true, product: _localProductsCache[idx] };
    }
    return { success: false, error: "Product not found" };
  }
}

export async function deleteProduct(
  productId: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/seller/products/${productId}`, {
      method: "DELETE",
      headers,
    });

    if (res.ok) {
      _localProductsCache = _localProductsCache.filter((p) => p.id !== productId);
      return { success: true };
    }
    const errData = await res.json();
    return { success: false, error: errData.detail || "Failed to delete product" };
  } catch (err: unknown) {
    console.warn("Backend API offline or unreachable, deleting from local state:", err);
    _localProductsCache = _localProductsCache.filter((p) => p.id !== productId);
    return { success: true };
  }
}

// =============================================================================
// REVIEWS
// =============================================================================

export async function submitProductReview(
  productId: string,
  rating: number,
  title: string,
  comment: string,
  token?: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/products/${productId}/reviews`, {
      method: "POST",
      headers,
      body: JSON.stringify({ rating, title, comment }),
    });

    if (res.ok) {
      const updated: Product = await res.json();
      return { success: true, product: updated };
    }
    const errData = await res.json();
    return { success: false, error: errData.detail || "Failed to submit review" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to post review";
    return { success: false, error: msg };
  }
}

// =============================================================================
// SUPABASE STORAGE IMAGE UPLOAD
// =============================================================================

export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  // If Supabase credentials are configured, upload to Supabase Storage bucket 'product-images'
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase Storage error:", error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        return { success: true, url: publicUrlData.publicUrl };
      }
    } catch (e) {
      console.warn("Supabase upload exception:", e);
    }
  }

  // Fallback: Read as base64 data URL for local preview testing
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ success: true, url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read image file locally" });
    };
    reader.readAsDataURL(file);
  });
}

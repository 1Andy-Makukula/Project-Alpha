import { Shop, Product } from '../types';
import * as part1 from './additionalShopsPart1';
import * as part2 from './additionalShopsPart2';

/**
 * @desc Enhanced shop data with detailed products for realistic demo
 * Features 2 verified shops and 2 independent sellers with 10+ products each
 */

// ============================================
// SHOP 1: Petal Paradise (Gift & Flower Shop - SELECT TIER)
// ============================================

const petalParadiseProducts: Product[] = [
  {
    id: 1001,
    name: "Red Rose Bouquet (12 stems)",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 25,
    description: "Classic dozen red roses, perfect for expressing love. Freshly cut and arranged with care.",
    shopId: 101
  },
  {
    id: 1002,
    name: "White Lily Arrangement",
    price: 300.00,
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 18,
    description: "Elegant white lilies symbolizing purity and devotion.",
    shopId: 101
  },
  {
    id: 1003,
    name: "Mixed Flower Bouquet",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 30,
    description: "Vibrant mix of seasonal flowers including roses, lilies, and carnations.",
    shopId: 101
  },
  {
    id: 1004,
    name: "Orchid Plant",
    price: 450.00,
    image: "https://images.unsplash.com/photo-1604863005976-5884c0cd1a94?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 12,
    description: "Beautiful potted orchid plant that lasts for months with proper care.",
    shopId: 101
  },
  {
    id: 1005,
    name: "Sunflower Bunch",
    price: 200.00,
    image: "https://images.unsplash.com/photo-1597848212624-e530bb12d07f?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 20,
    description: "Bright and cheerful sunflowers to brighten anyone's day.",
    shopId: 101
  },
  {
    id: 1006,
    name: "Luxury Gift Basket",
    price: 550.00,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop",
    category: "Gift Baskets",
    stock: 15,
    description: "Premium gift basket with chocolates, wine, and gourmet treats.",
    shopId: 101
  },
  {
    id: 1007,
    name: "Fruit & Flower Combo",
    price: 400.00,
    image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400&h=400&fit=crop",
    category: "Gift Baskets",
    stock: 22,
    description: "Beautiful combination of fresh fruits and flowers.",
    shopId: 101
  },
  {
    id: 1008,
    name: "Teddy Bear & Roses",
    price: 320.00,
    image: "https://images.unsplash.com/photo-1574934902659-1af9de69cd72?w=400&h=400&fit=crop",
    category: "Gifts",
    stock: 18,
    description: "Cute teddy bear with a bouquet of red roses.",
    shopId: 101
  },
  {
    id: 1009,
    name: "Sympathy Wreath",
    price: 600.00,
    image: "https://images.unsplash.com/photo-1521543832500-49e69fb36a1f?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 8,
    description: "Elegant sympathy wreath with white and pastel flowers.",
    shopId: 101
  },
  {
    id: 1010,
    name: "Anniversary Bouquet",
    price: 380.00,
    image: "https://images.unsplash.com/photo-1594582440449-c3e8a4007d16?w=400&h=400&fit=crop",
    category: "Flowers",
    stock: 25,
    description: "Romantic bouquet perfect for anniversaries and special occasions.",
    shopId: 101
  },
  {
    id: 1011,
    name: "Chocolate & Roses Gift",
    price: 420.00,
    image: "https://images.unsplash.com/photo-1564032826413-8d095a71fc4f?w=400&h=400&fit=crop",
    category: "Gifts",
    stock: 20,
    description: "Luxurious combination of premium chocolates and fresh roses.",
    shopId: 101
  },
  {
    id: 1012,
    name: "Baby Girl Gift Set",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1620756863865-3737bf1d4f4d?w=400&h=400&fit=crop",
    category: "Gifts",
    stock: 10,
    description: "Adorable gift set for newborn girls with flowers and baby essentials.",
    shopId: 101
  }
];

export const petalParadise: Omit<Shop, 'tier'> = {
  id: 101,
  name: "Petal Paradise",
  description: "Zambia's premier flower and gift shop. We specialize in fresh flowers, elegant arrangements, and thoughtful gift baskets for every occasion. Same-day delivery available in Lusaka.",
  profilePic: "https://images.unsplash.com/photo-1584227104125-7dde5c428fc4?w=400&h=400&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200&h=400&fit=crop",
  category: "Gifts",
  location: "Lusaka",
  region: "Lusaka Province",
  city: "Lusaka",
  country: "Zambia",
  address: "Plot 123, Cairo Road, Lusaka Central",
  coordinates: {
    lat: -15.4167,
    lng: 28.2833
  },
  isVerified: true,
  rating: 4.9,
  dateAdded: "2024-01-10",
  isFeatured: true,
  keywords: ["flowers", "gifts", "bouquets", "roses", "delivery", "occasions"],
  minOrder: 150,
  isNew: false,
  hasOffer: true,
  reviewCount: 247,
  totalReviews: 5,
  openingHours: "08:00 - 18:00"
};

// ============================================
// SHOP 2: HealthCare Plus Pharmacy (Pharmacy & Cosmetics - SELECT TIER)
// ============================================

const healthCarePlusProducts: Product[] = [
  {
    id: 2001,
    name: "Paracetamol 500mg (20 tablets)",
    price: 15.00,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    category: "Medications",
    stock: 200,
    description: "Pain relief and fever reducer. Safe and effective.",
    shopId: 102
  },
  {
    id: 2002,
    name: "Vitamin C 1000mg (30 tablets)",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1550572017-4c1a0c8e9e6e?w=400&h=400&fit=crop",
    category: "Vitamins",
    stock: 150,
    description: "Immune system support with high-potency Vitamin C.",
    shopId: 102
  },
  {
    id: 2003,
    name: "Cetaphil Gentle Skin Cleanser",
    price: 85.00,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    category: "Skincare",
    stock: 75,
    description: "Dermatologist-recommended gentle cleanser for all skin types.",
    shopId: 102
  },
  {
    id: 2004,
    name: "Nivea Soft Moisturizing Cream",
    price: 55.00,
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
    category: "Skincare",
    stock: 100,
    description: "Refreshing moisturizer with Vitamin E and Jojoba oil.",
    shopId: 102
  },
  {
    id: 2005,
    name: "First Aid Kit (45 pieces)",
    price: 120.00,
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop",
    category: "First Aid",
    stock: 50,
    description: "Complete first aid kit for home and travel emergencies.",
    shopId: 102
  },
  {
    id: 2006,
    name: "Digital Thermometer",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400&fit=crop",
    category: "Medical Devices",
    stock: 80,
    description: "Fast and accurate digital thermometer with memory function.",
    shopId: 102
  },
  {
    id: 2007,
    name: "Multivitamin Daily (60 tablets)",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1550572017-4c1a0c8e9e6e?w=400&h=400&fit=crop",
    category: "Vitamins",
    stock: 120,
    description: "Complete daily multivitamin for men and women.",
    shopId: 102
  },
  {
    id: 2008,
    name: "L'Oréal Age Perfect Serum",
    price: 180.00,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    category: "Cosmetics",
    stock: 45,
    description: "Anti-aging serum with Vitamin C and hyaluronic acid.",
    shopId: 102
  },
  {
    id: 2009,
    name: "Hand Sanitizer 250ml",
    price: 25.00,
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=400&fit=crop",
    category: "Hygiene",
    stock: 200,
    description: "70% alcohol-based hand sanitizer. Kills 99.9% of germs.",
    shopId: 102
  },
  {
    id: 2010,
    name: "Omega-3 Fish Oil (90 capsules)",
    price: 110.00,
    image: "https://images.unsplash.com/photo-1550572017-4c1a0c8e9e6e?w=400&h=400&fit=crop",
    category: "Vitamins",
    stock: 65,
    description: "Heart health support with premium Omega-3 fatty acids.",
    shopId: 102
  },
  {
    id: 2011,
    name: "Garnier Micellar Water",
    price: 75.00,
    image: "https://images.unsplash.com/photo-1556228852-80f3805cd7a5?w=400&h=400&fit=crop",
    category: "Skincare",
    stock: 90,
    description: "All-in-one cleanser and makeup remover.",
    shopId: 102
  },
  {
    id: 2012,
    name: "Blood Pressure Monitor",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    category: "Medical Devices",
    stock: 30,
    description: "Digital blood pressure monitor for home use.",
    shopId: 102
  },
  {
    id: 2013,
    name: "Calcium + D3 Tablets",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1550572017-4c1a0c8e9e6e?w=400&h=400&fit=crop",
    category: "Vitamins",
    stock: 100,
    description: "Bone health support with Calcium and Vitamin D3.",
    shopId: 102
  },
  {
    id: 2014,
    name: "Maybelline Fit Me Foundation",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&h=400&fit=crop",
    category: "Cosmetics",
    stock: 60,
    description: "Lightweight foundation for natural-looking coverage.",
    shopId: 102
  },
  {
    id: 2015,
    name: "N95 Face Masks (10 pack)",
    price: 80.00,
    image: "https://images.unsplash.com/photo-1584735175315-9d5df23860ca?w=400&h=400&fit=crop",
    category: "Hygiene",
    stock: 150,
    description: "High-quality N95 respirator masks for protection.",
    shopId: 102
  }
];

export const healthCarePlus: Omit<Shop, 'tier'> = {
  id: 102,
  name: "HealthCare Plus Pharmacy",
  description: "Your trusted pharmacy for medications, vitamins, skincare, and cosmetics. Licensed pharmacists available for consultations. We stock genuine products from leading brands at affordable prices.",
  profilePic: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&h=400&fit=crop",
  category: "Health & Beauty",
  location: "Ndola",
  region: "Copperbelt Province",
  city: "Ndola",
  country: "Zambia",
  address: "Shop 45, Broadway Mall, Ndola CBD",
  coordinates: {
    lat: -12.9719,
    lng: 28.6367
  },
  isVerified: true,
  rating: 4.8,
  dateAdded: "2024-01-15",
  isFeatured: true,
  keywords: ["pharmacy", "medicines", "health", "beauty", "cosmetics", "vitamins", "skincare"],
  minOrder: 20,
  isNew: false,
  hasOffer: true,
  reviewCount: 189,
  totalReviews: 5
};

// ============================================
// INDEPENDENT 1: Sweet Moments by Sarah (Cakes Seller - INDEPENDENT TIER)
// ============================================

const sweetMomentsProducts: Product[] = [
  {
    id: 3001,
    name: "Chocolate Fudge Birthday Cake",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
    category: "Birthday Cakes",
    stock: 5,
    description: "Rich chocolate cake with fudge frosting. Serves 12-15 people.",
    shopId: 103,
    type: 'made_to_order',
    leadTime: '48h'
  },
  {
    id: 3002,
    name: "Vanilla Wedding Cake (3-tier)",
    price: 1200.00,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop",
    category: "Wedding Cakes",
    stock: 2,
    description: "Elegant 3-tier vanilla wedding cake with buttercream flowers. Serves 50+ people.",
    shopId: 103
  },
  {
    id: 3003,
    name: "Red Velvet Cake",
    price: 380.00,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=400&fit=crop",
    category: "Special Occasion",
    stock: 4,
    description: "Classic red velvet with cream cheese frosting. Perfect for any celebration.",
    shopId: 103
  },
  {
    id: 3004,
    name: "Cupcakes Assortment (12 pieces)",
    price: 180.00,
    image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=400&fit=crop",
    category: "Cupcakes",
    stock: 15,
    description: "Mixed flavors including vanilla, chocolate, and strawberry cupcakes.",
    shopId: 103
  },
  {
    id: 3005,
    name: "Custom Photo Cake",
    price: 450.00,
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop",
    category: "Custom Cakes",
    stock: 3,
    description: "Personalized cake with edible photo print. Send your photo after ordering.",
    shopId: 103
  },
  {
    id: 3006,
    name: "Carrot Cake with Walnuts",
    price: 320.00,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
    category: "Specialty Cakes",
    stock: 6,
    description: "Moist carrot cake with cream cheese frosting and walnuts.",
    shopId: 103
  },
  {
    id: 3007,
    name: "Unicorn Rainbow Cake",
    price: 420.00,
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop",
    category: "Kids Birthday",
    stock: 4,
    description: "Colorful unicorn-themed cake perfect for children's parties.",
    shopId: 103
  },
  {
    id: 3008,
    name: "Lemon Drizzle Cake",
    price: 280.00,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
    category: "Specialty Cakes",
    stock: 7,
    description: "Tangy lemon cake with sweet glaze. Light and refreshing.",
    shopId: 103
  },
  {
    id: 3009,
    name: "Anniversary Heart Cake",
    price: 400.00,
    image: "https://images.unsplash.com/photo-1596009190750-846793e951de?w=400&h=400&fit=crop",
    category: "Special Occasion",
    stock: 3,
    description: "Romantic heart-shaped cake perfect for anniversaries.",
    shopId: 103
  },
  {
    id: 3010,
    name: "Cookies & Cream Cake",
    price: 360.00,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
    category: "Birthday Cakes",
    stock: 5,
    description: "Layers of vanilla cake with crushed Oreos and cream cheese frosting.",
    shopId: 103
  },
  {
    id: 3011,
    name: "Mini Celebration Cakes (6 pieces)",
    price: 220.00,
    image: "https://images.unsplash.com/photo-1536964549255-d2d426e5fbba?w=400&h=400&fit=crop",
    category: "Mini Cakes",
    stock: 10,
    description: "Individual serving cakes in various flavors. Perfect for parties.",
    shopId: 103
  },
  {
    id: 3012,
    name: "Fruit Tart Cake",
    price: 340.00,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    category: "Specialty Cakes",
    stock: 4,
    description: "Fresh fruit tart with custard cream and glazed seasonal fruits.",
    shopId: 103
  }
];

export const sweetMoments: Omit<Shop, 'tier'> = {
  id: 103,
  name: "Sweet Moments by Sarah",
  description: "Artisan cakes made from scratch with love! Specializing in custom birthday cakes, wedding cakes, and sweet treats for all occasions. All cakes are baked fresh to order using premium ingredients. 48 hours notice required for custom orders.",
  profilePic: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&h=400&fit=crop",
  category: "Bakery",
  location: "Kitwe",
  region: "Copperbelt Province",
  city: "Kitwe",
  country: "Zambia",
  address: "Independence Avenue, Riverside, Kitwe",
  coordinates: {
    lat: -12.8024,
    lng: 28.2134
  },
  isVerified: false,
  rating: 4.7,
  dateAdded: "2024-03-01",
  isFeatured: false,
  keywords: ["cakes", "bakery", "birthday", "wedding", "cupcakes", "custom", "desserts"],
  minOrder: 150,
  isNew: false,
  hasOffer: false,
  reviewCount: 94,
  totalReviews: 5,
  openingHours: "09:00 - 17:00"
};

// ============================================
// INDEPENDENT 2: Elite Events (Events Organizer - INDEPENDENT TIER)
// ============================================

const eliteEventsProducts: Product[] = [
  {
    id: 4001,
    name: "Wedding Package - Classic",
    price: 5000.00,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop",
    category: "Wedding Services",
    stock: 5,
    description: "Complete wedding planning and coordination for up to 150 guests. Includes venue setup, decorations, and day-of coordination.",
    shopId: 104
  },
  {
    id: 4002,
    name: "Birthday Party Package",
    price: 1500.00,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    category: "Birthday Services",
    stock: 10,
    description: "Full birthday party setup including decorations, entertainment, and catering coordination for up to 50 guests.",
    shopId: 104
  },
  {
    id: 4003,
    name: "Corporate Event Planning",
    price: 3500.00,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop",
    category: "Corporate Services",
    stock: 8,
    description: "Professional corporate event management including conferences, product launches, and team building events.",
    shopId: 104
  },
  {
    id: 4004,
    name: "Balloon Decoration Set",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    category: "Decorations",
    stock: 20,
    description: "Premium balloon arch and decoration setup in your choice of colors.",
    shopId: 104
  },
  {
    id: 4005,
    name: "Event Catering Service (50 pax)",
    price: 2500.00,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop",
    category: "Catering",
    stock: 12,
    description: "Professional catering service with buffet setup for 50 people. Menu customizable.",
    shopId: 104
  },
  {
    id: 4006,
    name: "DJ & Sound System (4 hours)",
    price: 800.00,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
    category: "Entertainment",
    stock: 6,
    description: "Professional DJ with quality sound system for 4 hours of entertainment.",
    shopId: 104
  },
  {
    id: 4007,
    name: "Photo Booth Rental",
    price: 600.00,
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
    category: "Entertainment",
    stock: 4,
    description: "Fun photo booth with props and instant prints for 4 hours.",
    shopId: 104
  },
  {
    id: 4008,
    name: "Flower Centerpieces (10 pieces)",
    price: 450.00,
    image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=400&h=400&fit=crop",
    category: "Decorations",
    stock: 15,
    description: "Elegant floral centerpieces for tables. Colors customizable.",
    shopId: 104
  },
  {
    id: 4009,
    name: "Event Chairs & Tables (50 set)",
    price: 700.00,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=400&fit=crop",
    category: "Furniture Rental",
    stock: 10,
    description: "Quality chairs and tables rental for 50 guests.",
    shopId: 104
  },
  {
    id: 4010,
    name: "Traditional Wedding Decor",
    price: 2000.00,
    image: "https://images.unsplash.com/photo-1464192402158-f6f6f7d60a50?w=400&h=400&fit=crop",
    category: "Wedding Services",
    stock: 5,
    description: "Authentic traditional Zambian wedding decoration setup.",
    shopId: 104
  },
  {
    id: 4011,
    name: "Kids Party Entertainment",
    price: 500.00,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    category: "Entertainment",
    stock: 8,
    description: "Face painting, games, and activities for children's parties (3 hours).",
    shopId: 104
  },
  {
    id: 4012,
    name: "Lighting & Stage Setup",
    price: 1200.00,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    category: "Equipment Rental",
    stock: 4,
    description: "Professional event lighting and stage setup with backdrop.",
    shopId: 104
  }
];

export const eliteEvents: Omit<Shop, 'tier'> = {
  id: 104,
  name: "Elite Events",
  description: "Premier event planning and coordination services in Livingstone. We transform your vision into unforgettable experiences. From intimate gatherings to grand weddings, we handle every detail with professionalism and creativity. Specializing in weddings, corporate events, birthdays, and traditional ceremonies.",
  profilePic: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=400&fit=crop",
  category: "Events & Services",
  location: "Livingstone",
  region: "Southern Province",
  city: "Livingstone",
  country: "Zambia",
  address: "Mosi-oa-Tunya Road, Livingstone",
  coordinates: {
    lat: -17.8419,
    lng: 25.8544
  },
  isVerified: false,
  rating: 4.6,
  dateAdded: "2024-02-20",
  isFeatured: false,
  keywords: ["events", "wedding", "planning", "catering", "decorations", "parties", "corporate"],
  minOrder: 500,
  isNew: false,
  hasOffer: false,
  reviewCount: 67,
  totalReviews: 5
};

// ============================================
// EXPORTS
// ============================================

export const ENHANCED_SHOPS = [
  petalParadise,
  healthCarePlus,
  sweetMoments,
  eliteEvents,
  part1.shop105,
  part1.shop106,
  part1.shop107,
  part1.shop108,
  part1.shop109,
  part1.shop110,
  part1.shop111,
  part1.shop112,
  part1.shop113,
  part1.shop114,
  part2.shop115,
  part2.shop116,
  part2.shop117,
  part2.shop118,
  part2.shop119,
  part2.shop120,
  part2.shop121,
  part2.shop122,
  part2.shop123,
  part2.shop124
];

export const SHOP_PRODUCTS = {
  101: petalParadiseProducts,
  102: healthCarePlusProducts,
  103: sweetMomentsProducts,
  104: eliteEventsProducts,
  105: part1.shop105Products,
  106: part1.shop106Products,
  107: part1.shop107Products,
  108: part1.shop108Products,
  109: part1.shop109Products,
  110: part1.shop110Products,
  111: part1.shop111Products,
  112: part1.shop112Products,
  113: part1.shop113Products,
  114: part1.shop114Products,
  115: part2.shop115Products,
  116: part2.shop116Products,
  117: part2.shop117Products,
  118: part2.shop118Products,
  119: part2.shop119Products,
  120: part2.shop120Products,
  121: part2.shop121Products,
  122: part2.shop122Products,
  123: part2.shop123Products,
  124: part2.shop124Products
};

export function getProductsByShopId(shopId: number): Product[] {
  return SHOP_PRODUCTS[shopId as keyof typeof SHOP_PRODUCTS] || [];
}

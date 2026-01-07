import { Shop, Product } from '../types';

// ============================================
// SHOP 15: Mining Supplies Co (Hardware)
// ============================================
export const shop115Products: Product[] = [
  { id: 15001, name: "Safety Boots (Steel Toe)", price: 850.00, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "Safety Gear", stock: 50, shopId: 115 },
  { id: 15002, name: "Hard Hat (Yellow)", price: 150.00, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400", category: "Safety Gear", stock: 100, shopId: 115 },
  { id: 15003, name: "Reflective Vest", price: 85.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Safety Gear", stock: 200, shopId: 115 },
  { id: 15004, name: "Heavy Duty Gloves", price: 65.00, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400", category: "Safety Gear", stock: 150, shopId: 115 },
  { id: 15005, name: "Safety Goggles", price: 55.00, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400", category: "Safety Gear", stock: 120, shopId: 115 }
];

export const shop115: Omit<Shop, 'tier'> = {
  id: 115, name: "Mining Supplies Co", description: "Industrial and mining safety equipment supplier.",
  profilePic: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400", coverImg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200",
  category: "Hardware", location: "Kitwe", region: "Copperbelt Province", city: "Kitwe", country: "Zambia", address: "Industrial Area, Kitwe",
  coordinates: { lat: -12.8200, lng: 28.2300 }, isVerified: true, rating: 4.6, dateAdded: "2024-04-05", isFeatured: false, keywords: ["mining", "safety", "hardware"], minOrder: 500, reviewCount: 30, totalReviews: 5
};

// ============================================
// SHOP 16: Digital Life (Electronics)
// ============================================
export const shop116Products: Product[] = [
  { id: 16001, name: "PlayStation 5 Console", price: 16000.00, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", category: "Gaming", stock: 5, shopId: 116 },
  { id: 16002, name: "PS5 DualSense Controller", price: 1800.00, image: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=400", category: "Gaming", stock: 15, shopId: 116 },
  { id: 16003, name: "4K HDMI Cable (2m)", price: 250.00, image: "https://images.unsplash.com/photo-1562737531-c17d7935d530?w=400", category: "Accessories", stock: 40, shopId: 116 },
  { id: 16004, name: "Samsung 55\" Smart TV", price: 14500.00, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400", category: "TV", stock: 3, shopId: 116 },
  { id: 16005, name: "Soundbar with Subwoofer", price: 3500.00, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", category: "Audio", stock: 8, shopId: 116 }
];

export const shop116: Omit<Shop, 'tier'> = {
  id: 116, name: "Digital Life", description: "Your home for gaming and entertainment systems.",
  profilePic: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400", coverImg: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200",
  category: "Electronics", location: "Kitwe", region: "Copperbelt Province", city: "Kitwe", country: "Zambia", address: "Freedom Park Mall, Kitwe",
  coordinates: { lat: -12.8050, lng: 28.2150 }, isVerified: true, rating: 4.8, dateAdded: "2024-04-08", isFeatured: true, keywords: ["gaming", "tv", "electronics"], minOrder: 200, reviewCount: 65, totalReviews: 5
};

// ============================================
// SHOP 17: Riverside Bakery (Bakery)
// ============================================
export const shop117Products: Product[] = [
  { id: 17001, name: "Fresh Bread Loaf", price: 15.00, image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400", category: "Bread", stock: 50, shopId: 117 },
  { id: 17002, name: "Bread Rolls (Pack of 6)", price: 20.00, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", category: "Bread", stock: 40, shopId: 117 },
  { id: 17003, name: "Glazed Donuts (Pack of 4)", price: 40.00, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400", category: "Pastries", stock: 25, shopId: 117 },
  { id: 17004, name: "Meat Pies", price: 25.00, image: "https://images.unsplash.com/photo-1572383672419-ab477998847e?w=400", category: "Savory", stock: 30, shopId: 117 },
  { id: 17005, name: "Sausage Rolls", price: 20.00, image: "https://images.unsplash.com/photo-1572383672419-ab477998847e?w=400", category: "Savory", stock: 35, shopId: 117 }
];

export const shop117: Omit<Shop, 'tier'> = {
  id: 117, name: "Riverside Bakery", description: "Freshly baked goods daily.",
  profilePic: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", coverImg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200",
  category: "Bakery", location: "Kitwe", region: "Copperbelt Province", city: "Kitwe", country: "Zambia", address: "Riverside, Kitwe",
  coordinates: { lat: -12.8150, lng: 28.2250 }, isVerified: false, rating: 4.4, dateAdded: "2024-04-10", isFeatured: false, keywords: ["bakery", "bread", "pastries"], minOrder: 50, reviewCount: 45, totalReviews: 5
};

// ============================================
// SHOP 18: Victoria Falls Souvenirs (Gifts)
// ============================================
export const shop118Products: Product[] = [
  { id: 18001, name: "Hand-Carved Elephant", price: 450.00, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400", category: "Crafts", stock: 10, shopId: 118 },
  { id: 18002, name: "Copper Bangle", price: 150.00, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400", category: "Jewelry", stock: 30, shopId: 118 },
  { id: 18003, name: "Chitenge Fabric (2m)", price: 120.00, image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400", category: "Fabric", stock: 50, shopId: 118 },
  { id: 18004, name: "Beaded Keychain", price: 50.00, image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400", category: "Accessories", stock: 100, shopId: 118 },
  { id: 18005, name: "Victoria Falls Postcards (Set)", price: 80.00, image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=400", category: "Souvenirs", stock: 60, shopId: 118 }
];

export const shop118: Omit<Shop, 'tier'> = {
  id: 118, name: "Victoria Falls Souvenirs", description: "Authentic Zambian crafts and souvenirs.",
  profilePic: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400", coverImg: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200",
  category: "Gifts", location: "Livingstone", region: "Southern Province", city: "Livingstone", country: "Zambia", address: "Mosi-oa-Tunya Road, Livingstone",
  coordinates: { lat: -17.8450, lng: 25.8550 }, isVerified: true, rating: 4.7, dateAdded: "2024-04-12", isFeatured: true, keywords: ["souvenirs", "crafts", "gifts"], minOrder: 100, reviewCount: 55, totalReviews: 5
};

// ============================================
// SHOP 19: Tourist Essentials (General)
// ============================================
export const shop119Products: Product[] = [
  { id: 19001, name: "Sunscreen SPF 50", price: 180.00, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", category: "Skincare", stock: 20, shopId: 119 },
  { id: 19002, name: "Safari Hat", price: 250.00, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400", category: "Apparel", stock: 15, shopId: 119 },
  { id: 19003, name: "Sunglasses", price: 300.00, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", category: "Accessories", stock: 25, shopId: 119 },
  { id: 19004, name: "Reusable Water Bottle", price: 150.00, image: "https://images.unsplash.com/photo-1602143407151-011141959309?w=400", category: "Accessories", stock: 30, shopId: 119 },
  { id: 19005, name: "Insect Repellent", price: 120.00, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400", category: "Health", stock: 40, shopId: 119 }
];

export const shop119: Omit<Shop, 'tier'> = {
  id: 119, name: "Tourist Essentials", description: "Everything a traveler needs in Livingstone.",
  profilePic: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400", coverImg: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
  category: "General", location: "Livingstone", region: "Southern Province", city: "Livingstone", country: "Zambia", address: "Town Center, Livingstone",
  coordinates: { lat: -17.8500, lng: 25.8600 }, isVerified: false, rating: 4.2, dateAdded: "2024-04-15", isFeatured: false, keywords: ["tourist", "essentials", "travel"], minOrder: 50, reviewCount: 20, totalReviews: 5
};

// ============================================
// SHOP 20: Livingstone Fresh (Fresh Foods)
// ============================================
export const shop120Products: Product[] = [
  { id: 20001, name: "Fresh Bream Fish (1kg)", price: 85.00, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400", category: "Seafood", stock: 20, shopId: 120 },
  { id: 20002, name: "Dried Kapenta (500g)", price: 60.00, image: "https://images.unsplash.com/photo-1615141982880-19ed7e669f3d?w=400", category: "Seafood", stock: 30, shopId: 120 },
  { id: 20003, name: "Dried Fish (Bundle)", price: 120.00, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400", category: "Seafood", stock: 15, shopId: 120 },
  { id: 20004, name: "Local Spinach (Bundle)", price: 10.00, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", category: "Vegetables", stock: 40, shopId: 120 },
  { id: 20005, name: "Tomatoes (1kg)", price: 25.00, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", category: "Vegetables", stock: 35, shopId: 120 }
];

export const shop120: Omit<Shop, 'tier'> = {
  id: 120, name: "Livingstone Fresh", description: "Fresh fish from the Zambezi and local produce.",
  profilePic: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400", coverImg: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200",
  category: "Fresh Foods", location: "Livingstone", region: "Southern Province", city: "Livingstone", country: "Zambia", address: "Maramba Market, Livingstone",
  coordinates: { lat: -17.8600, lng: 25.8700 }, isVerified: false, rating: 4.5, dateAdded: "2024-04-18", isFeatured: false, keywords: ["fish", "vegetables", "market"], minOrder: 50, reviewCount: 35, totalReviews: 5
};

// ============================================
// SHOP 21: Eastern Farmers Market (Fresh Foods)
// ============================================
export const shop121Products: Product[] = [
  { id: 21001, name: "Shelled Groundnuts (1kg)", price: 45.00, image: "https://images.unsplash.com/photo-1627461982705-41e9714852ca?w=400", category: "Grains", stock: 50, shopId: 121 },
  { id: 21002, name: "Sunflower Oil (2L)", price: 90.00, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", category: "Pantry", stock: 30, shopId: 121 },
  { id: 21003, name: "Pure Honey (500g)", price: 65.00, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400", category: "Pantry", stock: 25, shopId: 121 },
  { id: 21004, name: "Sweet Potatoes (1kg)", price: 20.00, image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400", category: "Vegetables", stock: 40, shopId: 121 },
  { id: 21005, name: "Pumpkins (Each)", price: 30.00, image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400", category: "Vegetables", stock: 20, shopId: 121 }
];

export const shop121: Omit<Shop, 'tier'> = {
  id: 121, name: "Eastern Farmers Market", description: "Quality produce from Eastern Province farmers.",
  profilePic: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400", coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  category: "Fresh Foods", location: "Chipata", region: "Eastern Province", city: "Chipata", country: "Zambia", address: "Saturday Market, Chipata",
  coordinates: { lat: -13.6333, lng: 32.6500 }, isVerified: true, rating: 4.6, dateAdded: "2024-04-20", isFeatured: false, keywords: ["groundnuts", "honey", "farm"], minOrder: 50, reviewCount: 40, totalReviews: 5
};

// ============================================
// SHOP 22: Chipata General Dealers (Groceries)
// ============================================
export const shop122Products: Product[] = [
  { id: 22001, name: "Table Salt (1kg)", price: 10.00, image: "https://images.unsplash.com/photo-1518110925495-5fe2f2a28272?w=400", category: "Pantry", stock: 100, shopId: 122 },
  { id: 22002, name: "Matches (Pack of 10)", price: 15.00, image: "https://images.unsplash.com/photo-1585421514738-01798e348bb2?w=400", category: "Household", stock: 80, shopId: 122 },
  { id: 22003, name: "Candles (Pack of 6)", price: 25.00, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400", category: "Household", stock: 60, shopId: 122 },
  { id: 22004, name: "AA Batteries (Pack of 4)", price: 40.00, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", category: "Household", stock: 50, shopId: 122 },
  { id: 22005, name: "Laundry Soap Bar", price: 12.00, image: "https://images.unsplash.com/photo-1585421514738-01798e348bb2?w=400", category: "Household", stock: 120, shopId: 122 }
];

export const shop122: Omit<Shop, 'tier'> = {
  id: 122, name: "Chipata General Dealers", description: "Basic household essentials at great prices.",
  profilePic: "https://images.unsplash.com/photo-1604719312566-b7cb33746955?w=400", coverImg: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200",
  category: "Groceries", location: "Chipata", region: "Eastern Province", city: "Chipata", country: "Zambia", address: "Great East Road, Chipata",
  coordinates: { lat: -13.6400, lng: 32.6600 }, isVerified: false, rating: 4.1, dateAdded: "2024-04-22", isFeatured: false, keywords: ["groceries", "essentials", "shop"], minOrder: 30, reviewCount: 15, totalReviews: 5
};

// ============================================
// SHOP 23: Kansanshi Supplies (Hardware)
// ============================================
export const shop123Products: Product[] = [
  { id: 23001, name: "Round Shovel", price: 120.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Tools", stock: 30, shopId: 123 },
  { id: 23002, name: "Pickaxe", price: 150.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Tools", stock: 25, shopId: 123 },
  { id: 23003, name: "Wheelbarrow", price: 850.00, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400", category: "Equipment", stock: 10, shopId: 123 },
  { id: 23004, name: "Garden Rake", price: 80.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Tools", stock: 40, shopId: 123 },
  { id: 23005, name: "Hose Pipe (20m)", price: 200.00, image: "https://images.unsplash.com/photo-1585421514738-01798e348bb2?w=400", category: "Garden", stock: 15, shopId: 123 }
];

export const shop123: Omit<Shop, 'tier'> = {
  id: 123, name: "Kansanshi Supplies", description: "Hardware and gardening tools in Solwezi.",
  profilePic: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400", coverImg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200",
  category: "Hardware", location: "Solwezi", region: "North-Western Province", city: "Solwezi", country: "Zambia", address: "Independence Avenue, Solwezi",
  coordinates: { lat: -12.1833, lng: 26.4000 }, isVerified: true, rating: 4.4, dateAdded: "2024-04-25", isFeatured: false, keywords: ["hardware", "tools", "garden"], minOrder: 100, reviewCount: 25, totalReviews: 5
};

// ============================================
// SHOP 24: Solwezi Mart (Groceries)
// ============================================
export const shop124Products: Product[] = [
  { id: 24001, name: "Bottled Water (500ml x 24)", price: 80.00, image: "https://images.unsplash.com/photo-1602143407151-011141959309?w=400", category: "Beverages", stock: 50, shopId: 124 },
  { id: 24002, name: "Energy Drink (Can)", price: 15.00, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", category: "Beverages", stock: 100, shopId: 124 },
  { id: 24003, name: "Potato Chips (150g)", price: 20.00, image: "https://images.unsplash.com/photo-1566478949035-0083cb3b05e8?w=400", category: "Snacks", stock: 60, shopId: 124 },
  { id: 24004, name: "Chocolate Bar", price: 12.00, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400", category: "Snacks", stock: 80, shopId: 124 },
  { id: 24005, name: "Assorted Sweets (Pack)", price: 25.00, image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400", category: "Snacks", stock: 70, shopId: 124 }
];

export const shop124: Omit<Shop, 'tier'> = {
  id: 124, name: "Solwezi Mart", description: "Convenience store for quick snacks and drinks.",
  profilePic: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400", coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  category: "Groceries", location: "Solwezi", region: "North-Western Province", city: "Solwezi", country: "Zambia", address: "Town Center, Solwezi",
  coordinates: { lat: -12.1900, lng: 26.4100 }, isVerified: false, rating: 4.0, dateAdded: "2024-04-28", isFeatured: false, keywords: ["snacks", "drinks", "mart"], minOrder: 30, reviewCount: 10, totalReviews: 5
};

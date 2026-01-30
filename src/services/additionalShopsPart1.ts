import { Shop, Product } from '../types';

// ============================================
// SHOP 5: Lusaka Fresh Market (Groceries)
// ============================================
export const shop105Products: Product[] = [
  { id: 5001, name: "Fresh Milk (2L)", price: 35.00, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400", category: "Dairy", stock: 50, shopId: 105 },
  { id: 5002, name: "White Bread Loaf", price: 18.00, image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400", category: "Bakery", stock: 40, shopId: 105 },
  { id: 5003, name: "Eggs (Tray of 30)", price: 90.00, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400", category: "Dairy", stock: 30, shopId: 105 },
  { id: 5004, name: "Breakfast Meal (25kg)", price: 250.00, image: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=400", category: "Grains", stock: 100, shopId: 105 },
  { id: 5005, name: "Cooking Oil (2L)", price: 85.00, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", category: "Pantry", stock: 60, shopId: 105 },
  { id: 5006, name: "White Sugar (2kg)", price: 45.00, image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400", category: "Pantry", stock: 80, shopId: 105 }
];

export const shop105: Omit<Shop, 'tier'> = {
  id: 105, name: "Lusaka Fresh Market", description: "Your daily stop for fresh groceries and household essentials.",
  profilePic: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400", coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  category: "Groceries", location: "Lusaka", region: "Lusaka Province", city: "Lusaka", country: "Zambia", address: "Manda Hill Road, Lusaka",
  coordinates: { lat: -15.3967, lng: 28.2933 }, isVerified: true, rating: 4.5, dateAdded: "2024-03-10", isFeatured: false, keywords: ["groceries", "food", "supermarket"], minOrder: 50, reviewCount: 120, totalReviews: 5
};

// ============================================
// SHOP 6: TechZone Zambia (Electronics)
// ============================================
export const shop106Products: Product[] = [
  { id: 6001, name: "iPhone 13 (128GB)", price: 15000.00, image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400", category: "Phones", stock: 5, shopId: 106 },
  { id: 6002, name: "Samsung Galaxy S21", price: 12000.00, image: "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400", category: "Phones", stock: 8, shopId: 106 },
  { id: 6003, name: "HP Pavilion Laptop", price: 10500.00, image: "https://images.unsplash.com/photo-1588872657578-a3d2af1a2943?w=400", category: "Laptops", stock: 3, shopId: 106 },
  { id: 6004, name: "Wireless Headphones", price: 850.00, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", category: "Audio", stock: 15, shopId: 106 },
  { id: 6005, name: "Power Bank 20000mAh", price: 450.00, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", category: "Accessories", stock: 25, shopId: 106 }
];

export const shop106: Omit<Shop, 'tier'> = {
  id: 106, name: "TechZone Zambia", description: "Premium electronics and gadgets store.",
  profilePic: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400", coverImg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
  category: "Electronics", location: "Lusaka", region: "Lusaka Province", city: "Lusaka", country: "Zambia", address: "Levy Junction Mall, Lusaka",
  coordinates: { lat: -15.4100, lng: 28.2800 }, isVerified: true, rating: 4.7, dateAdded: "2024-03-12", isFeatured: true, keywords: ["electronics", "phones", "laptops"], minOrder: 200, reviewCount: 85, totalReviews: 5
};

// ============================================
// SHOP 7: BuildIt Hardware (Hardware)
// ============================================
export const shop107Products: Product[] = [
  { id: 7001, name: "Cement (50kg)", price: 130.00, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400", category: "Construction", stock: 200, shopId: 107 },
  { id: 7002, name: "Interior Paint (5L)", price: 250.00, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400", category: "Paint", stock: 50, shopId: 107 },
  { id: 7003, name: "Claw Hammer", price: 85.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Tools", stock: 30, shopId: 107 },
  { id: 7004, name: "Cordless Drill", price: 1200.00, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400", category: "Tools", stock: 10, shopId: 107 },
  { id: 7005, name: "Aluminum Ladder", price: 1500.00, image: "https://images.unsplash.com/photo-1556636530-6b7482d80e3d?w=400", category: "Equipment", stock: 5, shopId: 107 }
];

export const shop107: Omit<Shop, 'tier'> = {
  id: 107, name: "BuildIt Hardware", description: "Everything you need for construction and DIY projects.",
  profilePic: "https://images.unsplash.com/photo-1581783342308-f792ca11dfdd?w=400", coverImg: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200",
  category: "Hardware", location: "Lusaka", region: "Lusaka Province", city: "Lusaka", country: "Zambia", address: "Kafue Road, Lusaka",
  coordinates: { lat: -15.4300, lng: 28.2700 }, isVerified: false, rating: 4.3, dateAdded: "2024-03-15", isFeatured: false, keywords: ["hardware", "tools", "construction"], minOrder: 100, reviewCount: 45, totalReviews: 5
};

// ============================================
// SHOP 8: Zambia Best Butcher (Fresh Foods)
// ============================================
export const shop108Products: Product[] = [
  { id: 8001, name: "T-Bone Steak (1kg)", price: 180.00, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400", category: "Beef", stock: 20, shopId: 108 },
  { id: 8002, name: "Beef Mince (1kg)", price: 120.00, image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=400", category: "Beef", stock: 30, shopId: 108 },
  { id: 8003, name: "Whole Chicken", price: 75.00, image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400", category: "Poultry", stock: 40, shopId: 108 },
  { id: 8004, name: "Pork Chops (1kg)", price: 140.00, image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400", category: "Pork", stock: 15, shopId: 108 },
  { id: 8005, name: "Boerewors (1kg)", price: 110.00, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400", category: "Sausages", stock: 25, shopId: 108 }
];

export const shop108: Omit<Shop, 'tier'> = {
  id: 108, name: "Zambia Best Grill", description: "Quality fresh meat cuts and grilled meals.",
  profilePic: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400", coverImg: "https://images.unsplash.com/photo-1558030006-450675393462?w=1200",
  category: "Restaurant", location: "Lusaka", region: "Lusaka Province", city: "Lusaka", country: "Zambia", address: "Woodlands Shopping Mall, Lusaka",
  coordinates: { lat: -15.4250, lng: 28.3100 }, isVerified: true, rating: 4.8, dateAdded: "2024-03-18", isFeatured: false, keywords: ["meat", "grill", "food", "restaurant"], minOrder: 100, reviewCount: 60, totalReviews: 5,
  openingHours: "10:00 - 22:00"
};

// ============================================
// SHOP 9: Fashion Hub (Clothing)
// ============================================
export const shop109Products: Product[] = [
  { id: 9001, name: "Men's Slim Fit Suit", price: 1500.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400", category: "Men", stock: 10, shopId: 109 },
  { id: 9002, name: "Ladies Summer Dress", price: 450.00, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", category: "Women", stock: 20, shopId: 109 },
  { id: 9003, name: "Denim Jeans", price: 350.00, image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400", category: "Unisex", stock: 30, shopId: 109 },
  { id: 9004, name: "Cotton T-Shirt", price: 120.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "Unisex", stock: 50, shopId: 109 },
  { id: 9005, name: "Casual Sneakers", price: 600.00, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "Footwear", stock: 15, shopId: 109 }
];

export const shop109: Omit<Shop, 'tier'> = {
  id: 109, name: "Fashion Hub", description: "Trendy clothing for men and women.",
  profilePic: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", coverImg: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
  category: "Clothing", location: "Lusaka", region: "Lusaka Province", city: "Lusaka", country: "Zambia", address: "East Park Mall, Lusaka",
  coordinates: { lat: -15.3800, lng: 28.3000 }, isVerified: false, rating: 4.4, dateAdded: "2024-03-20", isFeatured: false, keywords: ["clothes", "fashion", "shoes"], minOrder: 200, reviewCount: 30, totalReviews: 5
};

// ============================================
// SHOP 10: Copperbelt Grocers (Groceries)
// ============================================
export const shop110Products: Product[] = [
  { id: 10001, name: "Canned Beans (400g)", price: 15.00, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", category: "Pantry", stock: 100, shopId: 110 },
  { id: 10002, name: "Pasta Spaghetti (500g)", price: 20.00, image: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=400", category: "Pantry", stock: 80, shopId: 110 },
  { id: 10003, name: "Orange Juice (1L)", price: 30.00, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400", category: "Beverages", stock: 50, shopId: 110 },
  { id: 10004, name: "Assorted Biscuits", price: 25.00, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", category: "Snacks", stock: 60, shopId: 110 },
  { id: 10005, name: "Laundry Detergent (2kg)", price: 65.00, image: "https://images.unsplash.com/photo-1585421514738-01798e348bb2?w=400", category: "Household", stock: 40, shopId: 110 }
];

export const shop110: Omit<Shop, 'tier'> = {
  id: 110, name: "Copperbelt Grocers", description: "Affordable groceries for Ndola residents.",
  profilePic: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400", coverImg: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200",
  category: "Groceries", location: "Ndola", region: "Copperbelt Province", city: "Ndola", country: "Zambia", address: "President Avenue, Ndola",
  coordinates: { lat: -12.9600, lng: 28.6300 }, isVerified: true, rating: 4.2, dateAdded: "2024-03-22", isFeatured: false, keywords: ["groceries", "ndola", "food"], minOrder: 50, reviewCount: 25, totalReviews: 5
};

// ============================================
// SHOP 11: Ndola Tools & Paint (Hardware)
// ============================================
export const shop111Products: Product[] = [
  { id: 11001, name: "White Acrylic Paint (20L)", price: 650.00, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400", category: "Paint", stock: 15, shopId: 111 },
  { id: 11002, name: "Paint Roller Set", price: 75.00, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400", category: "Tools", stock: 30, shopId: 111 },
  { id: 11003, name: "Paint Thinner (5L)", price: 120.00, image: "https://images.unsplash.com/photo-1585421514738-01798e348bb2?w=400", category: "Supplies", stock: 20, shopId: 111 },
  { id: 11004, name: "Sandpaper Pack", price: 30.00, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400", category: "Supplies", stock: 50, shopId: 111 },
  { id: 11005, name: "Masking Tape", price: 15.00, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400", category: "Supplies", stock: 100, shopId: 111 }
];

export const shop111: Omit<Shop, 'tier'> = {
  id: 111, name: "Ndola Tools & Paint", description: "Specialists in painting supplies and tools.",
  profilePic: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400", coverImg: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200",
  category: "Hardware", location: "Ndola", region: "Copperbelt Province", city: "Ndola", country: "Zambia", address: "Jacaranda Mall, Ndola",
  coordinates: { lat: -12.9800, lng: 28.6500 }, isVerified: false, rating: 4.0, dateAdded: "2024-03-25", isFeatured: false, keywords: ["paint", "tools", "hardware"], minOrder: 100, reviewCount: 15, totalReviews: 5
};

// ============================================
// SHOP 12: Gadget World (Electronics)
// ============================================
export const shop112Products: Product[] = [
  { id: 12001, name: "Smart Watch Series 6", price: 2500.00, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400", category: "Wearables", stock: 10, shopId: 112 },
  { id: 12002, name: "Bluetooth Speaker", price: 450.00, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", category: "Audio", stock: 20, shopId: 112 },
  { id: 12003, name: "Android Tablet 10\"", price: 3000.00, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", category: "Tablets", stock: 8, shopId: 112 },
  { id: 12004, name: "MicroSD Card 64GB", price: 150.00, image: "https://images.unsplash.com/photo-1562737531-c17d7935d530?w=400", category: "Storage", stock: 40, shopId: 112 },
  { id: 12005, name: "Phone Case (Universal)", price: 80.00, image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400", category: "Accessories", stock: 50, shopId: 112 }
];

export const shop112: Omit<Shop, 'tier'> = {
  id: 112, name: "Gadget World", description: "Latest gadgets and accessories in Ndola.",
  profilePic: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400", coverImg: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200",
  category: "Electronics", location: "Ndola", region: "Copperbelt Province", city: "Ndola", country: "Zambia", address: "Rekays Shopping Centre, Ndola",
  coordinates: { lat: -12.9700, lng: 28.6400 }, isVerified: true, rating: 4.6, dateAdded: "2024-03-28", isFeatured: false, keywords: ["gadgets", "electronics", "phones"], minOrder: 150, reviewCount: 35, totalReviews: 5
};

// ============================================
// SHOP 13: Farm Fresh Ndola (Fresh Foods)
// ============================================
export const shop113Products: Product[] = [
  { id: 13001, name: "Fresh Spinach (Bundle)", price: 10.00, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", category: "Vegetables", stock: 50, shopId: 113 },
  { id: 13002, name: "Cabbage Head", price: 15.00, image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=400", category: "Vegetables", stock: 30, shopId: 113 },
  { id: 13003, name: "Carrots (1kg)", price: 20.00, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", category: "Vegetables", stock: 40, shopId: 113 },
  { id: 13004, name: "Bananas (1kg)", price: 25.00, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", category: "Fruits", stock: 35, shopId: 113 },
  { id: 13005, name: "Oranges (1kg)", price: 30.00, image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400", category: "Fruits", stock: 45, shopId: 113 }
];

export const shop113: Omit<Shop, 'tier'> = {
  id: 113, name: "Farm Fresh Ndola", description: "Straight from the farm to your table.",
  profilePic: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400", coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  category: "Fresh Foods", location: "Ndola", region: "Copperbelt Province", city: "Ndola", country: "Zambia", address: "Masala Market, Ndola",
  coordinates: { lat: -12.9900, lng: 28.6600 }, isVerified: false, rating: 4.5, dateAdded: "2024-03-30", isFeatured: false, keywords: ["vegetables", "fruits", "farm"], minOrder: 50, reviewCount: 20, totalReviews: 5
};

// ============================================
// SHOP 14: Kitwe Superstore (Groceries)
// ============================================
export const shop114Products: Product[] = [
  { id: 14001, name: "Instant Coffee (200g)", price: 95.00, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", category: "Beverages", stock: 30, shopId: 114 },
  { id: 14002, name: "Tea Bags (100 pack)", price: 45.00, image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", category: "Beverages", stock: 50, shopId: 114 },
  { id: 14003, name: "Milk Powder (400g)", price: 85.00, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400", category: "Dairy", stock: 40, shopId: 114 },
  { id: 14004, name: "Corn Flakes (500g)", price: 55.00, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400", category: "Breakfast", stock: 35, shopId: 114 },
  { id: 14005, name: "Peanut Butter (375g)", price: 40.00, image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400", category: "Pantry", stock: 60, shopId: 114 }
];

export const shop114: Omit<Shop, 'tier'> = {
  id: 114, name: "Kitwe Superstore", description: "Your neighborhood grocery store in Kitwe.",
  profilePic: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400", coverImg: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200",
  category: "Groceries", location: "Kitwe", region: "Copperbelt Province", city: "Kitwe", country: "Zambia", address: "City Mall, Kitwe",
  coordinates: { lat: -12.8100, lng: 28.2200 }, isVerified: true, rating: 4.3, dateAdded: "2024-04-01", isFeatured: false, keywords: ["groceries", "kitwe", "supermarket"], minOrder: 50, reviewCount: 40, totalReviews: 5
};

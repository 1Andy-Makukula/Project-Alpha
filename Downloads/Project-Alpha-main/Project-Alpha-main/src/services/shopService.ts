import { Shop, ShopTier } from '../types';

/**
 * @desc Raw shop data for the marketplace.
 * @todo Replace this with a dynamic fetch from your backend API.
 */
export const RAW_SHOPS: Omit<Shop, 'tier'>[] = [
  {
    id: 1,
    name: "Fresh Produce Market",
    description: "Locally sourced fruits and vegetables",
    profilePic: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
    category: "Groceries",
    location: "Lusaka",
    isVerified: true,
    rating: 4.8,
    dateAdded: "2024-01-15",
    isFeatured: true,
    keywords: ["fruits", "vegetables", "organic", "fresh"],
    minOrder: 50
  },
  {
    id: 2,
    name: "Tech Haven",
    description: "Latest electronics and gadgets",
    profilePic: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop",
    category: "Electronics",
    location: "Ndola",
    isVerified: true,
    rating: 4.6,
    dateAdded: "2024-02-20",
    isFeatured: true,
    keywords: ["electronics", "phones", "laptops", "gadgets"],
    minOrder: 100
  },
  {
    id: 3,
    name: "Fashion Forward",
    description: "Trendy clothing and accessories",
    profilePic: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop",
    category: "Fashion",
    location: "Livingstone",
    isVerified: false,
    rating: 4.3,
    dateAdded: "2024-03-10",
    isFeatured: false,
    keywords: ["clothing", "fashion", "accessories", "style"],
    minOrder: 75
  },
  {
    id: 4,
    name: "Home Essentials",
    description: "Everything you need for your home",
    profilePic: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=400&fit=crop",
    category: "Home & Living",
    location: "Kitwe",
    isVerified: true,
    rating: 4.7,
    dateAdded: "2024-01-25",
    isFeatured: true,
    keywords: ["furniture", "decor", "home", "kitchenware"],
    minOrder: 150
  },
  {
    id: 5,
    name: "Book Nook",
    description: "A paradise for book lovers",
    profilePic: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop",
    category: "Books",
    location: "Lusaka",
    isVerified: false,
    rating: 4.5,
    dateAdded: "2024-04-05",
    isFeatured: false,
    keywords: ["books", "reading", "novels", "educational"],
    minOrder: 30
  },
  {
    id: 6,
    name: "Sports Central",
    description: "Gear up for your favorite sports",
    profilePic: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    category: "Sports",
    location: "Ndola",
    isVerified: true,
    rating: 4.4,
    dateAdded: "2024-02-28",
    isFeatured: false,
    keywords: ["sports", "fitness", "equipment", "athletic"],
    minOrder: 80
  },
  {
    id: 7,
    name: "Beauty Bliss",
    description: "Premium beauty and skincare products",
    profilePic: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop",
    category: "Beauty",
    location: "Lusaka",
    isVerified: true,
    rating: 4.9,
    dateAdded: "2024-01-10",
    isFeatured: true,
    keywords: ["beauty", "skincare", "makeup", "cosmetics"],
    minOrder: 60
  },
  {
    id: 8,
    name: "Toy Town",
    description: "Fun and educational toys for kids",
    profilePic: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop",
    category: "Toys",
    location: "Kitwe",
    isVerified: false,
    rating: 4.2,
    dateAdded: "2024-03-22",
    isFeatured: false,
    keywords: ["toys", "kids", "games", "educational"],
    minOrder: 40
  }
];

/**
 * @desc Assigns tier levels to shops based on various criteria.
 * @param {Omit<Shop, 'tier'>[]} shops - Array of shops without tier assignments.
 * @returns {Shop[]} Array of shops with tier assignments.
 *
 * Tier Assignment Logic:
 * - Select: Highest tier (verified, featured, high ratings, recent)
 * - Verified: Mid-high tier (verified but may not be featured)
 * - Independent: Regular shops (not verified)
 * - Sandbox: New or low-performing shops
 */
export function assignShopTiers(shops: Omit<Shop, 'tier'>[]): Shop[] {
  return shops.map(shop => {
    let tier: ShopTier;

    // Calculate days since shop was added
    const daysSinceAdded = Math.floor(
      (Date.now() - new Date(shop.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Tier assignment logic
    if (shop.isVerified && shop.isFeatured && shop.rating >= 4.7) {
      tier = 'Select';
    } else if (shop.isVerified && shop.rating >= 4.5) {
      tier = 'Verified';
    } else if (shop.rating >= 4.0 && daysSinceAdded > 60) {
      tier = 'Independent';
    } else {
      tier = 'Sandbox';
    }

    return {
      ...shop,
      tier
    } as Shop;
  });
}

/**
 * @desc Filters shops by location.
 * @param {Shop[]} shops - Array of all shops.
 * @param {string} location - Location to filter by (or 'All' for all locations).
 * @returns {Shop[]} Filtered array of shops.
 */
export function filterShopsByLocation(shops: Shop[], location: string): Shop[] {
  if (location === 'All' || location === 'Global') {
    return shops;
  }
  return shops.filter(shop => shop.location === location);
}

/**
 * @desc Searches shops by query string (matches name, description, keywords, category).
 * @param {Shop[]} shops - Array of all shops.
 * @param {string} query - Search query string.
 * @returns {Shop[]} Filtered array of shops matching the query.
 */
export function searchShops(shops: Shop[], query: string): Shop[] {
  if (!query || query.trim() === '') {
    return shops;
  }

  const lowerQuery = query.toLowerCase();

  return shops.filter(shop => {
    return (
      shop.name.toLowerCase().includes(lowerQuery) ||
      shop.description.toLowerCase().includes(lowerQuery) ||
      shop.category.toLowerCase().includes(lowerQuery) ||
      shop.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * @file shopService.ts
 * @description Shop service that provides Firestore-backed shop operations
 * with fallback to hardcoded data for development/seeding
 */

import { Shop, ShopTier } from '../types';
import { isMockMode } from '../config/api.config';
import { firestoreShopsService } from './firestoreShopsService';

/**
 * @desc Fallback shop data for seeding or mock mode
 * These are only used when Firestore has no shops
 */
const SEED_SHOPS: Omit<Shop, 'id' | 'tier'>[] = [
  {
    name: "Fresh Produce Market",
    description: "Locally sourced fruits and vegetables from Zambian farms",
    profilePic: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
    category: "Groceries",
    location: "Lusaka",
    isVerified: true,
    rating: 4.8,
    dateAdded: "2024-01-15",
    isFeatured: true,
    keywords: ["fruits", "vegetables", "organic", "fresh"],
    minOrder: 50,
    status: 'live',
    emailVerified: true,
    termsAccepted: true,
    setupProgress: { step1_basicInfo: true, step2_location: true, step3_branding: true, step4_products: true, step5_payment: true },
    setupCompleted: true,
    currentSetupStep: 5,
    createdAt: "2024-01-15",
    lastUpdated: "2024-01-15",
    ownerId: "seed-owner-1",
    ownerName: "Market Manager",
    ownerEmail: "market@kithly.com",
    ownerPhone: "+260971234567",
    businessVerified: true,
  },
  {
    name: "Tech Haven",
    description: "Latest electronics and gadgets at competitive prices",
    profilePic: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop",
    category: "Electronics",
    location: "Ndola",
    isVerified: true,
    rating: 4.6,
    dateAdded: "2024-02-20",
    isFeatured: true,
    keywords: ["electronics", "phones", "laptops", "gadgets"],
    minOrder: 100,
    status: 'live',
    emailVerified: true,
    termsAccepted: true,
    setupProgress: { step1_basicInfo: true, step2_location: true, step3_branding: true, step4_products: true, step5_payment: true },
    setupCompleted: true,
    currentSetupStep: 5,
    createdAt: "2024-02-20",
    lastUpdated: "2024-02-20",
    ownerId: "seed-owner-2",
    ownerName: "Tech Owner",
    ownerEmail: "tech@kithly.com",
    ownerPhone: "+260962345678",
    businessVerified: true,
  },
  {
    name: "Fashion Forward",
    description: "Trendy African-inspired clothing and accessories",
    profilePic: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop",
    category: "Fashion",
    location: "Livingstone",
    isVerified: false,
    rating: 4.3,
    dateAdded: "2024-03-10",
    isFeatured: false,
    keywords: ["clothing", "fashion", "accessories", "style", "african"],
    minOrder: 75,
    status: 'live',
    emailVerified: true,
    termsAccepted: true,
    setupProgress: { step1_basicInfo: true, step2_location: true, step3_branding: true, step4_products: true, step5_payment: true },
    setupCompleted: true,
    currentSetupStep: 5,
    createdAt: "2024-03-10",
    lastUpdated: "2024-03-10",
    ownerId: "seed-owner-3",
    ownerName: "Fashion Designer",
    ownerEmail: "fashion@kithly.com",
    ownerPhone: "+260953456789",
    businessVerified: false,
  },
];

/**
 * @desc Assigns tier levels to shops based on various criteria.
 */
export function assignShopTiers(shops: Omit<Shop, 'tier'>[]): Shop[] {
  return shops.map(shop => {
    let tier: ShopTier;

    const daysSinceAdded = Math.floor(
      (Date.now() - new Date(shop.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (shop.isVerified && shop.isFeatured && shop.rating >= 4.7) {
      tier = 'Select';
    } else if (shop.isVerified && shop.rating >= 4.5) {
      tier = 'Verified';
    } else if (shop.rating >= 4.0 && daysSinceAdded > 60) {
      tier = 'Independent';
    } else {
      tier = 'Sandbox';
    }

    return { ...shop, tier } as Shop;
  });
}

/**
 * @desc Shop Service - uses Firestore in live mode
 */
export const shopService = {
  /**
   * Get all live shops (for customer marketplace)
   */
  async getAll(): Promise<Shop[]> {
    if (isMockMode()) {
      return assignShopTiers(SEED_SHOPS.map((s, i) => ({ ...s, id: i + 1 })) as any);
    }

    try {
      const shops = await firestoreShopsService.getLiveShops();
      if (shops.length === 0) {
        // Return seed data if no shops exist
        console.log('No live shops in Firestore, returning seed data');
        return assignShopTiers(SEED_SHOPS.map((s, i) => ({ ...s, id: i + 1 })) as any);
      }
      return assignShopTiers(shops);
    } catch (error) {
      console.error('Error fetching shops:', error);
      return assignShopTiers(SEED_SHOPS.map((s, i) => ({ ...s, id: i + 1 })) as any);
    }
  },

  /**
   * Get shop by ID
   */
  async getById(id: string | number): Promise<Shop | null> {
    if (isMockMode()) {
      const shops = assignShopTiers(SEED_SHOPS.map((s, i) => ({ ...s, id: i + 1 })) as any);
      return shops.find(s => s.id === Number(id)) || null;
    }

    const shop = await firestoreShopsService.getById(String(id));
    if (shop) {
      return assignShopTiers([shop])[0];
    }
    return null;
  },

  /**
   * Get shops owned by user (for shop portal)
   */
  async getByOwner(ownerId: string): Promise<Shop[]> {
    if (isMockMode()) {
      return [];
    }
    const shops = await firestoreShopsService.getByOwner(ownerId);
    return assignShopTiers(shops);
  },

  /**
   * Create a new shop
   */
  async create(shopData: Omit<Shop, 'id' | 'tier'>): Promise<string> {
    return firestoreShopsService.create(shopData as any);
  },

  /**
   * Update shop
   */
  async update(id: string, updates: Partial<Shop>): Promise<void> {
    return firestoreShopsService.update(id, updates);
  },

  /**
   * Filter shops by location
   */
  filterByLocation(shops: Shop[], location: string): Shop[] {
    if (location === 'All' || location === 'Global') {
      return shops;
    }
    return shops.filter(shop => shop.location === location);
  },

  /**
   * Search shops by query
   */
  search(shops: Shop[], query: string): Shop[] {
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
  },

  /**
   * Seed Firestore with initial shops (run once)
   */
  async seedShops(): Promise<void> {
    console.log('Seeding shops to Firestore...');
    for (const shop of SEED_SHOPS) {
      await firestoreShopsService.create(shop as any);
    }
    console.log('Seeding complete!');
  },
};

// Export for backwards compatibility
export const filterShopsByLocation = shopService.filterByLocation;
export const searchShops = shopService.search;

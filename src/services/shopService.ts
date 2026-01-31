/**
 * @file shopService.ts
 * @description Shop service that provides Firestore-backed shop operations
 */

import { Shop, ShopTier } from '../types';
import { firestoreShopsService } from './firestoreShopsService';

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
 * @desc Shop Service - uses Firestore for all operations
 */
export const shopService = {
  /**
   * Get all live shops (for customer marketplace)
   */
  async getAll(): Promise<Shop[]> {
    try {
      const shops = await firestoreShopsService.getLiveShops();
      return assignShopTiers(shops);
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  },

  /**
   * Get shop by ID
   */
  async getById(id: string | number): Promise<Shop | null> {
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
};

// Export for backwards compatibility
export const filterShopsByLocation = shopService.filterByLocation;
export const searchShops = shopService.search;

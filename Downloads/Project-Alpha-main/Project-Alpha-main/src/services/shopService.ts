import { Shop, ShopTier } from '../types';

const API_BASE_URL = 'http://localhost/kithly-api/api';

/**
 * @desc Fetch shops from the local PHP API
 */
export async function fetchShops(): Promise<Shop[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/shops.php`);
    if (!response.ok) {
      throw new Error(`Error fetching shops: ${response.statusText}`);
    }
    const rawShops: any[] = await response.json();

    // Map API response to Shop type
    const shops: Omit<Shop, 'tier'>[] = rawShops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        profilePic: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop", // Placeholder or from DB
        coverImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop", // Placeholder
        category: shop.category,
        location: "Lusaka", // Default or from DB if added to schema
        isVerified: !!shop.verified_status,
        rating: 4.5, // Default
        dateAdded: "2024-01-01", // Default
        isFeatured: !!shop.verified_status,
        keywords: [],
        minOrder: 0
    }));

    return assignShopTiers(shops);
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return [];
  }
}

/**
 * @desc Raw shop data (Fallback if API fails)
 */
export const RAW_SHOPS: Omit<Shop, 'tier'>[] = []; // Cleared to enforce API usage, or keep as fallback

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

export function filterShopsByLocation(shops: Shop[], location: string): Shop[] {
  if (location === 'All' || location === 'Global') return shops;
  return shops.filter(shop => shop.location === location);
}

export function searchShops(shops: Shop[], query: string): Shop[] {
  if (!query || query.trim() === '') return shops;
  const lowerQuery = query.toLowerCase();
  return shops.filter(shop => (
    shop.name.toLowerCase().includes(lowerQuery) ||
    shop.description.toLowerCase().includes(lowerQuery) ||
    shop.category.toLowerCase().includes(lowerQuery) ||
    shop.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  ));
}

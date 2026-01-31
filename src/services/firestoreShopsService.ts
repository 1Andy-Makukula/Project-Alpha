/**
 * @file firestoreShopsService.ts
 * @description Firestore service for shops collection
 */

import { Shop } from '../types';
import {
  COLLECTIONS,
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  timestampToString,
  stringToTimestamp
} from './firestoreService';
import { where, orderBy } from 'firebase/firestore';

/**
 * Convert Firestore shop data to Shop type
 */
function convertShopData(data: any): Shop {
  return {
    ...data,
    id: parseInt(data.id) || data.id,
    dateAdded: data.dateAdded?.toDate ? timestampToString(data.dateAdded) : data.dateAdded
  };
}

/**
 * Firestore Shops Service
 */
export const firestoreShopsService = {
  /**
   * Get all shops
   */
  async getAll(): Promise<Shop[]> {
    const shops = await getAllDocuments<any>(COLLECTIONS.SHOPS);
    return shops.map(convertShopData);
  },

  /**
   * Get shop by ID
   */
  async getById(id: string): Promise<Shop | null> {
    const shop = await getDocumentById<any>(COLLECTIONS.SHOPS, id);
    return shop ? convertShopData(shop) : null;
  },

  /**
   * SECURITY: Verify user owns the shop before allowing mutations
   * Prevents horizontal privilege escalation attacks
   * @throws Error if user doesn't own the shop
   */
  async verifyOwnership(shopId: string, userId: string): Promise<void> {
    const shop = await this.getById(shopId);
    if (!shop) {
      throw new Error('SHOP_NOT_FOUND');
    }
    if (shop.ownerId !== userId) {
      console.error(`[Security] Unauthorized shop access attempt: userId=${userId} tried to access shopId=${shopId} owned by ${shop.ownerId}`);
      throw new Error('UNAUTHORIZED: You do not own this shop');
    }
  },

  /**
   * Create new shop
   */
  async create(shop: Omit<Shop, 'id'>): Promise<string> {
    const shopData = {
      ...shop,
      dateAdded: shop.dateAdded ? stringToTimestamp(shop.dateAdded) : stringToTimestamp(new Date().toISOString())
    };

    return await createDocument(COLLECTIONS.SHOPS, shopData);
  },

  /**
   * Update shop
   * @param id - Shop ID to update
   * @param updates - Partial shop data to update
   * @param userId - Optional: If provided, verifies ownership before updating
   */
  async update(id: string, updates: Partial<Shop>, userId?: string): Promise<void> {
    // SECURITY: If userId is provided, verify ownership first
    if (userId) {
      await this.verifyOwnership(id, userId);
    }

    const updateData: any = { ...updates };

    // Convert date if present
    if (updates.dateAdded) {
      updateData.dateAdded = stringToTimestamp(updates.dateAdded);
    }

    // Remove id from updates
    delete updateData.id;

    await updateDocument(COLLECTIONS.SHOPS, id, updateData);
  },

  /**
   * Delete shop
   */
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTIONS.SHOPS, id);
  },

  /**
   * Search shops by keyword
   */
  async searchByKeyword(keyword: string): Promise<Shop[]> {
    const allShops = await this.getAll();
    const lowerKeyword = keyword.toLowerCase();

    return allShops.filter(shop =>
      shop.name.toLowerCase().includes(lowerKeyword) ||
      shop.description.toLowerCase().includes(lowerKeyword) ||
      shop.category.toLowerCase().includes(lowerKeyword) ||
      shop.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
    );
  },

  /**
   * Get shops by location
   */
  async getByLocation(location: string): Promise<Shop[]> {
    if (location === 'All' || location === 'Global') {
      return this.getAll();
    }

    return queryDocuments<any>(COLLECTIONS.SHOPS, 'location', '==', location)
      .then(shops => shops.map(convertShopData));
  },

  /**
   * Get featured shops
   */
  async getFeatured(): Promise<Shop[]> {
    return queryDocuments<any>(COLLECTIONS.SHOPS, 'isFeatured', '==', true)
      .then(shops => shops.map(convertShopData));
  },

  /**
   * Get verified shops
   */
  async getVerified(): Promise<Shop[]> {
    return queryDocuments<any>(COLLECTIONS.SHOPS, 'isVerified', '==', true)
      .then(shops => shops.map(convertShopData));
  },

  /**
   * Create draft shop (for onboarding)
   */
  async createDraftShop(shopData: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerId: string;
  }): Promise<string> {
    const draftShop = {
      ...shopData,
      description: '',
      profilePic: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shopData.name) + '&background=F85A47&color=fff',
      coverImg: '',
      category: '',
      location: '',
      isVerified: false,
      rating: 0,
      dateAdded: new Date().toISOString(),
      isFeatured: false,
      keywords: [],
      tier: 'basic' as const,
      reviewCount: 0,
      totalReviews: 0,

      // Business type will be set in step 0 (not initialized here to avoid Firestore undefined error)

      // Onboarding fields
      status: 'draft' as const,
      emailVerified: false,
      termsAccepted: true, // Set during registration
      termsAcceptedDate: new Date().toISOString(),
      setupProgress: {
        step0_businessType: false,
        step1_basicInfo: false,
        step2_location: false,
        step3_branding: false,
        step4_compliance: false,
        step5_products: false,
        step6_payment: false,
      },
      setupCompleted: false,
      currentSetupStep: 0, // Start at step 0 (business type selection)
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      businessVerified: false,
      complianceDocuments: {},
    };

    return await this.create(draftShop as any);
  },

  /**
   * Update setup progress for a specific step
   */
  async updateSetupProgress(shopId: string, step: keyof Shop['setupProgress'], completed: boolean): Promise<void> {
    const updateData: any = {
      [`setupProgress.${step}`]: completed,
      lastUpdated: new Date().toISOString(),
    };

    // Check if all steps are complete
    const shop = await this.getById(shopId);
    if (shop) {
      const allComplete = Object.entries({ ...shop.setupProgress, [step]: completed })
        .every(([_, value]) => value === true);

      if (allComplete) {
        updateData.setupCompleted = true;
      }
    }

    await updateDocument(COLLECTIONS.SHOPS, shopId, updateData);
  },

  /**
   * Update current setup step (for resume)
   */
  async updateCurrentStep(shopId: string, step: number): Promise<void> {
    await updateDocument(COLLECTIONS.SHOPS, shopId, {
      currentSetupStep: step,
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * Mark shop as live
   */
  async goLive(shopId: string): Promise<void> {
    await updateDocument(COLLECTIONS.SHOPS, shopId, {
      status: 'live',
      goLiveDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * Pause shop
   */
  async pauseShop(shopId: string): Promise<void> {
    await updateDocument(COLLECTIONS.SHOPS, shopId, {
      status: 'paused',
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * Return shop to draft
   */
  async returnToDraft(shopId: string): Promise<void> {
    await updateDocument(COLLECTIONS.SHOPS, shopId, {
      status: 'draft',
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * Archive shop
   */
  async archiveShop(shopId: string): Promise<void> {
    await updateDocument(COLLECTIONS.SHOPS, shopId, {
      status: 'archived',
      lastUpdated: new Date().toISOString(),
    });
  },

  /**
   * Get shops by status
   */
  async getByStatus(status: Shop['status']): Promise<Shop[]> {
    return queryDocuments<any>(COLLECTIONS.SHOPS, 'status', '==', status)
      .then(shops => shops.map(convertShopData));
  },

  /**
   * Get live shops only (for customer view)
   */
  async getLiveShops(): Promise<Shop[]> {
    return this.getByStatus('live');
  },

  /**
   * Get shops by owner ID (for shop portal)
   */
  async getByOwner(ownerId: string): Promise<Shop[]> {
    return queryDocuments<any>(COLLECTIONS.SHOPS, 'ownerId', '==', ownerId)
      .then(shops => shops.map(convertShopData));
  },

  /**
 * Get visible shops for customers
 * Filters out disabled shops and only returns live or setup-complete shops
 * Works with both old (5-step) and new (7-step) setupProgress structures
 */
  async getVisibleShops(): Promise<Shop[]> {
    const allShops = await this.getAll();
    return allShops.filter(shop =>
      !shop.isDisabled && (
        shop.status === 'live' ||
        (shop.status === 'draft' && shop.setupProgress?.step1_basicInfo === true)
      )
    );
  },
};

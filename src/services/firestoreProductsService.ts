/**
 * @file firestoreProductsService.ts
 * @description Firestore service for products collection
 */

import { Product } from '../types';
import {
  COLLECTIONS,
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  queryDocuments
} from './firestoreService';

/**
 * Convert Firestore product data to Product type
 */
function convertProductData(data: any): Product {
  return {
    ...data,
    id: parseInt(data.id) || data.id,
    shopId: data.shopId ? parseInt(data.shopId) : undefined
  };
}

/**
 * Firestore Products Service
 */
export const firestoreProductsService = {
  /**
   * Get all products, optionally filtered by shop
   */
  async getAll(shopId?: number): Promise<Product[]> {
    if (shopId) {
      return queryDocuments<any>(COLLECTIONS.PRODUCTS, 'shopId', '==', shopId)
        .then(products => products.map(convertProductData));
    }

    const products = await getAllDocuments<any>(COLLECTIONS.PRODUCTS);
    return products.map(convertProductData);
  },

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const product = await getDocumentById<any>(COLLECTIONS.PRODUCTS, id);
    return product ? convertProductData(product) : null;
  },

  /**
   * Create new product
   */
  async create(product: Omit<Product, 'id'>): Promise<string> {
    return await createDocument(COLLECTIONS.PRODUCTS, product);
  },

  /**
   * Update product
   */
  async update(id: string, updates: Partial<Product>): Promise<void> {
    const updateData = { ...updates };

    // Remove id from updates
    delete (updateData as any).id;

    await updateDocument(COLLECTIONS.PRODUCTS, id, updateData);
  },

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTIONS.PRODUCTS, id);
  },

  /**
   * Get products by category
   */
  async getByCategory(category: string): Promise<Product[]> {
    return queryDocuments<any>(COLLECTIONS.PRODUCTS, 'category', '==', category)
      .then(products => products.map(convertProductData));
  },

  /**
   * Get in-stock products
   */
  async getInStock(): Promise<Product[]> {
    const allProducts = await this.getAll();
    return allProducts.filter(p => p.stock > 0);
  },

  /**
   * Search products by name
   */
  async searchByName(searchTerm: string): Promise<Product[]> {
    const allProducts = await this.getAll();
    const lowerSearch = searchTerm.toLowerCase();

    return allProducts.filter(product =>
      product.name.toLowerCase().includes(lowerSearch) ||
      (product.description && product.description.toLowerCase().includes(lowerSearch))
    );
  }
};

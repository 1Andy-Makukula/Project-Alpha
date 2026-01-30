/**
 * @file seedFirestore.ts
 * @description Seed script to populate Firestore with initial shops and products data
 * Run this once to populate your database
 */

import { firestoreShopsService } from '../services/firestoreShopsService';
import { firestoreProductsService } from '../services/firestoreProductsService';
import { RAW_SHOPS } from '../services/shopService';
import { Shop, Product } from '../types';

/**
 * Sample products for each shop
 */
const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  // Fresh Produce Market (shopId: 1)
  { name: 'Fresh Apples', price: 25, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', category: 'Fruits', stock: 50, shopId: 1, description: 'Fresh red apples' },
  { name: 'Bananas', price: 15, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', category: 'Fruits', stock: 100, shopId: 1, description: 'Ripe bananas' },
  { name: 'Tomatoes', price: 20, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', category: 'Vegetables', stock: 75, shopId: 1, description: 'Fresh tomatoes' },

  // Tech Haven (shopId: 2)
  { name: 'Wireless Mouse', price: 150, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', category: 'Accessories', stock: 20, shopId: 2, description: 'Ergonomic wireless mouse' },
  { name: 'USB-C Cable', price: 50, image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400', category: 'Accessories', stock: 100, shopId: 2, description: 'Fast charging USB-C cable' },
  { name: 'Phone Case', price: 80, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', category: 'Accessories', stock: 50, shopId: 2, description: 'Protective phone case' },

  // Fashion Forward (shop Id: 3)
  { name: 'Cotton T-Shirt', price: 120, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', category: 'Clothing', stock: 30, shopId: 3, description: 'Comfortable cotton t-shirt' },
  { name: 'Denim Jeans', price: 350, image: 'https://images.unsplash.com/photo-1542272454315-7f6a6a9f1d24?w=400', category: 'Clothing', stock: 25, shopId: 3, description: 'Classic denim jeans' },

  // Home Essentials (shopId: 4)
  { name: 'Coffee Mug Set', price: 200, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', category: 'Kitchenware', stock: 40, shopId: 4, description: 'Set of 4 ceramic mugs' },
  { name: 'Table Lamp', price: 450, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', category: 'Decor', stock: 15, shopId: 4, description: 'Modern table lamp' },

  // Book Nook (shopId: 5)
  { name: 'The Alchemist', price: 100, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', category: 'Fiction', stock: 20, shopId: 5, description: 'Classic novel by Paulo Coelho' },
  { name: 'Atomic Habits', price: 150, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400', category: 'Self-Help', stock: 30, shopId: 5, description: 'Bestseller by James Clear' },

  // Sports Central (shopId: 6)
  { name: 'YogaMat', price: 250, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', category: 'Fitness', stock: 25, shopId: 6, description: 'Non-slip yoga mat' },
  { name: 'Resistance Bands', price: 180, image: 'https://images.unsplash.com/photo-1598632640499-9d5c7c7c5a2f?w=400', category: 'Fitness', stock: 40, shopId: 6, description: 'Set of 5 resistance bands' },

  // Beauty Bliss (shopId: 7)
  { name: 'Moisturizer', price: 300, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Skincare', stock: 50, shopId: 7, description: 'Hydrating face moisturizer' },
  { name: 'Lipstick Set', price: 250, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', category: 'Makeup', stock: 35, shopId: 7, description: 'Set of 5 lip colors' },

  // Toy Town (shopId: 8)
  { name: 'Building Blocks', price: 200, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400', category: 'Educational', stock: 30, shopId: 8, description: 'Creative building blocks' },
  { name: 'Puzzle Set', price: 150, image: 'https://images.unsplash.com/photo-1587049016823-69783c4baec5?w=400', category: 'Educational', stock: 25, shopId: 8, description: '500-piece jigsaw puzzle' },
];

/**
 * Seed shops to Firestore
 */
async function seedShops() {
  console.log('🌱 Seeding shops...');

  try {
    // Check if shops already exist
    const existingShops = await firestoreShopsService.getAll();

    if (existingShops.length > 0) {
      console.log(`⚠️  Found ${existingShops.length} existing shops. Skipping shop seeding.`);
      return;
    }

    // Assign tiers and seed shops
    const shopsWithTiers = RAW_SHOPS.map((shop, index) => {
      let tier: Shop['tier'];

      if (shop.isVerified && shop.isFeatured && shop.rating >= 4.7) {
        tier = 'Select';
      } else if (shop.isVerified && shop.rating >= 4.5) {
        tier = 'Verified';
      } else if (shop.rating >= 4.0) {
        tier = 'Independent';
      } else {
        tier = 'Sandbox';
      }

      return {
        ...shop,
        id: index + 1, // Assign numeric IDs
        tier
      };
    });

    for (const shop of shopsWithTiers) {
      await firestoreShopsService.create(shop);
      console.log(`   ✅ Created shop: ${shop.name}`);
    }

    console.log(`✨ Successfully seeded ${shopsWithTiers.length} shops!`);
  } catch (error) {
    console.error('❌ Error seeding shops:', error);
    throw error;
  }
}

/**
 * Seed products to Firestore
 */
async function seedProducts() {
  console.log('\n🌱 Seeding products...');

  try {
    // Check if products already exist
    const existingProducts = await firestoreProductsService.getAll();

    if (existingProducts.length > 0) {
      console.log(`⚠️  Found ${existingProducts.length} existing products. Skipping product seeding.`);
      return;
    }

    for (const product of SAMPLE_PRODUCTS) {
      await firestoreProductsService.create(product);
      console.log(`   ✅ Created product: ${product.name}`);
    }

    console.log(`✨ Successfully seeded ${SAMPLE_PRODUCTS.length} products!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
export async function seedFirestore() {
  console.log('\n═══════════════════════════════════');
  console.log('🔥 Firestore Database Seeding');
  console.log('═══════════════════════════════════\n');

  try {
    await seedShops();
    await seedProducts();

    console.log('\n═══════════════════════════════════');
    console.log('✨ Database seeding complete!');
    console.log('═══════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run if executed directly
if (typeof window !== 'undefined') {
  console.log('💡 To seed the database, open your browser console and run:');
  console.log('   import { seedFirestore } from "./scripts/seedFirestore"');
  console.log('   seedFirestore()');
}

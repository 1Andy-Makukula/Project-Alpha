/**
 * @file mockDataGenerator.ts
 * @description Generates realistic mock data for testing before backend integration.
 * This ensures our mock data structure matches exactly what Django will return.
 */

import { Order, Product, Shop } from '../types';

/**
 * @desc Generates a random collection code
 */
const generateCollectionCode = (): string => {
  return `KLY-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
};

/**
 * @desc Generates a random date within the last N days
 */
const randomDateInPast = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

/**
 * @desc Sample customer names for realistic mock data
 */
const SAMPLE_CUSTOMERS = [
  'Alice Mwanza',
  'John Banda',
  'Grace Phiri',
  'David Tembo',
  'Sarah Lungu',
  'Michael Zulu',
  'Rachel Mulenga',
  'Peter Sakala',
  'Mary Sichone',
  'Joseph Chilufya'
];

/**
 * @desc Sample shop names
 */
const SAMPLE_SHOPS = [
  { id: 1, name: 'Fresh Greens Market' },
  { id: 2, name: 'Tech Haven Electronics' },
  { id: 3, name: 'Bella\'s Bakery' },
  { id: 4, name: 'Urban Fashion House' },
  { id: 5, name: 'Mama Chikondi\'s Kitchen' }
];

/**
 * @desc Sample products by category
 */
const SAMPLE_PRODUCTS = [
  { id: 101, name: 'Tomatoes (1kg)', price: 25, category: 'groceries' },
  { id: 102, name: 'Fresh Lettuce', price: 15, category: 'groceries' },
  { id: 103, name: 'Wireless Mouse', price: 150, category: 'electronics' },
  { id: 104, name: 'USB Cable', price: 50, category: 'electronics' },
  { id: 105, name: 'Chocolate Cake', price: 200, category: 'bakery' },
  { id: 106, name: 'Cupcakes (6pc)', price: 120, category: 'bakery' },
  { id: 107, name: 'T-Shirt', price: 180, category: 'fashion' },
  { id: 108, name: 'Jeans', price: 350, category: 'fashion' },
  { id: 109, name: 'Nshima Meal', price: 45, category: 'food' },
  { id: 110, name: 'Chicken & Chips', price: 85, category: 'food' }
];

/**
 * @desc Order statuses for variety
 */
const ORDER_STATUSES: Order['status'][] = [
  'pending',
  'paid',
  'ready_for_dispatch',
  'dispatched',
  'collected'
];

/**
 * @desc Generates a single mock order
 */
export const generateMockOrder = (overrides?: Partial<Order>): Order => {
  const customer = SAMPLE_CUSTOMERS[Math.floor(Math.random() * SAMPLE_CUSTOMERS.length)];
  const shop = SAMPLE_SHOPS[Math.floor(Math.random() * SAMPLE_SHOPS.length)];
  const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];

  // Random 1-3 products
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let total = 0;

  for (let i = 0; i < itemCount; i++) {
    const product = SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    items.push({ ...product, quantity });
    total += product.price * quantity;
  }

  const paidOn = randomDateInPast(30);
  const collectedOn = ['collected'].includes(status) ? randomDateInPast(25) : null;

  return {
    id: `KLY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    customerName: customer,
    customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer)}&background=random`,
    paidOn,
    collectedOn,
    total,
    itemCount,
    status,
    deliveryMethod: Math.random() > 0.5 ? 'pickup' : 'delivery',
    collectionCode: generateCollectionCode(),
    shopName: shop.name,
    shopId: shop.id,
    items,
    message: Math.random() > 0.7 ? 'Please pack carefully' : undefined,
    deliveryCoordinates: Math.random() > 0.5 ? {
      lat: -15.4167 + (Math.random() - 0.5) * 0.1,
      lng: 28.2833 + (Math.random() - 0.5) * 0.1
    } : undefined,
    orderType: Math.random() > 0.8 ? 'request' : 'instant',
    approvalStatus: status === 'pending' ? 'pending' : 'approved',
    ...overrides
  };
};

/**
 * @desc Generates an array of mock orders
 */
export const generateMockOrders = (count: number = 10): Order[] => {
  return Array.from({ length: count }, () => generateMockOrder());
};

/**
 * @desc Generates mock products for a shop
 */
export const generateMockProducts = (shopId: number, count: number = 5): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    const baseProduct = SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length];
    return {
      ...baseProduct,
      id: 1000 + shopId * 100 + i,
      shopId,
      stock: Math.floor(Math.random() * 50) + 10,
      image: `https://placehold.co/400x300/png?text=${encodeURIComponent(baseProduct.name)}`,
      description: `Fresh ${baseProduct.name} available now`,
    };
  });
};

/**
 * @desc Pre-generated realistic mock orders
 * Use this in firebaseStub.ts
 */
export const REALISTIC_MOCK_ORDERS: Order[] = [
  // Recent paid orders (most common)
  generateMockOrder({
    status: 'paid',
    deliveryMethod: 'pickup',
    paidOn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  }),
  generateMockOrder({
    status: 'paid',
    deliveryMethod: 'delivery',
    paidOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  }),

  // Ready for dispatch
  generateMockOrder({
    status: 'ready_for_dispatch',
    deliveryMethod: 'delivery',
    paidOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    deliveryCoordinates: {
      lat: -15.4167,
      lng: 28.2833
    },
    deliveryNotes: 'White gate, call on arrival'
  }),

  // Dispatched order
  generateMockOrder({
    status: 'dispatched',
    deliveryMethod: 'delivery',
    paidOn: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    driverDetails: {
      name: 'Victor Mutale',
      carModel: 'Toyota Corolla',
      plateNumber: 'BAZ 1234',
      phone: '+260971234567'
    }
  }),

  // Collected order
  generateMockOrder({
    status: 'collected',
    deliveryMethod: 'pickup',
    paidOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    collectedOn: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    verificationMethod: 'scan'
  }),

  // Made-to-order request (pending approval)
  generateMockOrder({
    status: 'pending',
    orderType: 'request',
    approvalStatus: 'pending',
    paidOn: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    message: 'Custom birthday cake with "Happy 21st Sarah" - vanilla flavor',
    items: [{
      id: 999,
      name: 'Custom Birthday Cake',
      price: 350,
      quantity: 1,
      type: 'made_to_order',
      leadTime: '48h'
    }]
  }),

  // Add a few more historical orders
  ...generateMockOrders(4).map(order => ({
    ...order,
    status: 'collected' as const,
    collectedOn: randomDateInPast(20),
  }))
];

/**
 * @desc Utility to log mock data structure for Django developer
 */
export const logMockDataStructure = () => {
  console.log('=== SAMPLE ORDER FOR DJANGO DEVELOPER ===');
  console.log(JSON.stringify(REALISTIC_MOCK_ORDERS[0], null, 2));
  console.log('\n=== SAMPLE PRODUCT ===');
  console.log(JSON.stringify(generateMockProducts(1, 1)[0], null, 2));
};


/**
 * @desc Defines the possible views (pages) in the application.
 * Used for the client-side routing and state management.
 */
export type View = 'landing' | 'customerPortal' | 'shopPortal' | 'customerDashboard' | 'shopView' | 'checkout' | 'orderSuccess' | 'about' | 'careers' | 'press' | 'terms' | 'privacy' | 'cookies' | 'registerCustomer' | 'registerShop' | 'wishlist' | 'profile';

/**
 * @desc Represents the role of the current user.
 */
export type UserType = 'guest' | 'customer' | 'shop';

/**
 * @desc Represents the different tiers or levels of shops in the marketplace.
 */
export type ShopTier = 'Select' | 'Verified' | 'Independent' | 'Sandbox';

/**
 * @desc Represents a shop in the marketplace.
 * This is the data structure the backend should use for the 'shops' collection.
 */
export interface Shop {
  id: number;
  name: string;
  description: string;
  profilePic: string;
  coverImg: string;
  category: string;
  location: string;
  isVerified: boolean;
  rating: number;
  dateAdded: string;
  isFeatured: boolean;
  keywords: string[];
  tier: ShopTier;
  minOrder?: number;
  isNew?: boolean;
  hasOffer?: boolean;
  reviewCount?: number;
  totalReviews?: number;
}

/**
 * @desc Represents a product sold by a shop.
 * This is the data structure for the 'products' collection.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
  shopId?: number;
}

/**
 * @desc Represents an item within the user's shopping cart.
 * This is a client-side type and does not need to be stored in the database.
 */
export interface CartItem {
  product: Product;
  quantity: number;
  shopId: number;
  shopName: string;
}

/**
 * @desc Represents a customer's order.
 * This is the data structure for the 'orders' collection.
 */
export interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  paidOn: string;
  collectedOn: string | null;
  total: number;
  itemCount: number;
  status: 'paid' | 'collected';
  collectionCode: string;
  shopName?: string;
  shopId?: number;
  message?: string;
  items: any[];
  verificationMethod?: 'scan' | 'manual';
  canReview?: boolean;
  reviewed?: boolean;
}

/**
 * @desc Represents a customer review for a shop.
 * This is the data structure for the 'reviews' collection.
 */
export interface Review {
  id: string;
  shopId: number;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number; // 1-5
  comment: string;
  photos?: string[];
  createdAt: string;
  orderId?: string;
  helpful: number; // count of helpful votes
  shopResponse?: {
    message: string;
    respondedAt: string;
  };
}

/**
 * @desc Represents a user's profile.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  createdAt: string;
}

/**
 * @desc Represents a saved address.
 */
export interface Address {
  id: string;
  label: string; // 'Home', 'Work', etc.
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

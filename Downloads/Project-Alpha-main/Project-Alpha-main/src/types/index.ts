
/**
 * @desc Defines the possible views (pages) in the application.
 * Used for the client-side routing and state management.
 */
export type View = 'landing' | 'login' | 'customerPortal' | 'shopPortal' | 'customerDashboard' | 'shopView' | 'checkout' | 'orderSuccess' | 'about' | 'careers' | 'press' | 'terms' | 'privacy' | 'cookies' | 'registerCustomer' | 'registerShop' | 'wishlist' | 'profile' | 'contacts' | 'notifications' | 'security' | 'payments';

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
  // Geolocation fields
  coordinates?: {
    lat: number;
    lng: number;
  };
  region?: string; // e.g., "Lusaka Province", "Copperbelt Province"
  city?: string; // e.g., "Lusaka", "Ndola", "Kitwe"
  country?: string; // e.g., "Zambia"
  address?: string; // Full street address
  openingHours?: string; // e.g., "08:00 - 18:00"
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
  type?: 'made_to_order' | 'instant';
  leadTime?: string; // e.g., "48h"
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
  status: 'pending' | 'paid' | 'collected';
  collectionCode: string;
  shopName?: string;
  shopId?: number;
  message?: string;
  items: any[];
  verificationMethod?: 'scan' | 'manual';
  canReview?: boolean;
  reviewed?: boolean;
  pickupTime?: string; // e.g., "ASAP" or "2023-10-27T14:00:00"
  orderType?: 'request' | 'instant';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  recipient_phone?: string; // Phone number for WhatsApp receipt sharing
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

// ============================================
// GEOLOCATION TYPES
// ============================================

/**
 * @desc Geographic coordinates for location-based features
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * @desc Region/province data for Zambia
 */
export interface Region {
  id: string;
  name: string;
  cities: string[];
  coordinates: Coordinates;
}

/**
 * @desc Geolocation filter options
 */
export interface GeolocationFilter {
  region?: string;
  city?: string;
  maxDistance?: number; // in kilometers
  userCoordinates?: Coordinates;
}

// ============================================
// CONTACT TYPES
// ============================================

export type ContactSource = 'google' | 'iphone' | 'manual' | 'imported';

/**
 * @desc Represents a contact in the user's contact list
 */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  source: ContactSource;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastContacted?: string;
}

/**
 * @desc Contact group/category
 */
export interface ContactGroup {
  id: string;
  name: string;
  color: string;
  contactIds: string[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'order' | 'shop' | 'payment' | 'promotion' | 'system' | 'review';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * @desc Represents a notification
 */
export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    orderId?: string;
    shopId?: number;
    amount?: number;
    [key: string]: any;
  };
}

/**
 * @desc Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  shopNews: boolean;
  reviews: boolean;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethodType = 'card' | 'mobile_money' | 'bank_account';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type TransactionType = 'purchase' | 'refund' | 'payout';

/**
 * @desc Payment method information
 */
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  // Card details (tokenized)
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  // Mobile money
  mobileProvider?: string; // 'MTN', 'Airtel', 'Zamtel'
  mobileNumber?: string;
  // Bank account
  bankName?: string;
  accountLast4?: string;
  accountHolderName?: string;
  createdAt: string;
}

/**
 * @desc Payment transaction record
 */
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  orderId?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  receiptUrl?: string;
}

// ============================================
// SECURITY TYPES
// ============================================

export type TwoFactorMethod = 'sms' | 'email' | 'authenticator';

/**
 * @desc Two-factor authentication settings
 */
export interface TwoFactorAuth {
  enabled: boolean;
  method: TwoFactorMethod;
  verifiedAt?: string;
  backupCodes?: string[];
}

/**
 * @desc Active session information
 */
export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

/**
 * @desc Login history entry
 */
export interface LoginHistory {
  id: string;
  timestamp: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  successful: boolean;
  failureReason?: string;
}

/**
 * @desc Security settings
 */
export interface SecuritySettings {
  passwordLastChanged: string;
  twoFactorAuth: TwoFactorAuth;
  trustedDevices: string[];
  loginNotifications: boolean;
  sessions: UserSession[];
}

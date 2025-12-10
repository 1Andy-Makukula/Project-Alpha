// --- kithLy/src/types/index.ts (Fully Compatible Version) ---

// Core Entity Types
export type ShopTier = 'Select' | 'Verified' | 'Independent' | 'Sandbox';

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
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    description?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
    shopId: number;
    shopName: string;
}

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
    message?: string;
    items: any[];
    verificationMethod?: 'scan' | 'manual';
}

// Utility Types (REQUIRED BY App.tsx)

// Fix 1: Added RecipientInfo (Used by handleCheckout in App.tsx)
export interface RecipientInfo {
    name: string;
    email: string;
    phone: string;
}

// Fix 2 & 3: Added Service Types (Used by useServices in App.tsx)
export interface DBService {
    orders: {
        getAll: () => Promise<Order[]>;
    }
}

export interface NotificationService {
    send: (message: string) => void;
}

export interface ServiceContextValue {
    db: DBService;
    notify: NotificationService;
}


// Navigation Types
export type UserType = 'guest' | 'customer' | 'shopOwner'; // Changed 'shop' to 'shopOwner' for clarity

// Fix 4: Updated View names to match string literals used in App.tsx
export type View = 
    'landing' | 
    'customer-portal' | 
    'shop-portal' | 
    'customer-dashboard' | 
    'shop-view' | // Matches 'shop-view' in App.tsx
    'checkout' | 
    'order-success' | // Matches 'order-success' in App.tsx
    'register-customer' | 
    'register-shop' | 
    'about-us' |     // Matches 'about-us' in App.tsx
    'careers' |      // Matches 'careers' in App.tsx
    'press' |        // Matches 'press' in App.tsx
    'tos' |          // Matches 'tos' in App.tsx
    'privacy' |      // Matches 'privacy' in App.tsx
    'cookie-policy'; // Matches 'cookie-policy' in App.tsx
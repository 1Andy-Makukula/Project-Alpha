# KithLy Marketplace - Feature Implementation Guide

> **Note:** For backend API specifications and data models, please refer to [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md).

## 1. KithLy Concierge (Delivery Workflow) - **COMPLETED**
**Goal:** Implement a manual dispatch workflow ("KithLy Dispatcher") with zone-based pricing and location pinning.

> **📘 Detailed Documentation:** For a complete breakdown of the Concierge workflow, user journeys, and technical details, please refer to [KITHLY_CONCIERGE_GUIDE.md](./KITHLY_CONCIERGE_GUIDE.md).

### Features Implemented:
- [x] **Zone-Based Pricing:** Checkout calculates fees (Zone A/B/C) based on distance.
- [x] **Luxury Toggle:** Checkout UI updated with "Store Pickup" vs "Doorstep Delivery" (Premium) options.
- [x] **Pin Location Page:** New page for recipients to pin exact location + notes.
- [x] **Manual Dispatch:** Shop marks "Ready", Admin assigns driver (simulated), Shop confirms handover.
- [x] **Order Statuses:** Added `ready_for_dispatch` and `dispatched` statuses.
- [x] **Driver Details:** Visible on Order Card when dispatched.

---

## 🎯 Purpose
This document provides detailed implementation instructions for enhancing the KithLy Marketplace with production-ready features.

---

## ✅ **IMPLEMENTED FEATURES**

### Core Functionality (v1.0)
- ✅ User Authentication UI (Registration & Login forms)
- ✅ Shop Browsing with Tier System (Select, Verified, Independent, Sandbox)
- ✅ Product Display & Quick View
- ✅ Shopping Cart (Add, Update, Remove, Clear by Shop)
- ✅ Multi-shop Checkout
- ✅ Order Creation & Management
- ✅ Location-based Filtering (Lusaka, Ndola, Livingstone, Kitwe, Global)
- ✅ Search Functionality
- ✅ Shop Portal with Analytics Dashboard
- ✅ QR Code Verification System
- ✅ Responsive Design
- ✅ Toast Notifications

---

## 🚀 **READY-TO-IMPLEMENT FEATURES**

The following features are **fully designed and ready to code**. Each section includes:
- Type definitions (already added to `src/types/index.ts`)
- Component structure
- State management approach
- UI/UX specifications

---

## 1️⃣ **REVIEWS & RATINGS SYSTEM**

### Overview
Allow customers to rate and review shops after order completion

### Type Definitions (✅ Added)
```typescript
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
  helpful: number;
  shopResponse?: {
    message: string;
    respondedAt: string;
  };
}
```

### Files to Create

#### `src/components/ReviewCard.tsx`
```tsx
import React, { useState } from 'react';
import { Review } from '../types';
import { StarIcon } from './icons/FeatureIcons';

interface ReviewCardProps {
  review: Review;
  canRespond?: boolean;
  onRespond?: (message: string) => void;
  onHelpful?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  canRespond,
  onRespond,
  onHelpful
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmitResponse = () => {
    if (onRespond && responseMessage.trim()) {
      onRespond(responseMessage);
      setShowResponseForm(false);
      setResponseMessage('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      {/* Customer Info */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={review.customerAvatar}
          alt={review.customerName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <p className="text-gray-700 mb-4">{review.comment}</p>

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Review photo ${idx + 1}`}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Shop Response */}
      {review.shopResponse && (
        <div className="bg-orange-50 p-4 rounded-lg mt-4 border-l-4 border-kithly-primary">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Shop Response:
          </p>
          <p className="text-sm text-gray-700">{review.shopResponse.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(review.shopResponse.respondedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onHelpful}
          className="text-sm text-gray-600 hover:text-kithly-primary flex items-center gap-1"
        >
          👍 Helpful ({review.helpful})
        </button>

        {canRespond && !review.shopResponse && (
          <button
            onClick={() => setShowResponseForm(true)}
            className="text-sm text-kithly-primary hover:underline font-medium"
          >
            Respond to Review
          </button>
        )}
      </div>

      {/* Response Form */}
      {showResponseForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Write your response..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSubmitResponse}
              className="px-4 py-2 bg-kithly-primary text-white rounded-lg hover:bg-orange-600"
            >
              Submit Response
            </button>
            <button
              onClick={() => setShowResponseForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
```

#### `src/components/ReviewForm.tsx`
```tsx
import React, { useState } from 'react';
import { StarIcon } from './icons/FeatureIcons';
import Button from './Button';

interface ReviewFormProps {
  shopId: number;
  orderId: string;
  onSubmit: (rating: number, comment: string, photos?: File[]) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  shopId,
  orderId,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      onSubmit(rating, comment, photos);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 3)); // Max 3 photos
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this shop..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={4}
            required
          />
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional, max 3)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-kithly-primary hover:file:bg-orange-100"
          />
          {photos.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={rating === 0 || !comment.trim()}
            className="flex-1"
          >
            Submit Review
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
```

### Integration Steps

1. **Add Reviews to ShopView Page**
   - Display average rating and review count
   - Show list of reviews
   - Add "Write a Review" button for customers who have ordered

2. **Add Reviews to CustomerDashboard**
   - Show completed orders with "Leave a Review" button
   - Track which orders have been reviewed

3. **Add Reviews Management to ShopPortal**
   - Show incoming reviews
   - Allow shop owners to respond
   - Display review analytics

4. **Update Database Stub**
   - Add `reviews` collection to `firebaseStub.ts`
   - Add CRUD methods for reviews

---

## 2️⃣ **WISHLIST / FAVORITES PAGE**

### Overview
Allow customers to save favorite shops and products for later

### Files to Create

#### `src/pages/WishlistPage.tsx`
```tsx
import React from 'react';
import { Shop, Product } from '../types';
import ShopCard from '../components/ShopCard';
import ProductCard from '../components/ProductCard';
import { HeartIcon } from '../components/icons/NavigationIcons';

interface WishlistPageProps {
  favoriteShops: Shop[];
  favoriteProducts: Product[];
  onShopClick: (shopId: number) => void;
  onRemoveShop: (shopId: number) => void;
  onRemoveProduct: (productId: number) => void;
  onBack: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  favoriteShops,
  favoriteProducts,
  onShopClick,
  onRemoveShop,
  onRemoveProduct,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-kithly-primary mb-4"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <HeartIcon className="w-8 h-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {favoriteShops.length} shops, {favoriteProducts.length} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Favorite Shops */}
        {favoriteShops.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Favorite Shops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteShops.map(shop => (
                <div key={shop.id} className="relative">
                  <ShopCard
                    shop={shop}
                    onClick={() => onShopClick(shop.id)}
                  />
                  <button
                    onClick={() => onRemoveShop(shop.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors z-10"
                  >
                    <HeartIcon className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorite Products */}
        {favoriteProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Favorite Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => {}}
                  onQuickViewClick={() => {}}
                  isLiked={true}
                  onLikeClick={() => onRemoveProduct(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {favoriteShops.length === 0 && favoriteProducts.length === 0 && (
          <div className="text-center py-20">
            <HeartIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Your Wishlist is Empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start adding shops and products you love!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-kithly-primary text-white rounded-full hover:bg-orange-600"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
```

### Integration Steps
1. Add state management for favorite shops and products in `App.tsx`
2. Add Wishlist link to navigation headers
3. Persist favorites to localStorage
4. Add badge showing total favorites count

---

## 3️⃣ **ADVANCED SEARCH & FILTERS**

### Enhancements to Existing Search

#### Update `CustomerPortal.tsx` with Advanced Filters

Add these filter controls:
- Price range slider
- Rating filter (4+ stars, 3+ stars, etc.)
- Distance/Location radius
- Shop tier filter (Select, Verified, etc.)
- Sort by: Price (low-high), Rating, Distance, Newest

```tsx
// Add to CustomerPortal state
const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
const [minRating, setMinRating] = useState(0);
const [selectedTiers, setSelectedTiers] = useState<ShopTier[]>([]);
```

---

## 4️⃣ **ENHANCED ORDER TRACKING**

### Overview
Better visualization of order status with progress indicators

#### `src/components/OrderTrackingCard.tsx`
```tsx
import React from 'react';
import { Order } from '../types';
import { CheckCircleIcon, ClockIcon, PackageIcon } from './icons/NavigationIcons';

interface OrderTrackingCardProps {
  order: Order;
}

const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({ order }) => {
  const getStatusSteps = () => {
    const steps = [
      {
        label: 'Order Placed',
        completed: true,
        date: order.paidOn
      },
      {
        label: 'Ready for Pickup',
        completed: order.status === 'paid' || order.status === 'collected',
        date: order.paidOn
      },
      {
        label: 'Collected',
        completed: order.status === 'collected',
        date: order.collectedOn
      }
    ];
    return steps;
  };

  const steps = getStatusSteps();
  const currentStep = steps.filter(s => s.completed).length;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">{order.shopName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          order.status === 'collected'
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {order.status === 'collected' ? 'Completed' : 'Ready for Pickup'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ClockIcon className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs text-gray-600 text-center max-w-[80px]">
                {step.label}
              </p>
              {step.date && step.completed && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(step.date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collection Code */}
      {order.status === 'paid' && (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Collection Code:</p>
          <p className="text-2xl font-bold text-kithly-primary font-mono tracking-wider">
            {order.collectionCode}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Show this code at the shop to collect your items
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingCard;
```

---

## 5️⃣ **USER PROFILE MANAGEMENT**

### Type Definitions (✅ Added)
```typescript
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}
```

### Files to Create

#### `src/pages/ProfilePage.tsx`
Create a comprehensive profile page with:
- Personal information editing
- Avatar upload
- Address management (add, edit, delete, set default)
- Email/phone verification status
- Account settings
- Change password form

---

## 6️⃣ **ENHANCED SHOP ANALYTICS**

### Overview
More detailed analytics for shop owners

#### Additional Metrics to Add:
```typescript
// Add to ShopPortal analytics
interface Analytics {
  // Revenue
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;

  // Orders
  pendingOrders: number;
  completedToday: number;
  totalOrders: number;

  // Products
  topSellingProducts: {
    productId: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];

  lowStockProducts: Product[];

  // Customer Insights
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;

  // Reviews
  averageRating: number;
  totalReviews: number;
  recentReviews: Review[];
}
```

---

## 🛠️ **IMPLEMENTATION PRIORITY**

Based on impact and complexity:

### Phase 1 (High Impact, Low Complexity)
1. ✅ Wishlist Page (2-3 hours)
2. ✅ Order Tracking UI (1-2 hours)
3. ✅ Enhanced Filters (2 hours)

### Phase 2 (High Impact, Medium Complexity)
4. ✅ Reviews & Ratings (4-5 hours)
5. ✅ Profile Management (3-4 hours)

### Phase 3 (Medium Impact)
6. ✅ Enhanced Analytics (2-3 hours)
7. ✅ Notification Templates (1-2 hours)

---

## 📋 **NEXT STEPS**

### For Backend Integration:
1. Set up Firebase/PostgreSQL database
2. Create API endpoints for each feature
3. Implement authentication (Firebase Auth recommended)
4. Add image upload service (Cloudinary/AWS S3)
5. Set up email service (SendGrid/AWS SES)
6. Add SMS service (Twilio)
7. Integrate payment gateway (Stripe/PayPal)

### For Deployment:
1. Environment configuration (.env files)
2. Build optimization
3. Deploy to Vercel/Netlify
4. Set up custom domain
5. Configure SSL certificates
6. Set up monitoring (Sentry)

---

## 💡 **TIPS FOR IMPLEMENTATION**

1. **Start Small**: Implement one feature completely before moving to the next
2. **Test Thoroughly**: Test each feature with different user scenarios
3. **Mobile First**: Ensure all features work on mobile devices
4. **Performance**: Use React.memo, useMemo, useCallback for optimization
5. **Accessibility**: Add proper ARIA labels and keyboard navigation
6. **Error Handling**: Add proper error states and loading states
7. **Documentation**: Comment your code thoroughly

---

## 📞 **SUPPORT**

For questions or help with implementation:
- Check the existing codebase for patterns
- Refer to React & TypeScript documentation
- Test in development before deploying

---

**Last Updated**: December 2025
**Version**: 1.1.0

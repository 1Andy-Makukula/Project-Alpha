import { Shop } from '../types';

/**
 * @desc Raw mock data for shops to be used when the backend is disconnected.
 */
export const RAW_SHOPS: Shop[] = [
  {
    id: 1,
    name: "Mama's Kitchen",
    description: "Authentic Zambian home-cooked meals.",
    profilePic: "https://placehold.co/100x100?text=MK",
    coverImg: "https://placehold.co/600x200?text=Mama's+Kitchen",
    category: "Food",
    location: "Lusaka",
    isVerified: true,
    rating: 4.8,
    dateAdded: "2023-01-15",
    isFeatured: true,
    keywords: ["food", "zambian", "lunch"],
    tier: "Verified",
    minOrder: 50
  },
  {
    id: 2,
    name: "Urban Sneakers",
    description: "Latest kicks and streetwear.",
    profilePic: "https://placehold.co/100x100?text=US",
    coverImg: "https://placehold.co/600x200?text=Urban+Sneakers",
    category: "Fashion",
    location: "Ndola",
    isVerified: true,
    rating: 4.5,
    dateAdded: "2023-02-20",
    isFeatured: false,
    keywords: ["shoes", "fashion", "nike"],
    tier: "Select",
    minOrder: 0
  },
  {
    id: 3,
    name: "Tech Hub",
    description: "Gadgets and accessories.",
    profilePic: "https://placehold.co/100x100?text=TH",
    coverImg: "https://placehold.co/600x200?text=Tech+Hub",
    category: "Electronics",
    location: "Kitwe",
    isVerified: false,
    rating: 3.9,
    dateAdded: "2023-03-10",
    isFeatured: false,
    keywords: ["tech", "phone", "laptop"],
    tier: "Independent",
    minOrder: 100
  }
];

/**
 * @desc Assigns or validates tiers for shops.
 * @param {Shop[]} shops - The raw list of shops.
 * @returns {Shop[]} The processed list of shops.
 */
export const assignShopTiers = (shops: Shop[]): Shop[] => {
  return shops.map(shop => ({
    ...shop,
    tier: shop.tier || 'Independent'
  }));
};
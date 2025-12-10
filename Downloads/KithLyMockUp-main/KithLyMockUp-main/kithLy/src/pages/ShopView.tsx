
import React, { useState, useMemo, useRef } from 'react';
import CustomerHeader from '../components/components/CustomerHeader';
import Footer from '../components/components/Footer';
import { View, Product } from '../types';
import ProductCard from '../components/components/ProductCard';
import ProductQuickViewModal from '../components/components/ProductQuickViewModal';
import { ShieldCheckIcon, MapPinIcon } from '../components/components/icons/NavigationIcons';
import { StarIcon } from '../components/components/icons/FeatureIcons';
import { ToastType } from '../components/components/Toast';
import AnimatedBackButton from '../components/components/AnimatedBackButton';

interface ShopViewProps {
  setView: (view: View, shopId?: number) => void;
  shopId: number | null;
  cartItemCount: number;
  onCartClick: () => void;
  onAddToCart: (product: Product, shopData: { id: number; name: string; }, quantity?: number) => void;
  likedItems: number[];
  onToggleLike: (productId: number) => void;
  showToast: (message: string, type: ToastType) => void;
  targetCity: string;
  setTargetCity: (city: string) => void;
}

// Define the structure for shop details including products
interface ShopData {
    id: number;
    name: string;
    description: string;
    profilePic: string;
    coverImg: string;
    category: string;
    location: string;
    isVerified: boolean;
    rating?: number;
    products: Product[];
}

// Database of shops corresponding to CustomerPortal IDs
const shopsDatabase: Record<number, ShopData> = {
    1: {
        id: 1,
        name: "Mama's Kitchen",
        description: "Authentic home-cooked meals and groceries. We bring the taste of home to your loved ones, with fresh ingredients and traditional recipes passed down through generations.",
        profilePic: "https://picsum.photos/id/40/200/200",
        coverImg: "https://picsum.photos/id/1060/1200/500",
        category: "Groceries",
        location: "Lusaka, Zambia",
        isVerified: true,
        rating: 4.8,
        products: [
            { id: 101, name: "Fresh Produce Box", price: 650.00, image: "https://picsum.photos/id/1080/400/400", category: "Produce", stock: 25, description: "A curated box of the freshest seasonal vegetables and fruits." },
            { id: 102, name: "Imported Basmati Rice (5kg)", price: 400.00, image: "https://picsum.photos/id/292/400/400", category: "Pantry", stock: 8, description: "Premium quality long-grain Basmati rice." },
            { id: 103, name: "Sunflower Cooking Oil (1L)", price: 230.00, image: "https://picsum.photos/id/326/400/400", category: "Pantry", stock: 15, description: "Light and healthy sunflower oil." },
            { id: 104, name: "Artisanal Sourdough Loaf", price: 130.00, image: "https://picsum.photos/id/184/400/400", category: "Bakery", stock: 0, description: "Delicious, crusty sourdough bread." },
            { id: 105, name: "Organic Whole Milk (1L)", price: 110.00, image: "https://picsum.photos/id/493/400/400", category: "Dairy", stock: 5, description: "Fresh, creamy organic whole milk." },
            { id: 106, name: "Free-Range Eggs (12)", price: 150.00, image: "https://picsum.photos/id/451/400/400", category: "Dairy", stock: 30, description: "A dozen large brown free-range eggs." },
        ]
    },
    2: {
        id: 2,
        name: "The Gift Box",
        description: "Unique handcrafted gifts for every occasion. Find the perfect present made with love and care.",
        profilePic: "https://picsum.photos/id/43/200/200",
        coverImg: "https://picsum.photos/id/10/1200/500",
        category: "Gifts",
        location: "Ndola, Zambia",
        isVerified: false,
        rating: 4.5,
        products: [
            { id: 201, name: "Handwoven Basket", price: 350.00, image: "https://picsum.photos/id/112/400/400", category: "Crafts", stock: 10, description: "Beautiful handwoven basket, perfect for decor or storage." },
            { id: 202, name: "Beaded Necklace", price: 180.00, image: "https://picsum.photos/id/140/400/400", category: "Jewelry", stock: 20, description: "Colorful beaded necklace made by local artisans." },
            { id: 203, name: "Wooden Elephant Sculpture", price: 500.00, image: "https://picsum.photos/id/111/400/400", category: "Decor", stock: 5, description: "Hand-carved wooden elephant, a symbol of strength." },
            { id: 204, name: "Scented Candle Set", price: 250.00, image: "https://picsum.photos/id/13/400/400", category: "Home", stock: 15, description: "Relaxing scented candles in various fragrances." },
            { id: 205, name: "Ankara Print Notebook", price: 120.00, image: "https://picsum.photos/id/24/400/400", category: "Stationery", stock: 30, description: "Notebook with a vibrant Ankara print cover." }
        ]
    },
    3: {
        id: 3,
        name: "Campus Supplies Co.",
        description: "All your essential student needs in one place. From textbooks to tech, we support your academic journey.",
        profilePic: "https://picsum.photos/id/48/200/200",
        coverImg: "https://picsum.photos/id/20/1200/500",
        category: "Student Support",
        location: "Kitwe, Zambia",
        isVerified: true,
        rating: 4.7,
        products: [
            { id: 301, name: "Scientific Calculator", price: 450.00, image: "https://picsum.photos/id/3/400/400", category: "Tech", stock: 50, description: "Advanced scientific calculator for math and science." },
            { id: 302, name: "Laptop Stand", price: 300.00, image: "https://picsum.photos/id/4/400/400", category: "Tech", stock: 12, description: "Ergonomic laptop stand for comfortable studying." },
            { id: 303, name: "Student Backpack", price: 550.00, image: "https://picsum.photos/id/6/400/400", category: "Accessories", stock: 20, description: "Durable backpack with laptop compartment." },
            { id: 304, name: "Premium Pens Set (10pk)", price: 80.00, image: "https://picsum.photos/id/20/400/400", category: "Stationery", stock: 100, description: "Smooth writing pens for note-taking." },
            { id: 305, name: "A4 Notebook Bundle (5pk)", price: 150.00, image: "https://picsum.photos/id/24/400/400", category: "Stationery", stock: 40, description: "Value pack of A4 notebooks." }
        ]
    },
    4: {
        id: 4,
        name: "Daily Needs Grocers",
        description: "Fresh produce and daily essentials delivered right to your doorstep.",
        profilePic: "https://picsum.photos/id/53/200/200",
        coverImg: "https://picsum.photos/id/25/1200/500",
        category: "Groceries",
        location: "Lusaka, Zambia",
        isVerified: true,
        rating: 4.6,
        products: [
            { id: 401, name: "Maize Meal (25kg)", price: 350.00, image: "https://picsum.photos/id/292/400/400", category: "Pantry", stock: 20, description: "Staple maize meal for every household." },
            { id: 402, name: "White Sugar (2kg)", price: 60.00, image: "https://picsum.photos/id/493/400/400", category: "Pantry", stock: 50, description: "Refined white sugar." },
            { id: 403, name: "Table Salt (1kg)", price: 20.00, image: "https://picsum.photos/id/326/400/400", category: "Pantry", stock: 100, description: "Iodized table salt." },
            { id: 404, name: "Bar Soap (Pack of 4)", price: 45.00, image: "https://picsum.photos/id/40/400/400", category: "Household", stock: 30, description: "Multi-purpose bar soap." },
            { id: 405, name: "Tomatoes (1kg)", price: 30.00, image: "https://picsum.photos/id/1080/400/400", category: "Fresh", stock: 15, description: "Fresh, ripe tomatoes." }
        ]
    },
    5: {
        id: 5,
        name: "Celebration Creations",
        description: "Making every moment special with cakes, flowers, and party supplies.",
        profilePic: "https://picsum.photos/id/63/200/200",
        coverImg: "https://picsum.photos/id/30/1200/500",
        category: "Gifts",
        location: "Livingstone, Zambia",
        isVerified: false,
        rating: 4.4,
        products: [
            { id: 501, name: "Chocolate Birthday Cake", price: 450.00, image: "https://picsum.photos/id/1081/400/400", category: "Bakery", stock: 5, description: "Rich chocolate cake with ganache frosting." },
            { id: 502, name: "Party Balloon Set", price: 100.00, image: "https://picsum.photos/id/30/400/400", category: "Party", stock: 20, description: "Assorted colorful balloons." },
            { id: 503, name: "Cupcakes (Box of 6)", price: 180.00, image: "https://picsum.photos/id/96/400/400", category: "Bakery", stock: 10, description: "Vanilla and chocolate cupcakes." },
            { id: 504, name: "Greeting Card", price: 50.00, image: "https://picsum.photos/id/24/400/400", category: "Stationery", stock: 50, description: "Blank card for your personal message." }
        ]
    }
};

// Fallback for other IDs to avoid empty pages during demo
const defaultShop: ShopData = shopsDatabase[1];

const ShopView: React.FC<ShopViewProps> = ({ setView, shopId, cartItemCount, onCartClick, onAddToCart, likedItems, onToggleLike, showToast, targetCity, setTargetCity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  
  // Select shop data based on ID, or fallback
  const shop = (shopId && shopsDatabase[shopId]) ? shopsDatabase[shopId] : defaultShop;

  const productCategories = useMemo(() => {
    if (!shop) return ['All'];
    return ['All', ...Array.from(new Set(shop.products.map(p => p.category)))];
  }, [shop]);

  const filteredProducts = useMemo(() => {
    if (!shop) return [];
    let products = shop.products;

    if (targetCity !== 'All' && shop.location.toLowerCase().includes(targetCity.toLowerCase())) {
        // This is a basic filter. A more robust solution would be to have structured location data.
    } else if (targetCity !== 'All') {
        return [];
    }
    
    if (activeCategory !== 'All') {
        products = products.filter(p => p.category === activeCategory);
    }
    
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        products = products.filter(product => 
            product.name.toLowerCase().includes(lowercasedQuery) ||
            product.category.toLowerCase().includes(lowercasedQuery)
        );
    }
    return products;
  }, [shop, searchQuery, activeCategory, targetCity]);

  const handleProductAddToCart = (product: Product, imageElement: HTMLImageElement | null) => {
    onAddToCart(product, { id: shop.id, name: shop.name });
    
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const cartRect = cartIconRef.current?.getBoundingClientRect();

    if (!cartRect) return;

    const flyingImage = imageElement.cloneNode(true) as HTMLImageElement;
    flyingImage.className = 'flying-image';
    
    flyingImage.style.left = `${rect.left}px`;
    flyingImage.style.top = `${rect.top}px`;
    flyingImage.style.width = `${rect.width}px`;
    flyingImage.style.height = `${rect.height}px`;

    document.body.appendChild(flyingImage);
    
    requestAnimationFrame(() => {
        flyingImage.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
        flyingImage.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
        flyingImage.style.width = '20px';
        flyingImage.style.height = '20px';
        flyingImage.style.opacity = '0';
        flyingImage.style.transform = 'scale(0.1)';
        flyingImage.style.borderRadius = '50%';
    });

    setTimeout(() => {
      flyingImage.remove();
    }, 600);
  };
  
  const handleAddToCartFromModal = (product: Product, quantity: number) => {
    onAddToCart(product, { id: shop.id, name: shop.name }, quantity);
    setSelectedProduct(null); 
  };


  if (!shop) {
    return <div>Shop not found</div>;
  }

  return (
    <div className="bg-kithly-background min-h-screen">
      <CustomerHeader 
        ref={cartIconRef} 
        setView={setView} 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        cartItemCount={cartItemCount} 
        onCartClick={onCartClick}
        targetCity={targetCity}
        setTargetCity={setTargetCity}
      />
      <main>
        {/* Immersive Hero Section */}
        <section className="relative mb-12">
            <div className="h-80 bg-gray-900 overflow-hidden relative">
                <img src={shop.coverImg} alt={`${shop.name} cover`} className="w-full h-full object-cover opacity-80" />
                {/* Stronger gradient overlay to ensure text readability foundation */}
                <div className="absolute inset-0 bg-gradient-to-t from-kithly-dark/90 via-kithly-dark/40 to-transparent opacity-90"></div>
            </div>
            
            <div className="container mx-auto px-6 relative -mt-32 z-10">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="relative group flex-shrink-0">
                        <img src={shop.profilePic} alt={shop.name} className="w-32 h-32 md:w-48 md:h-48 rounded-3xl border-4 border-white object-cover shadow-2xl bg-white" />
                        {shop.isVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-md" title="Verified Shop">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                    
                    {/* Glassmorphic container for text readability */}
                    <div className="flex-1 w-full md:w-auto bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg text-center md:text-left mb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                             <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">{shop.name}</h1>
                             {shop.rating && (
                                <div className="inline-flex items-center bg-yellow-400/20 backdrop-blur-md rounded-full px-3 py-1 border border-yellow-400/30 w-fit mx-auto md:mx-0">
                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                                    <span className="text-sm font-bold text-white">{shop.rating}</span>
                                </div>
                             )}
                        </div>
                        <p className="text-white/90 text-base md:text-lg max-w-3xl font-medium leading-relaxed drop-shadow-sm">{shop.description}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
                             <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-white text-kithly-primary shadow-sm uppercase tracking-wide">
                                {shop.category}
                            </span>
                             <div className="flex items-center text-xs font-bold text-white/90 bg-white/20 px-4 py-1.5 rounded-full border border-white/20">
                                <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
                                <span>{shop.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="container mx-auto px-6 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Desktop Sticky Sidebar for Shop Info */}
                <aside className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-lg text-kithly-dark mb-4">Shop Details</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Location</span>
                                <p className="text-sm text-gray-700 mt-1">{shop.location}</p>
                            </div>
                             <div>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Category</span>
                                <p className="text-sm text-gray-700 mt-1">{shop.category}</p>
                            </div>
                             <div>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">About</span>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{shop.description}</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button onClick={() => setView('customerPortal')} className="flex items-center text-sm font-semibold text-kithly-primary hover:text-kithly-secondary transition-colors">
                                <span>&larr; Back to all shops</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Product Area */}
                <section className="lg:col-span-9">
                    {/* Modern Sticky Filters */}
                    <div className="sticky top-[72px] z-30 bg-kithly-background/95 backdrop-blur-sm py-4 -mx-6 px-6 mb-6 border-b border-gray-200/50 transition-all">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-kithly-dark hidden md:block">Products</h2>
                            <nav className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
                                {productCategories.map(category => (
                                    <button 
                                        key={category} 
                                        onClick={() => setActiveCategory(category)}
                                        className={`
                                            relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                                            ${activeCategory === category 
                                                ? 'gradient-bg text-white shadow-md scale-105' 
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-kithly-primary hover:text-kithly-primary'
                                            }
                                        `}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                          {filteredProducts.map((product, index) => (
                              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                  <ProductCard 
                                      product={product} 
                                      onAddToCart={(imageElement) => handleProductAddToCart(product, imageElement)}
                                      onQuickViewClick={() => setSelectedProduct(product)}
                                      isLiked={likedItems.includes(product.id)}
                                      onLikeClick={() => onToggleLike(product.id)}
                                  />
                              </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700">No Products Found</h3>
                          <p className="text-gray-500 mt-2 text-center max-w-xs">We couldn't find any items matching your search or category.</p>
                          <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-6 text-kithly-primary font-bold hover:underline">Clear Filters</button>
                      </div>
                    )}
                </section>
            </div>
        </div>

      </main>
      
      {selectedProduct && (
        <ProductQuickViewModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCartFromModal}
        />
      )}

      {/* Floating Back Button (Visible on all screens) */}
      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
          <AnimatedBackButton onClick={() => setView('customerPortal')} label="All Shops" className="shadow-xl shadow-orange-900/10" />
      </div>

      <Footer setView={setView} />
    </div>
  );
};

export default ShopView;

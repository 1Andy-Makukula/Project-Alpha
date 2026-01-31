
import React, { useState, useMemo, useRef, useEffect } from 'react';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import { View, Product, Shop } from '../types';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import { ShieldCheckIcon, MapPinIcon } from '../components/icons/NavigationIcons';
import { StarIcon } from '../components/icons/FeatureIcons';
import { ToastType } from '../components/Toast';
import AnimatedBackButton from '../components/AnimatedBackButton';
import { firestoreShopsService } from '../services/firestoreShopsService';
import { firestoreProductsService } from '../services/firestoreProductsService';

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

const ShopView: React.FC<ShopViewProps> = ({ setView, shopId, cartItemCount, onCartClick, onAddToCart, likedItems, onToggleLike, showToast, targetCity, setTargetCity }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const cartIconRef = useRef<HTMLButtonElement>(null);

    // Fetch shop and products from Firestore
    useEffect(() => {
        const fetchShopData = async () => {
            if (!shopId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch shop details
                const shopData = await firestoreShopsService.getById(shopId.toString());

                // Check if shop exists and is not disabled
                if (shopData && !shopData.isDisabled) {
                    setShop(shopData);

                    // Only fetch products if shop's products are not disabled
                    if (!shopData.productsDisabled) {
                        const shopProducts = await firestoreProductsService.getAll(shopId);
                        setProducts(shopProducts);
                    } else {
                        setProducts([]); // Products are temporarily disabled
                    }
                } else if (shopData?.isDisabled) {
                    // Shop is temporarily disabled
                    setShop(null);
                    showToast('This shop is temporarily unavailable', 'info');
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
                showToast('Failed to load shop data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [shopId, showToast]);

    const productCategories = useMemo(() => {
        if (!products) return ['All'];
        return ['All', ...Array.from(new Set(products.map(p => p.category)))];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        let filtered = products;

        if (targetCity !== 'All' && shop?.location && !shop.location.toLowerCase().includes(targetCity.toLowerCase())) {
            return [];
        }

        if (activeCategory !== 'All') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(lowercasedQuery) ||
                product.category.toLowerCase().includes(lowercasedQuery)
            );
        }
        return filtered;
    }, [products, searchQuery, activeCategory, targetCity, shop]);

    const handleProductAddToCart = (product: Product, imageElement: HTMLImageElement | null) => {
        if (!shop) {
            showToast('Shop not loaded', 'error');
            return;
        }

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
        if (!shop) {
            showToast('Shop not loaded', 'error');
            return;
        }

        onAddToCart(product, { id: shop.id, name: shop.name }, quantity);
        setSelectedProduct(null);
    };


    if (loading) {
        return (
            <div className="bg-kithly-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kithly-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shop...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="bg-kithly-background min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Shop not found</p>
                    <button onClick={() => setView('customerPortal')} className="text-kithly-primary font-bold hover:underline">Back to Shops</button>
                </div>
            </div>
        );
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

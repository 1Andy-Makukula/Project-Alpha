
import React, { useState, useMemo, useEffect, useRef } from 'react';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import { View, Shop } from '../App';
import ShopCard from '../components/ShopCard';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, ChevronDownIcon, CheckCircleIcon } from '../components/icons/NavigationIcons';
import BackToTopButton from '../components/BackToTopButton';
import AnimatedBackButton from '../components/AnimatedBackButton';

interface CustomerPortalProps {
  setView: (view: View, shopId?: number) => void;
  cartItemCount: number;
  onCartClick: () => void;
  initialSearchQuery?: string;
  targetCity: string;
  setTargetCity: (city: string) => void;
  shops: Shop[];
}

const categories = ["All", "Groceries", "Gifts", "Student Support", "Fashion", "Electronics"];

const sliderContent = [
    {
        id: 1,
        title: "20% Off All Groceries",
        description: "Stock up on essentials from Mama's Kitchen this week!",
        image: "https://picsum.photos/id/1060/1200/600",
        shopId: 1,
    },
    {
        id: 2,
        title: "KithLy App Update Coming Soon!",
        description: "Get ready for a faster, smoother experience with new features.",
        image: "https://picsum.photos/id/12/1200/600",
    },
    {
        id: 3,
        title: "Find the Perfect Birthday Gift",
        description: "Explore unique handcrafted items at The Gift Box.",
        image: "https://picsum.photos/id/10/1200/600",
        shopId: 2,
    },
    {
        id: 4,
        title: "Support a Student Today",
        description: "Campus Supplies Co. has all the essentials for academic success.",
        image: "https://picsum.photos/id/22/1200/600",
        shopId: 3,
    },
];

const SHOPS_PER_PAGE = 9;

const CustomerPortal: React.FC<CustomerPortalProps> = ({ setView, cartItemCount, onCartClick, initialSearchQuery, targetCity, setTargetCity, shops }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [sortBy, setSortBy] = useState('default');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideIntervalRef = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialSearchQuery) {
        setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, targetCity, sortBy]);

  const startSlideTimer = () => {
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = window.setInterval(() => {
        if (!isPaused) {
            setCurrentSlide(prev => (prev === sliderContent.length - 1 ? 0 : prev + 1));
        }
    }, 4000);
  };

  useEffect(() => {
    startSlideTimer();
    return () => {
        if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isPaused]);

  const handleManualSlideChange = (index: number) => {
    setCurrentSlide(index);
    // Reset timer
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    startSlideTimer();
  };

  const featuredShops = useMemo(() => shops.filter(shop => shop.isFeatured), [shops]);

  const filteredAndSortedShops = useMemo(() => {
    let filtered = shops;
    
    // Filter by Category
    if (activeCategory !== "All") {
        filtered = filtered.filter(shop => shop.category === activeCategory);
    }

    // Filter by Global Target City (Strict Pickup Context)
    if (targetCity && targetCity !== "All") {
        filtered = filtered.filter(shop => shop.location.includes(targetCity));
    }
    
    // Filter by Search Query (Enhanced)
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(shop => 
            shop.name.toLowerCase().includes(lowercasedQuery) ||
            shop.description.toLowerCase().includes(lowercasedQuery) ||
            shop.category.toLowerCase().includes(lowercasedQuery) ||
            shop.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedQuery))
        );
    }

    // Sort
    const sortedShops = [...filtered];
    switch (sortBy) {
        case 'rating':
            sortedShops.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            sortedShops.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
            break;
        case 'name_az':
            sortedShops.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Prioritize "Select" tier in default sort
            sortedShops.sort((a, b) => {
                if (a.tier === 'Select' && b.tier !== 'Select') return -1;
                if (a.tier !== 'Select' && b.tier === 'Select') return 1;
                return 0;
            });
            break;
    }

    return sortedShops;
  }, [activeCategory, searchQuery, targetCity, sortBy, shops]);

  const totalPages = Math.ceil(filteredAndSortedShops.length / SHOPS_PER_PAGE);
  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * SHOPS_PER_PAGE;
    return filteredAndSortedShops.slice(startIndex, startIndex + SHOPS_PER_PAGE);
  }, [filteredAndSortedShops, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 800, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (query: string) => {
      setSearchQuery(query);
      window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen font-sans text-gray-900 selection:bg-orange-100">
      <CustomerHeader 
        setView={setView} 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onSearchSubmit={handleSearchSubmit}
        cartItemCount={cartItemCount} 
        onCartClick={onCartClick} 
        targetCity={targetCity}
        setTargetCity={setTargetCity}
      />
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-12 md:space-y-16">
        
        {/* Hero Slider */}
        <div 
            className="relative w-full h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl shadow-orange-100 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-0 flex transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1)" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {sliderContent.map((slide) => (
                    <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gray-900/20 z-10"></div>
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transform transition-transform duration-[10s] ease-out scale-105 group-hover:scale-110" />
                        
                        {/* Glassmorphic Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl max-w-2xl transform transition-all duration-500 hover:bg-white/20">
                                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-sm">{slide.title}</h2>
                                <p className="text-lg text-white/90 mb-6 font-medium drop-shadow-sm">{slide.description}</p>
                                {slide.shopId && (
                                    <button 
                                        onClick={() => setView('shopView', slide.shopId)}
                                        className="bg-white text-kithly-primary px-8 py-3.5 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 shadow-lg flex items-center gap-2 group/btn"
                                    >
                                        Shop Now 
                                        <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-8 right-8 md:right-12 z-30 flex gap-2">
                {sliderContent.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => handleManualSlideChange(index)}
                        className={`h-2 rounded-full transition-all duration-500 ${currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>

        {/* Featured Shops Section (Horizontal Scroll) */}
        <section className="relative">
            <div className="flex justify-between items-end mb-6 px-1">
                <div>
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1 block">Curated for you</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-kithly-dark">Trending in {targetCity === 'All' ? 'Global' : targetCity}</h2>
                </div>
                <div className="hidden md:flex gap-2">
                    <button className="p-2 rounded-full border border-gray-200 hover:border-kithly-primary hover:text-kithly-primary transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button className="p-2 rounded-full border border-gray-200 hover:border-kithly-primary hover:text-kithly-primary transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>
            
            <div className="flex space-x-6 overflow-x-auto pb-8 pt-2 px-2 -mx-2 scrollbar-hide snap-x snap-mandatory">
                {featuredShops.map((shop, index) => (
                    <div key={shop.id} className="flex-shrink-0 w-80 md:w-96 snap-center transform transition-transform duration-300 hover:-translate-y-2">
                        <ShopCard shop={shop} onClick={() => setView('shopView', shop.id)} />
                    </div>
                ))}
            </div>
        </section>

        {/* Main Shop Area */}
        <section id="shop-grid" className="relative">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-kithly-dark">Explore All Shops</h1>
                <p className="text-gray-500 mt-2">Find the best local businesses to support.</p>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl px-4 py-3 mb-8 transition-all">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     {/* Categories */}
                     <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`
                                        px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap border
                                        ${activeCategory === category 
                                            ? 'bg-kithly-dark text-white border-kithly-dark shadow-md' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                     </div>

                     {/* Sort & Filter Controls */}
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-48">
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)} 
                                className="w-full appearance-none bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-kithly-primary/20 focus:border-kithly-primary transition-all cursor-pointer"
                            >
                                <option value="default">Recommended</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="name_az">Name (A-Z)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400 group-hover:text-kithly-primary transition-colors">
                                 <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {filteredAndSortedShops.length > 0 ? (
              <div className="space-y-10">
                {searchQuery && (
                    <div className="flex items-center gap-2 bg-white w-fit px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <span className="text-sm text-gray-500">Search results for:</span>
                        <span className="font-bold text-kithly-dark">"{searchQuery}"</span>
                        <button onClick={() => setSearchQuery('')} className="ml-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                    {paginatedShops.map((shop, index) => (
                        <div key={shop.id} className="animate-fade-in" style={{ animationDelay: `${index * 75}ms` }}>
                          <ShopCard shop={shop} onClick={() => setView('shopView', shop.id)} />
                        </div>
                    ))}
                </div>
                
                {/* Modern Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center space-y-4 mt-12">
                      <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1">
                          <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="p-3 rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          >
                              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                          </button>
                          
                          <div className="flex items-center px-2 space-x-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                  <button
                                      key={page}
                                      onClick={() => handlePageChange(page)}
                                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                                          currentPage === page 
                                            ? 'bg-kithly-primary text-white shadow-md scale-105' 
                                            : 'text-gray-500 hover:bg-gray-100'
                                      }`}
                                  >
                                      {page}
                                  </button>
                              ))}
                          </div>

                          <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="p-3 rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          >
                              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                          </button>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                          Showing page {currentPage} of {totalPages}
                      </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 px-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <SearchIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">No Shops Found</h3>
                  <p className="text-gray-500 max-w-md text-center mb-8 leading-relaxed">
                      We couldn't find any shops matching your current filters in <span className="font-semibold">{targetCity}</span>. Try clearing your search or changing categories.
                  </p>
                  <div className="flex gap-4">
                      <button 
                        onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} 
                        className="px-8 py-3 bg-white border border-gray-200 text-kithly-dark rounded-full font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                          Clear All Filters
                      </button>
                  </div>
              </div>
            )}
        </section>
      </main>

      <div className="fixed bottom-8 left-8 z-50">
          <AnimatedBackButton onClick={() => setView('landing')} label="Home" className="shadow-xl shadow-orange-900/10" />
      </div>
      
      <Footer setView={setView} />
      <BackToTopButton />
    </div>
  );
};

export default CustomerPortal;

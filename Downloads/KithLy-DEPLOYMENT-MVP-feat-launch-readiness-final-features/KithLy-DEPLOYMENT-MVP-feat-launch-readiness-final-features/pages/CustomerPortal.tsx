
import React, { useState, useMemo, useEffect, useRef } from 'react';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import { View } from '../App';
import ShopCard from '../components/ShopCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons/NavigationIcons';
import BackToTopButton from '../components/BackToTopButton';

interface CustomerPortalProps {
  setView: (view: View, shopId?: number) => void;
  cartItemCount: number;
  onCartClick: () => void;
}

const mockShops = [
    { id: 1, name: "Mama's Kitchen", description: "Authentic home-cooked meals and groceries.", profilePic: "https://picsum.photos/id/40/200/200", coverImg: "https://picsum.photos/id/1060/800/400", category: "Groceries", location: "Lagos, Nigeria", isVerified: true, isNew: false, hasOffer: true, rating: 4.8, dateAdded: '2024-07-15', isFeatured: true },
    { id: 2, name: "The Gift Box", description: "Unique handcrafted gifts for every occasion.", profilePic: "https://picsum.photos/id/43/200/200", coverImg: "https://picsum.photos/id/10/800/400", category: "Gifts", location: "Accra, Ghana", isVerified: false, isNew: true, hasOffer: false, rating: 4.5, dateAdded: '2024-07-28', isFeatured: true },
    { id: 3, name: "Campus Supplies Co.", description: "All your essential student needs in one place.", profilePic: "https://picsum.photos/id/48/200/200", coverImg: "https://picsum.photos/id/22/800/400", category: "Student Support", location: "Nairobi, Kenya", isVerified: true, isNew: false, hasOffer: false, rating: 4.7, dateAdded: '2024-06-20', isFeatured: false },
    { id: 4, name: "Daily Needs Grocers", description: "Fresh produce and daily essentials delivered.", profilePic: "https://picsum.photos/id/53/200/200", coverImg: "https://picsum.photos/id/25/800/400", category: "Groceries", location: "Lagos, Nigeria", isVerified: true, isNew: false, hasOffer: false, rating: 4.6, dateAdded: '2024-07-01', isFeatured: true },
    { id: 5, name: "Celebration Creations", description: "Cakes, flowers, and party supplies.", profilePic: "https://picsum.photos/id/63/200/200", coverImg: "https://picsum.photos/id/30/800/400", category: "Gifts", location: "Johannesburg, SA", isVerified: false, isNew: true, hasOffer: true, rating: 4.4, dateAdded: '2024-07-25', isFeatured: false },
    { id: 7, name: "Accra Fine Gifts", description: "Luxury gifts from Ghana.", profilePic: "https://picsum.photos/id/70/200/200", coverImg: "https://picsum.photos/id/71/800/400", category: "Gifts", location: "Accra, Ghana", isVerified: true, isNew: false, hasOffer: true, rating: 4.9, dateAdded: '2024-05-10', isFeatured: true },
    { id: 8, name: "Nairobi Scholar Hub", description: "Textbooks and more for students.", profilePic: "https://picsum.photos/id/80/200/200", coverImg: "https://picsum.photos/id/81/800/400", category: "Student Support", location: "Nairobi, Kenya", isVerified: false, isNew: true, hasOffer: false, rating: 4.3, dateAdded: '2024-07-29', isFeatured: false },
];

const categories = ["All", "Groceries", "Gifts", "Student Support"];

const sliderContent = [
    {
        id: 1,
        title: "20% Off All Groceries",
        description: "Stock up on essentials from Mama's Kitchen this week!",
        image: "https://picsum.photos/id/1060/1200/400",
        shopId: 1,
    },
    {
        id: 2,
        title: "KithLy App Update Coming Soon!",
        description: "Get ready for a faster, smoother experience with new features.",
        image: "https://picsum.photos/id/12/1200/400",
    },
    {
        id: 3,
        title: "Find the Perfect Birthday Gift",
        description: "Explore unique handcrafted items at The Gift Box.",
        image: "https://picsum.photos/id/10/1200/400",
        shopId: 2,
    },
    {
        id: 4,
        title: "Support a Student Today",
        description: "Campus Supplies Co. has all the essentials for academic success.",
        image: "https://picsum.photos/id/22/1200/400",
        shopId: 3,
    },
    {
        id: 5,
        title: "Holiday Promotions Are Here!",
        description: "Discover special offers from our partner shops for the upcoming holiday season.",
        image: "https://picsum.photos/id/30/1200/400",
    },
];

const SHOPS_PER_PAGE = 6;

const CustomerPortal: React.FC<CustomerPortalProps> = ({ setView, cartItemCount, onCartClick }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef<number | null>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const activeTabIndex = categories.indexOf(activeCategory);
    const activeTab = tabsRef.current[activeTabIndex];
    if (activeTab) {
        setUnderlineStyle({
            left: activeTab.offsetLeft,
            width: activeTab.offsetWidth,
        });
    }
  }, [activeCategory]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, selectedLocation, sortBy]);

  const startSlideTimer = () => {
    if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
    }
    slideIntervalRef.current = window.setInterval(() => {
        setCurrentSlide(prev => (prev === sliderContent.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  useEffect(() => {
    startSlideTimer();
    return () => {
        if (slideIntervalRef.current) {
            clearInterval(slideIntervalRef.current);
        }
    };
  }, []);

  const handleManualSlideChange = (index: number) => {
    setCurrentSlide(index);
    startSlideTimer();
  };

  const handlePrevSlide = () => {
    const newIndex = currentSlide === 0 ? sliderContent.length - 1 : currentSlide - 1;
    handleManualSlideChange(newIndex);
  };

  const handleNextSlide = () => {
    const newIndex = currentSlide === sliderContent.length - 1 ? 0 : currentSlide + 1;
    handleManualSlideChange(newIndex);
  };
  
  const featuredShops = useMemo(() => mockShops.filter(shop => shop.isFeatured), []);
  const uniqueLocations = useMemo(() => ['All', ...Array.from(new Set(mockShops.map(s => s.location)))], []);

  const filteredAndSortedShops = useMemo(() => {
    let shops = mockShops;
    
    // Filter by Category
    if (activeCategory !== "All") {
        shops = shops.filter(shop => shop.category === activeCategory);
    }

    // Filter by Location
    if (selectedLocation !== "All") {
        shops = shops.filter(shop => shop.location === selectedLocation);
    }
    
    // Filter by Search Query
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        shops = shops.filter(shop => 
            shop.name.toLowerCase().includes(lowercasedQuery) ||
            shop.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    // Sort
    const sortedShops = [...shops];
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
        case 'name_za':
            sortedShops.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            break;
    }

    return sortedShops;
  }, [activeCategory, searchQuery, selectedLocation, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedShops.length / SHOPS_PER_PAGE);
  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * SHOPS_PER_PAGE;
    return filteredAndSortedShops.slice(startIndex, startIndex + SHOPS_PER_PAGE);
  }, [filteredAndSortedShops, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };


  return (
    <div className="bg-kithly-background min-h-screen">
      <CustomerHeader setView={setView} searchQuery={searchQuery} onSearchChange={setSearchQuery} cartItemCount={cartItemCount} onCartClick={onCartClick} />
      <main className="container mx-auto px-6 py-8">
        
        {/* Promotional Slider */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg mb-12 group">
            <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {sliderContent.map(slide => (
                    <div 
                        key={slide.id} 
                        className={`w-full h-full flex-shrink-0 relative ${slide.shopId ? 'cursor-pointer' : ''}`}
                        onClick={() => slide.shopId && setView('shopView', slide.shopId)}
                    >
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
                            <h2 className="text-3xl font-bold">{slide.title}</h2>
                            <p className="mt-2 max-w-md">{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handlePrevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none z-10" aria-label="Previous slide">
                <ChevronLeftIcon className="w-6 h-6 text-kithly-dark" />
            </button>
            <button onClick={handleNextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none z-10" aria-label="Next slide">
                <ChevronRightIcon className="w-6 h-6 text-kithly-dark" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
                {sliderContent.map((_, index) => (
                    <button key={index} onClick={() => handleManualSlideChange(index)} className="p-1" aria-label={`Go to slide ${index + 1}`}>
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125 shadow-md' : 'bg-white/50'}`}></div>
                    </button>
                ))}
            </div>
            <div className="absolute bottom-4 right-4 z-10">
                <div className="relative w-7 h-7">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="14" cy="14" r="12.5" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" />
                        <circle key={currentSlide} cx="14" cy="14" r="12.5" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeDasharray="78.54" className="animate-progress"/>
                    </svg>
                </div>
            </div>
        </div>

        <section className="mb-16">
            <h2 className="text-2xl font-bold text-kithly-dark mb-4">Featured Shops</h2>
            <div className="flex space-x-6 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {featuredShops.map((shop, index) => (
                    <div key={shop.id} className="flex-shrink-0 w-full sm:w-80 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <ShopCard shop={shop} onClick={() => setView('shopView', shop.id)} />
                    </div>
                ))}
            </div>
        </section>

        <div className="mb-8">
            <h1 className="text-3xl font-bold text-kithly-dark">Explore Shops</h1>
            <p className="text-md text-gray-500 mt-2">Discover local businesses to support back home.</p>
        </div>

        <div className="sticky top-[76px] z-20 bg-kithly-background/80 backdrop-blur-md py-4 mb-8 -mx-6 px-6">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative border-b border-gray-200 w-full md:w-auto">
                    <nav className="flex space-x-8 -mb-px">
                        {categories.map((category, index) => (
                            <button key={category} ref={el => tabsRef.current[index] = el} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap pb-4 px-1 border-b-2 text-sm font-semibold transition-colors duration-300 focus:outline-none ${activeCategory === category ? 'border-kithly-primary text-kithly-primary' : 'border-transparent text-gray-500 hover:text-kithly-dark'}`}>
                                {category}
                            </button>
                        ))}
                    </nav>
                    <div className="absolute bottom-0 h-0.5 bg-kithly-primary transition-all duration-300 ease-in-out" style={underlineStyle}></div>
                </div>
                <div className="flex items-center space-x-4">
                    <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="bg-white border border-gray-300 text-kithly-dark text-sm rounded-lg focus:ring-kithly-accent focus:border-kithly-accent block w-full p-2">
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-300 text-kithly-dark text-sm rounded-lg focus:ring-kithly-accent focus:border-kithly-accent block w-full p-2">
                        <option value="default">Sort by: Default</option>
                        <option value="rating">Sort by: Highest Rated</option>
                        <option value="newest">Sort by: Newest</option>
                        <option value="name_az">Sort by: Name (A-Z)</option>
                        <option value="name_za">Sort by: Name (Z-A)</option>
                    </select>
                </div>
            </div>
        </div>

        {filteredAndSortedShops.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedShops.map((shop, index) => (
                    <div key={shop.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <ShopCard shop={shop} onClick={() => setView('shopView', shop.id)} />
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                  <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      aria-label="Previous page"
                  >
                      <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              currentPage === page ? 'gradient-bg text-white shadow-lg' : 'bg-white shadow-md hover:bg-gray-100'
                          }`}
                      >
                          {page}
                      </button>
                  ))}
                  <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      aria-label="Next page"
                  >
                      <ChevronRightIcon className="w-5 h-5" />
                  </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700">No Shops Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default CustomerPortal;
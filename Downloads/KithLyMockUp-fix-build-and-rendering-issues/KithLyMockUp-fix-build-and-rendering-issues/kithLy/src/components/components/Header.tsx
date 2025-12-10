
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { BrandLogo } from './icons/BrandLogo';
import { MapPinIcon, ChevronDownIcon, CheckCircleIcon, UserIcon, StoreIcon } from './icons/NavigationIcons';

interface HeaderProps {
  onCustomerLogin: () => void;
  onShopLogin: () => void;
  targetCity?: string;
  setTargetCity?: (city: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCustomerLogin, onShopLogin, targetCity, setTargetCity }) => {
  const [isLocOpen, setIsLocOpen] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);

  const locations = [
    { id: 'Lusaka', label: 'Lusaka, ZM' },
    { id: 'Ndola', label: 'Ndola, ZM' },
    { id: 'Livingstone', label: 'Livingstone, ZM' },
    { id: 'Kitwe', label: 'Kitwe, ZM' },
    { id: 'All', label: 'Global (Demo)' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setIsLocOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (cityId: string) => {
    if (setTargetCity) {
      setTargetCity(cityId);
      setIsLocOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-kithly-background/90 backdrop-blur-lg shadow-sm border-b border-gray-100 transition-all">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo Area */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <BrandLogo className="w-9 h-9" />
            </div>
            <span className="text-2xl font-bold gradient-text hidden sm:inline tracking-tight">KithLy</span>
          </div>

          {/* Modern Location Selector */}
          {targetCity && setTargetCity && (
            <div className="relative" ref={locRef}>
              <button 
                onClick={() => setIsLocOpen(!isLocOpen)}
                className={`
                  flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-300
                  ${isLocOpen 
                    ? 'bg-white border-kithly-primary shadow-md ring-2 ring-kithly-primary/10' 
                    : 'bg-gray-50/80 border-gray-200 hover:border-kithly-primary/50 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full 
                  ${isLocOpen ? 'bg-kithly-primary text-white' : 'bg-white text-kithly-primary shadow-sm'}
                  transition-colors duration-300
                `}>
                  <MapPinIcon className={`w-4 h-4 ${!isLocOpen && 'animate-pulse'}`} />
                </div>

                <div className="flex flex-col items-start mr-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-0.5">
                    Delivering To
                  </span>
                  <span className="text-sm font-bold text-kithly-dark leading-none truncate max-w-[100px]">
                    {targetCity === 'All' ? 'Global (Demo)' : targetCity}
                  </span>
                </div>

                <ChevronDownIcon 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isLocOpen ? 'rotate-180 text-kithly-primary' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              <div className={`
                absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden origin-top-left transition-all duration-200 z-50
                ${isLocOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
              `}>
                <div className="p-1.5">
                  {locations.map((loc) => {
                    const isActive = targetCity === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleSelect(loc.id)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                          ${isActive 
                            ? 'bg-orange-50 text-kithly-primary' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-kithly-primary' : 'bg-gray-300'}`}></div>
                           {loc.label}
                        </div>
                        {isActive && <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
                <div className="bg-gray-50 p-2.5 text-[10px] text-center text-gray-400 font-medium border-t border-gray-100">
                  Select recipient's city
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onCustomerLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-kithly-dark bg-white border border-gray-200 hover:border-kithly-primary hover:text-kithly-primary transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Customer Portal</span>
            <span className="sm:hidden">Login</span>
          </button>
          
          <Button 
            variant="primary" 
            onClick={onShopLogin}
            className="!px-4 !py-2 !rounded-full !text-xs sm:!text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 flex items-center gap-2"
          >
            <StoreIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Shop Portal</span>
            <span className="sm:hidden">Shop</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

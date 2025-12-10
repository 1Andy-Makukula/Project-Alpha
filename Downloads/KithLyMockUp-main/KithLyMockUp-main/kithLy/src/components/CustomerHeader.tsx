
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, CartIcon, UserIcon, MenuIcon, XIcon, MapPinIcon, ChevronDownIcon, CheckCircleIcon } from './icons/NavigationIcons';
import { BrandLogo } from './icons/BrandLogo';
import { View } from '../../types';
import { locations } from '../constants/locations';

interface CustomerHeaderProps {
    setView: (view: View) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearchSubmit?: (query: string) => void;
    cartItemCount: number;
    onCartClick: () => void;
    onMenuClick?: () => void;
    targetCity?: string;
    setTargetCity?: (city: string) => void;
}

const CustomerHeader = React.forwardRef<HTMLButtonElement, CustomerHeaderProps>(({ setView, searchQuery, onSearchChange, onSearchSubmit, cartItemCount, onCartClick, onMenuClick, targetCity, setTargetCity }, ref) => {
    const [isBouncing, setIsBouncing] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isLocOpen, setIsLocOpen] = useState(false);
    const prevCountRef = useRef(cartItemCount);
    const mobileSearchInputRef = useRef<HTMLInputElement>(null);
    const locRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cartItemCount > prevCountRef.current) {
            setIsBouncing(true);
            const timer = setTimeout(() => setIsBouncing(false), 500);
            return () => clearTimeout(timer);
        }
        prevCountRef.current = cartItemCount;
    }, [cartItemCount]);

    useEffect(() => {
        if (isMobileSearchOpen && mobileSearchInputRef.current) {
            mobileSearchInputRef.current.focus();
        }
    }, [isMobileSearchOpen]);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (onSearchSubmit) {
                onSearchSubmit(searchQuery);
            }
            setIsMobileSearchOpen(false);
            (e.target as HTMLInputElement).blur();
        }
    };

    const handleSelectCity = (cityId: string) => {
        if (setTargetCity) {
            setTargetCity(cityId);
            setIsLocOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 transition-all">
            <div className="container mx-auto px-4 md:px-6 py-3">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 md:gap-6">
                        {onMenuClick && (
                            <button
                                onClick={onMenuClick}
                                className="p-2 -ml-2 rounded-xl text-kithly-dark hover:bg-gray-100 lg:hidden transition-colors"
                                aria-label="Menu"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                        )}

                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('landing')}>
                            <div className="transition-transform duration-300 group-hover:scale-110">
                                <BrandLogo className="w-8 h-8 md:w-9 md:h-9" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold gradient-text hidden sm:inline tracking-tight">KithLy</span>
                        </div>

                        {/* Modern Location Selector */}
                        {targetCity && setTargetCity && (
                            <div className="relative hidden sm:block" ref={locRef}>
                                <button
                                    onClick={() => setIsLocOpen(!isLocOpen)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300
                                        ${isLocOpen
                                            ? 'bg-white border-kithly-primary shadow-md ring-2 ring-kithly-primary/10'
                                            : 'bg-gray-50 hover:bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="w-6 h-6 rounded-full bg-kithly-primary/10 flex items-center justify-center text-kithly-primary">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none">Shopping in</span>
                                        <span className="text-xs font-bold text-kithly-dark leading-none">{targetCity === 'All' ? 'Global' : targetCity}</span>
                                    </div>
                                    <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isLocOpen ? 'rotate-180 text-kithly-primary' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                <div className={`
                                    absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden origin-top-left transition-all duration-200
                                    ${isLocOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                                `}>
                                    <div className="p-1">
                                        {locations.map((loc) => {
                                            const isActive = targetCity === loc.id;
                                            return (
                                                <button
                                                    key={loc.id}
                                                    onClick={() => handleSelectCity(loc.id)}
                                                    className={`
                                                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all
                                                        ${isActive
                                                            ? 'bg-orange-50 text-kithly-primary'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }
                                                    `}
                                                >
                                                    <span>{loc.label}</span>
                                                    {isActive && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Search */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-kithly-primary transition-colors" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search shops or products..."
                                className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-kithly-dark focus:ring-2 focus:ring-kithly-primary/20 focus:bg-white transition-all shadow-inner focus:shadow-md"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>

                    <nav className="flex items-center gap-1 sm:gap-2">
                        <button
                            className="md:hidden text-gray-500 hover:text-kithly-dark p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        >
                            {isMobileSearchOpen ? <XIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
                        </button>

                        <button
                            ref={ref}
                            onClick={onCartClick}
                            className="relative p-2.5 rounded-full text-gray-600 hover:text-kithly-primary hover:bg-orange-50 transition-all duration-300 group"
                        >
                            <CartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {cartItemCount > 0 && (
                                <span className={`absolute top-0 right-0 w-5 h-5 text-[10px] font-bold text-white gradient-bg rounded-full flex items-center justify-center border-2 border-white shadow-sm ${isBouncing ? 'animate-cart-bounce' : ''}`}>
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setView('customerDashboard')}
                            className="p-2.5 rounded-full text-gray-600 hover:text-kithly-primary hover:bg-orange-50 transition-all duration-300"
                            title="Dashboard"
                        >
                            <UserIcon className="w-6 h-6" />
                        </button>
                    </nav>
                </div>

                {/* Mobile Search Bar */}
                {isMobileSearchOpen && (
                    <div className="mt-4 md:hidden animate-fade-in pb-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                ref={mobileSearchInputRef}
                                type="search"
                                placeholder="Search..."
                                className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-kithly-dark focus:ring-2 focus:ring-kithly-primary/20 focus:bg-white transition-all shadow-inner"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
});

export default CustomerHeader;

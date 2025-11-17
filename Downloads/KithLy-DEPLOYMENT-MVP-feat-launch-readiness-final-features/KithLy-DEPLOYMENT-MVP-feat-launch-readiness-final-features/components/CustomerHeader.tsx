import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, CartIcon, UserIcon, LogoutIcon } from './icons/NavigationIcons';
import { View } from '../App';
import { useAuth } from '../hooks/useAuth';

interface CustomerHeaderProps {
    setView: (view: View) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    cartItemCount: number;
    onCartClick: () => void;
}

const CustomerHeader = React.forwardRef<HTMLButtonElement, CustomerHeaderProps>(({ setView, searchQuery, onSearchChange, cartItemCount, onCartClick }, ref) => {
    const [isBouncing, setIsBouncing] = useState(false);
    const prevCountRef = useRef(cartItemCount);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (cartItemCount > prevCountRef.current) {
            setIsBouncing(true);
            const timer = setTimeout(() => setIsBouncing(false), 500); // Duration of animation
            return () => clearTimeout(timer);
        }
        prevCountRef.current = cartItemCount;
    }, [cartItemCount]);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold cursor-pointer" onClick={() => setView('landing')}>
                    <span className="gradient-text">KithLy</span>
                </div>
                
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input 
                            type="search" 
                            placeholder="Search for shops or products..." 
                            className="w-full bg-kithly-light border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm text-kithly-dark focus:outline-none focus:ring-2 focus:ring-kithly-accent focus:border-transparent transition"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                <nav className="flex items-center space-x-6">
                    <button ref={ref} onClick={onCartClick} className="relative text-kithly-dark hover:text-kithly-primary transition-colors duration-300">
                        <CartIcon />
                        {cartItemCount > 0 && (
                            <span className={`absolute -top-2 -right-2 w-5 h-5 text-xs font-semibold text-white gradient-bg rounded-full flex items-center justify-center border-2 border-white ${isBouncing ? 'animate-cart-bounce' : ''}`}>
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                    {user ? (
                        <>
                            <button onClick={() => setView('customerDashboard')} className="text-kithly-dark hover:text-kithly-primary transition-colors duration-300">
                                <UserIcon />
                            </button>
                            <button onClick={logout} className="text-kithly-dark hover:text-kithly-primary transition-colors duration-300">
                                <LogoutIcon />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setView('customerPortal')} className="text-kithly-dark hover:text-kithly-primary transition-colors duration-300">
                            Login
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
});

export default CustomerHeader;

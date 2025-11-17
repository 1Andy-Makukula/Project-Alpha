import React from 'react';
import Button from './Button';

interface HeaderProps {
  onCustomerLogin: () => void;
  onShopLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCustomerLogin, onShopLogin }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-kithly-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold cursor-pointer">
          <span className="gradient-text">KithLy</span>
        </div>
        <nav className="flex items-center space-x-4">
          <button 
            onClick={onCustomerLogin}
            className="text-sm font-medium text-kithly-dark hover:text-kithly-primary transition-colors duration-300">
            Login as Customer
          </button>
          <Button variant="secondary" onClick={onShopLogin}>Login as Shop</Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
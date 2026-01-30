import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from './icons/NavigationIcons';

const BackToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-40 p-3 rounded-full gradient-bg text-white shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-orange-300
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            aria-label="Go to top"
        >
            <ChevronUpIcon className="w-6 h-6" />
        </button>
    );
};

export default BackToTopButton;

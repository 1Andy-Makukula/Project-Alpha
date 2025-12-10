
import React from 'react';
import { ChevronLeftIcon } from './icons/NavigationIcons';

interface AnimatedBackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

const AnimatedBackButton: React.FC<AnimatedBackButtonProps> = ({ onClick, label = 'Back', className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center justify-center
                bg-gradient-to-r from-[#F85A47] to-[#F9732C] text-white
                rounded-full shadow-lg shadow-orange-500/20
                hover:shadow-orange-500/40 hover:scale-105 active:scale-95
                transition-all duration-300 ease-out
                z-40 overflow-hidden
                ${label ? 'pl-4 pr-6 py-2.5' : 'w-12 h-12'}
                ${className}
            `}
        >
            {/* Shine effect container */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12 pointer-events-none" />

            <ChevronLeftIcon className={`w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1 ${label ? 'mr-1' : ''}`} />
            {label && <span className="font-bold tracking-wide text-sm">{label}</span>}
        </button>
    );
};

export default AnimatedBackButton;

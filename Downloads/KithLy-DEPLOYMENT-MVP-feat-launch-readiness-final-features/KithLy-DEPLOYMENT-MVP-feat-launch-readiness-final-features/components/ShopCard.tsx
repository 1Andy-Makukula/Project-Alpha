

import React from 'react';
import { ShieldCheckIcon, MapPinIcon } from './icons/NavigationIcons';

interface Shop {
    id: number;
    name: string;
    description: string;
    profilePic: string;
    coverImg: string;
    category: string;
    location: string;
    isVerified: boolean;
    isNew?: boolean;
    hasOffer?: boolean;
}

interface ShopCardProps {
    shop: Shop;
    onClick: () => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onClick }) => {
    const isAd = shop.category === 'Ad';

    const cardClasses = `
        bg-white rounded-2xl shadow-md border border-gray-100/80 overflow-hidden
        transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group
        ${isAd ? 'gradient-border' : 'cursor-pointer'}
    `;

    return (
        <div className={cardClasses} onClick={isAd ? undefined : onClick}>
            <div className="relative h-40">
                <img src={shop.coverImg} alt={`${shop.name} cover`} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
                    {shop.isNew && (
                        <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg animate-fade-in">NEW</span>
                    )}
                    {shop.hasOffer && (
                         <span className="bg-kithly-primary text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg animate-fade-in">OFFER</span>
                    )}
                </div>
                <div className="absolute -bottom-10 left-6">
                    <img src={shop.profilePic} alt={shop.name} className="w-20 h-20 rounded-full border-4 border-white object-cover" />
                </div>
            </div>
            <div className="p-6 pt-12">
                 <div className="flex items-center space-x-2">
                    <h3 className={`text-xl font-bold ${isAd ? 'gradient-text' : 'text-kithly-dark'}`}>{shop.name}</h3>
                    {shop.isVerified && !isAd && (
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" title="Verified Shop" />
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1 h-10">{shop.description}</p>
                 {!isAd && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                        <MapPinIcon className="w-4 h-4 text-kithly-primary" />
                        <span>{shop.location}</span>
                    </div>
                )}
            </div>
            <div className="px-6 pb-4">
                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isAd ? 'gradient-bg text-white' : 'bg-kithly-light text-kithly-dark'}`}>
                    {shop.category}
                 </span>
            </div>
        </div>
    );
};

export default ShopCard;
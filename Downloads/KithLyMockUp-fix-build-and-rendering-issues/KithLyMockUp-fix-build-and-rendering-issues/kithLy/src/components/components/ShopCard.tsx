
import React from 'react';
import { Shop } from '../App';
import { ShopTier } from '../src/types';
import { ShieldCheckIcon, MapPinIcon } from './icons/NavigationIcons';
import { StarIcon } from './icons/FeatureIcons';
import { UserIcon } from './icons/NavigationIcons';
import Button from './Button';

interface ShopCardProps {
    shop: Shop;
    onClick: () => void;
}

// --- THE BADGE COMPONENT ---
const TierBadge: React.FC<{ tier: ShopTier }> = ({ tier }) => {
    let style = '';
    let icon = null;
    let text = '';

    switch (tier) {
        case 'Select':
            // Gold: Premium, Corporate, Top Quality
            style = 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 border border-yellow-400';
            icon = <StarIcon className="w-3.5 h-3.5" />;
            text = 'KithLy Select';
            break;
        case 'Verified':
            // Blue: Trustworthy Business
            style = 'bg-blue-600 text-white shadow-md border border-blue-500';
            icon = <ShieldCheckIcon className="w-3.5 h-3.5" />;
            text = 'Verified Business';
            break;
        case 'Independent':
            // Green: Personal, Family, Influencer (Different vibe, but trusted)
            style = 'bg-emerald-500 text-white shadow-md border border-emerald-400';
            icon = <UserIcon className="w-3.5 h-3.5" />;
            text = 'Independent Seller';
            break;
        default:
            // Grey: New/Unverified
            style = 'bg-gray-100 text-gray-600 border border-gray-200';
            icon = <div className="w-2 h-2 rounded-full bg-gray-400" />;
            text = 'New Seller';
    }

    return (
        <div className={`absolute top-3 left-3 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${style}`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

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
                {/* THE TIER BADGE */}
                {!isAd && <TierBadge tier={shop.tier} />}
                
                <img src={shop.coverImg} alt={`${shop.name} cover`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                    <h3 className={`text-xl font-bold ${isAd ? 'gradient-text' : 'text-kithly-dark group-hover:text-kithly-primary transition-colors'}`}>{shop.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">{shop.description}</p>
                 {!isAd && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-3">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{shop.location}</span>
                    </div>
                )}
            </div>
            <div className="px-6 pb-4 flex justify-between items-center">
                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isAd ? 'gradient-bg text-white' : 'bg-kithly-light text-kithly-dark'}`}>
                    {shop.category}
                 </span>
                 {!isAd && (
                     <span className="text-xs font-medium text-gray-400">
                        Min: ZMW {shop.minOrder || 0}
                     </span>
                 )}
            </div>
        </div>
    );
};

export default ShopCard;

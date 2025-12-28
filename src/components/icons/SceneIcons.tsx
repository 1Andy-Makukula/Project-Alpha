import React from 'react';

const sceneIconProps = {
    className: "w-48 h-48 text-kithly-dark",
    strokeWidth: 1,
};

export const ShoppingCartScene: React.FC = () => (
    <svg {...sceneIconProps} viewBox="0 0 200 200">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#F9A826', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#F85A47', stopOpacity:1}} />
            </linearGradient>
        </defs>
        {/* Character */}
        <path d="M105,135 a25,35 0 0,1 0,-70 h-10 a25,35 0 0,1 0,70z" fill="#f2d5b0"/>
        <circle cx="100" cy="45" r="15" fill="#4A4A4C"/>
        <rect x="90" y="130" width="20" height="40" fill="#4A4A4C"/>

        {/* Shopping Cart */}
        <path d="M60 70 h70 l-10 50 h-70 l10 -50" fill="none" stroke="#4A4A4C" strokeWidth="4"/>
        <circle cx="65" cy="140" r="8" fill="#4A4A4C"/>
        <circle cx="125" cy="140" r="8" fill="#4A4A4C"/>
        <line x1="70" y1="70" x2="80" y2="50" stroke="#4A4A4C" strokeWidth="4"/>

        {/* Groceries */}
        <rect x="70" y="80" width="20" height="20" fill="#84cc16"/>
        <circle cx="110" cy="90" r="10" fill="#ef4444"/>
        <path d="M90 95 q10 -20 20 0" fill="none" stroke="#f59e0b" strokeWidth="5"/>
    </svg>
);

export const GiftingScene: React.FC = () => (
    <svg {...sceneIconProps} viewBox="0 0 200 200">
        {/* Character */}
        <path d="M100,135 a25,35 0 0,1 0,-70 h-10 a25,35 0 0,1 0,70z" fill="#f2d5b0"/>
        <circle cx="95" cy="45" r="15" fill="#4A4A4C"/>
        <rect x="85" y="130" width="20" height="40" fill="#4A4A4C"/>

        {/* Gift Box */}
        <rect x="110" y="90" width="50" height="50" fill="url(#grad1)"/>
        <rect x="130" y="85" width="10" height="60" fill="#F9732C"/>
        <line x1="110" y1="110" x2="160" y2="110" stroke="#F9732C" strokeWidth="10"/>
        <path d="M125 85 q10 -10 20 0" stroke="#F9732C" strokeWidth="4" fill="none"/>
    </svg>
);

export const SendingLoveScene: React.FC = () => (
    <svg {...sceneIconProps} viewBox="0 0 200 200">
        {/* Character 1 */}
        <path d="M70,135 a25,35 0 0,1 0,-70 h-10 a25,35 0 0,1 0,70z" fill="#f2d5b0"/>
        <circle cx="65" cy="45" r="15" fill="#4A4A4C"/>
        <rect x="55" y="130" width="20" height="40" fill="#4A4A4C"/>

        {/* Character 2 */}
        <path d="M140,135 a25,35 0 0,0 0,-70 h10 a25,35 0 0,0 0,70z" fill="#d4a373"/>
        <circle cx="145" cy="45" r="15" fill="#6b4d38"/>
        <rect x="135" y="130" width="20" height="40" fill="#6b4d38"/>

        {/* Gift */}
        <rect x="85" y="100" width="40" height="40" fill="url(#grad1)"/>
        <rect x="100" y="95" width="10" height="50" fill="#F9732C"/>
    </svg>
);

export const StudentScene: React.FC = () => (
     <svg {...sceneIconProps} viewBox="0 0 200 200">
        {/* Character */}
        <path d="M100,135 a25,35 0 0,0 0,-70 h10 a25,35 0 0,0 0,70z" fill="#d4a373"/>
        <circle cx="105" cy="45" r="15" fill="#6b4d38"/>
        <rect x="95" y="130" width="20" height="40" fill="#6b4d38"/>

        {/* Box of supplies */}
        <path d="M40 90 l20 -20 h80 l20 20 v50 l-20 20 h-80 l-20 -20z" fill="#eaddcf" stroke="#4A4A4C" strokeWidth="4"/>
        <line x1="40" y1="90" x2="140" y2="90" stroke="#4A4A4C" strokeWidth="4"/>
        <path d="M50 100 h20" stroke="#3b82f6" strokeWidth="8"/>
        <circle cx="90" cy="110" r="10" fill="#ef4444"/>
    </svg>
);
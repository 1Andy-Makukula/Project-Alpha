import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Kithly</title>
      <defs>
        <linearGradient id="basketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20B2AA" stopOpacity="1" />
          <stop offset="100%" stopColor="#008080" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* The Basket Body */}
      <path
        d="M12 30C12 28.3431 13.3431 27 15 27H49C50.6569 27 52 28.3431 52 30V48C52 49.6569 50.6569 51 49 51H15C13.3431 51 12 49.6569 12 48V30Z"
        fill="url(#basketGradient)"
      />

      {/* The Weave Lines */}
      <path
        d="M12 36H52M12 42H52M15 27V51M49 27V51"
        stroke="#DAA520"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* The Map Pin Handle */}
      <path
        d="M22 27C22 18.1634 29.1634 11 38 11C46.8366 11 54 18.1634 54 27"
        stroke="url(#pinGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* The Pin Dot */}
      <circle cx="38" cy="27" r="5" fill="url(#pinGradient)"/>
    </svg>
  );
};

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const defaultIconProps = {
  strokeWidth: 1.5,
  fill: "none",
  stroke: "currentColor",
};

export const GiftIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18H5.25a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v2.25M12 7.5V18m0 0l-3-3m3 3l3-3m-3 3v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V18" />
  </svg>
);

export const GroceriesIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.831a1.5 1.5 0 00-1.423-2.185H5.879M6.375 11.25h11.25" />
  </svg>
);

export const SupportIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const RevenueIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0H3.75m0 0A.75.75 0 013 6V5.25m5.25 0v.75A.75.75 0 018.25 6h-.75m0 0V5.25A.75.75 0 018.25 4.5h.75m0 0h.75a.75.75 0 01.75.75v.75m0 0h-1.5m0 0A.75.75 0 018.25 6V5.25m5.25 0v.75a.75.75 0 01-.75.75h-.75m0 0V5.25a.75.75 0 01.75-.75h.75m0 0h.75a.75.75 0 01.75.75v.75m0 0h-1.5m0 0a.75.75 0 01-.75-.75V5.25m3 8.25v.75a.75.75 0 01-.75.75h-.75m0 0v-.75a.75.75 0 01.75-.75h.75m0 0h.75a.75.75 0 01.75.75v.75m0 0h-1.5m0 0A.75.75 0 0118 13.5v-.75" />
  </svg>
);

export const DiasporaIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.34 0 .672-.015.994-.046M12 21v-4.875A3.375 3.375 0 0115.375 12h.008c.342 0 .673.015.994.046M12 3c.34 0 .672.015.994.046M12 3v4.875A3.375 3.375 0 008.625 12h-.008C8.28 12 7.95 12.015 7.625 12.046M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 12a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export const CommunityIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
 <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3 3 0 003 10.5V18a9 9 0 00-2.25 5.754M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
   <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);

export const StarIcon: React.FC<IconProps> = ({className = "w-5 h-5", ...props}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" {...props}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const AllIcon: React.FC<IconProps> = ({className = "w-6 h-6", ...props}) => (
  <svg className={className} {...defaultIconProps} viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

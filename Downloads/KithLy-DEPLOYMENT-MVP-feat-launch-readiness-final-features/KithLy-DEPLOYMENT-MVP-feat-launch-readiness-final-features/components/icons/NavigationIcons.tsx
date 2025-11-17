

import React from 'react';

const iconProps = (className = "w-6 h-6") => ({
  className,
  strokeWidth: 1.5,
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  "aria-hidden":"true"
});

export const SearchIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className || "w-5 h-5 text-gray-400")}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const CartIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.831a1.5 1.5 0 00-1.423-2.185H5.879M6.375 11.25h11.25" />
  </svg>
);

export const UserIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const HeartIcon: React.FC<{className?: string, isLiked?: boolean}> = ({className, isLiked}) => (
  <svg {...iconProps(className)} fill={isLiked ? "currentColor" : "none"} >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const AnalysisIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const ProductsIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export const OrdersIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const QRIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a.75.75 0 01.75-.75h.75c.414 0 .75.336.75.75v.75c0 .414-.336.75-.75.75h-.75a.75.75 0 01-.75-.75V4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 4.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 4.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75z" />
  </svg>
);

export const SettingsIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.008 1.11-1.227l.126-.053c.552-.234 1.185.06 1.417.618l.13.313c.232.558.865.856 1.418.623l.312-.132c.558-.233 1.226.062 1.458.62l.053.126c.22.55.686 1.018 1.228 1.108l.313.05c.558.093.856.726.623 1.28l-.132.312c-.233.557.062 1.185.62 1.417l.126.053c-.55.22-.857.87-.623 1.418l-.05.313c-.09.542-.56 1.008-1.11 1.227l-.126.053c-.552.234-1.185-.06-1.417-.618l-.13-.313c-.232-.558-.865-.856-1.418-.623l-.312.132c-.558.233-1.226-.062-1.458-.62l-.053-.126c-.22-.55-.686-1.018-1.228-1.108l-.313-.05c-.558-.093-.856-.726-.623-1.28l.132-.312c.233-.557-.062-1.185-.62-1.417l-.126-.053c-.55-.22-.857-.87-.623-1.418l.05-.313zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
  </svg>
);

export const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

export const TrendingUpIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.94.886M21.75 5.25v6m-2.25-6l-3.94.886" />
  </svg>
);

export const DollarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.75 11 12 11c-.75 0-1.536.21-2.218.638l-.879.659m0 0c-1.171.879-1.171 2.303 0 3.182s3.07.879 4.242 0c1.172-.879 1.172-2.303 0-3.182m-4.5-5.5a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-1.5z" />
  </svg>
);

export const ReceiptIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m0 0h5.25m-10.5 0h5.25m-5.25 0h5.25M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const PencilIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.82a2.25 2.25 0 01-1.06.613l-2.752.825.825-2.752a2.25 2.25 0 01.613-1.06l10.264-10.264z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const ClockIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ShieldCheckIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.956 11.956 0 0112 3c2.345 0 4.547.655 6.358 1.858l-.045.022m-12.72 0l-.045-.022A11.956 11.956 0 0112 3c-2.345 0-4.547.655-6.358-1.858m12.72 0A11.956 11.956 0 0112 18.75c-2.345 0-4.547-.655-6.358-1.858m12.72 0l.045.022m-12.72 0l.045-.022m12.63 0A11.956 11.956 0 0112 21c-2.345 0-4.547-.655-6.358-1.858m12.72 0l.045.022m-12.72 0l.045-.022" />
  </svg>
);

export const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => (
    <svg {...iconProps(className)}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ExclamationTriangleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const PackageIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

export const HistoryIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v4.992m11.667 0l-3.181 3.183A8.25 8.25 0 015.17 9.348l3.181-3.183" />
  </svg>
);

export const CameraIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.5232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" />
  </svg>
);

export const KeyboardIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const XIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChatBubbleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.5A2.25 2.25 0 015.25 21h13.5A2.25 2.25 0 0121 18.75V5.25A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25v13.5z" />
  </svg>
);

export const PlusCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)} fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
  </svg>
);

export const CreditCardIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

export const MapPinIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const AdjustmentsVerticalIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps(className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);
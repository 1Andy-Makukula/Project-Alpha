import React from 'react';
import { ShieldCheckIcon, CheckCircleIcon } from './icons/NavigationIcons';

export type OrderStatus = 'paid' | 'collected';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    paid: {
      text: 'Paid',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      className: 'bg-blue-100 text-blue-800',
    },
    collected: {
      text: 'Collected',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      className: 'bg-purple-100 text-purple-800',
    },
  };
  
  // A fallback for any potential old statuses that might still be rendered
  const fallbackConfig = {
      text: 'Completed',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      className: 'bg-green-100 text-green-800',
  };

  const { text, icon, className } = statusConfig[status as keyof typeof statusConfig] || fallbackConfig;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-full ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

export default OrderStatusBadge;
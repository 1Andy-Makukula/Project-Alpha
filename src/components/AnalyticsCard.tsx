import React from 'react';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from './icons/NavigationIcons';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  borderColor?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBgColor,
  iconColor,
  borderColor = 'border-gray-100',
  subtitle,
  footer
}) => {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUpIcon className="w-3 h-3" />;
    if (change < 0) return <TrendingDownIcon className="w-3 h-3" />;
    return <MinusIcon className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${borderColor} transition-all hover:-translate-y-1 duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}

          {change !== undefined && (
            <div className={`flex items-center mt-3 text-xs font-semibold  ${getTrendColor()} inline-flex px-2 py-1 rounded-md gap-1`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}% {changeLabel || 'vs last period'}</span>
            </div>
          )}

          {footer && (
            <div className="mt-3">
              {footer}
            </div>
          )}
        </div>

        <div className={`${iconBgColor} ${iconColor} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;

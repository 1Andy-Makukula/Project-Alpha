import React from 'react';
import { ShopAnalytics, getPerformanceRating, formatCurrency, formatPercentage } from '../services/analyticsService';
import {
  UserIcon,
  PackageIcon,
  TrendingUpIcon,
  StarIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from './icons/NavigationIcons';

interface PerformanceDashboardProps {
  analytics: ShopAnalytics;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ analytics }) => {
  const performanceRating = getPerformanceRating(analytics.performanceScore);

  return (
    <div className="space-y-6">
      {/* Performance Score Card */}
      <div className="bg-gradient-to-br from-kithly-primary to-kithly-accent p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">
              Performance Score
            </h3>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-5xl font-bold">{analytics.performanceScore}</span>
              <span className="text-2xl opacity-75 mb-1">/100</span>
            </div>
          </div>
          <div className={`${performanceRating.bgColor.replace('bg-', 'bg-white/20 ')} px-4 py-2 rounded-xl`}>
            <span className="text-white font-bold">{performanceRating.label}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${analytics.performanceScore}%` }}
          ></div>
        </div>

        <p className="mt-4 text-sm opacity-90">
          Your shop is performing {performanceRating.label.toLowerCase()}. Keep up the great work!
        </p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <UserIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Customer Insights</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="text-lg font-bold text-gray-900">{analytics.totalCustomers}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New This Week</span>
              <span className="text-lg font-bold text-green-600">+{analytics.newCustomersThisWeek}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Returning Rate</span>
              <span className="text-lg font-bold text-blue-600">
                {analytics.returningCustomerRate.toFixed(1)}%
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Avg. Order Value</span>
                <span className="text-xl font-bold text-kithly-primary">
                  {formatCurrency(analytics.averageOrderValue)}
                </span>
              </div>
              {analytics.averageOrderValueTrend !== 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <TrendingUpIcon className={`w-3 h-3 ${analytics.averageOrderValueTrend > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span>{formatPercentage(analytics.averageOrderValueTrend)} vs last week</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <PackageIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Order Performance</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Orders</span>
              <span className="text-lg font-bold text-gray-900">{analytics.todayOrders}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-lg font-bold text-purple-600">{analytics.weekOrders}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-lg font-bold text-green-600">
                {analytics.completionRate.toFixed(1)}%
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Pending Pickup</span>
                <span className="text-xl font-bold text-orange-600">{analytics.pendingOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Alerts */}
      {(analytics.lowStockProducts.length > 0 || analytics.outOfStockProducts.length > 0) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Stock Alerts</h4>
          </div>

          <div className="space-y-3">
            {analytics.outOfStockProducts.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Out of Stock</span>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {analytics.outOfStockProducts.length} products
                </span>
              </div>
            )}

            {analytics.lowStockProducts.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Low Stock (≤10 units)</span>
                </div>
                <span className="text-sm font-bold text-yellow-600">
                  {analytics.lowStockProducts.length} products
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <button className="text-sm font-semibold text-kithly-primary hover:underline">
                View All Products →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {analytics.topSellingProducts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <StarIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Top Performing Products</h4>
          </div>

          <div className="space-y-4">
            {analytics.topSellingProducts.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-kithly-primary to-kithly-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantitySold} sold · {formatCurrency(item.revenue)}
                  </p>
                </div>

                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-6">Revenue Breakdown</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Today</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(analytics.todayRevenue)}
            </p>
            {analytics.yesterdayRevenue > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                vs {formatCurrency(analytics.yesterdayRevenue)} yesterday
              </p>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">This Week</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(analytics.weekRevenue)}
            </p>
            {analytics.revenueTrend !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formatPercentage(analytics.revenueTrend)} vs last week
              </p>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(analytics.monthRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.monthOrders} orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;

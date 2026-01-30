import { Order, Product } from '../types';

export interface ShopAnalytics {
  // Revenue Metrics
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Order Metrics
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  completionRate: number;

  // Customer Metrics
  totalCustomers: number;
  newCustomersThisWeek: number;
  returningCustomerRate: number;

  // Product Metrics
  totalProducts: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  topSellingProducts: {
    product: Product;
    quantitySold: number;
    revenue: number;
  }[];

  // Trends (percentage change)
  revenueTrend: number; // vs last period
  ordersTrend: number;
  averageOrderValueTrend: number;

  // Time Series Data
  dailyRevenue: { date: string; revenue: number }[];
  weeklyRevenue: { week: string; revenue: number }[];

  // Performance Scores
  performanceScore: number; // 0-100
  customerSatisfaction: number; // Based on order completion
}

/**
 * Calculate comprehensive shop analytics from orders and products
 */
export function calculateShopAnalytics(
  orders: Order[],
  products: Product[]
): ShopAnalytics {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  // Filter orders by time periods
  const todayOrders = orders.filter(o => new Date(o.paidOn) >= todayStart);
  const yesterdayOrders = orders.filter(o => {
    const orderDate = new Date(o.paidOn);
    return orderDate >= yesterdayStart && orderDate < todayStart;
  });
  const weekOrders = orders.filter(o => new Date(o.paidOn) >= weekStart);
  const monthOrders = orders.filter(o => new Date(o.paidOn) >= monthStart);
  const lastWeekOrders = orders.filter(o => {
    const orderDate = new Date(o.paidOn);
    return orderDate >= lastWeekStart && orderDate < weekStart;
  });

  // Revenue calculations
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
  const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + o.total, 0);

  // Order metrics
  const pendingOrders = orders.filter(o => o.status === 'paid').length;
  const completedOrders = orders.filter(o => o.status === 'collected').length;
  const completionRate = orders.length > 0
    ? (completedOrders / orders.length) * 100
    : 0;

  // Customer metrics
  const uniqueCustomers = new Set(orders.map(o => o.customerName));
  const weekCustomers = new Set(weekOrders.map(o => o.customerName));
  const lastWeekCustomers = new Set(lastWeekOrders.map(o => o.customerName));
  const newCustomersThisWeek = Array.from(weekCustomers).filter(
    customer => !lastWeekCustomers.has(customer)
  ).length;

  // Calculate returning customer rate
  const customerOrderCounts = orders.reduce((acc, order) => {
    acc[order.customerName] = (acc[order.customerName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const returningCustomerRate = uniqueCustomers.size > 0
    ? (returningCustomers / uniqueCustomers.size) * 100
    : 0;

  // Average Order Value
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lastWeekAverageOrderValue = lastWeekOrders.length > 0
    ? lastWeekRevenue / lastWeekOrders.length
    : 0;

  // Trends (percentage change)
  const revenueTrend = lastWeekRevenue > 0
    ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
    : 0;
  const ordersTrend = lastWeekOrders.length > 0
    ? ((weekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100
    : 0;
  const averageOrderValueTrend = lastWeekAverageOrderValue > 0
    ? ((averageOrderValue - lastWeekAverageOrderValue) / lastWeekAverageOrderValue) * 100
    : 0;

  // Product metrics
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Calculate top selling products from order items
  const productSales = orders.reduce((acc, order) => {
    order.items?.forEach((item: any) => {
      if (!acc[item.id]) {
        acc[item.id] = { product: item, quantitySold: 0, revenue: 0 };
      }
      acc[item.id].quantitySold += item.quantity || 1;
      acc[item.id].revenue += (item.price || 0) * (item.quantity || 1);
    });
    return acc;
  }, {} as Record<number, { product: Product; quantitySold: number; revenue: number }>);

  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily revenue for chart (last 7 days)
  const dailyRevenue: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.paidOn);
      return orderDate >= date && orderDate < nextDate;
    });

    dailyRevenue.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0)
    });
  }

  // Weekly revenue for trend analysis
  const weeklyRevenue: { week: string; revenue: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const periodOrders = orders.filter(o => {
      const orderDate = new Date(o.paidOn);
      return orderDate >= weekStart && orderDate < weekEnd;
    });

    weeklyRevenue.push({
      week: `Week ${4 - i}`,
      revenue: periodOrders.reduce((sum, o) => sum + o.total, 0)
    });
  }

  // Performance score (0-100)
  const performanceScore = Math.min(100, Math.round(
    (completionRate * 0.4) + // 40% weight on completion
    (Math.min(weekOrders.length, 50) * 0.6) + // 60% weight on order volume (capped at 50)
    (lowStockProducts.length === 0 ? 20 : 0) // Bonus for no low stock
  ));

  return {
    // Revenue
    todayRevenue,
    yesterdayRevenue,
    weekRevenue,
    monthRevenue,
    totalRevenue,
    averageOrderValue,

    // Orders
    todayOrders: todayOrders.length,
    weekOrders: weekOrders.length,
    monthOrders: monthOrders.length,
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    completionRate,

    // Customers
    totalCustomers: uniqueCustomers.size,
    newCustomersThisWeek,
    returningCustomerRate,

    // Products
    totalProducts: products.length,
    lowStockProducts,
    outOfStockProducts,
    topSellingProducts,

    // Trends
    revenueTrend,
    ordersTrend,
    averageOrderValueTrend,

    // Time Series
    dailyRevenue,
    weeklyRevenue,

    // Performance
    performanceScore,
    customerSatisfaction: completionRate
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `ZMK ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  } else if (score >= 60) {
    return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  } else if (score >= 40) {
    return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  } else {
    return { label: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  }
}

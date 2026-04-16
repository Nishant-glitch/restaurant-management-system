import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDownload } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Order } from '../types';
import { format, startOfDay, subDays } from 'date-fns';

export const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setOrders(storage.get<Order[]>(STORAGE_KEYS.ORDERS, []));
  }, []);

  const days = period === 'week' ? 7 : 30;
  const salesData = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dateStr = startOfDay(date).toISOString();
    const dayOrders = orders.filter(o => startOfDay(new Date(o.createdAt)).toISOString() === dateStr);
    return {
      date: format(date, 'MMM dd'),
      sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Best selling items
  const itemSales: { [key: string]: number } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
    });
  });
  
  const topItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  // Payment mode distribution
  const paymentData = [
    { name: 'Cash', value: orders.filter(o => o.paymentMode === 'cash').length },
    { name: 'UPI', value: orders.filter(o => o.paymentMode === 'upi').length },
    { name: 'Card', value: orders.filter(o => o.paymentMode === 'card').length },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Order #', 'Items', 'Total', 'Payment'],
      ...orders.map(o => [
        format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
        o.orderNumber,
        o.items.length,
        o.total.toFixed(2),
        o.paymentMode,
      ]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your business performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button
            onClick={exportData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {totalOrders}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Order Value</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            ₹{avgOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="sales" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Best Selling Items</h3>
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">{item.quantity} sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

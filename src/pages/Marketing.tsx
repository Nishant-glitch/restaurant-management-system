import React, { useState, useEffect } from 'react';
import { FiPlus, FiSend } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { sampleCoupons } from '../utils/sampleData';
import { Coupon } from '../types';
import { format } from 'date-fns';

export const Marketing: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const saved = storage.get<Coupon[]>(STORAGE_KEYS.COUPONS, []);
    if (saved.length === 0) {
      storage.set(STORAGE_KEYS.COUPONS, sampleCoupons);
      setCoupons(sampleCoupons);
    } else {
      setCoupons(saved);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage campaigns and coupons</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Coupons */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Coupons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg inline-block mb-2">
                    <span className="font-mono font-bold text-lg">{coupon.code}</span>
                  </div>
                  <p className="text-sm opacity-90">{coupon.description}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>Min Order: ₹{coupon.minOrderValue}</p>
                <p>Used: {coupon.usedCount}/{coupon.usageLimit}</p>
                <p>Valid until: {format(new Date(coupon.validUntil), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Campaign */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Send Campaign</h2>
        <div className="space-y-4">
          <textarea
            placeholder="Type your message here..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={4}
          />
          <div className="flex items-center space-x-3">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
              <FiSend className="w-5 h-5" />
              <span>Send WhatsApp</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
              <FiSend className="w-5 h-5" />
              <span>Send SMS</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 API integration required for actual sending
          </p>
        </div>
      </div>
    </div>
  );
};

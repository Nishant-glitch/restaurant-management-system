import React, { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiGift, FiStar, FiCalendar } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { sampleCustomers } from '../utils/sampleData';
import { Customer } from '../types';
import { format } from 'date-fns';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const saved = storage.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    if (saved.length === 0) {
      storage.set(STORAGE_KEYS.CUSTOMERS, sampleCustomers);
      setCustomers(sampleCustomers);
    } else {
      setCustomers(saved);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer CRM</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer relationships and loyalty</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{customer.name}</h3>
                <div className="space-y-1 mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </p>
                  {customer.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FiMail className="w-4 h-4 mr-2" />
                      {customer.email}
                    </p>
                  )}
                  {customer.birthday && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FiGift className="w-4 h-4 mr-2" />
                      {format(new Date(customer.birthday), 'MMM dd')}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <FiStar className="w-4 h-4 mr-1" />
                {customer.loyaltyPoints}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{customer.totalVisits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{customer.totalSpent}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <FiCalendar className="w-3 h-3 mr-1" />
                Last visit: {format(new Date(customer.lastVisit), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FiClock, FiCheck } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Order, Table } from '../types';
import { formatDistanceToNow } from 'date-fns';

export const Kitchen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    setOrders(storage.get<Order[]>(STORAGE_KEYS.ORDERS, []));
    setTables(storage.get<Table[]>(STORAGE_KEYS.TABLES, []));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status } : o
    );
    setOrders(updatedOrders);
    storage.set(STORAGE_KEYS.ORDERS, updatedOrders);
  };

  const activeOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kitchen Display</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Live order updates</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold text-xl">
          {activeOrders.length} Active Orders
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeOrders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-2xl mb-2">🍳</p>
            <p>No pending orders</p>
          </div>
        ) : (
          activeOrders.map(order => {
            const table = tables.find(t => t.id === order.tableId);
            
            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 ${
                  order.status === 'pending'
                    ? 'border-red-500 dark:border-red-600'
                    : order.status === 'preparing'
                    ? 'border-yellow-500 dark:border-yellow-600'
                    : 'border-green-500 dark:border-green-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {table ? `Table ${table.number}` : 'Takeaway'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{item.image}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
                    >
                      <FiCheck className="w-5 h-5" />
                      <span>Mark Ready</span>
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

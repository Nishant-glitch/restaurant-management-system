import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { sampleMenuItems } from '../utils/sampleData';
import { MenuItem, CartItem, Order, Table } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

export const POS: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tables, setTables] = useState<Table[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const savedMenu = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    if (savedMenu.length === 0) {
      storage.set(STORAGE_KEYS.MENU_ITEMS, sampleMenuItems);
      setMenuItems(sampleMenuItems);
    } else {
      setMenuItems(savedMenu);
    }
    setTables(storage.get<Table[]>(STORAGE_KEYS.TABLES, []));
  }, []);

  const categories = ['all', 'veg', 'non-veg', 'drinks', 'hookah', 'dessert'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.05; // 5% GST
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + gst - discountAmount;

  const processOrder = (paymentMode: 'cash' | 'upi' | 'card') => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const orders = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
    const orderNumber = `ORD${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber,
      tableId: selectedTable || undefined,
      items: cart,
      subtotal,
      gst,
      discount: discountAmount,
      total,
      paymentMode,
      status: 'preparing',
      orderType: 'dine-in',
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    storage.set(STORAGE_KEYS.ORDERS, updatedOrders);

    // Update table status if applicable
    if (selectedTable) {
      const updatedTables = tables.map(t =>
        t.id === selectedTable ? { ...t, status: 'occupied' as const } : t
      );
      setTables(updatedTables);
      storage.set(STORAGE_KEYS.TABLES, updatedTables);
    }

    // Add notification
    addNotification({
      title: 'New Order',
      message: `Order ${orderNumber} placed successfully`,
      type: 'order',
    });

    // Reset cart
    setCart([]);
    setSelectedTable('');
    setDiscount(0);
    setShowCheckout(false);
    
    alert(`Order ${orderNumber} placed successfully! Total: ₹${total.toFixed(2)}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
              >
                <div className="text-4xl mb-2">{item.image}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {item.name}
                </h3>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  ₹{item.price}
                </p>
                {item.isPopular && (
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded">
                    ⭐ Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FiShoppingCart className="mr-2" />
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 dark:text-red-400 hover:underline text-sm"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Table Selection */}
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Takeaway</option>
            {tables.filter(t => t.status === 'available' || t.status === 'occupied').map(table => (
              <option key={table.id} value={table.id}>
                Table {table.number} ({table.seats} seats)
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Discount */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Discount %"
                min="0"
                max="100"
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (5%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({discount}%):</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <FiCreditCard className="w-5 h-5" />
              <span>Proceed to Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Select Payment Method
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => processOrder('cash')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                💵 Cash Payment
              </button>
              <button
                onClick={() => processOrder('upi')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                📱 UPI Payment
              </button>
              <button
                onClick={() => processOrder('card')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                💳 Card Payment
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

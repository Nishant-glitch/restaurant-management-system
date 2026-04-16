import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { sampleMenuItems } from '../utils/sampleData';
import { MenuItem } from '../types';

export const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const savedMenu = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    if (savedMenu.length === 0) {
      storage.set(STORAGE_KEYS.MENU_ITEMS, sampleMenuItems);
      setMenuItems(sampleMenuItems);
    } else {
      setMenuItems(savedMenu);
    }
  }, []);

  const categories: Array<{ value: string; label: string; emoji: string }> = [
    { value: 'all', label: 'All Items', emoji: '🍽️' },
    { value: 'veg', label: 'Veg', emoji: '🥗' },
    { value: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
    { value: 'drinks', label: 'Drinks', emoji: '🥤' },
    { value: 'hookah', label: 'Hookah', emoji: '💨' },
    { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  ];

  const filteredItems = filter === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === filter);

  const toggleAvailability = (id: string) => {
    const updated = menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setMenuItems(updated);
    storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Delete this item?')) {
      const updated = menuItems.filter(item => item.id !== id);
      setMenuItems(updated);
      storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
    }
  };

  const saveItem = (item: Omit<MenuItem, 'id'>) => {
    let updated;
    if (editingItem) {
      updated = menuItems.map(i => i.id === editingItem.id ? { ...item, id: editingItem.id } : i);
    } else {
      const newItem = { ...item, id: Date.now().toString() };
      updated = [...menuItems, newItem];
    }
    setMenuItems(updated);
    storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.value
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 transition-all ${
              item.available
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-gray-300 dark:border-gray-600 opacity-60'
            }`}
          >
            <div className="text-5xl mb-3 text-center">{item.image}</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                ₹{item.price}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                item.category === 'veg' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                item.category === 'non-veg' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
              }`}>
                {item.category}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleAvailability(item.id)}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                  item.available
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {item.available ? <FiToggleRight className="inline w-5 h-5" /> : <FiToggleLeft className="inline w-5 h-5" />}
                {' '}{item.available ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={() => {
                  setEditingItem(item);
                  setShowModal(true);
                }}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <MenuItemModal
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={saveItem}
        />
      )}
    </div>
  );
};

const MenuItemModal: React.FC<{
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'>) => void;
}> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'veg',
    price: item?.price.toString() || '',
    image: item?.image || '🍽️',
    description: item?.description || '',
    available: item?.available ?? true,
    isPopular: item?.isPopular || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const emojis = ['🍛', '🍗', '🧀', '🍖', '🍄', '🥟', '🍚', '🥭', '☕', '🍹', '🍋', '🍵', '💨', '🍯', '🍨'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="drinks">Drinks</option>
              <option value="hookah">Hookah</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon/Emoji
            </label>
            <div className="grid grid-cols-8 gap-2 mb-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: emoji })}
                  className={`text-2xl p-2 rounded-lg border-2 ${
                    formData.image === emoji
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Popular</span>
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

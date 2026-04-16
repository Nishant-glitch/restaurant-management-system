// Local storage utility functions with type safety

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Trigger storage event for multi-tab sync
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
      window.dispatchEvent(new Event('storage-update'));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  USER: 'rms_user',
  TABLES: 'rms_tables',
  BOOKINGS: 'rms_bookings',
  MENU_ITEMS: 'rms_menu_items',
  ORDERS: 'rms_orders',
  CUSTOMERS: 'rms_customers',
  COUPONS: 'rms_coupons',
  CAMPAIGNS: 'rms_campaigns',
  NOTIFICATIONS: 'rms_notifications',
  THEME: 'rms_theme',
  SETTINGS: 'rms_settings',
};

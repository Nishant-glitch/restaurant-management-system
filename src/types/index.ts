// Type definitions for the RMS system

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentBooking?: Booking;
}

export interface Booking {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'veg' | 'non-veg' | 'drinks' | 'hookah' | 'dessert';
  price: number;
  image: string;
  description: string;
  available: boolean;
  isPopular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  paymentMode: 'cash' | 'upi' | 'card';
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
  orderType: 'dine-in' | 'takeaway' | 'qr-order';
  createdAt: string;
  completedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteItems: string[];
  lastVisit: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  type: 'whatsapp' | 'sms';
  targetAudience: 'all' | 'regular' | 'vip';
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'sent';
  sentCount?: number;
}

export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'alert' | 'info';
  read: boolean;
  createdAt: string;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
  playSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedNotifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    setNotifications(savedNotifications);
  }, []);

  const playSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50);
    setNotifications(updatedNotifications);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
    
    // Play sound for new orders
    if (notification.type === 'order') {
      playSound();
    }
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
  };

  const clearAll = () => {
    setNotifications([]);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, []);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearAll,
      unreadCount,
      playSound,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

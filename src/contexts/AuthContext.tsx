import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Demo credentials
const DEMO_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
  staff: { username: 'staff', password: 'staff123', role: 'staff' as const, name: 'Staff User' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storage.get<User | null>(STORAGE_KEYS.USER, null);
    setUser(savedUser);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const demoUser = Object.values(DEMO_USERS).find(
      u => u.username === username && u.password === password
    );

    if (demoUser) {
      const loggedInUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: demoUser.username,
        role: demoUser.role,
        name: demoUser.name,
      };
      setUser(loggedInUser);
      storage.set(STORAGE_KEYS.USER, loggedInUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

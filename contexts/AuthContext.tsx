import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (name: string, emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('sc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, validation happens on backend
    if (emailOrPhone && password) {
      // Check if we have a stored user first to preserve data in this mock env
      const stored = localStorage.getItem('sc_user');
      if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.emailOrPhone === emailOrPhone) {
              setUser(parsed);
              return true;
          }
      }

      // Fallback for new login simulation
      const mockUser: User = {
        id: 'user-123',
        name: 'Jane Doe', 
        emailOrPhone: emailOrPhone,
        avatar: undefined,
        // Default to undefined/empty as requested
        height: undefined,
        weight: undefined,
        size: undefined
      };
      setUser(mockUser);
      localStorage.setItem('sc_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, emailOrPhone: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (name && emailOrPhone && password) {
       const newUser: User = {
        id: Date.now().toString(),
        name: name,
        emailOrPhone: emailOrPhone,
        // Default to undefined/empty as requested
        height: undefined,
        weight: undefined,
        size: undefined
       };
       setUser(newUser);
       localStorage.setItem('sc_user', JSON.stringify(newUser));
       return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sc_user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('sc_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
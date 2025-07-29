"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to retrieve any of the possible token keys from localStorage
    const possibleKeys = ['jwt_token', 'token', 'admin_token'];
    for (const key of possibleKeys) {
      const stored = localStorage.getItem(key);
      console.log(stored)
      if (stored) {
        setToken(stored);
        break;
      }
    }
  }, []);

  const login = (jwt: string) => {
    setToken(jwt);
    localStorage.setItem('jwt_token', jwt);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
} 
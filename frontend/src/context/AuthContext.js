// src/context/AuthContext.js
// Global authentication state using React Context

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // True on first load

  // ── Initialize: load user from localStorage ──────────────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem('fnd_user');
    const savedToken = localStorage.getItem('fnd_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('fnd_user');
        localStorage.removeItem('fnd_token');
      }
    }
    setLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;

    localStorage.setItem('fnd_token', token);
    localStorage.setItem('fnd_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    const res = await authAPI.signup({ name, email, password });
    const { token, user: userData } = res.data;

    localStorage.setItem('fnd_token', token);
    localStorage.setItem('fnd_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('fnd_token');
    localStorage.removeItem('fnd_user');
    setUser(null);
  }, []);

  // ── Update user stats locally (after analysis) ───────────────────────────
  const updateStats = useCallback((prediction) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stats: {
          ...prev.stats,
          totalChecks: (prev.stats?.totalChecks || 0) + 1,
          fakeCount:   prediction === 'FAKE' ? (prev.stats?.fakeCount || 0) + 1 : (prev.stats?.fakeCount || 0),
          realCount:   prediction === 'REAL' ? (prev.stats?.realCount || 0) + 1 : (prev.stats?.realCount || 0),
        },
      };
      localStorage.setItem('fnd_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = { user, loading, login, signup, logout, updateStats, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

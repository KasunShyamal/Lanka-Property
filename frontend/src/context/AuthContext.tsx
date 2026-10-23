'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'MODERATOR' | 'AGENT' | 'SELLER' | 'BUYER';
  kyc_status?: string;
  is_verified_agent?: boolean;
  avatar_url?: string;
  agency_name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalMessage: string | null;
  openAuthModal: (tab?: 'login' | 'register', message?: string) => void;
  closeAuthModal: () => void;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  loginWithGoogle: (data: { credential?: string; email?: string; full_name?: string; avatar_url?: string; role?: 'BUYER' | 'SELLER' | 'AGENT'; agency_name?: string }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage
    try {
      const savedToken = localStorage.getItem('lp_token');
      const savedUser = localStorage.getItem('lp_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify in background
        api.getMe()
          .then((profile) => {
            if (profile) {
              setUser(profile);
              localStorage.setItem('lp_user', JSON.stringify(profile));
            }
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('lp_token');
            localStorage.removeItem('lp_user');
            setToken(null);
            setUser(null);
          });
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login', message?: string) => {
    setAuthModalTab(tab);
    setAuthModalMessage(message || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage(null);
  };

  const handleAuthSuccess = (userData: UserProfile, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('lp_token', jwtToken);
    localStorage.setItem('lp_user', JSON.stringify(userData));
    closeAuthModal();

    // If user is Admin, navigate directly to /admin
    if (userData.role === 'SUPER_ADMIN' || userData.role === 'MODERATOR') {
      router.push('/admin');
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.login(credentials);
      if (res && res.user && res.token) {
        handleAuthSuccess(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Invalid response from authentication server' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
    }
  };

  const loginWithGoogle = async (googleData: {
    credential?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: 'BUYER' | 'SELLER' | 'AGENT';
    agency_name?: string;
  }) => {
    try {
      const res = await api.googleLogin(googleData);
      if (res && res.user && res.token) {
        handleAuthSuccess(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Google authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google authentication error' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.register(data);
      if (res && res.user && res.token) {
        handleAuthSuccess(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lp_token');
    localStorage.removeItem('lp_user');
    router.push('/');
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

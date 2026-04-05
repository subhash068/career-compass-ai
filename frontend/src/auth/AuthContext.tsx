import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { authApi, AuthResponse } from '@/api/auth.api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (
    opts: { silent?: boolean; clearOnAuthError?: boolean } = {}
  ) => {
    const { silent = false, clearOnAuthError = true } = opts;
    try {
      const profile = await authApi.getProfile();
      setUser((prev) => ({
        ...(prev || {}),
        ...profile,
      }) as User);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      const status = error?.response?.status;
      if (clearOnAuthError && (status === 401 || status === 404)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }

      // Rehydrate profile after refresh using stored token (avoid stale state closure)
      fetchProfile({ silent: true }).finally(() => setIsLoading(false));
    } else if (storedToken) {
      setToken(storedToken);
      fetchProfile({ silent: true }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data: AuthResponse = await authApi.login({ email, password });
      localStorage.setItem('authToken', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.access_token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      await authApi.register({ email, name, password });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


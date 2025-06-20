'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, getProfileApi, refreshTokenApi, logoutApi } from '../services/auth.service';
import { User, LoginCredentials, ApiError } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Access Token으로 프로필 정보 가져오기 시도
        const profileResponse = await getProfileApi();
        setUser(profileResponse.data.user);
      } catch (error: unknown) {
        // 2. Access Token이 만료되었다면(401), Refresh Token으로 재발급 시도
        const apiError = error as ApiError;
        if (apiError.status === 401) {
          try {
            const refreshResponse = await refreshTokenApi();
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            // 재발급 성공 후 다시 프로필 정보 가져오기
            const newProfileResponse = await getProfileApi();
            setUser(newProfileResponse.data.user);
          } catch (refreshError) {
            // 3. Refresh Token도 만료되었다면 최종 로그아웃 처리
            console.error('Session expired, logging out.', refreshError);
            cleanupAuth();
          }
        } else {
          console.error('Auth initialization failed:', error);
          cleanupAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginApi(credentials);
    localStorage.setItem('accessToken', response.data.accessToken);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed on server, but cleaning up client-side.', error);
    } finally {
      cleanupAuth();
    }
  };

  const cleanupAuth = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  // 로딩 중일 때는 아무것도 렌더링하지 않거나 로딩 스피너를 보여줄 수 있음
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

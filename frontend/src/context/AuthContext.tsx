import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Role } from '../types';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  author_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: Role | null;
  authorId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('bookleaf_token');
    const savedUser = localStorage.getItem('bookleaf_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bookleaf_token');
        localStorage.removeItem('bookleaf_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const response = await api.login({ email, password });
    const authUser: AuthUser = {
      id: response.user_id,
      email: response.email,
      name: response.name,
      role: response.role,
      author_id: response.author_id,
    };

    localStorage.setItem('bookleaf_token', response.access_token);
    localStorage.setItem('bookleaf_user', JSON.stringify(authUser));

    setToken(response.access_token);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('bookleaf_token');
    localStorage.removeItem('bookleaf_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        authorId: user?.author_id || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

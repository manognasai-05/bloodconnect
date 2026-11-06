import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { IUser, IDonor } from '../types.js';

interface AuthContextType {
  user: IUser | null;
  donor: IDonor | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateDonorState: (donor: IDonor) => void;
  updateUserState: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem('bloodconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [donor, setDonor] = useState<IDonor | null>(() => {
    const saved = localStorage.getItem('bloodconnect_donor');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bloodconnect_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('bloodconnect_token');
    if (!currentToken) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setDonor(res.data.donor || null);
      localStorage.setItem('bloodconnect_user', JSON.stringify(res.data.user));
      if (res.data.donor) {
        localStorage.setItem('bloodconnect_donor', JSON.stringify(res.data.donor));
      } else {
        localStorage.removeItem('bloodconnect_donor');
      }
    } catch (err) {
      console.warn('Failed to refresh user credentials');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: loggedUser, donor: loggedDonor } = res.data;

      setToken(receivedToken);
      setUser(loggedUser);
      setDonor(loggedDonor || null);

      localStorage.setItem('bloodconnect_token', receivedToken);
      localStorage.setItem('bloodconnect_user', JSON.stringify(loggedUser));
      if (loggedDonor) {
        localStorage.setItem('bloodconnect_donor', JSON.stringify(loggedDonor));
      } else {
        localStorage.removeItem('bloodconnect_donor');
      }

      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      const { token: receivedToken, user: newUser, donor: newDonor } = res.data;

      setToken(receivedToken);
      setUser(newUser);
      setDonor(newDonor || null);

      localStorage.setItem('bloodconnect_token', receivedToken);
      localStorage.setItem('bloodconnect_user', JSON.stringify(newUser));
      if (newDonor) {
        localStorage.setItem('bloodconnect_donor', JSON.stringify(newDonor));
      }

      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setDonor(null);
    setToken(null);
    localStorage.removeItem('bloodconnect_token');
    localStorage.removeItem('bloodconnect_user');
    localStorage.removeItem('bloodconnect_donor');
  };

  const updateDonorState = (updatedDonor: IDonor) => {
    setDonor(updatedDonor);
    localStorage.setItem('bloodconnect_donor', JSON.stringify(updatedDonor));
  };

  const updateUserState = (updatedUser: IUser) => {
    setUser(updatedUser);
    localStorage.setItem('bloodconnect_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        donor,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateDonorState,
        updateUserState,
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

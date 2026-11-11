import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password, role, rememberMe) => {
    const res = await api.login({ email, password, role, rememberMe });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (studentData) => {
    const res = await api.register(studentData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick switch for reviewer/demo convenience
  const quickLogin = async (roleName) => {
    let email = 'student@university.ac.ke';
    if (roleName === 'lecturer') email = 'john.kamau@university.ac.ke';
    if (roleName === 'admin') email = 'admin@university.ac.ke';

    return await login(email, 'password123', roleName, true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

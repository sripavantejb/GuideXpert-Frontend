import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { adminLogin, getStoredToken, setStoredToken } from '../utils/adminApi';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'guidexpert_admin_user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const isAuthenticated = !!token;

  const login = useCallback(async (username, password) => {
    const result = await adminLogin(username, password);
    if (!result.success) return result;
    const { token: newToken, user: userData } = result.data;
    setStoredToken(newToken);
    setStoredUser(userData);
    setToken(newToken);
    setUser(userData);
    return result;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (!t || !u) {
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = { user, token, isAuthenticated, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

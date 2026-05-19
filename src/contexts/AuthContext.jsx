import { createContext, useState, useCallback, useEffect } from 'react';
import { adminLogin, adminLoginWithPhone, getStoredToken, setStoredToken } from '../utils/adminApi';
import { isJwtExpired } from '../utils/authSession';

export const AuthContext = createContext(null);

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
  const isAuthenticated = !!token && !isJwtExpired(token);

  const applyAuthSession = useCallback((newToken, userData) => {
    setStoredToken(newToken);
    setStoredUser(userData);
    setToken(newToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await adminLogin(username, password);
    if (!result.success) return result;
    const { token: newToken, user: userData } = result.data;
    applyAuthSession(newToken, userData);
    return result;
  }, [applyAuthSession]);

  const loginWithPhone = useCallback(async (phone) => {
    const result = await adminLoginWithPhone(phone);
    if (!result.success) return result;
    const { token: newToken, user: userData } = result.data;
    applyAuthSession(newToken, userData);
    return result;
  }, [applyAuthSession]);

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (!t || !u || isJwtExpired(t)) {
      setStoredToken(null);
      setStoredUser(null);
      queueMicrotask(() => {
        setToken(null);
        setUser(null);
      });
    }
  }, []);

  const value = { user, token, isAuthenticated, login, loginWithPhone, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


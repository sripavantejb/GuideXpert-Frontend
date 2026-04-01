import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isJwtExpired } from '../utils/authSession';

const WEBINAR_TOKEN_KEY = 'guidexpert_webinar_token';
const WEBINAR_USER_KEY = 'guidexpert_webinar_user';

function getWebinarToken() {
  return localStorage.getItem(WEBINAR_TOKEN_KEY);
}

function setWebinarToken(token) {
  if (token) localStorage.setItem(WEBINAR_TOKEN_KEY, token);
  else localStorage.removeItem(WEBINAR_TOKEN_KEY);
}

function getWebinarUser() {
  try {
    const raw = localStorage.getItem(WEBINAR_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setWebinarUser(user) {
  if (user) localStorage.setItem(WEBINAR_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(WEBINAR_USER_KEY);
}

const WebinarAuthContext = createContext(null);

export function WebinarAuthProvider({ children }) {
  const [user, setUser] = useState(() => getWebinarUser());
  const [token, setToken] = useState(() => getWebinarToken());
  const isAuthenticated = !!token && !isJwtExpired(token);

  const setAuthFromVerifyOtp = useCallback((data) => {
    const newToken = data?.token;
    const userData = data?.user;
    if (!newToken || !userData) return;
    setWebinarToken(newToken);
    setWebinarUser(userData);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setWebinarToken(null);
    setWebinarUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getWebinarToken();
    const u = getWebinarUser();
    if (!t || !u || isJwtExpired(t)) {
      setWebinarToken(null);
      setWebinarUser(null);
      queueMicrotask(() => {
        setToken(null);
        setUser(null);
      });
    }
  }, []);

  const value = { user, token, isAuthenticated, setAuthFromVerifyOtp, logout };
  return (
    <WebinarAuthContext.Provider value={value}>
      {children}
    </WebinarAuthContext.Provider>
  );
}

export function useWebinarAuth() {
  const ctx = useContext(WebinarAuthContext);
  if (!ctx) throw new Error('useWebinarAuth must be used within WebinarAuthProvider');
  return ctx;
}

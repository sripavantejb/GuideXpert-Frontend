import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getOocToken,
  getOocUser,
  oocLogin,
  oocMe,
  setOocToken,
  setOocUser,
} from '../utils/oneOnOneCounselorApi';

const OneOnOneCounselorAuthContext = createContext(null);

export function OneOnOneCounselorAuthProvider({ children }) {
  const [user, setUser] = useState(() => getOocUser());
  const [token, setToken] = useState(() => getOocToken());
  const isAuthenticated = !!token;

  const login = useCallback(async (email, password) => {
    const result = await oocLogin(email, password);
    if (!result.success) return { success: false, message: result.message, status: result.status };
    const payload = result.data?.data;
    if (payload?.token) {
      setOocToken(payload.token);
      setOocUser(payload.user);
      setToken(payload.token);
      setUser(payload.user);
    }
    return { success: true, data: payload };
  }, []);

  const logout = useCallback(() => {
    setOocToken(null);
    setOocUser(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await oocMe();
    if (res.success && res.data?.data) {
      setOocUser(res.data.data);
      setUser(res.data.data);
      return { success: true };
    }
    if (res.status === 401) {
      logout();
    }
    return { success: false, message: res.message };
  }, [logout]);

  useEffect(() => {
    const t = getOocToken();
    if (!t) return;
    refreshUser();
  }, [refreshUser]);

  return (
    <OneOnOneCounselorAuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout, refreshUser }}
    >
      {children}
    </OneOnOneCounselorAuthContext.Provider>
  );
}

export function useOneOnOneCounselorAuth() {
  const ctx = useContext(OneOnOneCounselorAuthContext);
  if (!ctx) {
    throw new Error('useOneOnOneCounselorAuth must be used within OneOnOneCounselorAuthProvider');
  }
  return ctx;
}

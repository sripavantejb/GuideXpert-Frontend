import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  counsellorLogin as apiLogin,
  loginWithPhone as apiLoginWithPhone,
  getCounsellorToken,
  setCounsellorToken,
  getCounsellorUser,
  setCounsellorUser,
} from '../utils/counsellorApi';

const CounsellorAuthContext = createContext(null);

export function CounsellorAuthProvider({ children }) {
  const [user, setUser] = useState(() => getCounsellorUser());
  const [token, setToken] = useState(() => getCounsellorToken());
  const isAuthenticated = !!token;

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    if (!result.success) return result;
    const { token: newToken, user: userData } = result.data;
    setCounsellorToken(newToken);
    setCounsellorUser(userData);
    setToken(newToken);
    setUser(userData);
    return result;
  }, []);

  const loginWithPhone = useCallback(async (phone) => {
    const result = await apiLoginWithPhone(phone);
    if (!result.success) return result;
    const { token: newToken, user: userData } = result.data;
    setCounsellorToken(newToken);
    setCounsellorUser(userData);
    setToken(newToken);
    setUser(userData);
    return result;
  }, []);

  /** Set auth from verify-otp response when counsellorLogin was true (same flow as registration: one verify call). */
  const setAuthFromVerifyOtp = useCallback((data) => {
    const newToken = data?.token;
    const userData = data?.user;
    if (!newToken || !userData) return;
    setCounsellorToken(newToken);
    setCounsellorUser(userData);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setCounsellorToken(null);
    setCounsellorUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getCounsellorToken();
    const u = getCounsellorUser();
    if (!t || !u) {
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = { user, token, isAuthenticated, login, loginWithPhone, setAuthFromVerifyOtp, logout };
  return (
    <CounsellorAuthContext.Provider value={value}>
      {children}
    </CounsellorAuthContext.Provider>
  );
}

export function useCounsellorAuth() {
  const ctx = useContext(CounsellorAuthContext);
  if (!ctx) throw new Error('useCounsellorAuth must be used within CounsellorAuthProvider');
  return ctx;
}

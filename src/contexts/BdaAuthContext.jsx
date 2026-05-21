import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  bdaLogin as apiLogin,
  bdaMe,
  getBdaToken,
  getBdaUser,
  setBdaToken,
  setBdaUser,
} from '../utils/bdaApi';

const BdaAuthContext = createContext(null);

export function BdaAuthProvider({ children }) {
  const [user, setUser] = useState(() => getBdaUser());
  const [token, setToken] = useState(() => getBdaToken());
  const isAuthenticated = !!token;

  const login = useCallback(async (loginId, password) => {
    const result = await apiLogin(loginId, password);
    if (!result.success) return result;
    const payload = result.data?.data;
    if (payload?.token) {
      setBdaToken(payload.token);
      setBdaUser(payload.user);
      setToken(payload.token);
      setUser(payload.user);
    }
    return { success: true, data: payload };
  }, []);

  const logout = useCallback(() => {
    setBdaToken(null);
    setBdaUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getBdaToken();
    const u = getBdaUser();
    if (!t || !u) {
      setBdaToken(null);
      setBdaUser(null);
      setToken(null);
      setUser(null);
      return;
    }
    bdaMe().then((res) => {
      if (res.success && res.data?.data) {
        setBdaUser(res.data.data);
        setUser(res.data.data);
      } else if (res.status === 401) {
        setBdaToken(null);
        setBdaUser(null);
        setToken(null);
        setUser(null);
      }
    });
  }, []);

  return (
    <BdaAuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </BdaAuthContext.Provider>
  );
}

export function useBdaAuth() {
  const ctx = useContext(BdaAuthContext);
  if (!ctx) throw new Error('useBdaAuth must be used within BdaAuthProvider');
  return ctx;
}

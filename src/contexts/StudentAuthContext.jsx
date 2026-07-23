import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isJwtExpired } from '../utils/authSession';

const STUDENT_TOKEN_KEY = 'guidexpert_student_token';
const STUDENT_USER_KEY = 'guidexpert_student_user';

function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

function setStudentToken(token) {
  if (token) localStorage.setItem(STUDENT_TOKEN_KEY, token);
  else localStorage.removeItem(STUDENT_TOKEN_KEY);
}

function getStudentUser() {
  try {
    const raw = localStorage.getItem(STUDENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStudentUser(user) {
  if (user) localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(STUDENT_USER_KEY);
}

const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStudentUser());
  const [token, setToken] = useState(() => getStudentToken());
  const isAuthenticated = !!token && !isJwtExpired(token);

  const setAuthFromVerifyOtp = useCallback((data) => {
    const newToken = data?.token;
    const userData = data?.user;
    if (!newToken || !userData) return;
    setStudentToken(newToken);
    setStudentUser(userData);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setStudentToken(null);
    setStudentUser(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = getStudentToken();
    const u = getStudentUser();
    if (!t || !u || isJwtExpired(t)) {
      setStudentToken(null);
      setStudentUser(null);
      queueMicrotask(() => {
        setToken(null);
        setUser(null);
      });
    }
  }, []);

  const value = { user, token, isAuthenticated, setAuthFromVerifyOtp, logout };
  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStudentActivity } from '../utils/api';
import {
  addStudentPrediction,
  clearStudentSession,
  getStudentProfile,
  getStudentSession,
  listStudentPredictions,
  normalizePhone,
  setStudentSession,
  upsertStudentProfile,
} from '../utils/studentProfileStore';

const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getStudentSession());
  const [profile, setProfile] = useState(() => {
    const s = getStudentSession();
    return s ? getStudentProfile(s.phone) : null;
  });
  const [predictions, setPredictions] = useState(() => {
    const s = getStudentSession();
    return s ? listStudentPredictions(s.phone) : [];
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(/** @type {'login' | 'signup'} */ ('login'));
  const [pendingPath, setPendingPath] = useState(/** @type {string | null} */ (null));

  const isAuthenticated = Boolean(session?.phone);

  const refreshFromStore = useCallback((phone) => {
    const key = normalizePhone(phone);
    setProfile(key ? getStudentProfile(key) : null);
    setPredictions(key ? listStudentPredictions(key) : []);
  }, []);

  const openAuthModal = useCallback((mode = 'login', options = {}) => {
    setAuthModalMode(mode === 'signup' ? 'signup' : 'login');
    if (options.pendingPath) setPendingPath(options.pendingPath);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const completeAuth = useCallback(
    (payload) => {
      const phone = normalizePhone(payload.phone);
      const fullName = String(payload.fullName || '').trim();
      const nextSession = setStudentSession({
        phone,
        fullName,
        verifiedAt: new Date().toISOString(),
      });
      const nextProfile = upsertStudentProfile(phone, {
        fullName,
        age: payload.age,
        currentlyStudying: payload.currentlyStudying,
        city: payload.city,
      });
      setSession(nextSession);
      setProfile(nextProfile);
      setPredictions(listStudentPredictions(phone));
      setAuthModalOpen(false);
      const resume = pendingPath;
      setPendingPath(null);
      if (resume) {
        navigate(resume);
      }
      return { session: nextSession, profile: nextProfile, pendingPath: resume };
    },
    [navigate, pendingPath]
  );

  const logout = useCallback(() => {
    clearStudentSession();
    setSession(null);
    setProfile(null);
    setPredictions([]);
  }, []);

  const updateProfile = useCallback(
    (patch) => {
      if (!session?.phone) return null;
      const next = upsertStudentProfile(session.phone, {
        ...profile,
        ...patch,
        fullName: patch.fullName ?? profile?.fullName ?? session.fullName,
      });
      setProfile(next);
      if (patch.fullName) {
        const nextSession = setStudentSession({
          ...session,
          fullName: patch.fullName,
        });
        setSession(nextSession);
      }
      saveStudentActivity(
        session.phone,
        {
          type: 'profile_update',
          tool: 'Profile',
          title: 'Updated student profile',
          summary: [next.age != null ? `age ${next.age}` : null, next.currentlyStudying, next.city]
            .filter(Boolean)
            .join(' · '),
        },
        {
          age: next.age,
          currentlyStudying: next.currentlyStudying,
          city: next.city,
        }
      ).catch(() => {});
      return next;
    },
    [profile, session]
  );

  const savePrediction = useCallback(
    (entry) => {
      if (!session?.phone) return null;
      const item = addStudentPrediction(session.phone, entry);
      setPredictions(listStudentPredictions(session.phone));
      const profileSnap = getStudentProfile(session.phone);
      saveStudentActivity(
        session.phone,
        {
          type: entry.type,
          tool: entry.tool || entry.type,
          title: entry.title,
          summary: entry.summary,
          examId: entry.examId,
          payload: entry.payload,
        },
        profileSnap
          ? {
              age: profileSnap.age,
              currentlyStudying: profileSnap.currentlyStudying,
              city: profileSnap.city,
            }
          : undefined
      ).catch(() => {});
      return item;
    },
    [session]
  );

  const clearPendingPath = useCallback(() => setPendingPath(null), []);

  const value = useMemo(
    () => ({
      session,
      profile,
      predictions,
      isAuthenticated,
      authModalOpen,
      authModalMode,
      pendingPath,
      openAuthModal,
      closeAuthModal,
      completeAuth,
      logout,
      updateProfile,
      savePrediction,
      refreshFromStore,
      clearPendingPath,
      setAuthModalMode,
    }),
    [
      session,
      profile,
      predictions,
      isAuthenticated,
      authModalOpen,
      authModalMode,
      pendingPath,
      openAuthModal,
      closeAuthModal,
      completeAuth,
      logout,
      updateProfile,
      savePrediction,
      refreshFromStore,
      clearPendingPath,
    ]
  );

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth() {
  return useContext(StudentAuthContext);
}

export function useStudentAuthRequired() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}

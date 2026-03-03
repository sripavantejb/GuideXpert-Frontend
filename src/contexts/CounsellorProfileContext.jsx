import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCounsellorAuth } from './CounsellorAuthContext';

const STORAGE_KEY = 'guidexpert_counsellor_profile';

const NOTIFICATION_DEFAULTS = {
  notifyInquiries: true,
  notifySessions: true,
  notifyWeeklyReport: false,
  notifyMarketing: true,
};

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function setStored(profile) {
  if (profile && typeof profile === 'object') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getAuthDerivedProfile(accessForm, user) {
  return {
    displayName: accessForm?.fullName ?? user?.name ?? '',
    email: accessForm?.email ?? '',
    specialization: accessForm?.occupation ?? '',
    phone: accessForm?.phone ?? '',
    slug: '',
  };
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || 'C').toUpperCase();
}

const CounsellorProfileContext = createContext(null);

export function CounsellorProfileProvider({ children }) {
  const { accessForm, user } = useCounsellorAuth();
  const [profile, setProfileState] = useState(() => {
    const stored = getStored();
    if (stored) return { ...NOTIFICATION_DEFAULTS, ...stored };
    return { ...NOTIFICATION_DEFAULTS };
  });

  useEffect(() => {
    const authBase = getAuthDerivedProfile(accessForm, user);
    const stored = getStored();
    const merged = { ...authBase, ...stored };
    const withNotif = { ...NOTIFICATION_DEFAULTS, ...merged };
    setProfileState(withNotif);
    setStored(withNotif);
  }, [accessForm, user]);

  const setProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      setStored(next);
      return next;
    });
  }, []);

  const displayName = profile.displayName || accessForm?.fullName || user?.name || 'Counsellor';
  const email = profile.email ?? accessForm?.email ?? '';
  const specialization = profile.specialization ?? accessForm?.occupation ?? '';

  const value = {
    profile,
    accessForm,
    displayName,
    email,
    specialization,
    phone: profile.phone ?? '',
    slug: profile.slug ?? '',
    initials: getInitials(displayName),
    setProfile,
    notifyInquiries: profile.notifyInquiries ?? NOTIFICATION_DEFAULTS.notifyInquiries,
    notifySessions: profile.notifySessions ?? NOTIFICATION_DEFAULTS.notifySessions,
    notifyWeeklyReport: profile.notifyWeeklyReport ?? NOTIFICATION_DEFAULTS.notifyWeeklyReport,
    notifyMarketing: profile.notifyMarketing ?? NOTIFICATION_DEFAULTS.notifyMarketing,
  };

  return (
    <CounsellorProfileContext.Provider value={value}>
      {children}
    </CounsellorProfileContext.Provider>
  );
}

export function useCounsellorProfile() {
  const ctx = useContext(CounsellorProfileContext);
  if (!ctx) throw new Error('useCounsellorProfile must be used within CounsellorProfileProvider');
  return ctx;
}

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'guidexpert_counsellor_profile';

const defaults = {
  displayName: 'Dr. Counsellor',
  email: 'counsellor@guidexpert.com',
  specialization: 'Career & Education Counseling',
  phone: '+91 98765 43210',
  slug: 'tej123',
};

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function setStored(profile) {
  if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(STORAGE_KEY);
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'DC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || 'DC').toUpperCase();
}

const CounsellorProfileContext = createContext(null);

export function CounsellorProfileProvider({ children }) {
  const [profile, setProfileState] = useState(getStored);

  const setProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      setStored(next);
      return next;
    });
  }, []);

  const value = {
    profile,
    displayName: profile.displayName,
    email: profile.email,
    specialization: profile.specialization,
    phone: profile.phone,
    slug: profile.slug,
    initials: getInitials(profile.displayName),
    setProfile,
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

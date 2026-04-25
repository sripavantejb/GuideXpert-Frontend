import { useEffect, useMemo, useState } from 'react';
import { useCounsellorAuth } from '../contexts/CounsellorAuthContext';

const STORAGE_KEY = 'guidexpert_counsellor_profile';

function to10Digits(val) {
  if (val == null) return '';
  return String(val).replace(/\D/g, '').trim().slice(0, 10);
}

function readStoredProfile() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** Resolve the counsellor identity used by every marketing poster page.
 *  - Display values come from Settings if the counsellor edited them, else from the activation form.
 *  - Validation always uses the activation-form phone so eligibility is decided by training records, not Settings overrides.
 *  - Reads localStorage directly so it works on public poster routes that live outside CounsellorProfileProvider. */
export function usePosterIdentity() {
  const { accessForm } = useCounsellorAuth();
  const [storedProfile, setStoredProfile] = useState(() => readStoredProfile());

  useEffect(() => {
    function handle(e) {
      if (e && typeof e === 'object' && 'key' in e && e.key && e.key !== STORAGE_KEY) return;
      setStoredProfile(readStoredProfile());
    }
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('storage', handle);
    window.addEventListener('focus', handle);
    return () => {
      window.removeEventListener('storage', handle);
      window.removeEventListener('focus', handle);
    };
  }, []);

  return useMemo(() => {
    const activationName = (accessForm?.fullName || '').trim();
    const activationPhone = to10Digits(accessForm?.phone || '');
    const settingsName = (storedProfile?.displayName || '').trim();
    const settingsPhone = to10Digits(storedProfile?.phone || '');

    const displayName = settingsName || activationName;
    const displayPhone = settingsPhone || activationPhone;

    const usedSettingsName = !!settingsName && settingsName !== activationName;
    const usedSettingsPhone = !!settingsPhone && settingsPhone !== activationPhone;

    return {
      displayName,
      displayPhone,
      validationPhone: activationPhone,
      activationName,
      activationPhone,
      hasActivation: activationPhone.length === 10,
      hasIdentity: Boolean(displayName) && displayPhone.length === 10,
      usedSettingsOverride: usedSettingsName || usedSettingsPhone,
    };
  }, [accessForm, storedProfile]);
}

export { to10Digits };

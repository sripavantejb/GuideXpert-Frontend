import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudentAuthRequired } from '../../contexts/StudentAuthContext';

/**
 * Soft auth wrapper: pages stay visible; login is enforced at action time via
 * useRequireLoginToUse().
 */
export default function RequireStudentAuth({ children }) {
  return children;
}

/**
 * Call at the start of predict / submit / start-test handlers.
 * @returns {boolean} true if the user may continue; false if the side login popup was opened
 */
export function useRequireLoginToUse() {
  const { isAuthenticated, openAuthModal } = useStudentAuthRequired();
  const location = useLocation();

  return useCallback(() => {
    if (isAuthenticated) return true;
    openAuthModal('login', {
      pendingPath: `${location.pathname}${location.search || ''}`,
    });
    return false;
  }, [isAuthenticated, openAuthModal, location.pathname, location.search]);
}

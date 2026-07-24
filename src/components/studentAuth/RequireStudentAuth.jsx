import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudentAuthRequired } from '../../contexts/StudentAuthContext';
import { swBtnPrimary, swBtnSecondary } from '../../pages/studentsTools/components/studentWorkspaceUi';

/**
 * Gates student tool pages: opens login popup if not authenticated.
 */
export default function RequireStudentAuth({ children, title = 'Login required' }) {
  const { isAuthenticated, openAuthModal, authModalOpen } = useStudentAuthRequired();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !authModalOpen) {
      openAuthModal('login', { pendingPath: location.pathname });
    }
  }, [isAuthenticated, authModalOpen, openAuthModal, location.pathname]);

  if (isAuthenticated) return children;

  return (
    <div className="student-tool-page-shell flex flex-1 flex-col items-center justify-center px-5 py-20">
      <div className="w-full max-w-md border border-[#d0d7e1] border-l-[3px] border-l-[#f27921] bg-white p-8 text-center shadow-[0_18px_40px_-28px_rgba(0,0,0,0.25)]">
        <p className="font-sw-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f27921]">
          GuideXpert
        </p>
        <h1 className="mt-3 font-sw-display text-2xl font-bold text-[#041e30]">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5a6570]">
          Sign up or login to use this tool. Your predictions will be saved to your profile.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className={`${swBtnPrimary} sm:w-auto`}
            onClick={() => openAuthModal('login', { pendingPath: location.pathname })}
          >
            Login
          </button>
          <button
            type="button"
            className={`${swBtnSecondary} sm:w-auto`}
            onClick={() => openAuthModal('signup', { pendingPath: location.pathname })}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

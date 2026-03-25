import { NavLink } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';

/**
 * Single sidebar entry for training. Full module list, progress, certificate, and
 * webinar link live on /counsellor/training.
 */
export default function TrainingSidebar({ onCloseSidebar }) {
  return (
    <div>
      <p className="px-3 mb-2 text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider">
        Counsellor Training
      </p>
      <NavLink
        to="/counsellor/training"
        onClick={() => onCloseSidebar?.()}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.8125rem] font-medium transition-all duration-200 w-full ${
            isActive
              ? 'bg-primary-navy/90 text-white shadow-[inset_3px_0_0_0_#4d8ec7]'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`
        }
      >
        <FiBookOpen className="w-4.5 h-4.5 shrink-0 opacity-90" aria-hidden />
        <span>Training</span>
      </NavLink>
    </div>
  );
}

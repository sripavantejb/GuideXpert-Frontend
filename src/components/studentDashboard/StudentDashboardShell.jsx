import { Link } from 'react-router-dom';
import DecorBackdrop from './DecorBackdrop';

export default function StudentDashboardShell({ children }) {
  return (
    <div className="student-dashboard relative min-h-screen overflow-x-hidden">
      <DecorBackdrop />
      <header className="relative z-10 border-b-2 border-black bg-[#0F172A]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="sd-font-display text-lg font-extrabold tracking-tight text-white transition hover:text-[#C7F36B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7E5FF]"
          >
            GuideXpert
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              to="/blogs"
              className="font-medium text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7E5FF]"
            >
              Blogs
            </Link>
            <a
              href="#tool-grid"
              className="rounded-lg border-2 border-white/20 bg-white/5 px-3 py-1.5 font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7E5FF]"
            >
              Tools
            </a>
          </nav>
        </div>
      </header>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

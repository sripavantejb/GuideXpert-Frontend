import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';

const LOGO_URL =
  'https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png';

const workspaceLinks = [
  { label: 'Dashboard', to: '/students' },
  { label: 'Predictors', to: '/students/predictors' },
  { label: 'Fit Tests', to: '/students/tests' },
  { label: 'Compare Colleges', to: '/students/college-comparison' },
];

const siteLinks = [
  { label: 'GuideXpert home', to: '/' },
  { label: 'Blogs', to: '/blogs' },
];

const linkClass =
  'text-sm font-bold text-slate-300 transition hover:text-[#C7F36B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] rounded';

export default function StudentWorkspaceFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t-[6px] border-[#0F172A] bg-[#0F172A] text-slate-300"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:gap-16">
          <div className="md:max-w-sm">
            <Link
              to="/students"
              className="mb-5 inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
              aria-label="Student workspace home"
            >
              <span className="inline-flex rounded-lg border-2 border-[#0F172A] bg-white px-3 py-2 shadow-[4px_4px_0_0_#C7F36B]">
                <img src={LOGO_URL} alt="" className="h-7 object-contain md:h-8" />
              </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-slate-400">
              Predictors and fit tools to plan admissions with clarity. Results are indicative—always confirm with
              official notices and cutoffs.
            </p>
          </div>

          <div>
            <h2 className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C7F36B]">
              Workspace
            </h2>
            <ul className="space-y-3" role="list">
              {workspaceLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C7F36B]">
              More
            </h2>
            <ul className="mb-8 space-y-3" role="list">
              {siteLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/counsellor/login" className={linkClass}>
                  Counselor login
                </Link>
              </li>
            </ul>
            <div className="rounded-[12px] border-2 border-white/15 bg-[#1E293B]/80 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.35)]">
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <FiMail className="h-3.5 w-3.5 text-[#C7F36B]" aria-hidden />
                Support
              </p>
              <a
                href="mailto:support@guidexpert.co.in"
                className="text-sm font-bold text-white underline decoration-[#C7F36B]/50 underline-offset-2 transition hover:text-[#C7F36B] hover:decoration-[#C7F36B]"
              >
                support@guidexpert.co.in
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} GuideXpert. All rights reserved.
          </p>
          <p className="text-xs font-medium text-slate-500 md:text-right">
            Tools are for planning guidance only—not a substitute for official exam or college communications.
          </p>
        </div>
      </div>
    </footer>
  );
}

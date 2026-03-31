import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';

const cardClassName =
  'group relative flex min-h-[106px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-4 py-4 sm:px-5 shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#003366]/35 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]/25';

const COLLEGE_LOGOS = {
  niat: '/college-info/niat-logo.svg',
};

function CollegeCardContent({ college }) {
  const logoSrc = COLLEGE_LOGOS[college.slug];
  const partnerTag = college.slug === 'niat' ? 'Official partner' : 'Partner college';

  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-[#003366]/0 via-[#003366]/45 to-[#003366]/0 opacity-75 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-24 w-24 rounded-full bg-[#003366]/5 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
      />
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(15,23,42,0.06)]">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${college.name} logo`}
              className="max-h-full max-w-full object-contain saturate-[1.02]"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-semibold tracking-wide text-slate-600">
              {String(college.name).slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{college.name}</h4>
            <span className="inline-flex shrink-0 items-center rounded-full border border-[#003366]/15 bg-[#003366]/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#003366]">
              {partnerTag}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-slate-600">
            {college.location || 'Detailed profile and referral information'}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 transition-colors duration-300 group-hover:text-[#003366]/75">
            Explore college details
          </p>
        </div>
      </div>
      <FiChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#003366]" />
    </>
  );
}

export default function CollegeReferrals() {
  const location = useLocation();
  const isKnowAboutColleges = location.pathname.startsWith('/counsellor/know-about-colleges');

  return (
    <div className="max-w-7xl mx-auto">
      {!isKnowAboutColleges && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
              College Referrals
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Start referring students to your preferred colleges and earn rewards.
            </p>
          </div>
        </div>
      )}

      {COLLEGES.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500">No partner colleges configured yet.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isKnowAboutColleges ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {COLLEGES.map((college) => {
            const openInternalKnowAboutCollege = isKnowAboutColleges && college.slug === 'niat';

            if (openInternalKnowAboutCollege) {
              return (
                <Link
                  key={college.slug}
                  to={`/counsellor/know-about-colleges/${college.slug}`}
                  className={cardClassName}
                >
                  <CollegeCardContent college={college} />
                </Link>
              );
            }

            return college.externalUrl ? (
              <a
                key={college.slug}
                href={college.externalUrl}
                rel="noopener noreferrer"
                target="_blank"
                className={cardClassName}
              >
                <CollegeCardContent college={college} />
              </a>
            ) : (
              <Link
                key={college.slug}
                to={`/counsellor/college-referrals/${college.slug}`}
                className={cardClassName}
              >
                <CollegeCardContent college={college} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

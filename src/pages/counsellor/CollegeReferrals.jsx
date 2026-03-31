import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';

const cardClassName =
  'group relative overflow-hidden rounded-[28px] border-[6px] border-[#1f2430] bg-[#1f2430] shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]/25';

const COLLEGE_LOGOS = {
  niat: '/college-info/niat-logo.svg',
};

function CollegeCardContent({ college }) {
  const logoSrc = COLLEGE_LOGOS[college.slug];

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[20px] bg-[#f8fafc] p-4 sm:p-5">
        <div className="flex min-h-[170px] items-center justify-center rounded-[16px] border border-slate-200/80 bg-white p-5">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${college.name} logo`}
              className="h-16 w-auto object-contain sm:h-20"
              loading="lazy"
            />
          ) : (
            <span className="text-xl font-semibold tracking-wide text-slate-700">{college.name}</span>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <div className="min-w-0">
          <h4 className="truncate text-2xl font-semibold tracking-tight text-white">{college.name}</h4>
          <p className="mt-1 truncate text-sm text-slate-300">Official partner college</p>
        </div>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#1f2430] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-transform duration-300 group-hover:scale-105">
          <FiChevronRight className="h-7 w-7" />
        </span>
      </div>
    </div>
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

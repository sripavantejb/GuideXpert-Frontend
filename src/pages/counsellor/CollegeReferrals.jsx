import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';

const cardClassName =
  'group relative overflow-hidden rounded-[20px] border border-[#003366]/25 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#003366]/45 hover:shadow-[0_14px_26px_rgba(15,23,42,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003366]/25';

const COLLEGE_LOGOS = {
  niat: '/college-info/niat-logo.svg',
};

function CollegeCardContent({ college }) {
  const logoSrc = COLLEGE_LOGOS[college.slug];

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[16px] bg-[#003366]/5 p-3 sm:p-3.5">
        <div className="flex min-h-[126px] items-center justify-center rounded-[12px] border border-[#003366]/15 bg-white p-3.5">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${college.name} logo`}
              className="h-12 w-auto object-contain sm:h-14"
              loading="lazy"
            />
          ) : (
            <span className="text-base font-semibold tracking-wide text-slate-700">{college.name}</span>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2.5 bg-[#003366] px-3 pb-3 pt-2 sm:px-3.5 sm:pb-3.5">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold tracking-tight text-white">{college.name}</h4>
          <p className="mt-0.5 truncate text-[11px] text-blue-100">Official partner college</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#003366] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-transform duration-300 group-hover:scale-105">
          <FiChevronRight className="h-5 w-5" />
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

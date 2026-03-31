import { Link, useLocation, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';
 

export default function CollegeReferralDetail() {
  const { collegeSlug } = useParams();
  const location = useLocation();

  const college = COLLEGES.find((c) => c.slug === collegeSlug);
  const isNiat = college?.slug === 'niat';
  const fromKnowAboutColleges = location.pathname.startsWith('/counsellor/know-about-colleges/');
  const backPath = fromKnowAboutColleges ? '/counsellor/know-about-colleges' : '/counsellor/college-referrals';
  const backLabel = fromKnowAboutColleges ? 'Know About Colleges' : 'College Referrals';

  if (!college) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-4">College not found.</p>
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#003366] hover:underline"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003366] mb-5"
      >
        <FiArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
            <img
              src="/college-info/niat-logo.svg"
              alt={`${college.name} logo`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ color: '#003366' }}>
              {college.name}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Partner college overview and referral information
            </p>
          </div>
        </div>
        {college.location ? (
          <p className="text-sm text-gray-500 mt-3">{college.location}</p>
        ) : null}
      </div>

      {isNiat && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 tracking-tight" style={{ color: '#003366' }}>
            NIAT Fee Range
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Reference sheet for NIAT upskilling program fee ranges across universities.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
            <img
              src="/college-info/niat-university-fee-range.svg"
              alt="NIAT University fee range chart by state, city, and course fee"
              loading="lazy"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

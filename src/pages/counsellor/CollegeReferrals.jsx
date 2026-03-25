import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';

const cardClassName =
  'bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group flex items-center justify-between';

export default function CollegeReferrals() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            College Referrals
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select NIAT to open the rewards portal
          </p>
        </div>
      </div>

      {COLLEGES.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500">No partner colleges configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLLEGES.map((college) =>
            college.externalUrl ? (
              <a
                key={college.slug}
                href={college.externalUrl}
                rel="noopener noreferrer"
                className={cardClassName}
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{college.name}</h4>
                  <p className="text-xs text-gray-500">{college.location}</p>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#003366] group-hover:translate-x-0.5 transition-all" />
              </a>
            ) : (
              <Link
                key={college.slug}
                to={`/counsellor/college-referrals/${college.slug}`}
                className={cardClassName}
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{college.name}</h4>
                  <p className="text-xs text-gray-500">{college.location}</p>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#003366] group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

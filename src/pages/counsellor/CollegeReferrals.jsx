import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

export const COLLEGES = [
  { slug: 'iit-delhi', name: 'IIT Delhi', location: 'New Delhi' },
  { slug: 'aiims-delhi', name: 'AIIMS Delhi', location: 'New Delhi' },
  { slug: 'srcc', name: 'SRCC', location: 'New Delhi' },
  { slug: 'bits-pilani', name: 'BITS Pilani', location: 'Rajasthan' },
  { slug: 'nid-ahmedabad', name: 'NID Ahmedabad', location: 'Ahmedabad' },
  { slug: 'du-north-campus', name: 'DU North Campus', location: 'New Delhi' },
  { slug: 'iit-bombay', name: 'IIT Bombay', location: 'Mumbai' },
  { slug: 'xlri-jamshedpur', name: 'XLRI Jamshedpur', location: 'Jamshedpur' },
];

export default function CollegeReferrals() {
  const [search, setSearch] = useState('');

  const filteredColleges = useMemo(() => {
    if (!search.trim()) return COLLEGES;
    const q = search.toLowerCase().trim();
    return COLLEGES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
            College Referrals
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a college to view and share your referral link
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredColleges.map((college) => (
          <Link
            key={college.slug}
            to={`/counsellor/college-referrals/${college.slug}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow group flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{college.name}</h4>
              <p className="text-xs text-gray-500">{college.location}</p>
            </div>
            <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#003366] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {filteredColleges.length === 0 && (
        <div className="text-center py-12 text-gray-500">No colleges match your search.</div>
      )}
    </div>
  );
}

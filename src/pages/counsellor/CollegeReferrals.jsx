import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import { COLLEGES } from '../../data/collegeReferrals';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'location', label: 'Location (A–Z)' },
];

export default function CollegeReferrals() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [locationFilter, setLocationFilter] = useState('');

  const locations = useMemo(() => {
    const set = new Set(COLLEGES.map((c) => c.location).filter(Boolean));
    return [...set].sort();
  }, []);

  const filteredAndSortedColleges = useMemo(() => {
    let list = COLLEGES;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || (c.location && c.location.toLowerCase().includes(q))
      );
    }
    if (locationFilter) {
      list = list.filter((c) => c.location === locationFilter);
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'location') {
        return (a.location || '').localeCompare(b.location || '');
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    return list;
  }, [search, sortBy, locationFilter]);

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
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {COLLEGES.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500">No partner colleges configured yet.</p>
        </div>
      ) : filteredAndSortedColleges.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No colleges match your search or filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAndSortedColleges.map((college) => (
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
      )}
    </div>
  );
}

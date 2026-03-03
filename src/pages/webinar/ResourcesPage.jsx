import { useState, useMemo } from 'react';
import { FiBook, FiFolder } from 'react-icons/fi';
import { RESOURCES } from './data/mockWebinarData';
import ResourceCard from './components/ResourceCard';

const CATEGORIES = ['All', 'Compliance', 'Policy', 'Onboarding', 'Handouts'];

function getCategoryCount(resources, category) {
  if (category === 'All') return resources.length;
  return resources.filter((r) => r.category === category).length;
}

export default function ResourcesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = RESOURCES;
    if (category !== 'All') list = list.filter((r) => r.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.description && String(r.description).toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [category, search]);

  const counts = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      key: cat,
      count: getCategoryCount(RESOURCES, cat),
    }));
  }, []);

  const clearFilters = () => {
    setCategory('All');
    setSearch('');
  };

  const hasActiveFilters = category !== 'All' || search.trim() !== '';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 xl:gap-10">
        <div className="min-w-0 flex flex-col">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-gray-900 tracking-tight">
              Resources
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Downloads, links, and materials for your training.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap mb-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const item = counts.find((c) => c.key === cat);
                const count = item?.count ?? 0;
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 ${
                      active
                        ? 'bg-primary-navy text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                    {count > 0 && (
                      <span className={`ml-1.5 ${active ? 'text-white/90' : 'text-gray-500'}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="flex-1 min-w-0 max-w-full sm:max-w-[400px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white"
              aria-label="Search resources"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[20px] bg-gray-50/80 border border-gray-200 p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary-navy/10 flex items-center justify-center mb-5">
                <FiBook className="w-10 h-10 text-primary-navy" aria-hidden />
              </div>
              <p className="text-gray-800 font-semibold text-lg">No resources match your filters</p>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Try a different category or search term.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-primary-navy text-white hover:bg-primary-navy/90 transition-all duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
              {filtered.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-6 flex flex-col gap-6">
            <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <FiBook className="w-4 h-4 text-primary-navy" />
                Quick stats
              </h2>
              <p className="text-2xl font-bold text-gray-900">{RESOURCES.length}</p>
              <p className="text-sm text-gray-500">Total resources</p>
            </section>
            <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <FiFolder className="w-4 h-4 text-primary-navy" />
                By category
              </h2>
              <ul className="space-y-2">
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                  const item = counts.find((c) => c.key === cat);
                  const count = item?.count ?? 0;
                  const active = category === cat;
                  return (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/50 ${
                          active ? 'bg-primary-navy/10 text-primary-navy' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                        <span className="float-right text-gray-500">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

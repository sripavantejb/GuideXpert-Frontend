import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { HOME_TAGLINE, HOME_SUBTITLE, POPULAR_PREDICTORS, HOME_BANNERS } from './careers360/careers360HomeData';
import { LAYOUT } from './careers360/careers360Theme';
import CollegeCampusImage from './landing/CollegeCampusImage';

function HeroBannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % HOME_BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-6 sm:mt-7">
      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        <Link to={HOME_BANNERS[index].to} className="group block">
          <div className="relative aspect-[4.5/1] w-full overflow-hidden bg-[#eef2f7] sm:aspect-[5/1]">
            <CollegeCampusImage
              id={HOME_BANNERS[index].id}
              name={HOME_BANNERS[index].title}
              src={HOME_BANNERS[index].image}
              className="h-full w-full transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <p className="text-base font-bold text-white sm:text-lg">{HOME_BANNERS[index].title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/90 sm:text-sm">{HOME_BANNERS[index].subtitle}</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {HOME_BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Show ${b.title}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-[#f27921]' : 'w-1.5 bg-[#ccc] hover:bg-[#aaa]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function StudentsDashboardHero({
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  suggestions,
  showSuggestions,
  onSuggestionPick,
  onClearSearch,
}) {
  const trending = POPULAR_PREDICTORS.filter((p) => p.trending).slice(0, 2);
  const otherLinks = POPULAR_PREDICTORS.filter((p) => !trending.includes(p));

  return (
    <section className="-mt-4 border-b border-[#e8eaed] sm:-mt-5" style={{ backgroundColor: '#eef2f7' }}>
      <div className={`${LAYOUT.container} pb-8 sm:pb-10`}>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mt-0 text-2xl font-bold tracking-tight text-[#333] sm:text-[1.75rem] lg:text-3xl lg:leading-tight">
            {HOME_TAGLINE}
          </h1>
          <p className="mt-2 text-sm leading-snug text-[#666]">{HOME_SUBTITLE}</p>
        </div>

        <div className="relative mx-auto mt-5 max-w-xl sm:mt-6">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999]" />
          <input
            type="search"
            value={searchTerm}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search predictors, colleges, and tools"
            aria-label="Search predictors, colleges, and tools"
            className="w-full rounded-lg border border-[#d1d5db] bg-white py-3 pl-12 pr-12 text-sm text-[#333] shadow-sm placeholder:text-[#999] focus:border-[#f27921] focus:outline-none focus:ring-2 focus:ring-[#f27921]/20 sm:text-base"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555]"
              aria-label="Clear search"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
          {showSuggestions && suggestions.length > 0 ? (
            <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg">
              {suggestions.map((sug) => (
                <li key={sug}>
                  <button
                    type="button"
                    onMouseDown={() => onSuggestionPick(sug)}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#444] hover:bg-[#fff4ed]"
                  >
                    {sug}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {trending.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#333] hover:text-[#f27921]"
            >
              {item.label}
              <span className="rounded bg-[#f27921] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white">
                trending
              </span>
            </Link>
          ))}
          {otherLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm text-[#555] hover:text-[#f27921] hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <HeroBannerCarousel />
      </div>
    </section>
  );
}

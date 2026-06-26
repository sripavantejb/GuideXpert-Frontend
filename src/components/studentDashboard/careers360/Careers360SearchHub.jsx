import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuX } from 'react-icons/lu';
import { HOME_TAGLINE, POPULAR_PREDICTORS, HOME_BANNERS } from './careers360HomeData';

export default function Careers360SearchHub({
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  suggestions,
  showSuggestions,
  onSuggestionPick,
  onClearSearch,
}) {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{HOME_TAGLINE}</h2>

        <div className="relative mx-auto mt-6 max-w-2xl">
          <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search colleges, exams, predictors & tests…"
            aria-label="Search tools"
            className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <LuX className="h-5 w-5" />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {suggestions.map((sug) => (
                <li key={sug}>
                  <button
                    type="button"
                    onMouseDown={() => onSuggestionPick(sug)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {sug}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {POPULAR_PREDICTORS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {item.label}
              {item.popular ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Popular
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Careers360BannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % HOME_BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const banner = HOME_BANNERS[index];

  return (
    <section className="border-b border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to={banner.to}
          className={`group relative block overflow-hidden rounded-xl bg-gradient-to-r ${banner.gradient} px-6 py-10 sm:px-10 sm:py-12`}
        >
          <div className="relative z-10 max-w-xl">
            <h3 className="text-xl font-bold text-white sm:text-2xl">{banner.title}</h3>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">{banner.subtitle}</p>
            <span className="mt-5 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-emerald-400">
              {banner.cta}
            </span>
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden
          />
        </Link>
        <div className="mt-3 flex justify-center gap-2">
          {HOME_BANNERS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiSearch, FiX } from 'react-icons/fi';
import {
  HOME_TAGLINE,
  HERO_FEATURE_SLIDES,
  POPULAR_PREDICTORS,
} from './careers360/careers360HomeData';
import { LAYOUT } from './careers360/careers360Theme';

function FeatureSlideDecor({ badge, widget }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#f27921]/15 blur-3xl" />
      <div className="absolute right-6 top-5 flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-md sm:right-8 sm:top-7">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/90 text-[#0f172a]">
          <FiCheck className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
        {badge}
      </div>
      <div className="absolute bottom-16 right-5 hidden w-[7.5rem] rounded-xl border border-white/15 bg-white/10 p-2.5 shadow-xl backdrop-blur-md sm:block sm:right-8 sm:bottom-20">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{widget}</p>
        <div className="mt-2 flex h-10 items-end gap-1 px-0.5">
          {[40, 65, 48, 80, 55, 90].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm bg-sky-300/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <svg
        className="absolute bottom-8 right-[40%] h-16 w-16 text-white/10 sm:h-20 sm:w-20"
        viewBox="0 0 64 64"
        fill="none"
      >
        <path
          d="M12 44c8-2 14-14 20-22 6-8 12-14 20-16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M44 8h8v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function HeroFeatureCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_FEATURE_SLIDES.length), 4800);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_FEATURE_SLIDES[index];

  return (
    <div className="relative w-full">
      <div
        className={`relative min-h-[240px] overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg sm:min-h-[280px] sm:p-8 lg:min-h-[300px] ${slide.accent}`}
      >
        <FeatureSlideDecor badge={slide.badge} widget={slide.widget} />
        <div className="relative z-10 flex h-full max-w-[17.5rem] flex-col justify-between sm:max-w-xs">
          <div>
            <h2 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
              {slide.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{slide.description}</p>
          </div>
          <Link
            to={slide.to}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#f27921] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#e06810]"
          >
            {slide.cta}
            <FiArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="mt-3.5 flex justify-center gap-2">
        {HERO_FEATURE_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show ${s.title}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-[#f27921]' : 'w-1.5 bg-[#c5c9d4] hover:bg-[#a8adb8]'
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
  const popular = POPULAR_PREDICTORS.filter((p) => p.popular).slice(0, 2);

  return (
    <section
      className="border-b border-[#e8eaed]"
      style={{
        background:
          'linear-gradient(165deg, #f3f0f8 0%, #eef1f8 42%, #f7f8fc 72%, #ffffff 100%)',
      }}
    >
      <div className={`${LAYOUT.container} py-8 sm:py-10 lg:py-12`}>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <h1 className="max-w-md text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
              {HOME_TAGLINE.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="block sm:inline">{HOME_TAGLINE.split(' ').slice(2).join(' ')}</span>
            </h1>

            <div className="relative mt-6 max-w-lg sm:mt-7">
              <input
                type="search"
                value={searchTerm}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Colleges, Exams, Courses & more"
                aria-label="Search Colleges, Exams, Courses & more"
                className="w-full rounded-full border border-[#d8dce6] bg-white py-3.5 pl-5 pr-12 text-sm text-[#333] shadow-[0_2px_12px_rgba(30,40,80,0.06)] placeholder:text-[#9aa0ae] focus:border-[#f27921] focus:outline-none focus:ring-2 focus:ring-[#f27921]/20 sm:text-[15px]"
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
              ) : (
                <FiSearch className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b90a0]" />
              )}
              {showSuggestions && suggestions.length > 0 ? (
                <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white py-1 shadow-lg">
                  {suggestions.map((sug) => (
                    <li key={sug}>
                      <button
                        type="button"
                        onMouseDown={() => onSuggestionPick(sug)}
                        className="w-full px-5 py-2.5 text-left text-sm text-[#444] hover:bg-[#fff4ed]"
                      >
                        {sug}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              {popular.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="relative mt-2 inline-flex items-center rounded-full border border-[#d8dce6] bg-white px-4 py-2 text-sm font-medium text-[#333] shadow-sm transition hover:border-[#f27921]/50 hover:text-[#f27921]"
                >
                  <span className="absolute -top-2 left-3 rounded bg-[#f27921] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-xl">
            <HeroFeatureCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

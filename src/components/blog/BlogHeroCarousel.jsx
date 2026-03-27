import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_MS = 5000;

function getSlides(blogs) {
  if (!Array.isArray(blogs)) return [];
  return blogs.filter((blog) => (blog?.coverImage || blog?.image) && blog?.title).slice(0, 5);
}

export default function BlogHeroCarousel({ blogs = [] }) {
  const slides = useMemo(() => getSlides(blogs), [blogs]);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef(null);

  const resetAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (slides.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  const goTo = (idx) => {
    setActiveIndex(idx);
    resetAutoplay();
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    resetAutoplay();
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
    resetAutoplay();
  };

  if (!slides.length) {
    return (
      <section className="relative overflow-hidden rounded-2xl bg-slate-200/80 ring-1 ring-slate-200">
        <div className="aspect-[21/9] min-h-[260px] w-full animate-pulse bg-slate-300/80" />
      </section>
    );
  }

  const active = slides[activeIndex];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div className="relative aspect-[21/9] min-h-[260px] w-full md:min-h-[360px]">
        {slides.map((slide, idx) => (
          <img
            key={slide.id || slide.slug || idx}
            src={slide.coverImage || slide.image}
            alt={slide.title}
            loading={idx === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              idx === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-slate-900/60" />

        <div className="absolute inset-0 flex items-center px-6 py-6 sm:px-8 md:px-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl drop-shadow">{active.title}</h2>
            <Link
              to={`/blogs/${active.id}`}
              className="mt-5 inline-flex items-center rounded-full border border-white/80 bg-white/85 px-5 py-2 text-sm font-semibold text-slate-900 backdrop-blur transition hover:bg-white"
            >
              Read More
            </Link>
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 ring-1 ring-slate-300 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 ring-1 ring-slate-300 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label="Next slide"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex ? 'w-6 bg-emerald-700' : 'w-2.5 bg-white/80 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

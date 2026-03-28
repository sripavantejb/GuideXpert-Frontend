import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_MS = 6000;

function getSlides(blogs) {
  if (!Array.isArray(blogs)) return [];
  // Return blogs with images, top 5.
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
      <section className="relative overflow-hidden rounded-[18px] bg-slate-100 ring-1 ring-slate-200">
        <div className="flex min-h-[400px] w-full animate-pulse flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-8 md:p-12 space-y-4">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-10 w-full rounded bg-slate-200" />
            <div className="h-10 w-3/4 rounded bg-slate-200" />
            <div className="h-20 w-full rounded bg-slate-200 mt-4" />
          </div>
          <div className="w-full md:w-1/2 bg-slate-200/80" />
        </div>
      </section>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-white ring-1 ring-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="relative flex min-h-[220px] w-full flex-col md:flex-row md:min-h-[280px]">
        {/* Left Side: Content */}
        <div className="relative z-10 flex w-full flex-col justify-center bg-white p-6 md:w-[50%] md:p-8 lg:p-10">
          <div className="grid">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={slide.id || slide.slug || idx}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 transition-all duration-700 ease-in-out ${
                    isActive ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 z-0 pointer-events-none'
                  }`}
                >
                  <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 mb-6 text-[11px] font-bold uppercase tracking-wider text-slate-800 ring-1 ring-slate-200 font-santhosi">
                    {slide.category || 'Featured Story'}
                  </div>
                  <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl lg:text-4xl font-satoshi">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed md:text-base">
                      {slide.subtitle}
                    </p>
                  )}
                  <Link
                    to={`/blogs/${slide.id}`}
                    className="group mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    Read More
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Controls below content on desktop, overlay on image for mobile? No, put them in bottom left */}
          {slides.length > 1 && (
            <div className="mt-6 flex items-center gap-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  aria-label="Previous slide"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                    <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  aria-label="Next slide"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                    <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => goTo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Image */}
        <div className="relative flex w-full items-center justify-center bg-slate-50 md:w-[50%] min-h-[160px] md:min-h-full">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 flex items-center justify-center p-3 md:p-5 lg:p-6 transition-all duration-1000 ease-out ${
                  isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[24px] shadow-sm ring-1 ring-slate-200">
                  <img
                    src={slide.coverImage || slide.image}
                    alt={slide.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-slate-900/20 mix-blend-multiply" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

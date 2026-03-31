import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 bg-[#0F172A] px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="cta-heading"
          className="sd-font-display text-3xl font-extrabold text-white sm:text-4xl"
          style={{ fontWeight: 800 }}
        >
          Ready for full predictors?
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Use GuideXpert&apos;s live rank and college tools for real exam data and cutoffs.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/rank-predictor"
            className="sd-btn-primary inline-flex min-w-[200px] justify-center no-underline"
          >
            Open rank predictor
          </Link>
          <Link
            to="/collegepredictor"
            className="sd-btn-secondary inline-flex min-w-[200px] justify-center border-white/30 bg-white/10 text-white no-underline hover:bg-white/15"
          >
            College predictor
          </Link>
        </div>
      </div>
    </section>
  );
}

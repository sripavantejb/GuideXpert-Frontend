import { RECRUITER_LOGOS } from './landingPageData';

const DOUBLED = [...RECRUITER_LOGOS, ...RECRUITER_LOGOS];

export default function RecruitersMarquee() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-slate-900 py-12" aria-label="Top recruiters">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Where graduates go</p>
        <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">Trusted by leading recruiters</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-900 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-900 to-transparent" aria-hidden />

        <div className="flex w-max animate-marquee gap-8 px-6 hover:[animation-play-state:paused]">
          {DOUBLED.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="group flex h-14 w-40 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span className="text-sm font-bold text-slate-500 transition group-hover:text-white">
                <span className="group-hover:hidden">{logo.name}</span>
                <span className="hidden group-hover:inline" style={{ color: logo.color }}>
                  {logo.name}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
}

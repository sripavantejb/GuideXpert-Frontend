import { Link } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import ShinyText from '../UI/ShinyText';
import { LAYOUT } from './careers360/careers360Theme';

export default function CounsellingInviteStrip() {
  return (
    <div className="border-b border-[#e8eaed] bg-white py-3 sm:py-3.5">
      <div className={LAYOUT.container}>
        <div className="gx-counselling-strip relative overflow-hidden rounded-xl">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, #ff9a4d 0%, #f27921 42%, #e06810 100%)',
            }}
            aria-hidden
          />
          {/* Soft moving highlight across the strip */}
          <div className="gx-counselling-strip-shine pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative z-[1] flex flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-3">
            <p className="text-center text-sm font-semibold leading-snug sm:text-left sm:text-[15px]">
              <ShinyText
                text="Want to join a free IITian one-on-one counselling session? Book your free slot today."
                speed={2.6}
                delay={0.4}
                color="#fff7ed"
                shineColor="#ffffff"
                spread={100}
                direction="left"
                yoyo={false}
                className="font-semibold"
              />
            </p>
            <Link
              to="/one-on-one-session"
              className="group inline-flex shrink-0 items-center justify-center gap-2 self-center overflow-hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#e06810] shadow-sm transition hover:bg-[#fff4ed] sm:self-auto"
            >
              <FiCalendar className="h-4 w-4 transition group-hover:scale-110" aria-hidden />
              <ShinyText
                text="Book free"
                speed={2.2}
                delay={0.6}
                color="#e06810"
                shineColor="#fb923c"
                spread={110}
                direction="left"
                className="font-semibold"
              />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .gx-counselling-strip-shine {
          background: linear-gradient(
            105deg,
            transparent 35%,
            rgba(255, 255, 255, 0.28) 48%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.28) 52%,
            transparent 65%
          );
          background-size: 220% 100%;
          animation: gx-counselling-shine 3.8s ease-in-out infinite;
        }
        @keyframes gx-counselling-shine {
          0% { background-position: 120% 0; }
          100% { background-position: -120% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gx-counselling-strip-shine {
            animation: none !important;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

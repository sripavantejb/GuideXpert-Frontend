import { STUDENT_LOTTIES } from './studentsAnimations';
import { PixarStage } from './PixarLottie';
import './studentsSectionMotion.css';

function Frame({ children, className = '', tone = 'navy' }) {
  const tones = {
    navy: 'from-[#1e3a5f]/[0.08] via-[#f0f4f9] to-[#fff8f3]',
    orange: 'from-[#f27921]/[0.12] via-[#fff4ed] to-[#f7f8fa]',
    plum: 'from-[#2d1b4e]/[0.1] via-[#f5f0fa] to-[#fff8f3]',
    cream: 'from-[#fff4ed] via-[#faf7f2] to-[#eef2f7]',
    mint: 'from-[#e8f5ef] via-[#f5faf8] to-[#fff8f3]',
    slate: 'from-[#eef2f7] via-[#f7f8fa] to-[#fff4ed]',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#e8eaed] bg-gradient-to-br ${tones[tone]} ${className}`}
      aria-hidden
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 left-4 h-28 w-28 rounded-full bg-[#f27921]/10 blur-2xl" />
      <div className="relative flex h-full min-h-[200px] items-center justify-center p-5 sm:min-h-[220px] sm:p-6">
        {children}
      </div>
    </div>
  );
}

export function RankPredictorIllustration({ className = '' }) {
  return (
    <Frame tone="navy" className={className}>
      <svg viewBox="0 0 280 200" className="h-auto w-full max-w-[280px]" fill="none">
        <rect x="18" y="22" width="244" height="156" rx="16" fill="#fff" stroke="#e5e7eb" />
        <rect x="34" y="38" width="72" height="8" rx="4" fill="#dbe3ef" />
        <rect x="34" y="52" width="48" height="6" rx="3" fill="#eef2f7" />
        <circle cx="232" cy="48" r="14" className="gx-anim-pulse" fill="#f27921" fillOpacity="0.18" />
        <path d="M226 48h12M232 42v12" stroke="#f27921" strokeWidth="2" strokeLinecap="round" />

        <g transform="translate(40,70)">
          {[
            { x: 0, h: 70, d: '' },
            { x: 36, h: 92, d: 'gx-anim-delay-1' },
            { x: 72, h: 58, d: 'gx-anim-delay-2' },
            { x: 108, h: 104, d: 'gx-anim-delay-3' },
            { x: 144, h: 78, d: '' },
            { x: 180, h: 88, d: 'gx-anim-delay-1' },
          ].map((b) => (
            <rect
              key={b.x}
              x={b.x}
              y={110 - b.h}
              width="22"
              height={b.h}
              rx="5"
              fill="#1e3a5f"
              fillOpacity="0.85"
              className={`gx-anim-bar ${b.d}`}
            />
          ))}
          <path
            d="M4 78 C40 48 70 92 110 42 C140 18 165 50 198 28"
            className="gx-anim-dash"
            stroke="#f27921"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="198" cy="28" r="5" fill="#f27921" className="gx-anim-pulse" />
        </g>

        <g className="gx-anim-float">
          <rect x="188" y="126" width="58" height="32" rx="8" fill="#1e3a5f" />
          <text x="217" y="146" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="system-ui">
            AIR
          </text>
        </g>
      </svg>
    </Frame>
  );
}

export function CollegePredictorIllustration({ className = '' }) {
  return (
    <Frame tone="orange" className={className}>
      <svg viewBox="0 0 280 200" className="h-auto w-full max-w-[280px]" fill="none">
        <ellipse cx="140" cy="172" rx="96" ry="10" fill="#f27921" fillOpacity="0.12" />
        <g className="gx-anim-float-soft">
          <rect x="88" y="70" width="104" height="96" rx="8" fill="#fff" stroke="#e5e7eb" />
          <path d="M88 96h104" stroke="#eee" />
          <rect x="100" y="108" width="28" height="22" rx="3" fill="#fff4ed" stroke="#f27921" strokeOpacity="0.35" />
          <rect x="140" y="108" width="28" height="22" rx="3" fill="#eef2f7" />
          <rect x="100" y="138" width="28" height="22" rx="3" fill="#eef2f7" />
          <rect x="140" y="138" width="28" height="22" rx="3" fill="#fff4ed" stroke="#f27921" strokeOpacity="0.35" />
          <path d="M140 70V48h-28v22" stroke="#1e3a5f" strokeWidth="2" fill="none" />
          <rect x="112" y="40" width="56" height="10" rx="2" fill="#1e3a5f" />
        </g>

        <g className="gx-anim-float gx-anim-delay-1">
          <rect x="28" y="54" width="64" height="28" rx="8" fill="#fff" stroke="#e5e7eb" />
          <circle cx="42" cy="68" r="5" className="gx-anim-check" fill="#22c55e" />
          <rect x="52" y="63" width="28" height="5" rx="2.5" fill="#d1d5db" />
          <rect x="52" y="72" width="20" height="4" rx="2" fill="#e5e7eb" />
        </g>

        <g className="gx-anim-float gx-anim-delay-2">
          <rect x="196" y="48" width="60" height="28" rx="8" fill="#fff" stroke="#e5e7eb" />
          <circle cx="210" cy="62" r="5" className="gx-anim-check" fill="#f27921" />
          <rect x="220" y="57" width="24" height="5" rx="2.5" fill="#d1d5db" />
          <rect x="220" y="66" width="18" height="4" rx="2" fill="#e5e7eb" />
        </g>

        <g className="gx-anim-wiggle">
          <circle cx="52" cy="138" r="18" fill="#1e3a5f" fillOpacity="0.08" stroke="#1e3a5f" strokeOpacity="0.25" />
          <path d="M52 128v12M46 134h12" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </Frame>
  );
}

export function BranchPredictorIllustration({ className = '' }) {
  return (
    <Frame tone="plum" className={className}>
      <svg viewBox="0 0 280 200" className="h-auto w-full max-w-[280px]" fill="none">
        <circle cx="140" cy="48" r="18" fill="#2d1b4e" />
        <path d="M134 48h12M140 42v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />

        <path
          d="M140 66v28M140 94L78 130M140 94l62 36"
          className="gx-anim-dash"
          stroke="#2d1b4e"
          strokeWidth="2"
          strokeOpacity="0.45"
          fill="none"
        />

        <g className="gx-anim-float">
          <rect x="36" y="130" width="84" height="40" rx="10" fill="#fff" stroke="#e5e7eb" />
          <rect x="48" y="142" width="36" height="6" rx="3" fill="#2d1b4e" fillOpacity="0.7" />
          <rect x="48" y="154" width="52" height="5" rx="2.5" fill="#e5e7eb" />
        </g>

        <g className="gx-anim-float gx-anim-delay-2">
          <rect x="160" y="130" width="84" height="40" rx="10" fill="#fff" stroke="#e5e7eb" />
          <rect x="172" y="142" width="40" height="6" rx="3" fill="#f27921" />
          <rect x="172" y="154" width="48" height="5" rx="2.5" fill="#e5e7eb" />
        </g>

        <circle cx="140" cy="94" r="7" fill="#f27921" className="gx-anim-pulse" />
        <g className="gx-anim-orbit">
          <circle cx="140" cy="94" r="3" fill="#2d1b4e" />
        </g>
      </svg>
    </Frame>
  );
}

export function CounsellingIllustration({ className = '' }) {
  return (
    <PixarStage
      src={STUDENT_LOTTIES.counselling}
      label="Mentor guiding a student — Pixar-style animation"
      tone="cream"
      caption="Talk through colleges, branches & next steps"
      className={`min-h-[260px] sm:min-h-[320px] ${className}`}
    />
  );
}

export function NewsHeaderVector({ className = '' }) {
  return (
    <svg viewBox="0 0 120 72" className={className} fill="none" aria-hidden>
      <rect x="8" y="10" width="70" height="52" rx="8" fill="#fff" stroke="#e5e7eb" />
      <rect x="18" y="20" width="36" height="6" rx="3" fill="#1e3a5f" fillOpacity="0.75" className="gx-anim-float-soft" />
      <rect x="18" y="32" width="48" height="4" rx="2" fill="#e5e7eb" />
      <rect x="18" y="42" width="40" height="4" rx="2" fill="#e5e7eb" />
      <rect x="18" y="52" width="28" height="4" rx="2" fill="#f27921" fillOpacity="0.5" />
      <g className="gx-anim-float">
        <rect x="70" y="22" width="42" height="36" rx="8" fill="#fff4ed" stroke="#f27921" strokeOpacity="0.35" />
        <circle cx="91" cy="40" r="8" className="gx-anim-spin" stroke="#f27921" strokeWidth="2" strokeDasharray="4 3" fill="none" />
      </g>
    </svg>
  );
}

export function DataSidebarVector({ className = '' }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" aria-hidden>
      <circle cx="70" cy="70" r="48" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="70"
        cy="70"
        r="48"
        className="gx-anim-ring"
        stroke="#f27921"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-90 70 70)"
      />
      <circle cx="70" cy="70" r="32" fill="#fff" stroke="#eef2f7" />
      <text x="70" y="74" textAnchor="middle" fill="#1a1a1a" fontSize="16" fontWeight="700" fontFamily="system-ui">
        360°
      </text>
      <g className="gx-anim-float">
        <rect x="112" y="18" width="44" height="28" rx="8" fill="#1e3a5f" />
        <text x="134" y="36" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="system-ui">
          Data
        </text>
      </g>
      <g className="gx-anim-float gx-anim-delay-2">
        <rect x="116" y="96" width="40" height="24" rx="8" fill="#fff" stroke="#e5e7eb" />
        <rect x="124" y="105" width="24" height="5" rx="2.5" fill="#f27921" />
      </g>
    </svg>
  );
}

export function OtherProductIcon({ id, className = 'h-10 w-10 shrink-0' }) {
  if (id === 'compare') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#eef2f7" />
        <rect x="7" y="12" width="11" height="16" rx="3" fill="#1e3a5f" className="gx-anim-float-soft" />
        <rect x="22" y="12" width="11" height="16" rx="3" fill="#f27921" className="gx-anim-float gx-anim-delay-1" />
      </svg>
    );
  }
  if (id === 'fit-course') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#fff4ed" />
        <circle cx="20" cy="20" r="10" stroke="#f27921" strokeWidth="2" className="gx-anim-spin" strokeDasharray="5 4" fill="none" />
        <circle cx="20" cy="20" r="3" fill="#f27921" className="gx-anim-pulse" />
      </svg>
    );
  }
  if (id === 'fit-college') {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#e8f5ef" />
        <path d="M12 26V16l8-5 8 5v10" stroke="#15803d" strokeWidth="2" fill="none" className="gx-anim-float-soft" />
        <path d="M17 26v-6h6v6" stroke="#15803d" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <rect width="40" height="40" rx="10" fill="#f5f0fa" />
      <rect x="11" y="10" width="18" height="20" rx="3" fill="#2d1b4e" fillOpacity="0.85" />
      <rect x="15" y="15" width="10" height="2.5" rx="1" fill="#fff" fillOpacity="0.7" className="gx-anim-shimmer" />
      <rect x="15" y="20" width="8" height="2.5" rx="1" fill="#fff" fillOpacity="0.35" />
      <circle cx="26" cy="28" r="5" fill="#f27921" className="gx-anim-check" />
      <path d="M24 28l1.5 1.5 3-3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ImpactAccentVector({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <circle cx="50" cy="50" r="36" className="gx-anim-pulse" fill="#f27921" fillOpacity="0.08" />
      <path
        d="M50 22l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z"
        fill="#f27921"
        fillOpacity="0.9"
        className="gx-anim-wiggle"
      />
      <circle cx="78" cy="28" r="4" fill="#1e3a5f" className="gx-anim-float" />
      <circle cx="22" cy="36" r="3" fill="#f27921" className="gx-anim-float gx-anim-delay-2" />
    </svg>
  );
}

export function CommunityCTAVector({ className = '' }) {
  return (
    <svg viewBox="0 0 140 100" className={className} fill="none" aria-hidden>
      <rect x="12" y="18" width="70" height="64" rx="12" fill="#fff" stroke="#e5e7eb" />
      <rect x="24" y="32" width="40" height="6" rx="3" fill="#1e3a5f" fillOpacity="0.7" className="gx-anim-float-soft" />
      <rect x="24" y="46" width="46" height="5" rx="2.5" fill="#e5e7eb" />
      <rect x="24" y="58" width="32" height="5" rx="2.5" fill="#e5e7eb" />
      <g className="gx-anim-float">
        <circle cx="104" cy="42" r="22" fill="#fff4ed" stroke="#f27921" strokeOpacity="0.4" />
        <path d="M104 28v14l10 6" stroke="#f27921" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="104" cy="42" r="3" fill="#1e3a5f" />
      </g>
      <g className="gx-anim-check">
        <circle cx="48" cy="74" r="8" fill="#22c55e" />
        <path d="M44 74l2.5 2.5 5.5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function SectionDecorDots({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={`pointer-events-none ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="16" r="3" fill="#f27921" fillOpacity="0.35" className="gx-anim-pulse" />
      <circle cx="28" cy="10" r="2" fill="#1e3a5f" fillOpacity="0.25" className="gx-anim-float" />
      <circle cx="48" cy="20" r="2.5" fill="#f27921" fillOpacity="0.2" className="gx-anim-float gx-anim-delay-1" />
      <circle cx="64" cy="12" r="2" fill="#1e3a5f" fillOpacity="0.2" className="gx-anim-float gx-anim-delay-2" />
      <path d="M8 48c12-8 20 8 32-2s18 6 28-4" className="gx-anim-dash" stroke="#f27921" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const PREDICTOR_LOTTIE = {
  rank: {
    src: STUDENT_LOTTIES.rank,
    tone: 'navy',
    label: 'Rank prediction animated chart',
    caption: 'Marks → estimated rank range',
  },
  college: {
    src: STUDENT_LOTTIES.college,
    tone: 'cream',
    label: 'Student researching colleges animation',
    caption: 'Build a cutoff-aware shortlist',
  },
  branch: {
    src: STUDENT_LOTTIES.branch,
    tone: 'plum',
    label: 'Choosing a branch pathway animation',
    caption: 'See which branches fit your rank',
  },
};

export function PredictorIllustration({ id, className = '' }) {
  const meta = PREDICTOR_LOTTIE[id] || PREDICTOR_LOTTIE.rank;
  return (
    <PixarStage
      src={meta.src}
      label={meta.label}
      tone={meta.tone}
      caption={meta.caption}
      className={`h-full min-h-[240px] sm:min-h-[280px] ${className}`}
    />
  );
}

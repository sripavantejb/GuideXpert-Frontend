/** Decorative SVG accents for workspace section bands — production-ready, theme-aware */

function ArtWrapper({ children, className = '', flip = false }) {
  return (
    <div
      className={`pointer-events-none absolute select-none ${flip ? 'right-0 top-0' : 'left-0 top-0'} ${className}`}
      aria-hidden
    >
      <div className={flip ? 'scale-x-[-1]' : ''}>{children}</div>
    </div>
  );
}

export function RankPredictorsArt({ dark }) {
  const stroke = dark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.2)';
  const fill = dark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(16, 185, 129, 0.06)';
  const muted = dark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.12)';

  return (
    <>
      <ArtWrapper className="opacity-80">
        <svg width="280" height="200" viewBox="0 0 280 200" fill="none">
          <rect x="32" y="120" width="28" height="56" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="72" y="88" width="28" height="88" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="112" y="64" width="28" height="112" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="152" y="96" width="28" height="80" rx="6" fill={muted} stroke={muted} strokeWidth="1.5" />
          <rect x="192" y="72" width="28" height="104" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M24 176 H232" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="220" cy="40" r="24" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M212 40 L218 46 L230 32" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ArtWrapper>
      <ArtWrapper flip className="bottom-0 top-auto opacity-60">
        <svg width="220" height="160" viewBox="0 0 220 160" fill="none">
          <path
            d="M20 100 C60 60 100 120 140 80 C170 55 190 70 200 50"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="20" cy="100" r="5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="140" cy="80" r="5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="200" cy="50" r="5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      </ArtWrapper>
    </>
  );
}

export function AdmissionPredictorsArt({ dark }) {
  const stroke = dark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)';
  const fill = dark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(139, 92, 246, 0.06)';
  const muted = dark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.1)';

  return (
    <ArtWrapper className="opacity-70" flip>
      <svg width="260" height="220" viewBox="0 0 260 220" fill="none">
        <rect x="80" y="60" width="120" height="140" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M80 88 H200" stroke={muted} strokeWidth="1.5" />
        <rect x="100" y="108" width="32" height="32" rx="4" fill={muted} />
        <rect x="144" y="108" width="32" height="32" rx="4" fill={muted} />
        <rect x="100" y="152" width="32" height="32" rx="4" fill={muted} />
        <rect x="144" y="152" width="32" height="32" rx="4" fill={muted} />
        <path d="M140 60 L140 36 L108 36 L108 60" stroke={stroke} strokeWidth="1.5" fill="none" />
        <circle cx="48" cy="48" r="20" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M40 48 H56 M48 40 V56" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </ArtWrapper>
  );
}

export function FitTestsArt({ dark }) {
  const stroke = dark ? 'rgba(52, 211, 153, 0.28)' : 'rgba(16, 185, 129, 0.22)';
  const fill = dark ? 'rgba(52, 211, 153, 0.07)' : 'rgba(16, 185, 129, 0.05)';
  const muted = dark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.1)';

  return (
    <ArtWrapper className="opacity-75">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="120" cy="100" r="72" stroke={muted} strokeWidth="1.5" fill="none" />
        <circle cx="120" cy="100" r="48" stroke={stroke} strokeWidth="1.5" fill={fill} />
        <circle cx="120" cy="100" r="8" fill={stroke} />
        <path d="M120 28 V52 M120 148 V172 M28 100 H52 M188 100 H212" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M56 56 L74 74 M166 74 L184 56 M56 144 L74 126 M166 126 L184 144" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="174" cy="46" r="14" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M168 46 H180 M174 40 V52" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </ArtWrapper>
  );
}

export function CompareArt({ dark }) {
  const stroke = dark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.22)';
  const fill = dark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(59, 130, 246, 0.06)';
  const muted = dark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.12)';

  return (
    <ArtWrapper flip className="opacity-70">
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
        <path d="M130 32 V168" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M80 56 H180" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M130 56 V80" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <rect x="52" y="88" width="56" height="72" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="152" y="88" width="56" height="72" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M68 112 H92 M68 128 H88 M168 112 H192 M168 128 H184" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="78" cy="148" r="6" fill={stroke} />
        <circle cx="182" cy="148" r="6" fill={stroke} />
      </svg>
    </ArtWrapper>
  );
}

const SECTION_ART = {
  'rank-predictors': RankPredictorsArt,
  'admission-predictors': AdmissionPredictorsArt,
  'fit-tests': FitTestsArt,
  compare: CompareArt,
};

export function WorkspaceSectionArt({ sectionId, dark }) {
  const Component = SECTION_ART[sectionId];
  if (!Component) return null;
  return <Component dark={dark} />;
}

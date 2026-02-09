import PosterFooter from './PosterFooter';

const BACKGROUNDS = {
  blue: 'linear-gradient(180deg, #1e3a5f 0%, #003366 50%, #0f172a 100%)',
  navy: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  light: 'linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
};

export default function MarketingPoster({
  displayName,
  headline = 'Free Career Assessment',
  ctaText = 'Book a Free Session',
  backgroundVariant = 'blue',
  width = 400,
  height = 500,
  className = '',
  style = {},
}) {
  const isLight = backgroundVariant === 'light';
  const textClass = isLight ? 'text-gray-900' : 'text-white';
  const subTextClass = isLight ? 'text-gray-700' : 'text-white/90';

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: BACKGROUNDS[backgroundVariant] || BACKGROUNDS.blue,
        ...style,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-4">
          <img
            src="https://res.cloudinary.com/dqataciy5/image/upload/v1769173121/guidexpert-logo-3Ifn2ZP2_ljlxlc.png"
            alt="GuideXpert"
            className="w-10 h-10 object-contain"
          />
        </div>
        <h3 className={`text-lg font-bold tracking-tight ${textClass}`} style={{ lineHeight: 1.3 }}>
          {headline}
        </h3>
        <p className={`text-sm mt-2 ${subTextClass}`}>
          Get personalised guidance from a certified counsellor.
        </p>
        <div
          className={`mt-5 px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm ${
            isLight ? 'bg-[#003366] text-white' : 'bg-white text-[#003366]'
          }`}
        >
          {ctaText}
        </div>
      </div>
      <PosterFooter displayName={displayName} />
    </div>
  );
}

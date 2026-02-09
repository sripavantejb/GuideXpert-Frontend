export default function PosterFooter({ displayName, className = '' }) {
  return (
    <div
      className={`border-t border-white/30 flex flex-col items-center justify-center py-3 px-4 ${className}`}
      style={{ background: 'rgba(0,0,0,0.2)' }}
    >
      <p className="text-white font-semibold text-sm sm:text-base tracking-tight">{displayName}</p>
      <p className="text-white/80 text-xs mt-0.5">GuideXpert Certified Counsellor</p>
    </div>
  );
}

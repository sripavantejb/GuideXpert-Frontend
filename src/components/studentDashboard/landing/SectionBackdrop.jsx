import FloatingParticles from './FloatingParticles';

export default function SectionBackdrop({ dark = false, particles = true, grid = true }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: dark
            ? 'radial-gradient(ellipse 70% 55% at 100% 0%, rgba(52, 211, 153, 0.1), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(59, 130, 246, 0.07), transparent 50%)'
            : 'radial-gradient(ellipse 65% 50% at 0% 0%, rgba(16, 185, 129, 0.06), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(15, 23, 42, 0.03), transparent 50%)',
        }}
      />
      {grid && (
        <div
          className={`pointer-events-none absolute inset-0 ${dark ? 'opacity-[0.12]' : 'opacity-[0.35]'}`}
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(to right, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(148,163,184,0.1)'} 1px, transparent 1px), linear-gradient(to bottom, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(148,163,184,0.1)'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
          }}
        />
      )}
      {particles && <FloatingParticles dark={dark} />}
    </>
  );
}

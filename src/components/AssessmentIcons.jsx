/**
 * Neo-brutal style icons for the assessment flow (thick outlines, flat palette fills).
 * Use inside .assessment-page-wrap so CSS vars (--nb-*) apply.
 */

const defaultSize = 24;

export function RocketIcon({ className = '', size = defaultSize, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="var(--nb-black, #000)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Nose cone */}
      <path fill="var(--nb-purple, #6A3EAE)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M12 2 L16 8 L8 8 Z" />
      {/* Body */}
      <path fill="var(--nb-purple, #6A3EAE)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M8 8 L16 8 L16 14 L8 14 Z" />
      {/* Left fin */}
      <path fill="var(--nb-purple, #6A3EAE)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M8 12 L5 22 L8 18 Z" />
      {/* Right fin */}
      <path fill="var(--nb-purple, #6A3EAE)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M16 12 L19 22 L16 18 Z" />
      {/* Flame */}
      <path fill="var(--nb-yellow, #FFED00)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M9 14 L15 14 L12 23 Z" />
    </svg>
  );
}

export function StarIcon({ className = '', size = defaultSize, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="var(--nb-yellow, #FFED00)"
      stroke="var(--nb-black, #000)"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polygon points="12,2 14.5,9.5 22,12 14.5,14.5 12,22 9.5,14.5 2,12 9.5,9.5" />
    </svg>
  );
}

export function LightbulbIcon({ className = '', size = defaultSize, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="var(--nb-black, #000)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Bulb circle */}
      <circle cx="12" cy="11" r="6" fill="var(--nb-yellow, #FFED00)" stroke="var(--nb-black, #000)" strokeWidth="2" />
      {/* Base */}
      <path fill="var(--nb-purple, #6A3EAE)" stroke="var(--nb-black, #000)" strokeWidth="2" d="M10 18 L14 18 L13 23 L11 23 Z" />
    </svg>
  );
}

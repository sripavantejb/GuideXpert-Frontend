export default function StudentsHeroIllustration({ className = '' }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[520px] ${className}`}
      aria-hidden
    >
      <div className="absolute -inset-4 rounded-3xl bg-emerald-400/10 blur-2xl" />
      <svg
        viewBox="0 0 480 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-auto w-full drop-shadow-2xl"
        role="img"
        aria-label="Students planning their college journey"
      >
        {/* Soft backdrop */}
        <rect x="24" y="32" width="432" height="336" rx="28" fill="#1E293B" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <ellipse cx="240" cy="360" rx="160" ry="18" fill="rgba(0,0,0,0.25)" />

        {/* Floating accent shapes */}
        <circle cx="72" cy="88" r="28" fill="rgba(52,211,153,0.15)" />
        <circle cx="408" cy="120" r="20" fill="rgba(96,165,250,0.12)" />
        <rect x="380" y="280" width="44" height="44" rx="10" fill="rgba(52,211,153,0.1)" transform="rotate(12 402 302)" />

        {/* Books stack — left */}
        <rect x="56" y="248" width="52" height="10" rx="2" fill="#34D399" />
        <rect x="52" y="234" width="60" height="12" rx="2" fill="#6EE7B7" />
        <rect x="48" y="218" width="68" height="14" rx="2" fill="#A7F3D0" />
        <path d="M48 218 L80 200 L116 218 L84 236 Z" fill="#10B981" opacity="0.9" />

        {/* Laptop / results screen */}
        <rect x="148" y="108" width="184" height="120" rx="12" fill="#0F172A" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="160" y="120" width="160" height="88" rx="6" fill="#1E293B" />
        {/* Mini chart bars on screen */}
        <rect x="172" y="168" width="14" height="28" rx="3" fill="#34D399" opacity="0.7" />
        <rect x="192" y="152" width="14" height="44" rx="3" fill="#6EE7B7" />
        <rect x="212" y="160" width="14" height="36" rx="3" fill="#34D399" opacity="0.5" />
        <rect x="232" y="140" width="14" height="56" rx="3" fill="#A7F3D0" />
        <rect x="252" y="156" width="14" height="40" rx="3" fill="#34D399" opacity="0.8" />
        <rect x="272" y="148" width="14" height="48" rx="3" fill="#6EE7B7" opacity="0.6" />
        <rect x="292" y="162" width="14" height="34" rx="3" fill="#34D399" />
        {/* Screen header line */}
        <rect x="172" y="128" width="80" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
        <rect x="172" y="138" width="48" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
        {/* Laptop base */}
        <path d="M132 228 H348 L360 244 H120 Z" fill="#334155" />
        <rect x="120" y="228" width="240" height="6" rx="2" fill="#475569" />

        {/* Student 1 — center, with graduation cap */}
        <ellipse cx="240" cy="318" rx="36" ry="8" fill="rgba(0,0,0,0.2)" />
        {/* Body */}
        <path d="M220 268 C220 248 260 248 260 268 L258 310 H222 Z" fill="#34D399" />
        {/* Head */}
        <circle cx="240" cy="238" r="22" fill="#FCD9B6" />
        <path d="M218 228 C222 212 258 212 262 228 C258 220 222 220 218 228Z" fill="#334155" />
        {/* Cap */}
        <rect x="214" y="214" width="52" height="8" rx="2" fill="#0F172A" />
        <polygon points="240,198 268,214 212,214" fill="#0F172A" />
        <circle cx="268" cy="214" r="3" fill="#F59E0B" />
        {/* Arms holding tablet */}
        <path d="M218 278 L198 296 L202 300 L224 284Z" fill="#FCD9B6" />
        <path d="M262 278 L282 296 L278 300 L256 284Z" fill="#FCD9B6" />
        <rect x="206" y="288" width="68" height="44" rx="6" fill="#1E293B" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="214" y="296" width="52" height="6" rx="2" fill="#34D399" opacity="0.6" />
        <rect x="214" y="308" width="36" height="4" rx="2" fill="rgba(255,255,255,0.15)" />

        {/* Student 2 — left, smaller */}
        <ellipse cx="108" cy="310" rx="24" ry="6" fill="rgba(0,0,0,0.15)" />
        <path d="M94 276 C94 262 122 262 122 276 L120 304 H96 Z" fill="#60A5FA" opacity="0.85" />
        <circle cx="108" cy="254" r="16" fill="#FCD9B6" />
        <path d="M94 246 C96 236 120 236 122 246 C118 240 98 240 94 246Z" fill="#475569" />
        {/* Backpack */}
        <rect x="118" y="278" width="18" height="24" rx="4" fill="#1E293B" />
        <rect x="122" y="282" width="10" height="8" rx="2" fill="#34D399" opacity="0.5" />

        {/* Student 3 — right, with checklist */}
        <ellipse cx="372" cy="310" rx="24" ry="6" fill="rgba(0,0,0,0.15)" />
        <path d="M358 276 C358 262 386 262 386 276 L384 304 H360 Z" fill="#A78BFA" opacity="0.85" />
        <circle cx="372" cy="254" r="16" fill="#FCD9B6" />
        <path d="M358 246 C360 236 384 236 386 246 C382 240 362 240 358 246Z" fill="#64748B" />
        {/* Clipboard */}
        <rect x="388" y="268" width="28" height="36" rx="4" fill="#F8FAFC" />
        <rect x="398" y="264" width="8" height="6" rx="2" fill="#94A3B8" />
        <rect x="394" y="278" width="16" height="3" rx="1" fill="#CBD5E1" />
        <rect x="394" y="286" width="12" height="3" rx="1" fill="#CBD5E1" />
        <circle cx="396" cy="296" r="3" fill="#34D399" />
        <rect x="402" y="295" width="10" height="2" rx="1" fill="#E2E8F0" />

        {/* Decorative stars / sparkles */}
        <path d="M340 72 L342 78 L348 80 L342 82 L340 88 L338 82 L332 80 L338 78 Z" fill="#A7F3D0" opacity="0.8" />
        <path d="M88 160 L89.5 164 L94 165 L89.5 166 L88 170 L86.5 166 L82 165 L86.5 164 Z" fill="#93C5FD" opacity="0.7" />
        <path d="M400 200 L401.5 204 L406 205 L401.5 206 L400 210 L398.5 206 L394 205 L398.5 204 Z" fill="#C4B5FD" opacity="0.6" />

        {/* Label pill */}
        <rect x="156" y="52" width="168" height="28" rx="14" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
        <circle cx="174" cy="66" r="4" fill="#34D399" />
        <rect x="184" y="62" width="120" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}

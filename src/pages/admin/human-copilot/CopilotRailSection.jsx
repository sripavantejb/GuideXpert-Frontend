export function CopilotRailSection({ title, subtitle, children, className = '' }) {
  const sectionId = `rail-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} className={`bg-white ${className}`.trim()}>
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-sm">
        <h2 id={sectionId} className="text-[13px] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{subtitle}</p>
        ) : null}
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export function ProfileGrid({ rows }) {
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows.map(({ label, value, fullWidth }) => (
        <div key={label} className={fullWidth ? 'sm:col-span-2' : ''}>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
          <dd className="mt-0.5 text-xs font-medium text-slate-900">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RailEmptyState({ children }) {
  return (
    <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-500">
      {children}
    </p>
  );
}

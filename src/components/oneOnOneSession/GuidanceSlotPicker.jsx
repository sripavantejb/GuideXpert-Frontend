import { FieldError, neoLabelClass } from './FormControls';

function renderSessionTitle(sessionTitle) {
  const title = String(sessionTitle || '').trim();
  if (!title) return null;

  const sep = ' - ';
  const idx = title.indexOf(sep);
  if (idx === -1) return title;

  const main = title.slice(0, idx);
  const subtitle = title.slice(idx + sep.length);
  return (
    <>
      {main}
      {' - '}
      <span className="italic">{subtitle}</span>
    </>
  );
}

/**
 * Admin guidance slots (from /api/guidance-booking) in neo-brutalist card style.
 */
export default function GuidanceSlotPicker({
  slots = [],
  value,
  onChange,
  error,
  label = 'Book a session slot',
  required = true,
}) {
  return (
    <div className="sm:col-span-2">
      <p className={neoLabelClass}>
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </p>
      <div
        className={`rounded-[10px] border-2 bg-[#F8FAFC] p-3 sm:p-4 ${
          error ? 'border-red-800' : 'border-[#0F172A]'
        }`}
        role="radiogroup"
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
      >
        {slots.length === 0 ? (
          <p className="rounded-[10px] border-2 border-amber-900 bg-amber-100 px-4 py-3 text-sm font-bold text-amber-950">
            No slots are available right now. Please contact the GuideXpert team.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => {
              const selected = value === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(slot.id)}
                  className={`rounded-[10px] border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 ${
                    selected
                      ? 'border-[#0F172A] bg-[#c7f36b] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] -translate-y-0.5'
                      : 'border-[#0F172A] bg-white text-[#0F172A] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#0F172A]'
                  }`}
                >
                  <span className="block text-sm font-black leading-snug">
                    {renderSessionTitle(slot.sessionTitle)}
                  </span>
                  <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-[#0F172A]/80">
                    {slot.slotDate} · {slot.slotTime}
                  </span>
                  {(slot.counselorName || slot.collegeName) && (
                    <span className="mt-2 block text-[10px] font-semibold text-[#0F172A]/70">
                      {slot.counselorName}
                      {slot.collegeName ? ` · ${slot.collegeName}` : ''}
                    </span>
                  )}
                  <span className="mt-2 inline-flex rounded border border-emerald-800 bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-900">
                    {slot.spotsLeft} spots left
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

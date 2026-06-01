import { useMemo } from 'react';
import { FieldError, neoLabelClass } from './FormControls';

function parseSlotOption(option) {
  if (typeof option === 'string') {
    return { value: option, dateLabel: option, timeLabel: option, slotDate: '' };
  }
  const label = option?.label || option?.value || '';
  const parts = String(label).split('•').map((s) => s.trim());
  return {
    value: option?.value || '',
    dateLabel: parts[0] || label,
    timeLabel: option?.timeLabel || parts[1] || label,
    slotDate: option?.slotDate || '',
  };
}

function groupSlotsByDate(options) {
  const groups = [];
  const indexByDate = new Map();

  for (const raw of options) {
    const slot = parseSlotOption(raw);
    if (!slot.value) continue;

    const key = slot.slotDate || slot.dateLabel;
    if (!indexByDate.has(key)) {
      indexByDate.set(key, groups.length);
      groups.push({ key, dateLabel: slot.dateLabel, slots: [] });
    }
    groups[indexByDate.get(key)].slots.push(slot);
  }

  return groups;
}

export default function SessionSlotPicker({
  label,
  options = [],
  value,
  onChange,
  error,
  name = 'preferredTimeSlot',
  required = false,
}) {
  const dayGroups = useMemo(() => groupSlotsByDate(options), [options]);

  return (
    <div className="sm:col-span-2">
      <p className={neoLabelClass} id={`${name}-label`}>
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
        aria-labelledby={`${name}-label`}
      >
        <div className="space-y-5">
          {dayGroups.map((day) => (
            <div key={day.key}>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#0F172A]/80">
                {day.dateLabel}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {day.slots.map((slot) => {
                  const selected = value === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      name={name}
                      aria-pressed={selected}
                      onClick={() => onChange(slot.value)}
                      className={`min-h-[72px] rounded-[10px] border-2 px-2 py-3 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 ${
                        selected
                          ? 'border-[#0F172A] bg-[#c7f36b] text-[#0F172A] shadow-[3px_3px_0px_#0F172A] -translate-y-0.5'
                          : 'border-[#0F172A] bg-white text-[#0F172A] hover:-translate-y-0.5 hover:bg-white hover:shadow-[2px_2px_0px_#0F172A]'
                      }`}
                    >
                      <span className="block text-xs font-black uppercase leading-tight tracking-wide">
                        {slot.timeLabel}
                      </span>
                      <span className="mt-1 block text-[10px] font-semibold text-[#0F172A]/70">
                        3 slots
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

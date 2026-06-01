export const neoInputClass =
  'w-full rounded-[10px] border-2 border-[#0F172A] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none transition-all focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#0F172A]';

export const neoLabelClass = 'mb-2 block text-sm font-black uppercase tracking-wide text-[#0F172A]';

const inputError = 'border-red-800 bg-red-50';

export function FormLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className={neoLabelClass}>
      {children}
      {required ? <span className="text-red-700"> *</span> : null}
    </label>
  );
}

export function FormInput({ id, error, className = '', ...props }) {
  return (
    <input
      id={id}
      className={`${neoInputClass} ${error ? inputError : ''} ${className}`.trim()}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
}

export function FormSelect({ id, error, placeholder = 'Select…', options, className = '', ...props }) {
  return (
    <select
      id={id}
      className={`${neoInputClass} ${error ? inputError : ''} ${className}`.trim()}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function FormTextarea({ id, error, className = '', ...props }) {
  return (
    <textarea
      id={id}
      rows={4}
      className={`${neoInputClass} resize-y min-h-[100px] ${error ? inputError : ''} ${className}`.trim()}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-700">{message}</p>;
}

export function ChoiceGroup({ label, options, value, onChange, error, name, className = '' }) {
  const normalizedOptions = options
    .map((option) => {
      if (typeof option === 'string') {
        return { value: option, label: option };
      }
      return {
        value: option?.value || '',
        label: option?.label || option?.value || '',
      };
    })
    .filter((option) => option.value);

  return (
    <div className={`sm:col-span-1 ${className}`.trim()}>
      <p className={neoLabelClass}>{label}</p>
      <div
        className={`rounded-[10px] border-2 bg-[#F8FAFC] p-3 ${
          error ? 'border-red-800' : 'border-[#0F172A]'
        }`}
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {normalizedOptions.map((option) => {
          const id = `${name || label}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="flex flex-1 min-w-[140px] cursor-pointer items-center gap-2 rounded-lg border-2 border-transparent bg-white px-3 py-2.5 text-sm font-semibold text-[#0F172A] has-[:checked]:border-[#0F172A] has-[:checked]:bg-[#c7f36b] has-[:checked]:shadow-[2px_2px_0px_#0F172A]"
            >
              <input
                id={id}
                name={name}
                type="radio"
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border-2 border-[#0F172A] accent-[#0F172A]"
              />
              {option.label}
            </label>
          );
        })}
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function NeoField({ label, children, error, className = '' }) {
  return (
    <div className={`sm:col-span-1 ${className}`.trim()}>
      <p className={neoLabelClass}>{label}</p>
      {children}
      <FieldError message={error} />
    </div>
  );
}

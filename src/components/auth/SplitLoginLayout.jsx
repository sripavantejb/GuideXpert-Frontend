const NAVY_BG = '#041e30';
const NAVY_BTN = '#003366';

const CHEVRON_PATTERN = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4l8 8-8 8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export function LoginPrimaryButton({
  children,
  loading = false,
  disabled = false,
  type = 'submit',
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3 px-4 rounded-lg font-medium text-white uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      style={{ backgroundColor: NAVY_BTN }}
    >
      {children}
    </button>
  );
}

export function LoginPhoneField({
  id,
  value,
  onChange,
  error = '',
  disabled = false,
  label = 'Mobile Number',
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <div
        className={`flex rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-primary-blue-500 focus-within:border-primary-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-gray-700 text-sm shrink-0">
          <span className="font-medium">IN</span>
          <span className="text-gray-500">+91</span>
        </div>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={value}
          onChange={onChange}
          placeholder="Enter Number"
          disabled={disabled}
          className="flex-1 min-w-0 px-4 py-2.5 outline-none"
        />
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LoginAlert({ variant = 'error', message }) {
  if (!message) return null;
  const styles =
    variant === 'success'
      ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
      : 'border-red-200 bg-red-50/80 text-red-800';
  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      {message}
    </div>
  );
}

/**
 * Split-screen login shell (counsellor-style): dark branded left panel + white form right.
 */
export default function SplitLoginLayout({
  badgeLabel,
  headline,
  steps = [],
  rightTitle,
  rightSubtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="relative w-full md:w-1/2 min-h-0 md:min-h-screen flex flex-col justify-center px-5 py-8 md:px-12 md:py-16"
        style={{ background: NAVY_BG }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: CHEVRON_PATTERN,
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 mb-6">
            <span className="text-lg font-semibold" style={{ color: NAVY_BTN }}>
              {badgeLabel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{headline}</h1>
          <p className="text-white/80 text-sm md:text-base mb-8">Just 2 simple steps</p>
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={step.label}>
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.active
                        ? 'bg-white text-[#041e30]'
                        : 'bg-white/20 text-white border border-white/40'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-white text-sm font-medium">{step.label}</p>
                  </div>
                </div>
                {index < steps.length - 1 ? (
                  <div className="w-px h-6 bg-white/30 ml-4 mt-0.5" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 min-h-0 md:min-h-screen flex flex-col items-center justify-start md:justify-center bg-white px-6 py-8 md:px-12 md:py-16">
        <div className="w-full max-w-md">
          <img
            src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png"
            alt="GuideXpert"
            className="h-9 w-auto object-contain mb-6 md:hidden"
          />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{rightTitle}</h2>
          {rightSubtitle ? <p className="text-gray-500 text-sm mb-6">{rightSubtitle}</p> : null}
          {children}
          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export { NAVY_BG, NAVY_BTN };

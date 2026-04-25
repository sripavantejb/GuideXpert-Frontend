import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiInfo, FiSettings } from 'react-icons/fi';
import { usePosterIdentity } from '../../hooks/usePosterIdentity';

/** Visible banner that explains the dual identity flow on every static poster page:
 *  - eligibility is always checked against the activation-form mobile, and
 *  - the printed name + number come from the Settings profile (if customised) or the activation form.
 *  Three states, driven entirely by usePosterIdentity():
 *    1. !hasActivation         -> amber, prompts the counsellor to complete the activation flow.
 *    2. usedSettingsOverride    -> blue, confirms Settings overrides are in effect.
 *    3. default                 -> slate, confirms activation defaults are being printed and invites Settings edits. */
export default function PosterIdentityNotice({ className = '' }) {
  const { hasActivation, usedSettingsOverride } = usePosterIdentity();

  if (!hasActivation) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm ${className}`}
      >
        <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-snug text-amber-950">
            Activation required
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900">
            Eligibility is checked against the mobile number on your activation form.
            {' '}
            Complete your activation form first to validate and download this poster.
          </p>
          <Link
            to="/counsellor/login"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-700"
          >
            Complete activation
          </Link>
        </div>
      </div>
    );
  }

  if (usedSettingsOverride) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 shadow-sm ${className}`}
      >
        <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-snug text-blue-950">
            How your details flow into this poster
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-blue-900">
            Eligibility is checked against the mobile number on your activation form.
            {' '}
            The name and number printed below are from your Settings profile.
          </p>
          <Link
            to="/counsellor/settings"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700 shadow-sm transition hover:border-blue-400 hover:text-blue-800"
          >
            <FiSettings className="h-3 w-3" aria-hidden />
            Edit in Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-sm ${className}`}
    >
      <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug text-slate-900">
          How your details flow into this poster
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-700">
          Eligibility is checked against the mobile number on your activation form.
          {' '}
          The name and number printed below are from your activation form.
          {' '}
          Update them anytime in Settings.
        </p>
        <Link
          to="/counsellor/settings"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
        >
          <FiSettings className="h-3 w-3" aria-hidden />
          Edit in Settings
        </Link>
      </div>
    </div>
  );
}

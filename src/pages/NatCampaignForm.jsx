import { useEffect, useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import {
  FieldError,
  FormInput,
  NeoField,
  neoLabelClass,
} from '../components/oneOnOneSession/FormControls';
import { submitNatCampaignForm } from '../utils/api';

const OTP_OCCUPATION = 'NAT Campaign';

const COLLEGE_OPTIONS = [
  { value: 'zenith-school-of-ai', label: 'Zenith School of AI' },
  { value: 'niat', label: 'NIAT' },
  { value: 'scaler', label: 'Scaler' },
  { value: 'newton', label: 'Newton' },
  { value: 'others', label: 'Others' },
];

const neoCheckboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-[#0F172A] accent-[#0F172A]';

const neoCheckboxLabelClass =
  'flex cursor-pointer items-start gap-3 rounded-[10px] border-2 border-[#0F172A] bg-white p-4 shadow-[2px_2px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0F172A] has-[:checked]:border-[#0F172A] has-[:checked]:bg-[#c7f36b] has-[:checked]:shadow-[3px_3px_0px_#0F172A]';

function validateName(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 100) return 'Name must be at most 100 characters';
  return '';
}

function validateMobile(value) {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!digits) return 'Mobile number is required';
  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits';
  return '';
}

function SuccessView() {
  return (
    <div className="rounded-[14px] border-2 border-[#0F172A] bg-white p-8 text-center shadow-[6px_6px_0px_#0F172A] sm:p-12">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0F172A] bg-[#c7f36b] text-3xl shadow-[4px_4px_0px_#0F172A]"
        aria-hidden
      >
        ✓
      </div>
      <p className="mb-3 inline-flex rounded border-2 border-emerald-800 bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-900">
        Submitted successfully
      </p>
      <h2 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
        Your response has been recorded
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-600">
        Thank you for sharing your interest in new age colleges. Our team will reach out if there are
        relevant opportunities for you.
      </p>
    </div>
  );
}

/**
 * Public flow: name + mobile OTP + new age college interest.
 * Route: /nat-campaign
 */
export default function NatCampaignForm() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [otherPreference, setOtherPreference] = useState('');
  const [errors, setErrors] = useState({ name: '', mobileNumber: '', preferences: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'NAT Campaign | GuideXpert';
  }, []);

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    setErrors((prev) => ({ ...prev, name: validateName(v) }));
    setSubmitError('');
  };

  const handleMobileChange = (v) => {
    setMobileNumber(v);
    setErrors((prev) => ({ ...prev, mobileNumber: validateMobile(v) }));
    setSubmitError('');
  };

  const togglePreference = (value) => {
    setErrors((prev) => ({ ...prev, preferences: '' }));
    setSubmitError('');
    setSelectedPreferences((prev) => {
      const isSelected = prev.includes(value);
      if (value === 'others' && isSelected) {
        setOtherPreference('');
      }
      return isSelected ? prev.filter((item) => item !== value) : [...prev, value];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const mobileErr = validateMobile(mobileNumber);
    let prefErr = '';
    if (!selectedPreferences.length) {
      prefErr = 'Please select at least one option.';
    } else if (selectedPreferences.includes('others') && otherPreference.trim().length < 2) {
      prefErr = 'Please specify your other preference.';
    }
    setErrors({ name: nameErr, mobileNumber: mobileErr, preferences: prefErr });
    if (nameErr || mobileErr || prefErr) {
      setSubmitError('Please fix the errors above.');
      return;
    }
    if (!otpVerified) {
      setSubmitError('Please verify your mobile number with OTP first.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    const phone = mobileNumber.replace(/\D/g, '').slice(-10);

    try {
      const res = await submitNatCampaignForm(
        name.trim(),
        phone,
        selectedPreferences,
        selectedPreferences.includes('others') ? otherPreference.trim() : null
      );
      if (!res.success) {
        setSubmitError(res.message || 'Could not save your response. Please try again.');
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {submitted ? (
          <SuccessView />
        ) : (
          <>
            <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
              <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
                NAT Campaign
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                New Age Colleges Interest Form
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Share your details and tell us which new age colleges interest you.
              </p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Zenith School of AI, NIAT, Scaler, Newton, and more — help us understand your
                preferences.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-200">
                <li className="rounded border border-slate-600 bg-[#1E293B] px-2 py-1">Quick form</li>
                <li className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 text-emerald-100">
                  OTP verified
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7"
              noValidate
            >
              <p className="mb-4 text-xs font-semibold text-slate-600">
                Fields marked with <span className="text-red-700">*</span> are required.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NeoField label="1. Name" error={errors.name} className="sm:col-span-2" required>
                  <FormInput
                    id="nat-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={handleNameChange}
                    error={errors.name}
                    placeholder="Full name"
                    disabled={submitting}
                  />
                </NeoField>

                <MobileOtpField
                  label="2. Mobile Number"
                  required
                  fullName={name}
                  mobileNumber={mobileNumber}
                  onMobileChange={handleMobileChange}
                  error={errors.mobileNumber}
                  onVerifiedChange={setOtpVerified}
                  occupation={OTP_OCCUPATION}
                />

                <div className="sm:col-span-2">
                  <p className={neoLabelClass}>
                    3. Are you interested in new age colleges? <span className="text-red-700">*</span>
                  </p>
                  <p className="mb-3 text-xs font-semibold text-slate-600">Select all that apply.</p>
                  <div
                    className={`rounded-[10px] border-2 bg-[#F8FAFC] p-3 ${
                      errors.preferences ? 'border-red-800' : 'border-[#0F172A]'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {COLLEGE_OPTIONS.map((option, index) => {
                        const selected = selectedPreferences.includes(option.value);
                        const letter = String.fromCharCode(65 + index);
                        return (
                          <div key={option.value} className="space-y-2">
                            <label className={neoCheckboxLabelClass}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => togglePreference(option.value)}
                                disabled={submitting}
                                className={neoCheckboxClass}
                              />
                              <span className="text-sm font-semibold text-[#0F172A]">
                                <span className="font-black">{letter}.</span> {option.label}
                              </span>
                            </label>
                            {option.value === 'others' && selected && (
                              <div className="pl-2">
                                <FormInput
                                  id="nat-other-preference"
                                  value={otherPreference}
                                  onChange={(e) => {
                                    setOtherPreference(e.target.value);
                                    setErrors((prev) => ({ ...prev, preferences: '' }));
                                  }}
                                  placeholder="Please specify"
                                  disabled={submitting}
                                  error={errors.preferences && selected ? errors.preferences : ''}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <FieldError message={errors.preferences} />
                </div>
              </div>

              {submitError ? (
                <p className="mt-5 rounded-[10px] border-2 border-red-900 bg-red-100 px-4 py-3 text-sm font-bold text-red-900">
                  {submitError}
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  We&apos;ll use your verified number to follow up if needed.
                </p>
                <button
                  type="submit"
                  disabled={submitting || !otpVerified}
                  title={!otpVerified ? 'Verify your mobile number with OTP to submit' : undefined}
                  className="rounded-[14px] border-2 border-[#0F172A] bg-[#c7f36b] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0F172A] shadow-[4px_4px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Submitting…' : 'Submit Response'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

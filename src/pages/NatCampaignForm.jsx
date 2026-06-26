import { useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import { submitNatCampaignForm } from '../utils/api';

const OTP_OCCUPATION = 'NAT Campaign';

const COLLEGE_OPTIONS = [
  { value: 'zenith-school-of-ai', label: 'Zenith School of AI' },
  { value: 'niat', label: 'NIAT' },
  { value: 'scaler', label: 'Scaler' },
  { value: 'newton', label: 'Newton' },
  { value: 'others', label: 'Others' },
];

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

/**
 * Public Google Form-style flow: name + mobile OTP + new age college interest.
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      setSubmitError('Please verify your mobile number with OTP.');
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
      setShowSuccessModal(true);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ebf8] py-8 px-4">
      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0ebf8] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nat-success-title"
        >
          <div className="bg-white rounded-lg shadow-md max-w-sm w-full p-8 text-center border-t-[10px] border-[#673ab7]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="nat-success-title" className="text-xl font-normal text-gray-900 mb-2">
              Your response has been recorded
            </h2>
            <p className="text-sm text-gray-600">Thank you for submitting the form.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-[640px] mx-auto space-y-3">
          <div className="bg-white rounded-lg shadow-sm border-t-[10px] border-[#673ab7] p-6 sm:p-8">
            <h1 className="text-[32px] font-normal text-gray-900 leading-tight mb-2">NAT Campaign</h1>
            <p className="text-sm text-gray-600">
              Share your details and tell us which new age colleges interest you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <label htmlFor="nat-name" className="block text-base text-gray-900 mb-1">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="nat-name"
                value={name}
                onChange={handleNameChange}
                placeholder="Your answer"
                className={`w-full border-0 border-b-2 bg-transparent px-0 py-2 text-sm outline-none transition focus:border-[#673ab7] ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <MobileOtpField
                label="Mobile Number"
                fullName={name}
                mobileNumber={mobileNumber}
                onMobileChange={handleMobileChange}
                error={errors.mobileNumber}
                onVerifiedChange={setOtpVerified}
                occupation={OTP_OCCUPATION}
                className=""
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <p className="text-base text-gray-900 mb-1">
                Are you interested in new age colleges? <span className="text-red-600">*</span>
              </p>
              <p className="text-xs text-gray-500 mb-4">Select all that apply.</p>
              <div className="space-y-3">
                {COLLEGE_OPTIONS.map((option, index) => {
                  const selected = selectedPreferences.includes(option.value);
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <div key={option.value} className="space-y-2">
                      <label
                        className={`flex items-start gap-3 cursor-pointer rounded-md px-2 py-2 -mx-2 transition hover:bg-gray-50 ${
                          selected ? 'bg-[#f3e8fd]' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePreference(option.value)}
                          disabled={submitting}
                          className="mt-1 h-4 w-4 accent-[#673ab7]"
                        />
                        <span className="text-sm text-gray-800">
                          <span className="font-medium">{letter}.</span> {option.label}
                        </span>
                      </label>
                      {option.value === 'others' && selected && (
                        <input
                          type="text"
                          value={otherPreference}
                          onChange={(e) => {
                            setOtherPreference(e.target.value);
                            setErrors((prev) => ({ ...prev, preferences: '' }));
                          }}
                          placeholder="Please specify"
                          className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-sm outline-none transition focus:border-[#673ab7] ml-7"
                          disabled={submitting}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.preferences && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {errors.preferences}
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
                {submitError}
              </div>
            )}

            <div className="flex justify-end pt-2 pb-8">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#673ab7] hover:bg-[#5e35b1] text-white text-sm font-medium rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { registerForMeeting } from '../utils/api';

const GOOGLE_MEET_LINK = 'https://meet.google.com/vvb-sjpy-fwx';

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

export default function MeetingRegistration() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState({ name: '', mobileNumber: '' });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    setErrors((prev) => ({ ...prev, name: validateName(v) }));
    setSubmitError('');
  };

  const handleMobileChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(v);
    setErrors((prev) => ({ ...prev, mobileNumber: validateMobile(v) }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const mobileErr = validateMobile(mobileNumber);
    setErrors({ name: nameErr, mobileNumber: mobileErr });
    if (nameErr || mobileErr) {
      setSubmitError('Please fix the errors above.');
      return;
    }
    setSubmitError('');
    setLoading(true);
    try {
      const result = await registerForMeeting(name.trim(), mobileNumber);
      if (result.success) {
        window.location.href = GOOGLE_MEET_LINK;
        return;
      }
      setSubmitError(result.message || 'Something went wrong. Please try again.');
    } catch (_) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">GuideXpert</h1>
          <p className="text-gray-600 mt-1">Join Google Meet Session</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">Register for Meet</h2>
        <p className="text-sm text-gray-600 mb-6">Enter your details to join the session.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="meet-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="meet-name"
              value={name}
              onChange={handleNameChange}
              placeholder="Full Name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="meet-mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="meet-mobile"
              value={mobileNumber}
              onChange={handleMobileChange}
              placeholder="10-digit mobile number"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
            />
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.mobileNumber}
              </p>
            )}
          </div>

          {submitError && (
            <div
              className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining…' : 'Join the Meet'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

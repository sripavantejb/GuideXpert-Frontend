import { useState } from 'react';
import { submitTrainingFeedback } from '../utils/api';

const EDUCATION_OPTIONS = [
  'Below 10th',
  '10th / SSLC',
  '12th / PUC',
  'Diploma',
  "Bachelor's degree",
  "Master's degree",
  'PhD / Doctorate',
  'Other'
];

function validateName(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 2) return 'At least 2 characters';
  if (t.length > 100) return 'Maximum 100 characters';
  return '';
}

function validateMobile(value) {
  const d = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!d) return 'Required';
  if (d.length !== 10) return 'Enter 10 digits';
  return '';
}

function validateEmail(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (!/^\S+@\S+\.\S+$/.test(t)) return 'Enter a valid email';
  return '';
}

function validateAddress(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length < 10) return 'At least 10 characters';
  if (t.length > 500) return 'Maximum 500 characters';
  return '';
}

function validateOccupation(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length > 200) return 'Maximum 200 characters';
  return '';
}

function validateDob(value) {
  if (!value) return 'Required';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date';
  const now = new Date();
  if (d > now) return 'Must be in the past';
  const ageYears = (now - d) / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 18) return 'Minimum age 18 years';
  if (ageYears > 80) return 'Enter a valid date';
  return '';
}

function validateGender(value) {
  if (value !== 'Male' && value !== 'Female') return 'Select an option';
  return '';
}

function validateEducation(value) {
  const t = typeof value === 'string' ? value.trim() : '';
  if (!t) return 'Required';
  if (t.length > 200) return 'Maximum 200 characters';
  return '';
}

function validateYearsOfExperience(value) {
  const n = Number(value);
  if (value === '' || value === null || value === undefined) return 'Required';
  if (Number.isNaN(n)) return 'Enter a number';
  if (n < 0) return '0 or more';
  if (n > 50) return '50 or less';
  if (n !== Math.floor(n)) return 'Whole number only';
  return '';
}

const inputBase =
  'w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] outline-none transition text-gray-900 placeholder:text-gray-400';
const inputError = 'border-amber-500 bg-amber-50/30';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [addressOfCommunication, setAddressOfCommunication] = useState('');
  const [occupation, setOccupation] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [educationQualification, setEducationQualification] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [anythingToConvey, setAnythingToConvey] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const runValidation = () => {
    const e = {
      name: validateName(name),
      mobileNumber: validateMobile(mobileNumber),
      whatsappNumber: validateMobile(whatsappNumber),
      email: validateEmail(email),
      addressOfCommunication: validateAddress(addressOfCommunication),
      occupation: validateOccupation(occupation),
      dateOfBirth: validateDob(dateOfBirth),
      gender: validateGender(gender),
      educationQualification: validateEducation(educationQualification),
      yearsOfExperience: validateYearsOfExperience(yearsOfExperience)
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!runValidation()) {
      setSubmitError('Complete all required fields to submit.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        mobileNumber: mobileNumber.replace(/\D/g, ''),
        whatsappNumber: whatsappNumber.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        addressOfCommunication: addressOfCommunication.trim(),
        occupation: occupation.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender,
        educationQualification: educationQualification.trim(),
        yearsOfExperience: Math.min(50, Math.max(0, Math.floor(Number(yearsOfExperience)))),
        anythingToConvey: anythingToConvey.trim().slice(0, 1000) || undefined
      };
      const result = await submitTrainingFeedback(payload);
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError('Unable to submit at the moment. Please try again.');
      }
    } catch {
      setSubmitError('Connection issue. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setName('');
    setMobileNumber('');
    setWhatsappNumber('');
    setEmail('');
    setAddressOfCommunication('');
    setOccupation('');
    setDateOfBirth('');
    setGender('');
    setEducationQualification('');
    setYearsOfExperience('');
    setAnythingToConvey('');
    setErrors({});
    setSubmitError('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] to-[#004080]" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-9 h-9 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Thank you</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Your form has been submitted successfully. We will get back to you as needed.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#003366] hover:bg-[#004080] transition-colors"
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Accent header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#003366] via-[#004080] to-[#003366]" />
        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#003366]/10 mb-4">
              <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ color: '#003366' }}>
              Certified Counsellor Activation Form
            </h1>
            <p className="text-slate-600 mt-1.5 text-sm">GuideXpert</p>
            <p className="text-slate-500 text-sm mt-1">Complete all required fields to submit your feedback.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                role="alert"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {submitError}
              </div>
            )}

            {/* Section: Personal & contact */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Personal & contact details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fb-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="fb-name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError('name', validateName(e.target.value)); }}
                    onBlur={() => setError('name', validateName(name))}
                    placeholder="Full name"
                    className={`${inputBase} ${errors.name ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="fb-occupation" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Occupation <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="fb-occupation"
                    value={occupation}
                    onChange={(e) => { setOccupation(e.target.value); setError('occupation', validateOccupation(e.target.value)); }}
                    onBlur={() => setError('occupation', validateOccupation(occupation))}
                    placeholder="e.g. Teacher, Student"
                    className={`${inputBase} ${errors.occupation ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="organization-title"
                  />
                  {errors.occupation && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.occupation}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="fb-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile number <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="fb-mobile"
                    value={mobileNumber}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setMobileNumber(v); setError('mobileNumber', validateMobile(v)); }}
                    onBlur={() => setError('mobileNumber', validateMobile(mobileNumber))}
                    placeholder="10 digits"
                    className={`${inputBase} ${errors.mobileNumber ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.mobileNumber && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.mobileNumber}</p>}
                </div>
                <div>
                  <label htmlFor="fb-whatsapp" className="block text-sm font-medium text-slate-700 mb-1.5">
                    WhatsApp number <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="fb-whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setWhatsappNumber(v); setError('whatsappNumber', validateMobile(v)); }}
                    onBlur={() => setError('whatsappNumber', validateMobile(whatsappNumber))}
                    placeholder="10 digits"
                    className={`${inputBase} ${errors.whatsappNumber ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.whatsappNumber && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.whatsappNumber}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="fb-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-amber-600">*</span>
                </label>
                <input
                  type="email"
                  id="fb-email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('email', validateEmail(e.target.value)); }}
                  onBlur={() => setError('email', validateEmail(email))}
                  placeholder="your@email.com"
                  className={`${inputBase} ${errors.email ? inputError : 'border-slate-300'}`}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.email}</p>}
              </div>
              <div className="mt-4">
                <label htmlFor="fb-address" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address of communication <span className="text-amber-600">*</span>
                </label>
                <textarea
                  id="fb-address"
                  value={addressOfCommunication}
                  onChange={(e) => { setAddressOfCommunication(e.target.value); setError('addressOfCommunication', validateAddress(e.target.value)); }}
                  onBlur={() => setError('addressOfCommunication', validateAddress(addressOfCommunication))}
                  placeholder="Full address (at least 10 characters)"
                  rows={3}
                  className={`${inputBase} resize-none ${errors.addressOfCommunication ? inputError : 'border-slate-300'}`}
                  disabled={loading}
                  autoComplete="street-address"
                />
                {errors.addressOfCommunication && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.addressOfCommunication}</p>}
              </div>
            </div>

            {/* Section: Profile */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fb-dob" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Date of birth <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="fb-dob"
                    value={dateOfBirth}
                    onChange={(e) => { setDateOfBirth(e.target.value); setError('dateOfBirth', validateDob(e.target.value)); }}
                    onBlur={() => setError('dateOfBirth', validateDob(dateOfBirth))}
                    className={`${inputBase} ${errors.dateOfBirth ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  />
                  {errors.dateOfBirth && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.dateOfBirth}</p>}
                </div>
                <div>
                  <label htmlFor="fb-gender" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Gender <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="fb-gender"
                    value={gender}
                    onChange={(e) => { setGender(e.target.value); setError('gender', validateGender(e.target.value)); }}
                    onBlur={() => setError('gender', validateGender(gender))}
                    className={`${inputBase} ${errors.gender ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.gender}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="fb-education" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Education qualification <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="fb-education"
                    value={educationQualification}
                    onChange={(e) => { setEducationQualification(e.target.value); setError('educationQualification', validateEducation(e.target.value)); }}
                    onBlur={() => setError('educationQualification', validateEducation(educationQualification))}
                    className={`${inputBase} ${errors.educationQualification ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.educationQualification && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.educationQualification}</p>}
                </div>
                <div>
                  <label htmlFor="fb-yoe" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Years of experience <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="fb-yoe"
                    min={0}
                    max={50}
                    value={yearsOfExperience}
                    onChange={(e) => { setYearsOfExperience(e.target.value); setError('yearsOfExperience', validateYearsOfExperience(e.target.value)); }}
                    onBlur={() => setError('yearsOfExperience', validateYearsOfExperience(yearsOfExperience))}
                    placeholder="0"
                    className={`${inputBase} ${errors.yearsOfExperience ? inputError : 'border-slate-300'}`}
                    disabled={loading}
                  />
                  {errors.yearsOfExperience && <p className="mt-1.5 text-xs text-amber-700" role="alert">{errors.yearsOfExperience}</p>}
                </div>
              </div>
            </div>

            {/* Optional: Anything to convey */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
                Additional information
              </h3>
              <label htmlFor="fb-convey" className="block text-sm font-medium text-slate-700 mb-1.5">
                Anything you need to convey
              </label>
              <textarea
                id="fb-convey"
                value={anythingToConvey}
                onChange={(e) => setAnythingToConvey(e.target.value.slice(0, 1000))}
                placeholder="Optional: questions, comments, or anything you’d like us to know (max 1000 characters)"
                rows={3}
                className={`${inputBase} resize-none border-slate-300`}
                disabled={loading}
              />
              {anythingToConvey.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-500">{anythingToConvey.length} / 1000</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#003366' }}
            >
              {loading ? 'Submitting…' : 'Submit feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

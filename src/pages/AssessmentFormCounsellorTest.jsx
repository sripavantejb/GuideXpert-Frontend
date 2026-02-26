import { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parseUtmFromUrl } from '../utils/utm';
import {
  sendOtp,
  verifyOtp,
  setAssessmentUtm,
  getAssessmentUtm,
  submitCareerDnaAssessment,
  submitCourseFitAssessment,
} from '../utils/api';
import { ASSESSMENT_SECTIONS_CAREER_DNA } from '../data/assessmentQuestionsCareerDna';
import { ASSESSMENT_SECTIONS_COURSE_FIT } from '../data/assessmentQuestionsCourseFit';
import SuccessPopup from '../components/UI/SuccessPopup';

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

function getInitialAnswers(sections) {
  const initial = {};
  sections.forEach((section) => {
    section.questions.forEach((q) => {
      initial[q.id] = '';
    });
  });
  return initial;
}

const CONFIG = {
  'career-dna': {
    title: 'Career DNA Test',
    subtitle: 'Discover what your dream course might be',
    sections: ASSESSMENT_SECTIONS_CAREER_DNA,
    submitFn: submitCareerDnaAssessment,
  },
  'course-fit': {
    title: 'Course Fit Test',
    subtitle: 'Find out which stream feels made for you',
    sections: ASSESSMENT_SECTIONS_COURSE_FIT,
    submitFn: submitCourseFitAssessment,
  },
};

export default function AssessmentFormCounsellorTest({ type = 'career-dna' }) {
  const config = CONFIG[type] || CONFIG['career-dna'];
  const sections = config.sections;

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [classVal, setClassVal] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({ name: '', mobileNumber: '' });
  const [submitError, setSubmitError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [answers, setAnswers] = useState(() => getInitialAnswers(sections));
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const otpInputRefs = useRef([]);

  // Capture UTM from URL on mount (for counsellor attribution)
  useEffect(() => {
    const utm = parseUtmFromUrl();
    if (Object.keys(utm).length > 0) setAssessmentUtm(utm);
  }, []);

  const flatQuestions = useMemo(
    () =>
      sections.flatMap((s, sectionIndex) =>
        s.questions.map((q) => ({ ...q, sectionTitle: s.title, sectionSetIndex: sectionIndex + 1 }))
      ),
    [sections]
  );

  const questionTextMap = useMemo(() => {
    const map = {};
    sections.forEach((s) => {
      s.questions.forEach((q) => {
        map[q.id] = q.text;
      });
    });
    return map;
  }, [sections]);

  const normalizedPhone = useMemo(() => {
    const digits = (mobileNumber || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }, [mobileNumber]);

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const mobileErr = validateMobile(mobileNumber);
    setErrors({ name: nameErr, mobileNumber: mobileErr });
    if (nameErr || mobileErr) {
      setSubmitError('Please fix the errors above.');
      return;
    }
    setSubmitError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const result = await sendOtp(name.trim(), normalizedPhone, config.title);
      if (result.success) {
        setSuccessMessage('OTP sent successfully to your mobile number');
        setStep(2);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setSubmitError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setSubmitError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyOtp(normalizedPhone, otpString);
      if (result.success && result.data?.verified === true) {
        setSuccessMessage('OTP verified! Proceeding to assessment.');
        setQuestionIndex(0);
        setStep(3);
      } else {
        setOtpError(result.message || 'Invalid or expired OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setOtpError('Network error. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setSubmitError('');
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      const result = await sendOtp(name.trim(), normalizedPhone, config.title);
      if (result.success) {
        setSuccessMessage('OTP resent successfully');
        otpInputRefs.current[0]?.focus();
      } else {
        setSubmitError(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOtp = () => {
    setStep(2);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setSubmitError('');
    setSuccessMessage('');
  };

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAssessmentFormKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const target = e.target;
    const isRadio = target.type === 'radio';
    const isInsideOptionLabel = target.closest('label')?.querySelector('input[type="radio"]');
    if (isRadio || isInsideOptionLabel) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    const utm = getAssessmentUtm();
    const extra = {};
    if (email && String(email).trim()) extra.email = String(email).trim();
    if (school && String(school).trim()) extra.school = String(school).trim();
    if (classVal && String(classVal).trim()) extra.class = String(classVal).trim();
    try {
      const result = await config.submitFn(name.trim(), normalizedPhone, answers, utm, extra);
      const payload = result.data?.data ?? result.data;
      if (result.success && payload) {
        setSubmittedResult({
          score: payload.score ?? 0,
          maxScore: payload.maxScore ?? 10,
          questionResults: payload.questionResults ?? [],
        });
        setShowSuccessPopup(true);
      } else {
        setSubmitError(
          result.status === 404
            ? 'Assessment service is temporarily unavailable. Please try again later.'
            : (result.message || 'Failed to submit assessment. Please try again.')
        );
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWriteAgain = () => {
    setStep(1);
    setSubmittedResult(null);
    setAnswers(getInitialAnswers(sections));
    setQuestionIndex(0);
    setShowSuccessPopup(false);
    setSubmitError('');
    setOtpError('');
    setSuccessMessage('');
    setName('');
    setMobileNumber('');
    setEmail('');
    setSchool('');
    setClassVal('');
    setOtp(['', '', '', '', '', '']);
    setErrors({ name: '', mobileNumber: '' });
  };

  const currentQuestion = flatQuestions[questionIndex];
  const topBarRightLabel = step === 3 && !submittedResult && currentQuestion
    ? `Set ${currentQuestion.sectionSetIndex}`
    : config.title;

  return (
    <div className="assessment-page-wrap">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content width constrained for readability; do not stretch to full width. */}
        <div className="max-w-2xl">
        {/* Page-level top bar: Back (left), context label (right) */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {step === 1 && (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
                aria-label="Back to home"
              >
                <span aria-hidden>←</span> Back
              </Link>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setOtpError(''); setSuccessMessage(''); setSubmitError(''); }}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
                aria-label="Back to your details"
              >
                <span aria-hidden>←</span> Back
              </button>
            )}
            {step === 3 && !submittedResult && (
              <button
                type="button"
                onClick={() => (questionIndex > 0 ? setQuestionIndex((i) => i - 1) : handleBackToOtp())}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={questionIndex > 0 ? 'Previous question' : 'Back to verification'}
              >
                <span aria-hidden>←</span> Back
              </button>
            )}
            {step === 3 && submittedResult && (
              <span className="text-sm text-gray-500">{config.title}</span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-600">{topBarRightLabel}</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003366]">GuideXpert</h1>
          <p className="text-base text-gray-600 mt-1">{config.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{config.subtitle}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 && 'Your details'}
              {step === 2 && 'OTP Verification'}
              {step === 3 && 'Questions'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#003366] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 mb-1">Enter your details</h2>
              <p className="text-sm text-gray-600 mb-6">We will send an OTP to your mobile number before the assessment.</p>
              {successMessage && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
              )}
              {submitError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
              )}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="assessment-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="assessment-name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Full Name"
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60 ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                    disabled={loading}
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="assessment-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="assessment-mobile"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder="10-digit mobile number"
                    className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60 ${errors.mobileNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                </div>
                <div>
                  <label htmlFor="assessment-email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="email"
                    id="assessment-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="assessment-school" className="block text-sm font-medium text-gray-700 mb-1">School <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="text"
                    id="assessment-school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="School name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="assessment-class" className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-gray-500">(optional)</span></label>
                  <input
                    type="text"
                    id="assessment-class"
                    value={classVal}
                    onChange={(e) => setClassVal(e.target.value)}
                    placeholder="e.g. 10th, 12th"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg px-5 py-2.5 sm:py-3 font-semibold text-white bg-[#003366] hover:bg-[#004080] focus:ring-2 focus:ring-[#003366]/30 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 mb-1">Verify your number</h2>
              <p className="text-sm text-gray-600 mb-6">Enter the 6-digit OTP sent to ****{mobileNumber.slice(-4)}</p>
              {successMessage && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
              )}
              {submitError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
              )}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none transition-colors disabled:opacity-60"
                      aria-label={`OTP digit ${index + 1}`}
                      disabled={verifying}
                    />
                  ))}
                </div>
                {otpError && <p className="text-sm text-red-600 text-center">{otpError}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setOtpError(''); setSuccessMessage(''); setSubmitError(''); }}
                    disabled={verifying || loading}
                    className="flex-1 rounded-lg px-5 py-2.5 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || loading}
                    className="flex-1 rounded-lg px-5 py-2.5 sm:py-3 font-semibold text-white bg-[#003366] hover:bg-[#004080] focus:ring-2 focus:ring-[#003366]/30 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {verifying ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || verifying}
                    className="text-sm text-[#003366] hover:underline disabled:opacity-60"
                  >
                    {loading ? 'Resending...' : "Didn't receive OTP? Resend"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && !submittedResult && flatQuestions.length > 0 && (
            <>
              {submitError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
              )}
              <form onSubmit={handleSubmitAssessment} onKeyDown={handleAssessmentFormKeyDown} className="space-y-0">
                {/* Central card: Question X of N, progress bar, section + question, options, footer */}
                <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden p-6 sm:p-8">
                  {(() => {
                    const q = flatQuestions[questionIndex];
                    if (!q) return null;
                    return (
                      <div key={q.id}>
                        <p className="text-sm text-gray-600 mb-2">Question {questionIndex + 1} of {flatQuestions.length}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-6">
                          <div
                            className="bg-[#003366] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((questionIndex + 1) / flatQuestions.length) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={questionIndex + 1}
                            aria-valuemin={1}
                            aria-valuemax={flatQuestions.length}
                            aria-label={`Question ${questionIndex + 1} of ${flatQuestions.length}`}
                          />
                        </div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#003366] mb-3">{q.sectionTitle}</h3>
                        <p className="text-xl font-bold text-gray-900 mb-6">{q.text}</p>
                        {q.type === 'mcq' && (
                          <div className="space-y-3">
                            {q.options.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx);
                              const isSelected = (answers[q.id] || '') === opt;
                              return (
                                <label
                                  key={opt}
                                  className={`flex items-center gap-4 w-full rounded-xl border py-4 px-4 transition-colors cursor-pointer bg-white ${
                                    isSelected ? 'border-2 border-[#003366] bg-[#003366]/5' : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={isSelected}
                                    onChange={() => setAnswer(q.id, opt)}
                                    className="sr-only"
                                    aria-label={`Option ${letter}: ${opt}`}
                                  />
                                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {letter}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {/* Footer: Back (left), primary action (right) */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => (questionIndex > 0 ? setQuestionIndex((i) => i - 1) : handleBackToOtp())}
                      disabled={submitting}
                      className="rounded-lg px-5 py-2.5 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label={questionIndex > 0 ? 'Previous question' : 'Back to verification'}
                    >
                      Back
                    </button>
                    {questionIndex < flatQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setQuestionIndex((i) => i + 1)}
                        className="rounded-lg px-5 py-2.5 font-semibold text-white bg-[#003366] hover:bg-[#004080] focus:ring-2 focus:ring-[#003366]/30 focus:ring-offset-2 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg px-5 py-2.5 font-semibold text-white bg-[#003366] hover:bg-[#004080] focus:ring-2 focus:ring-[#003366]/30 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit Assessment'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}

          {step === 3 && submittedResult && (
            <div className="rounded-2xl border border-gray-200 border-l-4 border-l-[#003366] bg-white shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#003366]/10 text-[#003366] mb-5">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-[#003366]">Assessment submitted successfully</h2>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">Your score</p>
                  <p className="mt-1 text-3xl font-bold text-[#003366] tabular-nums">
                    {submittedResult.score} / {submittedResult.maxScore}
                  </p>
                  <p className="mt-4 text-sm text-gray-600">Thank you for completing the {config.title}.</p>
                </div>
                {submittedResult.questionResults && submittedResult.questionResults.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#003366]">Detailed report</h3>
                    <ul className="mt-4 space-y-3">
                      {submittedResult.questionResults.filter((r) => !r.correct).map((r) => (
                        <li key={r.questionId} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-left">
                          <p className="text-sm font-medium text-gray-900">{questionTextMap[r.questionId] ?? r.questionId}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">Your answer</p>
                          <p className="mt-0.5 text-sm text-[#991b1b]">{r.userAnswer || '—'}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">Suggested</p>
                          <p className="mt-0.5 text-sm text-[#15803d]">{r.correctAnswer}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <button
                    type="button"
                    onClick={handleWriteAgain}
                    className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
                  >
                    Take again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        variant="assessment"
        score={submittedResult?.score ?? 0}
        maxScore={submittedResult?.maxScore ?? 10}
      />
    </div>
  );
}

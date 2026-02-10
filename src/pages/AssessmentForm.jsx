import { useState, useRef, useMemo } from 'react';
import { sendOtp, verifyOtp, submitAssessment } from '../utils/api';
import { ASSESSMENT_SECTIONS } from '../data/assessmentQuestions';
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

function getInitialAnswers() {
  const initial = {};
  ASSESSMENT_SECTIONS.forEach((section) => {
    section.questions.forEach((q) => {
      initial[q.id] = '';
    });
  });
  return initial;
}

export default function AssessmentForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({ name: '', mobileNumber: '' });
  const [submitError, setSubmitError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [answers, setAnswers] = useState(getInitialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const otpInputRefs = useRef([]);

  const flatQuestions = useMemo(
    () =>
      ASSESSMENT_SECTIONS.flatMap((s) =>
        s.questions.map((q) => ({ ...q, sectionTitle: s.title }))
      ),
    []
  );

  const questionTextMap = useMemo(() => {
    const map = {};
    ASSESSMENT_SECTIONS.forEach((s) => {
      s.questions.forEach((q) => { map[q.id] = q.text; });
    });
    return map;
  }, []);

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
      const result = await sendOtp(name.trim(), normalizedPhone, 'Counsellor Assessment');
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
      const result = await sendOtp(name.trim(), normalizedPhone, 'Counsellor Assessment');
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
    try {
      const result = await submitAssessment(name.trim(), normalizedPhone, answers);
      if (result.success) {
        setSubmittedResult({
          score: result.data?.score ?? 0,
          maxScore: result.data?.maxScore ?? 10,
          questionResults: result.data?.questionResults ?? []
        });
        setShowSuccessPopup(true);
      } else {
        const message =
          result.status === 404
            ? 'Assessment service is temporarily unavailable. Please try again in a few minutes or contact support.'
            : (result.message || 'Failed to submit assessment. Please try again.');
        setSubmitError(message);
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#003366' }}>GuideXpert</h1>
          <p className="text-gray-600 mt-1">Counsellor Assessment</p>
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 && 'Your details'}
              {step === 2 && 'OTP Verification'}
              {step === 3 && 'Questions'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#003366] h-1.5 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#003366' }}>Enter your details</h2>
              <p className="text-sm text-gray-600 mb-6">We will send an OTP to your mobile number before the assessment.</p>
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                  {successMessage}
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                  {submitError}
                </div>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#003366] hover:bg-[#004080] text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#003366' }}>Verify your number</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter the 6-digit OTP sent to ****{mobileNumber.slice(-4)}
              </p>
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                  {successMessage}
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                  {submitError}
                </div>
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
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] border-gray-300"
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
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || loading}
                    className="flex-[2] py-3 px-4 bg-[#003366] hover:bg-[#004080] text-white font-medium rounded-lg transition disabled:opacity-60"
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
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#003366' }}>Assessment questions</h2>
              <p className="text-sm text-gray-600 mb-4">You can go back to the previous step to change your details.</p>

              {/* Question progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Question {questionIndex + 1} of {flatQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#003366] h-1.5 rounded-full transition-all"
                    style={{ width: `${((questionIndex + 1) / flatQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitAssessment} onKeyDown={handleAssessmentFormKeyDown} className="space-y-6">
                <div className="rounded-2xl bg-white border border-gray-100 border-l-4 border-l-[#003366] shadow-lg overflow-hidden p-6 sm:p-8">
                  {(() => {
                    const q = flatQuestions[questionIndex];
                    if (!q) return null;
                    return (
                      <div key={q.id}>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#003366] mb-4">
                          {q.sectionTitle}
                        </h3>
                        <p className="text-lg font-semibold text-gray-900 mb-6">{q.text}</p>
                        {q.type === 'mcq' ? (
                          <div className="space-y-4">
                            {q.options.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx);
                              const isSelected = (answers[q.id] || '') === opt;
                              return (
                                <label
                                  key={opt}
                                  className={`flex items-center gap-4 w-full rounded-xl border-2 py-4 px-4 transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'border-[#003366] bg-[#003366]/10'
                                      : 'border-gray-200 bg-gray-50/50 hover:border-[#003366]/30 hover:bg-[#003366]/5'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={isSelected}
                                    onChange={() => setAnswer(q.id, opt)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                                      isSelected ? 'bg-[#003366] text-white' : 'bg-[#003366]/10 text-[#003366]'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswer(q.id, e.target.value)}
                              placeholder="Type your answer here (e.g. two ethical lead sources)"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] outline-none text-sm text-slate-800"
                            />
                            {q.points && (
                              <p className="mt-1 text-xs text-gray-500">Points: {q.points}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => (questionIndex > 0 ? setQuestionIndex((i) => i - 1) : handleBackToOtp())}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-60"
                  >
                    Back
                  </button>
                  {questionIndex < flatQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setQuestionIndex((i) => i + 1)}
                      className="flex-1 py-3 px-4 bg-[#003366] hover:bg-[#004080] text-white font-medium rounded-lg transition"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-4 bg-[#003366] hover:bg-[#004080] text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {step === 3 && submittedResult && (
            <div className="py-6 p-4 rounded-xl border border-[#003366]/20 bg-[#003366]/5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#003366]/10 mb-4" style={{ color: '#003366' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#003366' }}>Assessment submitted successfully</h2>
                <p className="text-gray-600 mb-2">Your score</p>
                <p className="text-3xl font-bold" style={{ color: '#003366' }}>
                  {submittedResult.score} / {submittedResult.maxScore}
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  {submittedResult.score === submittedResult.maxScore
                    ? 'Well done! All answers correct.'
                    : 'Review the questions below to improve.'}
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Thank you for completing the counsellor assessment.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-[#003366]/20">
                <h3 className="text-sm font-semibold text-gray-800 mb-3" style={{ color: '#003366' }}>Detailed report</h3>
                {(!submittedResult.questionResults || submittedResult.questionResults.length === 0) ? (
                  <p className="text-sm text-gray-600">Report not available.</p>
                ) : (() => {
                  const incorrect = submittedResult.questionResults.filter((r) => !r.correct);
                  if (incorrect.length === 0) {
                    return <p className="text-sm text-gray-600">All answers correct.</p>;
                  }
                  return (
                    <ul className="space-y-4">
                      {incorrect.map((r) => (
                        <li key={r.questionId} className="p-3 rounded-lg bg-white border border-gray-200 text-left">
                          <p className="text-sm font-medium text-gray-800 mb-1.5">{questionTextMap[r.questionId] ?? r.questionId}</p>
                          <p className="text-xs text-red-600"><span className="font-medium">Your answer:</span> {r.userAnswer || '—'}</p>
                          <p className="text-xs text-green-700 mt-0.5"><span className="font-medium">Correct answer:</span> {r.correctAnswer}</p>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          )}
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

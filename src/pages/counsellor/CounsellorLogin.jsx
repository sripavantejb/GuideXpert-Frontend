import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../utils/api';
import { useCounsellorAuth } from '../../contexts/CounsellorAuthContext';

function validateMobile(value) {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  if (!digits) return 'Mobile number is required';
  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits';
  return '';
}

export default function CounsellorLogin() {
  const { loginWithPhone, isAuthenticated } = useCounsellorAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [mobileError, setMobileError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpInputRefs = useRef([]);

  if (isAuthenticated) {
    return <Navigate to="/counsellor/dashboard" replace />;
  }

  const handleMobileChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(v);
    setMobileError(validateMobile(v));
    setSubmitError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const err = validateMobile(mobileNumber);
    setMobileError(err);
    if (err) {
      setSubmitError('Please fix the errors above.');
      return;
    }
    setSubmitError('');
    setSuccessMessage('');
    setLoading(true);
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    try {
      const result = await sendOtp('Counsellor', normalizedPhone, 'Counsellor Login');
      if (result.success) {
        setSuccessMessage('OTP sent successfully to your mobile number');
        setStep(2);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        if (result.status === 429) {
          setSubmitError(result.message || 'Too many OTP requests. Please try again after some time.');
        } else {
          setSubmitError(result.message || 'Failed to send OTP. Please try again.');
        }
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
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    try {
      const result = await verifyOtp(normalizedPhone, otpString);
      if (result.success && result.data?.verified === true) {
        const loginResult = await loginWithPhone(normalizedPhone);
        if (loginResult.success) {
          navigate('/counsellor/dashboard', { replace: true });
          return;
        }
        setOtpError(loginResult.message || 'No counsellor account linked to this number.');
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
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    try {
      const result = await sendOtp('Counsellor', normalizedPhone, 'Counsellor Login');
      if (result.success) {
        setSuccessMessage('OTP resent successfully');
        otpInputRefs.current[0]?.focus();
      } else {
        setSubmitError(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setSubmitError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
          style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary-blue-600 mb-2" style={{ color: '#003366' }}>
              GuideXpert Counsellor
            </h1>
            <p className="text-gray-500 text-sm">Sign in to your Certified Counsellor Dashboard</p>
          </div>

          {step === 2 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Step 2 of 2</span>
                <span>OTP Verification</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-primary-blue-600 h-1.5 rounded-full transition-all" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {step === 1 && (
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Enter your mobile number</h2>
          )}
          {step === 2 && (
            <p className="text-sm text-gray-600 mb-6">
              Enter the 6-digit OTP sent to ****{mobileNumber.slice(-4)}
            </p>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm" role="status">
              {successMessage}
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
              {submitError}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="counsellor-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile number <span className="text-red-500">*</span>
                </label>
                <input
                  id="counsellor-mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="10-digit mobile number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none ${
                    mobileError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                />
                {mobileError && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {mobileError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-primary-blue-600 hover:bg-primary-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#003366' }}
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
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
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none border-gray-300"
                      aria-label={`OTP digit ${index + 1}`}
                      disabled={verifying}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-2 text-sm text-red-600 text-center" role="alert">
                    {otpError}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={verifying || loading}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={verifying || loading}
                  className="flex-[2] py-3 px-4 rounded-lg font-medium text-white bg-primary-blue-600 hover:bg-primary-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: '#003366' }}
                >
                  {verifying ? 'Signing in…' : 'Verify & Sign in'}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || verifying}
                  className="text-sm text-primary-blue-600 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ color: '#003366' }}
                >
                  {loading ? 'Resending…' : "Didn't receive OTP? Resend"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

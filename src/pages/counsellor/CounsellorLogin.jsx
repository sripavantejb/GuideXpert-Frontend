import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCounsellorAuth } from '../../contexts/CounsellorAuthContext';

export default function CounsellorLogin() {
  const { sendCounsellorOtp, loginWithOtp, isAuthenticated } = useCounsellorAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (isAuthenticated) {
    return <Navigate to="/counsellor/dashboard" replace />;
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = phone.replace(/\D/g, '');
    if (trimmed.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    const result = await sendCounsellorOtp(trimmed);
    setLoading(false);
    if (result.success) {
      setStep(2);
      setError('');
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      setError(result.message || 'Could not send OTP');
      if (result.data?.retryAfter != null) setCooldown(result.data.retryAfter);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit OTP');
      return;
    }
    const trimmedPhone = phone.replace(/\D/g, '').slice(-10);
    setLoading(true);
    const result = await loginWithOtp(trimmedPhone, otp);
    setLoading(false);
    if (result.success) {
      navigate('/counsellor/dashboard', { replace: true });
    } else {
      setError(result.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-xl shadow-lg p-8"
          style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#003366' }}>
            GuideXpert Counsellor
          </h1>
          <p className="text-gray-500 text-sm mb-6">Sign in with your mobile number</p>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  autoComplete="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none"
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#003366' }}
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-600">
                OTP sent to ****{phone.replace(/\D/g, '').slice(-4)}
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="ml-2 text-[#003366] font-medium hover:underline"
                >
                  Change
                </button>
              </p>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoComplete="one-time-code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] outline-none text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#003366' }}
              >
                {loading ? 'Verifying…' : 'Verify & Sign in'}
              </button>
              {cooldown > 0 ? (
                <p className="text-center text-sm text-gray-500">Resend OTP in {cooldown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-sm text-[#003366] font-medium hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

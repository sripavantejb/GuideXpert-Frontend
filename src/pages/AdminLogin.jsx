import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getAdminApiBaseUrl } from '../utils/adminApi';
import { sendOtp, verifyOtp } from '../utils/api';

function normalizePhone10(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export default function AdminLogin() {
  const { login, loginWithPhone, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loginHint, setLoginHint] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setLoginHint('');
    setInfo('');
    setOtpSent(false);
    setOtp('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoginHint('');
    setInfo('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.message || 'Login failed');
      if (result.data?.hint) setLoginHint(result.data.hint);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setInfo('');
    const p = normalizePhone10(phone);
    if (!/^\d{10}$/.test(p)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const result = await sendOtp('Admin', p, 'Admin Login');
      if (!result.success) {
        const msg = result.message || 'Could not send OTP.';
        setError(
          result.status === 500 && import.meta.env.DEV
            ? `${msg} Start the backend in a terminal: cd backend && npm run dev`
            : msg
        );
        return;
      }
      setOtpSent(true);
      setOtp('');
      setInfo('OTP sent. Enter the 6-digit code to continue.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const p = normalizePhone10(phone);
    const otpStr = String(otp ?? '').trim();
    if (!/^\d{10}$/.test(p)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(otpStr)) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const verifyResult = await verifyOtp(p, otpStr);
      if (!verifyResult.success || verifyResult.data?.verified !== true) {
        setError(verifyResult.message || verifyResult.data?.message || 'Invalid OTP.');
        return;
      }
      const loginResult = await loginWithPhone(p);
      if (loginResult.success) {
        navigate('/admin', { replace: true });
        return;
      }
      setError(loginResult.message || 'Admin login failed.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
      {/* Radial glow behind card */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div className="w-[480px] h-[480px] rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
        <div
          className="w-full bg-white rounded-2xl p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_24px_56px_rgba(0,0,0,0.12)]"
          style={error ? { animation: 'loginShake 0.4s ease-in-out' } : undefined}
        >
          {/* Brand section */}
          <div className="text-center mb-8">
            <img
              src="https://res.cloudinary.com/dfqdb1xws/image/upload/v1773394627/GuideXpert_Logo_2_icepsv.png"
              alt="GuideXpert"
              className="h-10 w-auto object-contain mx-auto mb-3"
            />
            <p className="text-sm font-medium text-gray-500 mt-0.5">Admin Portal</p>
            <p className="text-sm text-gray-400 mt-0.5">Sign in to access admin dashboard</p>

          </div>

          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
            <button type="button" onClick={() => switchMode('password')} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'password' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Password</button>
            <button type="button" onClick={() => switchMode('phone')} className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'phone' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Phone OTP</button>
          </div>

          {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Username"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            {/* Error / hint */}
            {error && (
              <div className="space-y-0.5" role="alert">
                <p className="text-sm text-red-600">{error}</p>
                {loginHint && <p className="text-xs text-gray-500">{loginHint}</p>}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {import.meta.env.DEV && (
              <div className="mt-4 space-y-1 text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Dev: use <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">admin</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">admin123</kbd>
                </p>
                <p className="text-xs text-gray-400">API: {getAdminApiBaseUrl()}</p>
              </div>
            )}
          </form>
          ) : (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-phone" className="block text-sm font-medium text-gray-700 mb-1.5">Mobile number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden />
                  <input
                    id="admin-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              {otpSent ? (
                <div>
                  <label htmlFor="admin-otp" className="block text-sm font-medium text-gray-700 mb-1.5">OTP</label>
                  <input
                    id="admin-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              ) : null}
              {info ? <p className="text-sm text-green-600">{info}</p> : null}
              {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
              <div className="flex gap-2">
                {!otpSent ? (
                  <button type="button" onClick={handleSendOtp} disabled={loading} className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] disabled:opacity-70">
                    {loading ? 'Sending…' : 'Send OTP'}
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] disabled:opacity-70">
                    {loading ? 'Signing in…' : 'Verify & sign in'}
                  </button>
                )}
              </div>
            </form>
          )}

        </div>

        <p className="mt-6 text-xs text-gray-400">© 2026 GuideXpert</p>
      </div>

      <style>{`@keyframes loginShake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }`}</style>
    </div>
  );
}
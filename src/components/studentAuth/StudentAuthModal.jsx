import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { sendOtp, verifyOtp, saveStep1, saveStep2 } from '../../utils/api';
import { STUDYING_OPTIONS, getStudentProfile, normalizePhone } from '../../utils/studentProfileStore';
import { useStudentAuthRequired } from '../../contexts/StudentAuthContext';
import {
  STUDENT_WORKSPACE_LEAD_UTM,
  STUDENT_WORKSPACE_OCCUPATION,
} from '../../utils/studentWorkspaceLeadConstants';
import {
  swBtnGhost,
  swBtnPrimary,
  swErrorBox,
  swInput,
  swLabel,
  swOtpInput,
  swSelect,
  swSuccess,
} from '../../pages/studentsTools/components/studentWorkspaceUi';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export default function StudentAuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    completeAuth,
  } = useStudentAuthRequired();

  const [step, setStep] = useState(/** @type {'details' | 'otp'} */ ('details'));
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [currentlyStudying, setCurrentlyStudying] = useState('');
  const [city, setCity] = useState('');
  const [otp, setOtp] = useState(() => ['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef(/** @type {(HTMLInputElement | null)[]} */ ([]));

  const isSignup = authModalMode === 'signup';

  useEffect(() => {
    if (!authModalOpen) return;
    setStep('details');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setInfo('');
    setLoading(false);
    if (authModalMode === 'signup') {
      setFullName('');
      setPhone('');
      setAge('');
      setCurrentlyStudying('');
      setCity('');
    }
  }, [authModalOpen, authModalMode]);

  useEffect(() => {
    if (!authModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    setInfo('');

    const phoneNorm = normalizePhone(phone);
    if (phoneNorm.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNorm)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    let name = fullName.trim();
    let ageVal = age;
    let studying = currentlyStudying;
    let cityVal = city.trim();
    let profileOptions;

    if (isSignup) {
      if (name.length < 2) {
        setError('Enter your full name.');
        return;
      }
      const ageNum = Number(ageVal);
      if (!ageVal || Number.isNaN(ageNum) || ageNum < 10 || ageNum > 80) {
        setError('Enter a valid age (10–80).');
        return;
      }
      if (!studying) {
        setError('Select what you are currently studying.');
        return;
      }
      profileOptions = {
        studentProfile: {
          age: ageNum,
          currentlyStudying:
            STUDYING_OPTIONS.find((o) => o.value === studying)?.label || studying,
          city: cityVal || undefined,
        },
      };
    } else {
      // Login: mobile + OTP only — reuse local profile name if present
      const existing = getStudentProfile(phoneNorm);
      if (existing) {
        name = existing.fullName || 'Student';
        ageVal = existing.age != null ? String(existing.age) : '';
        studying = existing.currentlyStudying || '';
        cityVal = existing.city || '';
        setFullName(name);
        if (existing.age != null) setAge(String(existing.age));
        if (existing.currentlyStudying) setCurrentlyStudying(existing.currentlyStudying);
        if (existing.city) setCity(existing.city);
        profileOptions = {
          studentProfile: {
            age: existing.age,
            currentlyStudying: existing.currentlyStudying,
            city: existing.city,
          },
        };
      } else {
        name = 'Student';
      }
    }

    setLoading(true);
    try {
      const sendRes = await sendOtp(name || 'Student', phoneNorm, STUDENT_WORKSPACE_OCCUPATION);
      if (!sendRes.success) {
        setError(sendRes.message || 'Could not send OTP. Try again.');
        return;
      }
      await saveStep1(
        name || 'Student',
        phoneNorm,
        STUDENT_WORKSPACE_OCCUPATION,
        STUDENT_WORKSPACE_LEAD_UTM,
        {
          ...(profileOptions || {}),
          ...(!isSignup ? { loginOnly: true } : {}),
        }
      );
      setStep('otp');
      setInfo('OTP sent to your mobile number.');
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    const phoneNorm = normalizePhone(phone);
    setLoading(true);
    try {
      const verifyRes = await verifyOtp(phoneNorm, code);
      if (!verifyRes.success) {
        setError(verifyRes.message || 'Invalid OTP. Try again.');
        return;
      }

      await saveStep2(phoneNorm, STUDENT_WORKSPACE_LEAD_UTM);

      let name = fullName.trim();
      let ageVal = age;
      let studying = currentlyStudying;
      let cityVal = city.trim();

      if (!isSignup) {
        const existing = getStudentProfile(phoneNorm);
        if (existing) {
          name = existing.fullName || name;
          ageVal = existing.age != null ? String(existing.age) : ageVal;
          studying = existing.currentlyStudying || studying;
          cityVal = existing.city || cityVal;
        }
      }

      if (name.length < 2) name = 'Student';

      completeAuth({
        phone: phoneNorm,
        fullName: name,
        age: ageVal ? Number(ageVal) : null,
        currentlyStudying: studying,
        city: cityVal,
      });
    } catch (err) {
      setError(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const d = digitsOnly(value).slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = d;
      return next;
    });
    if (d && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = digitsOnly(e.clipboardData.getData('text')).slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const chars = text.split('');
    setOtp((prev) => prev.map((_, i) => chars[i] || ''));
    otpRefs.current[Math.min(chars.length, 5)]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="student-auth-title">
      <button
        type="button"
        className="absolute inset-0 bg-[#041e30]/55 backdrop-blur-[2px]"
        aria-label="Close login"
        onClick={closeAuthModal}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden border border-white/20 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:mx-4 sm:rounded-none">
        <div className="flex items-start justify-between gap-3 border-b border-[#e4e9f0] bg-[#f7f8fb] px-5 py-4">
          <div>
            <p className="font-sw-display text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f27921]">
              GuideXpert
            </p>
            <h2 id="student-auth-title" className="mt-1 font-sw-display text-xl font-bold text-[#041e30]">
              {isSignup ? 'Create your student profile' : 'Login with mobile OTP'}
            </h2>
            <p className="mt-1 text-sm text-[#5a6570]">
              {isSignup
                ? 'Tell us about yourself — we save predictions to your profile and admin leads.'
                : 'Enter your mobile number. We’ll send a one-time password to continue.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[#5a6570] hover:bg-white hover:text-[#041e30]"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {step === 'details' ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              {isSignup ? (
                <>
                  <label className={swLabel}>
                    Full name
                    <input
                      className={swInput}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                    />
                  </label>
                  <label className={swLabel}>
                    Age
                    <input
                      className={swInput}
                      type="number"
                      min={10}
                      max={80}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 17"
                    />
                  </label>
                  <label className={swLabel}>
                    Currently studying
                    <select
                      className={swSelect}
                      value={currentlyStudying}
                      onChange={(e) => setCurrentlyStudying(e.target.value)}
                    >
                      <option value="">Select</option>
                      {STUDYING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={swLabel}>
                    City <span className="font-normal text-[#8a94a0]">(optional)</span>
                    <input
                      className={swInput}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad"
                    />
                  </label>
                </>
              ) : null}

              <label className={swLabel}>
                Mobile number
                <input
                  className={swInput}
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 10))}
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                />
              </label>

              {error ? <p className={swErrorBox}>{error}</p> : null}
              {info ? <p className={swSuccess}>{info}</p> : null}

              <button type="submit" className={swBtnPrimary} disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-[#5a6570]">
                {isSignup ? (
                  <>
                    Already have a profile?{' '}
                    <button
                      type="button"
                      className="font-semibold text-[#f27921] hover:underline"
                      onClick={() => setAuthModalMode('login')}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    New here?{' '}
                    <button
                      type="button"
                      className="font-semibold text-[#f27921] hover:underline"
                      onClick={() => setAuthModalMode('signup')}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerify}>
              <button
                type="button"
                className={swBtnGhost}
                onClick={() => {
                  setStep('details');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
              >
                ← Back
              </button>
              <p className="text-sm text-[#5a6570]">
                Enter the 6-digit OTP sent to <span className="font-semibold text-[#041e30]">{normalizePhone(phone)}</span>
              </p>
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className={swOtpInput}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              {error ? <p className={swErrorBox}>{error}</p> : null}
              {info ? <p className={swSuccess}>{info}</p> : null}
              <button type="submit" className={swBtnPrimary} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & continue'}
              </button>
              <button
                type="button"
                className="w-full text-sm font-semibold text-[#5a6570] underline hover:text-[#041e30]"
                disabled={loading}
                onClick={handleSendOtp}
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

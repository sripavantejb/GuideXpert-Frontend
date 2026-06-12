import { useEffect, useRef, useState } from 'react';
import { neoInputClass, neoLabelClass } from '../oneOnOneSession/FormControls';
import { sendOtp, verifyOtp } from '../../utils/api';

/**
 * Mobile number field with Send OTP / 6-digit verify flow (IIT counselling pattern).
 */
const MOBILE_ONLY_OTP_NAME = 'Student';

export default function MobileOtpField({
  label = '2. Mobile Number',
  fullName,
  mobileNumber,
  onMobileChange,
  error: externalError,
  onVerifiedChange,
  occupation = '1-on-1 Counseling',
  className = 'sm:col-span-2',
  required = true,
  requireName = true,
}) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    onVerifiedChange?.(otpVerified);
  }, [otpVerified, onVerifiedChange]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setInterval(() => {
      setResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  useEffect(() => {
    if (otpSent && !otpVerified) {
      const first = otpInputRefs.current[0];
      if (first) {
        const timeout = setTimeout(() => first.focus(), 50);
        return () => clearTimeout(timeout);
      }
    }
    return undefined;
  }, [otpSent, otpVerified]);

  const otpFullName = () => {
    const name = String(fullName ?? '').trim();
    if (requireName) return name;
    return name.length >= 2 ? name : MOBILE_ONLY_OTP_NAME;
  };

  const canRequestOtp = () => {
    const phone = String(mobileNumber ?? '').trim();
    if (!/^\d{10}$/.test(phone)) return false;
    if (!requireName) return true;
    return String(fullName ?? '').trim().length >= 2;
  };

  const missingOtpRequirementHint = () => {
    const phone = String(mobileNumber ?? '').trim();
    if (!/^\d{10}$/.test(phone)) return 'Enter a valid 10-digit mobile number to enable OTP.';
    if (requireName && String(fullName ?? '').trim().length < 2) {
      return 'Enter student name to enable OTP.';
    }
    return '';
  };

  const handlePhoneChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    onMobileChange(digits);
    if (!otpVerified) {
      if (otpSent) {
        setOtpSent(false);
        setOtp('');
        setOtpError('');
        setOtpInfo('');
      }
    }
  };

  const handleSendOtp = async () => {
    if (otpLoading || resendIn > 0) return;
    setOtpError('');
    setOtpInfo('');
    if (!canRequestOtp()) {
      setOtpError(missingOtpRequirementHint() || 'Please complete name and mobile number first.');
      return;
    }
    setOtpLoading(true);
    try {
      const result = await sendOtp(
        otpFullName(),
        String(mobileNumber).trim(),
        occupation
      );
      if (!result.success) {
        throw new Error(result.message || 'Could not send OTP.');
      }
      setOtpSent(true);
      setOtp('');
      setResendIn(30);
      setOtpInfo('OTP sent to your mobile number.');
    } catch (err) {
      const message = err?.message || 'Could not send OTP. Please try again.';
      const friendly = /failed to fetch|networkerror|typeerror/i.test(message)
        ? 'Could not reach the OTP service. Please check your internet and try again.'
        : message;
      setOtpError(friendly);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpLoading) return;
    setOtpError('');
    setOtpInfo('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError('Enter the 6-digit OTP you received.');
      return;
    }
    setOtpLoading(true);
    try {
      const result = await verifyOtp(String(mobileNumber).trim(), otp.trim());
      if (!result.success) {
        throw new Error(result.message || 'Invalid OTP. Please try again.');
      }
      setOtpVerified(true);
      setOtp('');
      setOtpError('');
      setOtpInfo('Mobile number verified successfully.');
    } catch (err) {
      setOtpError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEditPhone = () => {
    setOtpVerified(false);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setOtpInfo('');
    setResendIn(0);
  };

  const updateOtpDigit = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const chars = prev.split('');
      while (chars.length < 6) chars.push('');
      chars[index] = digit;
      return chars.slice(0, 6).join('');
    });
    if (otpError) setOtpError('');
    if (digit && index < 5) {
      const next = otpInputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    const key = event.key;
    if (key === 'Backspace') {
      event.preventDefault();
      setOtp((prev) => {
        const chars = prev.split('');
        while (chars.length < 6) chars.push('');
        if (chars[index]) {
          chars[index] = '';
          return chars.join('');
        }
        if (index > 0) {
          chars[index - 1] = '';
          const prevInput = otpInputRefs.current[index - 1];
          if (prevInput) prevInput.focus();
        }
        return chars.join('');
      });
      if (otpError) setOtpError('');
      return;
    }
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = otpInputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    } else if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      const nextInput = otpInputRefs.current[index + 1];
      if (nextInput) nextInput.focus();
    } else if (key === 'Enter' && otp.length === 6) {
      event.preventDefault();
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (event) => {
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    setOtp(digits);
    if (otpError) setOtpError('');
    const focusIndex = Math.min(digits.length, 5);
    const target = otpInputRefs.current[focusIndex];
    if (target) target.focus();
  };

  return (
    <div className={className}>
      <label className={neoLabelClass} htmlFor="mobileNumber">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <input
            id="mobileNumber"
            name="mobileNumber"
            className={`${neoInputClass} ${otpVerified ? 'bg-emerald-50 pr-28' : 'pr-24'} ${
              externalError ? 'border-red-800 bg-red-50' : ''
            }`}
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            value={mobileNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            readOnly={otpVerified}
            aria-invalid={Boolean(externalError)}
            aria-required={required ? 'true' : undefined}
            required={required}
            placeholder="10-digit number"
          />
          {otpVerified ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border-2 border-emerald-700 bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">
              Verified
            </span>
          ) : null}
        </div>
        {otpVerified ? (
          <button
            type="button"
            onClick={handleEditPhone}
            className="rounded-[10px] border-2 border-[#0F172A] bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-[#0F172A] transition-all hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpLoading || resendIn > 0 || !canRequestOtp()}
            title={
              !canRequestOtp()
                ? missingOtpRequirementHint()
                : resendIn > 0
                  ? `Resend available in ${resendIn}s`
                  : undefined
            }
            className="rounded-[10px] border-2 border-[#0F172A] bg-[#0F172A] px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-[3px_3px_0px_#c7f36b] transition-all hover:-translate-y-0.5 hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {otpLoading && !otpSent
              ? 'Sending...'
              : otpSent
                ? resendIn > 0
                  ? `Resend in ${resendIn}s`
                  : 'Resend OTP'
                : 'Send OTP'}
          </button>
        )}
      </div>
      {externalError ? (
        <p className="mt-1 text-xs font-bold text-red-700">{externalError}</p>
      ) : null}
      {!otpVerified && !otpSent && !externalError && !canRequestOtp() && missingOtpRequirementHint() ? (
        <p className="mt-1 text-xs font-semibold text-slate-600">{missingOtpRequirementHint()}</p>
      ) : null}

      {otpSent && !otpVerified ? (
        <div className="mt-3 rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] p-3">
          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-[#0F172A]">
            Enter OTP
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2" onPaste={handleOtpPaste}>
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => updateOtpDigit(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`OTP digit ${index + 1}`}
                  className="h-12 w-12 rounded-[10px] border-2 border-[#0F172A] bg-white text-center text-lg font-black text-[#0F172A] outline-none transition-all focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#0F172A]"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
              className="rounded-[10px] border-2 border-[#0F172A] bg-[#c7f36b] px-5 py-3 text-xs font-black uppercase tracking-wide text-[#0F172A] shadow-[3px_3px_0px_#0F172A] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          {otpError ? (
            <p className="mt-2 text-xs font-bold text-red-700">{otpError}</p>
          ) : otpInfo ? (
            <p className="mt-2 text-xs font-bold text-emerald-800">{otpInfo}</p>
          ) : null}
        </div>
      ) : null}
      {otpVerified && otpInfo ? (
        <p className="mt-2 text-xs font-bold text-emerald-800">{otpInfo}</p>
      ) : null}
      {!otpSent && otpError ? (
        <p className="mt-2 text-xs font-bold text-red-700">{otpError}</p>
      ) : null}
    </div>
  );
}

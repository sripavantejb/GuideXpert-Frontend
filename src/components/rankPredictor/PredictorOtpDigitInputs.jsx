import { useRef } from 'react';
import { swOtpInput } from '../../pages/studentsTools/components/studentWorkspaceUi';

/**
 * Shared 6-digit OTP inputs for student predictor lead gates (rank + college).
 */
export default function PredictorOtpDigitInputs({
  otp,
  onChange,
  onCompletePaste,
  className = swOtpInput,
}) {
  const refs = useRef(/** @type {(HTMLInputElement | null)[]} */ ([]));

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const chars = pasted.split('');
    const next = [...otp];
    for (let i = 0; i < 6; i += 1) next[i] = chars[i] || '';
    onChange(next);
    if (typeof onCompletePaste === 'function') onCompletePaste(next);
    const last = Math.min(chars.length - 1, 5);
    refs.current[last]?.focus();
  };

  return (
    <div className="flex flex-wrap gap-2" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={className}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

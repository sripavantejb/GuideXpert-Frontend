import { useCallback, useRef, useState } from 'react';
import MobileOtpField from '../components/forms/MobileOtpField';
import { joinGuidanceMeet } from '../utils/guidanceBookingApi';

function normalizeMobile(val) {
  return String(val || '')
    .replace(/\D/g, '')
    .slice(-10)
    .slice(0, 10);
}

export default function GuidanceSessionMeet() {
  const [mobile, setMobile] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [slotInfo, setSlotInfo] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const joiningRef = useRef(false);

  const attemptJoinMeet = useCallback(async (phone) => {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setError('');
    setSlotInfo(null);
    setRedirecting(true);

    const res = await joinGuidanceMeet(phone);
    if (!res.success) {
      joiningRef.current = false;
      setRedirecting(false);
      setError(res.message || 'Could not join your session. Please try again.');
      if (res.data) {
        setSlotInfo(res.data);
      }
      return;
    }

    const meetLink = res.data?.meetLink;
    if (!meetLink) {
      joiningRef.current = false;
      setRedirecting(false);
      setError('Meet link is unavailable. Please contact the GuideXpert team.');
      return;
    }

    window.location.href = meetLink;
  }, []);

  const handleOtpVerifiedChange = useCallback(
    (verified) => {
      setOtpVerified(verified);
      if (verified) {
        const phone = normalizeMobile(mobile);
        if (phone.length === 10) {
          attemptJoinMeet(phone);
        }
      } else {
        joiningRef.current = false;
        setRedirecting(false);
        setError('');
        setSlotInfo(null);
      }
    },
    [mobile, attemptJoinMeet]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-[14px] border-2 border-[#0F172A] bg-[#0F172A] p-6 text-white shadow-[6px_6px_0px_#c7f36b]">
          <p className="mb-2 inline-flex rounded border border-slate-600 bg-[#1E293B] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Guidance session meet
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Join Your 1-on-1 Guidance Session
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Enter the mobile number you used to book, verify with OTP, and join your counsellor&apos;s
            Google Meet during your scheduled slot time.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-200">
            <li className="rounded border border-slate-600 bg-[#1E293B] px-2 py-1">
              Confirmed booking required
            </li>
            <li className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 text-emerald-100">
              Join during your slot time
            </li>
          </ul>
        </div>

        <div className="rounded-[14px] border-2 border-[#0F172A] bg-white p-5 shadow-[6px_6px_0px_#0F172A] sm:p-7">
          <p className="mb-4 text-xs font-semibold text-slate-600">
            Use the same mobile number from your guidance booking confirmation. OTP verification is
            required before you can enter the session.
          </p>

          <MobileOtpField
            label="Student mobile number"
            mobileNumber={mobile}
            onMobileChange={(digits) => {
              setMobile(digits);
              setOtpVerified(false);
              joiningRef.current = false;
              setRedirecting(false);
              setError('');
              setSlotInfo(null);
            }}
            error={error}
            onVerifiedChange={handleOtpVerifiedChange}
            requireName={false}
            occupation="Guidance Session Meet"
          />

          {redirecting ? (
            <div className="mt-6 rounded-[12px] border-2 border-[#0F172A] bg-[#c7f36b] px-4 py-3 text-sm font-black text-[#0F172A] shadow-[4px_4px_0px_#0F172A]">
              OTP verified. Redirecting you to your Google Meet session…
            </div>
          ) : null}

          {error ? (
            <div
              className="mt-6 rounded-[12px] border-2 border-red-800 bg-red-50 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              <p className="font-bold">{error}</p>
              {slotInfo?.slot ? (
                <p className="mt-2 text-xs font-medium text-red-800">
                  Session: {slotInfo.slot.sessionTitle} ({slotInfo.slot.slotDate} ·{' '}
                  {slotInfo.slot.slotTime})
                  {slotInfo.counselor?.name ? ` · Counsellor: ${slotInfo.counselor.name}` : ''}
                </p>
              ) : null}
              {slotInfo?.counselor?.name && !slotInfo?.slot ? (
                <p className="mt-2 text-xs font-medium text-red-800">
                  Counsellor: {slotInfo.counselor.name}
                </p>
              ) : null}
              {Array.isArray(slotInfo?.counselorsWithoutMeetLink) &&
              slotInfo.counselorsWithoutMeetLink.length > 0 ? (
                <div className="mt-3 rounded-[10px] border border-red-300 bg-white px-3 py-2 text-xs text-red-900">
                  <p className="font-bold">Counsellors without a meet link configured yet:</p>
                  <ul className="mt-1 list-disc pl-5">
                    {slotInfo.counselorsWithoutMeetLink.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {!otpVerified && !redirecting ? (
            <p className="mt-6 text-xs font-semibold text-slate-500">
              Haven&apos;t booked yet?{' '}
              <a
                href="/guidance-booking-confirmation"
                className="font-bold text-[#0F172A] underline underline-offset-2"
              >
                Book your guidance session slot
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

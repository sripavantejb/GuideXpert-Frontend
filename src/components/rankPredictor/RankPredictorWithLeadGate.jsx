import { useRef, useState } from 'react';
import {
  getRankPredictorInputPlaceholder,
  getRankPredictorInputStep,
  validateRankPredictorScore,
} from '../../utils/rankPredictor';
import {
  predictRankPublic,
  sendOtp,
  verifyOtp,
  saveStep1,
  saveStep2,
  saveRankPredictorPrediction,
} from '../../utils/api';
import {
  RANK_PREDICTOR_LEAD_OCCUPATION,
  RANK_PREDICTOR_LEAD_UTM,
} from '../../utils/rankPredictorLeadConstants';
import { saveOrganicRankLeadSnapshot } from '../../utils/organicRankLeadLocal';
import ResultCard from './ResultCard';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import {
  swBtnGhost,
  swBtnPrimary,
  swBtnSecondary,
  swCard,
  swErrorBox,
  swInput,
  swLabel,
  swOtpInput,
  swPreviewLabel,
  swSelect,
  swSuccess,
  swWarningBox,
} from '../../pages/studentsTools/components/studentWorkspaceUi';

export default function RankPredictorWithLeadGate({
  exam,
  variant,
  onResultChange = () => {},
  resultsRef,
  headerSlot = null,
}) {
  const isStudent = variant === 'student';
  /** Logged-in counsellor portal: predict from score only (no OTP / lead capture). */
  const isCounsellor = variant === 'counsellor';
  const studentAuth = useStudentAuth();
  const alreadyLoggedIn = Boolean(isStudent && studentAuth?.isAuthenticated);

  const [wizardStep, setWizardStep] = useState(/** @type {'marks' | 'lead' | 'result'} */ ('marks'));
  const [score, setScore] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(() => ['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [marksError, setMarksError] = useState('');
  const [leadError, setLeadError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [numericScore, setNumericScore] = useState(/** @type {number | null} */ (null));
  const [publicResult, setPublicResult] = useState(null);
  /** Shown when prediction could not be persisted for admin (student flow). */
  const [predictionSyncError, setPredictionSyncError] = useState('');

  const otpInputRefs = useRef(/** @type {(HTMLInputElement | null)[]} */ ([]));

  const inputStep = getRankPredictorInputStep(exam);
  const leadUtm = RANK_PREDICTOR_LEAD_UTM;

  const rankPredictorLeadPayload = () => ({
    examId: exam.id,
    score: numericScore,
    ...(exam.requiresDifficulty && difficulty ? { difficulty } : {}),
  });

  const resetFlow = () => {
    setWizardStep('marks');
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setNumericScore(null);
    setPublicResult(null);
    setMarksError('');
    setLeadError('');
    setOtpError('');
    setSuccessMessage('');
    setPredictionSyncError('');
    onResultChange(null);
  };

  const persistToStudentProfile = (normalized, scoreValue) => {
    if (!studentAuth?.savePrediction) return;
    const rangeText =
      normalized.range && typeof normalized.range === 'object'
        ? `${normalized.range.low ?? ''} – ${normalized.range.high ?? ''}`
        : normalized.range
          ? String(normalized.range)
          : '';
    studentAuth.savePrediction({
      type: 'rank_predictor',
      tool: 'Rank Predictor',
      examId: exam.id,
      title: `${exam.name} prediction`,
      summary: [
        normalized.metricLabel || 'Predicted',
        normalized.predictedValue != null ? String(normalized.predictedValue) : null,
        rangeText ? `range ${rangeText}` : null,
        scoreValue != null ? `score ${scoreValue}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      payload: {
        examId: exam.id,
        examName: exam.name,
        score: scoreValue,
        ...normalized,
      },
    });
  };

  const runDirectPrediction = async (scoreValue) => {
    setPredicting(true);
    setMarksError('');
    setLeadError('');
    try {
      const payload = { examId: exam.id, score: scoreValue };
      if (exam.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setMarksError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      const normalized = {
        predictedValue: predicted.predictedValue,
        range: predicted.range || null,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      };
      onResultChange(normalized);
      setWizardStep('result');
      setPublicResult({
        predictedRank: normalized.predictedValue,
        range: normalized.range,
        message: normalized.message,
        metricLabel: normalized.metricLabel,
      });
      persistToStudentProfile(normalized, scoreValue);

      if (alreadyLoggedIn && studentAuth?.session?.phone) {
        try {
          const leadName = String(
            studentAuth.profile?.fullName || studentAuth.session.fullName || ''
          ).trim();
          if (leadName.length >= 2) {
            await saveStep1(
              leadName,
              studentAuth.session.phone,
              RANK_PREDICTOR_LEAD_OCCUPATION,
              leadUtm,
              {
                rankPredictorLead: {
                  examId: exam.id,
                  score: scoreValue,
                  ...(exam.requiresDifficulty ? { difficulty } : {}),
                },
              }
            );
          }
          await saveRankPredictorPrediction(studentAuth.session.phone, {
            examId: exam.id,
            predictedValue: normalized.predictedValue,
            range: normalized.range,
            metricLabel: normalized.metricLabel,
            message: normalized.message,
          });
        } catch {
          /* CRM sync best-effort */
        }
      }

      setTimeout(() => resultsRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (err) {
      setMarksError(err.message || 'Something went wrong.');
    } finally {
      setPredicting(false);
    }
  };

  const handleMarksNext = async (e) => {
    e.preventDefault();
    setMarksError('');
    const validation = validateRankPredictorScore(score, exam);
    if (!validation.ok) {
      setMarksError(validation.error);
      return;
    }
    setNumericScore(validation.value);
    if (isCounsellor || alreadyLoggedIn) {
      await runDirectPrediction(validation.value);
      return;
    }
    setWizardStep('lead');
  };

  const normalizePhoneDigits = (raw) => {
    const d = String(raw || '').replace(/\D/g, '');
    return d.length >= 10 ? d.slice(-10) : d;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLeadError('');
    setOtpError('');
    setSuccessMessage('');

    const name = fullName.trim();
    if (name.length < 2) {
      setLeadError('Please enter your name (at least 2 characters).');
      return;
    }
    const normalizedPhone = normalizePhoneDigits(phone);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      setLeadError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoadingOtp(true);
    try {
      const otpRes = await sendOtp(name, normalizedPhone, RANK_PREDICTOR_LEAD_OCCUPATION, {});
      if (!otpRes.success) {
        if (otpRes.status === 429) {
          setLeadError(otpRes.message || 'Too many OTP requests. Try again later.');
        } else {
          setLeadError(otpRes.message || 'Failed to send OTP. Please try again.');
        }
        return;
      }

      setSuccessMessage('OTP sent to your mobile number.');
      const saveRes = await saveStep1(
        name,
        normalizedPhone,
        RANK_PREDICTOR_LEAD_OCCUPATION,
        leadUtm,
        { rankPredictorLead: rankPredictorLeadPayload() }
      );
      if (!saveRes.success) {
        console.warn('[RankPredictorWithLeadGate] saveStep1:', saveRes.message);
      }

      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } catch (err) {
      setLeadError(err.message || 'Network error. Please try again.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setLeadError('');
    setOtpError('');
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
    const name = fullName.trim();
    const normalizedPhone = normalizePhoneDigits(phone);
    setLoadingOtp(true);
    try {
      const otpRes = await sendOtp(name, normalizedPhone, RANK_PREDICTOR_LEAD_OCCUPATION, {});
      if (otpRes.success) {
        setSuccessMessage('OTP resent successfully.');
        otpInputRefs.current[0]?.focus();
        await saveStep1(
          name,
          normalizedPhone,
          RANK_PREDICTOR_LEAD_OCCUPATION,
          leadUtm,
          { rankPredictorLead: rankPredictorLeadPayload() }
        );
      } else if (otpRes.status === 429) {
        setLeadError(otpRes.message || 'Too many OTP requests. Try again later.');
      } else {
        setLeadError(otpRes.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setLeadError(err.message || 'Network error.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyAndPredict = async (e) => {
    e.preventDefault();
    setOtpError('');
    setLeadError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    const normalizedPhone = normalizePhoneDigits(phone);
    setVerifying(true);
    try {
      const v = await verifyOtp(normalizedPhone, otpString);
      if (!v.success || v.data?.verified !== true) {
        setOtpError(v.message || v.data?.message || 'Invalid or expired OTP.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
        return;
      }

      const s2 = await saveStep2(normalizedPhone, leadUtm);
      if (!s2.success) {
        console.warn('[RankPredictorWithLeadGate] saveStep2:', s2.message);
      }

      if (numericScore == null) {
        setLeadError('Score missing. Go back and enter your score again.');
        return;
      }

      setPredictionSyncError('');
      setPredicting(true);
      const payload = { examId: exam.id, score: numericScore };
      if (exam.requiresDifficulty) {
        payload.options = { difficulty };
      }
      const response = await predictRankPublic(payload);
      if (!response.success) {
        setLeadError(response.message || 'Could not generate prediction. Please try again.');
        return;
      }
      const predicted = response.data || {};
      const normalized = {
        predictedValue: predicted.predictedValue,
        range: predicted.range || null,
        message: predicted.message,
        metricLabel: predicted.metricLabel,
      };
      onResultChange(normalized);
      setWizardStep('result');
      persistToStudentProfile(normalized, numericScore);
      if (isStudent) {
        const phoneDigits = normalizePhoneDigits(phone);
        saveOrganicRankLeadSnapshot({
          examId: exam.id,
          examName: exam.name || exam.title || exam.id,
          score: numericScore,
          ...(exam.requiresDifficulty && difficulty ? { difficulty } : {}),
          phoneLast4: phoneDigits.length >= 4 ? phoneDigits.slice(-4) : phoneDigits,
          fullName: fullName.trim(),
          otpVerified: true,
          capturedAt: new Date().toISOString(),
        });
        const syncRes = await saveRankPredictorPrediction(normalizedPhone, {
          examId: exam.id,
          predictedValue: normalized.predictedValue,
          range: normalized.range,
          metricLabel: normalized.metricLabel,
          message: normalized.message,
        });
        if (!syncRes?.success) {
          const msg = syncRes?.message || 'Could not save prediction for admin.';
          console.warn('[RankPredictorWithLeadGate] saveRankPredictorPrediction:', msg);
          setPredictionSyncError(msg);
        }
      }
      if (variant === 'public') {
        setPublicResult({
          predictedRank: normalized.predictedValue,
          range: normalized.range,
          message: normalized.message,
          metricLabel: normalized.metricLabel,
        });
      }
      setTimeout(() => resultsRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (err) {
      setOtpError(err.message || 'Something went wrong.');
    } finally {
      setVerifying(false);
      setPredicting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const chars = pasted.split('');
    const next = [...otp];
    for (let i = 0; i < 6; i += 1) next[i] = chars[i] || '';
    setOtp(next);
    const last = Math.min(chars.length - 1, 5);
    otpInputRefs.current[last]?.focus();
  };

  const marksForm = (
    <form
      className={isStudent ? 'space-y-4' : 'min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'}
      onSubmit={handleMarksNext}
    >
      {!isStudent && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {exam.title || `${exam.name} Rank Predictor`}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isCounsellor
              ? 'Enter your score to see the predicted rank. No phone verification required in the counsellor portal.'
              : 'Enter your score, then verify your phone to see your prediction.'}
          </p>
        </div>
      )}
      <label className={isStudent ? swLabel : 'block'}>
        <span className={isStudent ? '' : 'mb-1 block text-sm font-medium text-gray-700'}>
          {exam.scoreLabel || 'Score'}
          <span className={isStudent ? 'ml-1 text-xs font-normal text-slate-400' : ' text-gray-500'}>
            ({exam.min} – {exam.max})
          </span>
        </span>
        <input
          type="number"
          value={score}
          step={inputStep}
          min={exam.min}
          max={exam.max}
          onChange={(e) => {
            setScore(e.target.value);
            setMarksError('');
          }}
          placeholder={getRankPredictorInputPlaceholder(exam)}
          className={
            isStudent
              ? swInput
              : 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none'
          }
        />
        <p className={isStudent ? 'mt-1 text-xs text-slate-400' : 'mt-1 text-xs text-gray-500'}>
          Allowed range: {exam.min} – {exam.max}
          {exam.type === 'percentile' ? ' (decimals allowed)' : ' (whole numbers only)'}
        </p>
      </label>

      {exam.requiresDifficulty && (
        <label className={isStudent ? swLabel : 'block'}>
          <span className={isStudent ? '' : 'mb-1 block text-sm font-medium text-gray-700'}>Difficulty Level</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={
              isStudent
                ? swSelect
                : 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none'
            }
          >
            {exam.difficultyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className={isStudent ? '' : 'mt-5'}>
        {marksError && (
          <p className={isStudent ? `mb-3 ${swErrorBox}` : 'mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700'}>
            {marksError}
          </p>
        )}
        <button
          type="submit"
          disabled={isCounsellor && predicting}
          className={
            isStudent
              ? swBtnPrimary
              : 'w-full min-h-11 rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-navy/90 disabled:opacity-60 sm:w-auto'
          }
        >
          {isCounsellor ? (predicting ? 'Predicting…' : 'Get prediction') : 'Next'}
        </button>
      </div>
    </form>
  );

  const leadForm = (
    <div className={isStudent ? 'space-y-4' : 'min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-4'}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setWizardStep('marks');
            setLeadError('');
            setOtpError('');
            setSuccessMessage('');
            setOtpSent(false);
            setOtp(['', '', '', '', '', '']);
          }}
          className={isStudent ? swBtnGhost : 'text-sm font-medium text-primary-navy hover:underline'}
        >
          ← Back to score
        </button>
      </div>
      <p className={isStudent ? 'text-sm font-medium text-slate-600' : 'text-sm text-gray-600'}>
        Enter your details to receive an OTP. After verification, your rank prediction will load automatically.
      </p>
      <label className={isStudent ? `block ${swLabel}` : 'block'}>
        <span className={isStudent ? '' : 'text-sm font-medium text-gray-700'}>Full name</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setLeadError('');
          }}
          autoComplete="name"
          className={
            isStudent
              ? swInput
              : 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none'
          }
        />
      </label>
      <label className={isStudent ? `block ${swLabel}` : 'block'}>
        <span className={isStudent ? '' : 'text-sm font-medium text-gray-700'}>Mobile number</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setLeadError('');
          }}
          autoComplete="tel"
          placeholder="10-digit mobile"
          className={
            isStudent
              ? swInput
              : 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-navy focus:outline-none'
          }
        />
      </label>

      {leadError && (
        <p className={isStudent ? swErrorBox : 'rounded-lg bg-red-50 p-3 text-sm text-red-700'}>
          {leadError}
        </p>
      )}
      {successMessage && (
        <p className={isStudent ? swSuccess : 'text-sm text-emerald-700'}>{successMessage}</p>
      )}

      {!otpSent ? (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={loadingOtp}
          className={
            isStudent
              ? swBtnPrimary
              : 'rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50'
          }
        >
          {loadingOtp ? 'Sending…' : 'Send OTP'}
        </button>
      ) : (
        <form onSubmit={handleVerifyAndPredict} className="space-y-4">
          <div>
            <p className={isStudent ? `mb-2 ${swPreviewLabel}` : 'mb-2 text-sm font-medium text-gray-700'}>
              Enter 6-digit OTP
            </p>
            <div className="flex gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className={
                    isStudent
                      ? swOtpInput
                      : 'h-11 w-10 rounded-lg border border-gray-300 text-center text-lg font-semibold'
                  }
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>
          {otpError && (
            <p className={isStudent ? 'text-sm font-semibold text-red-700' : 'text-sm text-red-700'}>{otpError}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={verifying || predicting}
              className={
                isStudent
                  ? swBtnPrimary
                  : 'rounded-lg bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50'
              }
            >
              {verifying || predicting ? 'Verifying…' : 'Verify & show prediction'}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loadingOtp}
              className="text-sm font-semibold text-slate-600 underline hover:text-[#0F172A] disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const resultActions = (
    <div className={isStudent ? 'mt-6' : 'mt-5'}>
      <button
        type="button"
        onClick={resetFlow}
        className={isStudent ? swBtnSecondary : 'rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50'}
      >
        Predict another score
      </button>
    </div>
  );

  return (
    <div>
      {headerSlot}
      {wizardStep === 'marks' && marksForm}
      {wizardStep === 'lead' && leadForm}
      {wizardStep === 'result' && (
        <div className={isStudent ? `${swCard} bg-slate-50` : ''}>
          <p className={isStudent ? 'text-base font-medium text-slate-900' : 'text-lg font-semibold text-gray-900'}>
            {isStudent ? 'Your prediction is ready — check the results panel.' : 'Your prediction is ready.'}
          </p>
          {isStudent && predictionSyncError ? (
            <p className={`mt-3 ${swWarningBox}`}>
              Admin could not save this prediction ({predictionSyncError}). If this persists, contact support with your phone number.
            </p>
          ) : null}
          {!isStudent && publicResult && <ResultCard result={publicResult} />}
          {resultActions}
        </div>
      )}
    </div>
  );
}

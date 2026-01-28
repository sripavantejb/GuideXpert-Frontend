<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
import { FaRocket } from 'react-icons/fa';
import { FiSend, FiPhone, FiDollarSign, FiAward, FiHome, FiUsers, FiArrowLeft } from 'react-icons/fi';
import ShinyText from '../UI/ShinyText';
import { sendOtp, verifyOtp, submitApplication } from '../../utils/api';
import './ApplySection.css';

const ApplySection = () => {
  const [currentStep, setCurrentStep] = useState(1);
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    occupation: '',
    otp: ['', '', '', '', '', ''],
    demoPreference: '',
    timeSlot: '',
=======
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [demoSlots, setDemoSlots] = useState({ slot1: null, slot2: null });
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    occupation: '',
    otp: '',
    demoInterest: '',
    selectedSlot: ''
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
  });
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const otpInputRefs = useRef([]);

  // Calculate nearest Saturday 7pm
  const calculateNearestSaturday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    // If today is Saturday, get next Saturday
    if (daysUntilSaturday === 0) {
      daysUntilSaturday = 7;
    }
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    saturday.setHours(19, 0, 0, 0); // 7pm
    return saturday;
  };

  // Calculate nearest Sunday 3pm
  const calculateNearestSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    let daysUntilSunday = (7 - dayOfWeek) % 7;
    // If today is Sunday, get next Sunday
    if (daysUntilSunday === 0) {
      daysUntilSunday = 7;
    }
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    sunday.setHours(15, 0, 0, 0); // 3pm
    return sunday;
  };

  // Format slot date
  const formatSlotDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[date.getDay()];
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dayName}, ${months[date.getMonth()]} ${date.getDate()} | ${timeStr}`;
  };

  const saturdaySlot = calculateNearestSaturday();
  const sundaySlot = calculateNearestSunday();

  const handleChange = (e) => {
<<<<<<< HEAD
    const { name, value } = e.target;
    // Clear time slot if user selects "Maybe later"
    if (name === 'demoPreference' && value === 'maybe') {
      setFormData({ ...formData, [name]: value, timeSlot: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear errors when user makes changes
    if (error) setError('');
    if (otpError) setOtpError('');
  };

  // Add checked class to radio options for better styling
  useEffect(() => {
    const radioOptions = document.querySelectorAll('.apply-radio-option');
    radioOptions.forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio?.checked) {
        option.classList.add('apply-radio-checked');
      } else {
        option.classList.remove('apply-radio-checked');
      }
    });
  }, [formData.demoPreference, formData.timeSlot]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...formData.otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setFormData({ ...formData, otp: newOtp });
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setFormData({ ...formData, otp: newOtp });
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate Step 1 fields
    if (!formData.fullName.trim() || !formData.whatsappNumber.trim() || !formData.occupation.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate WhatsApp number format (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.whatsappNumber.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    
    // Log request details
    console.log('[Send OTP] Request:', {
      fullName: formData.fullName.trim(),
      whatsappNumber: cleanPhone,
      occupation: formData.occupation.trim(),
    });
    
    try {
      const result = await sendOtp(
        formData.fullName.trim(),
        cleanPhone,
        formData.occupation.trim()
      );

      // Log response for debugging
      console.log('[Send OTP] Response:', result);

      if (result.success) {
        setSuccessMessage('OTP sent successfully to your WhatsApp number');
        setCurrentStep(2);
        // Focus first OTP input after state update
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        // Log error details
        console.error('[Send OTP] Failed:', {
          success: result.success,
          status: result.status,
          message: result.message,
          data: result.data,
        });
        
        // Handle rate limiting
        if (result.status === 429) {
          setError(result.message || 'Too many OTP requests. Please try again after some time.');
        } else {
          const errorMessage = result.message || result.data?.message || 'Failed to send OTP. Please try again.';
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('[Send OTP] Exception:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
=======
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const formatError = (prefix, data, fallback) => {
    const base = data?.detail || data?.message || fallback || 'Unknown error';
    const retry = data?.retryAfter ? ` Try again in ${data.retryAfter}s.` : '';
    return `${prefix}: ${base}${retry}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const phone = String(formData.phone || '').replace(/\D/g, '');
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit WhatsApp number');
      return;
    }
    if (!formData.occupation.trim()) {
      setError('Occupation is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone,
          occupation: formData.occupation
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentStep(2);
      } else {
        setError(formatError('Send OTP failed', data, 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    const phone = String(formData.phone || '').replace(/\D/g, '');
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit WhatsApp number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone,
          occupation: formData.occupation
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(formatError('Resend OTP failed', data, 'Unknown error'));
      }
    } finally {
      setLoading(false);
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setOtpError('');
    setError('');
    
    const otpString = formData.otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    
    setIsVerifying(true);
    const cleanPhone = formData.whatsappNumber.replace(/\D/g, '');
    
    // Normalize phone: take last 10 digits (same as backend normalizePhone)
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    
    // Log request details
    console.log('[Verify OTP] Request:', { 
      original: formData.whatsappNumber,
      cleaned: cleanPhone,
      normalized: normalizedPhone,
      otp: otpString 
    });
    
    try {
      const result = await verifyOtp(normalizedPhone, otpString);

      // Log full response for debugging
      console.log('[Verify OTP] Response:', result);

      // Backend returns { verified: true } on success (status 200)
      // API utility wraps it as { success: true, data: { verified: true } }
      if (result.success && result.data?.verified === true) {
        // Mark phone as verified and store the normalized phone number
        setIsPhoneVerified(true);
        setVerifiedPhone(normalizedPhone); // Store normalized phone for consistency
        console.log('[Verify OTP] Phone verified and stored:', normalizedPhone);
        setSuccessMessage('OTP verified successfully');
        setCurrentStep(3);
      } else {
        // Log error details
        console.error('[Verify OTP] Failed:', {
          success: result.success,
          status: result.status,
          message: result.message,
          data: result.data,
        });
        
        const errorMessage = result.message || result.data?.message || 'Invalid or expired OTP. Please try again.';
        setOtpError(errorMessage);
        
        // Clear OTP inputs on error
        setFormData({ ...formData, otp: ['', '', '', '', '', ''] });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      console.error('[Verify OTP] Exception:', err);
      setOtpError('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setError('');
    setFormData({ ...formData, otp: ['', '', '', '', '', ''] });
    
    setIsLoading(true);
    const cleanPhone = formData.whatsappNumber.replace(/\D/g, '');
    
    // Normalize phone: take last 10 digits (same as backend normalizePhone)
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    
    try {
      const result = await sendOtp(
        formData.fullName.trim(),
        normalizedPhone,
        formData.occupation.trim()
      );

      if (result.success) {
        setSuccessMessage('OTP resent successfully');
        otpInputRefs.current[0]?.focus();
      } else {
        if (result.status === 429) {
          setError(result.message || 'Too many OTP requests. Please try again after some time.');
        } else {
          setError(result.message || 'Failed to resend OTP. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
=======
    setError('');
    if (!/^\d{6}$/.test(String(formData.otp || ''))) {
      setError('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: String(formData.phone || '').replace(/\D/g, ''),
          otp: String(formData.otp || '')
        })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setCurrentStep(3);
      } else {
        setError(formatError('Verify OTP failed', data, 'Invalid or expired OTP'));
      }
    } finally {
      setLoading(false);
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
    setSuccessMessage('');
    
    // Check if phone is verified before submitting
    if (!isPhoneVerified || !verifiedPhone) {
      setError('Please verify your phone number with OTP first. Go back to step 2 to verify.');
      console.error('[Submit Application] Phone not verified. isPhoneVerified:', isPhoneVerified, 'verifiedPhone:', verifiedPhone);
      return;
    }
    
    if (!formData.demoPreference) {
      setError('Please select your demo preference');
      return;
    }
    
    // Time slot is required only if user wants to attend demo
    if (formData.demoPreference === 'yes' && !formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }

    setIsLoading(true);
    
    // Use the verified phone number to ensure exact match with backend
    const cleanPhone = verifiedPhone || formData.whatsappNumber.replace(/\D/g, '');
    
    // Normalize phone: take last 10 digits (same as backend normalizePhone)
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    
    console.log('[Submit Application] Using verified phone:', normalizedPhone);
    
    // Map frontend data to backend format
    // Backend accepts both 'phone' and 'whatsappNumber', send both for compatibility
    const submissionData = {
      fullName: formData.fullName.trim(),
      phone: normalizedPhone, // Use 'phone' for consistency with verifyOtp
      whatsappNumber: normalizedPhone, // Also send whatsappNumber as fallback
      occupation: formData.occupation.trim(),
      demoInterest: formData.demoPreference === 'yes' ? 'YES_SOON' : 'MAYBE_LATER',
    };
    
    // Add selectedSlot only if user wants to attend demo
    if (formData.demoPreference === 'yes') {
      submissionData.selectedSlot = formData.timeSlot === 'saturday' ? 'SATURDAY_7PM' : 'SUNDAY_3PM';
    }

    // Log submission data
    console.log('[Submit Application] Request:', submissionData);

    try {
      const result = await submitApplication(submissionData);

      // Log full response for debugging
      console.log('[Submit Application] Response:', result);

      if (result.success) {
        setSuccessMessage('Application submitted successfully!');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            fullName: '',
            whatsappNumber: '',
            occupation: '',
            otp: ['', '', '', '', '', ''],
            demoPreference: '',
            timeSlot: '',
          });
          setIsPhoneVerified(false);
          setVerifiedPhone('');
          setCurrentStep(1);
          setSuccessMessage('');
        }, 3000);
      } else {
        // Log error details
        console.error('[Submit Application] Failed:', {
          success: result.success,
          status: result.status,
          message: result.message,
          data: result.data,
        });
        
        const errorMessage = result.message || result.data?.message || 'Failed to submit application. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('[Submit Application] Exception:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setError('');
      setSuccessMessage('');
      setOtpError('');
      // Don't reset verification status when going back
      setCurrentStep(currentStep - 1);
    }
  };

  const stepLabels = {
    1: '',
    2: 'OTP Verification',
    3: 'Slot Booking',
  };

  const progressPercentage = (currentStep / 3) * 100;
=======
    if (!formData.demoInterest) {
      setError('Please select an option');
      return;
    }
    if (formData.demoInterest === 'YES_SOON' && !formData.selectedSlot) {
      setError('Please select a preferred time slot');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/submit-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: String(formData.phone || '').replace(/\D/g, ''),
          occupation: formData.occupation,
          demoInterest: formData.demoInterest,
          selectedSlot: formData.demoInterest === 'YES_SOON' ? formData.selectedSlot : undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentStep('success');
      } else {
        setError(formatError('Submit failed', data, 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAgain = () => {
    setFormData({
      fullName: '',
      phone: '',
      occupation: '',
      otp: '',
      demoInterest: '',
      selectedSlot: ''
    });
    setError('');
    setCurrentStep(1);
  };

  const progress = currentStep === 'success' ? 100 : currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;
  const stepLabel = currentStep === 1 ? 'User Details' : currentStep === 2 ? 'OTP Verification' : 'Demo Interest';

  useEffect(() => {
    const shouldFetch = currentStep === 3 && formData.demoInterest === 'YES_SOON' && !demoSlots.slot1;
    if (!shouldFetch) return;
    let active = true;
    setSlotsLoading(true);
    fetch(`${API_BASE_URL}/demo-slots`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.slot1?.label && data?.slot2?.label) {
          setDemoSlots({ slot1: data.slot1, slot2: data.slot2 });
        } else {
          setError('Failed to load demo slots');
        }
      })
      .catch(() => {
        if (active) setError('Failed to load demo slots');
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [API_BASE_URL, currentStep, formData.demoInterest, demoSlots.slot1]);
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c

  return (
    <section id="home" className="apply-section">
      <div className="apply-section-inner">
        {/* Left column: marketing content */}
        <div className="apply-left">
          <div className="apply-join">
            <FaRocket className="apply-join-icon" aria-hidden />
            <ShinyText
              text="Join the Movement"
              speed={2.5}
              delay={0}
              color="#4b5563"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </div>

          <h2 className="apply-heading">
            <span className="apply-heading-grey">Become a Certified </span>
            <span className="apply-heading-elite">Elite </span>
            <span className="apply-heading-grey">Counselor</span>
          </h2>

          <p className="apply-desc">
            Work from home. Guide students with confidence. Earn income while transforming lives.
          </p>

          <div className="apply-stats">
            <div className="apply-stat">
              <span className="apply-stat-value apply-stat-value-blue">12L+</span>
              <span className="apply-stat-label">Students Annually</span>
            </div>
            <div className="apply-stat">
              <span className="apply-stat-value apply-stat-value-gold">₹9L</span>
              <span className="apply-stat-label">Earning Potential</span>
            </div>
            <div className="apply-stat">
              <span className="apply-stat-value apply-stat-value-green">PAN-India</span>
              <span className="apply-stat-label">Opportunities</span>
            </div>
          </div>
        </div>

        {/* Right column: form card */}
        <div className="apply-right">
          <div className="apply-form-card">
<<<<<<< HEAD
            {/* Progress indicator - hidden on step 1 */}
            {currentStep >= 2 && (
              <div className="apply-progress">
                <div className="apply-progress-top">
                  <span className="apply-progress-step">Step {currentStep} of 3</span>
                  <span className="apply-progress-label">{stepLabels[currentStep]}</span>
                </div>
                <div className="apply-progress-bar">
                  <div 
                    className="apply-progress-fill" 
                    style={{ width: `${progressPercentage}%` }}
                    aria-hidden 
                  />
=======
            {currentStep !== 'success' && (
              <div className="apply-progress">
                <div className="apply-progress-top">
                  <span className="apply-progress-step">Step {currentStep} of 3</span>
                  <span className="apply-progress-label">{stepLabel}</span>
                </div>
                <div className="apply-progress-bar">
                  <div className="apply-progress-fill" style={{ width: `${progress}%` }} aria-hidden />
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
                </div>
              </div>
            )}

            <div className="apply-form-title-wrap">
              <FiSend className="apply-form-title-icon" aria-hidden />
              <h3 className="apply-form-title">
                <ShinyText
                  text="Apply Now"
                  speed={2}
                  delay={0}
                  color="#003366"
                  shineColor="#ffffff"
                  spread={120}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                  disabled={false}
                />
              </h3>
            </div>
            <p className="apply-form-sub">Start your journey as a certified counselor</p>

<<<<<<< HEAD
            {/* Error Message */}
            {error && <div className="apply-error-message-global">{error}</div>}
            
            {/* Success Message */}
            {successMessage && <div className="apply-success-message">{successMessage}</div>}

            {/* Step 1: Contact Details */}
            {currentStep === 1 && (
              <form className="apply-form" onSubmit={handleGetOtp}>
                <div className="apply-field">
                  <label htmlFor="fullName">
                    Full Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="apply-field">
                  <label htmlFor="whatsappNumber">
                    WhatsApp Mobile Number <span>*</span>
                  </label>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    pattern="[6-9]\d{9}"
                    maxLength="10"
                  />
                </div>

                <div className="apply-field">
                  <label htmlFor="occupation">
                    Occupation <span>*</span>
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Enter your occupation"
                    required
                  />
                </div>

                <button type="submit" className="apply-otp-btn" disabled={isLoading}>
                  <FiPhone aria-hidden />
                  {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <form className="apply-form" onSubmit={handleVerifyOtp}>
                <div className="apply-otp-wrapper">
                  <p className="apply-otp-instruction">
                    Enter the 6-digit OTP sent to your WhatsApp number
                  </p>
                  <div className="apply-otp-container">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="apply-otp-input"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  {otpError && <p className="apply-error-message">{otpError}</p>}
                </div>

                <div className="apply-step-nav">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="apply-back-btn"
                  >
                    <FiArrowLeft aria-hidden />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="apply-otp-btn"
                    disabled={isVerifying || isLoading}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>

                <div className="apply-resend-otp">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="apply-resend-link"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Slot Booking */}
            {currentStep === 3 && (
              <form className="apply-form" onSubmit={handleSubmit}>
                <div className="apply-field">
                  <label className="apply-question-label">
                    Would you like to attend a demo?
                  </label>
                  <div className="apply-radio-group">
                    <label className="apply-radio-option">
                      <input
                        type="radio"
                        name="demoPreference"
                        value="yes"
                        checked={formData.demoPreference === 'yes'}
                        onChange={handleChange}
                        required
                      />
                      <span>Yes, I'd like to attend shortly</span>
                    </label>
                    <label className="apply-radio-option">
                      <input
                        type="radio"
                        name="demoPreference"
                        value="maybe"
                        checked={formData.demoPreference === 'maybe'}
                        onChange={handleChange}
                        required
                      />
                      <span>Maybe later</span>
                    </label>
                  </div>
                </div>

                {formData.demoPreference === 'yes' && (
                  <div className="apply-field">
                    <label className="apply-question-label">
                      Preferred Time Slot
                    </label>
                    <p className="apply-slot-subtitle">Pick a time that works best for you</p>
                    <div className="apply-radio-group">
                      <label className="apply-radio-option">
                        <input
                          type="radio"
                          name="timeSlot"
                          value="saturday"
                          checked={formData.timeSlot === 'saturday'}
                          onChange={handleChange}
                          required
                        />
                        <div>
                          <span>Slot 1 — {formatSlotDate(saturdaySlot)}</span>
                        </div>
                      </label>
                      <label className="apply-radio-option">
                        <input
                          type="radio"
                          name="timeSlot"
                          value="sunday"
                          checked={formData.timeSlot === 'sunday'}
                          onChange={handleChange}
                          required
                        />
                        <div>
                          <span>Slot 2 — {formatSlotDate(sundaySlot)}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="apply-step-nav">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="apply-back-btn"
                  >
                    <FiArrowLeft aria-hidden />
                    Back
                  </button>
                  <button type="submit" className="apply-otp-btn" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
=======
            {currentStep === 'success' ? (
              <div className="apply-form">
                <div className="apply-success">
                  <p>✅ Application submitted successfully</p>
                  <button type="button" className="apply-otp-btn" onClick={handleApplyAgain}>
                    Apply again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <form className="apply-form" onSubmit={handleSendOtp}>
              <div className="apply-field">
                <label htmlFor="fullName">
                  Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="apply-field">
                <label htmlFor="phone">
                  WhatsApp Number <span>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />
              </div>

              <div className="apply-field">
                <label htmlFor="occupation">
                  Occupation <span>*</span>
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Enter your occupation"
                  required
                />
              </div>

              {error && <div className="apply-error-box">{error}</div>}

              <button type="submit" className="apply-otp-btn" disabled={loading}>
                <FiPhone aria-hidden />
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
                )}

                {currentStep === 2 && (
                  <form className="apply-form" onSubmit={handleVerifyOtp}>
                    <div className="apply-field">
                      <label htmlFor="otp">
                        OTP <span>*</span>
                      </label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                        required
                      />
                    </div>
                    {error && <div className="apply-error-box">{error}</div>}
                    <button type="submit" className="apply-otp-btn" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      className="apply-otp-btn apply-otp-secondary"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </form>
                )}

                {currentStep === 3 && (
                  <form className="apply-form" onSubmit={handleSubmit}>
                    <div className="apply-field">
                      <label>Would you like to attend a demo?</label>
                      <div className="apply-radio">
                        <label>
                          <input
                            type="radio"
                            name="demoInterest"
                            value="YES_SOON"
                            checked={formData.demoInterest === 'YES_SOON'}
                            onChange={handleChange}
                          />
                          Yes, I’d like to attend shortly
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="demoInterest"
                            value="MAYBE_LATER"
                            checked={formData.demoInterest === 'MAYBE_LATER'}
                            onChange={handleChange}
                          />
                          Maybe later
                        </label>
                      </div>
                    </div>

                    {formData.demoInterest === 'YES_SOON' && (
                      <div className="apply-field">
                        <label>Preferred Time Slot</label>
                        <p>Pick a time that works best for you</p>
                        {slotsLoading ? (
                          <p>Loading slots...</p>
                        ) : (
                          <div className="apply-radio">
                            <label>
                              <input
                                type="radio"
                                name="selectedSlot"
                                value="SATURDAY_7PM"
                                checked={formData.selectedSlot === 'SATURDAY_7PM'}
                                onChange={handleChange}
                              />
                              Slot 1 — {demoSlots.slot1?.label || ''}
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="selectedSlot"
                                value="SUNDAY_3PM"
                                checked={formData.selectedSlot === 'SUNDAY_3PM'}
                                onChange={handleChange}
                              />
                              Slot 2 — {demoSlots.slot2?.label || ''}
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {error && <div className="apply-error-box">{error}</div>}
                    <button type="submit" className="apply-otp-btn" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </form>
                )}
              </>
>>>>>>> 6ac9c7316de046d05c434607f3987b15f50a193c
            )}
          </div>
        </div>
      </div>
      <div className="apply-feature-cards">
        {[
          {
            icon: FiDollarSign,
            iconBg: 'apply-card-icon-gold',
            title: 'Earnings Potential',
            subtitle: '₹9 Lakhs/year potential',
          },
          {
            icon: FiAward,
            iconBg: 'apply-card-icon-blue',
            title: 'Certified Training',
            subtitle: 'Become a trusted, certified counselor',
          },
          {
            icon: FiHome,
            iconBg: 'apply-card-icon-green',
            title: 'Work from Anywhere',
            subtitle: 'Flexible, work-from-home model',
          },
          {
            icon: FiUsers,
            iconBg: 'apply-card-icon-blue',
            title: 'Expert Support',
            subtitle: "Backed by GuideXpert's central team",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="apply-feature-card">
              <div className={`apply-feature-card-icon ${card.iconBg}`}>
                <Icon className="apply-feature-card-icon-svg" aria-hidden />
              </div>
              <h4 className="apply-feature-card-title">{card.title}</h4>
              <p className="apply-feature-card-subtitle">{card.subtitle}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ApplySection;

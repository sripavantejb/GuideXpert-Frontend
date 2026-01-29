import { useState, useRef, useEffect } from 'react';
import { FaRocket } from 'react-icons/fa';
import { FiSend, FiPhone, FiDollarSign, FiAward, FiHome, FiUsers, FiArrowLeft } from 'react-icons/fi';
import ShinyText from '../UI/ShinyText';
import SuccessPopup from '../UI/SuccessPopup';
import { sendOtp, verifyOtp, submitApplication, saveStep1, saveStep2, saveStep3, checkRegistrationStatus, savePostRegistrationData } from '../../utils/api';
import './ApplySection.css';

const ApplySection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    occupation: '',
    otp: ['', '', '', '', '', ''],
    demoPreference: '',
    timeSlot: '',
  });
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookedSlotInfo, setBookedSlotInfo] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [registeredSlotInfo, setRegisteredSlotInfo] = useState(null);
  const [postRegistrationCompleted, setPostRegistrationCompleted] = useState(false);
  const [postRegistrationData, setPostRegistrationData] = useState({
    interestLevel: '',
    email: ''
  });
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

  // Format slot date (full string for display)
  const formatSlotDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[date.getDay()];
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dayName}, ${months[date.getMonth()]} ${date.getDate()} | ${timeStr}`;
  };

  // Date heading as in reference: "Saturday (31-01-2026)"
  const formatSlotDateHeading = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${days[date.getDay()]} (${d}-${m}-${y})`;
  };

  // Time range for slot: "7:00 PM - 8:00 PM" (1hr window)
  const formatSlotTimeRange = (startDate) => {
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const start = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const end = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${start} - ${end}`;
  };

  const saturdaySlot = calculateNearestSaturday();
  const sundaySlot = calculateNearestSunday();

  // localStorage functions
  const saveRegistrationToLocalStorage = (phone) => {
    try {
      const registrationData = {
        phone,
        isRegistered: true,
        registeredAt: Date.now()
      };
      localStorage.setItem('guidexpert_registration', JSON.stringify(registrationData));
    } catch (error) {
      console.error('[localStorage] Failed to save registration:', error);
    }
  };

  const getRegistrationFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('guidexpert_registration');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[localStorage] Failed to get registration:', error);
    }
    return null;
  };

  // Check registration status on mount
  useEffect(() => {
    const checkRegistration = async () => {
      const localData = getRegistrationFromLocalStorage();
      if (localData && localData.phone) {
        try {
          const result = await checkRegistrationStatus(localData.phone);
          if (result.success && result.data?.isRegistered) {
            setIsRegistered(true);
            setRegisteredPhone(localData.phone);
            setRegisteredSlotInfo(result.data.slotInfo);
            setPostRegistrationCompleted(result.data.postRegistrationCompleted || false);
            
            // Return to form (step 1) with "Already registered" on top
            setCurrentStep(1);
          }
        } catch (error) {
          console.error('[Check Registration] Error:', error);
          // Fall back to localStorage if API fails
          if (localData.isRegistered) {
            setIsRegistered(true);
            setRegisteredPhone(localData.phone);
          }
        }
      }
    };
    
    checkRegistration();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
  }, [formData.timeSlot]);

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
        
        // Save Step 1 data to MongoDB
        try {
          const saveResult = await saveStep1(
            formData.fullName.trim(),
            cleanPhone,
            formData.occupation.trim()
          );
          if (saveResult.success) {
            console.log('[Save Step 1] Successfully saved to MongoDB');
          } else {
            console.error('[Save Step 1] Failed to save:', saveResult.message);
            // Don't block user flow if save fails
          }
        } catch (saveErr) {
          console.error('[Save Step 1] Exception:', saveErr);
          // Don't block user flow if save fails
        }
        
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
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
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
        
        // Save Step 2 data to MongoDB
        try {
          const saveResult = await saveStep2(normalizedPhone);
          if (saveResult.success) {
            console.log('[Save Step 2] Successfully saved to MongoDB');
          } else {
            console.error('[Save Step 2] Failed to save:', saveResult.message);
            // Don't block user flow if save fails
          }
        } catch (saveErr) {
          console.error('[Save Step 2] Exception:', saveErr);
          // Don't block user flow if save fails
        }
        
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Check if phone is verified before submitting
    if (!isPhoneVerified || !verifiedPhone) {
      setError('Please verify your phone number with OTP first. Go back to step 2 to verify.');
      console.error('[Submit Application] Phone not verified. isPhoneVerified:', isPhoneVerified, 'verifiedPhone:', verifiedPhone);
      return;
    }
    
    // Time slot is required
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }

    setIsLoading(true);
    
    // Use the verified phone number to ensure exact match with backend
    const cleanPhone = verifiedPhone || formData.whatsappNumber.replace(/\D/g, '');
    
    // Normalize phone: take last 10 digits (same as backend normalizePhone)
    const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    
    console.log('[Submit Application] Using verified phone:', normalizedPhone);
    
    // Determine selected slot and date
    const selectedSlot = formData.timeSlot === 'saturday' ? 'SATURDAY_7PM' : 'SUNDAY_3PM';
    const slotDate = formData.timeSlot === 'saturday' ? saturdaySlot : sundaySlot;

    // Log submission data
    console.log('[Submit Application] Request:', {
      phone: normalizedPhone,
      selectedSlot,
      slotDate: slotDate.toISOString()
    });

    try {
      // Save Step 3 data to MongoDB
      const result = await saveStep3(normalizedPhone, selectedSlot, slotDate.toISOString());

      // Log full response for debugging
      console.log('[Submit Application] Response:', result);

      if (result.success) {
        // Store booked slot info for popup
        setBookedSlotInfo({
          selectedSlot,
          slotDate: slotDate.toISOString()
        });
        
        // Show success popup
        setShowSuccessPopup(true);
        
        // Reset form after popup closes (handled by popup close callback)
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

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    
    // Mark user as registered
    const normalizedPhone = verifiedPhone || formData.whatsappNumber.replace(/\D/g, '');
    const cleanPhone = normalizedPhone.length >= 10 ? normalizedPhone.slice(-10) : normalizedPhone;
    
    setIsRegistered(true);
    setRegisteredPhone(cleanPhone);
    setRegisteredSlotInfo(bookedSlotInfo);
    
    // Save to localStorage
    saveRegistrationToLocalStorage(cleanPhone);
    
    // Return to form (step 1) with "Already registered" on top
    setCurrentStep(1);
    setBookedSlotInfo(null);
    setSuccessMessage('');
    // Reset form fields so they see a fresh form
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
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 4) {
      setError('');
      setSuccessMessage('');
      setOtpError('');
      // Don't reset verification status when going back
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePostRegistrationChange = (e) => {
    const { name, value } = e.target;
    setPostRegistrationData({ ...postRegistrationData, [name]: value });
    if (error) setError('');
  };

  const handlePostRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!postRegistrationData.interestLevel) {
      setError('Please select your interest level');
      return;
    }

    if (!postRegistrationData.email || !postRegistrationData.email.trim()) {
      setError('Please provide your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(postRegistrationData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await savePostRegistrationData(
        registeredPhone,
        postRegistrationData.interestLevel,
        postRegistrationData.email.trim()
      );

      if (result.success) {
        setPostRegistrationCompleted(true);
        setSuccessMessage('Registration completed successfully!');
        // Reset form after a delay
        setTimeout(() => {
          setFormData({
            fullName: '',
            whatsappNumber: '',
            occupation: '',
            otp: ['', '', '', '', '', ''],
            demoPreference: '',
            timeSlot: '',
          });
          setPostRegistrationData({
            interestLevel: '',
            email: ''
          });
          setIsPhoneVerified(false);
          setVerifiedPhone('');
          setCurrentStep(1);
          setSuccessMessage('');
        }, 3000);
      } else {
        const errorMessage = result.message || result.data?.message || 'Failed to save information. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('[Post Registration] Exception:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = {
    1: '',
    2: 'OTP Verification',
    3: 'Slot Booking',
    4: 'Additional Information',
  };

  const progressPercentage = (currentStep / 4) * 100;

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
            {/* Already registered banner - on top of form */}
            {isRegistered && (
              <div className="apply-already-registered">
                <span className="apply-already-registered-text">Already registered</span>
                {!postRegistrationCompleted && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="apply-complete-profile-link"
                  >
                    Complete your profile
                  </button>
                )}
              </div>
            )}

            {/* Progress indicator - hidden on step 1 */}
            {currentStep >= 2 && (
              <div className="apply-progress">
                <div className="apply-progress-top">
                  <span className="apply-progress-step">Step {currentStep} of 4</span>
                  <span className="apply-progress-label">{stepLabels[currentStep]}</span>
                </div>
                <div className="apply-progress-bar">
                  <div 
                    className="apply-progress-fill" 
                    style={{ width: `${progressPercentage}%` }}
                    aria-hidden 
                  />
                </div>
              </div>
            )}

            {/* Form title - shown on steps 1–3 */}
            {currentStep !== 4 && (
              <>
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
              </>
            )}

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

            {/* Step 3: Slot Booking - layout: date heading, then time slots indented underneath */}
            {currentStep === 3 && (
              <form className="apply-form" onSubmit={handleSubmit}>
                <div className="apply-field">
                  <label className="apply-question-label">
                    Preferred Demo Slot
                  </label>
                  <div className="apply-slot-by-date">
                    {/* Saturday group */}
                    <div className="apply-slot-date-group">
                      <p className="apply-slot-date-heading">{formatSlotDateHeading(saturdaySlot)}</p>
                      <div className="apply-slot-day-options">
                        <label className={`apply-slot-option ${formData.timeSlot === 'saturday' ? 'apply-slot-option-selected' : ''}`}>
                          <input
                            type="radio"
                            name="timeSlot"
                            value="saturday"
                            checked={formData.timeSlot === 'saturday'}
                            onChange={handleChange}
                            required
                            className="apply-slot-option-input"
                          />
                          <span className="apply-slot-option-label">{formatSlotTimeRange(saturdaySlot)}</span>
                        </label>
                      </div>
                    </div>
                    {/* Sunday group */}
                    <div className="apply-slot-date-group">
                      <p className="apply-slot-date-heading">{formatSlotDateHeading(sundaySlot)}</p>
                      <div className="apply-slot-day-options">
                        <label className={`apply-slot-option ${formData.timeSlot === 'sunday' ? 'apply-slot-option-selected' : ''}`}>
                          <input
                            type="radio"
                            name="timeSlot"
                            value="sunday"
                            checked={formData.timeSlot === 'sunday'}
                            onChange={handleChange}
                            required
                            className="apply-slot-option-input"
                          />
                          <span className="apply-slot-option-label">{formatSlotTimeRange(sundaySlot)}</span>
                        </label>
                      </div>
                    </div>
                  </div>
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
                  <button type="submit" className="apply-otp-btn" disabled={isLoading}>
                    {isLoading ? 'Booking...' : 'Book Slot'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Post-Registration Questions */}
            {currentStep === 4 && (
              <form className="apply-form" onSubmit={handlePostRegistrationSubmit}>
                <div className="apply-field">
                  <label className="apply-question-label">
                    How interested are you in becoming a counselor?
                  </label>
                  <div className="apply-radio-group">
                    <label className="apply-radio-option">
                      <input
                        type="radio"
                        name="interestLevel"
                        value="VERY_INTERESTED"
                        checked={postRegistrationData.interestLevel === 'VERY_INTERESTED'}
                        onChange={handlePostRegistrationChange}
                        required
                      />
                      <div>
                        <span className="apply-interest-option-title">Very Interested</span>
                        <span className="apply-interest-option-desc">I'm ready to start my counseling journey soon</span>
                      </div>
                    </label>
                    <label className="apply-radio-option">
                      <input
                        type="radio"
                        name="interestLevel"
                        value="SOMEWHAT_INTERESTED"
                        checked={postRegistrationData.interestLevel === 'SOMEWHAT_INTERESTED'}
                        onChange={handlePostRegistrationChange}
                        required
                      />
                      <div>
                        <span className="apply-interest-option-title">Somewhat Interested</span>
                        <span className="apply-interest-option-desc">I'm exploring this as an option</span>
                      </div>
                    </label>
                    <label className="apply-radio-option">
                      <input
                        type="radio"
                        name="interestLevel"
                        value="EXPLORING"
                        checked={postRegistrationData.interestLevel === 'EXPLORING'}
                        onChange={handlePostRegistrationChange}
                        required
                      />
                      <div>
                        <span className="apply-interest-option-title">Just Exploring</span>
                        <span className="apply-interest-option-desc">I want to learn more before deciding</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="apply-field">
                  <label htmlFor="email">
                    Provide your email so we can send the meet link to you <span>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={postRegistrationData.email}
                    onChange={handlePostRegistrationChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="apply-step-nav">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRegistered) {
                        setCurrentStep(1);
                      } else {
                        handleBack();
                      }
                    }}
                    className="apply-back-btn"
                  >
                    <FiArrowLeft aria-hidden />
                    Back
                  </button>
                  <button type="submit" className="apply-otp-btn" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        slotInfo={bookedSlotInfo}
      />
      
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

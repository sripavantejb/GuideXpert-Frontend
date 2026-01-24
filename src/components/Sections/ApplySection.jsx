import { useEffect, useState } from 'react';
import { FaRocket } from 'react-icons/fa';
import { FiSend, FiPhone, FiDollarSign, FiAward, FiHome, FiUsers } from 'react-icons/fi';
import ShinyText from '../UI/ShinyText';
import './ApplySection.css';

const ApplySection = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  const handleChange = (e) => {
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
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
            {currentStep !== 'success' && (
              <div className="apply-progress">
                <div className="apply-progress-top">
                  <span className="apply-progress-step">Step {currentStep} of 3</span>
                  <span className="apply-progress-label">{stepLabel}</span>
                </div>
                <div className="apply-progress-bar">
                  <div className="apply-progress-fill" style={{ width: `${progress}%` }} aria-hidden />
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

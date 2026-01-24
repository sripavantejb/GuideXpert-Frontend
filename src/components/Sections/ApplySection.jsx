import { useState } from 'react';
import { FaRocket } from 'react-icons/fa';
import { FiSend, FiPhone, FiDollarSign, FiAward, FiHome, FiUsers } from 'react-icons/fi';
import ShinyText from '../UI/ShinyText';
import './ApplySection.css';

const ApplySection = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetOtp = (e) => {
    e.preventDefault();
    console.log('Get OTP:', formData);
  };

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
            <div className="apply-progress">
              <div className="apply-progress-top">
                <span className="apply-progress-step">Step 1 of 3</span>
                <span className="apply-progress-label">Contact Info</span>
              </div>
              <div className="apply-progress-bar">
                <div className="apply-progress-fill" aria-hidden />
              </div>
            </div>

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
                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="apply-field">
                <label htmlFor="phone">
                  Phone Number <span>*</span>
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

              <button type="submit" className="apply-otp-btn">
                <FiPhone aria-hidden />
                Get OTP
              </button>
            </form>
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

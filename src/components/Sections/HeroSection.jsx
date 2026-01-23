import { useState, useEffect, useRef } from 'react';
import { 
  FaRocket,
  FaDollarSign,
  FaHome,
  FaUsers,
  FaPhone,
  FaGraduationCap,
  FaPaperPlane
} from 'react-icons/fa';
import Button from '../UI/Button';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const HeroSection = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetOTP = (e) => {
    e.preventDefault();
    console.log('Get OTP:', formData);
    // Handle OTP logic here
  };

  const metrics = [
    { value: '12L+', label: 'Students Annually', numericValue: 12, suffix: 'L+' },
    { value: '₹9L', label: 'Earning Potential', numericValue: 9, suffix: 'L', prefix: '₹' },
    { value: 'PAN-India', label: 'Opportunities', isGreen: true, isText: true },
  ];

  const [animatedValues, setAnimatedValues] = useState({
    students: 0,
    earning: 0,
  });

  const metricsRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateNumbers();
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentRef = metricsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const animateNumbers = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        students: Math.floor(12 * easeOut),
        earning: Math.floor(9 * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues({
          students: 12,
          earning: 9,
        });
      }
    }, stepDuration);
  };

  const features = [
    {
      icon: FaDollarSign,
      title: 'Earnings Potential',
      description: '₹9 Lakhs/year potential',
      iconBg: 'bg-yellow-50',
      customColor: '#d97706',
      cardClass: 'feature-card-earnings',
    },
    {
      icon: FaGraduationCap,
      title: 'Certified Training',
      description: 'Become a trusted, certified counselor',
      iconBg: 'bg-blue-50',
      customColor: '#1e3a8a',
      cardClass: 'feature-card-training',
    },
    {
      icon: FaHome,
      title: 'Work from Anywhere',
      description: 'Flexible, work-from-home model',
      iconBg: 'bg-green-50',
      customColor: '#15803d',
      cardClass: 'feature-card-work',
    },
    {
      icon: FaUsers,
      title: 'Expert Support',
      description: "Backed by GuideXpert's central team",
      iconBg: 'bg-blue-50',
      customColor: '#1e3a8a',
      cardClass: 'feature-card-support',
    },
  ];

  return (
    <section id="home" className="relative py-20 md:py-28 overflow-hidden hero-mobile-gradient" style={{
      ...(isMobile ? {} : { background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.35) 0%, rgba(221, 160, 221, 0.3) 20%, rgba(176, 224, 230, 0.25) 40%, rgba(255, 255, 255, 0.7) 65%, rgba(255, 255, 255, 0.9) 85%, rgba(255, 255, 255, 1) 100%)' }),
      position: 'relative',
    }}>
      {/* Mobile/Tablet: Very vibrant gradient blurs - highly visible */}
      {isMobile && (
        <>
          {/* Very vibrant pink blur - upper left - top section */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '90%',
            height: '80%',
            background: 'radial-gradient(ellipse 80% 70% at 10% 15%, rgba(255, 20, 147, 1) 0%, rgba(255, 105, 180, 0.98) 8%, rgba(255, 182, 193, 0.95) 18%, rgba(255, 192, 203, 0.85) 32%, rgba(255, 192, 203, 0.7) 48%, rgba(255, 192, 203, 0.5) 62%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0.7) 88%, rgba(255, 255, 255, 1) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'blur(15px)',
          }}></div>
          {/* Very vibrant blue/purple blur - bottom right */}
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '85%',
            height: '75%',
            background: 'radial-gradient(ellipse 75% 65% at 88% 92%, rgba(30, 144, 255, 1) 0%, rgba(135, 206, 250, 0.98) 8%, rgba(176, 224, 230, 0.95) 18%, rgba(221, 160, 221, 0.9) 28%, rgba(176, 224, 230, 0.75) 42%, rgba(176, 224, 230, 0.55) 58%, rgba(255, 255, 255, 0.3) 72%, rgba(255, 255, 255, 0.7) 85%, rgba(255, 255, 255, 1) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'blur(18px)',
          }}></div>
        </>
      )}
      
      {/* Desktop: Enhanced pastel gradient background with decorative elements */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 75% 55% at 25% 30%, rgba(255, 192, 203, 0.4) 0%, rgba(255, 182, 193, 0.35) 15%, rgba(221, 160, 221, 0.3) 30%, rgba(176, 224, 230, 0.25) 50%, rgba(255, 255, 255, 0.6) 70%, rgba(255, 255, 255, 0.85) 85%, rgba(255, 255, 255, 1) 100%)',
        zIndex: 0,
      }}></div>
      
      {/* Desktop: More visible pink sphere - upper left */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        width: '220px',
        height: '220px',
        left: '8%',
        top: '12%',
        background: 'radial-gradient(circle, rgba(255, 105, 180, 0.5) 0%, rgba(255, 182, 193, 0.4) 35%, rgba(255, 192, 203, 0.25) 60%, rgba(255, 192, 203, 0.1) 85%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      {/* Desktop: More visible blue to pink gradient sphere - lower right */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        width: '240px',
        height: '240px',
        right: '12%',
        bottom: '18%',
        background: 'radial-gradient(circle, rgba(176, 224, 230, 0.45) 0%, rgba(135, 206, 250, 0.35) 30%, rgba(255, 192, 203, 0.3) 55%, rgba(221, 160, 221, 0.2) 75%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(35px)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      {/* Desktop: Additional small pink sphere - mid left */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        left: '15%',
        top: '50%',
        background: 'radial-gradient(circle, rgba(255, 105, 180, 0.4) 0%, rgba(255, 182, 193, 0.3) 50%, rgba(255, 192, 203, 0.15) 80%, transparent 100%)',
        borderRadius: '50%',
        filter: 'blur(25px)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      {/* Desktop: Central Frosted Glass Circle - enhanced visibility */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        width: '550px',
        height: '550px',
        left: '45%',
        top: '45%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.35) 30%, rgba(255, 255, 255, 0.2) 55%, rgba(255, 255, 255, 0.1) 80%, transparent 100%)',
        borderRadius: '50%',
        backdropFilter: 'blur(35px)',
        WebkitBackdropFilter: 'blur(35px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 8px 40px rgba(138, 43, 226, 0.12), inset 0 0 100px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      {/* Desktop: Reduced overlay to let colors show through */}
      <div className="hidden lg:block" style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.08) 100%)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>
      
      {/* Content Overlay */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start" style={{ position: 'relative', zIndex: 10 }}>
          {/* Left Side - Content */}
          <div className="space-y-10">
            {/* Join the Movement */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 font-santhosi">
              <FaRocket className="text-primary-blue-700 text-sm" />
              <span className="text-xs font-semibold text-primary-blue-800 uppercase tracking-wide font-santhosi">Join the Movement</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight font-satoshi" style={{ color: '#0f172a' }}>
                Become a Certified{' '}
                <span className="curved-underline">
                  Elite Counselor
                  <svg viewBox="0 0 500 20" preserveAspectRatio="none">
                    <path d="M 0,12 Q 125,2 250,8 T 500,8" />
                  </svg>
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-xl font-santhosi">
                Work from home. Guide students with confidence. Earn income while transforming lives.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4" ref={metricsRef}>
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className={`metric-card metric-card-${index} text-center p-6 rounded-xl border border-gray-200 font-santhosi`}
                  style={{
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div 
                    className={`text-2xl md:text-3xl font-bold font-santhosi transition-all duration-300 ${metric.isGreen ? 'text-green-700' : ''}`} 
                    style={!metric.isGreen ? { 
                      color: '#0f172a', 
                      fontWeight: '700',
                      letterSpacing: '-0.02em'
                    } : { 
                      fontWeight: '700',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {metric.isText ? (
                      metric.value
                    ) : (
                      <>
                        {metric.prefix || ''}
                        {index === 0 ? animatedValues.students : animatedValues.earning}
                        {metric.suffix}
                      </>
                    )}
                  </div>
                  <div className="text-xs md:text-sm mt-2.5 font-semibold font-santhosi transition-all duration-300 uppercase tracking-wide" style={{ 
                    color: '#475569', 
                    fontWeight: '600',
                    letterSpacing: '0.05em'
                  }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
            </div>

          {/* Right Side - Form */}
          <div className="lg:sticky lg:top-24 flex justify-end">
            <div className="w-full max-w-md bg-gradient-to-br from-white via-blue-50/30 to-blue-50/50 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200/50">
              {/* Progress Indicator */}
              <div className="mb-6 font-santhosi">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide font-santhosi" style={{ fontWeight: '700', color: '#374151' }}>Step 1 of 3</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary-blue-700 h-2 rounded-full transition-all duration-300" style={{ width: '33.33%' }}></div>
                </div>
                <p className="text-sm font-bold text-gray-800 mt-2.5 font-santhosi" style={{ fontWeight: '700', color: '#1f2937' }}>Contact Info</p>
                      </div>

              {/* Form Title */}
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaPaperPlane className="text-primary-blue-700 text-sm" />
                      </div>
                <h2 className="text-xl font-bold text-gray-900 font-santhosi" style={{ fontWeight: '700' }}>Apply Now</h2>
                    </div>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed font-santhosi" style={{ fontWeight: '600', color: '#374151' }}>Start your journey as a certified counselor.</p>

              {/* Form */}
              <form onSubmit={handleGetOTP} className="space-y-5 font-santhosi">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2.5 font-santhosi" style={{ fontWeight: '700', color: '#111827' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 text-base border border-gray-400 rounded-md focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all duration-200 font-santhosi"
                    style={{
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                      backgroundColor: '#ffffff',
                      fontWeight: '600',
                      color: '#1f2937',
                      borderColor: '#6b7280',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15), 0 0 0 3px rgba(37, 99, 235, 0.1)';
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#6b7280';
                    }}
                    placeholder="Enter your full name"
                  />
                  </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2.5 font-santhosi" style={{ fontWeight: '700', color: '#111827' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 text-base border border-gray-400 rounded-md focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all duration-200 font-santhosi"
                    style={{
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                      backgroundColor: '#ffffff',
                      fontWeight: '600',
                      color: '#1f2937',
                      borderColor: '#6b7280',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15), 0 0 0 3px rgba(37, 99, 235, 0.1)';
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#6b7280';
                    }}
                    placeholder="your.email@example.com"
                  />
            </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2.5 font-santhosi" style={{ fontWeight: '700', color: '#111827' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 text-base border border-gray-400 rounded-md focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all duration-200 font-santhosi"
                    style={{
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                      backgroundColor: '#ffffff',
                      fontWeight: '600',
                      color: '#1f2937',
                      borderColor: '#6b7280',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15), 0 0 0 3px rgba(37, 99, 235, 0.1)';
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#6b7280';
                    }}
                    placeholder="9876543210"
                  />
          </div>

                <button
                  type="submit"
                  className="w-full bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-5 py-4 rounded-md text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2 font-santhosi"
                  style={{
                    boxShadow: '0 4px 14px rgba(30, 64, 175, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
                    fontWeight: '700',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.5), 0 3px 8px rgba(0, 0, 0, 0.15)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 4px 14px rgba(30, 64, 175, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaPhone className="text-base" />
                  <span>Get OTP</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature Cards with Right-to-Left Animation */}
        <div className="mt-24 relative z-10 overflow-hidden py-4">
          <div className="scroll-animation flex gap-6" style={{ width: 'fit-content' }}>
            {/* Duplicate cards for seamless loop */}
            {[...features, ...features, ...features].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`${index}-${Math.floor(index / features.length)}`}
                  className={`feature-card ${feature.cardClass} bg-white rounded-xl p-8 text-center border border-gray-200 font-santhosi flex-shrink-0 relative overflow-hidden`}
                  style={{
                    width: '300px',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
                  }}
                  onMouseEnter={(e) => {
                    const iconContainer = e.currentTarget.querySelector('.icon-container');
                    const icon = e.currentTarget.querySelector('.icon-element');
                    if (iconContainer && icon) {
                      iconContainer.style.transform = 'scale(1.1)';
                      iconContainer.style.boxShadow = `0 8px 24px ${feature.customColor}40`;
                      icon.style.transform = 'rotate(5deg) scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const iconContainer = e.currentTarget.querySelector('.icon-container');
                    const icon = e.currentTarget.querySelector('.icon-element');
                    if (iconContainer && icon) {
                      iconContainer.style.transform = 'scale(1)';
                      iconContainer.style.boxShadow = `0 4px 12px ${feature.customColor}20`;
                      icon.style.transform = 'rotate(0deg) scale(1)';
                    }
                  }}
                >
                  <div 
                    className={`icon-container ${feature.iconBg} w-18 h-18 rounded-xl flex items-center justify-center mx-auto mb-5 transition-all duration-300`}
                    style={{
                      width: '72px',
                      height: '72px',
                      boxShadow: `0 4px 12px ${feature.customColor}15, 0 2px 4px ${feature.customColor}10`,
                    }}
                  >
                    <Icon 
                      className="icon-element text-2xl transition-all duration-300" 
                      style={{ color: feature.customColor }}
                    />
                  </div>
                  <h3 className="font-bold mb-3 text-lg leading-tight font-santhosi transition-colors duration-300" style={{ 
                    color: '#0f172a',
                    fontWeight: '700'
                  }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-santhosi transition-colors duration-300" style={{ 
                    color: '#475569',
                    fontWeight: '500'
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


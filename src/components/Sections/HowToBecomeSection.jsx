import { useState, useEffect, useRef } from 'react';
import { 
  FiFileText, 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiAward, 
  FiMessageSquare,
  FiUser,
  FiUsers,
  FiBook,
  FiBarChart2,
  FiMonitor,
  FiTool,
  FiHeadphones,
  FiLayers,
  FiTarget,
  FiTrendingUp,
  FiShield
} from 'react-icons/fi';
import { useApplyModal } from '../../contexts/useApplyModal';
import ShinyText from '../UI/ShinyText';

const HowToBecomeSection = () => {
  const { openApplyModal } = useApplyModal();
  const sectionRef = useRef(null);
  const progressBarContainerRef = useRef(null);
  const stepsContainerRef = useRef(null);
  const stepRefs = useRef([]);
  const iconRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [progressBarHeight, setProgressBarHeight] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isMediumScreen, setIsMediumScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  // Six steps matching the original structure
  const steps = [
    {
      number: 1,
      title: "Apply Now",
      icon: FiFileText,
      description: "Fill out the application form with your details and experience.",
      details: {
        duration: "1-2 Weeks",
        process: "Application form submission and initial review"
      }
    },
    {
      number: 2,
      title: "Screening & Interview",
      icon: FiSearch,
      description: "We review your application and conduct an interview to assess your suitability.",
      details: {
        duration: "1 Week",
        process: "Application review and interview process"
      }
    },
    {
      number: 3,
      title: "Agreement & Onboarding",
      icon: FiCheckCircle,
      description: "Complete the onboarding process and sign the counselor agreement.",
      details: {
        duration: "3-5 Days",
        process: "Agreement signing and platform onboarding"
      }
    },
    {
      number: 4,
      title: "25-Hour Training",
      icon: FiClock,
      description: "Complete our comprehensive 8-hour training program.",
      details: {
        duration: "25 Hours",
        format: "Online + Practical sessions"
      }
    },
    {
      number: 5,
      title: "Get Certified!",
      icon: FiAward,
      description: "Receive your certification upon successful completion of training.",
      details: {
        duration: "Upon completion",
        process: "Certification issuance and badge"
      }
    },
    {
      number: 6,
      title: "Start Counseling!",
      icon: FiMessageSquare,
      description: "Begin your journey as a certified GuideXpert Counselor.",
      details: {
        support: "Ongoing support from certification",
        features: ["Dashboard access", "Unlimited consultations", "24/7 guidance"]
      }
    }
  ];

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      setIsMediumScreen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      // On mobile, disable scroll-based animations
      if (window.innerWidth < 1024) {
        setScrollProgress(0);
        setActiveStep(0); // Keep first step active or all visible
        return;
      }

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when section enters viewport
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate scroll progress within section (0 to 1)
      // Works in both scroll directions (forward and reverse)
      let progress = 0;
      
      // Define trigger point where progress tracking starts
      const triggerPoint = windowHeight * 0.5; // Center of viewport
      
      // Calculate scrollable height (total distance we can scroll through)
      const scrollableHeight = sectionHeight - windowHeight * 0.5; // Match trigger point
      
      if (scrollableHeight > 0) {
        // Calculate how much has been scrolled based on section position
        // When sectionTop decreases (scrolling down), scrolled increases
        // When sectionTop increases (scrolling up), scrolled decreases
        const scrolled = Math.max(0, triggerPoint - sectionTop);
        progress = Math.min(1, Math.max(0, scrolled / scrollableHeight));
      } else {
        // If section is smaller than viewport, set progress based on visibility
        if (sectionTop <= triggerPoint && sectionTop >= -sectionHeight + windowHeight) {
          progress = 1;
        } else {
          progress = 0;
        }
      }

      setScrollProgress(progress);

      // Determine active step based on progress
      // Each step gets ~16.67% of scroll progress (100% / 6 steps)
      // Trigger at center (50%) when card reaches middle of viewport
      const stepProgress = progress * 6; // 6 steps
      if (stepProgress < 0.5) {
        setActiveStep(0);
      } else if (stepProgress < 1.5) {
        setActiveStep(1);
      } else if (stepProgress < 2.5) {
        setActiveStep(2);
      } else if (stepProgress < 3.5) {
        setActiveStep(3);
      } else if (stepProgress < 4.5) {
        setActiveStep(4);
      } else {
        setActiveStep(5);
      }
    };

    // Use requestAnimationFrame for smooth updates
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Update progress bar height when activeStep changes or on resize
  useEffect(() => {
    const updateProgressBarHeight = () => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (progressBarContainerRef.current && iconRefs.current[activeStep]) {
          const containerRect = progressBarContainerRef.current.getBoundingClientRect();
          const iconRect = iconRefs.current[activeStep].getBoundingClientRect();
          
          // Calculate icon center position relative to progress bar container
          const iconCenterY = iconRect.top + (iconRect.height / 2) - containerRect.top;
          setProgressBarHeight(Math.max(16, iconCenterY));
        } else if (progressBarContainerRef.current && stepRefs.current[activeStep]) {
          // Fallback: calculate based on card position if icon ref not available
          const containerRect = progressBarContainerRef.current.getBoundingClientRect();
          const stepCardRect = stepRefs.current[activeStep].getBoundingClientRect();
          // Icon is at top-8 (32px) from card top, icon is 64px (w-16 h-16)
          const iconCenterOffset = 32 + 32; // top-8 + half icon height
          const stepTop = stepCardRect.top - containerRect.top;
          const iconCenterY = stepTop + iconCenterOffset;
          setProgressBarHeight(Math.max(16, iconCenterY));
        }
      });
    };

    // Initial calculation with delay to ensure refs are populated
    const timeoutId = setTimeout(updateProgressBarHeight, 150);

    // Update on resize and scroll (to handle sticky positioning changes)
    const handleResize = () => updateProgressBarHeight();
    const handleScroll = () => updateProgressBarHeight();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeStep]);

  return (
    <section 
      id="journey"
      ref={sectionRef}
      className="bg-white relative"
      style={{ 
        minHeight: 'auto',
        paddingTop: isLargeScreen ? '5rem' : '2.5rem',
        paddingBottom: isLargeScreen ? '5rem' : '3rem'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
          {/* Left Column: Sticky Heading and CTAs */}
          <div 
            className="lg:w-2/5 flex flex-col justify-center mb-4 lg:mb-0 px-2 sm:px-0"
            style={{
              position: isLargeScreen ? 'sticky' : 'relative',
              top: isLargeScreen ? '50vh' : 'auto',
              transform: isLargeScreen ? 'translateY(-50%)' : 'none',
              alignSelf: 'flex-start',
              height: 'fit-content'
            }}
          >
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Get Ready for Your Counseling Career in 6 Steps
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 md:mb-8" style={{
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#64748b'
            }}>
              Launch your counseling career today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={openApplyModal}
                className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-bold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] text-sm md:text-base"
                style={{
                  backgroundColor: '#003366',
                }}
              >
                <ShinyText
                  text="Apply Now"
                  speed={2}
                  delay={0}
                  color="#ffffff"
                  shineColor="#e0ebff"
                  spread={120}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                  disabled={false}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('#why');
                  if (el) {
                    const header = document.querySelector('header');
                    const h = header?.offsetHeight ?? 80;
                    const y = el.getBoundingClientRect().top + window.pageYOffset - h - 20;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] text-sm md:text-base"
                style={{
                  borderColor: '#003366',
                  color: '#003366',
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Scrolling Steps */}
          <div 
            className="lg:w-3/5 w-full"
            style={{
              paddingTop: isLargeScreen ? '10vh' : '0',
              paddingBottom: '0'
            }}
          >
            <div ref={progressBarContainerRef} className="relative">
              {/* Connecting Line Background (Full Height) */}
              <div 
                className="absolute top-0 w-0.5 transition-all duration-300"
                style={{
                  backgroundColor: '#e5e7eb',
                  height: '100%',
                  zIndex: 0,
                  left: isLargeScreen ? '2rem' : '1rem'
                }}
              />
              
              {/* Connecting Line Progress (Filled Portion) */}
              <div 
                className="absolute top-0 w-0.5 transition-all duration-300"
                style={{
                  backgroundColor: '#003366',
                  height: isLargeScreen 
                    ? (progressBarHeight > 0 ? `${progressBarHeight}px` : '16px')
                    : '100%', // Full height on mobile
                  zIndex: 1,
                  minHeight: '16px',
                  left: isLargeScreen ? '2rem' : '1rem'
                }}
              />
              
              <div 
                ref={stepsContainerRef}
                className="relative z-10" 
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isLargeScreen ? '6rem' : '1.5rem',
                  paddingBottom: isLargeScreen ? '0' : '2rem'
                }}
              >
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === index;
                  const isPast = activeStep > index;
                  
                  // Calculate individual step progress for smoother transitions
                  // Each step gets a range of 0-1 as it becomes active
                  const stepProgress = (scrollProgress * 6) - index;
                  const clampedProgress = Math.max(0, Math.min(1, stepProgress));
                  
                  // Smooth opacity transition based on progress
                  // On mobile, all cards are fully visible
                  let opacity = 1; // Default full opacity for mobile
                  
                  if (isLargeScreen) {
                    // Only apply scroll-based opacity on large screens
                    if (isActive) {
                      opacity = 1;
                    } else if (isPast) {
                      opacity = 0.7;
                    } else {
                      opacity = 0.4 + (clampedProgress * 0.6);
                    }
                  }
                  
                  // Scale: Smoothly transition based on progress (disable on mobile)
                  const scale = isLargeScreen 
                    ? (isActive 
                        ? 1 
                        : isPast 
                          ? 0.97 
                          : 0.92 + (clampedProgress * 0.08)) // 0.92 to 1.0
                    : 1; // Always 1 on mobile
                  
                  // Translate: Smoothly transition based on progress (reduce on mobile)
                  const translateY = isLargeScreen 
                    ? (isActive 
                        ? 0 
                        : isPast 
                          ? 10 
                          : 30 - (clampedProgress * 30)) // 30 to 0
                    : 0; // No translation on mobile

                  return (
                    <div
                      key={index}
                      ref={(el) => {
                        if (el) stepRefs.current[index] = el;
                      }}
                      className="relative"
                    >
                      {/* Step Card */}
                      <div
                        className="bg-white rounded-xl border transition-all duration-300"
                        style={{
                          marginLeft: isLargeScreen ? '3rem' : '2.5rem',
                          padding: isLargeScreen ? '2rem' : '0.875rem',
                          boxShadow: isLargeScreen 
                            ? (isActive 
                                ? '0 8px 24px rgba(0, 0, 0, 0.12)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)')
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                          borderRadius: '0.75rem',
                          opacity,
                          transform: `translateY(${translateY}px) scale(${scale})`,
                          borderColor: isLargeScreen 
                            ? (isActive ? '#003366' : '#e5e7eb')
                            : '#e5e7eb',
                          borderWidth: isLargeScreen 
                            ? (isActive ? '2px' : '1px')
                            : '1px',
                          ...(isActive && {
                            background: 'linear-gradient(to bottom right, #e8f0fa 0%, #eef4fa 25%, #f2f4f8 50%, #f5f4f2 75%, #f7f4eb 100%)'
                          })
                        }}
                      >
                    {/* Step Icon Circle - Positioned on the line */}
                    <div 
                      ref={(el) => {
                        if (el) iconRefs.current[index] = el;
                      }}
                      className="absolute rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 border-4 border-white z-20"
                      style={{
                        left: 0,
                        top: isLargeScreen ? '2rem' : '0.875rem',
                        width: isLargeScreen ? '4rem' : '2rem',
                        height: isLargeScreen ? '4rem' : '2rem',
                        marginLeft: isLargeScreen ? '-2rem' : '-1rem',
                        backgroundColor: isLargeScreen
                          ? (isActive || isPast 
                              ? '#003366' 
                              : clampedProgress > 0.3 
                                ? `rgba(0, 51, 102, ${0.5 + clampedProgress * 0.5})`
                                : '#9ca3af')
                          : '#003366',
                        transform: isLargeScreen
                          ? (isActive 
                              ? 'scale(1.1)' 
                              : clampedProgress > 0.5 
                                ? `scale(${1 + (clampedProgress - 0.5) * 0.2})`
                                : 'scale(1)')
                          : 'scale(1)'
                      }}
                    >
                      <Icon style={{ width: isLargeScreen ? '2rem' : '1.25rem', height: isLargeScreen ? '2rem' : '1.25rem' }} />
                    </div>

                    <div className="flex items-center gap-2 mb-3" style={{ marginBottom: isLargeScreen ? '1.5rem' : '0.75rem' }}>
                      <div>
                        <div className="font-semibold text-gray-500 mb-1" style={{
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: isLargeScreen ? '12px' : '10px'
                        }}>
                          Step {step.number}
                        </div>
                        <h3 
                          className="heading-subsection font-bold transition-colors duration-300"
                          style={{
                            fontSize: !isLargeScreen ? '1.125rem' : undefined,
                            fontWeight: '700',
                            color: isLargeScreen
                              ? (isActive 
                                  ? '#003366' 
                                  : isPast 
                                    ? '#4b5563' 
                                    : clampedProgress > 0.3 
                                      ? `rgba(0, 51, 102, ${0.4 + clampedProgress * 0.6})`
                                      : '#9ca3af')
                              : '#003366',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.2'
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p 
                      className="text-gray-700 transition-opacity duration-300"
                      style={{
                        fontSize: isLargeScreen ? '1.125rem' : '0.875rem',
                        color: '#374151',
                        lineHeight: '1.6',
                        marginBottom: isLargeScreen ? '1.5rem' : '0.75rem',
                        opacity: isLargeScreen
                          ? (isActive 
                              ? 1 
                              : isPast 
                                ? 0.8 
                                : 0.5 + (clampedProgress * 0.5))
                          : 1
                      }}
                    >
                      {step.description}
                    </p>

                    {/* Step Details */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200" style={{ padding: isLargeScreen ? '1.5rem' : '0.75rem' }}>
                      {step.details.duration && (
                        <div style={{ marginBottom: isLargeScreen ? '1rem' : '0.5rem' }}>
                          <p className="font-semibold text-gray-900 mb-1" style={{ 
                            color: '#003366',
                            fontSize: isLargeScreen ? '0.875rem' : '0.75rem'
                          }}>
                            Duration: <span className="font-normal text-gray-600">{step.details.duration}</span>
                          </p>
                          {step.details.process && (
                            <p className="text-gray-600" style={{ 
                              color: '#64748b',
                              fontSize: isLargeScreen ? '0.875rem' : '0.75rem'
                            }}>
                              {step.details.process}
                            </p>
                          )}
                          {step.details.format && (
                            <p className="text-gray-600" style={{ 
                              color: '#64748b',
                              fontSize: isLargeScreen ? '0.875rem' : '0.75rem'
                            }}>
                              Format: {step.details.format}
                            </p>
                          )}
                        </div>
                      )}
                      {step.details.support && (
                        <div style={{ marginBottom: isLargeScreen ? '1rem' : '0.5rem' }}>
                          <p className="font-semibold text-gray-900 mb-2" style={{ 
                            color: '#003366',
                            fontSize: isLargeScreen ? '0.875rem' : '0.75rem'
                          }}>
                            {step.details.support}
                          </p>
                          {step.details.features && (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: isLargeScreen ? '0.5rem' : '0.375rem' }}>
                              {step.details.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-600" style={{
                                  fontSize: isLargeScreen ? '0.875rem' : '0.75rem'
                                }}>
                                  <FiCheckCircle className="text-green-600 flex-shrink-0" style={{
                                    width: isLargeScreen ? '1rem' : '0.875rem',
                                    height: isLargeScreen ? '1rem' : '0.875rem'
                                  }} />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToBecomeSection;


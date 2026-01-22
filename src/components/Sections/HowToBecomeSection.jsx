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
import Button from '../UI/Button';

const HowToBecomeSection = () => {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

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
      description: "Complete our comprehensive 25-hour training program.",
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

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when section enters viewport
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate scroll progress within section (0 to 1)
      // Start tracking when section top reaches viewport
      let progress = 0;
      if (sectionTop <= windowHeight * 0.3) {
        // Section has entered the trigger zone
        const scrollableHeight = sectionHeight - windowHeight * 0.7;
        const scrolled = Math.max(0, windowHeight * 0.3 - sectionTop);
        progress = Math.min(1, scrolled / Math.max(scrollableHeight, 1));
      } else if (sectionTop < 0) {
        // Section has been scrolled past
        progress = 1;
      }

      setScrollProgress(progress);

      // Determine active step based on progress
      // Each step gets ~16.67% of scroll progress (100% / 6 steps)
      // Trigger at 40% of previous card scroll (faster highlighting)
      const stepProgress = progress * 6; // 6 steps
      if (stepProgress < 0.4) {
        setActiveStep(0);
      } else if (stepProgress < 1.4) {
        setActiveStep(1);
      } else if (stepProgress < 2.4) {
        setActiveStep(2);
      } else if (stepProgress < 3.4) {
        setActiveStep(3);
      } else if (stepProgress < 4.4) {
        setActiveStep(4);
      } else if (stepProgress < 5.4) {
        setActiveStep(5);
      } else {
        setActiveStep(5); // Stay on last step
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

  return (
    <section 
      ref={sectionRef}
      className="bg-white relative"
      style={{ 
        minHeight: '500vh',
        paddingTop: '5rem',
        paddingBottom: '0rem'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 relative">
          {/* Left Column: Sticky Heading and CTAs */}
          <div 
            className="lg:w-2/5 flex flex-col justify-center"
            style={{
              position: 'sticky',
              top: '10vh',
              alignSelf: 'flex-start',
              height: 'fit-content'
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: '#0f172a',
              lineHeight: '1.2'
            }}>
              Get Ready for Your Counseling Career in 6 Steps
            </h2>
            <p className="text-lg text-gray-600 mb-8" style={{
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#64748b',
              fontSize: '18px'
            }}>
              Launch your counseling career today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: '#7c3aed',
                  focusRingColor: '#7c3aed'
                }}
              >
                Apply Now
              </button>
              <button
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: '#7c3aed',
                  color: '#7c3aed',
                  focusRingColor: '#7c3aed'
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Scrolling Steps */}
          <div 
            className="lg:w-3/5"
            style={{
              paddingTop: '10vh',
              paddingBottom: '0'
            }}
          >
            <div className="relative">
              {/* Connecting Line Background (Full Height) */}
              <div 
                className="absolute left-8 top-0 w-0.5 transition-all duration-500"
                style={{
                  backgroundColor: '#e5e7eb',
                  height: '100%',
                  zIndex: 0
                }}
              />
              
              {/* Connecting Line Progress (Filled Portion) */}
              <div 
                className="absolute left-8 top-0 w-0.5 transition-all duration-500"
                style={{
                  backgroundColor: '#7c3aed',
                  height: `${((activeStep + 1) / steps.length) * 100}%`,
                  zIndex: 1,
                  minHeight: '16px' // At least show the first step's connection
                }}
              />
              
              <div className="space-y-24 relative z-10" style={{ paddingBottom: '0', marginBottom: '0' }}>
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === index;
                  const isPast = activeStep > index;
                  const isFuture = activeStep < index;
                  
                  // Calculate individual step progress for smoother transitions
                  // Each step gets a range of 0-1 as it becomes active
                  const stepProgress = (scrollProgress * 6) - index;
                  const clampedProgress = Math.max(0, Math.min(1, stepProgress));
                  
                  // Smooth opacity transition based on progress
                  let opacity = 0.4; // Base opacity for future steps
                  if (isActive) {
                    // Active step: full opacity
                    opacity = 1;
                  } else if (isPast) {
                    // Past steps: slightly dimmed but visible
                    opacity = 0.7;
                  } else {
                    // Future steps: gradually increase opacity as they approach
                    // When stepProgress is between 0 and 1, smoothly transition
                    opacity = 0.4 + (clampedProgress * 0.6); // 0.4 to 1.0
                  }
                  
                  // Scale: Smoothly transition based on progress
                  const scale = isActive 
                    ? 1 
                    : isPast 
                      ? 0.97 
                      : 0.92 + (clampedProgress * 0.08); // 0.92 to 1.0
                  
                  // Translate: Smoothly transition based on progress
                  const translateY = isActive 
                    ? 0 
                    : isPast 
                      ? 10 
                      : 30 - (clampedProgress * 30); // 30 to 0

                  return (
                    <div
                      key={index}
                      className="relative"
                    >
                      {/* Step Card */}
                      <div
                        className="bg-white rounded-xl p-8 border border-gray-200 transition-all duration-500 ml-12"
                        style={{
                          boxShadow: isActive 
                            ? '0 8px 24px rgba(0, 0, 0, 0.12)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                          borderRadius: '0.75rem',
                          opacity,
                          transform: `translateY(${translateY}px) scale(${scale})`,
                          borderColor: isActive ? '#7c3aed' : '#e5e7eb',
                          borderWidth: isActive ? '2px' : '1px'
                        }}
                      >
                    {/* Step Icon Circle - Positioned on the line */}
                    <div 
                      className="absolute left-0 top-8 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500 border-4 border-white z-20"
                      style={{
                        backgroundColor: isActive || isPast 
                          ? '#7c3aed' 
                          : clampedProgress > 0.3 
                            ? `rgba(124, 58, 237, ${0.5 + clampedProgress * 0.5})` // Smooth transition to purple
                            : '#9ca3af',
                        transform: isActive 
                          ? 'scale(1.1)' 
                          : clampedProgress > 0.5 
                            ? `scale(${1 + (clampedProgress - 0.5) * 0.2})` // Scale up as it approaches
                            : 'scale(1)',
                        marginLeft: '-2rem'
                      }}
                    >
                      <Icon className="w-8 h-8" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div>
                        <div className="text-sm font-semibold text-gray-500 mb-1" style={{
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '12px'
                        }}>
                          Step {step.number}
                        </div>
                        <h3 
                          className="text-3xl font-bold transition-colors duration-500"
                          style={{
                            fontWeight: '700',
                            color: isActive 
                              ? '#0f172a' 
                              : isPast 
                                ? '#4b5563' 
                                : clampedProgress > 0.3 
                                  ? `rgba(15, 23, 42, ${0.4 + clampedProgress * 0.6})` // Smooth color transition
                                  : '#9ca3af',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p 
                      className="text-lg text-gray-700 mb-6 transition-opacity duration-500"
                      style={{
                        color: '#374151',
                        lineHeight: '1.6',
                        opacity: isActive 
                          ? 1 
                          : isPast 
                            ? 0.8 
                            : 0.5 + (clampedProgress * 0.5) // Smooth opacity transition
                      }}
                    >
                      {step.description}
                    </p>

                    {/* Step Details */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {step.details.duration && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-1" style={{ color: '#0f172a' }}>
                            Duration: <span className="font-normal text-gray-600">{step.details.duration}</span>
                          </p>
                          {step.details.process && (
                            <p className="text-sm text-gray-600" style={{ color: '#64748b' }}>
                              {step.details.process}
                            </p>
                          )}
                          {step.details.format && (
                            <p className="text-sm text-gray-600" style={{ color: '#64748b' }}>
                              Format: {step.details.format}
                            </p>
                          )}
                        </div>
                      )}
                      {step.details.support && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2" style={{ color: '#0f172a' }}>
                            {step.details.support}
                          </p>
                          {step.details.features && (
                            <ul className="space-y-2">
                              {step.details.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
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


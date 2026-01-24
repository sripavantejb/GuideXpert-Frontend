import { useState, useEffect, useRef } from 'react';
import { FiUser, FiStar, FiAward, FiCheckCircle, FiTrendingUp, FiShield } from 'react-icons/fi';

const LegacySection = () => {
  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    success: 0,
    counselors: 0
  });
  
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  const stats = [
    { 
      icon: FiUser, 
      value: 1700, 
      suffix: '+', 
      label: 'Students Guided', 
      key: 'students', 
      color: '#003366', 
    },
    { 
      icon: FiStar, 
      value: 1000, 
      suffix: '+', 
      label: 'Success Stories', 
      key: 'success', 
      color: '#d97706', 
    },
    { 
      icon: FiAward, 
      value: 100, 
      suffix: '+', 
      label: 'Certified Counselors', 
      key: 'counselors', 
      color: '#15803d', 
    },
  ];

  const achievements = [
    {
      icon: FiShield,
      text: "Trusted by leading educational institutions",
      highlight: "Trusted"
    },
    {
      icon: FiTrendingUp,
      text: "98% success rate in student placements",
      highlight: "98%"
    },
    {
      icon: FiStar,
      text: "Recognized for excellence in career counseling",
      highlight: "Excellence"
    },
    {
      icon: FiCheckCircle,
      text: "Comprehensive support and training programs",
      highlight: "Comprehensive"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateStats();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const animateStats = () => {
    const duration = 2500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        students: Math.floor(1700 * easeOut),
        success: Math.floor(1000 * easeOut),
        counselors: Math.floor(100 * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          students: 1700,
          success: 1000,
          counselors: 100,
        });
      }
    }, stepDuration);
  };

  return (
    <section 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, rgba(248, 250, 252, 0.5) 50%, #ffffff 100%)',
        position: 'relative'
      }}
    >
      {/* Pastel Pink Sphere - Top Left */}
      <div 
        className="absolute rounded-full opacity-40 blur-3xl"
        style={{
          top: '10%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.5) 0%, rgba(255, 192, 203, 0.35) 35%, rgba(255, 192, 203, 0.2) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Pastel Blue/Purple Sphere - Bottom Right */}
      <div 
        className="absolute rounded-full opacity-40 blur-3xl"
        style={{
          bottom: '10%',
          right: '5%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(176, 224, 230, 0.5) 0%, rgba(221, 160, 221, 0.35) 40%, rgba(176, 224, 230, 0.2) 65%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-primary-blue-100 bg-primary-blue-50">
            <FiShield className="text-primary-blue-700 text-sm" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-blue-800 font-santhosi">
              Our Legacy
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-satoshi" style={{
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: '#003366',
            lineHeight: '1.1'
          }}>
            Built on a Legacy of Proven Success
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-santhosi" style={{
            fontWeight: '500',
            lineHeight: '1.7',
            color: '#475569'
          }}>
            GuideXpert has a strong track record of empowering students and counselors alike, with a legacy built on trust, innovation, and measurable excellence.
          </p>
        </div>

        {/* Statistics Grid - Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" ref={statsRef}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-10 text-center border border-gray-200 transition-all duration-300 hover:-translate-y-2"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 24px ${stat.color}20, 0 4px 8px ${stat.color}10`;
                  e.currentTarget.style.borderColor = `${stat.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <div 
                    className="text-5xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: stat.color }}
                  >
                    <Icon />
                  </div>
                </div>

                {/* Animated Number */}
                <div 
                  className="text-4xl md:text-5xl font-bold mb-3 font-santhosi"
                  style={{
                    fontWeight: '700',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1',
                    color: '#003366'
                  }}
                >
                  {animatedStats[stat.key].toLocaleString()}{stat.suffix}
                </div>

                {/* Label */}
                <div 
                  className="text-base font-semibold uppercase tracking-wider font-santhosi"
                  style={{
                    fontWeight: '600',
                    color: '#64748b',
                    letterSpacing: '0.05em'
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Veterans Card - Liquid Glass Design */}
        <div 
          className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-gray-200"
          style={{
            background: 'linear-gradient(135deg, rgba(176, 224, 230, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
            borderRadius: '1rem'
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Gradient Panel */}
            <div 
              className="md:w-2/5 p-8 md:p-10 flex flex-col justify-center"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #003366 100%)'
              }}
            >
              <div className="mb-6">
                <div 
                  className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6"
                  style={{
                    borderRadius: '0.75rem'
                  }}
                >
                  <FiCheckCircle className="w-8 h-8 text-white" style={{ strokeWidth: '2.5' }} />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-satoshi" style={{
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  Powered by Industry Veterans
                </h3>
                <p className="text-base text-primary-blue-50 leading-relaxed font-santhosi" style={{
                  fontWeight: '400',
                  lineHeight: '1.7',
                  fontSize: '16px'
                }}>
                  Our experienced team brings decades of expertise in education and career counseling to help you succeed.
                </p>
              </div>
            </div>

            {/* Right Side - Achievements */}
            <div className="md:w-3/5 p-8 md:p-10">
              <div className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-white bg-opacity-60 border border-gray-100 transition-all duration-200 hover:bg-opacity-100 hover:border-primary-blue-200 hover:shadow-md"
                      style={{
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                      }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-blue-800 rounded-full flex items-center justify-center mt-0.5">
                        <Icon className="w-4 h-4 text-white" style={{ strokeWidth: '2.5' }} />
                      </div>
                      <span className="text-base text-gray-900 font-medium leading-snug font-santhosi" style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#003366',
                        lineHeight: '1.5'
                      }}>
                        {achievement.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <button
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue-800 hover:bg-primary-blue-900 text-white rounded-md text-base font-bold transition-all duration-200 font-santhosi"
            style={{
              boxShadow: '0 4px 14px rgba(0, 51, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
              fontWeight: '700',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 6px 20px rgba(0, 51, 102, 0.5), 0 3px 8px rgba(0, 0, 0, 0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 14px rgba(0, 51, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>Learn More</span>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default LegacySection;


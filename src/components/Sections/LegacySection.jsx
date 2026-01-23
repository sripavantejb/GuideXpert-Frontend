import { useState, useEffect, useRef } from 'react';
import { FiUser, FiStar, FiAward, FiCheckCircle, FiTrendingUp, FiShield } from 'react-icons/fi';
import Button from '../UI/Button';

const LegacySection = () => {
  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    success: 0,
    counselors: 0
  });
  
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  const stats = [
    { icon: FiUser, value: 1700, suffix: '+', label: 'Students Guided', key: 'students', color: '#3b82f6' },
    { icon: FiStar, value: 1000, suffix: '+', label: 'Success Stories', key: 'success', color: '#8b5cf6' },
    { icon: FiAward, value: 100, suffix: '+', label: 'Certified Counselors', key: 'counselors', color: '#10b981' },
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
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        position: 'relative'
      }}
    >
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f172a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Decorative Gradient Orbs */}
      <div 
        className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)',
          animation: 'float 8s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
          animation: 'float 6s ease-in-out infinite reverse'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm">
            <FiShield className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Our Legacy
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-satoshi" style={{
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Built on a Legacy of{' '}
            <span 
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Proven Success
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-santhosi" style={{
            fontWeight: '500',
            lineHeight: '1.7',
            color: '#475569'
          }}>
            GuideXpert has a strong track record of empowering students and counselors alike, with a legacy built on trust, innovation, and measurable excellence.
          </p>
        </div>

        {/* Statistics Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20" ref={statsRef}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}40 0%, ${stat.color}20 100%)`
                  }}
                />
                
                <div
                  className="relative bg-white rounded-2xl p-8 md:p-10 text-center border border-gray-100 transition-all duration-500 hover:border-gray-200 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    borderRadius: '1rem',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Icon Container */}
                  <div className="mb-6 flex justify-center">
                    <div 
                      className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                        borderRadius: '1rem'
                      }}
                    >
                      {/* Icon Glow */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-md"
                        style={{
                          background: stat.color
                        }}
                      />
                      <Icon className="w-10 h-10 text-white relative z-10" style={{ strokeWidth: '2.5' }} />
                    </div>
                  </div>

                  {/* Animated Number */}
                  <div className="mb-3">
                    <span 
                      className="text-5xl md:text-6xl lg:text-7xl font-bold inline-block"
                      style={{
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        lineHeight: '1',
                        background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {animatedStats[stat.key].toLocaleString()}{stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <div 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontWeight: '700',
                      color: '#64748b',
                      letterSpacing: '0.1em',
                      fontSize: '13px'
                    }}
                  >
                    {stat.label}
                  </div>

                  {/* Bottom Accent Line */}
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-24 transition-all duration-500 rounded-full"
                    style={{
                      background: stat.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Veterans Card - Enhanced Split Design */}
        <div 
          className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-gray-200 relative group"
          style={{
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.15)',
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Gradient Border Effect */}
          <div 
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-sm"
          />

          <div className="relative flex flex-col md:flex-row">
            {/* Left Side - Premium Gradient Panel */}
            <div 
              className="md:w-2/5 p-10 md:p-12 flex flex-col justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)',
              }}
            >
              {/* Decorative Elements */}
              <div 
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  transform: 'translate(-30%, 30%)'
                }}
              />

              <div className="relative z-10">
                <div 
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl"
                  style={{
                    borderRadius: '1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <FiShield className="w-10 h-10 text-white" style={{ strokeWidth: '2.5' }} />
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 font-satoshi" style={{
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.15'
                }}>
                  Powered by Industry Veterans
                </h3>
                <p className="text-base md:text-lg text-blue-50 leading-relaxed font-santhosi" style={{
                  fontWeight: '400',
                  lineHeight: '1.75',
                  fontSize: '17px',
                  opacity: '0.95'
                }}>
                  Our experienced team brings decades of expertise in education and career counseling to help you succeed and thrive.
                </p>
              </div>
            </div>

            {/* Right Side - Achievements List */}
            <div className="md:w-3/5 p-10 md:p-12 bg-white">
              <div className="space-y-5">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-x-1 hover:border-blue-200 group/item"
                      style={{
                        borderRadius: '0.75rem',
                        animation: `slideInRight 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div 
                        className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mt-0.5 shadow-md transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-6"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" style={{ strokeWidth: '2.5' }} />
                      </div>
                      <span className="text-base md:text-lg text-gray-900 font-medium leading-relaxed flex-1 font-santhosi" style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a',
                        lineHeight: '1.6'
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
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-base transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            style={{
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
              fontWeight: '700'
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Discover Our Story</span>
            <svg 
              className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
};

export default LegacySection;


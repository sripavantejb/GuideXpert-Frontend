import { useState, useEffect, useRef } from 'react';
import { FiUser, FiStar, FiAward, FiCheckCircle, FiTrendingUp, FiShield } from 'react-icons/fi';
import Button from '../UI/Button';
import AnimatedElement from '../UI/AnimatedElement';

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
    <section className="py-20 md:py-28 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Overline Badge */}
          <AnimatedElement variant="fadeInUp" delay={0} duration={0.35}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-primary-blue-100 bg-primary-blue-50">
              <FiShield className="text-primary-blue-700 text-sm" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-blue-800 font-santhosi">
                Our Legacy
              </span>
            </div>
          </AnimatedElement>

          <AnimatedElement variant="slideUp" delay={0.1} duration={0.35}>
            <h2 className="mb-6">
              Built on a Legacy of Proven Success
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.2} duration={0.35}>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-santhosi" style={{
              fontWeight: '500',
              lineHeight: '1.7',
              color: '#475569'
            }}>
              GuideXpert has a strong track record of empowering students and counselors alike, with a legacy built on trust, innovation, and measurable excellence.
            </p>
          </AnimatedElement>
        </div>

        {/* Statistics Grid - Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" ref={statsRef}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedElement
                key={index}
                variant="fadeInUp"
                delay={0.3 + index * 0.1}
                duration={0.4}
                className="group relative bg-white rounded-xl p-10 text-center border border-gray-200 transition-all duration-300 hover:-translate-y-2"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
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
              </AnimatedElement>
            );
          })}
        </div>

        {/* Industry Veterans Card */}
        <AnimatedElement variant="fadeInUp" delay={0.6} duration={0.4}>
          <div 
            className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-white"
            style={{
              boxShadow: '0 6px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.05)'
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
                  className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mb-6"
                >
                  <FiAward className="w-8 h-8 text-white" style={{ strokeWidth: '2.5' }} aria-hidden />
                </div>
                <h3 className="font-satoshi heading-subsection text-white mb-4">
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
                    <AnimatedElement
                      key={index}
                      variant="fadeInUp"
                      delay={0.7 + index * 0.1}
                      duration={0.4}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:border-primary-blue-200 hover:shadow-md hover:bg-primary-blue-50/30"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary-blue-800 flex items-center justify-center mt-0.5">
                        <Icon className="w-5 h-5 text-white" style={{ strokeWidth: '2.5' }} aria-hidden />
                      </div>
                      <span className="text-base text-gray-900 font-medium leading-snug font-santhosi" style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#003366',
                        lineHeight: '1.5'
                      }}>
                        {achievement.text}
                      </span>
                    </AnimatedElement>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        </AnimatedElement>

        {/* CTA Button */}
        <AnimatedElement variant="fadeInUp" delay={1.1} duration={0.4}>
          <div className="text-center mt-16">
            <Button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue-800 hover:bg-primary-blue-900 text-white rounded-lg text-base font-bold transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Learn More</span>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default LegacySection;


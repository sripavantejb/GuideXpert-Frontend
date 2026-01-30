import { FiBook, FiTool, FiLayers, FiAward } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import AnimatedElement from '../UI/AnimatedElement';
import './CertificationSection.css';

const CertificationSection = () => {
  const benefits = [
    {
      icon: FiBook,
      title: 'Expert Training',
      description: 'Led by experienced industry professionals with proven track records in career counseling and student guidance.',
    },
    {
      icon: FiTool,
      title: 'Practical Skill-Based Learning',
      description: 'Hands-on training with real-world scenarios, case studies, and interactive sessions to build confidence.',
    },
    {
      icon: FiLayers,
      title: 'Comprehensive Curriculum',
      description: 'Covering career assessment, counseling techniques, college admissions, exam guidance, and student psychology.',
    },
    {
      icon: FiAward,
      title: 'Industry-Recognized Certification',
      description: 'Earn a professional certificate that establishes credibility with students and parents.',
    },
  ];

  return (
    <section className="certification-section py-16 md:py-24">
      <div className="certification-section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <AnimatedElement variant="slideUp" delay={0} duration={0.35}>
            <h2 className="mb-4">
              Become a Certified GuideXpert Counselor
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.1} duration={0.35}>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto" style={{
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#475569'
            }}>
              Our comprehensive certification program equips you with the knowledge and skills to excel as a professional career counselor.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <AnimatedElement
                  key={index}
                  variant="fadeInUp"
                  delay={0.2 + index * 0.1}
                  duration={0.4}
                  className="flex items-start space-x-4"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{
                    backgroundColor: '#003366'
                  }}>
                    <Icon className="w-5 h-5 text-white" aria-hidden />
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="text-lg font-semibold mb-1.5" style={{
                      fontWeight: '600',
                      color: '#003366'
                    }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {benefit.description}
                    </p>
                  </div>
                </AnimatedElement>
              );
            })}
          </div>

          {/* Right Side - Certificate Preview */}
          <AnimatedElement variant="scaleIn" delay={0.6} duration={0.4}>
            <div className="flex justify-center">
              <div className="rounded-lg shadow-xl p-0 max-w-lg w-full overflow-hidden relative" style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backgroundColor: '#fffbeb',
              }}>
              {/* Top decorative shapes - gold */}
              <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 md:h-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full -mr-8 sm:-mr-12 md:-mr-16 -mt-8 sm:-mt-12 md:-mt-16 opacity-50" style={{ backgroundColor: '#fef3c7' }}></div>
                <div className="absolute top-0 right-4 sm:right-6 md:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full -mr-8 sm:-mr-10 md:-mr-12 -mt-8 sm:-mt-10 md:-mt-12 opacity-60" style={{ backgroundColor: '#fde68a' }}></div>
                <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transform rotate-45" style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  backgroundColor: '#b45309',
                }}></div>
              </div>

              {/* Bottom decorative shapes - gold */}
              <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full -ml-8 sm:-ml-12 md:-ml-16 -mb-8 sm:-mb-12 md:-mb-16 opacity-50" style={{ backgroundColor: '#fef3c7' }}></div>
                <div className="absolute bottom-0 left-4 sm:left-6 md:left-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full -ml-8 sm:-ml-10 md:-ml-12 -mb-8 sm:-mb-10 md:-mb-12 opacity-60" style={{ backgroundColor: '#fde68a' }}></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transform rotate-45" style={{
                  clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                  backgroundColor: '#b45309',
                }}></div>
              </div>

              <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 text-center">
                {/* Company name */}
                <div className="flex items-center justify-start mb-4 sm:mb-6 md:mb-8">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transform rotate-45 mr-2 sm:mr-3" style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    backgroundColor: '#b45309',
                  }}></div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
                    GuideXpert
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="mb-3 sm:mb-4 relative pr-16 sm:pr-20 md:pr-24">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2 break-words" style={{
                    color: '#b45309',
                    fontWeight: '700',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    Certificate
                  </h3>
                  <div className="text-xs sm:text-sm uppercase tracking-widest text-gray-900 mb-4 sm:mb-6" style={{
                    letterSpacing: '0.15em'
                  }}>
                    Of Achievement
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-700 mb-4 sm:mb-6 md:mb-8">
                    This Certificate Is Presented To
                  </div>

                  {/* Best Award Badge - Responsive positioning - gold */}
                  <div className="absolute top-0 right-0 sm:right-2 md:right-4">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 sm:border-3 md:border-4 flex flex-col items-center justify-center bg-white" style={{
                        borderColor: '#d97706',
                      }}>
                        <div className="flex gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                        </div>
                        <div className="text-[8px] sm:text-[10px] md:text-xs font-bold mb-0.5 sm:mb-1 leading-tight" style={{ color: '#b45309' }}>BEST</div>
                        <div className="text-[8px] sm:text-[10px] md:text-xs font-bold leading-tight" style={{ color: '#b45309' }}>AWARD</div>
                        <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                          <FaStar className="w-1.5 h-1.5 sm:w-2 sm:h-2" style={{ color: '#b45309' }} />
                        </div>
                      </div>
                      {/* Ribbons - gold */}
                      <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full" style={{ backgroundColor: '#fcd34d' }}></div>
                        <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full absolute left-1 sm:left-2" style={{ backgroundColor: '#fcd34d' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 break-words" style={{
                    color: '#b45309',
                    fontWeight: '700'
                  }}>
                    TEJ 
                  </div>
                </div>

                {/* Description text */}
                <div className="text-[10px] sm:text-xs text-gray-700 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-4" style={{
                  lineHeight: '1.6'
                }}>
                  For successfully completing the Elite Counselor Certification Program and demonstrating excellence in career counseling and student guidance.
                </div>

                {/* Bottom section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="text-left w-full sm:w-auto">
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-1 break-words">
                      JANUARY 2ND 2025
                    </div>
                    <div className="w-20 sm:w-24 h-px bg-gray-900 mb-1"></div>
                    <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wider">
                      Date
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-1 break-words" style={{
                      fontFamily: 'cursive'
                    }}>
                      Signature
                    </div>
                    <div className="w-20 sm:w-24 h-px bg-gray-900 mb-1"></div>
                    <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wider">
                      Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default CertificationSection;


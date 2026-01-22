import { 
  FiMonitor, 
  FiTool, 
  FiHeadphones,
  FiUser,
  FiBook,
  FiStar
} from 'react-icons/fi';
import Button from '../UI/Button';

const TrainingSupportSection = () => {
  const supportTypes = [
    {
      icon: FiMonitor,
      title: 'Online Training',
      description: 'Comprehensive online training modules accessible anytime',
    },
    {
      icon: FiTool,
      title: 'Counselor Toolkit',
      description: 'Access to professional tools and resources',
    },
    {
      icon: FiHeadphones,
      title: 'Ongoing Support',
      description: 'Continuous support throughout your counseling journey',
    },
  ];

  const journeySteps = [
    { number: 1, icon: FiUser, title: 'Enroll', description: 'Sign up for the certification program' },
    { number: 2, icon: FiBook, title: 'Learn', description: 'Complete comprehensive training modules' },
    { number: 3, icon: FiStar, title: 'Achieve', description: 'Get certified and start counseling' },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Training & Support That Empowers You
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            We provide extensive training and ongoing support to ensure your success as a GuideXpert Counselor.
          </p>
        </div>

        {/* Support Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {supportTypes.map((support, index) => {
            const Icon = support.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-300"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="text-blue-600 text-5xl mb-6 flex justify-center" style={{
                  color: '#2563eb'
                }}>
                  <Icon />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center" style={{
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.3'
                }}>
                  {support.title}
                </h3>
                <p className="text-base text-gray-700 text-center leading-relaxed" style={{
                  fontWeight: '500',
                  color: '#475569',
                  lineHeight: '1.6'
                }}>
                  {support.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Training Journey */}
        <div className="py-16 md:py-20" style={{
          paddingTop: '64px',
          paddingBottom: '80px'
        }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{
            maxWidth: '1200px'
          }}>
            <h3 className="text-center mb-4" style={{
              fontSize: '36px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: '#0f172a',
              lineHeight: '1.1',
              fontFamily: 'inherit'
            }}>
              Complete Training Journey
            </h3>
            <p className="text-center mb-12 max-w-2xl mx-auto" style={{
              fontSize: '18px',
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#475569'
            }}>
              Follow a structured path to certification
            </p>
            
            {/* Stepper with connectors */}
            <div className="relative mb-10">
              {/* Connector line - positioned to be overlapped by icons */}
              <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5" style={{
                left: '12%',
                right: '12%',
                background: 'linear-gradient(to right, #2563eb, #3b82f6, #2563eb)'
              }}></div>
              
              <div className="grid grid-cols-3 gap-6 items-start relative">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="relative z-10">
                      <div className="text-center">
                        {/* Icon with integrated step number */}
                        <div className="relative inline-block mb-5">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto relative shadow-lg" style={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                          }}>
                            <Icon className="w-6 h-6 text-white" style={{
                              strokeWidth: '2.5'
                            }} />
                            {/* Step number badge */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
                            }}>
                              <span className="text-xs font-bold text-white" style={{
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>{step.number}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step title */}
                        <h4 className="mb-2" style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#0f172a',
                          letterSpacing: '-0.01em',
                          lineHeight: '1.3'
                        }}>
                          {step.title}
                        </h4>
                        
                        {/* Step description */}
                        <p className="leading-relaxed" style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#64748b',
                          lineHeight: '1.5'
                        }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="text-center" style={{
              marginTop: '40px'
            }}>
              <button className="px-10 py-4 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                fontSize: '16px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSupportSection;


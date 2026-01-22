import { FiUser, FiStar, FiAward, FiCheckCircle } from 'react-icons/fi';
import Button from '../UI/Button';

const LegacySection = () => {
  const stats = [
    { icon: FiUser, value: '1700+', label: 'Students Guided' },
    { icon: FiStar, value: '1000+', label: 'Success Stories' },
    { icon: FiAward, value: '100+', label: 'Certified Counselors' },
  ];

  const achievements = [
    "Trusted by leading educational institutions",
    "98% success rate in student placements",
    "Recognized for excellence in career counseling",
    "Comprehensive support and training programs"
  ];

  return (
    <section 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Built on a Legacy of Proven Success
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            GuideXpert has a strong track record of empowering students and counselors alike, with a legacy built on trust and excellence.
          </p>
        </div>

        {/* Statistics - Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div
                  className="bg-white rounded-2xl p-10 text-center border-2 border-gray-100 transition-all duration-300 hover:border-blue-300 hover:-translate-y-2"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    borderRadius: '1rem'
                  }}
                >
                  <div className="mb-6 flex justify-center">
                    <div 
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }}
                    >
                      <Icon className="w-10 h-10 text-white" style={{ strokeWidth: '2.5' }} />
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-3" style={{
                    fontWeight: '800',
                    letterSpacing: '-0.03em',
                    lineHeight: '1',
                    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide" style={{
                    fontWeight: '600',
                    color: '#64748b',
                    letterSpacing: '0.1em',
                    fontSize: '13px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Veterans Card */}
        <div 
          className="max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden border border-gray-200"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '1rem'
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Title and Description */}
            <div 
              className="md:w-2/5 p-8 md:p-10 flex flex-col justify-center"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
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
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  Powered by Industry Veterans
                </h3>
                <p className="text-base text-blue-50 leading-relaxed" style={{
                  fontWeight: '400',
                  lineHeight: '1.7',
                  fontSize: '16px'
                }}>
                  Our experienced team brings decades of expertise in education and career counseling to help you succeed.
                </p>
              </div>
            </div>

            {/* Right Side - Achievements */}
            <div className="md:w-3/5 p-8 md:p-10 bg-white">
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200"
                    style={{
                      borderRadius: '0.5rem'
                    }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                      <FiCheckCircle className="w-4 h-4 text-white" style={{ strokeWidth: '2.5' }} />
                    </div>
                    <span className="text-base text-gray-900 font-medium leading-snug" style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#0f172a',
                      lineHeight: '1.5'
                    }}>
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Button className="px-8 py-3">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;


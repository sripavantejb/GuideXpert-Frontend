import { FiCheck } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const CertificationSection = () => {
  const benefits = [
    'Expert Training',
    'Practical Skill-Based Learning',
    'Comprehensive Curriculum',
    'Industry-Recognized Certification',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Become a Certified GuideXpert Counselor
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            Our comprehensive certification program equips you with the knowledge and skills to excel as a professional career counselor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center" style={{
                  backgroundColor: '#2563eb'
                }}>
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900" style={{
                    fontWeight: '600',
                    color: '#0f172a'
                  }}>
                    {benefit}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Certificate Preview */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-xl p-0 max-w-lg w-full overflow-hidden relative" style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}>
              {/* Top decorative shapes */}
              <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="absolute top-0 right-8 w-24 h-24 bg-blue-300 rounded-full -mr-12 -mt-12 opacity-60"></div>
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-600 transform rotate-45" style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }}></div>
              </div>

              {/* Bottom decorative shapes */}
              <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-full -ml-16 -mb-16 opacity-50"></div>
                <div className="absolute bottom-0 left-8 w-24 h-24 bg-blue-300 rounded-full -ml-12 -mb-12 opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-600 transform rotate-45" style={{
                  clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)'
                }}></div>
              </div>

              <div className="relative p-10 text-center">
                {/* Company name */}
                <div className="flex items-center justify-start mb-8">
                  <div className="w-12 h-12 bg-blue-600 transform rotate-45 mr-3" style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }}></div>
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    GuideXpert
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="mb-4">
                  <h3 className="text-5xl font-bold mb-2" style={{
                    color: '#2563eb',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>
                    Certificate
                  </h3>
                  <div className="text-sm uppercase tracking-widest text-gray-900 mb-6" style={{
                    letterSpacing: '0.15em'
                  }}>
                    Of Achievement
                  </div>
                  <div className="text-xs uppercase tracking-wider text-gray-700 mb-8">
                    This Certificate Is Presented To
                  </div>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-8" style={{
                    color: '#2563eb',
                    fontWeight: '700'
                  }}>
                    Jane Doe
                  </div>
                </div>

                {/* Best Award Badge */}
                <div className="absolute top-24 right-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-white" style={{
                      borderColor: '#93c5fd'
                    }}>
                      <div className="flex gap-1 mb-1">
                        <FaStar className="w-2 h-2 text-blue-600" />
                        <FaStar className="w-2 h-2 text-blue-600" />
                        <FaStar className="w-2 h-2 text-blue-600" />
                      </div>
                      <div className="text-xs font-bold text-blue-600 mb-1">BEST</div>
                      <div className="text-xs font-bold text-blue-600">AWARD</div>
                      <div className="flex gap-1 mt-1">
                        <FaStar className="w-2 h-2 text-blue-600" />
                        <FaStar className="w-2 h-2 text-blue-600" />
                        <FaStar className="w-2 h-2 text-blue-600" />
                      </div>
                    </div>
                    {/* Ribbons */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-6 bg-blue-300 rounded-full"></div>
                      <div className="w-1 h-6 bg-blue-300 rounded-full absolute left-2"></div>
                    </div>
                  </div>
                </div>

                {/* Description text */}
                <div className="text-xs text-gray-700 mb-8 leading-relaxed px-4" style={{
                  fontSize: '11px',
                  lineHeight: '1.6'
                }}>
                  For successfully completing the Elite Counselor Certification Program and demonstrating excellence in career counseling and student guidance.
                </div>

                {/* Bottom section */}
                <div className="flex justify-between items-end mt-12 pt-6 border-t border-gray-200">
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900 mb-1">
                      JANUARY 2ND 2025
                    </div>
                    <div className="w-24 h-px bg-gray-900 mb-1"></div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">
                      Date
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 mb-1" style={{
                      fontFamily: 'cursive'
                    }}>
                      Signature
                    </div>
                    <div className="w-24 h-px bg-gray-900 mb-1"></div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider">
                      Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationSection;


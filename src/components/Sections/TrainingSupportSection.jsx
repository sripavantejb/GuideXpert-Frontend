import { 
  FaDesktop,
  FaWrench,
  FaHeadphones,
  FaUser,
  FaBook,
  FaStar
} from 'react-icons/fa';
import Button from '../UI/Button';

const TrainingSupportSection = () => {
  const supportTypes = [
    {
      icon: FaDesktop,
      title: 'Online Training',
      description: 'Comprehensive online training modules accessible anytime',
    },
    {
      icon: FaWrench,
      title: 'Counselor Toolkit',
      description: 'Access to professional tools and resources',
    },
    {
      icon: FaHeadphones,
      title: 'Ongoing Support',
      description: 'Continuous support throughout your counseling journey',
    },
  ];

  const journeySteps = [
    { number: 1, icon: FaUser, title: 'Enroll', description: 'Sign up for the certification program' },
    { number: 2, icon: FaBook, title: 'Learn', description: 'Complete comprehensive training modules' },
    { number: 3, icon: FaStar, title: 'Achieve', description: 'Get certified and start counseling' },
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Training & Support That Empowers You
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
            We provide extensive training and ongoing support to ensure your success as a GuideXpert Counselor.
          </p>
        </div>

        {/* Support Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {supportTypes.map((support, index) => {
            const Icon = support.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="bg-primary-blue-50/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-lg" style={{ color: '#003366' }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2.5">
                  {support.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {support.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Training Journey */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-14">
            Complete Training Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-center"
                  style={{
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-primary-blue-800 rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Step number indicator */}
                    <div className="flex justify-center">
                      <span className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3" style={{
                    fontWeight: '600',
                    color: '#003366'
                  }}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed" style={{
                    color: '#475569',
                    lineHeight: '1.6'
                  }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-4">
          <Button className="bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-8 py-3 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrainingSupportSection;

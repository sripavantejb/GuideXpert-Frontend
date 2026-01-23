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
                <div className="bg-blue-50/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-lg" style={{ color: '#1e3a8a' }} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-px bg-gray-200 -z-10"></div>
            
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center relative">
                  <div className="mb-5">
                    <div className="w-16 h-16 bg-primary-blue-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Subtle step number indicator */}
                    <div className="mt-2.5">
                      <span className="inline-block w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                      {step.number}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
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

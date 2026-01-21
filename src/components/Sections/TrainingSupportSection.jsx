import { 
  FiMonitor, 
  FiTool, 
  FiHeadphones,
  FiUser,
  FiBook,
  FiStar
} from 'react-icons/fi';
import Button from '../UI/Button';
import Card from '../UI/Card';

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
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Training & Support That Empowers You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide extensive training and ongoing support to ensure your success as a GuideXpert Counselor.
          </p>
        </div>

        {/* Support Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {supportTypes.map((support, index) => {
            const Icon = support.icon;
            return (
              <Card
                key={index}
                icon={Icon}
                title={support.title}
                description={support.description}
              />
            );
          })}
        </div>

        {/* Training Journey */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Complete Training Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-primary-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <Button>
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrainingSupportSection;


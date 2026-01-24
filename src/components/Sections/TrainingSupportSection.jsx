import { 
  FaDesktop,
  FaWrench,
  FaHeadphones,
  FaUser,
  FaBook,
  FaStar
} from 'react-icons/fa';
import Button from '../UI/Button';
import './TrainingSupportSection.css';

const TrainingSupportSection = () => {
  const supportTypes = [
    {
      icon: FaDesktop,
      title: 'Online Training',
      description: 'Comprehensive online training modules accessible anytime',
      accent: 'online',
    },
    {
      icon: FaWrench,
      title: 'Counselor Toolkit',
      description: 'Access to professional tools and resources',
      accent: 'toolkit',
    },
    {
      icon: FaHeadphones,
      title: 'Ongoing Support',
      description: 'Continuous support throughout your counseling journey',
      accent: 'support',
    },
  ];

  const journeySteps = [
    { number: 1, icon: FaUser, title: 'Enroll', description: 'Sign up for the certification program', accent: 'enroll' },
    { number: 2, icon: FaBook, title: 'Learn', description: 'Complete comprehensive training modules', accent: 'learn' },
    { number: 3, icon: FaStar, title: 'Achieve', description: 'Get certified and start counseling', accent: 'achieve' },
  ];

  return (
    <section className="training-support-section py-24 md:py-32">
      <div className="training-support-section-inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="mb-6">
            Training & Support That Empowers You
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
            We provide extensive training and ongoing support to ensure your success as a GuideXpert Counselor.
          </p>
        </div>

        {/* Support Types */}
        <div className="training-support-cards">
          {supportTypes.map((support, index) => {
            const Icon = support.icon;
            return (
              <div
                key={index}
                className={`training-support-card training-support-card-${support.accent}`}
              >
                <div className="training-support-card-icon">
                  <Icon aria-hidden />
                </div>
                <h3 className="training-support-card-title">{support.title}</h3>
                <p className="training-support-card-desc">{support.description}</p>
              </div>
            );
          })}
        </div>

        {/* Training Journey */}
        <div className="mb-20">
          <h3 className="heading-subsection text-center mb-14">
            Complete Training Journey
          </h3>
          <div className="training-journey-cards">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`training-journey-card training-journey-card-${step.accent}`}
                >
                  <div className="training-journey-card-icon">
                    <Icon aria-hidden />
                  </div>
                  <div className="training-journey-step">{step.number}</div>
                  <h4 className="training-journey-card-title">{step.title}</h4>
                  <p className="training-journey-card-desc">{step.description}</p>
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

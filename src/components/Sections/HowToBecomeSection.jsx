import { useState } from 'react';
import { 
  FiFileText, 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiAward, 
  FiMessageSquare 
} from 'react-icons/fi';
import Button from '../UI/Button';

const HowToBecomeSection = () => {
  const [openStep, setOpenStep] = useState(null);

  const steps = [
    {
      number: 1,
      icon: FiFileText,
      title: 'Apply Now',
      description: 'Fill out the application form with your details and experience.',
    },
    {
      number: 2,
      icon: FiSearch,
      title: 'Screening & Interview',
      description: 'We review your application and conduct an interview to assess your suitability.',
    },
    {
      number: 3,
      icon: FiCheckCircle,
      title: 'Agreement & Onboarding',
      description: 'Complete the onboarding process and sign the counselor agreement.',
    },
    {
      number: 4,
      icon: FiClock,
      title: '25-Hour Training',
      description: 'Complete our comprehensive 25-hour training program.',
    },
    {
      number: 5,
      icon: FiAward,
      title: 'Get Certified!',
      description: 'Receive your certification upon successful completion of training.',
    },
    {
      number: 6,
      icon: FiMessageSquare,
      title: 'Start Counseling!',
      description: 'Begin your journey as a certified GuideXpert Counselor.',
    },
  ];

  const toggleStep = (index) => {
    setOpenStep(openStep === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How to Become a GuideXpert Counselor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes it easy for you to join our network of certified counselors.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isOpen = openStep === index;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleStep(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                    <div className="text-primary-blue-600 text-xl">
                      <Icon />
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">
                      {step.title}
                    </span>
                  </div>
                  <span
                    className={`text-primary-blue-600 text-xl transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-fade-in">
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button>
            Create Your Profile
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowToBecomeSection;


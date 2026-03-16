import { FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import AnimatedElement from '../UI/AnimatedElement';

const ProblemStatementSection = () => {
  const statements = [
    {
      icon: FiBarChart2,
      value: '15 Lakhs',
      label: 'Career Counsellors are needed in India',
    },
    {
      icon: FiAlertCircle,
      value: '99%',
      label: "of schools in India don't have career counsellors",
    },
  ];

  return (
    <section id="problem-statement" className="py-16 md:py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <AnimatedElement variant="fadeInUp" delay={0} duration={0.35}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-primary-blue-100 bg-primary-blue-50">
              <FiAlertCircle className="text-primary-blue-700 text-sm" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-blue-800 font-santhosi">
                The Gap in India
              </span>
            </div>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.1} duration={0.35}>
            <h2 className="mb-4 text-2xl md:text-3xl font-bold text-gray-900">
              Why We Need More Career Counsellors
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.2} duration={0.35}>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              India faces a critical shortage of trained career counsellors. Here’s the scale of the opportunity.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {statements.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedElement
                key={index}
                variant="fadeInUp"
                delay={0.3 + index * 0.1}
                duration={0.4}
              >
                <div
                  className="rounded-xl p-8 bg-gray-50 border border-gray-200 text-center transition-all duration-300 hover:shadow-md hover:border-primary-blue-200/50"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.06)',
                  }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-blue-100 text-primary-blue-700 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary-blue-800 mb-2 font-santhosi">
                    {item.value}
                  </div>
                  <div className="text-base font-medium text-gray-700 leading-snug">
                    {item.label}
                  </div>
                </div>
              </AnimatedElement>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementSection;

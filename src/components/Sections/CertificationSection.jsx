import { FiCheck } from 'react-icons/fi';

const CertificationSection = () => {
  const benefits = [
    'Expert Training',
    'Practical Skill-Based Learning',
    'Comprehensive Curriculum',
    'Industry-Recognized Certification',
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Become a Certified GuideXpert Counselor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive certification program equips you with the knowledge and skills to excel as a professional career counselor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-blue-600 rounded-full flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {benefit}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Certificate Image */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-2xl p-8 border-4 border-amber-400 max-w-md">
              <div className="bg-white rounded-lg p-8 text-center border-2 border-amber-300">
                <div className="mb-4">
                  <div className="w-20 h-20 bg-amber-400 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">✓</span>
                  </div>
                </div>
                <div className="text-amber-600 font-bold text-lg mb-2">CERTIFIED</div>
                <div className="text-gray-800 font-semibold text-xl mb-1">GuideXpert Counselor</div>
                <div className="text-gray-600 text-sm mb-4">This certifies that</div>
                <div className="text-gray-900 font-bold text-lg mb-4">Jane Doe</div>
                <div className="text-gray-600 text-sm">has successfully completed the</div>
                <div className="text-gray-700 text-sm font-semibold">Elite Counselor Certification Program</div>
                <div className="mt-6 pt-4 border-t border-gray-300">
                  <div className="text-gray-600 text-xs">Date of Certification</div>
                  <div className="text-gray-800 font-semibold">January 2024</div>
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


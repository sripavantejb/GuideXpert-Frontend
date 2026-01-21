import { FiUser, FiStar, FiAward } from 'react-icons/fi';
import Button from '../UI/Button';

const LegacySection = () => {
  const stats = [
    { icon: FiUser, value: '1700+', label: 'Students Guided' },
    { icon: FiStar, value: '1000+', label: 'Success Stories' },
    { icon: FiAward, value: '100+', label: 'Certified Counselors' },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built on a Legacy of Proven Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GuideXpert has a strong track record of empowering students and counselors alike, with a legacy built on trust and excellence.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-8 text-center"
              >
                <div className="text-primary-blue-600 text-5xl mb-4 flex justify-center">
                  <Icon />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Powered By Card */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8 text-center border-2 border-primary-blue-200">
          <div className="w-20 h-20 bg-primary-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">Q</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Powered by Industry Veterans
          </h3>
          <p className="text-gray-600">
            Our experienced team brings decades of expertise in education and career counseling to help you succeed.
          </p>
        </div>

        <div className="text-center mt-12">
          <Button>
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;


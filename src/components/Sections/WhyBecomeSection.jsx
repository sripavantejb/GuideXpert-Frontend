import { 
  FiTrendingUp, 
  FiRefreshCw, 
  FiSearch,
  FiUser,
  FiDollarSign,
  FiMapPin
} from 'react-icons/fi';
import Button from '../UI/Button';
import Card from '../UI/Card';

const WhyBecomeSection = () => {
  const reasons = [
    {
      icon: FiTrendingUp,
      title: 'Help students achieve their career goals',
      description: 'Guide students towards successful career paths',
    },
    {
      icon: FiRefreshCw,
      title: 'Be the trusted advisor for students and parents',
      description: 'Build meaningful relationships and provide expert guidance',
    },
    {
      icon: FiSearch,
      title: "Contribute to GuideXpert's mission of empowering students",
      description: 'Be part of a movement that transforms lives',
    },
  ];

  const stats = [
    { icon: FiUser, value: '121+', label: 'Active Counselors' },
    { icon: FiDollarSign, value: '75L', label: 'Earning Potential' },
    { icon: FiMapPin, value: 'PAN-India', label: 'Presence' },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Become a GuideXpert Counselor?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With GuideXpert, you can make a real difference in students' lives while building a rewarding career for yourself.
          </p>
        </div>

        {/* Reasons Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card
                key={index}
                icon={Icon}
                title={reason.title}
                description={reason.description}
              />
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-blue-50 rounded-lg p-6 text-center"
              >
                <div className="text-primary-blue-600 text-4xl mb-4 flex justify-center">
                  <Icon />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="secondary">
            Join as a Counselor
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyBecomeSection;


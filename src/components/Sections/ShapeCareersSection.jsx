import { 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers,
  FiAward
} from 'react-icons/fi';
import Button from '../UI/Button';
import Card from '../UI/Card';

const ShapeCareersSection = () => {
  const features = [
    {
      icon: FiUser,
      title: 'Continuous Learning & Growth',
      description: 'Expand your knowledge and skills continuously',
    },
    {
      icon: FiCalendar,
      title: 'Flexible Work Hours',
      description: 'Work according to your schedule',
    },
    {
      icon: FiDollarSign,
      title: 'High Earning Potential',
      description: 'Build a financially rewarding career',
    },
    {
      icon: FiUsers,
      title: 'Strong Community & Support',
      description: 'Join a network of experienced counselors',
    },
  ];

  const earningTiers = [
    { level: 'Beginner Counselor', amount: '₹1,00,000', medal: 'bronze' },
    { level: 'Intermediate Counselor', amount: '₹5,00,000', medal: 'silver' },
    { level: 'Elite Counselor', amount: '₹10,00,000', medal: 'gold' },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shape Careers, Build Yours Too
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            As a GuideXpert Counselor, you'll not only guide students towards their dream careers but also build a fulfilling and financially rewarding career for yourself.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                icon={Icon}
                title={feature.title}
                description={feature.description}
              />
            );
          })}
        </div>

        {/* Earning Potential */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Earning Potential Snapshots
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earningTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-transparent hover:border-accent-yellow-400 transition-all"
              >
                <div className="mb-4">
                  <FiAward className={`w-12 h-12 mx-auto ${
                    tier.medal === 'gold' ? 'text-accent-yellow-500' :
                    tier.medal === 'silver' ? 'text-gray-400' :
                    'text-amber-600'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.amount}
                </div>
                <div className="text-gray-600">{tier.level}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button variant="secondary">
            Become a Counselor
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShapeCareersSection;


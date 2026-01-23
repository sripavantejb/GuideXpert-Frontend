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
    <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Shape Careers, Build Yours Too
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            As a GuideXpert Counselor, you'll not only guide students towards their dream careers but also build a fulfilling and financially rewarding career for yourself.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
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
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Earning Potential Snapshots
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {earningTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 text-center border border-blue-100 transition-all duration-300 hover:shadow-lg"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="mb-6">
                  <FiAward className={`w-16 h-16 mx-auto ${
                    tier.medal === 'gold' ? 'text-yellow-500' :
                    tier.medal === 'silver' ? 'text-gray-400' :
                    'text-amber-600'
                  }`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}>
                  {tier.amount}
                </div>
                <div className="text-base font-semibold text-gray-600 uppercase tracking-wider" style={{
                  fontWeight: '600',
                  letterSpacing: '0.05em'
                }}>
                  {tier.level}
                </div>
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


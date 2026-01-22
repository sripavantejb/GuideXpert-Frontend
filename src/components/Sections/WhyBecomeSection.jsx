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
import ScrollStack, { ScrollStackItem } from '../UI/ScrollStack';

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

        {/* Reasons Cards - Scroll Stack Animation */}
        <div style={{ minHeight: '200vh', position: 'relative', marginBottom: '1.5rem' }}>
          <ScrollStack
            itemDistance={150}
            itemScale={0.05}
            itemStackDistance={0}
            stackPosition="50%"
            scaleEndPosition="10%"
            baseScale={0.90}
            rotationAmount={0}
            blurAmount={0}
            useWindowScroll={true}
          >
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <ScrollStackItem key={index}>
                  <Card
                    icon={Icon}
                    title={reason.title}
                    description={reason.description}
                  />
                </ScrollStackItem>
              );
            })}
          </ScrollStack>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ marginTop: '-170px' }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 text-center border border-blue-100 transition-all duration-300 hover:shadow-lg"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="text-blue-600 text-5xl mb-5 flex justify-center">
                  <Icon />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3" style={{
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}>
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-gray-600 uppercase tracking-wider" style={{
                  fontWeight: '600',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </div>
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


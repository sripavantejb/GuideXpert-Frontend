import { 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers,
  FiAward
} from 'react-icons/fi';
import Button from '../UI/Button';
import AnimatedElement from '../UI/AnimatedElement';
import './ShapeCareersSection.css';

const ShapeCareersSection = () => {
  const features = [
    {
      icon: FiUser,
      title: 'Continuous Learning & Growth',
      description: 'Expand your knowledge and skills continuously',
      accent: 'learning',
    },
    {
      icon: FiCalendar,
      title: 'Flexible Work Hours',
      description: 'Work according to your schedule',
      accent: 'flexible',
    },
    {
      icon: FiDollarSign,
      title: 'High Earning Potential',
      description: 'Build a financially rewarding career',
      accent: 'earning',
    },
    {
      icon: FiUsers,
      title: 'Strong Community & Support',
      description: 'Join a network of experienced counselors',
      accent: 'community',
    },
  ];

  const earningTiers = [
    { level: 'Beginner Counselor', amount: '₹2,00,000', medal: 'bronze' },
    { level: 'Intermediate Counselor', amount: '₹4,00,000', medal: 'silver' },
    { level: 'Elite Counselor', amount: '₹6,00,000', medal: 'gold' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <AnimatedElement variant="slideUp" delay={0} duration={0.35}>
            <h2 className="mb-6">
              Shape Careers, Build Yours Too
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.1} duration={0.35}>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto" style={{
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#475569'
            }}>
              As a GuideXpert Counselor, you'll not only guide students towards their dream careers but also build a fulfilling and financially rewarding career for yourself.
            </p>
          </AnimatedElement>
        </div>

        {/* Features Grid */}
        <div className="shape-careers-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedElement
                key={index}
                variant="fadeInUp"
                delay={index * 0.1}
                duration={0.4}
                className={`shape-careers-card shape-careers-card-${feature.accent}`}
              >
                <div className="shape-careers-card-icon">
                  <Icon aria-hidden />
                </div>
                <h3 className="shape-careers-card-title">{feature.title}</h3>
                <p className="shape-careers-card-desc">{feature.description}</p>
              </AnimatedElement>
            );
          })}
        </div>

        {/* Earning Potential */}
        <div className="mb-10">
          <AnimatedElement variant="slideUp" delay={0.4} duration={0.35}>
            <h3 className="heading-subsection text-center mb-12">
              Earning Potential Snapshots
            </h3>
          </AnimatedElement>
          <div className="shape-careers-earning-grid">
            {earningTiers.map((tier, index) => (
              <AnimatedElement
                key={index}
                variant="fadeInUp"
                delay={0.5 + index * 0.1}
                duration={0.4}
                className={`shape-careers-earning-card shape-careers-earning-card-${tier.medal}`}
              >
                <div className="shape-careers-earning-icon">
                  <FiAward aria-hidden />
                </div>
                <div className="shape-careers-earning-amount">{tier.amount}</div>
                <div className="shape-careers-earning-level">{tier.level}</div>
              </AnimatedElement>
            ))}
          </div>
        </div>

        <AnimatedElement variant="fadeInUp" delay={0.8} duration={0.4}>
          <div className="text-center">
            <Button variant="secondary">
              Become a Counselor
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default ShapeCareersSection;


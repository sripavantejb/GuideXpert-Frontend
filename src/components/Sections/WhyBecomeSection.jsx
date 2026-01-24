import { 
  FiTrendingUp, 
  FiRefreshCw, 
  FiSearch,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiArrowRight
} from 'react-icons/fi';
import { useApplyModal } from '../../contexts/useApplyModal';

const WhyBecomeSection = () => {
  const { openApplyModal } = useApplyModal();
  const reasons = [
    {
      icon: FiTrendingUp,
      title: 'Help students achieve their career goals',
      description: 'Guide students towards successful career paths with personalized counseling and expert insights.',
    },
    {
      icon: FiRefreshCw,
      title: 'Be the trusted advisor for students and parents',
      description: 'Build meaningful relationships and provide expert guidance that shapes futures.',
    },
    {
      icon: FiSearch,
      title: "Contribute to GuideXpert's mission of empowering students",
      description: 'Be part of a movement that transforms lives and creates lasting impact.',
    },
  ];

  const stats = [
    { icon: FiUser, value: '121+', label: 'Active Counselors' },
    { icon: FiDollarSign, value: '₹75L', label: 'Earning Potential' },
    { icon: FiMapPin, value: 'PAN-India', label: 'Presence' },
  ];

  return (
    <section id="why" className="py-20 md:py-28 relative overflow-hidden bg-gray-50">
      {/* Subtle ambient accent - Top Left */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          top: '2%', left: '2%', width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(0, 51, 102, 0.06) 0%, transparent 65%)',
          opacity: 0.9,
        }}
      />
      {/* Subtle ambient accent - Bottom Right */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          bottom: '2%', right: '2%', width: '260px', height: '260px',
          background: 'radial-gradient(circle, rgba(0, 51, 102, 0.05) 0%, transparent 65%)',
          opacity: 0.9,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-primary-blue-100 bg-primary-blue-50">
            <FiTrendingUp className="text-primary-blue-700 text-sm" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-blue-800 font-santhosi">
              Why Join Us
            </span>
          </div>
          
          <h2 className="mb-6">
            Why Become a <strong className="font-extrabold">GuideXpert</strong> Counselor?
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-santhosi" style={{
            fontWeight: '500',
            lineHeight: '1.7',
            color: '#475569'
          }}>
            With GuideXpert, you can make a real difference in students' lives while building a rewarding career for yourself.
          </p>
        </div>

        {/* Benefit cards - unified navy accent */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group relative"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.12}s both` }}
              >
                <div
                  className="relative h-full rounded-xl p-8 bg-white border border-gray-100 transition-all duration-300 group-hover:-translate-y-1 overflow-hidden"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,51,102,0.08), 0 4px 12px rgba(15,23,42,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(0,51,102,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.06)';
                    e.currentTarget.style.borderColor = '#f3f4f6';
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div
                        className="inline-flex items-center justify-center rounded-xl bg-primary-blue-50 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          width: '56px',
                          height: '56px',
                          boxShadow: '0 2px 8px rgba(0,51,102,0.08)',
                        }}
                      >
                        <Icon
                          size={24}
                          strokeWidth={2}
                          style={{ color: '#003366', flexShrink: 0 }}
                          aria-hidden
                        />
                      </div>
                    </div>
                    <h3 className="mb-3 leading-tight">
                      {reason.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed font-santhosi"
                      style={{ color: '#475569', fontWeight: '500', lineHeight: '1.7' }}
                    >
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics - unified navy accent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-10 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.06)',
                  animation: `fadeInUp 0.6s ease-out ${(index + 3) * 0.12}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,51,102,0.08), 0 4px 12px rgba(15,23,42,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(0,51,102,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.06)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                <div className="mb-5 flex justify-center">
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-105" style={{ color: '#003366' }}>
                    <Icon />
                  </div>
                </div>
                <div
                  className="text-3xl md:text-4xl font-bold mb-3 font-santhosi"
                  style={{ fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.1', color: '#003366' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm font-semibold uppercase tracking-wider font-santhosi"
                  style={{ fontWeight: '600', color: '#64748b', letterSpacing: '0.05em' }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={openApplyModal}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue-800 hover:bg-primary-blue-900 text-white rounded-md text-base font-bold transition-all duration-200 font-santhosi"
            style={{
              boxShadow: '0 4px 14px rgba(0,51,102,0.25), 0 2px 6px rgba(0,0,0,0.08)',
              fontWeight: '700',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 6px 20px rgba(0,51,102,0.3), 0 3px 8px rgba(0,0,0,0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 14px rgba(0,51,102,0.25), 0 2px 6px rgba(0,0,0,0.08)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>Join as a Counselor</span>
            <FiArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default WhyBecomeSection;


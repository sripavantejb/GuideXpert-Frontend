import { 
  FiTrendingUp, 
  FiRefreshCw, 
  FiSearch,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiArrowRight
} from 'react-icons/fi';

const WhyBecomeSection = () => {
  const reasons = [
    {
      icon: FiTrendingUp,
      title: 'Help students achieve their career goals',
      description: 'Guide students towards successful career paths with personalized counseling and expert insights.',
      iconBg: 'bg-blue-50',
      customColor: '#1e3a8a',
      bgGradient: 'linear-gradient(135deg, rgba(176, 224, 230, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)',
    },
    {
      icon: FiRefreshCw,
      title: 'Be the trusted advisor for students and parents',
      description: 'Build meaningful relationships and provide expert guidance that shapes futures.',
      iconBg: 'bg-pink-50',
      customColor: '#d97706',
      bgGradient: 'linear-gradient(135deg, rgba(255, 182, 193, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)',
    },
    {
      icon: FiSearch,
      title: "Contribute to GuideXpert's mission of empowering students",
      description: 'Be part of a movement that transforms lives and creates lasting impact.',
      iconBg: 'bg-green-50',
      customColor: '#15803d',
      bgGradient: 'linear-gradient(135deg, rgba(221, 160, 221, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%)',
    },
  ];

  const stats = [
    { 
      icon: FiUser, 
      value: '121+', 
      label: 'Active Counselors',
      customColor: '#1e3a8a',
    },
    { 
      icon: FiDollarSign, 
      value: '₹75L', 
      label: 'Earning Potential',
      customColor: '#d97706',
    },
    { 
      icon: FiMapPin, 
      value: 'PAN-India', 
      label: 'Presence',
      customColor: '#15803d',
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #ffffff 0%, rgba(248, 250, 252, 0.5) 50%, #ffffff 100%)'
    }}>
      {/* Pastel Pink Sphere - Top Left */}
      <div 
        className="absolute rounded-full opacity-40 blur-3xl"
        style={{
          top: '5%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, rgba(255, 192, 203, 0.3) 35%, rgba(255, 192, 203, 0.15) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Pastel Blue/Purple Sphere - Bottom Right */}
      <div 
        className="absolute rounded-full opacity-40 blur-3xl"
        style={{
          bottom: '5%',
          right: '5%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(176, 224, 230, 0.4) 0%, rgba(221, 160, 221, 0.3) 40%, rgba(176, 224, 230, 0.15) 65%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-blue-100 bg-blue-50">
            <FiTrendingUp className="text-primary-blue-700 text-sm" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-blue-800 font-santhosi">
              Why Join Us
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-satoshi" style={{
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Why Become a GuideXpert Counselor?
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-santhosi" style={{
            fontWeight: '500',
            lineHeight: '1.7',
            color: '#475569'
          }}>
            With GuideXpert, you can make a real difference in students' lives while building a rewarding career for yourself.
          </p>
        </div>

        {/* Liquid Glass Cards - Properly Aligned Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                {/* Subtle Glow Effect on Hover */}
                <div 
                  className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                  style={{
                    background: `${reason.customColor}20`
                  }}
                />
                
                {/* Liquid Glass Card */}
                <div
                  className="relative h-full rounded-xl p-8 border border-gray-200 transition-all duration-300 group-hover:-translate-y-2 overflow-hidden"
                  style={{
                    background: reason.bgGradient,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 40px ${reason.customColor}20, 0 8px 16px ${reason.customColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)';
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="mb-6">
                      <div 
                        className={`inline-flex w-18 h-18 rounded-xl ${reason.iconBg} items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        style={{
                          width: '72px',
                          height: '72px',
                          boxShadow: `0 4px 12px ${reason.customColor}15, 0 2px 4px ${reason.customColor}10`,
                        }}
                      >
                        <Icon 
                          className="text-2xl transition-all duration-300" 
                          style={{ color: reason.customColor }}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-lg font-bold mb-3 leading-tight font-santhosi transition-colors duration-300"
                      style={{
                        fontWeight: '700',
                        color: '#0f172a'
                      }}
                    >
                      {reason.title}
                    </h3>

                    {/* Description */}
                    <p 
                      className="text-sm leading-relaxed font-santhosi transition-colors duration-300"
                      style={{
                        fontWeight: '500',
                        color: '#475569',
                        lineHeight: '1.7'
                      }}
                    >
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics - Theme Matching Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-10 text-center border border-gray-200 transition-all duration-300 hover:-translate-y-2"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  animation: `fadeInUp 0.6s ease-out ${(index + 3) * 0.15}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 24px ${stat.customColor}20, 0 4px 8px ${stat.customColor}10`;
                  e.currentTarget.style.borderColor = `${stat.customColor}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <div 
                    className="text-5xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: stat.customColor }}
                  >
                    <Icon />
                  </div>
                </div>

                {/* Value */}
                <div 
                  className="text-4xl md:text-5xl font-bold mb-3 font-santhosi"
                  style={{
                    fontWeight: '700',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1',
                    color: '#0f172a'
                  }}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <div 
                  className="text-base font-semibold uppercase tracking-wider font-santhosi"
                  style={{
                    fontWeight: '600',
                    color: '#64748b',
                    letterSpacing: '0.05em'
                  }}
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue-800 hover:bg-primary-blue-900 text-white rounded-md text-base font-bold transition-all duration-200 font-santhosi"
            style={{
              boxShadow: '0 4px 14px rgba(30, 64, 175, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
              fontWeight: '700',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.5), 0 3px 8px rgba(0, 0, 0, 0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 14px rgba(30, 64, 175, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)';
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


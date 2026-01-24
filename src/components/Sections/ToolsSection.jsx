import { 
  FiMonitor, 
  FiVolume2, 
  FiBarChart2,
  FiLayout,
  FiUsers,
  FiFileText,
  FiSettings,
  FiBook,
  FiCalendar,
  FiLayers
} from 'react-icons/fi';
import Button from '../UI/Button';
import './ToolsSection.css';

const ToolsSection = () => {
  const tools = [
    {
      icon: FiMonitor,
      title: 'Comprehensive Counselor Tools',
      description: 'All-in-one platform for managing your counseling practice',
    },
    {
      icon: FiVolume2,
      title: 'Marketing Support',
      description: 'Get help reaching more students',
    },
    {
      icon: FiBarChart2,
      title: 'Performance Dashboard',
      description: 'Track your progress and impact',
    },
  ];

  const reviews = [
    {
      text: "GuideXpert transformed my counseling practice. The tools are intuitive and comprehensive.",
      author: "Sarah Johnson",
      role: "Certified Counselor"
    },
    {
      text: "The dashboard helps me track student progress effectively. Highly recommended!",
      author: "Michael Chen",
      role: "Education Consultant"
    },
    {
      text: "Best platform for managing multiple students. The resources are invaluable.",
      author: "Emily Rodriguez",
      role: "Career Counselor"
    },
    {
      text: "The marketing support helped me reach 3x more students in just 2 months.",
      author: "David Thompson",
      role: "Independent Counselor"
    },
    {
      text: "Professional tools that make counseling efficient and impactful.",
      author: "Lisa Anderson",
      role: "Student Advisor"
    },
    {
      text: "The performance dashboard gives me insights I never had before.",
      author: "James Wilson",
      role: "Academic Counselor"
    },
    {
      text: "Easy to use, powerful features. GuideXpert is a game-changer.",
      author: "Maria Garcia",
      role: "Certified GuideXpert"
    },
    {
      text: "The comprehensive toolkit streamlined my entire counseling workflow.",
      author: "Robert Brown",
      role: "Education Specialist"
    },
    {
      text: "Outstanding support and professional tools. Exceeded my expectations.",
      author: "Jennifer Lee",
      role: "Career Development Counselor"
    },
    {
      text: "The training modules are comprehensive and easy to follow.",
      author: "Thomas Martinez",
      role: "Career Advisor"
    },
    {
      text: "I've seen a significant improvement in my student engagement rates.",
      author: "Patricia White",
      role: "Academic Advisor"
    },
    {
      text: "The support team is responsive and always ready to help.",
      author: "Christopher Davis",
      role: "Education Counselor"
    }
  ];

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  const navItems = [
    { icon: FiLayout, label: 'Dashboard', active: false },
    { icon: FiUsers, label: 'Students', active: true },
    { icon: FiFileText, label: 'Assessments', active: false },
    { icon: FiBarChart2, label: 'Reports', active: false },
    { icon: FiBook, label: 'Resources', active: false },
    { icon: FiSettings, label: 'Settings', active: false },
  ];

  const dashboardTools = [
    { icon: FiUsers, title: 'Student Management', color: 'bg-blue-50' },
    { icon: FiFileText, title: 'Assessment Tools', color: 'bg-green-50' },
    { icon: FiCalendar, title: 'Session Scheduler', color: 'bg-purple-50' },
    { icon: FiLayers, title: 'Resource Library', color: 'bg-amber-50' },
  ];

  return (
    <section id="predictor" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Tools to Help You Succeed
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            GuideXpert provides you with a suite of professional tools and resources to streamline your counseling process.
          </p>
        </div>

        {/* Dashboard Portal Mockup */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
            <div className="flex flex-col md:flex-row md:min-h-[500px]">
              {/* Sidebar - Vibrant Blue */}
              <div className="w-full md:w-64 p-4 md:p-6 rounded-t-lg md:rounded-tl-lg md:rounded-tr-none md:rounded-bl-lg md:rounded-br-none" style={{
                background: 'linear-gradient(180deg, #2563eb 0%, #1e40af 100%)'
              }}>
                <div className="mb-6 md:mb-8">
                  <h3 className="text-white text-lg md:text-xl font-bold" style={{
                    fontWeight: '700'
                  }}>
                    GuideXpert
                  </h3>
                </div>
                <div className="space-y-2 grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0 md:space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          item.active 
                            ? 'bg-blue-400 bg-opacity-30 text-white' 
                            : 'text-blue-100 hover:bg-blue-400 hover:bg-opacity-20'
                        }`}
                      >
                        <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-gray-50 p-4 md:p-8">
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2" style={{
                    fontWeight: '700',
                    color: '#0f172a'
                  }}>
                    Professional Tools Portal
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600" style={{
                    color: '#64748b'
                  }}>
                    Manage your counseling practice efficiently
                  </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {dashboardTools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={index}
                        className={`${tool.color} p-4 md:p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg`}
                        style={{
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm md:text-base font-semibold text-gray-900 break-words" style={{
                              fontWeight: '600',
                              color: '#0f172a'
                            }}>
                              {tool.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-300 hover:shadow-lg"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="text-blue-600 text-5xl mb-6 flex justify-center" style={{
                  color: '#2563eb'
                }}>
                  <Icon />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center" style={{
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.3'
                }}>
                  {tool.title}
                </h3>
                <p className="text-base text-gray-700 text-center leading-relaxed" style={{
                  fontWeight: '500',
                  color: '#475569',
                  lineHeight: '1.6'
                }}>
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reviews Scrolling Rows */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: '#0f172a',
              lineHeight: '1.2'
            }}>
              What Counselors Say
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{
              fontWeight: '500',
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              Real feedback from certified GuideXpert counselors
            </p>
          </div>
          
          <div className="reviews-scroll-container">
            {/* Row 1: Left to Right */}
            <div className="reviews-scroll-row scroll-left">
              {duplicatedReviews.map((review, index) => (
                <div key={`row1-${index}`} className="review-card">
                  <p className="text-white text-sm leading-relaxed mb-4" style={{
                    color: '#ffffff',
                    fontWeight: '400',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    "{review.text}"
                  </p>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-white text-sm font-semibold mb-1" style={{
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {review.author}
                    </p>
                    <p className="text-gray-400 text-xs" style={{
                      color: '#9ca3af',
                      fontWeight: '400',
                      fontSize: '12px'
                    }}>
                      {review.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Right to Left */}
            <div className="reviews-scroll-row scroll-right">
              {duplicatedReviews.map((review, index) => (
                <div key={`row2-${index}`} className="review-card">
                  <p className="text-white text-sm leading-relaxed mb-4" style={{
                    color: '#ffffff',
                    fontWeight: '400',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    "{review.text}"
                  </p>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-white text-sm font-semibold mb-1" style={{
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {review.author}
                    </p>
                    <p className="text-gray-400 text-xs" style={{
                      color: '#9ca3af',
                      fontWeight: '400',
                      fontSize: '12px'
                    }}>
                      {review.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3: Left to Right */}
            <div className="reviews-scroll-row scroll-left">
              {duplicatedReviews.map((review, index) => (
                <div key={`row3-${index}`} className="review-card">
                  <p className="text-white text-sm leading-relaxed mb-4" style={{
                    color: '#ffffff',
                    fontWeight: '400',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    "{review.text}"
                  </p>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-white text-sm font-semibold mb-1" style={{
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {review.author}
                    </p>
                    <p className="text-gray-400 text-xs" style={{
                      color: '#9ca3af',
                      fontWeight: '400',
                      fontSize: '12px'
                    }}>
                      {review.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="secondary">
            Explore Tools
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;


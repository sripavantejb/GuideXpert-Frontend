import { 
  FiMonitor, 
  FiVolume2, 
  FiBarChart2,
  FiUser,
  FiStar
} from 'react-icons/fi';
import Button from '../UI/Button';
import Card from '../UI/Card';

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

  const stats = [
    { icon: FiUser, value: '1000+', label: 'Students Guided' },
    { icon: FiStar, value: '500+', label: 'Success Stories' },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tools to Help You Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GuideXpert provides you with a suite of professional tools and resources to streamline your counseling process.
          </p>
        </div>

        {/* Portal Mockup */}
        <div className="mb-12 bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-1/4 bg-gray-100 p-4">
                <div className="space-y-4">
                  {['Dashboard', 'Students', 'Assessments', 'Reports', 'Resources', 'Settings'].map((item) => (
                    <div key={item} className="p-2 hover:bg-gray-200 rounded cursor-pointer text-sm text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Professional Tools Portal</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '📄', title: 'Student Management' },
                    { icon: '📊', title: 'Assessment Tools' },
                    { icon: '📅', title: 'Session Scheduler' },
                    { icon: '💡', title: 'Resource Library' },
                  ].map((tool, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl mb-2">{tool.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{tool.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card
                key={index}
                icon={Icon}
                title={tool.title}
                description={tool.description}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-primary-blue-600 text-white rounded-lg p-6 text-center"
              >
                <div className="text-4xl mb-4 flex justify-center">
                  <Icon />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            );
          })}
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


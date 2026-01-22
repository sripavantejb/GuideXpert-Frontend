import { useState } from 'react';
import { 
  FaRocket,
  FaDollarSign,
  FaHome,
  FaUsers,
  FaPhone,
  FaGraduationCap,
  FaPaperPlane
} from 'react-icons/fa';
import Button from '../UI/Button';

const HeroSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetOTP = (e) => {
    e.preventDefault();
    console.log('Get OTP:', formData);
    // Handle OTP logic here
  };

  const metrics = [
    { value: '12L+', label: 'Students Annually' },
    { value: '₹9L', label: 'Earning Potential' },
    { value: 'PAN-India', label: 'Opportunities', isGreen: true },
  ];

  const features = [
    {
      icon: FaDollarSign,
      title: 'Earnings Potential',
      description: '₹9 Lakhs/year potential',
      iconBg: 'bg-yellow-50',
      customColor: '#d97706',
    },
    {
      icon: FaGraduationCap,
      title: 'Certified Training',
      description: 'Become a trusted, certified counselor',
      iconBg: 'bg-blue-50',
      customColor: '#1e3a8a',
    },
    {
      icon: FaHome,
      title: 'Work from Anywhere',
      description: 'Flexible, work-from-home model',
      iconBg: 'bg-green-50',
      customColor: '#15803d',
    },
    {
      icon: FaUsers,
      title: 'Expert Support',
      description: "Backed by GuideXpert's central team",
      iconBg: 'bg-blue-50',
      customColor: '#1e3a8a',
    },
  ];

  return (
    <section id="home" className="bg-gray-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Side - Content */}
          <div className="space-y-10">
            {/* Join the Movement */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <FaRocket className="text-primary-blue-700 text-sm" />
              <span className="text-xs font-semibold text-primary-blue-800 uppercase tracking-wide">Join the Movement</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: '#0f172a' }}>
                Become a Certified Elite Counselor
              </h1>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                Work from home. Guide students with confidence. Earn income while transforming lives.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div 
                    className={`text-2xl md:text-3xl font-bold ${metric.isGreen ? 'text-green-700' : ''}`} 
                    style={!metric.isGreen ? { color: '#0f172a' } : {}}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-2 font-medium">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:sticky lg:top-24 flex justify-end">
            <div className="w-full max-w-md bg-gradient-to-br from-white via-blue-50/30 to-blue-50/50 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200/50">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 of 3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary-blue-700 h-1.5 rounded-full transition-all duration-300" style={{ width: '33.33%' }}></div>
                </div>
                <p className="text-xs font-medium text-gray-600 mt-2.5">Contact Info</p>
              </div>

              {/* Form Title */}
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaPaperPlane className="text-primary-blue-700 text-sm" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Apply Now</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">Start your journey as a certified counselor.</p>

              {/* Form */}
              <form onSubmit={handleGetOTP} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-colors duration-200 bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-colors duration-200 bg-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-colors duration-200 bg-white"
                    placeholder="9876543210"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2 shadow-sm"
                >
                  <FaPhone className="text-sm" />
                  <span>Get OTP</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors duration-300"
              >
                <div className={`${feature.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Icon 
                    className="text-xl" 
                    style={{ color: feature.customColor }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base leading-tight">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


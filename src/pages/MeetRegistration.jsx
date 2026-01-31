import { useState, useEffect } from 'react';
import { registerMeet, markUserJoined } from '../utils/meetApi';
import Button from '../components/UI/Button';
import { IoCheckmarkCircle } from 'react-icons/io5';

const MeetRegistration = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Countdown for redirect
  useEffect(() => {
    if (step === 2 && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 2 && redirectCountdown === 0 && meetLink) {
      markUserJoined(formData.mobile).finally(() => {
        window.location.href = meetLink;
      });
    }
  }, [step, redirectCountdown, meetLink, formData.mobile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      setLoading(false);
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    const result = await registerMeet({
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
    });

    if (result.success) {
      setMeetLink(result.data?.data?.meetLink || '');
      setStep(2);
      setRedirectCountdown(3);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue-600 mb-2">GuideXpert</h1>
          <p className="text-gray-600">Join Google Meet Session</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-primary-blue-600 mb-2">Register for Meet</h2>
              <p className="text-gray-600 mb-6">Enter your details to join the session</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Mobile Field */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 outline-none transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Join Meet'}
                </Button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn text-center">
              <div className="mb-6">
                <IoCheckmarkCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-primary-blue-600 mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-600">
                  You will be redirected to Google Meet in <strong>{redirectCountdown}</strong> seconds...
                </p>
              </div>

              <div className="bg-primary-blue-50 border border-primary-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-blue-800 mb-2">
                  <strong>Name:</strong> {formData.name}
                </p>
                <p className="text-sm text-primary-blue-800">
                  <strong>Email:</strong> {formData.email}
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full py-3 text-lg font-semibold"
                onClick={() => {
                  markUserJoined(formData.mobile).finally(() => {
                    window.location.href = meetLink;
                  });
                }}
              >
                Join Now
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By joining, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default MeetRegistration;

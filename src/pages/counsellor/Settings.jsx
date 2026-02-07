import { FiUser, FiMail, FiPhone, FiBell, FiShield, FiSave } from 'react-icons/fi';

export default function CounsellorSettings() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiUser className="w-4 h-4" /> Profile Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Dr. Counsellor"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                defaultValue="Career & Education Counseling"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiMail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                defaultValue="counsellor@guidexpert.com"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiPhone className="w-3.5 h-3.5" /> Phone
              </label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiBell className="w-4 h-4" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Email notifications for new student inquiries', defaultChecked: true },
            { label: 'SMS alerts for upcoming sessions', defaultChecked: true },
            { label: 'Weekly performance report email', defaultChecked: false },
            { label: 'Marketing campaign updates', defaultChecked: true },
          ].map((n) => (
            <label key={n.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={n.defaultChecked}
                className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiShield className="w-4 h-4" /> Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors">
          <FiSave className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}

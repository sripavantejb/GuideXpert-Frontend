import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiBell, FiShield, FiSave } from 'react-icons/fi';
import { useCounsellorProfile } from '../../contexts/CounsellorProfileContext';

const NOTIFICATION_OPTIONS = [
  { key: 'notifyInquiries', label: 'Email notifications for new student inquiries' },
  { key: 'notifySessions', label: 'SMS alerts for upcoming sessions' },
  { key: 'notifyWeeklyReport', label: 'Weekly performance report email' },
  { key: 'notifyMarketing', label: 'Marketing campaign updates' },
];

export default function CounsellorSettings() {
  const { profile, setProfile } = useCounsellorProfile();
  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [specialization, setSpecialization] = useState(profile.specialization ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [notifyInquiries, setNotifyInquiries] = useState(profile.notifyInquiries ?? true);
  const [notifySessions, setNotifySessions] = useState(profile.notifySessions ?? true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(profile.notifyWeeklyReport ?? false);
  const [notifyMarketing, setNotifyMarketing] = useState(profile.notifyMarketing ?? true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName ?? '');
    setSpecialization(profile.specialization ?? '');
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');
    setNotifyInquiries(profile.notifyInquiries ?? true);
    setNotifySessions(profile.notifySessions ?? true);
    setNotifyWeeklyReport(profile.notifyWeeklyReport ?? false);
    setNotifyMarketing(profile.notifyMarketing ?? true);
  }, [profile.displayName, profile.specialization, profile.email, profile.phone, profile.notifyInquiries, profile.notifySessions, profile.notifyWeeklyReport, profile.notifyMarketing]);

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({
      displayName,
      specialization,
      email,
      phone,
      notifyInquiries,
      notifySessions,
      notifyWeeklyReport,
      notifyMarketing,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto min-w-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900" style={{ color: '#003366' }}>
          Settings
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <form onSubmit={handleSave} className="space-y-6">
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5" /> Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInquiries}
                onChange={(e) => setNotifyInquiries(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">{NOTIFICATION_OPTIONS[0].label}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySessions}
                onChange={(e) => setNotifySessions(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">{NOTIFICATION_OPTIONS[1].label}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyWeeklyReport}
                onChange={(e) => setNotifyWeeklyReport(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">{NOTIFICATION_OPTIONS[2].label}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyMarketing}
                onChange={(e) => setNotifyMarketing(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">{NOTIFICATION_OPTIONS[3].label}</span>
            </label>
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
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors disabled:opacity-70"
          >
            <FiSave className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useWebinar } from './context/WebinarContext';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function SettingsPage() {
  const { settings, updateSetting } = useWebinar();

  return (
    <div className="px-4 py-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Settings</h1>

      <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Playback</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default playback speed</label>
            <select
              value={settings.defaultPlaybackSpeed ?? 1}
              onChange={(e) => updateSetting('defaultPlaybackSpeed', Number(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy bg-white text-sm"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.autoplayNext}
              onChange={(e) => updateSetting('autoplayNext', e.target.checked)}
              className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
            />
            <span className="text-sm text-gray-700">Autoplay next session when one ends</span>
          </label>
        </div>
      </section>

      <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Notifications</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!settings.notifyDoubtAnswered}
            onChange={(e) => updateSetting('notifyDoubtAnswered', e.target.checked)}
            className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
          />
          <span className="text-sm text-gray-700">Email me when my doubt is answered</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">Notification delivery is not connected yet; preference is saved.</p>
      </section>

      <section className="rounded-[20px] bg-white border border-gray-200 shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Sidebar</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!(settings.sidebarExpandedByDefault !== false)}
            onChange={(e) => updateSetting('sidebarExpandedByDefault', e.target.checked)}
            className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
          />
          <span className="text-sm text-gray-700">Start with sidebar expanded</span>
        </label>
      </section>
    </div>
  );
}

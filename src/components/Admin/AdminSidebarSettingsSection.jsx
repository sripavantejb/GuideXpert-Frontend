import { useEffect, useMemo, useState } from 'react';
import { getSidebarConfig, setSidebarConfig } from '../../utils/adminApi';
import {
  getDefaultPlacementForRoute,
  getDefaultSidebarConfig,
  mergeSidebarConfig,
  SIDEBAR_CONFIG_UPDATED_EVENT,
  SIDEBAR_PLACEMENTS,
  SIDEBAR_SETTINGS_ITEMS,
} from '../../constants/adminSidebarConfig';

const PLACEMENT_LABELS = {
  counsellors: 'Counsellors only',
  students: 'Students only',
  both: 'Both sections',
};

function ToggleSwitch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-primary-navy' : 'bg-gray-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminSidebarSettingsSection({ isSuperAdmin }) {
  const [config, setConfig] = useState(getDefaultSidebarConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSidebarConfig()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.sidebarConfig) {
          setConfig(mergeSidebarConfig(res.data.sidebarConfig));
        } else {
          setConfig(getDefaultSidebarConfig());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const placementByRoute = useMemo(() => {
    const map = {};
    for (const item of SIDEBAR_SETTINGS_ITEMS) {
      map[item.to] = config.overrides[item.to] || getDefaultPlacementForRoute(item.to);
    }
    return map;
  }, [config.overrides]);

  const handleSectionToggle = (key) => {
    if (!isSuperAdmin) return;
    setConfig((prev) => ({
      ...prev,
      sectionsEnabled: {
        ...prev.sectionsEnabled,
        [key]: !prev.sectionsEnabled[key],
      },
    }));
    setStatus({ type: null, message: '' });
  };

  const handlePlacementChange = (route, placement) => {
    if (!isSuperAdmin || !SIDEBAR_PLACEMENTS.includes(placement)) return;
    setConfig((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [route]: placement,
      },
    }));
    setStatus({ type: null, message: '' });
  };

  const handleSave = async () => {
    if (!isSuperAdmin || saving) return;

    if (!config.sectionsEnabled.counsellors && !config.sectionsEnabled.students) {
      setStatus({ type: 'error', message: 'At least one sidebar section must be enabled.' });
      return;
    }

    setSaving(true);
    setStatus({ type: null, message: '' });

    const res = await setSidebarConfig({
      sectionsEnabled: config.sectionsEnabled,
      overrides: config.overrides,
    });

    setSaving(false);

    if (res.success) {
      const next = mergeSidebarConfig(res.data?.sidebarConfig || config);
      setConfig(next);
      window.dispatchEvent(
        new CustomEvent(SIDEBAR_CONFIG_UPDATED_EVENT, { detail: { sidebarConfig: next } })
      );
      setStatus({ type: 'success', message: 'Sidebar organization saved. All admins will see the updated layout.' });
    } else {
      setStatus({ type: 'error', message: res.message || 'Failed to save sidebar settings.' });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Sidebar organization</h3>
      <p className="text-sm text-gray-500 mb-5">
        Control the Counsellors vs Students toggle in the admin sidebar and where each menu item appears.
        Only super admins can change these settings.
      </p>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable GuideXpert Counsellors section</p>
            <p className="text-xs text-gray-500 mt-0.5">Show the Counsellors option in the sidebar toggle.</p>
          </div>
          <ToggleSwitch
            checked={config.sectionsEnabled.counsellors !== false}
            disabled={!isSuperAdmin || loading || saving}
            onChange={() => handleSectionToggle('counsellors')}
            label="Enable GuideXpert Counsellors section"
          />
        </div>

        <div className="flex items-center justify-between gap-4 py-2 border-t border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable GuideXpert Students section</p>
            <p className="text-xs text-gray-500 mt-0.5">Show the Students option in the sidebar toggle.</p>
          </div>
          <ToggleSwitch
            checked={config.sectionsEnabled.students !== false}
            disabled={!isSuperAdmin || loading || saving}
            onChange={() => handleSectionToggle('students')}
            label="Enable GuideXpert Students section"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Menu item placement</h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading sidebar configuration…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Menu item</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Visible in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SIDEBAR_SETTINGS_ITEMS.map((item) => (
                  <tr key={item.to}>
                    <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.label}</td>
                    <td className="px-3 py-2.5">
                      <select
                        value={placementByRoute[item.to]}
                        disabled={!isSuperAdmin || saving}
                        onChange={(e) => handlePlacementChange(item.to, e.target.value)}
                        className="w-full max-w-xs px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-navy focus:border-primary-navy outline-none disabled:bg-gray-50"
                      >
                        {SIDEBAR_PLACEMENTS.map((placement) => (
                          <option key={placement} value={placement}>
                            {PLACEMENT_LABELS[placement]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {status.message && (
        <p
          className={`text-sm mt-4 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          role="alert"
        >
          {status.message}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isSuperAdmin || loading || saving}
          className="px-4 py-2.5 rounded-lg bg-primary-navy text-white hover:bg-primary-navy/90 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save sidebar organization'}
        </button>
      </div>
    </div>
  );
}

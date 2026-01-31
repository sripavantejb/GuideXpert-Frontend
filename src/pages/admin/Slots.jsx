import { useState, useEffect } from 'react';
import { getSlotConfigs, updateSlotConfig, getStoredToken } from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import ToggleSwitch from '../../components/UI/ToggleSwitch';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_DISPLAY = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
  FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday'
};
const TIME_DISPLAY = { '7PM': '7 PM', '11AM': '11 AM', '3PM': '3 PM' };

function formatSlotLabel(slotId) {
  if (!slotId || typeof slotId !== 'string') return slotId || '';
  const match = slotId.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
  if (match) {
    return `${DAY_DISPLAY[match[1]] || match[1]} ${TIME_DISPLAY[match[2]] || match[2]}`;
  }
  return slotId;
}

function groupSlotsByDay(slots) {
  return slots.reduce((acc, slot) => {
    const match = slot.slotId?.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_/i);
    const day = match ? match[1].toUpperCase() : 'OTHER';
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});
}

export default function Slots() {
  const { logout } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchSlots = () => {
    setLoading(true);
    setError('');
    getSlotConfigs(getStoredToken()).then((result) => {
      if (!result.success) {
        if (result.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        setError(result.message || 'Failed to load slot configs');
        setLoading(false);
        return;
      }
      setSlots(result.data?.data?.slots ?? []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSlots();
  }, [logout]);

  const handleToggle = async (slotId, enabled) => {
    setTogglingId(slotId);
    const result = await updateSlotConfig(slotId, enabled, getStoredToken());
    setTogglingId(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update slot');
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, enabled } : s))
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500">Loading slots…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600" role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Slot Management</h2>
      <p className="text-sm text-gray-500 mb-6">
        Toggle slots on or off. Disabled slots will be hidden from the booking form.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {slots.length === 0 ? (
          <p className="px-6 py-8 text-gray-500 text-center">No slots configured.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {(() => {
              const slotsByDay = groupSlotsByDay(slots);
              return DAY_ORDER.map((day) => {
                const daySlots = slotsByDay[day] || [];
                if (daySlots.length === 0) return null;
                return (
                <div key={day} className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
                    {DAY_DISPLAY[day]}
                  </h3>
                  <div className="space-y-1">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.slotId}
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {formatSlotLabel(slot.slotId)}
                        </span>
                        <ToggleSwitch
                          id={`slot-${slot.slotId}`}
                          checked={slot.enabled}
                          onChange={(checked) => handleToggle(slot.slotId, checked)}
                          disabled={togglingId === slot.slotId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-16 text-center">
          <p className="text-gray-500">Loading slots…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6">
          <p className="text-red-600" role="alert">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Slot Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Toggle slots on or off. Disabled slots will be hidden from the booking form.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {slots.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-gray-500">No slots configured.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[1fr_6rem_5.5rem] gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slot</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Booked</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</span>
            </div>
            {(() => {
              const slotsByDay = groupSlotsByDay(slots);
              return DAY_ORDER.map((day) => {
                const daySlots = slotsByDay[day] || [];
                if (daySlots.length === 0) return null;
                return (
                  <div key={day} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-6 py-3 bg-gray-50/50">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {DAY_DISPLAY[day]}
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {daySlots.map((slot) => {
                        const bookedCount = slot.bookedCount ?? 0;
                        return (
                          <div
                            key={slot.slotId}
                            className="grid grid-cols-[1fr_6rem_5.5rem] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {formatSlotLabel(slot.slotId)}
                            </span>
                            <div className="flex justify-end">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  bookedCount > 0
                                    ? 'bg-primary-blue-100 text-primary-blue-600'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {bookedCount} booked
                              </span>
                            </div>
                            <div className="flex justify-end items-center">
                              <ToggleSwitch
                                id={`slot-${slot.slotId}`}
                                checked={slot.enabled}
                                onChange={(checked) => handleToggle(slot.slotId, checked)}
                                disabled={togglingId === slot.slotId}
                              />
                            </div>
                          </div>
                        );
                      })}
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

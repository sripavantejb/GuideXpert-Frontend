import { useState, useEffect, useMemo } from 'react';
import {
  getSlotConfigs,
  updateSlotConfig,
  getSlotOverrides,
  setSlotOverride,
  getSlotBookingCounts,
  getStoredToken
} from '../../utils/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import ToggleSwitch from '../../components/UI/ToggleSwitch';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_HEADER = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun'
};
const DAY_BY_DOW = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TIME_ROWS = ['11AM', '7PM'];
const TIME_DISPLAY = { '11AM': '11 AM', '7PM': '7 PM' };
const WEEKDAY_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function slotIdFor(day, timeKey) {
  return `${day}_${timeKey}`;
}

function slotMapFromList(slots) {
  return (slots || []).reduce((acc, s) => {
    if (s?.slotId) acc[s.slotId] = s;
    return acc;
  }, {});
}

function toYYYYMMDD(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Always returns YYYY-MM-DD for map keys (Date or string from API). */
function toDateKey(date) {
  if (date instanceof Date) return toYYYYMMDD(date);
  if (typeof date === 'string' && date.length >= 10) return date.slice(0, 10);
  if (typeof date === 'string') return date;
  return toYYYYMMDD(new Date(date));
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startBlank = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startBlank; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const total = 42;
  while (cells.length < total) cells.push(null);
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, (r + 1) * 7));
  return rows;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Slots() {
  const { logout } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [overridesLoading, setOverridesLoading] = useState(false);
  const [overrideToggling, setOverrideToggling] = useState(null);
  const [bookingCountsByDate, setBookingCountsByDate] = useState([]);

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

  const fromStr = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return toYYYYMMDD(d);
  }, [viewYear, viewMonth]);
  const toStr = useMemo(() => {
    const d = new Date(viewYear, viewMonth + 1, 0);
    return toYYYYMMDD(d);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (!fromStr || !toStr) return;
    setOverridesLoading(true);
    Promise.all([
      getSlotOverrides(fromStr, toStr, getStoredToken()),
      getSlotBookingCounts(fromStr, toStr, getStoredToken())
    ]).then(([overridesRes, countsRes]) => {
      setOverridesLoading(false);
      if (!overridesRes.success) {
        if (overridesRes.status === 401) {
          logout();
          window.location.href = '/admin/login';
          return;
        }
        return;
      }
      setOverrides(overridesRes.data?.data?.overrides ?? []);
      if (countsRes.success && countsRes.data?.data?.counts) {
        setBookingCountsByDate(countsRes.data.data.counts);
      } else {
        setBookingCountsByDate([]);
      }
    });
  }, [fromStr, toStr, logout]);

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

  const overrideMap = useMemo(() => {
    const m = {};
    overrides.forEach((o) => {
      m[`${o.date}_${o.slotId}`] = o.enabled;
    });
    return m;
  }, [overrides]);

  const bookingCountMap = useMemo(() => {
    const m = {};
    bookingCountsByDate.forEach((c) => {
      m[`${toDateKey(c.date)}_${c.slotId}`] = c.count;
    });
    return m;
  }, [bookingCountsByDate]);

  const handleOverrideToggle = async (dateStr, slotId, enabled) => {
    const key = `${dateStr}_${slotId}`;
    setOverrideToggling(key);
    const result = await setSlotOverride(dateStr, slotId, enabled, getStoredToken());
    setOverrideToggling(null);
    if (!result.success) {
      if (result.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      setError(result.message || 'Failed to update date override');
      return;
    }
    setOverrides((prev) => {
      const rest = prev.filter((o) => o.date !== dateStr || o.slotId !== slotId);
      return [...rest, { date: dateStr, slotId, enabled }];
    });
  };

  const monthGrid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const slotMap = slotMapFromList(slots);

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

      {/* Recurring weekly slots */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Recurring weekly slots</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {slots.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <p className="text-gray-500">No slots configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 pr-2 w-20">Time</th>
                    {DAY_ORDER.map((day) => (
                      <th key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-2">
                        {DAY_HEADER[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_ROWS.map((timeKey) => (
                    <tr key={timeKey} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 pl-6 pr-2 text-sm font-medium text-gray-700 align-top">{TIME_DISPLAY[timeKey]}</td>
                      {DAY_ORDER.map((day) => {
                        const slotId = slotIdFor(day, timeKey);
                        const slot = slotMap[slotId];
                        if (!slot) {
                          return (
                            <td key={slotId} className="py-3 px-2 text-center align-top text-gray-300">—</td>
                          );
                        }
                        const bookedCount = slot.bookedCount ?? 0;
                        return (
                          <td key={slotId} className="py-3 px-2 align-top">
                            <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-50/80 py-3 px-2 min-h-18">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  bookedCount > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {bookedCount} booked
                              </span>
                              <ToggleSwitch
                                id={`slot-${slotId}`}
                                checked={slot.enabled}
                                onChange={(checked) => handleToggle(slotId, checked)}
                                disabled={togglingId === slotId}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Month calendar and date overrides */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Date overrides</h2>
        <p className="text-sm text-gray-500 mb-4">
          Click a date to enable or disable slots for that specific day.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else {
                  setViewMonth((m) => m - 1);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Previous month"
            >
              <span className="text-lg font-medium">←</span>
            </button>
            <span className="text-base font-semibold text-gray-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else {
                  setViewMonth((m) => m + 1);
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Next month"
            >
              <span className="text-lg font-medium">→</span>
            </button>
          </div>

          <div className="p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {WEEKDAY_HEADER.map((day) => (
                    <th key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthGrid.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((dayNum, ci) => {
                      if (dayNum === null) {
                        return <td key={`${ri}-${ci}`} className="p-1" />;
                      }
                      const date = new Date(viewYear, viewMonth, dayNum);
                      const dateStr = toYYYYMMDD(date);
                      const isSelected = selectedDate && toYYYYMMDD(selectedDate) === dateStr;
                      const hasOverride = overrides.some((o) => o.date === dateStr);
                      return (
                        <td key={`${ri}-${ci}`} className="p-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary-blue-600 text-white'
                                : hasOverride
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {dayNum}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedDate && (
            <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              {overridesLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : (
                <ul className="space-y-3">
                  {(() => {
                    const dayName = DAY_BY_DOW[selectedDate.getDay()];
                    return TIME_ROWS.map((timeKey) => {
                      const slotId = slotIdFor(dayName, timeKey);
                      const slot = slotMap[slotId];
                      if (!slot) return null;
                      const dateStr = toDateKey(selectedDate);
                      const key = `${dateStr}_${slotId}`;
                      const overrideEnabled = overrideMap[key];
                      const enabled = overrideEnabled !== undefined ? overrideEnabled : slot.enabled;
                      const bookedCount = bookingCountMap[key] ?? 0;
                      return (
                        <li key={slotId} className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">{TIME_DISPLAY[timeKey]}</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                bookedCount > 0 ? 'bg-primary-blue-100 text-primary-blue-600' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {bookedCount} booked
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Enabled for this date</span>
                            <ToggleSwitch
                              id={`override-${key}`}
                              checked={enabled}
                              onChange={(checked) => handleOverrideToggle(dateStr, slotId, checked)}
                              disabled={overrideToggling === key}
                            />
                          </div>
                        </li>
                      );
                    });
                  })()}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { oocListSlots, oocToggleSlot } from '../../utils/oneOnOneCounselorApi';

export default function OneOnOneCounselorSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await oocListSlots();
    setLoading(false);
    if (res.success) setSlots(res.data?.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6 md:p-8 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Slots</h1>
      <p className="text-sm text-slate-600">Turn slots ON/OFF for your assigned sessions only.</p>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Session</th>
              <th className="px-3 py-2 text-left">Date / Time</th>
              <th className="px-3 py-2 text-left">Bookings</th>
              <th className="px-3 py-2 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No slots assigned yet
                </td>
              </tr>
            ) : (
              slots.map((slot) => (
                <tr key={slot.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{slot.sessionTitle}</td>
                  <td className="px-3 py-2">
                    {slot.slotDate} · {slot.slotTime}
                  </td>
                  <td className="px-3 py-2">
                    {slot.currentBookings}/{slot.maxBookings}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await oocToggleSlot(slot.id);
                        load();
                      }}
                      className="inline-flex items-center gap-1 text-sm"
                    >
                      {slot.isActive ? (
                        <>
                          <FiToggleRight className="text-emerald-600" /> ON
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-slate-400" /> OFF
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

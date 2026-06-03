import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';
import { oocStats } from '../../utils/oneOnOneCounselorApi';

export default function OneOnOneCounselorDashboard() {
  const { user } = useOneOnOneCounselorAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    oocStats().then((res) => {
      if (res.success) setStats(res.data?.data);
    });
  }, []);

  const cards = [
    { label: 'Assigned slots', value: stats?.slotCount ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Active slots', value: stats?.activeSlots ?? '—', to: '/one-on-one-counselor/slots', icon: FiCalendar },
    { label: 'Bookings', value: stats?.bookingCount ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
    { label: 'Attended', value: stats?.attended ?? '—', to: '/one-on-one-counselor/bookings', icon: FiBookOpen },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-slate-600 text-sm mt-1">
          {user?.designation}
          {user?.collegeName ? ` · ${user.collegeName}` : ''}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#0f2744]/30 transition"
          >
            <Icon className="text-[#0f2744] mb-2" aria-hidden />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

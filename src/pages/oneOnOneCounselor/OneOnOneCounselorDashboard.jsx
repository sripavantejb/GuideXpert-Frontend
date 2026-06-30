import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCalendar, FiUsers } from 'react-icons/fi';
import { useOneOnOneCounselorAuth } from '../../contexts/OneOnOneCounselorAuthContext';
import { oocStats } from '../../utils/oneOnOneCounselorApi';

function NatSummaryRow({ label, count, names }) {
  const nameList = Array.isArray(names) ? names : [];
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-2xl font-bold tabular-nums text-[#0f2744]">{count ?? 0}</p>
      </div>
      {nameList.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{nameList.join(', ')}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-400">No students yet</p>
      )}
    </div>
  );
}

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

  const nat = stats?.nat;

  const natRows = [
    { label: 'NAT form submitted', ...nat?.formSubmitted },
    { label: 'NAT initiated', ...nat?.initiated },
    { label: 'Interested — Yes', ...nat?.interestedYes },
    { label: 'Interested — No', ...nat?.interestedNo },
    { label: 'Interested — Undecided', ...nat?.undecided },
    { label: 'Contact later', ...nat?.contactLater },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-slate-600 text-sm mt-1">
          {user?.designation}
          {user?.collegeName ? ` · ${user?.collegeName}` : ''}
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

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FiUsers className="text-[#0f2744]" aria-hidden />
          <h2 className="text-lg font-bold text-slate-900">NAT follow-up</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Summary for your confirmed session bookings. Names only — contact your admin team for full details.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {natRows.map((row) => (
            <NatSummaryRow key={row.label} label={row.label} count={row.count} names={row.names} />
          ))}
        </div>
      </section>
    </div>
  );
}

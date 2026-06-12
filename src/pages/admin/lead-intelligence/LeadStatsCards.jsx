import { FiActivity, FiThermometer, FiTrendingUp, FiUsers } from 'react-icons/fi';
import KpiCard from '../../../components/Admin/KpiCard';
import StatCardSkeleton from '../../../components/UI/CardSkeleton';
import { PANEL_CLASS } from './leadIntelligenceUtils';

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className={`${PANEL_CLASS} flex items-center justify-between gap-3 border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}

export default function LeadStatsCards({ stats, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard label="Total Leads" value={stats?.totalLeads ?? 0} icon={FiUsers} accent="hero" />
      <KpiCard label="Cold Leads" value={stats?.coldLeads ?? 0} icon={FiThermometer} />
      <KpiCard label="Warm Leads" value={stats?.warmLeads ?? 0} icon={FiActivity} />
      <KpiCard label="Hot Leads" value={stats?.hotLeads ?? 0} icon={FiTrendingUp} accent />
      <KpiCard
        label="Average Score"
        value={stats?.averageScore ?? 0}
        icon={FiTrendingUp}
        subtitle="Across scored leads"
      />
    </div>
  );
}

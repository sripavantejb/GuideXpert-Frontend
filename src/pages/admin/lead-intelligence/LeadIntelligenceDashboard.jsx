import { useCallback, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { useHotLeads } from '../../../hooks/useHotLeads';
import { useLeadList } from '../../../hooks/useLeadList';
import { useLeadStats } from '../../../hooks/useLeadStats';
import HotLeadsTable from './HotLeadsTable';
import LeadDetailDrawer from './LeadDetailDrawer';
import LeadFilters from './LeadFilters';
import LeadStatsCards from './LeadStatsCards';
import LeadsTable from './LeadsTable';
import { PANEL_CLASS } from './leadIntelligenceUtils';

export default function LeadIntelligenceDashboard() {
  const [selectedPhone, setSelectedPhone] = useState('');
  const { stats, loading: statsLoading, error: statsError, retry: retryStats } = useLeadStats();
  const { items: hotItems, loading: hotLoading, error: hotError, retry: retryHot } = useHotLeads();

  const handleExactPhoneMatch = useCallback((phone) => {
    setSelectedPhone(phone);
  }, []);

  const {
    stage,
    minScore,
    page,
    limit,
    searchPhone,
    debouncedSearch,
    items,
    total,
    loading: listLoading,
    error: listError,
    retry: retryList,
    setFilters,
    setPage,
  } = useLeadList({ onExactPhoneMatch: handleExactPhoneMatch });

  return (
    <div className="space-y-6">
      <header className={`${PANEL_CLASS} bg-gradient-to-br from-white via-white to-slate-50/90 px-5 py-5 sm:px-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary-blue-600">
              <FiMessageSquare className="h-4 w-4 shrink-0" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                WhatsApp Chatbot
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 tracking-tight sm:text-[1.65rem]">
              Chatbot Lead Intelligence
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Monitor lead profiles, scoring stages, and extracted conversation signals from the
              automated WhatsApp chatbot pipeline.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            Read-only intelligence
          </span>
        </div>
      </header>

      <LeadStatsCards
        stats={stats}
        loading={statsLoading}
        error={statsError}
        onRetry={retryStats}
      />

      <HotLeadsTable
        items={hotItems}
        loading={hotLoading}
        error={hotError}
        onRetry={retryHot}
        onSelectPhone={setSelectedPhone}
      />

      <LeadFilters
        stage={stage}
        minScore={minScore}
        limit={limit}
        searchPhone={searchPhone}
        debouncedSearch={debouncedSearch}
        onStageChange={(value) => setFilters({ stage: value })}
        onMinScoreChange={(value) => setFilters({ minScore: value })}
        onLimitChange={(value) => setFilters({ limit: value })}
        onSearchChange={(value) => setFilters({ searchPhone: value })}
      />

      <LeadsTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        loading={listLoading}
        error={listError}
        onRetry={retryList}
        onSelectPhone={setSelectedPhone}
        onPageChange={setPage}
      />

      {selectedPhone ? (
        <LeadDetailDrawer phone={selectedPhone} onClose={() => setSelectedPhone('')} />
      ) : null}
    </div>
  );
}

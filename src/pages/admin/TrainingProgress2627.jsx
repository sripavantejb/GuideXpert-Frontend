import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import CopyToSheetsModal from '../../components/Admin/CopyToSheetsModal';
import CommandHeader from '../../components/Admin/training-progress/CommandHeader';
import HeroMetrics from '../../components/Admin/training-progress/HeroMetrics';
import TrainingJourney from '../../components/Admin/training-progress/TrainingJourney';
import SmartFilterBar from '../../components/Admin/training-progress/SmartFilterBar';
import StudentTable from '../../components/Admin/training-progress/StudentTable';
import { webinarProgress2627AdminApi } from '../../utils/adminApi';
import { useWebinarProgressAdmin } from './webinar-progress/useWebinarProgressAdmin';
import {
  WEBINAR_COPY_FIELDS,
  MODULE_LABELS,
  formatDateTime,
} from './webinar-progress/webinarProgressShared';

function getWebinarCellValue(row, key) {
  if (key === 'modulesDone') {
    const n = row.modulesDone != null ? row.modulesDone : (row.completedModules || []).length;
    return String(n);
  }
  if (key === 'lastActiveModule') {
    const id = row.lastActiveModule;
    return id ? MODULE_LABELS[id] || id : '';
  }
  if (key === 'firstJoinedAt' || key === 'lastActivityAt') return formatDateTime(row[key]);
  if (key === 'isLegacyUser') return row.isLegacyUser ? 'Legacy' : 'New';
  const v = row[key];
  if (v == null || v === '') return '';
  return String(v);
}

export default function TrainingProgress2627() {
  const reducedMotion = useReducedMotion();
  const d = useWebinarProgressAdmin(webinarProgress2627AdminApi);

  const [rowsEntered, setRowsEntered] = useState(false);

  useEffect(() => {
    if (!d.loading && !rowsEntered) setRowsEntered(true);
  }, [d.loading, rowsEntered]);

  const staggerRows = !rowsEntered;
  const hasError = d.listError || d.statsError;

  return (
    <div className="-mx-4 -mt-2 min-h-full bg-gradient-to-b from-slate-50 via-slate-50 to-primary-blue-50/40 px-4 pb-10 sm:-mx-6 sm:px-6">
      <div className="space-y-6 pt-2">
        <CommandHeader
          reducedMotion={reducedMotion}
          onRefresh={d.handleRefresh}
          onExport={d.handleExport}
          refreshing={d.loading || d.statsLoading}
          exporting={d.exporting}
        />

        {d.exportToast && (
          <div
            className={`rounded-xl px-4 py-2 text-sm ${
              d.exportToast.type === 'error'
                ? 'border border-red-200 bg-red-50 text-red-800'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {d.exportToast.message}
          </div>
        )}

        {hasError && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{d.listError || d.statsError}</p>
            <button
              type="button"
              onClick={d.handleRefresh}
              className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        )}

        <HeroMetrics stats={d.stats} loading={d.statsLoading} reducedMotion={reducedMotion} />
        <TrainingJourney stats={d.stats} loading={d.statsLoading} reducedMotion={reducedMotion} />

        <SmartFilterBar
          f={d.f}
          setF={d.setF}
          searchInput={d.searchInput}
          setSearchInput={d.setSearchInput}
          moreOpen={d.moreOpen}
          setMoreOpen={d.setMoreOpen}
          pickerOpen={d.pickerOpen}
          setPickerOpen={d.setPickerOpen}
          moduleComboOpen={d.moduleComboOpen}
          setModuleComboOpen={d.setModuleComboOpen}
          moduleSearch={d.moduleSearch}
          setModuleSearch={d.setModuleSearch}
          applyStatusChip={d.applyStatusChip}
          applyActiveToday={d.applyActiveToday}
          applyNewUsersToday={d.applyNewUsersToday}
          clearFilters={d.clearFilters}
          viewAll={d.viewAll}
          setViewAll={d.setViewAll}
          setPage={d.setPage}
          copyLoading={d.copyLoading}
          onCopy={d.prepareCopyWebinarRows}
          copyError={d.copyError}
          selectedCount={d.selectedPhones.size}
          bulkBusy={d.bulkBusy}
          onBulk={d.runBulkTable}
        />

        <StudentTable
          users={d.users}
          setUsers={d.setUsers}
          loading={d.loading}
          total={d.total}
          page={d.page}
          setPage={d.setPage}
          viewAll={d.viewAll}
          setViewAll={d.setViewAll}
          listLimit={d.listLimit}
          totalPages={d.totalPages}
          f={d.f}
          toggleSort={d.toggleSort}
          expandedPhone={d.expandedPhone}
          setExpandedPhone={d.setExpandedPhone}
          selectedPhones={d.selectedPhones}
          allPageSelected={d.allPageSelected}
          somePageSelected={d.somePageSelected}
          toggleSelectAllPage={d.toggleSelectAllPage}
          toggleSelectOne={d.toggleSelectOne}
          api={d.api}
          reducedMotion={reducedMotion}
          staggerRows={staggerRows}
        />
      </div>

      <CopyToSheetsModal
        open={d.copyModalOpen}
        onClose={() => d.setCopyModalOpen(false)}
        fields={WEBINAR_COPY_FIELDS}
        records={d.copyRecords}
        getCellValue={getWebinarCellValue}
        recordLabel="trainees"
        dedupeByPhoneKey="phone"
        loading={d.copyLoading}
      />
    </div>
  );
}

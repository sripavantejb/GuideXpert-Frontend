import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  FiSearch,
  FiCopy,
  FiCheckCircle,
  FiRotateCcw,
  FiChevronDown,
  FiCalendar,
  FiX,
} from 'react-icons/fi';
import {
  MODULE_ORDER,
  MODULE_LABELS,
  countActiveFilters,
  parseYMDLocal,
  toYMDLocal,
} from '../../../pages/admin/webinar-progress/webinarProgressShared';

const CHIP_BASE =
  'h-8 shrink-0 rounded-full px-3 text-xs font-semibold transition border';
const CHIP_ON = 'border-primary-navy bg-primary-navy text-white';
const CHIP_OFF = 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300';

function chipOn(active) {
  return `${CHIP_BASE} ${active ? CHIP_ON : CHIP_OFF}`;
}

export default function SmartFilterBar({
  f,
  setF,
  searchInput,
  setSearchInput,
  moreOpen,
  setMoreOpen,
  pickerOpen,
  setPickerOpen,
  moduleComboOpen,
  setModuleComboOpen,
  moduleSearch,
  setModuleSearch,
  applyStatusChip,
  applyActiveToday,
  applyNewUsersToday,
  clearFilters,
  viewAll,
  setViewAll,
  setPage,
  copyLoading,
  onCopy,
  copyError,
  selectedCount,
  bulkBusy,
  onBulk,
}) {
  const activeCount = countActiveFilters(f, searchInput);
  const statusSingle = f.statuses.length === 1 ? f.statuses[0] : null;
  const allStatus = f.statuses.length === 0;
  const today = toYMDLocal(new Date());
  const isNewToday =
    f.filterMode === 'first_join' && f.fromDate === today && f.toDate === today && !f.activeOn;
  const moduleOptions = MODULE_ORDER.filter((id) => {
    const q = moduleSearch.trim().toLowerCase();
    const label = (MODULE_LABELS[id] || id).toLowerCase();
    return !q || label.includes(q) || id.includes(q);
  });

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 shadow-[0_8px_30px_rgba(4,30,48,0.05)] backdrop-blur-md">
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or phone"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-navy/40 focus:ring-2 focus:ring-primary-navy/15"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => applyStatusChip('')} className={chipOn(allStatus)}>
              All
            </button>
            <button type="button" onClick={() => applyStatusChip('completed')} className={chipOn(statusSingle === 'completed')}>
              Completed
            </button>
            <button type="button" onClick={() => applyStatusChip('in_progress')} className={chipOn(statusSingle === 'in_progress')}>
              In progress
            </button>
            <button type="button" onClick={() => applyStatusChip('not_started')} className={chipOn(statusSingle === 'not_started')}>
              Not started
            </button>
            <button type="button" onClick={applyActiveToday} className={chipOn(f.activity === 'active_today')}>
              Active today
            </button>
            <button type="button" onClick={applyNewUsersToday} className={chipOn(isNewToday)}>
              New today
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
          >
            More filters
            {activeCount > 0 && (
              <span className="ml-0.5 rounded-full bg-primary-navy px-1.5 text-[10px] text-white">{activeCount}</span>
            )}
            <FiChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? 'rotate-180' : ''}`} />
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <FiX className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <label className="ml-auto inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={viewAll}
              onChange={(e) => {
                setViewAll(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-primary-navy focus:ring-primary-navy"
            />
            View all
          </label>
          <button
            type="button"
            onClick={onCopy}
            disabled={copyLoading}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 disabled:opacity-50"
          >
            <FiCopy className="h-3.5 w-3.5" />
            {copyLoading ? 'Preparing…' : 'Copy'}
          </button>
        </div>
        {copyError && <p className="text-xs text-red-600">{copyError}</p>}
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-amber-100 bg-amber-50/80 px-4 py-2.5 sm:px-5">
          <span className="text-xs font-semibold text-amber-900">{selectedCount} selected</span>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => onBulk('complete_all')}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FiCheckCircle className="h-3.5 w-3.5" />
            Mark completed
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => onBulk('reset')}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FiRotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      )}

      {moreOpen && (
        <div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:px-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setF((p) => ({ ...p, filterMode: 'first_join' }))}
                className={chipOn(f.filterMode === 'first_join')}
              >
                First join
              </button>
              <button
                type="button"
                onClick={() => setF((p) => ({ ...p, filterMode: 'last_activity' }))}
                className={chipOn(f.filterMode === 'last_activity')}
              >
                Last activity
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['single', 'activeOn', 'Pick date'],
                ['from', 'fromDate', 'From'],
                ['to', 'toDate', 'To'],
              ].map(([key, field, label]) => (
                <div key={key} className="relative" data-webinar-picker>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((o) => (o === key ? null : key))}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700"
                  >
                    <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                    {f[field] || label}
                  </button>
                  {pickerOpen === key && (
                    <div className="absolute left-0 top-full z-30 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <DayPicker
                        mode="single"
                        selected={parseYMDLocal(f[field])}
                        onSelect={(d) => {
                          setF((p) => ({ ...p, [field]: d ? toYMDLocal(d) : '' }));
                          setPickerOpen(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Progress range</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={f.progressMin}
                onChange={(e) => setF((p) => ({ ...p, progressMin: Number(e.target.value) }))}
                className="min-w-[100px] flex-1 accent-primary-navy"
              />
              <span className="w-8 text-xs tabular-nums">{f.progressMin}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={f.progressMax}
                onChange={(e) => setF((p) => ({ ...p, progressMax: Number(e.target.value) }))}
                className="min-w-[100px] flex-1 accent-primary-navy"
              />
              <span className="w-8 text-xs tabular-nums">{f.progressMax}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['0-3', '4-7', '8-10', '11'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() =>
                    setF((p) => {
                      const off = p.modulesBucket === b;
                      return { ...p, modulesMode: off ? 'none' : 'bucket', modulesBucket: off ? '' : b };
                    })
                  }
                  className={chipOn(f.modulesMode === 'bucket' && f.modulesBucket === b)}
                >
                  {b === '11' ? '11/11 modules' : `${b} modules`}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ['', 'Any activity'],
                ['active_5m', 'Active 5m'],
                ['inactive_24h', 'Inactive 24h'],
              ].map(([val, label]) => (
                <button
                  key={val || 'any'}
                  type="button"
                  onClick={() => setF((p) => ({ ...p, activity: val }))}
                  className={chipOn(f.activity === val)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm" data-module-combo>
              <input
                type="text"
                value={moduleSearch}
                onChange={(e) => {
                  setModuleSearch(e.target.value);
                  setModuleComboOpen(true);
                }}
                onFocus={() => setModuleComboOpen(true)}
                placeholder="Current module…"
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
              />
              {f.lastActiveModule && (
                <button
                  type="button"
                  className="mt-1 text-[11px] font-medium text-primary-navy"
                  onClick={() => setF((p) => ({ ...p, lastActiveModule: '' }))}
                >
                  Clear {MODULE_LABELS[f.lastActiveModule]}
                </button>
              )}
              {moduleComboOpen && (
                <ul className="absolute z-30 mt-1 max-h-44 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {moduleOptions.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                        onClick={() => {
                          setF((p) => ({ ...p, lastActiveModule: id }));
                          setModuleComboOpen(false);
                          setModuleSearch('');
                        }}
                      >
                        {MODULE_LABELS[id]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

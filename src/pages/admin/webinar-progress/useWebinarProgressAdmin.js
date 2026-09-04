import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ADMIN_VIEW_ALL_LIMIT } from '../../../constants/adminListLimits';
import { fetchAllPaginatedRows } from '../../../utils/adminPagedFetch';
import {
  INITIAL_FILTERS,
  buildListParams,
  buildExportParams,
  toYMDLocal,
} from '../webinar-progress/webinarProgressShared';

function useDebounced(value, ms) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

export function useWebinarProgressAdmin(api) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [copyRecords, setCopyRecords] = useState([]);
  const pageLimit = 25;
  const [f, setF] = useState(() => ({ ...INITIAL_FILTERS }));
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounced(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expandedPhone, setExpandedPhone] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null);
  const [listError, setListError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [selectedPhones, setSelectedPhones] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(null);
  const [moduleComboOpen, setModuleComboOpen] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const fetchUsersRef = useRef(async () => {});
  const entranceDoneRef = useRef(false);

  const filterKey = useMemo(
    () => JSON.stringify({ f, search: debouncedSearch, viewAll }),
    [f, debouncedSearch, viewAll]
  );
  const prevFilterKeyRef = useRef(filterKey);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.getStats();
      if (res.success && res.data?.data) setStats(res.data.data);
      else setStatsError(res.message || 'Failed to load stats.');
    } catch {
      setStatsError('Failed to load stats.');
    }
    setStatsLoading(false);
  }, [api]);

  const fetchUsers = useCallback(
    async (targetPage) => {
      setLoading(true);
      setListError(null);
      try {
        const listLimit = viewAll ? ADMIN_VIEW_ALL_LIMIT : pageLimit;
        const pageArg = viewAll ? 1 : targetPage;
        const params = buildListParams(f, debouncedSearch, pageArg, listLimit);
        const res = await api.getList(params);
        if (res.success && res.data?.data) {
          setUsers(res.data.data.users || []);
          setTotal(res.data.data.total || 0);
          setSelectedPhones(new Set());
        } else setListError(res.message || 'Failed to load users.');
      } catch {
        setListError('Failed to load users.');
      }
      setLoading(false);
    },
    [viewAll, pageLimit, f, debouncedSearch, api]
  );

  const lastLoadKeyRef = useRef('');

  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchStats();
    });
  }, [fetchStats]);

  useEffect(() => {
    const filtersChanged = prevFilterKeyRef.current !== filterKey;
    if (filtersChanged) {
      prevFilterKeyRef.current = filterKey;
      queueMicrotask(() => {
        setPage((p) => (p !== 1 ? 1 : p));
      });
    }
    const targetPage = filtersChanged ? 1 : page;
    const loadKey = `${filterKey}|p${targetPage}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;
    queueMicrotask(() => {
      fetchUsers(targetPage);
    });
  }, [filterKey, page, fetchUsers]);

  useEffect(() => {
    let blurredAt = 0;
    const onBlur = () => {
      blurredAt = Date.now();
    };
    const onFocus = () => {
      if (Date.now() - blurredAt < 10_000) return;
      fetchStats();
      fetchUsersRef.current();
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchStats]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      fetchStats();
      fetchUsersRef.current();
    }, 120_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    if (!exportToast) return;
    const t = setTimeout(() => setExportToast(null), 4000);
    return () => clearTimeout(t);
  }, [exportToast]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.('[data-webinar-picker]')) setPickerOpen(null);
      if (!e.target.closest?.('[data-module-combo]')) setModuleComboOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleRefresh = useCallback(() => {
    setListError(null);
    setStatsError(null);
    lastLoadKeyRef.current = '';
    fetchStats();
    fetchUsers(viewAll ? 1 : page);
  }, [fetchStats, fetchUsers, viewAll, page]);

  const prepareCopyWebinarRows = async () => {
    setCopyLoading(true);
    setCopyError('');
    try {
      const result = await fetchAllPaginatedRows((p, chunk) =>
        api.getList(buildListParams(f, debouncedSearch, p, chunk))
      );
      if (!result.success) {
        setCopyError(result.result?.message || 'Failed to load users for copy.');
        return;
      }
      setCopyRecords(result.rows || []);
      setCopyModalOpen(true);
    } catch (err) {
      setCopyError(err?.message || 'Failed to load users for copy.');
    } finally {
      setCopyLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportToast(null);
    const res = await api.exportCsv(buildExportParams(f, debouncedSearch));
    setExporting(false);
    if (res.success) setExportToast({ type: 'success', message: 'CSV downloaded.' });
    else setExportToast({ type: 'error', message: res.message || 'Export failed.' });
  };

  const applyNewUsersToday = () => {
    const today = toYMDLocal(new Date());
    setF((prev) => ({
      ...prev,
      filterMode: 'first_join',
      activity: '',
      statuses: [],
      activeOn: '',
      fromDate: today,
      toDate: today,
    }));
  };

  const applyActiveToday = () => {
    setF((prev) => ({
      ...prev,
      activity: prev.activity === 'active_today' ? '' : 'active_today',
    }));
  };

  const applyStatusChip = (status) => {
    setF((prev) => {
      if (!status) return { ...prev, statuses: [] };
      const only = prev.statuses.length === 1 && prev.statuses[0] === status;
      return { ...prev, statuses: only ? [] : [status] };
    });
  };

  const clearFilters = () => {
    setF({ ...INITIAL_FILTERS });
    setSearchInput('');
    setPickerOpen(null);
    setModuleSearch('');
  };

  const toggleStatus = (key) => {
    setF((prev) => {
      const s = new Set(prev.statuses);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return { ...prev, statuses: [...s] };
    });
  };

  const toggleSort = (field) => {
    setF((prev) => {
      const cur = prev.sort;
      const neg = cur.startsWith('-');
      const curField = neg ? cur.slice(1) : cur;
      if (curField !== field) return { ...prev, sort: `-${field}` };
      return { ...prev, sort: neg ? field : `-${field}` };
    });
  };

  const allPageSelected = users.length > 0 && users.every((u) => selectedPhones.has(u.phone));
  const somePageSelected = users.some((u) => selectedPhones.has(u.phone));

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedPhones(new Set());
      return;
    }
    setSelectedPhones(new Set(users.map((u) => u.phone)));
  };

  const toggleSelectOne = (phone) => {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const runBulkTable = async (action) => {
    const phones = [...selectedPhones];
    if (phones.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await api.bulk({ phones, action });
      if (res.success) {
        setSelectedPhones(new Set());
        lastLoadKeyRef.current = '';
        await fetchStats();
        await fetchUsers(viewAll ? 1 : page);
      } else {
        setListError(res.message || 'Bulk action failed.');
      }
    } catch {
      setListError('Bulk action failed.');
    }
    setBulkBusy(false);
  };

  const listLimit = viewAll ? ADMIN_VIEW_ALL_LIMIT : pageLimit;
  const totalPages = Math.max(1, Math.ceil(total / listLimit));

  return {
    api,
    stats,
    users,
    setUsers,
    total,
    page,
    setPage,
    viewAll,
    setViewAll,
    copyModalOpen,
    setCopyModalOpen,
    copyLoading,
    copyError,
    copyRecords,
    pageLimit,
    listLimit,
    totalPages,
    f,
    setF,
    searchInput,
    setSearchInput,
    loading,
    statsLoading,
    expandedPhone,
    setExpandedPhone,
    exporting,
    exportToast,
    listError,
    statsError,
    selectedPhones,
    bulkBusy,
    pickerOpen,
    setPickerOpen,
    moduleComboOpen,
    setModuleComboOpen,
    moduleSearch,
    setModuleSearch,
    moreOpen,
    setMoreOpen,
    handleRefresh,
    prepareCopyWebinarRows,
    handleExport,
    applyNewUsersToday,
    applyActiveToday,
    applyStatusChip,
    clearFilters,
    toggleStatus,
    toggleSort,
    allPageSelected,
    somePageSelected,
    toggleSelectAllPage,
    toggleSelectOne,
    runBulkTable,
    entranceDoneRef,
  };
}

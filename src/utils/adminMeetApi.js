import { getStoredToken } from './adminApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://guide-xpert-backend.vercel.app/api';

/**
 * Get Meet entries with optional filter and pagination
 * @param {string} filter - 'all', 'registered', 'joined', 'not-joined'
 * @param {string} search - search term for name, email, or mobile
 * @param {string} sortBy - field to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @param {number} page - page number (1-based)
 * @param {number} limit - items per page (default 50)
 */
export const getMeetEntries = async (filter = 'all', search = '', sortBy = 'registeredAt', sortOrder = 'desc', page = 1, limit = 50) => {
  try {
    const token = getStoredToken();
    const params = new URLSearchParams({ filter, search, sortBy, sortOrder, page: String(page), limit: String(limit) });

    const response = await fetch(`${API_BASE_URL}/meet/entries?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Failed to fetch meet entries');
      err.status = response.status;
      throw err;
    }

    return {
      success: true,
      data: data.data,
      count: data.count,
      totalCount: data.totalCount ?? data.count,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
      limit: data.limit ?? limit,
    };
  } catch (error) {
    console.error('Error fetching meet entries:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch meet entries',
      status: error.status,
      data: [],
      count: 0,
      totalCount: 0,
      page: 1,
      totalPages: 1,
      limit: 50,
    };
  }
};

/**
 * Get Meet statistics
 */
export const getMeetStats = async () => {
  try {
    const token = getStoredToken();

    const response = await fetch(`${API_BASE_URL}/meet/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Failed to fetch statistics');
      err.status = response.status;
      throw err;
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch statistics',
      status: error.status,
      data: {
        totalRegistered: 0,
        totalJoined: 0,
        notJoined: 0,
        joinRate: 0,
      },
    };
  }
};

/**
 * Export Meet entries to CSV
 */
export const exportMeetEntriesToCSV = (entries) => {
  if (!entries || entries.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['Name', 'Email', 'Mobile', 'Status', 'Registered At', 'Joined At', 'Time to Join (seconds)'];
  
  const csvRows = [
    headers.join(','),
    ...entries.map(entry => {
      const registeredAt = new Date(entry.registeredAt).toLocaleString();
      const joinedAt = entry.joinedAt ? new Date(entry.joinedAt).toLocaleString() : 'Not Joined';
      const timeToJoin = entry.joinedAt && entry.registeredAt 
        ? Math.floor((new Date(entry.joinedAt) - new Date(entry.registeredAt)) / 1000)
        : '';

      return [
        `"${entry.name}"`,
        `"${entry.email}"`,
        entry.mobile,
        entry.status,
        `"${registeredAt}"`,
        `"${joinedAt}"`,
        timeToJoin,
      ].join(',');
    }),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meet-attendance-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

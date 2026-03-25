/**
 * Public blog API (no auth). Base URL matches src/utils/api.js for dev proxy + production.
 */
const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_API_URL;
const productionOrigin = 'https://guide-xpert-backend.vercel.app';

function stripApiSuffix(url) {
  if (!url) return '';
  return url.replace(/\/api\/?$/, '');
}

// In dev/prod, call /api/blogs to avoid colliding with frontend /blogs route.
const API_BASE_URL = isDev ? '' : (stripApiSuffix(envUrl) || productionOrigin);

/** Normalize API document for UI (id + image alias). */
export function normalizeBlog(doc) {
  if (!doc) return null;
  const id = doc._id || doc.id;
  const coverImage = doc.coverImage || doc.image || '';
  const contentHtml = doc.contentHtml || doc.content || '';
  return {
    ...doc,
    id: String(id),
    image: coverImage,
    coverImage,
    contentHtml,
    content: contentHtml,
    contentJson: doc.contentJson || null,
  };
}

/**
 * @param {{ limit?: number }} [opts]
 * @returns {Promise<{ success: boolean; blogs?: object[]; message?: string }>}
 */
export async function fetchBlogs(opts = {}) {
  const { limit } = opts;
  const q = limit != null && limit > 0 ? `?limit=${encodeURIComponent(String(limit))}` : '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs${q}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Failed to load blogs (${res.status})`,
      };
    }
    const list = Array.isArray(data.data) ? data.data : [];
    return { success: true, blogs: list.map(normalizeBlog).filter(Boolean) };
  } catch (e) {
    return {
      success: false,
      message: e?.message || 'Network error loading blogs',
    };
  }
}

/**
 * @param {string} id
 */
export async function fetchBlogById(id) {
  if (!id) return { success: false, message: 'Missing id' };
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Blog not found (${res.status})`,
      };
    }
    return { success: true, blog: normalizeBlog(data.data) };
  } catch (e) {
    return {
      success: false,
      message: e?.message || 'Network error loading blog',
    };
  }
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function createBlog(payload, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload || {}),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      return { success: false, message: data.message || `Create failed (${res.status})`, status: res.status, data };
    }
    return { success: true, blog: normalizeBlog(data.data), status: res.status };
  } catch (e) {
    return { success: false, message: e?.message || 'Network error creating blog', status: 0 };
  }
}

export async function updateBlog(id, payload, token) {
  if (!id) return { success: false, message: 'Missing id', status: 0 };
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload || {}),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      return { success: false, message: data.message || `Update failed (${res.status})`, status: res.status, data };
    }
    return { success: true, blog: normalizeBlog(data.data), status: res.status };
  } catch (e) {
    return { success: false, message: e?.message || 'Network error updating blog', status: 0 };
  }
}

export async function deleteBlog(id, token) {
  if (!id) return { success: false, message: 'Missing id', status: 0 };
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      return { success: false, message: data.message || `Delete failed (${res.status})`, status: res.status, data };
    }
    return { success: true, status: res.status };
  } catch (e) {
    return { success: false, message: e?.message || 'Network error deleting blog', status: 0 };
  }
}

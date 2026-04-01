/**
 * Public blog API (no auth). Base URL matches src/utils/api.js for dev proxy + production.
 */
import { notifyAdminUnauthorized } from '../utils/authSession';

const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_API_URL;
const productionOrigin = 'https://guide-xpert-backend.vercel.app';

function stripApiSuffix(url) {
  if (!url) return '';
  // Normalize env values like:
  // - https://host/api
  // - https://host/api/
  // - https://host/api/api
  return url.replace(/(?:\/api)+\/?$/, '');
}

// In dev/prod, call /api/blogs to avoid colliding with frontend /blogs route.
const API_BASE_URL = isDev ? '' : (stripApiSuffix(envUrl) || productionOrigin);

function buildBlogUrl(pathname = '') {
  const cleanedPath = String(pathname || '').replace(/^\/+/, '');
  if (isDev) {
    return cleanedPath ? `/api/blogs/${cleanedPath}` : '/api/blogs';
  }
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const joined = cleanedPath
    ? `${normalizedBase}/api/blogs/${cleanedPath}`
    : `${normalizedBase}/api/blogs`;
  // Last-mile safety for misconfigured envs producing /api/api/blogs.
  return joined.replace(/\/api\/api\/blogs/g, '/api/blogs');
}

const FALLBACK_IMAGES = [
  'https://img.freepik.com/free-vector/collection-interracial-students-enjoying-life_1262-19751.jpg',
  'https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg'
];

function getFallbackImage(id) {
  const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

/** Normalize API document for UI (id + image alias). */
export function normalizeBlog(doc) {
  if (!doc) return null;
  const id = doc._id || doc.id;
  
  // We unconditionally force the newly requested Freepik vectors for all blogs, 
  // explicitly overriding any generic Cloudinary placeholders returned by the API.
  const coverImage = getFallbackImage(id);
  
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
    const res = await fetch(`${buildBlogUrl()}${q}`);
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
    const res = await fetch(buildBlogUrl(encodeURIComponent(id)));
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

function handleAdminUnauthorized(status) {
  if (status === 401) {
    notifyAdminUnauthorized({ endpoint: '/api/blogs', status: 401 });
  }
}

export async function createBlog(payload, token) {
  try {
    const res = await fetch(buildBlogUrl(), {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload || {}),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      handleAdminUnauthorized(res.status);
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
    const res = await fetch(buildBlogUrl(encodeURIComponent(id)), {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload || {}),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      handleAdminUnauthorized(res.status);
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
    const res = await fetch(buildBlogUrl(encodeURIComponent(id)), {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      handleAdminUnauthorized(res.status);
      return { success: false, message: data.message || `Delete failed (${res.status})`, status: res.status, data };
    }
    return { success: true, status: res.status };
  } catch (e) {
    return { success: false, message: e?.message || 'Network error deleting blog', status: 0 };
  }
}

import { API_BASE } from '../config';

// Get backend origin (strip trailing /api if present)
export function getBackendBase() {
  try {
    // If API_BASE is a full URL, remove the trailing "/api" segment
    const base = API_BASE.replace(/\/?api\/?$/i, '');
    return base;
  } catch (_) {
    return API_BASE;
  }
}

export function imageUrl(path) {
  if (!path) return '/placeholder.png';
  // Already absolute
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBackendBase();
  // Ensure single slash joining
  if (path.startsWith('/')) return base + path;
  return base + '/' + path;
}

export default { imageUrl, getBackendBase };

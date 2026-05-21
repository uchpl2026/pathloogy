/**
 * api.js  –  PathLab Pro API service
 * Base URL is controlled via .env → REACT_APP_API_BASE_URL
 */

const BASE = process.env.REACT_APP_API_BASE_URL;

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request('GET', '/dashboard'),
};

// ── Pathologies ───────────────────────────────────────────────────────────────
export const pathologiesAPI = {
  list:      ()         => request('GET',    '/pathologies'),
  listForLab: (lab)     => request('GET',    `/pathologies?lab=${encodeURIComponent(lab)}`),
  get:       (id)       => request('GET',    `/pathologies/${id}`),
  create:    (data)     => request('POST',   '/pathologies', data),
  update:    (id, d)    => request('PUT',    `/pathologies/${id}`, d),
  remove:    (id)       => request('DELETE', `/pathologies/${id}`),
};

// ── Collectors ────────────────────────────────────────────────────────────────
export const collectorsAPI = {
  list:   ()      => request('GET',    '/collectors'),
  get:    (id)    => request('GET',    `/collectors/${id}`),
  create: (data)  => request('POST',   '/collectors', data),
  update: (id, d) => request('PUT',    `/collectors/${id}`, d),
  remove: (id)    => request('DELETE', `/collectors/${id}`),
};

// ── Collection Orders ─────────────────────────────────────────────────────────
export const collectionOrdersAPI = {
  list:   ()      => request('GET',    '/collection-orders'),
  get:    (id)    => request('GET',    `/collection-orders/${id}`),
  create: (data)  => request('POST',   '/collection-orders', data),
  update: (id, d) => request('PUT',    `/collection-orders/${id}`, d),
  remove: (id)    => request('DELETE', `/collection-orders/${id}`),
};

// ── Labs ──────────────────────────────────────────────────────────────────────
export const labsAPI = {
  list:   ()      => request('GET',    '/labs'),
  get:    (id)    => request('GET',    `/labs/${id}`),
  create: (data)  => request('POST',   '/labs', data),
  update: (id, d) => request('PUT',    `/labs/${id}`, d),
  remove: (id)    => request('DELETE', `/labs/${id}`),
};

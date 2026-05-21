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
  list:   ()      => request('GET',    '/pathologies'),
  get:    (id)    => request('GET',    `/pathologies/${id}`),
  create: (data)  => request('POST',   '/pathologies', data),
  update: (id, d) => request('PUT',    `/pathologies/${id}`, d),
  remove: (id)    => request('DELETE', `/pathologies/${id}`),
};

// ── Collectors ────────────────────────────────────────────────────────────────
export const collectorsAPI = {
  list:   ()      => request('GET',    '/collectors'),
  get:    (id)    => request('GET',    `/collectors/${id}`),
  create: (data)  => request('POST',   '/collectors', data),
  update: (id, d) => request('PUT',    `/collectors/${id}`, d),
  remove: (id)    => request('DELETE', `/collectors/${id}`),
};

// ── Test Orders ───────────────────────────────────────────────────────────────
export const testOrdersAPI = {
  list:   ()      => request('GET',    '/test-orders'),
  get:    (id)    => request('GET',    `/test-orders/${id}`),
  create: (data)  => request('POST',   '/test-orders', data),
  update: (id, d) => request('PUT',    `/test-orders/${id}`, d),
  remove: (id)    => request('DELETE', `/test-orders/${id}`),
};

// ── Collection Orders ─────────────────────────────────────────────────────────
export const collectionOrdersAPI = {
  list:   ()      => request('GET',    '/collection-orders'),
  get:    (id)    => request('GET',    `/collection-orders/${id}`),
  create: (data)  => request('POST',   '/collection-orders', data),
  update: (id, d) => request('PUT',    `/collection-orders/${id}`, d),
  remove: (id)    => request('DELETE', `/collection-orders/${id}`),
};

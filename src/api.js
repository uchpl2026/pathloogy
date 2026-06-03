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
  changePassword: (userId, currentPassword, newPassword) =>
    request('POST', '/auth/change-password', { userId, currentPassword, newPassword }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request('GET', '/dashboard'),
};

// ── Pathologies ───────────────────────────────────────────────────────────────
export const pathologiesAPI = {
  list:       ()      => request('GET',    '/pathologies'),
  listForLab: (lab)   => request('GET',    `/pathologies?lab=${encodeURIComponent(lab)}`),
  get:        (id)    => request('GET',    `/pathologies/${id}`),
  create:     (data)  => request('POST',   '/pathologies', data),
  update:     (id, d) => request('PUT',    `/pathologies/${id}`, d),
  remove:     (id)    => request('DELETE', `/pathologies/${id}`),
};

// ── Collectors ────────────────────────────────────────────────────────────────
export const collectorsAPI = {
  list:       ()      => request('GET',    '/collectors'),
  listActive: ()      => request('GET',    '/collectors/active'),
  get:        (id)    => request('GET',    `/collectors/${id}`),
  create:     (data)  => request('POST',   '/collectors', data),
  update:     (id, d) => request('PUT',    `/collectors/${id}`, d),
  remove:     (id)    => request('DELETE', `/collectors/${id}`),
  // Test-rate assignments
  getTestRates:    (id)        => request('GET',    `/collectors/${id}/test-rates`),
  addTestRate:     (id, data)  => request('POST',   `/collectors/${id}/test-rates`, data),
  deleteTestRate:  (id, rid)   => request('DELETE', `/collectors/${id}/test-rates/${rid}`),
  // Patient rates for a specific collector + lab (used in CollectionOrderForm Step 2)
  getPatientRates: (id, labId) => request('GET',    `/collectors/${id}/patient-rates?lab_id=${labId}`),
};

// ── Collection Orders ─────────────────────────────────────────────────────────
export const collectionOrdersAPI = {
  list:   ()      => request('GET',    '/collection-orders'),
  get:    (id)    => request('GET',    `/collection-orders/${id}`),
  create: (data)  => request('POST',   '/collection-orders', data),
  update: (id, d) => request('PUT',    `/collection-orders/${id}`, d),
  remove: (id)    => request('DELETE', `/collection-orders/${id}`),
};

// ── Lab Payments ──────────────────────────────────────────────────────────────
export const labPaymentsAPI = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)).toString();
    return request('GET', `/lab-payments${qs ? '?' + qs : ''}`);
  },
  get:    (id)    => request('GET',    `/lab-payments/${id}`),
  create: (data)  => request('POST',   '/lab-payments', data),
  update: (id, d) => request('PUT',    `/lab-payments/${id}`, d),
  remove: (id)    => request('DELETE', `/lab-payments/${id}`),
};

// ── Labs ──────────────────────────────────────────────────────────────────────
export const labsAPI = {
  list:     ()      => request('GET',    '/labs'),
  get:      (id)    => request('GET',    `/labs/${id}`),
  getTests: (id)    => request('GET',    `/labs/${id}/tests`),
  create:   (data)  => request('POST',   '/labs', data),
  update:   (id, d) => request('PUT',    `/labs/${id}`, d),
  remove:   (id)    => request('DELETE', `/labs/${id}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsAPI = {
  get: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''))
    ).toString();
    return request('GET', `/reports${qs ? '?' + qs : ''}`);
  },
  collectors: () => request('GET', '/reports/collectors'),
  labs:        () => request('GET', '/reports/labs'),
};

// ── Payment Report ─────────────────────────────────────────────────────────────
export const paymentReportAPI = {
  generate: (filters = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    ).toString();
    return request('GET', `/payment-report${qs ? '?' + qs : ''}`);
  },
  labs: () => request('GET', '/payment-report/labs'),
};

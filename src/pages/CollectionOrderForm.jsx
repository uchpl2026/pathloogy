import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collectionOrdersAPI, labsAPI, collectorsAPI } from '../api';

const BLANK = {
  patient:         '',
  patient_phone:   '',
  patient_email:   '',
  address:         '',
  billed_amount:   '',
  amount_received: '',
  payment_status:  'Not Paid',
  payment_date:    '',
  test_date:       '',
  lab_name:        '',
  lab_tests:       [],
  collector:       '',
  tests:           [],
  scheduled:       '',
  status:          'Scheduled',
};

function parseJSON(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

/* ── Small pill to show a selected test ─────────────────────────────────── */
function TestPill({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, padding: '3px 10px', borderRadius: 20,
      background: 'var(--accent-light, #eff6ff)',
      color: 'var(--accent, #2563eb)',
      border: '1px solid var(--accent-border, #bfdbfe)',
      fontWeight: 500,
    }}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
                   padding: 0, lineHeight: 1, color: 'inherit', display: 'flex' }}
          aria-label={`Remove ${label}`}
        >
          <i className="ti ti-x" style={{ fontSize: 11 }} />
        </button>
      )}
    </span>
  );
}

/* ── Section header helper ───────────────────────────────────────────────── */
function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      borderRadius: '10px 10px 0 0',
    }}>
      <i className={`ti ${icon}`} style={{ color: 'var(--accent)', fontSize: 15 }} />
      <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
    </div>
  );
}

function Section({ icon, title, children, style }) {
  return (
    <div style={{
      marginTop: 20,
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      ...style,
    }}>
      <SectionHeader icon={icon} title={title} />
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function CollectionOrderForm({ rows, setRows }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]               = useState(BLANK);
  const [labs, setLabs]               = useState([]);
  const [activeCollectors, setActiveCollectors] = useState([]);
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);

  /* ── Load labs + active collectors on mount ─────────────────────────── */
  useEffect(() => {
    setLoading(true);
    Promise.all([labsAPI.list(), collectorsAPI.listActive()])
      .then(([labList, colList]) => {
        setLabs(labList);
        setActiveCollectors(colList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Load form when editing ─────────────────────────────────────────── */
  useEffect(() => {
    if (editing) {
      const existing = rows.find(r => String(r.id) === String(id));
      const hydrate = data => setForm({
        ...BLANK,
        ...data,
        tests:     parseJSON(data.tests),
        lab_tests: parseJSON(data.lab_tests),
      });
      if (existing) {
        hydrate(existing);
      } else {
        collectionOrdersAPI.get(id)
          .then(hydrate)
          .catch(() => navigate('/collection-orders', { replace: true }));
      }
    } else {
      setForm({ ...BLANK });
    }
  }, [editing, id]); // eslint-disable-line

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* ── Derived: tests available for selected lab ──────────────────────── */
  const selectedLab = useMemo(
    () => labs.find(l => l.name === form.lab_name) || null,
    [labs, form.lab_name]
  );

  const labTestOptions = useMemo(
    () => (selectedLab ? (selectedLab.available_tests || []) : []),
    [selectedLab]
  );

  const selectedLabTests = parseJSON(form.lab_tests);

  const toggleLabTest = (testName) => {
    setForm(f => {
      const current = parseJSON(f.lab_tests);
      const next = current.includes(testName)
        ? current.filter(t => t !== testName)
        : [...current, testName];
      return { ...f, lab_tests: next };
    });
  };

  /* ── Save ───────────────────────────────────────────────────────────── */
  const save = async () => {
    setError('');
    if (!form.patient.trim())    { setError('Patient name is required.');      return; }
    if (!form.collector)          { setError('Please select a collector.');     return; }
    if (!form.lab_name)           { setError('Please select a lab.');           return; }
    if (selectedLabTests.length === 0) { setError('Please select at least one test.'); return; }

    setBusy(true);
    try {
      const payload = { ...form, lab_tests: selectedLabTests, tests: selectedLabTests };
      if (editing) {
        const updated = await collectionOrdersAPI.update(form.id, payload);
        setRows(prev => prev.map(item => item.id === updated.id ? updated : item));
      } else {
        const created = await collectionOrdersAPI.create(payload);
        setRows(prev => [...prev, created]);
      }
      navigate('/collection-orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="page-panel">
      <div className="page-header">
        <div>
          <h1>{editing ? 'Edit Collection Order' : 'Add Collection Order'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing ? 'Update the order details before saving.' : 'Fill in collection order details below.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/collection-orders')}>
          Back to Collection Orders
        </button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* ══ SECTION 1: Patient Details ═══════════════════════════════════ */}
        <Section icon="ti-user" title="Patient Details">
          {/* Row 1: Name + Phone */}
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">
                Patient Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="form-input"
                value={form.patient}
                onChange={e => set('patient', e.target.value)}
                placeholder="Full patient name"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Patient Phone</label>
              <input
                className="form-input"
                value={form.patient_phone}
                onChange={e => set('patient_phone', e.target.value)}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>

          {/* Row 2: Email (full width) */}
          <div className="form-row" style={{ marginTop: 14 }}>
            <label className="form-label">Patient Email</label>
            <input
              className="form-input"
              type="email"
              value={form.patient_email}
              onChange={e => set('patient_email', e.target.value)}
              placeholder="patient@example.com"
            />
          </div>

          {/* Row 3: Address (full width) */}
          <div className="form-row" style={{ marginTop: 14 }}>
            <label className="form-label">Patient Address</label>
            <textarea
              className="form-textarea"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Full collection address"
              rows={2}
            />
          </div>
        </Section>

        {/* ══ SECTION 2: Payment Details ════════════════════════════════════ */}
        <Section icon="ti-currency-rupee" title="Payment Details">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Billed Amount (₹)</label>
              <input
                className="form-input"
                value={form.billed_amount}
                onChange={e => set('billed_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Amount Received (₹)</label>
              <input
                className="form-input"
                value={form.amount_received}
                onChange={e => set('amount_received', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-row">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={form.payment_status}
                onChange={e => set('payment_status', e.target.value)}
              >
                <option value="Not Paid">Not Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Full Paid">Full Paid</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Date of Payment</label>
              <input
                className="form-input"
                type="date"
                value={form.payment_date}
                onChange={e => set('payment_date', e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ══ SECTION 3: Lab & Test Selection ══════════════════════════════ */}
        <Section icon="ti-flask" title="Lab & Test Selection">
          {/* Row 1: Test Date */}
          <div className="form-row" style={{ marginBottom: 14 }}>
            <label className="form-label">Test Date</label>
            <input
              className="form-input"
              type="date"
              value={form.test_date}
              onChange={e => set('test_date', e.target.value)}
              style={{ maxWidth: 220 }}
            />
          </div>

          {/* Step 1: Select Lab */}
          <div className="form-row">
            <label className="form-label">
              <i className="ti ti-building-hospital" style={{ marginRight: 5, fontSize: 12 }} />
              Step 1 — Select Lab
            </label>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                            border: '1px solid var(--border)', borderRadius: 6,
                            color: 'var(--text-secondary)', fontSize: 13 }}>
                <i className="ti ti-loader-2 spin" /> Loading labs…
              </div>
            ) : (
              <select
                className="form-select"
                value={form.lab_name}
                onChange={e => {
                  set('lab_name', e.target.value);
                  setForm(f => ({ ...f, lab_name: e.target.value, lab_tests: [] }));
                }}
              >
                <option value="">— Choose a lab —</option>
                {labs.filter(l => l.status === 'Active').map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Select Tests for chosen lab */}
          {form.lab_name && (
            <div style={{ marginTop: 16 }}>
              {/* Selected tests summary */}
              {selectedLabTests.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                                marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Selected Tests ({selectedLabTests.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedLabTests.map(t => (
                      <TestPill key={t} label={t} onRemove={() => toggleLabTest(t)} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                            marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <i className="ti ti-checkbox" style={{ marginRight: 4 }} />
                Step 2 — Available Tests in {form.lab_name}
              </div>

              {labTestOptions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  No tests configured for this lab. Add tests in Lab Management.
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 10,
                }}>
                  {labTestOptions.map(t => {
                    const checked = selectedLabTests.includes(t.test_name);
                    return (
                      <label
                        key={t.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 14px', borderRadius: 8,
                          border: `1.5px solid ${checked ? 'var(--accent, #2563eb)' : 'var(--border)'}`,
                          background: checked ? 'var(--accent-light, #eff6ff)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'border-color .15s, background .15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLabTest(t.test_name)}
                          style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{t.test_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3,
                                        display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                            {t.deposit_amount && <span>Deposit: ₹{t.deposit_amount}</span>}
                            {t.patient_cost   && <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Patient: ₹{t.patient_cost}</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!form.lab_name && !loading && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-arrow-up" style={{ fontSize: 14 }} />
              Select a lab above to see available tests.
            </p>
          )}
        </Section>

        {/* ══ SECTION 4: Collector & Schedule ═══════════════════════════════ */}
        <Section icon="ti-user-check" title="Collector & Schedule">
          {/* Collector dropdown – active collectors only */}
          <div className="form-row">
            <label className="form-label">
              Collector <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                            border: '1px solid var(--border)', borderRadius: 6,
                            color: 'var(--text-secondary)', fontSize: 13 }}>
                <i className="ti ti-loader-2 spin" /> Loading collectors…
              </div>
            ) : activeCollectors.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: 13 }}>
                No active collectors found. Please add collectors first.
              </p>
            ) : (
              <select
                className="form-select"
                value={form.collector}
                onChange={e => set('collector', e.target.value)}
              >
                <option value="">— Select collector —</option>
                {activeCollectors.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}{c.phone ? ` — ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Scheduled + Status */}
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-row">
              <label className="form-label">Scheduled Date &amp; Time</label>
              <input
                className="form-input"
                value={form.scheduled}
                onChange={e => set('scheduled', e.target.value)}
                placeholder="DD Mon YYYY, HH:MM AM"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Order Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option>Scheduled</option>
                <option>In Transit</option>
                <option>Collected</option>
                <option>Failed</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ══ Actions ════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/collection-orders')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy
              ? <><i className="ti ti-loader-2 spin" /> Saving…</>
              : editing ? 'Save Changes' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

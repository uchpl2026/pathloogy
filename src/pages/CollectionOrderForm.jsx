import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collectionOrdersAPI, labsAPI, collectorsAPI } from '../api';

/* Returns today as YYYY-MM-DD in local time */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const BLANK = {
  patient:         '',
  patient_phone:   '',
  patient_email:   '',
  doctor_name:     '',
  doctor_phone:    '',
  address:         '',
  billed_amount:   '',
  amount_received: '',
  payment_status:  'Not Paid',
  payment_date:    '',
  test_date:       todayISO(),
  lab_name:        '',
  lab_tests:       [],
  collector:       '',
  tests:           [],
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

/* ── Searchable multi-select for tests ──────────────────────────────────── */
function TestMultiSelect({ options, selected, onToggle }) {
  const [search, setSearch]     = React.useState('');
  const [open, setOpen]         = React.useState(false);
  const [dropRect, setDropRect] = React.useState(null);
  const triggerRef              = React.useRef(null);
  const searchRef               = React.useRef(null);
  const containerRef            = React.useRef(null);

  /* Recalculate trigger position whenever dropdown opens */
  React.useEffect(() => {
    if (open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropRect({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
      /* Auto-focus the search input inside the dropdown */
      setTimeout(() => searchRef.current && searchRef.current.focus(), 30);
    } else {
      setSearch('');
    }
  }, [open]);

  /* Close when clicking outside */
  React.useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        /* Also check the portal dropdown which is outside containerRef */
        const dropdown = document.getElementById('test-multiselect-dropdown');
        if (dropdown && dropdown.contains(e.target)) return;
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(t =>
    t.test_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef}>
      {/* ── Trigger box: shows pills + chevron only ── */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={{
          minHeight: 42,
          border: `1.5px solid ${open ? 'var(--accent, #2563eb)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '6px 36px 6px 10px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5,
          cursor: 'pointer',
          background: 'var(--bg-primary, #fff)',
          transition: 'border-color .15s',
          boxShadow: open ? '0 0 0 3px var(--accent-light, #eff6ff)' : 'none',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            — Select tests —
          </span>
        ) : (
          selected.map(name => (
            <TestPill
              key={name}
              label={name}
              onRemove={e => { e.stopPropagation(); onToggle(name); }}
            />
          ))
        )}
        {/* Chevron pinned to right */}
        <i
          className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--text-secondary)', pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Portal dropdown with sticky search bar ── */}
      {open && dropRect && (
        <div
          id="test-multiselect-dropdown"
          onMouseDown={e => e.preventDefault()}
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: dropRect.top,
            left: dropRect.left,
            width: dropRect.width,
            border: '1.5px solid var(--accent, #2563eb)',
            borderRadius: 8,
            background: 'var(--bg-primary, #fff)',
            boxShadow: '0 8px 28px rgba(0,0,0,.13)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 320,
            overflow: 'hidden',
          }}
        >
          {/* Sticky search bar */}
          <div style={{
            padding: '8px 10px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-primary, #fff)',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tests…"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, flex: 1, color: 'var(--text-primary)',
              }}
            />
            {search && (
              <button
                onMouseDown={e => { e.preventDefault(); setSearch(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                         padding: 0, display: 'flex', color: 'var(--text-secondary)' }}
              >
                <i className="ti ti-x" style={{ fontSize: 13 }} />
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                No tests match "{search}"
              </div>
            ) : (
              filtered.map(t => {
                const checked = selected.includes(t.test_name);
                return (
                  <div
                    key={t.id}
                    onMouseDown={e => { e.preventDefault(); onToggle(t.test_name); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: checked ? 'var(--accent-light, #eff6ff)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = checked ? 'var(--accent-light, #eff6ff)' : 'transparent'; }}
                  >
                    {/* Custom checkbox */}
                    <div style={{
                      width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${checked ? 'var(--accent, #2563eb)' : 'var(--border)'}`,
                      background: checked ? 'var(--accent, #2563eb)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                      {checked && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>
                        {t.test_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2,
                                    display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                        {t.deposit_amount && <span>Deposit: ₹{t.deposit_amount}</span>}
                        {t.patient_cost && (
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            Patient: ₹{t.patient_cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: count + clear */}
          {selected.length > 0 && (
            <div style={{
              padding: '7px 14px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {selected.length} test{selected.length > 1 ? 's' : ''} selected
              </span>
              <button
                onMouseDown={e => { e.preventDefault(); selected.forEach(n => onToggle(n)); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                         fontSize: 12, color: 'var(--danger)', padding: 0 }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Count badge below trigger when closed */}
      {!open && selected.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          {selected.length} test{selected.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
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

function Section({ icon, title, children, style, bodyStyle }) {
  return (
    <div style={{
      marginTop: 20,
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      ...style,
    }}>
      <SectionHeader icon={icon} title={title} />
      <div style={{ padding: 16, ...bodyStyle }}>{children}</div>
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

  /* ── Helper: compute billed amount from selected test names ────────── */
  const calcBilledAmount = (selectedNames, testOptions) => {
    const total = selectedNames.reduce((sum, name) => {
      const t = testOptions.find(o => o.test_name === name);
      const cost = t && t.patient_cost ? parseFloat(t.patient_cost) : 0;
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    return total > 0 ? String(total) : '';
  };

  const toggleLabTest = (testName) => {
    setForm(f => {
      const current = parseJSON(f.lab_tests);
      const next = current.includes(testName)
        ? current.filter(t => t !== testName)
        : [...current, testName];
      const newBilled = calcBilledAmount(next, labTestOptions);
      return { ...f, lab_tests: next, billed_amount: newBilled };
    });
  };

  /* ── Save ───────────────────────────────────────────────────────────── */
  const save = async () => {
    setError('');
    if (!form.patient.trim())         { setError('Patient name is required.');      return; }
    if (!form.collector)              { setError('Please select a collector.');     return; }
    if (!form.lab_name)               { setError('Please select a lab.');           return; }
    if (selectedLabTests.length === 0){ setError('Please select at least one test.'); return; }

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

        {/* ══ SECTION 1: Collector ══════════════════════════════════════════ */}
        <Section icon="ti-user-check" title="Collector">
          <div className="form-grid">
            {/* Test Date */}
            <div className="form-row">
              <label className="form-label">Test Date</label>
              <input
                className="form-input"
                type="date"
                value={form.test_date}
                onChange={e => set('test_date', e.target.value)}
              />
            </div>
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
          </div>
        </Section>

        {/* ══ SECTION 2: Lab Selection (Step 1 only) ════════════════════════ */}
        <Section icon="ti-flask" title="Lab & Test Selection">
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
                  setForm(f => ({ ...f, lab_name: e.target.value, lab_tests: [], billed_amount: '' }));
                }}
              >
                <option value="">— Choose a lab —</option>
                {labs.filter(l => l.status === 'Active').map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
          {!form.lab_name && !loading && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-arrow-down" style={{ fontSize: 14 }} />
              Select a lab above, then fill patient details and choose tests below.
            </p>
          )}
        </Section>

        {/* ══ SECTION 3: Patient Details ════════════════════════════════════ */}
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

          {/* Row 2: Email + Address */}
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-row">
              <label className="form-label">Patient Email</label>
              <input
                className="form-input"
                type="email"
                value={form.patient_email}
                onChange={e => set('patient_email', e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Patient Address</label>
              <textarea
                className="form-textarea"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Full collection address"
                rows={2}
              />
            </div>
          </div>

          {/* Row 3: Doctor Name + Doctor Phone */}
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-row">
              <label className="form-label">Doctor Name</label>
              <input
                className="form-input"
                value={form.doctor_name}
                onChange={e => set('doctor_name', e.target.value)}
                placeholder="Referring doctor name"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Doctor Phone</label>
              <input
                className="form-input"
                value={form.doctor_phone}
                onChange={e => set('doctor_phone', e.target.value)}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>
        </Section>

        {/* ══ SECTION 4: Available Tests (Step 2) — searchable multi-select ══ */}
        {form.lab_name && (
          <Section icon="ti-checkbox" title={`Step 2 — Available Tests in ${form.lab_name}`}>
            {labTestOptions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                No tests configured for this lab. Add tests in Lab Management.
              </p>
            ) : (
              <TestMultiSelect
                options={labTestOptions}
                selected={selectedLabTests}
                onToggle={toggleLabTest}
              />
            )}
          </Section>
        )}

        {/* ══ SECTION 5: Payment Details ════════════════════════════════════ */}
        <Section icon="ti-currency-rupee" title="Payment Details">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">
                Billed Amount (₹)
                <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>
                  (auto-calculated from tests)
                </span>
              </label>
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

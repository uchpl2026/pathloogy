import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collectionOrdersAPI, pathologiesAPI } from '../api';

const BLANK = {
  patient: '',
  collector: '',
  tests: [],
  address: '',
  scheduled: '',
  status: 'Scheduled',
};

function parseTests(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

// Pill badge for a test code
function TestPill({ code, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, padding: '3px 10px', borderRadius: 20,
      background: 'var(--accent-light, #eff6ff)',
      color: 'var(--accent, #2563eb)',
      border: '1px solid var(--accent-border, #bfdbfe)',
      fontWeight: 500,
    }}>
      {code}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit', display: 'flex' }}
          aria-label={`Remove ${code}`}
        >
          <i className="ti ti-x" style={{ fontSize: 11 }} />
        </button>
      )}
    </span>
  );
}

export default function CollectionOrderForm({ rows, collectors, setRows }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]             = useState(BLANK);
  const [allPathologies, setAllPathologies] = useState([]);   // all pathology records
  const [selectedPathology, setSelectedPathology] = useState(''); // selected category/group
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState('');
  const [loadingTests, setLoadingTests] = useState(false);

  // Load all pathologies once
  useEffect(() => {
    setLoadingTests(true);
    pathologiesAPI.list()
      .then(setAllPathologies)
      .catch(console.error)
      .finally(() => setLoadingTests(false));
  }, []);

  // Load form when editing
  useEffect(() => {
    if (editing) {
      const existing = rows.find(r => String(r.id) === String(id));
      if (existing) {
        setForm({ ...existing, tests: parseTests(existing.tests) });
      } else {
        collectionOrdersAPI.get(id)
          .then(data => setForm({ ...data, tests: parseTests(data.tests) }))
          .catch(() => navigate('/collection-orders', { replace: true }));
      }
    } else {
      setForm({ ...BLANK, collector: collectors?.[0]?.name || '' });
    }
  }, [editing, id]); // eslint-disable-line

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // Unique pathology categories derived from all pathologies
  const pathologyGroups = useMemo(() => {
    const seen = new Set();
    return allPathologies
      .filter(p => p.status === 'Active')
      .reduce((acc, p) => {
        if (!seen.has(p.category)) {
          seen.add(p.category);
          acc.push({ category: p.category });
        }
        return acc;
      }, []);
  }, [allPathologies]);

  // Tests available under the currently-selected pathology group
  const testsForSelectedPathology = useMemo(() => {
    if (!selectedPathology) return [];
    return allPathologies.filter(p => p.category === selectedPathology && p.status === 'Active');
  }, [allPathologies, selectedPathology]);

  const selectedTests = parseTests(form.tests);

  const toggleTest = (code) => {
    setForm(f => {
      const current = parseTests(f.tests);
      const next = current.includes(code)
        ? current.filter(c => c !== code)
        : [...current, code];
      return { ...f, tests: next };
    });
  };

  const removeTest = (code) => {
    setForm(f => ({ ...f, tests: parseTests(f.tests).filter(c => c !== code) }));
  };

  const save = async () => {
    setError('');
    if (!form.patient.trim()) { setError('Patient name is required.'); return; }
    if (!form.collector)      { setError('Please select a collector.'); return; }
    if (selectedTests.length === 0) { setError('Please select at least one test.'); return; }

    setBusy(true);
    try {
      const payload = { ...form, tests: selectedTests };
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

  return (
    <div className="page-panel">
      <div className="page-header">
        <div>
          <h1>{editing ? 'Edit Collection Order' : 'Add Collection Order'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing ? 'Update the order details before saving.' : 'Fill in collection order details on this page.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/collection-orders')}>Back to Collection Orders</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* ── Patient & Collector ── */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Patient Name</label>
            <input
              className="form-input"
              value={form.patient}
              onChange={e => updateField('patient', e.target.value)}
              placeholder="Patient name"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Collector / Lab</label>
            <select
              className="form-select"
              value={form.collector}
              onChange={e => {
                updateField('collector', e.target.value);
                updateField('tests', []);
                setSelectedPathology('');
              }}
            >
              {collectors.map(c => (
                <option key={c.id} value={c.name}>{c.name} — {c.zone}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Test Selection: Step 1 – pick pathology group ── */}
        <div style={{
          marginTop: 20,
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-test-pipe" style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Test Selection</span>
            {selectedTests.length > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 500,
                padding: '2px 10px', borderRadius: 20,
                background: 'var(--accent-light, #eff6ff)',
                color: 'var(--accent, #2563eb)',
                border: '1px solid var(--accent-border, #bfdbfe)',
              }}>
                {selectedTests.length} selected
              </span>
            )}
          </div>

          <div style={{ padding: 16 }}>
            {/* Selected tests summary */}
            {selectedTests.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Selected Tests
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedTests.map(code => {
                    const p = allPathologies.find(x => x.code === code);
                    return (
                      <TestPill
                        key={code}
                        code={p ? `${p.name} (${code})` : code}
                        onRemove={() => removeTest(code)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Select Pathology */}
            <div className="form-grid" style={{ alignItems: 'flex-end' }}>
              <div className="form-row" style={{ margin: 0 }}>
                <label className="form-label">
                  <i className="ti ti-filter" style={{ marginRight: 4, fontSize: 12 }} />
                  Step 1 — Select Pathology
                </label>
                {loadingTests ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <i className="ti ti-loader-2 spin" /> Loading pathologies…
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedPathology}
                    onChange={e => setSelectedPathology(e.target.value)}
                  >
                    <option value="">— Choose a pathology —</option>
                    {pathologyGroups.map(g => (
                      <option key={g.category} value={g.category}>{g.category}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Step 2: Select Tests for chosen pathology */}
            {selectedPathology && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <i className="ti ti-checkbox" style={{ marginRight: 4 }} />
                  Step 2 — Available Tests in {selectedPathology}
                </div>

                {testsForSelectedPathology.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No active tests in this category.</p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 10,
                  }}>
                    {testsForSelectedPathology.map(p => {
                      const checked = selectedTests.includes(p.code);
                      return (
                        <label
                          key={p.code}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1.5px solid ${checked ? 'var(--accent, #2563eb)' : 'var(--border)'}`,
                            background: checked ? 'var(--accent-light, #eff6ff)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            transition: 'border-color .15s, background .15s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTest(p.code)}
                            style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                              <span><code style={{ fontSize: 10 }}>{p.code}</code></span>
                              {p.clientCode && <span>Client: <code style={{ fontSize: 10 }}>{p.clientCode}</code></span>}
                              <span>{p.turnaround}</span>
                              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.price}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!selectedPathology && !loadingTests && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-arrow-up" style={{ fontSize: 14 }} />
                Select a pathology above to see available tests.
              </p>
            )}
          </div>
        </div>

        {/* ── Address & Schedule ── */}
        <div className="form-row" style={{ marginTop: 16 }}>
          <label className="form-label">Patient Address</label>
          <textarea
            className="form-textarea"
            value={form.address}
            onChange={e => updateField('address', e.target.value)}
            placeholder="Full collection address"
          />
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Scheduled Date &amp; Time</label>
            <input
              className="form-input"
              value={form.scheduled}
              onChange={e => updateField('scheduled', e.target.value)}
              placeholder="DD Mon YYYY, HH:MM AM"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => updateField('status', e.target.value)}>
              <option>Scheduled</option>
              <option>In Transit</option>
              <option>Collected</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/collection-orders')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? <><i className="ti ti-loader-2 spin" /> Saving…</> : editing ? 'Save Changes' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

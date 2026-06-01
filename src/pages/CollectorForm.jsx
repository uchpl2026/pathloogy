import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { collectorsAPI, labsAPI } from '../api';

/* ─────────────────────────────────────────────────────────────────────────────
   Portal dropdown — renders below an anchor, escapes overflow:hidden
───────────────────────────────────────────────────────────────────────────── */
function DropdownPortal({ anchorRef, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  useLayoutEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}>
      {children}
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SingleSelectDropdown — searchable, portal-based
───────────────────────────────────────────────────────────────────────────── */
function SingleSelectDropdown({
  options = [], value = '', onChange,
  placeholder = 'Select…', labelKey = 'name', valueKey = 'id',
  subKey, disabled = false, label = 'options',
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef           = useRef(null);
  const anchorRef         = useRef(null);
  const searchRef         = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target) &&
          !e.target.closest('[data-ssdd-portal]'))
        { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const selectedOption = options.find(o => String(o[valueKey]) === String(value));
  const filtered = query.trim()
    ? options.filter(o => o[labelKey].toLowerCase().includes(query.toLowerCase()) ||
        (subKey && o[subKey] && String(o[subKey]).toLowerCase().includes(query.toLowerCase())))
    : options;

  const select = val => { onChange(val === value ? '' : val); setOpen(false); setQuery(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', opacity: disabled ? 0.5 : 1 }}>
      <div ref={anchorRef} onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', height: 38, padding: '0 36px 0 10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid var(--border)', borderRadius: 6,
          background: 'var(--input-bg, var(--card-bg))', userSelect: 'none',
          boxSizing: 'border-box', position: 'relative',
        }}
      >
        {selectedOption ? (
          <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption[labelKey]}
            {subKey && selectedOption[subKey] && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 6 }}>
                ({selectedOption[subKey]})
              </span>
            )}
          </span>
        ) : (
          <span style={{ flex: 1, color: 'var(--text-secondary)', fontSize: 14 }}>{placeholder}</span>
        )}
        {selectedOption && !disabled && (
          <span onClick={e => { e.stopPropagation(); onChange(''); }}
            style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
                     fontSize: 16, color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px' }}>
            ×
          </span>
        )}
        <span style={{ position: 'absolute', right: 10, top: '50%',
                       transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
                       transition: 'transform 0.15s', fontSize: 11, color: 'var(--text-secondary)' }}>▼</span>
      </div>

      {open && !disabled && (
        <DropdownPortal anchorRef={anchorRef}>
          <div data-ssdd-portal="true"
            style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)',
                     borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }} />
              <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${label}…`}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13,
                         background: 'transparent', color: 'var(--text)' }} />
              {query && <span onClick={() => setQuery('')}
                style={{ cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }}>×</span>}
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  No results for "{query}"
                </div>
              ) : filtered.map(o => {
                const val = String(o[valueKey]);
                const sel = val === String(value);
                return (
                  <div key={val} onClick={() => select(val)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                             cursor: 'pointer', fontSize: 14,
                             background: sel ? 'var(--primary-light, rgba(59,130,246,0.10))' : 'transparent',
                             transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.04))'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = sel ? 'var(--primary-light, rgba(59,130,246,0.10))' : 'transparent'; }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                   border: `2px solid ${sel ? 'var(--primary, #3b82f6)' : 'var(--border)'}`,
                                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sel && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary, #3b82f6)' }} />}
                    </span>
                    <span style={{ flex: 1 }}>{o[labelKey]}</span>
                    {subKey && o[subKey] && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o[subKey]}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </DropdownPortal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────────────────────────────────────── */
function Section({ icon, title, children }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                    background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <i className={`ti ${icon}`} style={{ color: 'var(--accent)', fontSize: 15 }} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CollectorTestRateSection — shown only when editing an existing collector
───────────────────────────────────────────────────────────────────────────── */
function CollectorTestRateSection({ collectorId }) {
  const [allLabs, setAllLabs]           = useState([]);
  const [selLab, setSelLab]             = useState('');
  const [labTests, setLabTests]         = useState([]);
  const [selTest, setSelTest]           = useState('');
  const [patientRate, setPatientRate]   = useState('');
  const [savedRates, setSavedRates]     = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState({ type: '', text: '' });

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3500); };

  /* Load labs + existing rates on mount */
  useEffect(() => {
    labsAPI.list().then(setAllLabs).catch(() => {});
    setLoadingRates(true);
    collectorsAPI.getTestRates(collectorId)
      .then(setSavedRates)
      .catch(() => setSavedRates([]))
      .finally(() => setLoadingRates(false));
  }, [collectorId]);

  /* Load tests when lab changes */
  useEffect(() => {
    setLabTests([]); setSelTest(''); setPatientRate('');
    if (!selLab) return;
    setLoadingTests(true);
    labsAPI.getTests(selLab)
      .then(t => setLabTests(Array.isArray(t) ? t : []))
      .catch(() => setLabTests([]))
      .finally(() => setLoadingTests(false));
  }, [selLab]);

  /* Pre-fill patient_rate from lab test default when test is chosen */
  useEffect(() => {
    if (!selTest) { setPatientRate(''); return; }
    const t = labTests.find(t => String(t.id) === String(selTest));
    if (t && t.patient_cost) setPatientRate(String(t.patient_cost));
    else setPatientRate('');
  }, [selTest]); // eslint-disable-line

  const selectedTest = labTests.find(t => String(t.id) === String(selTest));

  const handleAdd = async () => {
    if (!selTest) { flash('error', 'Please select a test.'); return; }
    if (!selLab)  { flash('error', 'Please select a lab.'); return; }
    setSaving(true);
    try {
      const rates = await collectorsAPI.addTestRate(collectorId, {
        lab_id:       Number(selLab),
        test_id:      Number(selTest),
        patient_rate: patientRate,
      });
      setSavedRates(rates);
      setSelTest(''); setPatientRate('');
      flash('success', 'Test rate assigned successfully.');
    } catch (e) {
      flash('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rateId) => {
    try {
      await collectorsAPI.deleteTestRate(collectorId, rateId);
      setSavedRates(prev => prev.filter(r => r.id !== rateId));
    } catch (e) {
      flash('error', e.message);
    }
  };

  return (
    <Section icon="ti-clipboard-plus" title="Test Rate Assignment">
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
        Choose a lab and one of its tests, then set the patient rate for this collector.
      </p>

      {msg.text && (
        <div style={{
          marginBottom: 14, padding: '9px 14px', borderRadius: 7, fontSize: 13,
          background: msg.type === 'success' ? 'var(--success-light, #f0fdf4)' : 'var(--danger-light, #fff1f2)',
          color: msg.type === 'success' ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)',
          border: `1px solid ${msg.type === 'success' ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)'}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
          {msg.text}
        </div>
      )}

      {/* Lab + Test + Rate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: 12, alignItems: 'end', marginBottom: 16 }}>
        <div>
          <label className="form-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-building-hospital" style={{ fontSize: 13, color: 'var(--accent)' }} /> Lab
          </label>
          <SingleSelectDropdown
            label="labs" options={allLabs} value={selLab} onChange={setSelLab}
            placeholder="Select a lab…" labelKey="name" valueKey="id" subKey="my_lab_code"
          />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-flask" style={{ fontSize: 13, color: 'var(--accent)' }} /> Test
            {loadingTests && <i className="ti ti-loader-2 spin" style={{ fontSize: 12 }} />}
          </label>
          <SingleSelectDropdown
            label="tests" options={labTests} value={selTest} onChange={setSelTest}
            placeholder={selLab ? (labTests.length ? 'Select a test…' : 'No tests for this lab') : 'Select a lab first…'}
            labelKey="test_name" valueKey="id"
            disabled={!selLab || labTests.length === 0}
          />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-currency-rupee" style={{ fontSize: 13, color: 'var(--accent)' }} /> Patient Rate (₹)
          </label>
          <input
            type="number" min="0" step="0.01" className="form-input"
            value={patientRate} onChange={e => setPatientRate(e.target.value)}
            placeholder={selectedTest?.patient_cost ? `Default: ₹${selectedTest.patient_cost}` : 'Enter rate'}
            disabled={!selTest} style={{ opacity: selTest ? 1 : 0.5 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={handleAdd}
          disabled={saving || !selTest}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saving ? <><i className="ti ti-loader-2 spin" /> Saving…</> : <><i className="ti ti-plus" /> Assign Test Rate</>}
        </button>
      </div>

      {/* Saved rates table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <i className="ti ti-list-check" style={{ color: 'var(--accent)', fontSize: 14 }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            Assigned Tests
            {savedRates.length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--accent)', color: '#fff',
                             borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                {savedRates.length}
              </span>
            )}
          </span>
        </div>

        {loadingRates ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, padding: 10 }}>
            <i className="ti ti-loader-2 spin" /> Loading…
          </div>
        ) : savedRates.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '10px 0',
                        display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-info-circle" style={{ fontSize: 14 }} />
            No test rates assigned yet.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px 40px',
              padding: '8px 14px', background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <div>Lab</div><div>Test</div><div>Patient Rate</div><div></div>
            </div>
            {savedRates.map((r, idx) => (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 120px 40px',
                alignItems: 'center', padding: '10px 14px', fontSize: 13,
                borderBottom: idx < savedRates.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  <i className="ti ti-building-hospital" style={{ marginRight: 4, fontSize: 11 }} />
                  {r.lab_name}
                </div>
                <div style={{ fontWeight: 500 }}>{r.test_name}</div>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {r.patient_rate ? `₹${r.patient_rate}` : <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>—</span>}
                </div>
                <div>
                  <button onClick={() => handleDelete(r.id)} title="Remove"
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                             color: 'var(--danger, #dc2626)', padding: '4px 6px', borderRadius: 4, fontSize: 15 }}>
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main form
───────────────────────────────────────────────────────────────────────────── */
const BLANK_INFO = { name: '', phone: '', email: '', status: 'Active' };

export default function CollectorForm({ rows, setRows }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [info, setInfo]   = useState(BLANK_INFO);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const setInfoField = (k, v) => setInfo(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!editing) { setInfo(BLANK_INFO); return; }
    const apply = data => {
      setInfo({ name: data.name || '', phone: data.phone || '', email: data.email || '', status: data.status || 'Active' });
    };
    const existing = rows.find(r => String(r.id) === String(id));
    if (existing) apply(existing);
    else collectorsAPI.get(id).then(apply).catch(() => navigate('/collectors', { replace: true }));
  }, [editing, id]); // eslint-disable-line

  const save = async () => {
    setError('');
    if (!info.name.trim()) { setError('Full name is required.'); return; }
    setBusy(true);
    try {
      const payload = { ...info };
      if (editing) {
        const updated = await collectorsAPI.update(id, payload);
        setRows(prev => prev.map(item => item.id === updated.id ? updated : item));
      } else {
        const created = await collectorsAPI.create(payload);
        setRows(prev => [...prev, created]);
      }
      navigate('/collectors');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="page-panel">
      <div className="page-header">
        <div>
          <h1>{editing ? 'Edit Collector' : 'Add Collector'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing ? 'Update collector details and save changes.' : 'Enter collector information and add a new record.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/collectors')}>Back to Collectors</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* ══ Collector Info ══════════════════════════════════════════════ */}
        <Section icon="ti-user" title="Collector Information">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-input" value={info.name}
                onChange={e => setInfoField('name', e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-row">
              <label className="form-label">Phone</label>
              <input className="form-input" value={info.phone}
                onChange={e => setInfoField('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
          </div>
          <div className="form-grid" style={{ marginTop: 14 }}>
            <div className="form-row">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={info.email}
                onChange={e => setInfoField('email', e.target.value)} placeholder="collector@example.com" />
            </div>
            <div className="form-row">
              <label className="form-label">Status</label>
              <select className="form-select" value={info.status} onChange={e => setInfoField('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ══ Test Rate Assignment — Edit only ═══════════════════════════ */}
        {editing && <CollectorTestRateSection collectorId={id} />}

        {/* ══ Actions ════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="btn" onClick={() => navigate('/collectors')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? <><i className="ti ti-loader-2 spin" /> Saving…</> : editing ? 'Update Collector' : 'Add Collector'}
          </button>
        </div>
      </div>
    </div>
  );
}

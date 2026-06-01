import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { collectorsAPI, labsAPI } from '../api';

const BLANK = {
  name: '', phone: '', email: '', status: 'Active',
  lab: '',          // single lab id (string)
  pathology: '',    // single test id (string)
  patient_rate: '',
};

/* ─────────────────────────────────────────────────────────────────────────────
   Portal: renders children into document.body, positioned below anchorRef
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
   SingleSelectDropdown  — searchable, portal-based
   Props:
     options      [{ [valueKey]: any, [labelKey]: string, [subKey]?: string }]
     value        string  (the selected valueKey, or '')
     onChange     (value: string) => void
     labelKey     key for display name  (default 'name')
     valueKey     key for id            (default 'id')
     subKey       optional secondary text (e.g. code)
     placeholder  string
     disabled     bool
     label        string  (used in empty state message)
───────────────────────────────────────────────────────────────────────────── */
function SingleSelectDropdown({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select…',
  labelKey = 'name',
  valueKey = 'id',
  subKey,
  disabled = false,
  label = 'options',
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const wrapRef             = useRef(null);
  const anchorRef           = useRef(null);
  const searchRef           = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        !e.target.closest('[data-ssdd-portal]')
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const selectedOption = options.find(o => String(o[valueKey]) === String(value));

  const filtered = query.trim()
    ? options.filter(o =>
        o[labelKey].toLowerCase().includes(query.toLowerCase()) ||
        (subKey && o[subKey] && String(o[subKey]).toLowerCase().includes(query.toLowerCase()))
      )
    : options;

  const select = val => {
    onChange(val === value ? '' : val); // clicking the same item deselects
    setOpen(false);
    setQuery('');
  };

  const clear = e => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', opacity: disabled ? 0.5 : 1 }}>
      {/* ── Trigger ── */}
      <div
        ref={anchorRef}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center',
          height: 38, padding: '0 36px 0 10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid var(--border)', borderRadius: 6,
          background: 'var(--input-bg, var(--card-bg))',
          userSelect: 'none', boxSizing: 'border-box',
          position: 'relative',
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

        {/* Clear × */}
        {selectedOption && !disabled && (
          <span
            onClick={clear}
            style={{
              position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1,
              padding: '0 4px',
            }}
          >×</span>
        )}

        {/* Chevron */}
        <span style={{
          position: 'absolute', right: 10, top: '50%',
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: 'transform 0.15s', fontSize: 11, color: 'var(--text-secondary)',
        }}>▼</span>
      </div>

      {/* ── Floating panel ── */}
      {open && !disabled && (
        <DropdownPortal anchorRef={anchorRef}>
          <div
            data-ssdd-portal="true"
            style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Search box */}
            <div style={{
              padding: '8px 10px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${label}…`}
                style={{
                  border: 'none', outline: 'none', width: '100%', fontSize: 13,
                  background: 'transparent', color: 'var(--text)',
                }}
              />
              {query && (
                <span
                  onClick={() => setQuery('')}
                  style={{ cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', flexShrink: 0 }}
                >×</span>
              )}
            </div>

            {/* Options list */}
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  No results for "{query}"
                </div>
              ) : filtered.map(o => {
                const val      = String(o[valueKey]);
                const selected = val === String(value);
                return (
                  <div
                    key={val}
                    onClick={() => select(val)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 14px', cursor: 'pointer', fontSize: 14,
                      background: selected ? 'var(--primary-light, rgba(59,130,246,0.10))' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.04))'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selected ? 'var(--primary-light, rgba(59,130,246,0.10))' : 'transparent'; }}
                  >
                    {/* Radio-style indicator */}
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selected ? 'var(--primary, #3b82f6)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--primary, #3b82f6)',
                        }} />
                      )}
                    </span>
                    <span style={{ flex: 1 }}>{o[labelKey]}</span>
                    {subKey && o[subKey] && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o[subKey]}</span>
                    )}
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

/* ── Helpers ────────────────────────────────────────────────────────────── */
function StepHint({ children }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
      <i className="ti ti-info-circle" style={{ fontSize: 13 }} />{children}
    </p>
  );
}

function StepBadge({ n, active }) {
  return (
    <span style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: active ? 'var(--primary, #3b82f6)' : 'var(--border)',
      color: active ? '#fff' : 'var(--text-secondary)',
      fontSize: 12, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{n}</span>
  );
}

/* ── Main form ──────────────────────────────────────────────────────────── */
export default function CollectorForm({ rows, setRows }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]                 = useState(BLANK);
  const [busy, setBusy]                 = useState(false);
  const [error, setError]               = useState('');
  const [allLabs, setAllLabs]           = useState([]);
  const [labTests, setLabTests]         = useState([]);   // tests for selected lab
  const [loadingTests, setLoadingTests] = useState(false);

  const labSelected  = Boolean(form.lab);
  const testSelected = Boolean(form.pathology);
  const canEnterRate = labSelected && testSelected;

  // Load all labs once
  useEffect(() => { labsAPI.list().then(setAllLabs).catch(() => {}); }, []);

  // Load existing record when editing
  useEffect(() => {
    if (editing) {
      const apply = data => setForm({
        ...BLANK, ...data,
        // support old array format → take first element
        lab:       Array.isArray(data.labs)        ? (data.labs[0]        || '') : (data.lab        || ''),
        pathology: Array.isArray(data.pathologies)  ? (data.pathologies[0]  || '') : (data.pathology  || ''),
      });
      const existing = rows.find(r => String(r.id) === String(id));
      if (existing) apply(existing);
      else collectorsAPI.get(id).then(apply).catch(() => navigate('/collectors', { replace: true }));
    } else {
      setForm(BLANK);
    }
  }, [editing, id]); // eslint-disable-line

  // When lab changes, load its tests and reset pathology/rate
  useEffect(() => {
    setForm(f => ({ ...f, pathology: '', patient_rate: '' }));
    setLabTests([]);
    if (!form.lab) return;
    setLoadingTests(true);
    labsAPI.getTests(form.lab)
      .then(tests => { setLabTests(tests); })
      .catch(() => setLabTests([]))
      .finally(() => setLoadingTests(false));
  }, [form.lab]); // eslint-disable-line

  // Clear rate when test deselected
  useEffect(() => {
    if (!testSelected) setForm(f => ({ ...f, patient_rate: '' }));
  }, [testSelected]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Prepare payload — backend still stores as arrays for compatibility
  const buildPayload = () => ({
    ...form,
    labs:        form.lab       ? [form.lab]       : [],
    pathologies: form.pathology ? [form.pathology] : [],
  });

  const save = async () => {
    setError('');
    if (!form.name.trim()) { setError('Full name is required.'); return; }
    setBusy(true);
    try {
      const payload = buildPayload();
      if (editing) {
        const updated = await collectorsAPI.update(form.id, payload);
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

        {/* ── Basic Info ── */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-row">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone}
              onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="collector@example.com" />
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        {/* ── Step 1 – Lab ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StepBadge n={1} active />
            <label className="form-label" style={{ margin: 0 }}>Assign Lab</label>
          </div>
          <SingleSelectDropdown
            label="labs"
            options={allLabs}
            value={form.lab}
            onChange={val => set('lab', val)}
            placeholder="Search and select a lab…"
            labelKey="name"
            valueKey="id"
            subKey="my_lab_code"
          />
          {!labSelected && <StepHint>Select a lab to see its available pathology tests.</StepHint>}
        </div>

        {/* ── Step 2 – Pathology Test ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StepBadge n={2} active={labSelected} />
            <label className="form-label" style={{ margin: 0, color: labSelected ? undefined : 'var(--text-secondary)' }}>
              Assign Pathology Test
            </label>
            {loadingTests && <i className="ti ti-loader-2 spin" style={{ fontSize: 14, color: 'var(--text-secondary)' }} />}
          </div>
          <SingleSelectDropdown
            label="tests"
            options={labTests}
            value={form.pathology}
            onChange={val => set('pathology', val)}
            placeholder={labSelected ? 'Search and select a test…' : 'Select a lab first…'}
            labelKey="test_name"
            valueKey="id"
            disabled={!labSelected}
          />
          {labSelected && !testSelected && <StepHint>Select a test to enable the patient rate field.</StepHint>}
        </div>

        {/* ── Step 3 – Patient Rate ── */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StepBadge n={3} active={canEnterRate} />
            <label className="form-label" style={{ margin: 0, color: canEnterRate ? undefined : 'var(--text-secondary)' }}>
              Patient Rate (₹)
            </label>
          </div>
          <input
            className="form-input"
            type="number" min="0" step="0.01"
            value={form.patient_rate}
            onChange={e => set('patient_rate', e.target.value)}
            placeholder={canEnterRate ? 'Enter rate per patient' : 'Select a lab and test first…'}
            disabled={!canEnterRate}
            style={{ opacity: canEnterRate ? 1 : 0.5, cursor: canEnterRate ? undefined : 'not-allowed' }}
          />
          {!canEnterRate && <StepHint>Complete steps 1 and 2 to set the patient rate.</StepHint>}
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="btn" onClick={() => navigate('/collectors')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? <><i className="ti ti-loader-2 spin" /> Saving…</> : editing ? 'Update Data' : 'Add Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { labsAPI, pathologiesAPI } from '../api';

const BLANK = {
  name: '',
  my_lab_code: '',
  address: '',
  contact_email: '',
  contact_phone: '',
  status: 'Active',
  available_tests: [],
  contacts: [],
};

const BLANK_TEST    = { test_name: '', deposit_amount: '' };
const BLANK_CONTACT = { contact_name: '', phone: '' };

const sectionTitle = {
  fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
};

export default function LabForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]         = useState(BLANK);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const [pathologies, setPathologies] = useState([]);

  useEffect(() => {
    if (editing) {
      Promise.all([pathologiesAPI.list(), labsAPI.get(id)])
        .then(([paths, data]) => {
          setPathologies(paths);
          setForm({
            ...BLANK,
            ...data,
            available_tests: Array.isArray(data.available_tests) ? data.available_tests : [],
            contacts:        Array.isArray(data.contacts)        ? data.contacts        : [],
          });
        })
        .catch(() => navigate('/labs', { replace: true }));
    } else {
      pathologiesAPI.list().then(setPathologies).catch(console.error);
      setForm(BLANK);
    }
  }, [editing, id]); // eslint-disable-line

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Available tests (per-test pricing) ────────────────────────────────
  const addTest = () =>
    setForm(f => ({ ...f, available_tests: [...f.available_tests, { ...BLANK_TEST }] }));

  const updateTest = (i, key, val) =>
    setForm(f => ({
      ...f,
      available_tests: f.available_tests.map((t, idx) => idx === i ? { ...t, [key]: val } : t),
    }));

  const removeTest = (i) =>
    setForm(f => ({ ...f, available_tests: f.available_tests.filter((_, idx) => idx !== i) }));

  // ── Lab contacts ──────────────────────────────────────────────────────
  const addContact = () =>
    setForm(f => ({ ...f, contacts: [...f.contacts, { ...BLANK_CONTACT }] }));

  const updateContact = (i, key, val) =>
    setForm(f => ({
      ...f,
      contacts: f.contacts.map((c, idx) => idx === i ? { ...c, [key]: val } : c),
    }));

  const removeContact = (i) =>
    setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));

  // ── Save ──────────────────────────────────────────────────────────────
  const save = async () => {
    setError('');
    if (!form.name.trim()) { setError('Lab name is required.'); return; }
    setBusy(true);
    try {
      editing ? await labsAPI.update(id, form) : await labsAPI.create(form);
      navigate('/labs');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const rowBox = {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    padding: '14px 16px', borderRadius: 8, marginBottom: 10,
  };

  const deleteBtn = (onClick) => (
    <button onClick={onClick} type="button" style={{
      background: 'none', border: '1px solid var(--border)', borderRadius: 6,
      cursor: 'pointer', padding: '8px 10px', color: 'var(--danger)',
      display: 'flex', alignItems: 'center', alignSelf: 'flex-end',
    }}>
      <i className="ti ti-trash" style={{ fontSize: 16 }} />
    </button>
  );

  return (
    <div className="page-panel">
      <div className="page-header">
        <div>
          <h1>{editing ? 'Edit Lab' : 'Add Lab'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing
              ? 'Update laboratory details and save changes.'
              : 'Enter laboratory information to add a new record.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/labs')}>Back to Labs</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* ── Basic Info ── */}
        <h3 style={{ ...sectionTitle, marginBottom: 16 }}>Basic Information</h3>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">
              Lab Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="form-input" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Metropolis Pathology Lab" />
          </div>
          <div className="form-row">
            <label className="form-label">My Lab Code</label>
            <input className="form-input" value={form.my_lab_code}
              onChange={e => set('my_lab_code', e.target.value)}
              placeholder="e.g. LAB-001" />
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status}
              onChange={e => set('status', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-row" style={{ marginTop: 16 }}>
          <label className="form-label">Lab Address</label>
          <textarea className="form-input" rows={3} value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="Full address including city and PIN" />
        </div>

        {/* ── Contact Info ── */}
        <h3 style={{ ...sectionTitle, margin: '24px 0 16px' }}>Contact Information</h3>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              placeholder="lab@example.com" />
          </div>
          <div className="form-row">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
              placeholder="+91 XXXXXXXXXX" />
          </div>
        </div>

        {/* ── Available Tests with per-test pricing ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 4px' }}>
          <h3 style={sectionTitle}>Available Tests</h3>
          <button className="btn" onClick={addTest} type="button" style={{ fontSize: 13 }}>
            <i className="ti ti-plus" /> Add Test
          </button>
        </div>

        {form.available_tests.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '12px 0 8px' }}>
            No tests added yet. Click "Add Test" to add one.
          </p>
        ) : (
          <>
            {/* header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 36px',
              gap: 10, padding: '6px 16px', marginBottom: 4,
            }}>
              {['Test Name', 'Deposit (₹)', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
              ))}
            </div>

            {form.available_tests.map((t, i) => (
              <div key={i} style={{ ...rowBox, display: 'grid', gridTemplateColumns: '2fr 1fr 36px', gap: 10, alignItems: 'center' }}>
                <select className="form-select" value={t.test_name}
                  onChange={e => updateTest(i, 'test_name', e.target.value)}>
                  <option value="">— Select Test —</option>
                  {pathologies.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                  ))}
                </select>
                <input className="form-input" value={t.deposit_amount}
                  onChange={e => updateTest(i, 'deposit_amount', e.target.value)}
                  placeholder="0" />
                {deleteBtn(() => removeTest(i))}
              </div>
            ))}
          </>
        )}

        {/* ── Lab Contacts ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 4px' }}>
          <h3 style={sectionTitle}>Lab Contacts</h3>
          <button className="btn" onClick={addContact} type="button" style={{ fontSize: 13 }}>
            <i className="ti ti-plus" /> Add Contact
          </button>
        </div>

        {form.contacts.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '12px 0 8px' }}>
            No contacts added yet. Click "Add Contact" to add one.
          </p>
        ) : (
          form.contacts.map((c, i) => (
            <div key={i} style={{ ...rowBox, display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: 12, alignItems: 'end' }}>
              <div className="form-row" style={{ margin: 0 }}>
                <label className="form-label">Contact Name</label>
                <input className="form-input" value={c.contact_name}
                  onChange={e => updateContact(i, 'contact_name', e.target.value)}
                  placeholder="Full name" />
              </div>
              <div className="form-row" style={{ margin: 0 }}>
                <label className="form-label">Phone</label>
                <input className="form-input" value={c.phone}
                  onChange={e => updateContact(i, 'phone', e.target.value)}
                  placeholder="+91 XXXXXXXXXX" />
              </div>
              {deleteBtn(() => removeContact(i))}
            </div>
          ))
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="btn" onClick={() => navigate('/labs')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy
              ? <><i className="ti ti-loader-2 spin" /> Saving…</>
              : editing ? 'Update Data' : 'Add Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

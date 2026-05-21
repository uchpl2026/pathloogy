import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pathologiesAPI } from '../api';

const CATEGORIES = ['Hematology', 'Biochemistry', 'Endocrinology', 'Diabetes', 'Microbiology', 'Immunology'];
const BLANK = { name: '', code: '', clientCode: '', category: 'Hematology', turnaround: '', price: '', status: 'Active' };

export default function PathologyForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]   = useState(BLANK);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      pathologiesAPI.get(id)
        .then(setForm)
        .catch(() => navigate('/pathologies', { replace: true }));
    } else {
      setForm(BLANK);
    }
  }, [id]); // eslint-disable-line

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setError('');
    if (!form.name.trim() || !form.code.trim()) {
      setError('Test name and code are required.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await pathologiesAPI.update(id, form);
      } else {
        await pathologiesAPI.create(form);
      }
      navigate('/pathologies');
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
          <h1>{editing ? 'Edit Pathology' : 'Add Pathology'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing ? 'Update the test details and save changes.' : 'Enter test information to add a new pathology record.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/pathologies')}>Back to Pathologies</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* Row 1: Test Name + Test Code */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Test Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Blood Glucose"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Test Code</label>
            <input
              className="form-input"
              value={form.code}
              onChange={e => set('code', e.target.value)}
              placeholder="e.g. BGL-006"
            />
          </div>
        </div>

        {/* Row 2: Client Code + Category */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">
              Client Code
              <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 12, marginLeft: 6 }}>
                (optional)
              </span>
            </label>
            <input
              className="form-input"
              value={form.clientCode || ''}
              onChange={e => set('clientCode', e.target.value)}
              placeholder="e.g. CLT-H001"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Turnaround + Price */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Turnaround Time</label>
            <input
              className="form-input"
              value={form.turnaround}
              onChange={e => set('turnaround', e.target.value)}
              placeholder="e.g. 4 hrs"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Price</label>
            <input
              className="form-input"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="₹0"
            />
          </div>
        </div>

        {/* Row 4: Status */}
        <div className="form-row" style={{ maxWidth: 320 }}>
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/pathologies')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy
              ? <><i className="ti ti-loader-2 spin" /> Saving…</>
              : editing ? 'Save Changes' : 'Add Pathology'}
          </button>
        </div>
      </div>
    </div>
  );
}

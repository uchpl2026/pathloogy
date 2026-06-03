import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pathologiesAPI } from '../api';

const BLANK = { name: '', description: '' };

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
    if (!form.name.trim()) {
      setError('Test name is required.');
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

        {/* 3-column grid */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">
              Test Name <span style={{ color: 'var(--danger, #A32D2D)' }}>*</span>
            </label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Blood Glucose"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Short description (optional)"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/pathologies')}>Cancel</button>
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

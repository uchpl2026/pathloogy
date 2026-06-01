import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pathologiesAPI } from '../api';

const BLANK = { name: '', code: '' };

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

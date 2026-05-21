import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collectorsAPI } from '../api';

const ZONES = ['North Kolkata', 'South Kolkata', 'East Kolkata', 'West Kolkata', 'Central'];
const BLANK = { name: '', empId: '', phone: '', zone: 'North Kolkata', samples: 0, status: 'On Duty' };

export default function CollectorForm({ rows, setRows }) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const editing    = Boolean(id);
  const [form, setForm]   = useState(BLANK);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      const existing = rows.find(r => String(r.id) === String(id));
      if (existing) {
        setForm(existing);
      } else {
        // Try fetching from API in case user navigated directly
        collectorsAPI.get(id)
          .then(setForm)
          .catch(() => navigate('/collectors', { replace: true }));
      }
    } else {
      setForm(BLANK);
    }
  }, [editing, id]); // eslint-disable-line

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    setError('');
    setBusy(true);
    try {
      if (editing) {
        const updated = await collectorsAPI.update(form.id, form);
        setRows(prev => prev.map(item => item.id === updated.id ? updated : item));
      } else {
        const created = await collectorsAPI.create(form);
        setRows(prev => [...prev, created]);
      }
      navigate('/collectors');
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

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-row">
            <label className="form-label">Employee ID</label>
            <input className="form-input" value={form.empId} onChange={e => updateField('empId', e.target.value)} placeholder="EMP-XXX" />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
          </div>
          <div className="form-row">
            <label className="form-label">Zone</label>
            <select className="form-select" value={form.zone} onChange={e => updateField('zone', e.target.value)}>
              {ZONES.map(zone => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => updateField('status', e.target.value)}>
            <option>On Duty</option>
            <option>Off Duty</option>
            <option>Leave</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/collectors')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? <><i className="ti ti-loader-2 spin" /> Saving…</> : editing ? 'Save Changes' : 'Add Collector'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collectionOrdersAPI } from '../api';

const BLANK = {
  patient: '',
  collector: '',
  address: '',
  scheduled: '',
  status: 'Scheduled',
};

export default function CollectionOrderForm({ rows, collectors, setRows }) {
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
        collectionOrdersAPI.get(id)
          .then(setForm)
          .catch(() => navigate('/collection-orders', { replace: true }));
      }
    } else {
      setForm({ ...BLANK, collector: collectors?.[0]?.name || '' });
    }
  }, [editing, id]); // eslint-disable-line

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    setError('');
    setBusy(true);
    try {
      if (editing) {
        const updated = await collectionOrdersAPI.update(form.id, form);
        setRows(prev => prev.map(item => item.id === updated.id ? updated : item));
      } else {
        const created = await collectionOrdersAPI.create(form);
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

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Patient Name</label>
            <input className="form-input" value={form.patient} onChange={e => updateField('patient', e.target.value)} placeholder="Patient name" />
          </div>
          <div className="form-row">
            <label className="form-label">Collector</label>
            <select className="form-select" value={form.collector} onChange={e => updateField('collector', e.target.value)}>
              {collectors.map(c => <option key={c.id} value={c.name}>{c.name} — {c.zone}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Patient Address</label>
          <textarea className="form-textarea" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Full collection address" />
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Scheduled Date &amp; Time</label>
            <input className="form-input" value={form.scheduled} onChange={e => updateField('scheduled', e.target.value)} placeholder="DD Mon YYYY, HH:MM AM" />
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

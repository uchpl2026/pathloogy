import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testOrdersAPI, pathologiesAPI } from '../api';

const BLANK = { patient: '', patient_phone: '', test: '', doctor: '', priority: 'Routine', status: 'Pending' };

export default function TestOrderForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editing  = Boolean(id);

  const [form, setForm]           = useState(BLANK);
  const [pathologies, setPathologies] = useState([]);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    pathologiesAPI.list().then(setPathologies).catch(console.error);
  }, []);

  useEffect(() => {
    if (editing) {
      testOrdersAPI.get(id)
        .then(setForm)
        .catch(() => navigate('/test-orders', { replace: true }));
    } else {
      setForm(BLANK);
    }
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (!editing && pathologies.length && !form.test) {
      setForm(f => ({ ...f, test: pathologies[0].name }));
    }
  }, [pathologies]); // eslint-disable-line

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setError('');
    if (!form.patient.trim()) {
      setError('Patient name is required.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await testOrdersAPI.update(id, form);
      } else {
        await testOrdersAPI.create(form);
      }
      navigate('/test-orders');
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
          <h1>{editing ? 'Edit Test Order' : 'New Test Order'}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {editing ? 'Update the order details and save changes.' : 'Fill in the details to create a new test order.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/test-orders')}>Back to Test Orders</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div className="login-error" style={{ marginBottom: 16 }} role="alert">
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* Row 1: Patient Name · Patient Phone · Test */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">
              Patient Name <span style={{ color: 'var(--danger, #A32D2D)' }}>*</span>
            </label>
            <input
              className="form-input"
              value={form.patient}
              onChange={e => set('patient', e.target.value)}
              placeholder="Patient name"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Patient Phone</label>
            <input
              className="form-input"
              value={form.patient_phone || ''}
              onChange={e => set('patient_phone', e.target.value)}
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Test</label>
            <select className="form-select" value={form.test} onChange={e => set('test', e.target.value)}>
              {pathologies.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Referring Doctor · Priority · Status */}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Referring Doctor</label>
            <input
              className="form-input"
              value={form.doctor}
              onChange={e => set('doctor', e.target.value)}
              placeholder="Dr. Name"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option>Routine</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {['Pending', 'Processing', 'Completed', 'Cancelled'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn" onClick={() => navigate('/test-orders')}>Cancel</button>
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

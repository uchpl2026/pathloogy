import React, { useState, useEffect, useCallback } from 'react';
import { adminsAPI } from '../api';
import './AdminManagement.css';

const emptyForm = { name: '', email: '', password: '' };

export default function AdminManagement() {
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [formErr, setFormErr]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    adminsAPI.list()
      .then(data => { if (Array.isArray(data)) setAdmins(data); })
      .catch(() => notify('Failed to load admins', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setFormErr(''); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setFormErr('');
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormErr('All fields are required.'); return;
    }
    if (form.password.length < 6) {
      setFormErr('Password must be at least 6 characters.'); return;
    }
    setSaving(true);
    try {
      const res = await adminsAPI.create(form);
      if (res.ok) {
        setAdmins(prev => [...prev, res.admin]);
        closeModal();
        notify('Admin created successfully');
      } else {
        setFormErr(res.error || 'Failed to create admin.');
      }
    } catch {
      setFormErr('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (admin) => {
    const newActive = admin.is_active ? 0 : 1;
    try {
      const res = await adminsAPI.toggle(admin.id, newActive);
      if (res.ok) {
        setAdmins(prev => prev.map(a => a.id === admin.id ? res.admin : a));
        notify(`Admin ${newActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        notify(res.error || 'Failed to update status', 'error');
      }
    } catch {
      notify('Network error', 'error');
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Delete admin "${admin.name}"? This cannot be undone.`)) return;
    try {
      const res = await adminsAPI.delete(admin.id);
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== admin.id));
        notify('Admin deleted');
      } else {
        notify(res.error || 'Failed to delete', 'error');
      }
    } catch {
      notify('Network error', 'error');
    }
  };

  return (
    <div className="am-page">
      {toast && (
        <div className={`am-toast am-toast--${toast.type}`}>
          <i className={`ti ${toast.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
          {toast.msg}
        </div>
      )}

      <div className="am-header">
        <div>
          <h1 className="am-title">Admin Management</h1>
          <p className="am-subtitle">Add and manage admin accounts</p>
        </div>
        <button className="am-btn am-btn--primary" onClick={openAdd}>
          <i className="ti ti-user-plus" /> Add Admin
        </button>
      </div>

      <div className="am-card">
        {loading ? (
          <div className="am-loader">
            <i className="ti ti-loader-2 spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="am-empty">
            <i className="ti ti-users-group" />
            <p>No admin accounts yet. Create one to get started.</p>
          </div>
        ) : (
          <table className="am-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id}>
                  <td className="am-td-num">{i + 1}</td>
                  <td>
                    <div className="am-user-cell">
                      <div className="am-avatar">{a.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                      <span>{a.name}</span>
                    </div>
                  </td>
                  <td>{a.email}</td>
                  <td>
                    <span className={`am-badge ${a.is_active ? 'am-badge--active' : 'am-badge--inactive'}`}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="am-actions">
                      <button
                        className={`am-btn am-btn--sm ${a.is_active ? 'am-btn--warning' : 'am-btn--success'}`}
                        onClick={() => handleToggle(a)}
                        title={a.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`ti ${a.is_active ? 'ti-user-off' : 'ti-user-check'}`} />
                        {a.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="am-btn am-btn--sm am-btn--danger"
                        onClick={() => handleDelete(a)}
                        title="Delete admin"
                      >
                        <i className="ti ti-trash" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="am-overlay" onClick={closeModal}>
          <div className="am-modal" onClick={e => e.stopPropagation()}>
            <div className="am-modal-header">
              <h2>Add New Admin</h2>
              <button className="am-close" onClick={closeModal}><i className="ti ti-x" /></button>
            </div>

            <div className="am-modal-body">
              {formErr && <div className="am-form-error"><i className="ti ti-alert-triangle" /> {formErr}</div>}

              <label className="am-label">Full Name *</label>
              <input
                className="am-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoFocus
              />

              <label className="am-label">Email *</label>
              <input
                className="am-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
              />

              <label className="am-label">Password *</label>
              <input
                className="am-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="am-modal-footer">
              <button className="am-btn am-btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="am-btn am-btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <><i className="ti ti-loader-2 spin" /> Creating…</> : <><i className="ti ti-user-plus" /> Create Admin</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

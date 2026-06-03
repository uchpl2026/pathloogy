import React, { useState, useEffect, useCallback } from 'react';
import { adminsAPI } from '../api';
import './AdminAccounts.css';

const emptyForm = { name: '', email: '', password: '' };

export default function AdminAccounts() {
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [formErr, setFormErr]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all'); // all | active | inactive
  const [toast, setToast]         = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    adminsAPI.list()
      .then(data => { if (Array.isArray(data)) setAdmins(data); })
      .catch(() => notify('Failed to load admins', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = admins.filter(a => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'active' && a.is_active) ||
      (filter === 'inactive' && !a.is_active);
    return matchSearch && matchFilter;
  });

  const openAdd = () => { setForm(emptyForm); setFormErr(''); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setFormErr('');
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormErr('All fields are required.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setFormErr('Please enter a valid email address.'); return;
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
        notify(`Admin "${form.name}" created successfully`);
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
        notify(`"${admin.name}" ${newActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        notify(res.error || 'Failed to update status', 'error');
      }
    } catch {
      notify('Network error', 'error');
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Permanently delete admin "${admin.name}"? This cannot be undone.`)) return;
    try {
      const res = await adminsAPI.delete(admin.id);
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== admin.id));
        notify(`"${admin.name}" deleted`);
      } else {
        notify(res.error || 'Failed to delete', 'error');
      }
    } catch {
      notify('Network error', 'error');
    }
  };

  const totalCount    = admins.length;
  const activeCount   = admins.filter(a => a.is_active).length;
  const inactiveCount = admins.filter(a => !a.is_active).length;

  return (
    <div className="aa-page">
      {/* Toast */}
      {toast && (
        <div className={`aa-toast aa-toast--${toast.type}`}>
          <i className={`ti ${toast.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="aa-page-header">
        <div>
          <h1>Admin Accounts</h1>
          <p>Manage who has admin access to PathLab Pro</p>
        </div>
        <button className="aa-btn aa-btn--primary" onClick={openAdd}>
          <i className="ti ti-user-plus" /> Add Admin
        </button>
      </div>

      {/* Summary chips */}
      <div className="aa-chips">
        <button className={`aa-chip ${filter === 'all' ? 'aa-chip--sel' : ''}`} onClick={() => setFilter('all')}>
          All <span>{totalCount}</span>
        </button>
        <button className={`aa-chip aa-chip--active-color ${filter === 'active' ? 'aa-chip--sel' : ''}`} onClick={() => setFilter('active')}>
          <span className="aa-chip-dot aa-chip-dot--active" /> Active <span>{activeCount}</span>
        </button>
        <button className={`aa-chip aa-chip--inactive-color ${filter === 'inactive' ? 'aa-chip--sel' : ''}`} onClick={() => setFilter('inactive')}>
          <span className="aa-chip-dot aa-chip-dot--inactive" /> Inactive <span>{inactiveCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="aa-search-row">
        <div className="aa-search-wrap">
          <i className="ti ti-search aa-search-icon" />
          <input
            className="aa-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="aa-search-clear" onClick={() => setSearch('')}>
              <i className="ti ti-x" />
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="aa-card">
        {loading ? (
          <div className="aa-center"><i className="ti ti-loader-2 spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="aa-center aa-empty">
            <i className="ti ti-users-group" />
            <p>{search || filter !== 'all' ? 'No admins match your filters.' : 'No admin accounts yet.'}</p>
            {!search && filter === 'all' && (
              <button className="aa-btn aa-btn--primary" onClick={openAdd}>
                <i className="ti ti-plus" /> Add First Admin
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="aa-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id}>
                    <td className="aa-num">{i + 1}</td>
                    <td>
                      <div className="aa-user-cell">
                        <div className="aa-avatar">
                          {a.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="aa-user-name">{a.name}</div>
                          <div className="aa-user-id">ID #{a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="aa-email">{a.email}</td>
                    <td>
                      <label className="aa-toggle" title={a.is_active ? 'Click to deactivate' : 'Click to activate'}>
                        <input
                          type="checkbox"
                          checked={!!a.is_active}
                          onChange={() => handleToggle(a)}
                        />
                        <span className="aa-toggle-track">
                          <span className="aa-toggle-thumb" />
                        </span>
                        <span className={`aa-toggle-label ${a.is_active ? 'aa-toggle-label--on' : 'aa-toggle-label--off'}`}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="aa-actions">
                        <button
                          className={`aa-action-btn ${a.is_active ? 'aa-action-btn--deactivate' : 'aa-action-btn--activate'}`}
                          onClick={() => handleToggle(a)}
                        >
                          <i className={`ti ${a.is_active ? 'ti-user-off' : 'ti-user-check'}`} />
                          {a.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="aa-action-btn aa-action-btn--delete" onClick={() => handleDelete(a)}>
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="aa-table-footer">
              Showing {filtered.length} of {totalCount} admin{totalCount !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="aa-overlay" onClick={closeModal}>
          <div className="aa-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-modal-header">
              <div className="aa-modal-icon"><i className="ti ti-user-plus" /></div>
              <div>
                <h2>Add New Admin</h2>
                <p>The new admin can log in immediately after creation.</p>
              </div>
              <button className="aa-modal-close" onClick={closeModal}><i className="ti ti-x" /></button>
            </div>

            <div className="aa-modal-body">
              {formErr && (
                <div className="aa-form-error">
                  <i className="ti ti-alert-triangle" /> {formErr}
                </div>
              )}

              <div className="aa-field">
                <label>Full Name <span>*</span></label>
                <div className="aa-input-wrap">
                  <i className="ti ti-user" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Sharma"
                    autoFocus
                  />
                </div>
              </div>

              <div className="aa-field">
                <label>Email Address <span>*</span></label>
                <div className="aa-input-wrap">
                  <i className="ti ti-mail" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="aa-field">
                <label>Password <span>*</span></label>
                <div className="aa-input-wrap">
                  <i className="ti ti-lock" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="aa-field-hint">The admin will use this password to log in.</div>
              </div>
            </div>

            <div className="aa-modal-footer">
              <button className="aa-btn aa-btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="aa-btn aa-btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving
                  ? <><i className="ti ti-loader-2 spin" /> Creating…</>
                  : <><i className="ti ti-user-plus" /> Create Admin</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

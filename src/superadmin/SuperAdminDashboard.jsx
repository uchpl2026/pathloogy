import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminsAPI } from '../api';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboard({ user }) {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminsAPI.list()
      .then(data => { if (Array.isArray(data)) setAdmins(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total    = admins.length;
  const active   = admins.filter(a => a.is_active).length;
  const inactive = admins.filter(a => !a.is_active).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="sad-page">
      {/* Welcome banner */}
      <div className="sad-welcome">
        <div className="sad-welcome-text">
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p>Here's an overview of all admin accounts on PathLab Pro.</p>
        </div>
        <div className="sad-welcome-icon">
          <i className="ti ti-shield-check" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="sad-stats">
        <div className="sad-stat-card sad-stat--total" onClick={() => navigate('/sa/admins')} role="button" tabIndex={0}>
          <div className="sad-stat-icon"><i className="ti ti-users-group" /></div>
          <div className="sad-stat-body">
            <div className="sad-stat-label">Total Admins</div>
            <div className="sad-stat-value">{loading ? '—' : total}</div>
            <div className="sad-stat-sub">Registered accounts</div>
          </div>
        </div>

        <div className="sad-stat-card sad-stat--active" onClick={() => navigate('/sa/admins')} role="button" tabIndex={0}>
          <div className="sad-stat-icon"><i className="ti ti-user-check" /></div>
          <div className="sad-stat-body">
            <div className="sad-stat-label">Active Admins</div>
            <div className="sad-stat-value">{loading ? '—' : active}</div>
            <div className="sad-stat-sub">Can log in</div>
          </div>
        </div>

        <div className="sad-stat-card sad-stat--inactive" onClick={() => navigate('/sa/admins')} role="button" tabIndex={0}>
          <div className="sad-stat-icon"><i className="ti ti-user-off" /></div>
          <div className="sad-stat-body">
            <div className="sad-stat-label">Inactive Admins</div>
            <div className="sad-stat-value">{loading ? '—' : inactive}</div>
            <div className="sad-stat-sub">Access revoked</div>
          </div>
        </div>
      </div>

      {/* Recent admins table */}
      <div className="sad-section">
        <div className="sad-section-header">
          <div>
            <h2>Admin Accounts</h2>
            <p>All registered admin users</p>
          </div>
          <button className="sad-btn" onClick={() => navigate('/sa/admins')}>
            <i className="ti ti-arrow-right" /> Manage Admins
          </button>
        </div>

        <div className="sad-table-wrap">
          {loading ? (
            <div className="sad-loading"><i className="ti ti-loader-2 spin" /></div>
          ) : admins.length === 0 ? (
            <div className="sad-empty">
              <i className="ti ti-users-group" />
              <p>No admin accounts yet.</p>
              <button className="sad-btn sad-btn--primary" onClick={() => navigate('/sa/admins')}>
                <i className="ti ti-plus" /> Add First Admin
              </button>
            </div>
          ) : (
            <table className="sad-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={a.id}>
                    <td className="sad-num">{i + 1}</td>
                    <td>
                      <div className="sad-user-cell">
                        <div className="sad-mini-avatar">
                          {a.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        {a.name}
                      </div>
                    </td>
                    <td>{a.email}</td>
                    <td>
                      <span className={`sad-badge ${a.is_active ? 'sad-badge--active' : 'sad-badge--inactive'}`}>
                        <span className="sad-badge-dot" />
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

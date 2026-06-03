import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './SuperAdminLayout.css';

const NAV = [
  { to: '/sa/dashboard',   icon: 'ti-layout-dashboard', label: 'Dashboard'  },
  { to: '/sa/admins',      icon: 'ti-users-group',       label: 'Admin Accounts' },
];

const PAGE_TITLES = {
  '/sa/dashboard': 'Superadmin Dashboard',
  '/sa/admins':    'Admin Accounts',
};

export default function SuperAdminLayout({ user, onLogout }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const title    = PAGE_TITLES[pathname] || 'Super Admin';
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  return (
    <div className="sa-layout">
      {open && <div className="sa-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sa-sidebar${open ? ' sa-sidebar--open' : ''}`}>
        <div className="sa-logo">
          <div className="sa-logo-icon">
            <i className="ti ti-shield-check" />
          </div>
          <div>
            <div className="sa-logo-name">PathLab Pro</div>
            <div className="sa-logo-badge">Super Admin</div>
          </div>
          <button className="sa-close-btn" onClick={() => setOpen(false)}>
            <i className="ti ti-x" />
          </button>
        </div>

        <nav className="sa-nav">
          <div className="sa-nav-label">Navigation</div>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={({ isActive }) => 'sa-nav-item' + (isActive ? ' sa-nav-item--active' : '')}>
              <i className={`ti ${n.icon}`} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-user-info">
            <div className="sa-avatar">{initials}</div>
            <div>
              <div className="sa-user-name">{user?.name}</div>
              <div className="sa-user-role">Super Admin</div>
            </div>
          </div>
          <button className="sa-logout-btn" onClick={onLogout}>
            <i className="ti ti-logout" /> Sign out
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <button className="sa-hamburger" onClick={() => setOpen(v => !v)}>
              <i className="ti ti-menu-2" />
            </button>
            <span className="sa-topbar-title">{title}</span>
          </div>
          <div className="sa-topbar-right">
            <div className="sa-top-badge">
              <i className="ti ti-shield-check" /> Super Admin
            </div>
            <div className="sa-avatar sa-avatar--sm">{initials}</div>
          </div>
        </header>
        <div className="sa-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

const NAV = [
  { to: '/dashboard',          icon: 'ti-layout-dashboard', label: 'Dashboard',         section: 'overview'    },
  { to: '/pathologies',        icon: 'ti-virus',            label: 'Pathologies',       section: 'management'  },
  { to: '/collectors',         icon: 'ti-user-check',       label: 'Collectors',        section: 'management'  },
  { to: '/test-orders',        icon: 'ti-clipboard-list',   label: 'Test Orders',       section: 'management'  },
  { to: '/collection-orders',  icon: 'ti-truck-delivery',   label: 'Collection Orders', section: 'management'  },
];

const PAGE_TITLES = {
  '/dashboard':         'Dashboard',
  '/pathologies':       'Pathologies',
  '/collectors':        'Collectors',
  '/test-orders':       'Test Orders',
  '/collection-orders': 'Collection Orders',
};

export default function Layout({ user, onLogout }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'PathLab Pro';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <i className="ti ti-flask" aria-hidden="true" />
          </div>
          <div>
            <div className="logo-name">PathLab Pro</div>
            <div className="logo-sub">Laboratory Management</div>
          </div>
          <button className="sidebar-close icon-btn" onClick={closeSidebar} aria-label="Close menu">
            <i className="ti ti-x" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            {NAV.filter(n => n.section === 'overview').map(n => (
              <NavLink key={n.to} to={n.to} onClick={closeSidebar}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <i className={`ti ${n.icon}`} aria-hidden="true" />
                {n.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-label">Management</div>
            {NAV.filter(n => n.section === 'management').map(n => (
              <NavLink key={n.to} to={n.to} onClick={closeSidebar}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <i className={`ti ${n.icon}`} aria-hidden="true" />
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item">
            <i className="ti ti-settings" aria-hidden="true" /> Settings
          </div>
          {onLogout && (
            <button className="nav-item nav-item--btn logout-btn" onClick={onLogout}>
              <i className="ti ti-logout" aria-hidden="true" /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Open menu">
              <i className="ti ti-menu-2" />
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Refresh" aria-label="Refresh">
              <i className="ti ti-refresh" />
            </button>
            {user?.name && (
              <span className="user-name">{user.name}</span>
            )}
            <div className="user-avatar" aria-label="User avatar">{initials}</div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

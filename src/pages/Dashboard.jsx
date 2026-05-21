import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api';
import './Dashboard.css';

const STAT_CONFIG = [
  { key: 'pathologies',      label: 'Pathologies',       icon: 'ti-virus',           route: '/pathologies',       deltaKey: null,                         deltaLabel: 'total tests' },
  { key: 'collectors',       label: 'Collectors',        icon: 'ti-user-check',      route: '/collectors',        deltaKey: 'collectorsOnDuty',           deltaLabel: 'on duty',    up: true  },
  { key: 'testOrders',       label: 'Test Orders',       icon: 'ti-clipboard-list',  route: '/test-orders',       deltaKey: 'testOrdersPending',          deltaLabel: 'pending',    up: false },
  { key: 'collectionOrders', label: 'Collection Orders', icon: 'ti-truck-delivery',  route: '/collection-orders', deltaKey: 'collectionOrdersScheduled',  deltaLabel: 'scheduled',  up: true  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
        <i className="ti ti-loader-2 spin" style={{ fontSize: 28 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="stats-row">
        {STAT_CONFIG.map(s => {
          const deltaVal = s.deltaKey ? stats[s.deltaKey] : null;
          const deltaText = deltaVal !== null ? `${deltaVal} ${s.deltaLabel}` : `${stats[s.key]} ${s.deltaLabel}`;
          return (
            <div key={s.label} className="stat-card" onClick={() => navigate(s.route)} role="button" tabIndex={0}>
              <div className="stat-label">
                <i className={`ti ${s.icon}`} aria-hidden="true" /> {s.label}
              </div>
              <div className="stat-value">{stats[s.key]}</div>
              <div className={`stat-delta ${s.up === false ? 'delta-amber' : 'delta-up'}`}>{deltaText}</div>
            </div>
          );
        })}
      </div>

      <div className="dash-grid">
        {STAT_CONFIG.map(s => (
          <div key={s.label} className="dash-card" onClick={() => navigate(s.route)} role="button" tabIndex={0}>
            <div className="dash-card-left">
              <div className="dash-icon">
                <i className={`ti ${s.icon}`} aria-hidden="true" />
              </div>
              <div>
                <div className="dash-card-name">{s.label}</div>
                <div className="dash-card-sub">{stats[s.key]} records</div>
              </div>
            </div>
            <i className="ti ti-arrow-right dash-arrow" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

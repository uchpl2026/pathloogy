import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const STATS = [
  { label: 'Pathologies',       icon: 'ti-virus',           value: 5,  delta: '↑ 2 this month', up: true,  route: '/pathologies'        },
  { label: 'Collectors',        icon: 'ti-user-check',      value: 5,  delta: '3 on duty',       up: true,  route: '/collectors'         },
  { label: 'Test Orders',       icon: 'ti-clipboard-list',  value: 5,  delta: '2 pending',       up: false, route: '/test-orders'        },
  { label: 'Collection Orders', icon: 'ti-truck-delivery',  value: 5,  delta: '2 scheduled',     up: true,  route: '/collection-orders'  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="stats-row">
        {STATS.map(s => (
          <div key={s.label} className="stat-card" onClick={() => navigate(s.route)} role="button" tabIndex={0}>
            <div className="stat-label">
              <i className={`ti ${s.icon}`} aria-hidden="true" /> {s.label}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? 'delta-up' : 'delta-amber'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {STATS.map(s => (
          <div key={s.label} className="dash-card" onClick={() => navigate(s.route)} role="button" tabIndex={0}>
            <div className="dash-card-left">
              <div className="dash-icon">
                <i className={`ti ${s.icon}`} aria-hidden="true" />
              </div>
              <div>
                <div className="dash-card-name">{s.label}</div>
                <div className="dash-card-sub">{s.value} records</div>
              </div>
            </div>
            <i className="ti ti-arrow-right dash-arrow" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

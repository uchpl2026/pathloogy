import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api';
import './Dashboard.css';

function fmtMoney(v) {
  return `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subColor, accent, onClick }) {
  return (
    <div className="db-kpi" style={{ '--accent': accent }} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="db-kpi-icon"><i className={`ti ${icon}`} /></div>
      <div className="db-kpi-body">
        <div className="db-kpi-val">{value}</div>
        <div className="db-kpi-label">{label}</div>
        {sub && <div className="db-kpi-sub" style={{ color: subColor || 'var(--text-secondary)' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, badge, action }) {
  return (
    <div className="db-section-header">
      <div className="db-section-title">
        <i className={`ti ${icon}`} />
        <span>{title}</span>
        {badge != null && <span className="db-section-badge">{badge}</span>}
      </div>
      {action}
    </div>
  );
}

// ── Nav Tile ──────────────────────────────────────────────────────────────────
function NavTile({ icon, label, count, sub, accent, route, navigate }) {
  return (
    <div className="db-nav-tile" style={{ '--accent': accent }} onClick={() => navigate(route)} role="button" tabIndex={0}>
      <div className="db-nav-icon"><i className={`ti ${icon}`} /></div>
      <div className="db-nav-body">
        <div className="db-nav-count">{count}</div>
        <div className="db-nav-label">{label}</div>
        {sub && <div className="db-nav-sub">{sub}</div>}
      </div>
      <i className="ti ti-arrow-right db-nav-arrow" />
    </div>
  );
}

// ── Lab Due Row ───────────────────────────────────────────────────────────────
function LabDueRow({ row, idx }) {
  const isDue = row.total_due > 0;
  return (
    <tr>
      <td className="db-td-num">{idx + 1}</td>
      <td><span className="db-lab-chip">{row.lab_name}</span></td>
      <td className="db-td-money">{fmtMoney(row.total_ptl)}</td>
      <td className="db-td-money db-td-green">{fmtMoney(row.total_lp)}</td>
      <td className="db-td-money">
        <span className={`db-due-badge ${isDue ? 'db-due-badge--due' : 'db-due-badge--clear'}`}>
          {fmtMoney(row.total_due)}
        </span>
      </td>
    </tr>
  );
}

// ── Recent Order Row ──────────────────────────────────────────────────────────
function RecentOrderRow({ order }) {
  const paid = (order.payment_status || '').toLowerCase() === 'paid';
  return (
    <tr>
      <td><span className="db-order-id">{order.orderId || '—'}</span></td>
      <td>{order.patient || '—'}</td>
      <td>{order.lab_name ? <span className="db-lab-chip">{order.lab_name}</span> : '—'}</td>
      <td className="db-td-money">{order.amount_received ? fmtMoney(order.amount_received) : '—'}</td>
      <td><span className={`db-status-badge ${paid ? 'db-status-badge--paid' : 'db-status-badge--unpaid'}`}>{order.payment_status || '—'}</span></td>
    </tr>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
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
      <div className="db-loading">
        <i className="ti ti-loader-2 spin" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const labDue     = stats.labDueSummary     || [];
  const totalDue   = stats.totalDueAllLabs   || 0;
  const recentOrds = stats.recentOrders      || [];
  const totalRev   = stats.totalRevenue      || 0;
  const pendingCnt = stats.pendingOrdersCount || 0;

  return (
    <div className="db-root">

      {/* ── Welcome banner ── */}
      <div className="db-banner">
        <div className="db-banner-left">
          <div className="db-banner-icon"><i className="ti ti-microscope" /></div>
          <div>
            <h1 className="db-banner-title">PathLab Pro</h1>
            <p className="db-banner-sub">Laboratory Management Overview</p>
          </div>
        </div>
        <div className="db-banner-date">
          <i className="ti ti-calendar" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="db-kpi-row">
        <KpiCard icon="ti-cash" label="Total Revenue" value={fmtMoney(totalRev)} sub="From paid orders" subColor="#1D9E75" accent="#1D9E75" />
        <KpiCard icon="ti-wallet" label="Total Due to Labs" value={fmtMoney(totalDue)} sub={`Across ${labDue.length} labs`} subColor={totalDue > 0 ? '#C0392B' : '#1D9E75'} accent={totalDue > 0 ? '#C0392B' : '#1D9E75'} onClick={() => navigate('/payment-report')} />
        <KpiCard icon="ti-truck-delivery" label="Collection Orders" value={stats.collectionOrders} sub={`${stats.collectionOrdersScheduled} scheduled`} accent="#185FA5" onClick={() => navigate('/collection-orders')} />
        <KpiCard icon="ti-clock-exclamation" label="Pending Payments" value={pendingCnt} sub="Orders not yet paid" subColor={pendingCnt > 0 ? '#C0392B' : '#1D9E75'} accent="#E67E22" />
      </div>

      {/* ── Middle row: Quick Nav + Lab Due ── */}
      <div className="db-mid-row">

        {/* Quick Navigation */}
        <div className="db-panel">
          <SectionHeader icon="ti-layout-grid" title="Quick Navigation" />
          <div className="db-nav-grid">
            <NavTile icon="ti-virus"             label="Pathologies"       count={stats.pathologies}      sub="Test categories"               accent="#8E44AD" route="/pathologies"       navigate={navigate} />
            <NavTile icon="ti-user-check"        label="Collectors"        count={stats.collectors}       sub={`${stats.collectorsOnDuty} active`} accent="#1D9E75" route="/collectors"   navigate={navigate} />
            <NavTile icon="ti-building-hospital" label="Labs"              count={stats.labs}             sub={`${stats.activeLabs} active`}  accent="#185FA5" route="/labs"             navigate={navigate} />
            <NavTile icon="ti-truck-delivery"    label="Collection Orders" count={stats.collectionOrders} sub={`${stats.collectionOrdersScheduled} scheduled`} accent="#E67E22" route="/collection-orders" navigate={navigate} />
            <NavTile icon="ti-credit-card"       label="Lab Payments"      count=""                       sub="Manage disbursements"          accent="#C0392B" route="/lab-payments"      navigate={navigate} />
            <NavTile icon="ti-chart-bar"         label="Payment Report"    count=""                       sub="Full reconciliation"           accent="#2980B9" route="/payment-report"    navigate={navigate} />
          </div>
        </div>

        {/* Lab Due Summary */}
        <div className="db-panel db-panel--due">
          <SectionHeader
            icon="ti-wallet"
            title="Total Due per Lab"
            badge={labDue.length}
            action={
              <button className="db-link-btn" onClick={() => navigate('/payment-report')}>
                Full Report <i className="ti ti-arrow-right" />
              </button>
            }
          />
          {labDue.length === 0 ? (
            <div className="db-empty"><i className="ti ti-circle-check" /> All dues cleared</div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th className="db-th-num">#</th>
                    <th>Lab</th>
                    <th className="db-th-right">Assigned</th>
                    <th className="db-th-right">Disbursed</th>
                    <th className="db-th-right">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {labDue.map((row, idx) => <LabDueRow key={row.lab_name} row={row} idx={idx} />)}
                </tbody>
                <tfoot>
                  <tr className="db-tfoot-row">
                    <td colSpan={2} className="db-tfoot-label">Grand Total</td>
                    <td className="db-td-money db-tfoot-val">{fmtMoney(labDue.reduce((s, r) => s + r.total_ptl, 0))}</td>
                    <td className="db-td-money db-td-green db-tfoot-val">{fmtMoney(labDue.reduce((s, r) => s + r.total_lp, 0))}</td>
                    <td className="db-td-money db-tfoot-val">
                      <span className={`db-due-badge ${totalDue <= 0 ? 'db-due-badge--clear' : 'db-due-badge--due'}`}>{fmtMoney(totalDue)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Recent Orders ── */}
      <div className="db-panel">
        <SectionHeader
          icon="ti-receipt"
          title="Recent Collection Orders"
          badge={recentOrds.length}
          action={
            <button className="db-link-btn" onClick={() => navigate('/collection-orders')}>
              View All <i className="ti ti-arrow-right" />
            </button>
          }
        />
        {recentOrds.length === 0 ? (
          <div className="db-empty"><i className="ti ti-inbox" /> No orders yet</div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Lab</th>
                  <th className="db-th-right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrds.map((o, i) => <RecentOrderRow key={o.orderId || i} order={o} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

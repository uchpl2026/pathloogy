import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../api';
import './Reports.css';

const GROUP_OPTIONS = [
  { value: 'date_range', label: 'Date Range (All)', icon: 'ti-calendar-stats' },
  { value: 'collector',  label: 'Collector Wise',   icon: 'ti-user-check'     },
  { value: 'month',      label: 'Month Wise',        icon: 'ti-calendar-month' },
  { value: 'year',       label: 'Year Wise',         icon: 'ti-calendar'       },
  { value: 'lab',        label: 'Lab Wise',          icon: 'ti-building-hospital' },
];

const STATUS_COLORS = {
  Collected:   '#1D9E75',
  Scheduled:   '#185FA5',
  'In Transit':'#E0860A',
  Failed:      '#A32D2D',
};

function SummaryBar({ summary, compact }) {
  const pills = [
    { label: 'Total',       val: summary.total,          color: '#5f5e5a' },
    { label: 'Collected',   val: summary.collected,      color: STATUS_COLORS.Collected },
    { label: 'Scheduled',   val: summary.scheduled,      color: STATUS_COLORS.Scheduled },
    { label: 'In Transit',  val: summary.in_transit,     color: STATUS_COLORS['In Transit'] },
    { label: 'Failed',      val: summary.failed,         color: STATUS_COLORS.Failed },
  ];
  return (
    <div className={`rpt-summary-bar ${compact ? 'rpt-summary-bar--compact' : ''}`}>
      <div className="rpt-pills">
        {pills.map(p => (
          <span key={p.label} className="rpt-pill" style={{ '--pill-color': p.color }}>
            <span className="rpt-pill-dot" />{p.label}: <strong>{p.val}</strong>
          </span>
        ))}
      </div>
      <div className="rpt-financials">
        <span className="rpt-fin-item">
          <i className="ti ti-receipt" /> Billed: <strong>₹{summary.billed_amount?.toLocaleString()}</strong>
        </span>
        <span className="rpt-fin-item rpt-fin-received">
          <i className="ti ti-cash" /> Received: <strong>₹{summary.amount_received?.toLocaleString()}</strong>
        </span>
        <span className="rpt-fin-item">
          <i className="ti ti-check" /> Paid: <strong>{summary.paid}</strong>
        </span>
        <span className="rpt-fin-item rpt-fin-unpaid">
          <i className="ti ti-clock" /> Unpaid: <strong>{summary.not_paid}</strong>
        </span>
      </div>
    </div>
  );
}

function OrderRow({ order, idx }) {
  const [open, setOpen] = useState(false);
  const statusColor = STATUS_COLORS[order.status] || '#5f5e5a';
  return (
    <>
      <tr className={`rpt-order-row ${open ? 'rpt-order-row--open' : ''}`} onClick={() => setOpen(v => !v)}>
        <td className="rpt-td-idx">{idx + 1}</td>
        <td><span className="rpt-order-id">{order.orderId}</span></td>
        <td>{order.patient}</td>
        <td>{order.collector}</td>
        <td>{order.lab_name || '—'}</td>
        <td>{order.scheduled || order.test_date || '—'}</td>
        <td>
          <span className="rpt-status-badge" style={{ '--sc': statusColor }}>{order.status}</span>
        </td>
        <td className="rpt-td-right">{order.billed_amount ? `₹${order.billed_amount}` : '—'}</td>
        <td className="rpt-td-right">{order.amount_received ? `₹${order.amount_received}` : '—'}</td>
        <td>
          <span className={`rpt-pay-badge rpt-pay-badge--${order.payment_status === 'Paid' ? 'paid' : 'unpaid'}`}>
            {order.payment_status || 'Not Paid'}
          </span>
        </td>
        <td className="rpt-td-expand"><i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} /></td>
      </tr>
      {open && (
        <tr className="rpt-detail-row">
          <td colSpan={11}>
            <div className="rpt-detail-grid">
              <div><label>Address</label><span>{order.address || '—'}</span></div>
              <div><label>Phone</label><span>{order.patient_phone || '—'}</span></div>
              <div><label>Email</label><span>{order.patient_email || '—'}</span></div>
              <div><label>Tests</label><span>{(order.tests || []).join(', ') || '—'}</span></div>
              <div><label>Payment Date</label><span>{order.payment_date || '—'}</span></div>
              <div><label>Test Date</label><span>{order.test_date || '—'}</span></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function GroupCard({ group, expanded: initExpanded }) {
  const [expanded, setExpanded] = useState(initExpanded);
  return (
    <div className="rpt-group-card">
      <div className="rpt-group-header" onClick={() => setExpanded(v => !v)}>
        <div className="rpt-group-title">
          <i className="ti ti-folder" />
          <span>{group.group}</span>
          <span className="rpt-group-count">{group.summary.total} orders</span>
        </div>
        <div className="rpt-group-actions">
          <SummaryBar summary={group.summary} compact />
          <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} rpt-chevron`} />
        </div>
      </div>
      {expanded && (
        <div className="rpt-group-body">
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Collector</th>
                  <th>Lab</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th className="rpt-td-right">Billed</th>
                  <th className="rpt-td-right">Received</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {group.orders.map((o, i) => <OrderRow key={o.id} order={o} idx={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const RESET_FILTERS = {
  date_from: '',
  date_to:   '',
  collector: '',
  lab_name:  '',
  group_by:  'date_range',
};

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + '01';

  const [filters, setFilters] = useState({
    date_from: firstOfMonth,
    date_to:   today,
    collector: '',
    lab_name:  '',
    group_by:  'date_range',
  });
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [collectors, setCollectors] = useState([]);
  const [labs,       setLabs]       = useState([]);

  // Load filter options
  useEffect(() => {
    reportsAPI.collectors().then(setCollectors).catch(() => {});
    reportsAPI.labs().then(setLabs).catch(() => {});
  }, []);

  const runReport = useCallback(() => {
    setLoading(true);
    setError('');
    reportsAPI.get(filters)
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters(RESET_FILTERS);
    setLoading(true);
    setError('');
    reportsAPI.get(RESET_FILTERS)
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { runReport(); }, []); // eslint-disable-line

  function handlePrint() {
    window.print();
  }

  function handleCSVExport() {
    if (!data) return;
    const rows = [['Order ID','Patient','Collector','Lab','Scheduled','Status','Billed','Received','Payment Status']];
    data.groups.forEach(g => {
      g.orders.forEach(o => {
        rows.push([
          o.orderId, o.patient, o.collector, o.lab_name || '',
          o.scheduled || o.test_date || '',
          o.status,
          o.billed_amount || '', o.amount_received || '', o.payment_status || '',
        ]);
      });
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `pathlab-report-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeGroup = GROUP_OPTIONS.find(g => g.value === filters.group_by);

  return (
    <div className="rpt-root">
      {/* ── Filter Panel ── */}
      <div className="rpt-filter-panel card">
        <div className="rpt-filter-title">
          <i className="ti ti-filter" /> Report Filters
        </div>

        {/* Group-by tabs */}
        <div className="rpt-group-tabs">
          {GROUP_OPTIONS.map(g => (
            <button
              key={g.value}
              className={`rpt-tab ${filters.group_by === g.value ? 'rpt-tab--active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, group_by: g.value }))}
            >
              <i className={`ti ${g.icon}`} /> {g.label}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="rpt-filter-row">
          <div className="rpt-filter-field">
            <label>From Date</label>
            <input type="date" value={filters.date_from}
              onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} />
          </div>
          <div className="rpt-filter-field">
            <label>To Date</label>
            <input type="date" value={filters.date_to}
              onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} />
          </div>
          <div className="rpt-filter-field">
            <label>Collector</label>
            <select value={filters.collector}
              onChange={e => setFilters(f => ({ ...f, collector: e.target.value }))}>
              <option value="">All Collectors</option>
              {collectors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rpt-filter-field">
            <label>Lab</label>
            <select value={filters.lab_name}
              onChange={e => setFilters(f => ({ ...f, lab_name: e.target.value }))}>
              <option value="">All Labs</option>
              {labs.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="rpt-filter-actions">
            <button className="btn btn-primary" onClick={runReport} disabled={loading}>
              <i className="ti ti-search" /> {loading ? 'Loading…' : 'Generate'}
            </button>
            <button className="btn rpt-reset-btn" onClick={handleReset} disabled={loading} title="Clear all filters and show all data">
              <i className="ti ti-refresh" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rpt-error"><i className="ti ti-alert-circle" /> {error}</div>
      )}

      {/* ── Results ── */}
      {data && (
        <div className="rpt-results">
          {/* Overall summary header */}
          <div className="rpt-results-header">
            <div className="rpt-results-meta">
              <span className="rpt-results-label">
                <i className={`ti ${activeGroup?.icon}`} /> {activeGroup?.label}
              </span>
              {(filters.date_from || filters.date_to) && (
                <span className="rpt-date-range">
                  {filters.date_from} → {filters.date_to}
                </span>
              )}
              <span className="rpt-total-badge">{data.total_orders} orders</span>
            </div>
            <div className="rpt-export-btns no-print">
              <button className="btn" onClick={handleCSVExport}>
                <i className="ti ti-file-spreadsheet" /> Export CSV
              </button>
              <button className="btn" onClick={handlePrint}>
                <i className="ti ti-printer" /> Print
              </button>
            </div>
          </div>

          {/* Overall KPI cards */}
          <div className="rpt-kpi-row">
            {[
              { label: 'Total Orders',   val: data.overall.total,          icon: 'ti-clipboard-list',  color: '#185FA5' },
              { label: 'Collected',      val: data.overall.collected,       icon: 'ti-check-circle',    color: '#1D9E75' },
              { label: 'Scheduled',      val: data.overall.scheduled,       icon: 'ti-clock',           color: '#185FA5' },
              { label: 'In Transit',     val: data.overall.in_transit,      icon: 'ti-truck-delivery',  color: '#E0860A' },
              { label: 'Failed',         val: data.overall.failed,          icon: 'ti-x-circle',        color: '#A32D2D' },
              { label: 'Total Billed',   val: `₹${data.overall.billed_amount?.toLocaleString()}`,   icon: 'ti-receipt',  color: '#5f5e5a' },
              { label: 'Total Received', val: `₹${data.overall.amount_received?.toLocaleString()}`, icon: 'ti-cash',     color: '#1D9E75' },
              { label: 'Paid',           val: data.overall.paid,            icon: 'ti-check',           color: '#1D9E75' },
            ].map(k => (
              <div key={k.label} className="rpt-kpi" style={{ '--kc': k.color }}>
                <i className={`ti ${k.icon}`} />
                <div className="rpt-kpi-val">{k.val}</div>
                <div className="rpt-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Groups */}
          {data.groups.length === 0 ? (
            <div className="rpt-empty">
              <i className="ti ti-mood-empty" />
              <p>No orders found for the selected filters.</p>
            </div>
          ) : (
            <div className="rpt-groups">
              {data.groups.map((g, i) => (
                <GroupCard key={g.group} group={g} expanded={data.groups.length === 1 || i === 0} />
              ))}
            </div>
          )}
        </div>
      )}

      {loading && !data && (
        <div className="rpt-loader">
          <i className="ti ti-loader-2 spin" /> Generating report…
        </div>
      )}
    </div>
  );
}

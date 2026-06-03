import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { paymentReportAPI } from '../api';
import './PaymentReport.css';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const GROUP_OPTIONS = [
  { value: 'date_range', label: 'Date Range',  icon: 'ti-calendar-stats' },
  { value: 'month',      label: 'Month Wise',  icon: 'ti-calendar-month' },
  { value: 'year',       label: 'Year Wise',   icon: 'ti-calendar'       },
  { value: 'lab',        label: 'Lab Wise',    icon: 'ti-building-hospital' },
];

// ── PaymentRow ────────────────────────────────────────────────────────────────
function PaymentRow({ order, idx }) {
  const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
  return (
    <tr className="pr-tr">
      <td className="pr-td-num">{idx + 1}</td>
      <td className="pr-td-date">{order.payment_date?.slice(0, 10) || '—'}</td>
      <td><span className="pr-order-id">{order.orderId || '—'}</span></td>
      <td>{order.patient || '—'}</td>
      <td>
        {order.lab_name
          ? <span className="pr-lab-chip">{order.lab_name}</span>
          : '—'}
      </td>
      <td className="pr-td-money">{order.amount_received ? fmtMoney(order.amount_received) : '—'}</td>
      <td className="pr-td-money pr-td-paid">{order.paid_to_lab ? fmtMoney(order.paid_to_lab) : '—'}</td>
      <td>
        <span className={`pr-status-badge ${isPaid ? 'pr-status-badge--paid' : 'pr-status-badge--unpaid'}`}>
          {order.payment_status || '—'}
        </span>
      </td>
    </tr>
  );
}

// ── LabPaymentRow ─────────────────────────────────────────────────────────────
function LabPaymentRow({ payment, idx }) {
  return (
    <tr className="pr-tr pr-tr--lp">
      <td className="pr-td-num">{idx + 1}</td>
      <td className="pr-td-date">{payment.payment_date || '—'}</td>
      <td>
        {payment.lab_name
          ? <span className="pr-lab-chip">{payment.lab_name}</span>
          : '—'}
      </td>
      <td className="pr-td-money pr-td-danger">{fmtMoney(payment.amount_paid)}</td>
      <td colSpan={4} className="pr-td-notes">{payment.notes || '—'}</td>
    </tr>
  );
}

// ── GroupCard ─────────────────────────────────────────────────────────────────
function GroupCard({ groupData }) {
  const [tab, setTab] = useState('orders');
  const [expanded, setExpanded] = useState(true);
  const { group, orders, lab_payments, summary } = groupData;
  const netPositive = summary.net_balance >= 0;

  return (
    <div className="pr-group-card">
      <div className="pr-group-header" onClick={() => setExpanded(v => !v)}>
        <div className="pr-group-title">
          <i className="ti ti-folder-open" />
          <span>{group}</span>
          <span className="pr-group-count">{orders.length} orders</span>
          {lab_payments.length > 0 && (
            <span className="pr-group-count pr-group-count--lp">{lab_payments.length} lab payments</span>
          )}
        </div>
        <div className="pr-group-pills">
          <span className="pr-gpill pr-gpill--recv">
            <i className="ti ti-arrow-down-circle" /> {fmtMoney(summary.amount_received)}
          </span>
          <span className="pr-gpill pr-gpill--labpay">
            <i className="ti ti-arrow-up-circle" /> {fmtMoney(summary.lab_payments_total)}
          </span>
          <span className={`pr-gpill ${netPositive ? 'pr-gpill--net-pos' : 'pr-gpill--net-neg'}`}>
            <i className={`ti ${netPositive ? 'ti-trending-up' : 'ti-trending-down'}`} />
            Net {fmtMoney(summary.net_balance)}
          </span>
          <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} pr-chevron`} />
        </div>
      </div>

      {expanded && (
        <div className="pr-group-body">
          <div className="pr-tabs">
            <button
              className={`pr-tab ${tab === 'orders' ? 'pr-tab--active' : ''}`}
              onClick={() => setTab('orders')}
            >
              <i className="ti ti-receipt" /> Collection Payments
              <span className="pr-tab-count">{orders.length}</span>
            </button>
            <button
              className={`pr-tab ${tab === 'labpay' ? 'pr-tab--active' : ''}`}
              onClick={() => setTab('labpay')}
            >
              <i className="ti ti-building-hospital" /> Lab Disbursements
              <span className="pr-tab-count">{lab_payments.length}</span>
            </button>
          </div>

          {tab === 'orders' && (
            orders.length === 0 ? (
              <div className="pr-inner-empty">No collection payment records in this period.</div>
            ) : (
              <div className="pr-table-wrap">
                <table className="pr-table">
                  <thead>
                    <tr>
                      <th className="pr-th-num">#</th>
                      <th>Payment Date</th>
                      <th>Order ID</th>
                      <th>Patient</th>
                      <th>Lab</th>
                      <th className="pr-th-right">Amount Received</th>
                      <th className="pr-th-right">Paid to Lab</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <PaymentRow key={order.id || idx} order={order} idx={idx} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="pr-tfoot-row">
                      <td colSpan={5} className="pr-tfoot-label">Group Total</td>
                      <td className="pr-td-money pr-tfoot-val">{fmtMoney(summary.amount_received)}</td>
                      <td className="pr-td-money pr-td-paid pr-tfoot-val">{fmtMoney(summary.paid_to_lab)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}

          {tab === 'labpay' && (
            lab_payments.length === 0 ? (
              <div className="pr-inner-empty">No lab disbursements recorded in this period.</div>
            ) : (
              <div className="pr-table-wrap">
                <table className="pr-table">
                  <thead>
                    <tr>
                      <th className="pr-th-num">#</th>
                      <th>Payment Date</th>
                      <th>Lab</th>
                      <th className="pr-th-right">Amount Paid</th>
                      <th colSpan={4}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab_payments.map((p, idx) => (
                      <LabPaymentRow key={p.id || idx} payment={p} idx={idx} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="pr-tfoot-row">
                      <td colSpan={3} className="pr-tfoot-label">Group Total</td>
                      <td className="pr-td-money pr-td-danger pr-tfoot-val">{fmtMoney(summary.lab_payments_total)}</td>
                      <td colSpan={4} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── PaymentReport (main) ──────────────────────────────────────────────────────
export default function PaymentReport() {
  const today         = new Date().toISOString().slice(0, 10);
  const firstOfMonth  = today.slice(0, 8) + '01';

  const [filters, setFilters] = useState({
    date_from: firstOfMonth,
    date_to:   today,
    lab_name:  '',
    group_by:  'date_range',
  });

  const [reportData, setReportData] = useState(null);
  const [labs, setLabs]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Load lab list once
  useEffect(() => {
    paymentReportAPI.labs()
      .then(setLabs)
      .catch(() => {});
  }, []);

  const fetchReport = useCallback((f) => {
    setLoading(true);
    setError('');
    paymentReportAPI.generate(f)
      .then(data => setReportData(data))
      .catch(err => setError(err.message || 'Unable to load payment report'))
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => { fetchReport(filters); }, []);   // eslint-disable-line

  function handleGenerate() { fetchReport(filters); }

  function handleReset() {
    const next = { date_from: firstOfMonth, date_to: today, lab_name: '', group_by: 'date_range' };
    setFilters(next);
    fetchReport(next);
  }

  function handleExport() {
    if (!reportData) return;
    const allOrders = reportData.groups.flatMap(g => g.orders);
    if (!allOrders.length) return;
    const header = ['Payment Date', 'Order ID', 'Patient', 'Lab', 'Amount Received', 'Paid To Lab', 'Payment Status'];
    const rowsCsv = allOrders.map(o => [
      o.payment_date?.slice(0, 10) || '',
      o.orderId || '',
      o.patient || '',
      o.lab_name || '',
      o.amount_received || '',
      o.paid_to_lab || '',
      o.payment_status || '',
    ]);
    const csv = [header, ...rowsCsv]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `payment-report-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const overall   = reportData?.overall   || {};
  const groups    = reportData?.groups    || [];
  const netPos    = (overall.net_balance || 0) >= 0;
  const activeGrp = GROUP_OPTIONS.find(g => g.value === filters.group_by);

  const kpis = [
    {
      label: 'Total Orders',
      val:   overall.total_orders ?? '—',
      icon:  'ti-receipt',
      color: 'var(--blue)',
      bg:    'var(--blue-light)',
    },
    {
      label: 'Amount Received',
      val:   overall.amount_received != null ? fmtMoney(overall.amount_received) : '—',
      icon:  'ti-cash',
      color: '#1D9E75',
      bg:    '#E6F5EF',
    },
    {
      label: 'Lab Disbursements',
      val:   overall.lab_payments_total != null ? fmtMoney(overall.lab_payments_total) : '—',
      icon:  'ti-building-hospital',
      color: '#A32D2D',
      bg:    '#FFF4F4',
    },
    {
      label: 'Net Balance',
      val:   overall.net_balance != null ? fmtMoney(overall.net_balance) : '—',
      icon:  netPos ? 'ti-trending-up' : 'ti-trending-down',
      color: netPos ? '#1D9E75' : '#A32D2D',
      bg:    netPos ? '#E6F5EF' : '#FFF4F4',
    },
  ];

  return (
    <div className="pr-root">

      {/* ── Filter Panel ── */}
      <div className="pr-filter-card card">
        <div className="pr-filter-header">
          <div className="pr-filter-header-left">
            <div className="pr-filter-icon"><i className="ti ti-chart-bar" /></div>
            <div>
              <h2 className="pr-filter-title">Payment Report</h2>
              <p className="pr-filter-sub">Reconcile collections received vs. lab disbursements</p>
            </div>
          </div>
        </div>

        <div className="pr-filter-body">
          {/* Group tabs */}
          <div className="pr-group-tabs">
            {GROUP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`pr-gtab ${filters.group_by === opt.value ? 'pr-gtab--active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, group_by: opt.value }))}
              >
                <i className={`ti ${opt.icon}`} /> {opt.label}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="pr-filter-row">
            <div className="pr-field">
              <label>From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
              />
            </div>
            <div className="pr-field">
              <label>To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
              />
            </div>
            <div className="pr-field">
              <label>Lab</label>
              <select
                value={filters.lab_name}
                onChange={e => setFilters(f => ({ ...f, lab_name: e.target.value }))}
              >
                <option value="">All Labs</option>
                {labs.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="pr-filter-actions">
              <button className="pr-btn pr-btn--primary" onClick={handleGenerate} disabled={loading}>
                {loading
                  ? <><i className="ti ti-loader-2 spin" /> Loading…</>
                  : <><i className="ti ti-search" /> Generate</>}
              </button>
              <button className="pr-btn pr-btn--ghost" onClick={handleReset} disabled={loading}>
                <i className="ti ti-refresh" /> Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="pr-error">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* ── Results Panel ── */}
      <div className="pr-results">

        {/* Results header */}
        <div className="pr-results-header">
          <div className="pr-results-meta">
            <span className="pr-results-label">
              <i className={`ti ${activeGrp?.icon}`} /> {activeGrp?.label}
            </span>
            {(filters.date_from || filters.date_to) && (
              <span className="pr-date-range">
                {filters.date_from || '…'} → {filters.date_to || '…'}
              </span>
            )}
            {reportData && (
              <span className="pr-count-chip">{reportData.total_orders} orders</span>
            )}
          </div>
          <button
            className="pr-btn pr-btn--ghost pr-btn--sm"
            onClick={handleExport}
            disabled={!reportData || !reportData.total_orders}
          >
            <i className="ti ti-file-spreadsheet" /> Export CSV
          </button>
        </div>

        {/* KPI row */}
        <div className="pr-kpi-row">
          {kpis.map(k => (
            <div key={k.label} className="pr-kpi" style={{ '--kc': k.color, '--kb': k.bg }}>
              <div className="pr-kpi-icon"><i className={`ti ${k.icon}`} /></div>
              <div className="pr-kpi-val">{k.val}</div>
              <div className="pr-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="pr-loader">
            <i className="ti ti-loader-2 spin" />
            <span>Generating report…</span>
          </div>
        ) : !reportData ? null
          : groups.length === 0 ? (
            <div className="pr-empty">
              <div className="pr-empty-icon"><i className="ti ti-mood-empty" /></div>
              <p>No payment records found for the selected filters.</p>
              <span>Try adjusting the date range or clearing the lab filter.</span>
            </div>
          ) : (
            <div className="pr-groups">
              {groups.map(g => (
                <GroupCard key={g.group} groupData={g} />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

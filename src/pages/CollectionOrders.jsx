import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { collectionOrdersAPI } from '../api';

function parseTests(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

function PaymentBadge({ status }) {
  const map = {
    'Not Paid':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    'Partially Paid': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    'Full Paid':      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };
  const s = map[status] || map['Not Paid'];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 12,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {status || 'Not Paid'}
    </span>
  );
}

const COLUMNS = [
  {
    key: 'orderId', label: 'Order ID',
    render: r => (
      <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>
        {r.orderId}
      </code>
    ),
  },
  {
    key: 'patient', label: 'Patient',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.patient} />
        <div>
          <div style={{ fontWeight: 500 }}>{r.patient}</div>
          {r.patient_phone && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.patient_phone}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'lab_name', label: 'Lab',
    render: r => r.lab_name
      ? <span style={{ fontSize: 12, fontWeight: 500 }}>{r.lab_name}</span>
      : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>,
  },
  {
    key: 'lab_tests', label: 'Tests',
    render: r => {
      const tests = parseTests(r.lab_tests).length ? parseTests(r.lab_tests) : parseTests(r.tests);
      if (!tests.length) return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tests.slice(0, 3).map(t => (
            <span key={t} style={{
              fontSize: 11, padding: '2px 7px', borderRadius: 12,
              background: 'var(--accent-light, #eff6ff)',
              color: 'var(--accent, #2563eb)', fontWeight: 500,
              border: '1px solid var(--accent-border, #bfdbfe)',
            }}>{t}</span>
          ))}
          {tests.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>+{tests.length - 3}</span>
          )}
        </div>
      );
    },
  },
  {
    key: 'collector', label: 'Collector',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.collector} size={24} />
        <span style={{ fontSize: 13 }}>{r.collector}</span>
      </div>
    ),
  },
  {
    key: 'payment_status', label: 'Payment',
    render: r => (
      <div>
        <PaymentBadge status={r.payment_status} />
        {(r.billed_amount || r.amount_received) && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
            {r.billed_amount && <span>Bill: ₹{r.billed_amount}</span>}
            {r.billed_amount && r.amount_received && <span> / </span>}
            {r.amount_received && <span>Rcvd: ₹{r.amount_received}</span>}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'test_date', label: 'Test Date',
    render: r => <span style={{ fontSize: 12 }}>{r.test_date || '—'}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function CollectionOrders({ rows, setRows }) {
  const navigate = useNavigate();

  useEffect(() => {
    collectionOrdersAPI.list().then(setRows).catch(console.error);
  }, []); // eslint-disable-line

  const openAdd  = ()  => navigate('/collection-orders/add');
  const openEdit = row => navigate(`/collection-orders/edit/${row.id}`);

  const del = async (id) => {
    try {
      await collectionOrdersAPI.remove(id);
      setRows(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <CrudTable
      columns={COLUMNS}
      rows={rows}
      onAdd={openAdd}
      onEdit={openEdit}
      onDelete={del}
      addLabel="New Collection Order"
    />
  );
}

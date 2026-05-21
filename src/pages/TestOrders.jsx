import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { testOrdersAPI } from '../api';

const COLUMNS = [
  {
    key: 'orderId', label: 'Order ID',
    render: r => <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>{r.orderId}</code>,
  },
  {
    key: 'patient', label: 'Patient',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.patient} />
        <span style={{ fontWeight: 500 }}>{r.patient}</span>
      </div>
    ),
  },
  { key: 'test',   label: 'Test' },
  { key: 'doctor', label: 'Doctor', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.doctor}</span> },
  { key: 'date',   label: 'Date'   },
  {
    key: 'priority', label: 'Priority',
    render: r => r.priority === 'Urgent'
      ? <span className="badge badge-red">🔴 Urgent</span>
      : <span className="badge badge-gray">Routine</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function TestOrders() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    testOrdersAPI.list().then(setRows).catch(console.error);
  }, []);

  const del = async (id) => {
    try {
      await testOrdersAPI.remove(id);
      setRows(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <CrudTable
      columns={COLUMNS}
      rows={rows}
      onAdd={() => navigate('/test-orders/add')}
      onEdit={row => navigate(`/test-orders/edit/${row.id}`)}
      onDelete={del}
      addLabel="New Test Order"
    />
  );
}

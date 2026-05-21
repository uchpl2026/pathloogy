import React from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';

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
  {
    key: 'collector', label: 'Collector',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.collector} size={24} />
        <span>{r.collector}</span>
      </div>
    ),
  },
  {
    key: 'address', label: 'Address',
    render: r => <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, display: 'block' }}>{r.address}</span>,
  },
  {
    key: 'scheduled', label: 'Scheduled',
    render: r => <span style={{ fontSize: 12 }}>{r.scheduled}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function CollectionOrders({ rows, setRows }) {
  const navigate = useNavigate();

  const openAdd = () => navigate('/collection-orders/add');
  const openEdit = row => navigate(`/collection-orders/edit/${row.id}`);
  const del = id => setRows(r => r.filter(x => x.id !== id));

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

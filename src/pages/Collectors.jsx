import React from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';

const COLUMNS = [
  {
    key: 'name', label: 'Name',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.name} />
        <span style={{ fontWeight: 500 }}>{r.name}</span>
      </div>
    ),
  },
  {
    key: 'empId', label: 'Emp ID',
    render: r => <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>{r.empId}</code>,
  },
  { key: 'phone',   label: 'Phone'   },
  { key: 'zone',    label: 'Zone'    },
  {
    key: 'samples', label: 'Samples',
    render: r => <span style={{ fontWeight: 500 }}>{r.samples}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function Collectors({ rows, setRows }) {
  const navigate = useNavigate();

  const openAdd = () => navigate('/collectors/add');
  const openEdit = row => navigate(`/collectors/edit/${row.id}`);
  const del = id => setRows(r => r.filter(x => x.id !== id));

  return (
    <CrudTable
      columns={COLUMNS}
      rows={rows}
      onAdd={openAdd}
      onEdit={openEdit}
      onDelete={del}
      addLabel="Add Collector"
    />
  );
}

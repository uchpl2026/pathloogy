import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { collectorsAPI } from '../api';

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

  // Refresh list on mount
  useEffect(() => {
    collectorsAPI.list().then(setRows).catch(console.error);
  }, []); // eslint-disable-line

  const openAdd  = ()  => navigate('/collectors/add');
  const openEdit = row => navigate(`/collectors/edit/${row.id}`);

  const del = async (id) => {
    try {
      await collectorsAPI.remove(id);
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
      addLabel="Add Collector"
    />
  );
}

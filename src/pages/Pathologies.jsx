import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import { pathologiesAPI } from '../api';

const COLUMNS = [
  {
    key: 'name', label: 'Test Name',
    render: r => <span style={{ fontWeight: 500 }}>{r.name}</span>,
  },
  {
    key: 'code', label: 'Code',
    render: r => <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>{r.code}</code>,
  },
  {
    key: 'clientCode', label: 'Client Code',
    render: r => r.clientCode
      ? <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4, color: 'var(--text-secondary)' }}>{r.clientCode}</code>
      : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>,
  },
  { key: 'category',   label: 'Category'   },
  { key: 'turnaround', label: 'Turnaround' },
  { key: 'price',      label: 'Price'      },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function Pathologies() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    pathologiesAPI.list().then(setRows).catch(console.error);
  }, []);

  const del = async (id) => {
    try {
      await pathologiesAPI.remove(id);
      setRows(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <CrudTable
      columns={COLUMNS}
      rows={rows}
      onAdd={() => navigate('/pathologies/add')}
      onEdit={row => navigate(`/pathologies/edit/${row.id}`)}
      onDelete={del}
      addLabel="Add Pathology"
    />
  );
}

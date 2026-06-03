import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import { pathologiesAPI } from '../api';

const COLUMNS = [
  {
    key: 'name', label: 'Test Name',
    render: r => <span style={{ fontWeight: 500 }}>{r.name}</span>,
  },
  {
    key: 'description', label: 'Description',
    render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.description || '—'}</span>,
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

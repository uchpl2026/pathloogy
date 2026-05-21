import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import Avatar from '../components/Avatar';
import { collectorsAPI } from '../api';

const COLUMNS = [
  {
    key: 'name', label: 'Name',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.name} />
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          {r.email && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.email}</div>
          )}
        </div>
      </div>
    ),
  },
  { key: 'phone', label: 'Phone',
    render: r => r.phone || <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>,
  },

];

export default function Collectors({ rows, setRows }) {
  const navigate = useNavigate();

  useEffect(() => {
    collectorsAPI.list().then(setRows).catch(console.error);
  }, []); // eslint-disable-line

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
      onAdd={() => navigate('/collectors/add')}
      onEdit={row => navigate(`/collectors/edit/${row.id}`)}
      onDelete={del}
      addLabel="Add Collector"
    />
  );
}

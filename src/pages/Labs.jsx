import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CrudTable from '../components/CrudTable';
import StatusBadge from '../components/StatusBadge';
import { labsAPI } from '../api';

const COLUMNS = [
  {
    key: 'name', label: 'Lab Name',
    render: r => (
      <div>
        <div style={{ fontWeight: 600 }}>{r.name}</div>
        {r.my_lab_code && (
          <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)', marginTop: 3, display: 'inline-block' }}>
            {r.my_lab_code}
          </code>
        )}
      </div>
    ),
  },
  {
    key: 'available_tests', label: 'Available Tests',
    render: r => {
      const tests = Array.isArray(r.available_tests) ? r.available_tests : [];
      if (!tests.length)
        return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tests.slice(0, 3).map((t, i) => (
            <code key={i} style={{
              fontSize: 11, background: 'var(--bg-secondary)',
              padding: '2px 6px', borderRadius: 4,
            }}>{t.test_name}</code>
          ))}
          {tests.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>+{tests.length - 3} more</span>
          )}
        </div>
      );
    },
  },
  {
    key: 'deposit_range', label: 'Deposit Range',
    render: r => {
      const tests = Array.isArray(r.available_tests) ? r.available_tests : [];
      const amounts = tests.map(t => parseFloat(t.deposit_amount)).filter(n => !isNaN(n));
      if (!amounts.length)
        return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
      const mn = Math.min(...amounts), mx = Math.max(...amounts);
      return (
        <span style={{ fontWeight: 500, color: 'var(--accent)', fontSize: 13 }}>
          {mn === mx ? `₹${mn}` : `₹${mn} – ₹${mx}`}
        </span>
      );
    },
  },
  {
    key: 'cost_range', label: 'Patient Cost Range',
    render: r => {
      const tests = Array.isArray(r.available_tests) ? r.available_tests : [];
      const costs = tests.map(t => parseFloat(t.patient_cost)).filter(n => !isNaN(n));
      if (!costs.length)
        return <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
      const mn = Math.min(...costs), mx = Math.max(...costs);
      return (
        <span style={{ fontWeight: 500, fontSize: 13 }}>
          {mn === mx ? `₹${mn}` : `₹${mn} – ₹${mx}`}
        </span>
      );
    },
  },
  {
    key: 'contact_phone', label: 'Phone',
    render: r => r.contact_phone ||
      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>,
  },
  {
    key: 'contacts', label: 'Contacts',
    render: r => {
      const c = Array.isArray(r.contacts) ? r.contacts : [];
      return c.length
        ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.length} contact{c.length !== 1 ? 's' : ''}</span>
        : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>;
    },
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function Labs() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    labsAPI.list().then(setRows).catch(console.error);
  }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this lab?')) return;
    try {
      await labsAPI.remove(id);
      setRows(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <CrudTable
      columns={COLUMNS}
      rows={rows}
      onAdd={() => navigate('/labs/add')}
      onEdit={row => navigate(`/labs/edit/${row.id}`)}
      onDelete={del}
      addLabel="Add Lab"
    />
  );
}

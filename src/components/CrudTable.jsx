import React, { useState } from 'react';
import './CrudTable.css';

export default function CrudTable({ columns, rows, onEdit, onDelete, onAdd, onView, addLabel = 'Add Record' }) {
  const [search, setSearch] = useState('');

  const filtered = rows.filter(row =>
    !search || columns.some(col => {
      const val = col.accessor ? col.accessor(row) : row[col.key];
      return String(val || '').toLowerCase().includes(search.toLowerCase());
    })
  );

  const confirmDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    onDelete(id);
  };

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="search-wrap">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            className="search-input"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search records"
          />
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <i className="ti ti-plus" aria-hidden="true" /> {addLabel}
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                  <i className="ti ti-database-off" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                  No records found
                </td>
              </tr>
            ) : filtered.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                  </td>
                ))}
                <td>
                  <div className="action-btns">
                    {onView && (
                      <button className="icon-btn view" onClick={() => onView(row)} title="View" aria-label={`View record ${row.id}`}>
                        <i className="ti ti-eye" />
                      </button>
                    )}
                    <button className="icon-btn" onClick={() => onEdit(row)} title="Edit" aria-label={`Edit record ${row.id}`}>
                      <i className="ti ti-edit" />
                    </button>
                    <button className="icon-btn del" onClick={() => confirmDelete(row.id)} title="Delete" aria-label={`Delete record ${row.id}`}>
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Showing {filtered.length} of {rows.length} records</span>
        <div className="page-btns">
          <button className="page-btn" aria-label="Previous page">
            <i className="ti ti-chevron-left" style={{ fontSize: 12 }} />
          </button>
          <button className="page-btn active">1</button>
          <button className="page-btn" aria-label="Next page">
            <i className="ti ti-chevron-right" style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

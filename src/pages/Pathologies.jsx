import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { pathologiesData } from '../data/mockData';
import { nextId } from '../utils';

const CATEGORIES = ['Hematology', 'Biochemistry', 'Endocrinology', 'Diabetes', 'Microbiology', 'Immunology'];
const BLANK = { name: '', code: '', category: 'Hematology', turnaround: '', price: '', status: 'Active' };

const COLUMNS = [
  {
    key: 'name', label: 'Test Name',
    render: r => <span style={{ fontWeight: 500 }}>{r.name}</span>,
  },
  {
    key: 'code', label: 'Code',
    render: r => <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>{r.code}</code>,
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
  const [rows, setRows]       = useState(pathologiesData);
  const [modal, setModal]     = useState(null);   // null | 'add' | 'edit'
  const [form, setForm]       = useState(BLANK);

  const openAdd  = ()      => { setForm(BLANK); setModal('add'); };
  const openEdit = row     => { setForm({ ...row }); setModal('edit'); };
  const close    = ()      => setModal(null);
  const set      = (k, v)  => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (modal === 'add') {
      setRows(r => [...r, { ...form, id: nextId(r) }]);
    } else {
      setRows(r => r.map(x => x.id === form.id ? form : x));
    }
    close();
  };

  const del = id => setRows(r => r.filter(x => x.id !== id));

  return (
    <>
      <CrudTable
        columns={COLUMNS}
        rows={rows}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={del}
        addLabel="Add Pathology"
      />

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Pathology' : 'Edit Pathology'}
          onClose={close}
          onSave={save}
          saveLabel={modal === 'add' ? 'Add Record' : 'Save Changes'}
        >
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Test Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Blood Glucose" />
            </div>
            <div className="form-row">
              <label className="form-label">Test Code</label>
              <input className="form-input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. BGL-006" />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Turnaround Time</label>
              <input className="form-input" value={form.turnaround} onChange={e => set('turnaround', e.target.value)} placeholder="e.g. 4 hrs" />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Price</label>
              <input className="form-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="₹0" />
            </div>
            <div className="form-row">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

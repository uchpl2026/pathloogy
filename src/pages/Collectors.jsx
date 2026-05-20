import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { collectorsData } from '../data/mockData';
import { nextId } from '../utils';

const ZONES = ['North Kolkata', 'South Kolkata', 'East Kolkata', 'West Kolkata', 'Central'];
const BLANK = { name: '', empId: '', phone: '', zone: 'North Kolkata', samples: 0, status: 'On Duty' };

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

export default function Collectors() {
  const [rows, setRows]   = useState(collectorsData);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(BLANK);

  const openAdd  = ()  => { setForm(BLANK); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };
  const close    = ()  => setModal(null);
  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
        addLabel="Add Collector"
      />

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Collector' : 'Edit Collector'}
          onClose={close}
          onSave={save}
          saveLabel={modal === 'add' ? 'Add Record' : 'Save Changes'}
        >
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-row">
              <label className="form-label">Employee ID</label>
              <input className="form-input" value={form.empId} onChange={e => set('empId', e.target.value)} placeholder="EMP-XXX" />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="form-row">
              <label className="form-label">Zone</label>
              <select className="form-select" value={form.zone} onChange={e => set('zone', e.target.value)}>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option>On Duty</option>
              <option>Off Duty</option>
              <option>Leave</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}

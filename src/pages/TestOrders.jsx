import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { testOrdersData, pathologiesData } from '../data/mockData';
import { nextId } from '../utils';

const BLANK = { patient: '', test: pathologiesData[0]?.code || '', doctor: '', priority: 'Routine', status: 'Pending' };

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
  { key: 'test',   label: 'Test'   },
  { key: 'doctor', label: 'Doctor', render: r => <span style={{ color: 'var(--text-secondary)' }}>{r.doctor}</span> },
  { key: 'date',   label: 'Date'   },
  {
    key: 'priority', label: 'Priority',
    render: r => r.priority === 'Urgent'
      ? <span className="badge badge-red">🔴 Urgent</span>
      : <span className="badge badge-gray">Routine</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function TestOrders() {
  const [rows, setRows]   = useState(testOrdersData);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(BLANK);

  const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const openAdd  = ()  => { setForm(BLANK); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };
  const close    = ()  => setModal(null);
  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (modal === 'add') {
      const id = nextId(rows);
      setRows(r => [...r, { ...form, id, orderId: `TO-NEW${id}`, date: today() }]);
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
        addLabel="New Test Order"
      />

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Test Order' : 'Edit Test Order'}
          onClose={close}
          onSave={save}
          saveLabel={modal === 'add' ? 'Create Order' : 'Save Changes'}
        >
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Patient Name</label>
              <input className="form-input" value={form.patient} onChange={e => set('patient', e.target.value)} placeholder="Patient name" />
            </div>
            <div className="form-row">
              <label className="form-label">Test</label>
              <select className="form-select" value={form.test} onChange={e => set('test', e.target.value)}>
                {pathologiesData.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Referring Doctor</label>
              <input className="form-input" value={form.doctor} onChange={e => set('doctor', e.target.value)} placeholder="Dr. Name" />
            </div>
            <div className="form-row">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option>Routine</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {['Pending', 'Processing', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}

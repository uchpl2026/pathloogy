import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { collectionOrdersData, collectorsData } from '../data/mockData';
import { nextId } from '../utils';

const BLANK = {
  patient: '',
  collector: collectorsData[0]?.name || '',
  address: '',
  scheduled: '',
  status: 'Scheduled',
};

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
  {
    key: 'collector', label: 'Collector',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={r.collector} size={24} />
        <span>{r.collector}</span>
      </div>
    ),
  },
  {
    key: 'address', label: 'Address',
    render: r => <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, display: 'block' }}>{r.address}</span>,
  },
  {
    key: 'scheduled', label: 'Scheduled',
    render: r => <span style={{ fontSize: 12 }}>{r.scheduled}</span>,
  },
  {
    key: 'status', label: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
];

export default function CollectionOrders() {
  const [rows, setRows]   = useState(collectionOrdersData);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(BLANK);

  const openAdd  = ()  => { setForm(BLANK); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal('edit'); };
  const close    = ()  => setModal(null);
  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (modal === 'add') {
      const id = nextId(rows);
      setRows(r => [...r, { ...form, id, orderId: `CO-NEW${id}` }]);
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
        addLabel="New Collection Order"
      />

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Collection Order' : 'Edit Collection Order'}
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
              <label className="form-label">Collector</label>
              <select className="form-select" value={form.collector} onChange={e => set('collector', e.target.value)}>
                {collectorsData.map(c => <option key={c.id} value={c.name}>{c.name} — {c.zone}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Patient Address</label>
            <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full collection address" />
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Scheduled Date & Time</label>
              <input className="form-input" value={form.scheduled} onChange={e => set('scheduled', e.target.value)} placeholder="DD Mon YYYY, HH:MM AM" />
            </div>
            <div className="form-row">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Scheduled', 'In Transit', 'Collected', 'Failed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

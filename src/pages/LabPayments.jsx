import React, { useEffect, useMemo, useState } from 'react';
import { collectionOrdersAPI, labsAPI, labPaymentsAPI } from '../api';
import './LabPayments.css';

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function LabPayments() {
  const today = new Date().toISOString().slice(0, 10);
  const [labs, setLabs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterLabId, setFilterLabId] = useState('');
  const [form, setForm] = useState({
    id: null,
    lab_id: '',
    amount_paid: '',
    payment_date: today,
    notes: '',
  });

  useEffect(() => { loadData(); }, []);

  function parseJSON(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { return JSON.parse(value); } catch { return []; }
  }

  function loadPayments(filterLabId = '', availableLabs = labs) {
    const params = {};
    const lab = availableLabs.find(l => String(l.id) === String(filterLabId));
    if (lab) params.lab_name = lab.name;
    return labPaymentsAPI.list(params).then(paymentList => {
      setPayments(paymentList);
      setError('');
    });
  }

  function loadData() {
    setLoading(true);
    Promise.all([labsAPI.list(), collectionOrdersAPI.list()])
      .then(([labList, orderList]) => {
        setLabs(labList);
        setOrders(orderList);
        return loadPayments(filterLabId, labList);
      })
      .catch(err => setError(err.message || 'Unable to load lab payments'))
      .finally(() => setLoading(false));
  }

  const selectedLab = useMemo(
    () => labs.find(l => String(l.id) === String(form.lab_id)) || null,
    [labs, form.lab_id]
  );

  const filteredLab = useMemo(
    () => labs.find(l => String(l.id) === String(filterLabId)) || null,
    [labs, filterLabId]
  );

  const calcDue = (lab) => {
    if (!lab) return 0;
    const byName = (lab.available_tests || []).reduce((acc, test) => {
      acc[test.test_name] = test;
      return acc;
    }, {});
    return orders.reduce((sum, order) => {
      if (order.lab_name !== lab.name) return sum;
      const selectedTests = parseJSON(order.lab_tests || order.tests);
      return sum + selectedTests.reduce((s, testName) => {
        const test = byName[testName];
        const deposit = test?.deposit_amount ? parseFloat(test.deposit_amount) : 0;
        return s + (isNaN(deposit) ? 0 : deposit);
      }, 0);
    }, 0);
  };

  const totalDue = useMemo(() => calcDue(selectedLab), [orders, selectedLab]);
  const filteredDue = useMemo(() => calcDue(filteredLab), [orders, filteredLab]);

  const totalPaid = useMemo(() => payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0), [payments]);

  function resetForm() {
    setForm({ id: null, lab_id: '', amount_paid: '', payment_date: today, notes: '' });
    setError('');
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    if (!form.lab_id || !form.amount_paid || !form.payment_date) {
      setError('Please select a lab, enter the amount paid, and choose a payment date.');
      setSaving(false);
      return;
    }
    const payload = {
      lab_id: Number(form.lab_id),
      amount_paid: form.amount_paid,
      payment_date: form.payment_date,
      notes: form.notes,
    };
    try {
      if (form.id) {
        await labPaymentsAPI.update(form.id, payload);
      } else {
        await labPaymentsAPI.create(payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Unable to save payment');
    } finally {
      setSaving(false);
    }
  }

  async function handleFilterChange(e) {
    const nextLabId = e.target.value;
    setFilterLabId(nextLabId);
    setLoading(true);
    try { await loadPayments(nextLabId); }
    catch (err) { setError(err.message || 'Unable to load payments'); }
    finally { setLoading(false); }
  }

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const d = (a.payment_date || '').localeCompare(b.payment_date || '');
      return d !== 0 ? d : Number(a.id) - Number(b.id);
    });
  }, [payments]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this lab payment?')) return;
    try { await labPaymentsAPI.remove(id); loadData(); }
    catch (err) { setError(err.message || 'Unable to delete payment'); }
  }

  function handleEdit(payment) {
    setForm({
      id: payment.id,
      lab_id: String(payment.lab_id),
      amount_paid: payment.amount_paid || '',
      payment_date: payment.payment_date || today,
      notes: payment.notes || '',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="lp-root">
      {/* ── Top Form Card ── */}
      <div className="lp-form-card">
        <div className="lp-form-header">
          <div className="lp-form-header-left">
            <div className="lp-form-icon">
              <i className="ti ti-credit-card" />
            </div>
            <div>
              <h2 className="lp-form-title">{form.id ? 'Edit Payment' : 'Record Payment'}</h2>
              <p className="lp-form-subtitle">Log a payment made to a diagnostic lab</p>
            </div>
          </div>
          {form.id && (
            <button className="lp-cancel-edit" onClick={resetForm}>
              <i className="ti ti-x" /> Cancel Edit
            </button>
          )}
        </div>

        <form className="lp-form-body" onSubmit={handleSave}>
          <div className="lp-field-group">
            <div className="lp-field">
              <label>Lab <span className="lp-required">*</span></label>
              <select
                value={form.lab_id}
                onChange={e => setForm(f => ({ ...f, lab_id: e.target.value }))}
              >
                <option value="">Select a lab…</option>
                {labs.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
                ))}
              </select>
            </div>

            <div className="lp-field lp-field--readonly">
              <label>Total Due</label>
              <div className="lp-readonly-val">
                {selectedLab ? formatMoney(totalDue) : <span className="lp-placeholder">Select a lab</span>}
              </div>
            </div>

            <div className="lp-field">
              <label>Amount Paid <span className="lp-required">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount_paid}
                onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="lp-field">
              <label>Payment Date <span className="lp-required">*</span></label>
              <input
                type="date"
                value={form.payment_date}
                onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
              />
            </div>

            <div className="lp-field lp-field--wide">
              <label>Notes</label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes…"
              />
            </div>
          </div>

          {error && (
            <div className="lp-error">
              <i className="ti ti-alert-circle" />
              {error}
            </div>
          )}

          <div className="lp-form-actions">
            <button className="lp-btn lp-btn--primary" type="submit" disabled={saving}>
              {saving ? (
                <><i className="ti ti-loader-2 spin" /> Saving…</>
              ) : form.id ? (
                <><i className="ti ti-check" /> Update Payment</>
              ) : (
                <><i className="ti ti-plus" /> Save Payment</>
              )}
            </button>
            <button className="lp-btn lp-btn--ghost" type="button" onClick={resetForm} disabled={saving}>
              <i className="ti ti-refresh" /> Clear
            </button>
          </div>
        </form>
      </div>

      {/* ── History Card ── */}
      <div className="lp-history-card">
        <div className="lp-history-header">
          <div className="lp-history-title-group">
            <span className="lp-history-title">
              <i className="ti ti-history" /> Lab Payment History
            </span>
            <span className="lp-count-chip">{payments.length} record{payments.length !== 1 ? 's' : ''}</span>
            {payments.length > 0 && (
              <span className="lp-total-chip">
                Total: {formatMoney(totalPaid)}
              </span>
            )}
          </div>

          <div className="lp-history-filters">
            <div className="lp-filter-field">
              <label>Filter by Lab</label>
              <select value={filterLabId} onChange={handleFilterChange}>
                <option value="">All labs</option>
                {labs.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
                ))}
              </select>
            </div>
            <div className="lp-filter-field lp-filter-field--due">
              <label>Due Amount</label>
              <div className="lp-due-display">
                {filteredLab
                  ? <><span className="lp-due-amt">{formatMoney(filteredDue)}</span></>
                  : <span className="lp-due-placeholder">Select a lab</span>
                }
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="lp-loader">
            <i className="ti ti-loader-2 spin" />
            <span>Loading payments…</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="lp-empty">
            <div className="lp-empty-icon"><i className="ti ti-receipt-off" /></div>
            <p>No lab payments have been recorded yet.</p>
            <span>Use the form above to log your first payment.</span>
          </div>
        ) : (
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th className="lp-th-num">#</th>
                  <th>Date</th>
                  <th>Lab</th>
                  <th className="lp-th-right">Amount Paid</th>
                  <th>Notes</th>
                  <th className="lp-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((payment, index) => (
                  <tr key={payment.id} className="lp-tr">
                    <td className="lp-td-num">{index + 1}</td>
                    <td className="lp-td-date">
                      <i className="ti ti-calendar-event lp-td-icon" />
                      {payment.payment_date || '—'}
                    </td>
                    <td className="lp-td-lab">
                      <span className="lp-lab-chip">{payment.lab_name || '—'}</span>
                    </td>
                    <td className="lp-td-amount">{formatMoney(payment.amount_paid)}</td>
                    <td className="lp-td-notes">{payment.notes || <span className="lp-dash">—</span>}</td>
                    <td className="lp-td-actions">
                      <button className="lp-action-btn lp-action-btn--edit" onClick={() => handleEdit(payment)}>
                        <i className="ti ti-pencil" /> Edit
                      </button>
                      <button className="lp-action-btn lp-action-btn--delete" onClick={() => handleDelete(payment.id)}>
                        <i className="ti ti-trash" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

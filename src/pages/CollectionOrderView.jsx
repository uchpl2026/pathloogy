import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionOrdersAPI } from '../api';
import Avatar from '../components/Avatar';

function parseTests(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

function PaymentBadge({ status }) {
  const map = {
    'Not Paid':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    'Partially Paid': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    'Full Paid':      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };
  const s = map[status] || map['Not Paid'];
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      padding: '4px 12px', borderRadius: 20,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      display: 'inline-block',
    }}>
      {status || 'Not Paid'}
    </span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{
        padding: '12px 20px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 15, color: 'var(--blue)' }} />
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, value, wide }) {
  return (
    <div style={{
      gridColumn: wide ? '1 / -1' : undefined,
      marginBottom: 4,
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: value ? 400 : 400 }}>
        {value || '—'}
      </div>
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px 24px' }}>
      {children}
    </div>
  );
}

export default function CollectionOrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    collectionOrdersAPI.get(id)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <i className="ti ti-loader-2 spin" style={{ fontSize: 28, color: 'var(--blue)' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <i className="ti ti-alert-circle" style={{ fontSize: 32, color: '#dc2626', display: 'block', marginBottom: 8 }} />
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Order not found'}</p>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/collection-orders')}>
          <i className="ti ti-arrow-left" /> Back to Orders
        </button>
      </div>
    );
  }

  const tests = parseTests(order.lab_tests).length
    ? parseTests(order.lab_tests)
    : parseTests(order.tests);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="icon-btn"
            onClick={() => navigate('/collection-orders')}
            title="Back"
            style={{ width: 34, height: 34 }}
          >
            <i className="ti ti-arrow-left" />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Order Details
            </h2>
            <code style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '1px 7px', borderRadius: 4, color: 'var(--text-secondary)' }}>
              {order.orderId}
            </code>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/collection-orders/edit/${order.id}`)}
        >
          <i className="ti ti-edit" /> Edit Order
        </button>
      </div>

      {/* Patient Info */}
      <Section title="Patient Information" icon="ti-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar name={order.patient} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{order.patient || '—'}</div>
            {order.patient_phone && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                <i className="ti ti-phone" style={{ marginRight: 4 }} />{order.patient_phone}
              </div>
            )}
            {order.patient_email && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                <i className="ti ti-mail" style={{ marginRight: 4 }} />{order.patient_email}
              </div>
            )}
          </div>
        </div>
        <Grid>
          <Field label="Doctor Name" value={order.doctor_name} />
          <Field label="Doctor Phone" value={order.doctor_phone} />
          <Field label="Address" value={order.address} wide />
        </Grid>
      </Section>

      {/* Tests */}
      <Section title="Lab & Tests" icon="ti-flask">
        <Grid>
          <Field label="Lab Name" value={order.lab_name} />
          <Field label="Test Date" value={order.test_date} />
        </Grid>
        {tests.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Tests Ordered
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tests.map(t => (
                <span key={t} style={{
                  fontSize: 12, padding: '4px 12px', borderRadius: 20,
                  background: 'var(--accent-light, #eff6ff)',
                  color: 'var(--accent, #2563eb)', fontWeight: 500,
                  border: '1px solid var(--accent-border, #bfdbfe)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Collector */}
      <Section title="Collector" icon="ti-user-check">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={order.collector} size={36} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{order.collector || '—'}</span>
        </div>
      </Section>

      {/* Payment */}
      <Section title="Payment Details" icon="ti-cash">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Status:</span>
          <PaymentBadge status={order.payment_status} />
        </div>
        <Grid>
          <Field label="Billed Amount" value={order.billed_amount ? `₹${order.billed_amount}` : null} />
          <Field label="Amount Received" value={order.amount_received ? `₹${order.amount_received}` : null} />
          <Field
            label="Balance Due"
            value={
              order.billed_amount && order.amount_received != null
                ? `₹${parseFloat(order.billed_amount || 0) - parseFloat(order.amount_received || 0)}`
                : null
            }
          />
          <Field label="Payment Date" value={order.payment_date} />
        </Grid>
      </Section>
    </div>
  );
}

import React, { useState } from 'react';
import { authAPI } from '../api';
import './Settings.css';

export default function Settings({ user }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus]   = useState(null); // { type: 'success'|'error', msg: string }
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const change = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setStatus(null);

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setStatus({ type: 'error', msg: 'Please fill in all fields.' });
      return;
    }
    if (form.newPassword.length < 6) {
      setStatus({ type: 'error', msg: 'New password must be at least 6 characters.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', msg: 'New password and confirmation do not match.' });
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setStatus({ type: 'error', msg: 'New password must differ from current password.' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(user.id, form.currentPassword, form.newPassword);
      setStatus({ type: 'success', msg: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="settings-page">
      {/* Profile card */}
      <div className="settings-card profile-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
        </div>
      </div>

      {/* Change password card */}
      <div className="settings-card">
        <div className="card-header">
          <i className="ti ti-lock" />
          <div>
            <div className="card-title">Change Password</div>
            <div className="card-subtitle">Update your account password</div>
          </div>
        </div>

        {status && (
          <div className={`settings-alert settings-alert--${status.type}`}>
            <i className={`ti ${status.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
            {status.msg}
          </div>
        )}

        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="input-wrap">
              <i className="ti ti-lock input-icon" />
              <input
                className="form-input"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={change('currentPassword')}
                disabled={loading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label="Toggle visibility"
              >
                <i className={`ti ${showCurrent ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-wrap">
              <i className="ti ti-key input-icon" />
              <input
                className="form-input"
                type={showNew ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.newPassword}
                onChange={change('newPassword')}
                disabled={loading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNew((v) => !v)}
                aria-label="Toggle visibility"
              >
                <i className={`ti ${showNew ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            {form.newPassword && (
              <StrengthBar password={form.newPassword} />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-wrap">
              <i className="ti ti-lock-check input-icon" />
              <input
                className={`form-input${
                  form.confirmPassword && form.newPassword !== form.confirmPassword
                    ? ' input--error'
                    : ''
                }`}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={change('confirmPassword')}
                disabled={loading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle visibility"
              >
                <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="hint hint--error">Passwords do not match</p>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><i className="ti ti-loader-2 spin" /> Updating…</>
            ) : (
              <><i className="ti ti-check" /> Update Password</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

function StrengthBar({ password }) {
  const score = getStrength(password);
  const label = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][score] || '';
  const color = ['', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2b6cb0'][score] || '';
  return (
    <div className="strength-wrap">
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i <= score ? color : '#e2e8f0' }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color }}>{label}</span>
    </div>
  );
}

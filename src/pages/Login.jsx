import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await authAPI.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-icon">
            <i className="ti ti-flask" />
          </div>
          <div>
            <div className="login-brand-name">PathLab Pro</div>
            <div className="login-brand-sub">Laboratory Management</div>
          </div>
        </div>
        <div className="login-hero">
          <h1 className="login-hero-title">Precision lab management,<br />built for modern teams.</h1>
          <p className="login-hero-desc">
            Manage pathologies, collectors, test orders, and collection workflows — all in one place.
          </p>
          <div className="login-features">
            {[
              { icon: 'ti-virus',          text: 'Pathology tracking'      },
              { icon: 'ti-user-check',     text: 'Collector management'    },
              { icon: 'ti-clipboard-list', text: 'Test & collection orders' },
              { icon: 'ti-chart-bar',      text: 'Real-time dashboard'     },
            ].map(f => (
              <div key={f.text} className="login-feature-item">
                <span className="login-feature-icon"><i className={`ti ${f.icon}`} /></span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign in</h2>
            <p className="login-card-sub">Enter your credentials to access your workspace.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <i className="ti ti-mail input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input login-input"
                  placeholder="admin@pathlab.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <i className="ti ti-lock input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <i className="ti ti-alert-circle" /> {error}
              </div>
            )}

            <div className="login-meta">
              <label className="login-remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#forgot" className="login-forgot" onClick={e => e.preventDefault()}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading
                ? <><i className="ti ti-loader-2 spin" /> Signing in…</>
                : <><i className="ti ti-login" /> Sign in</>
              }
            </button>
          </form>

          <p className="login-hint">
            <i className="ti ti-info-circle" /> Demo: <strong>admin@pathlab.com</strong> / <strong>password</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

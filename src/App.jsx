import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pathologies from './pages/Pathologies';
import PathologyForm from './pages/PathologyForm';
import Collectors from './pages/Collectors';
import CollectorForm from './pages/CollectorForm';
import CollectionOrders from './pages/CollectionOrders';
import CollectionOrderForm from './pages/CollectionOrderForm';
import Labs from './pages/Labs';
import LabForm from './pages/LabForm';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { collectorsAPI, collectionOrdersAPI } from './api';

// ── Persist session ───────────────────────────────────────────────────────────
const SESSION_KEY = 'pathlab_user';
function loadSession() {
  try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else      localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [user, setUser]                         = useState(loadSession);
  const [collectors, setCollectors]             = useState([]);
  const [collectionOrders, setCollectionOrders] = useState([]);
  const [loading, setLoading]                   = useState(false);

  useEffect(() => { saveSession(user); }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([collectorsAPI.list(), collectionOrdersAPI.list()])
      .then(([cols, orders]) => {
        setCollectors(cols);
        setCollectionOrders(orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = ()  => { setUser(null); setCollectors([]); setCollectionOrders([]); };

  if (!user) return <Login onLogin={handleLogin} />;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <i className="ti ti-loader-2 spin" style={{ fontSize: 32 }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          {/* Pathologies */}
          <Route path="pathologies"          element={<Pathologies />} />
          <Route path="pathologies/add"      element={<PathologyForm />} />
          <Route path="pathologies/edit/:id" element={<PathologyForm />} />

          {/* Collectors */}
          <Route path="collectors"          element={<Collectors rows={collectors} setRows={setCollectors} />} />
          <Route path="collectors/add"      element={<CollectorForm rows={collectors} setRows={setCollectors} />} />
          <Route path="collectors/edit/:id" element={<CollectorForm rows={collectors} setRows={setCollectors} />} />

          {/* Collection Orders – CollectionOrderForm fetches labs & active collectors itself */}
          <Route path="collection-orders"
            element={<CollectionOrders rows={collectionOrders} setRows={setCollectionOrders} />} />
          <Route path="collection-orders/add"
            element={<CollectionOrderForm rows={collectionOrders} setRows={setCollectionOrders} />} />
          <Route path="collection-orders/edit/:id"
            element={<CollectionOrderForm rows={collectionOrders} setRows={setCollectionOrders} />} />

          {/* Labs */}
          <Route path="labs"          element={<Labs />} />
          <Route path="labs/add"      element={<LabForm />} />
          <Route path="labs/edit/:id" element={<LabForm />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Redirect old URLs */}
          <Route path="test-orders/*" element={<Navigate to="/collection-orders" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

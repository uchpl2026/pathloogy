import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pathologies from './pages/Pathologies';
import Collectors from './pages/Collectors';
import CollectorForm from './pages/CollectorForm';
import TestOrders from './pages/TestOrders';
import CollectionOrders from './pages/CollectionOrders';
import CollectionOrderForm from './pages/CollectionOrderForm';
import Login from './pages/Login';
import { collectorsData, collectionOrdersData } from './data/mockData';

export default function App() {
  const [user, setUser] = useState(null);
  const [collectors, setCollectors] = useState(collectorsData);
  const [collectionOrders, setCollectionOrders] = useState(collectionOrdersData);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={() => setUser(null)} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pathologies" element={<Pathologies />} />
          <Route path="collectors" element={<Collectors rows={collectors} setRows={setCollectors} />} />
          <Route path="collectors/add" element={<CollectorForm rows={collectors} setRows={setCollectors} />} />
          <Route path="collectors/edit/:id" element={<CollectorForm rows={collectors} setRows={setCollectors} />} />
          <Route path="test-orders" element={<TestOrders />} />
          <Route path="collection-orders" element={<CollectionOrders rows={collectionOrders} setRows={setCollectionOrders} />} />
          <Route path="collection-orders/add" element={<CollectionOrderForm rows={collectionOrders} collectors={collectors} setRows={setCollectionOrders} />} />
          <Route path="collection-orders/edit/:id" element={<CollectionOrderForm rows={collectionOrders} collectors={collectors} setRows={setCollectionOrders} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

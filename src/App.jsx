import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pathologies from './pages/Pathologies';
import Collectors from './pages/Collectors';
import TestOrders from './pages/TestOrders';
import CollectionOrders from './pages/CollectionOrders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pathologies" element={<Pathologies />} />
          <Route path="collectors" element={<Collectors />} />
          <Route path="test-orders" element={<TestOrders />} />
          <Route path="collection-orders" element={<CollectionOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

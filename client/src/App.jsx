import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import ChemicalOptimization from './pages/ChemicalOptimization';
import EquipmentHealth from './pages/EquipmentHealth';
import AlertsPage from './pages/AlertsPage';
import DigitalTwin from './pages/DigitalTwin';
import ComplianceReports from './pages/ComplianceReports';
import AuditLogsPage from './pages/AuditLogsPage';
import AIModelStatus from './pages/AIModelStatus';

import PlantsAdmin from './pages/admin/PlantsAdmin';
import SensorsAdmin from './pages/admin/SensorsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading System Console...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected General Console Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/monitoring"
            element={
              <ProtectedLayout>
                <LiveMonitoring />
              </ProtectedLayout>
            }
          />
          <Route
            path="/chemical-optimization"
            element={
              <ProtectedLayout>
                <ChemicalOptimization />
              </ProtectedLayout>
            }
          />
          <Route
            path="/equipment"
            element={
              <ProtectedLayout>
                <EquipmentHealth />
              </ProtectedLayout>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedLayout>
                <AlertsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/digital-twin"
            element={
              <ProtectedLayout>
                <DigitalTwin />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <ComplianceReports />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedLayout>
                <AuditLogsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/ai-model"
            element={
              <ProtectedLayout>
                <AIModelStatus />
              </ProtectedLayout>
            }
          />

          {/* Admin Management Routes */}
          <Route
            path="/admin/plants"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <PlantsAdmin />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/sensors"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <SensorsAdmin />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedLayout allowedRoles={['ADMIN']}>
                <UsersAdmin />
              </ProtectedLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

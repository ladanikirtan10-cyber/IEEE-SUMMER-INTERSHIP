import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Verifications from './pages/Verifications';
import AuditLogs from './pages/AuditLogs';

// Layout wrapper for authenticated dashboard pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

// Route director for `/dashboard` to load appropriate portal based on role
const DashboardDirector = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'worker':
      return <WorkerDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'hospital':
      return <HospitalDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardDirector />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Worker specific route redirect (Sharing panel is on dashboard) */}
              <Route path="/sharing" element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <DashboardLayout>
                    <WorkerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Hospital specific redirect */}
              <Route path="/register-patient" element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <DashboardLayout>
                    <HospitalDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Admin specific routes */}
              <Route path="/verifications" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Verifications />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/logs" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AuditLogs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Root Landing Page */}
              <Route path="/" element={<Landing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default App;

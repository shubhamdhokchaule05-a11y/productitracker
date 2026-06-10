import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardHome from './pages/DashboardHome';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AppUsage from './pages/AppUsage';
import Users from './pages/Users';

// Auth guard component
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Admin guard component
function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const saved = localStorage.getItem('userProfile');
  const user = saved ? JSON.parse(saved) : null;
  const isAdmin = user && user.role === 'Admin';
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leaves" element={<Leaves />} />
              <Route path="app-usage" element={<AppUsage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

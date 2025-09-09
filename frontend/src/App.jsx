import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Assignments from './pages/assignments';
import AdminRoute from './components/AdminRoute';
import ReportIssue from './pages/ReportIssue';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminDiscounts from './pages/AdminDiscounts';
import UserDiscounts from './pages/UserDiscounts';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'Admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/user-dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute><RoleRedirect /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/report-issue" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
            <Route path="/maintenance" element={<AdminRoute><AdminMaintenance /></AdminRoute>} />
            <Route path="/discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
            <Route path="/my-discounts" element={<PrivateRoute><UserDiscounts /></PrivateRoute>} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/assignments" element={<AdminRoute><Assignments /></AdminRoute>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
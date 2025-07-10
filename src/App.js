import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/styles.css';

// Components
import Navbar from './components/Navbar/Navbar';
import SessionList from './components/SessionList';

// Pages
import Login, { AdminLogin } from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
// Add import for MyWork page (to be created)
import MyWork from './pages/MyWork';
import AdminSubmissions from './pages/AdminSubmissions';

// Helper
import { authHelpers } from './services/api';
import { AuthProvider } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authHelpers.isAuthenticated();
  const userRole = authHelpers.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'student':
        return <Navigate to="/dashboard" replace />;
      case 'mentor':
        return <Navigate to="/mentor" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Student Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sessions" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SessionList view="all" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-work" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyWork />
                </ProtectedRoute>
              } 
            />
            
            {/* Mentor Routes */}
            <Route 
              path="/mentor" 
              element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/submissions" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubmissions />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile Route - All roles */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                authHelpers.isAuthenticated() ? (
                  <Navigate to={`/${authHelpers.getUserRole() === 'admin' ? 'admin/dashboard' : authHelpers.getUserRole() === 'mentor' ? 'mentor' : 'dashboard'}`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

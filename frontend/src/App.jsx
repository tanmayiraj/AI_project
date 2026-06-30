import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ResumeManager from './pages/ResumeManager';
import JobManager from './pages/JobManager';
import Intelligence from './pages/Intelligence';
import Settings from './pages/Settings';
import ResumeDetails from './pages/ResumeDetails';
import JobDetails from './pages/JobDetails';

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155'
        }
      }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resumes" element={<ResumeManager />} />
          <Route path="resumes/:id" element={<ResumeDetails />} />
          <Route path="jobs" element={<JobManager />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="intelligence" element={<Intelligence />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

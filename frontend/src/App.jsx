import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';

// Lazy loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeManager = lazy(() => import('./pages/ResumeManager'));
const JobManager = lazy(() => import('./pages/JobManager'));
const Intelligence = lazy(() => import('./pages/Intelligence'));
const Settings = lazy(() => import('./pages/Settings'));
const ResumeDetails = lazy(() => import('./pages/ResumeDetails'));
const JobDetails = lazy(() => import('./pages/JobDetails'));

const PageLoader = () => (
  <div className="w-full h-full flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
    <LoadingSkeleton className="h-10 w-48" />
    <LoadingSkeleton className="h-[400px] w-full" />
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </>
  );
}

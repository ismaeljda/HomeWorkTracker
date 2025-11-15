import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InitializeDB from './pages/InitializeDB';
import DashboardEleve from './pages/DashboardEleve';
import DashboardProf from './pages/DashboardProf';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminSetup from './pages/AdminSetup';
import HomeworkDetail from './pages/HomeworkDetail';
import MyCourses from './pages/MyCourses';

const RootRedirect: React.FC = () => {
  const { userData } = useAuth();

  if (!userData) {
    return <Navigate to="/login" />;
  }

  switch (userData.role) {
    case 'admin':
      return <Navigate to="/admin" />;
    case 'prof':
      return <Navigate to="/prof" />;
    case 'eleve':
      return <Navigate to="/eleve" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/initialize" element={<InitializeDB />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <RootRedirect />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/eleve"
              element={
                <ProtectedRoute allowedRoles={['eleve']}>
                  <>
                    <Navbar />
                    <DashboardEleve />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/eleve/courses"
              element={
                <ProtectedRoute allowedRoles={['eleve']}>
                  <>
                    <Navbar />
                    <MyCourses />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prof"
              element={
                <ProtectedRoute allowedRoles={['prof']}>
                  <>
                    <Navbar />
                    <DashboardProf />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <>
                    <Navbar />
                    <DashboardAdmin />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/setup"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <>
                    <Navbar />
                    <AdminSetup />
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/homework/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <HomeworkDetail />
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

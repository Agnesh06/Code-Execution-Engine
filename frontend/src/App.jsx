import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import TeamSetup from './pages/TeamSetup';
import ParticipantDashboard from './pages/ParticipantDashboard';
import Leaderboard from './pages/Leaderboard';
import AdminRounds from './pages/admin/AdminRounds';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminTeams from './pages/admin/AdminTeams';
import AdminSubmissions from './pages/admin/AdminSubmissions';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/rounds" replace />;
  return <Navigate to="/arena" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0b0f19] flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Participant Routes */}
              <Route
                path="/team-setup"
                element={
                  <ProtectedRoute requiredRole="PARTICIPANT">
                    <TeamSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/arena"
                element={
                  <ProtectedRoute requiredRole="PARTICIPANT">
                    <ParticipantDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/rounds" replace />}
              />
              <Route
                path="/admin/rounds"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminRounds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teams"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminTeams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/submissions"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminSubmissions />
                  </ProtectedRoute>
                }
              />

              {/* Leaderboard Route (Any authed role) */}
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RankingPage from './pages/RankingPage.jsx';

export default function App() {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  if (session.role === 'player' && session.mustChangePassword) {
    return <ChangePasswordPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<RankingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

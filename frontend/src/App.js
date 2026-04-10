// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/common/ProtectedRoute';
import Navbar             from './components/layout/Navbar';

import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import AnalyzePage        from './pages/AnalyzePage';
import DashboardPage      from './pages/DashboardPage';
import HistoryPage        from './pages/HistoryPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 text-white">
          <Navbar />

          <Routes>
            {/* Public routes */}
            <Route path="/"       element={<LandingPage  />} />
            <Route path="/login"  element={<LoginPage    />} />
            <Route path="/signup" element={<SignupPage   />} />

            {/* Protected routes */}
            <Route path="/analyze"   element={<ProtectedRoute><AnalyzePage    /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage  /></ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute><HistoryPage    /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notifications */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            theme="dark"
            toastStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

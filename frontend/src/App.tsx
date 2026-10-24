import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { LitfestUnderwaterHome } from './features/home';
import ContactUs from './features/contact/ContactUs';
import SponsorPage from './SponsorPageStandalone';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

import './App.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main / Original Repository Screens */}
          <Route
            path="/"
            element={
              <div className="app-container">
                <LitfestUnderwaterHome />
              </div>
            }
          />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contactus.html" element={<ContactUs />} />
          <Route path="/sponsors" element={<SponsorPage />} />
          <Route path="/sponsors.html" element={<SponsorPage />} />

          {/* Auth Feature Screens */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Fallback to Home */}
          <Route
            path="*"
            element={
              <div className="app-container">
                <LitfestUnderwaterHome />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

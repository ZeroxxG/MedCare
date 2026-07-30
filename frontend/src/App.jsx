import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { DoctorListing } from './pages/DoctorListing';
import { DoctorDetail } from './pages/DoctorDetail';
import { Specialties } from './pages/Specialties';
import { HowItWorks } from './pages/HowItWorks';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<DoctorListing />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/specialties" element={<Specialties />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Patient Protected Routes */}
                <Route
                  path="/patient-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Protected Routes */}
                <Route
                  path="/doctor-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor-profile"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

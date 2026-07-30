import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, Sun, Moon, User, LogOut, Calendar, Stethoscope, Menu, X, Bell } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isDoctor, isPatient } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-brand-600 dark:text-brand-400 group">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="tracking-tight text-slate-900 dark:text-white">Medi<span className="text-brand-600 dark:text-brand-400">Connect</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/doctors" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Find Doctors
            </Link>
            <Link to="/specialties" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Specialties
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              How It Works
            </Link>
            {isPatient && (
              <Link to="/patient-dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> My Appointments
              </Link>
            )}
            {isDoctor && (
              <Link to="/doctor-dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" /> Doctor Portal
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={isDoctor ? "/doctor-dashboard" : "/patient-dashboard"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Dashboard & Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
          <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200">Find Doctors</Link>
          <Link to="/specialties" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200">Specialties</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200">How It Works</Link>
          {user ? (
            <>
              <Link to={isDoctor ? "/doctor-dashboard" : "/patient-dashboard"} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600">Sign Out</button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

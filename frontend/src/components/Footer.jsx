import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, Shield, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Activity className="w-6 h-6 text-brand-400" />
              <span>Medi<span className="text-brand-400">Connect</span></span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Your trusted full-stack healthcare appointment platform. Connect with top doctors, book slots instantly, and manage your health seamlessly.
            </p>
            <div className="flex items-center gap-3 text-xs text-brand-400">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> HIPAA Compliant</span>
              <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Verified Doctors</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Patients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/doctors" className="hover:text-brand-400 transition-colors">Search Doctors</Link></li>
              <li><a href="#specializations" className="hover:text-brand-400 transition-colors">Specialties</a></li>
              <li><Link to="/patient-dashboard" className="hover:text-brand-400 transition-colors">Appointment History</Link></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Teleconsultation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">For Doctors</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/register" className="hover:text-brand-400 transition-colors">Join as Doctor</a></li>
              <li><a href="/doctor-dashboard" className="hover:text-brand-400 transition-colors">Doctor Portal</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Practice Management</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Developer & API</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="http://127.0.0.1:8000/api/docs/" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors text-brand-400 font-medium">Swagger API Specs</a></li>
              <li><a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">Django Admin</a></li>
              <li><span className="text-xs text-slate-500">Built with React, Vite, Tailwind & Django REST Framework</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediConnect Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Healthcare Innovation
          </p>
        </div>
      </div>
    </footer>
  );
};

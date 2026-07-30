import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, CreditCard, FileText, CheckCircle2, ShieldCheck, UserCheck, Stethoscope, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          Seamless Healthcare Journey
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          How MediConnect Works
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Book appointments, consult with verified doctors, manage prescriptions, and download official medical receipts in just a few clicks.
        </p>
      </div>

      {/* Patient Workflow Steps */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-600" /> For Patients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Find your Doctor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Filter top medical practitioners by specialty, city/location, experience years, and consultation fee in Indian Rupees (₹).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pick a Time Slot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select your preferred date and available 30-minute time slot. Enter your health concern or visit reason.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure Gateway Payment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete instant payment via Razorpay or Stripe using UPI, Credit/Debit cards, or Net Banking.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Consult & Receipt</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visit clinic or join consultation. View doctor notes and download printable PDF receipts instantly from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Workflow Steps */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-600" /> For Doctors & Medical Clinics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">1. Manage Availability & Slots</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set custom daily schedules, time slots, and consultation fees directly from your Doctor Portal.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">2. Approve & Review Bookings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive instant booking notifications, review patient medical history, and approve or reschedule appointments.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">3. Add Notes & Mark Complete</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add clinical notes and diagnosis after consultation. Patient receives automatic confirmation email and receipt.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-brand-600 to-medical-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl font-extrabold">Ready to take control of your health?</h2>
        <p className="text-sm opacity-90 max-w-xl mx-auto">
          Join thousands of satisfied patients. Find verified doctors near you and book your consultation in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/doctors"
            className="px-6 py-3 bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            Find a Doctor Now
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all"
          >
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

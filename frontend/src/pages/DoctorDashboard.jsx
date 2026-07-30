import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, Check, X, CheckCircle, Clock, User, DollarSign, Activity } from 'lucide-react';

import { Link } from 'react-router-dom';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complete Appointment modal state
  const [completingAppt, setCompletingAppt] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      setAppointments(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await appointmentService.approveAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert('Failed to approve appointment.');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this appointment request?')) {
      try {
        await appointmentService.rejectAppointment(id);
        fetchAppointments();
      } catch (err) {
        alert('Failed to reject appointment.');
      }
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingAppt) return;
    try {
      await appointmentService.completeAppointment(completingAppt.id, doctorNotes);
      setCompletingAppt(null);
      setDoctorNotes('');
      fetchAppointments();
    } catch (err) {
      alert('Failed to mark appointment complete.');
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const approvedCount = appointments.filter((a) => a.status === 'APPROVED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Doctor Management Portal</h1>
          <p className="text-sm text-slate-500">Welcome, Dr. {user?.first_name}! Manage patient requests and clinical consultations.</p>
        </div>
        <Link
          to="/doctor-profile"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 w-fit"
        >
          <User className="w-4 h-4" /> Edit Doctor Profile
        </Link>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Pending Approval</span>
            <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Upcoming Approved</span>
            <p className="text-3xl font-black text-brand-600 dark:text-brand-400">{approvedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Completed Patients</span>
            <p className="text-3xl font-black text-emerald-500">{completedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
          Patient Appointment Requests & Schedule
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No patient bookings registered yet.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">#{appt.booking_id}</span>
                    <StatusBadge status={appt.status} />
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Patient: {appt.patient?.user?.first_name} {appt.patient?.user?.last_name}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span>📅 {appt.appointment_date} at {appt.appointment_time}</span>
                    <span>✉️ {appt.patient?.user?.email}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <span className="font-semibold">Visit Reason:</span> {appt.reason_for_visit}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-700">
                  {appt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(appt.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(appt.id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}

                  {appt.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setCompletingAppt(appt);
                        setDoctorNotes(appt.doctor_notes || '');
                      }}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" /> Complete Consultation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Mark Consultation Complete
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: {completingAppt.patient?.user?.first_name} {completingAppt.patient?.user?.last_name}
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Doctor / Clinical Notes
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter medical observations, prescriptions, or follow-up recommendations..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingAppt(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

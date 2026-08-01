import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReceiptModal } from '../components/ReceiptModal';
import { RatingModal } from '../components/RatingModal';
import { Calendar, Clock, Download, Star, XCircle, User, FileText, CheckCircle2 } from 'lucide-react';

export const PatientDashboard = () => {
  const { user, updateUserState } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'profile'
  
  // Modals state
  const [selectedReceiptApptId, setSelectedReceiptApptId] = useState(null);
  const [selectedRatingAppt, setSelectedRatingAppt] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    date_of_birth: '',
    gender: 'MALE',
    blood_group: 'O+',
    emergency_contact: '',
    medical_history: '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');

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

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(id);
        fetchAppointments();
      } catch (err) {
        alert('Failed to cancel appointment.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Patient Portal</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.first_name}! Manage your bookings and health records.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'appointments'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            My Appointments ({appointments.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No appointments booked yet.</p>
              <Link to="/doctors" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
                Find a Doctor
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Doctor Row */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {appt.booking_id}</span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Dr. {appt.doctor?.user?.first_name} {appt.doctor?.user?.last_name}
                      </h3>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                        {appt.doctor?.specialization?.name}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Date & Time info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block">Date</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{appt.appointment_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Time</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{appt.appointment_time}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Reason:</span> {appt.reason_for_visit}
                  </div>

                  {appt.doctor_notes && (
                    <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-brand-700 dark:text-brand-300">Doctor Notes:</span>
                      <p className="text-slate-700 dark:text-slate-300">{appt.doctor_notes}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    <button
                      onClick={() => setSelectedReceiptApptId(appt.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>

                    {appt.status === 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedRatingAppt(appt)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> Rate Doctor
                      </button>
                    )}

                    {(appt.status === 'PENDING' || appt.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold text-xs rounded-xl flex items-center gap-1 ml-auto"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Popups */}
      {selectedReceiptApptId && (
        <ReceiptModal
          appointmentId={selectedReceiptApptId}
          onClose={() => setSelectedReceiptApptId(null)}
        />
      )}

      {selectedRatingAppt && (
        <RatingModal
          appointment={selectedRatingAppt}
          onClose={() => setSelectedRatingAppt(null)}
          onSuccess={() => {
            setSelectedRatingAppt(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

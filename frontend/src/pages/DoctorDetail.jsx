import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { reviewService } from '../services/reviewService';
import { RatingStars } from '../components/RatingStars';
import { BookingModal } from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { Award, MapPin, Building, Calendar, ShieldCheck, Star, MessageSquare } from 'lucide-react';

export const DoctorDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        doctorService.getDoctorById(id),
        reviewService.getDoctorReviews(id),
      ]).then(([docData, reviewData]) => {
        setDoctor(docData);
        setReviews(reviewData);
      }).catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const handleBookClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-4xl shadow-sm">
            {doctor.user?.first_name?.[0]}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Dr. {doctor.user?.first_name} {doctor.user?.last_name}
              </h1>
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {doctor.specialization?.name || 'General Practitioner'}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{doctor.qualification}</p>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
              <span className="flex items-center gap-1"><Award className="w-4 h-4 text-brand-600" /> {doctor.experience_years} Years Experience</span>
              <span className="flex items-center gap-1"><Building className="w-4 h-4 text-brand-600" /> {doctor.hospital_name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brand-600" /> {doctor.city}</span>
            </div>

            <div className="pt-2">
              <RatingStars rating={doctor.rating_avg} count={doctor.reviews_count} />
            </div>
          </div>
        </div>

        {/* Fee & Action Card */}
        <div className="w-full md:w-auto bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center md:text-right space-y-3">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Consultation Fee</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{doctor.consultation_fee}</p>
          </div>
          <button
            onClick={handleBookClick}
            className="w-full md:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Main Content Tabs / Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Biography & Clinic Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              About Dr. {doctor.user?.first_name} {doctor.user?.last_name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{doctor.bio}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Clinic & Location
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">{doctor.hospital_name}</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-600" /> {doctor.clinic_address}, {doctor.city}</p>
            </div>
          </div>

          {/* Patient Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" /> Patient Feedback & Reviews ({reviews.length})
              </h3>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No reviews submitted yet for this doctor.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.patient?.user?.first_name || 'Patient'} {rev.patient?.user?.last_name || ''}
                      </span>
                      <RatingStars rating={rev.rating} showNumber={false} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Schedule Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" /> Appointment Booking
            </h3>
            <p className="text-xs text-slate-500">Instant confirmation. Select your preferred date and available time slot.</p>
            
            <button
              onClick={handleBookClick}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
            >
              Select Date & Book Slot
            </button>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Verified Profile</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Easy Reschedule & Cancellation</div>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Modal Popup */}
      {showBookingModal && (
        <BookingModal
          doctor={doctor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

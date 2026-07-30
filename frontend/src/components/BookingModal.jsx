import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { paymentService } from '../services/paymentService';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';
import { X, Calendar, Clock, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [gateway, setGateway] = useState('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Slot & Reason, 2: Checkout Gateway, 3: Success
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [paymentIntentData, setPaymentIntentData] = useState(null);

  useEffect(() => {
    if (doctor?.id) {
      loadSlots(selectedDate);
    }
  }, [doctor, selectedDate]);

  const loadSlots = async (dateStr) => {
    try {
      setLoading(true);
      const res = await doctorService.getDoctorSlots(doctor.id, dateStr);
      setSlots(res);
      setSelectedSlot(null);
    } catch (err) {
      setError('Failed to fetch available time slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAndPay = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter a brief reason for your visit.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Create Appointment Record
      const appt = await appointmentService.bookAppointment({
        doctor_id: doctor.id,
        time_slot_id: selectedSlot.id,
        reason_for_visit: reason,
      });

      setActiveAppointment(appt);

      // 2. Initiate Payment Intent
      const intentRes = await paymentService.initiatePayment(appt.id, gateway);
      setPaymentIntentData(intentRes.gateway_intent);

      // 3. Open Gateway Modal
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Booking creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCompleted = async (checkoutResult) => {
    try {
      setLoading(true);
      // Verify Payment with Backend
      await paymentService.verifyPayment({
        appointment_id: activeAppointment.id,
        transaction_id: checkoutResult.payment_id || checkoutResult.order_id,
        gateway: gateway,
        signature_or_token: checkoutResult.signature || 'valid_sig_token',
      });

      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Payment verification failed on server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Summary Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xl">
            {doctor.user?.first_name?.[0] || 'D'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Book Dr. {doctor.user?.first_name} {doctor.user?.last_name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {doctor.specialization?.name} • {doctor.hospital_name}
            </p>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
              Consultation Fee: ₹{doctor.consultation_fee}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            {/* Date Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Available Time Slots
              </label>
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading available slots...</div>
              ) : slots.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No available slots for this date.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.is_booked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        slot.is_booked
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-transparent'
                          : selectedSlot?.id === slot.id
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-95'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot.start_time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Reason for Visit
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Regular health checkup, chest pain, fever..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Payment Gateway Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Payment Gateway
              </label>
              <div className="p-3.5 rounded-2xl border border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 flex items-center justify-between text-sm font-semibold text-brand-700 dark:text-brand-300">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" /> Razorpay Payment Gateway
                </span>
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
              </div>
            </div>

            <button
              onClick={handleBookAndPay}
              disabled={loading || !selectedSlot}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Initiating Gateway...' : `Proceed to Pay ₹${doctor.consultation_fee}`}
            </button>
          </div>
        )}

        {step === 2 && paymentIntentData && (
          <RazorpayCheckoutModal
            orderDetails={paymentIntentData}
            doctorName={`Dr. ${doctor.user?.first_name} ${doctor.user?.last_name}`}
            fee={doctor.consultation_fee}
            onClose={() => setStep(1)}
            onPaymentSuccess={handlePaymentCompleted}
          />
        )}

        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto scale-110 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appointment Confirmed!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your appointment with Dr. {doctor.user?.first_name} {doctor.user?.last_name} has been booked and paid via Razorpay. Confirmation emails have been dispatched!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl"
            >
              Done & View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

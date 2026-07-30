import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { X, Printer, Download, CheckCircle, Building2, User, Calendar, DollarSign, ShieldCheck } from 'lucide-react';

export const ReceiptModal = ({ appointmentId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointmentId) {
      paymentService.getReceipt(appointmentId)
        .then((data) => setReceipt(data))
        .catch(() => setError('Failed to load official receipt details.'))
        .finally(() => setLoading(false));
    }
  }, [appointmentId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Fetching official receipt...</div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-rose-500">{error}</div>
        ) : (
          <div id="printable-receipt" className="space-y-6">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-center">
              <div className="inline-flex items-center gap-2 text-brand-600 font-bold text-lg mb-1">
                <ShieldCheck className="w-6 h-6" /> MediConnect Health Receipt
              </div>
              <p className="text-xs text-slate-400">Official Payment Receipt & Appointment Confirmation</p>
              <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300">
                Receipt #{receipt.receipt_number}
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium">Booking Reference</p>
                <p className="font-bold text-slate-900 dark:text-white">{receipt.booking_id}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium">Payment Status</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {receipt.payment_status}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium">Patient Details</p>
                <p className="font-bold text-slate-900 dark:text-white">{receipt.patient_name}</p>
                <p className="text-[10px] text-slate-400">{receipt.patient_email}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium">Doctor & Clinic</p>
                <p className="font-bold text-slate-900 dark:text-white">{receipt.doctor_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{receipt.clinic}</p>
              </div>
            </div>

            {/* Date & Fee Table */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200">Consultation Fee</p>
                      <p className="text-[10px] text-slate-400">{receipt.date} at {receipt.time}</p>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{receipt.amount_paid} {receipt.currency}
                    </td>
                  </tr>
                  <tr className="bg-brand-50/30 dark:bg-brand-950/20 font-bold">
                    <td className="p-3 text-slate-900 dark:text-white">Total Amount Paid</td>
                    <td className="p-3 text-right text-brand-600 dark:text-brand-400">
                      ₹{receipt.amount_paid} {receipt.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Transaction Footer */}
            <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p>Gateway: {receipt.payment_gateway} | Tx ID: {receipt.transaction_id}</p>
              <p>Issued at: {receipt.issued_at}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

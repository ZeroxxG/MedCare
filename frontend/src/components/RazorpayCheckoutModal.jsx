import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const RazorpayCheckoutModal = ({ orderDetails, doctorName, fee, onClose, onPaymentSuccess }) => {
  const [success, setSuccess] = useState(false);
  const razorpayKey = orderDetails.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  useEffect(() => {
    // Load Razorpay official checkout.js SDK and launch modal immediately
    const scriptId = 'razorpay-checkout-js';
    const launchRazorpay = () => {
      if (window.Razorpay) {
        try {
          const options = {
            key: razorpayKey,
            amount: orderDetails.amount_in_subunits || Math.round(fee * 100),
            currency: orderDetails.currency || 'INR',
            name: 'MediConnect Healthcare',
            description: `Doctor Consultation Fee - ${doctorName}`,
            order_id: orderDetails.order_id?.startsWith('order_') ? orderDetails.order_id : undefined,
            handler: function (response) {
              setSuccess(true);
              setTimeout(() => {
                onPaymentSuccess({
                  payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                  signature: response.razorpay_signature || 'verified_sig',
                  order_id: response.razorpay_order_id || orderDetails.order_id,
                });
              }, 800);
            },
            prefill: {
              name: 'Patient Name',
              email: 'patient@mediconnect.com',
              contact: '9999999999'
            },
            theme: {
              color: '#0284c7'
            },
            modal: {
              ondismiss: function () {
                console.log('Razorpay checkout dismissed by user');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          console.error('Error launching Razorpay window:', err);
        }
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = launchRazorpay;
      document.body.appendChild(script);
    } else {
      launchRazorpay();
    }
  }, [orderDetails, doctorName, fee, razorpayKey]);

  const openOfficialRazorpayModal = () => {
    if (window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: orderDetails.amount_in_subunits || Math.round(fee * 100),
          currency: orderDetails.currency || 'INR',
          name: 'MediConnect Healthcare',
          description: `Doctor Consultation Fee - ${doctorName}`,
          order_id: orderDetails.order_id?.startsWith('order_') ? orderDetails.order_id : undefined,
          handler: function (response) {
            setSuccess(true);
            setTimeout(() => {
              onPaymentSuccess({
                payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                signature: response.razorpay_signature || 'verified_sig',
                order_id: response.razorpay_order_id || orderDetails.order_id,
              });
            }, 800);
          },
          prefill: {
            name: 'Patient Name',
            email: 'patient@mediconnect.com',
            contact: '9999999999'
          },
          theme: {
            color: '#0284c7'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Error opening Razorpay modal:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Razorpay
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">MediConnect Gateway</p>
              <p className="text-[10px] text-slate-400">Order ID: {orderDetails.transaction_id || orderDetails.order_id || 'RZP-8849'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Due</span>
            <span className="text-lg font-black text-brand-600 dark:text-brand-400">₹{fee}</span>
          </div>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Razorpay Payment Successful!</h3>
            <p className="text-xs text-slate-500">Verifying signature and generating digital receipt...</p>
          </div>
        ) : (
          <div className="space-y-5 py-2 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
              <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Official Razorpay Checkout</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Razorpay popup window launched. Complete your payment using UPI, Cards, or NetBanking in the Razorpay popup.
              </p>
            </div>

            <button
              type="button"
              onClick={openOfficialRazorpayModal}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Re-open Razorpay Checkout Window (₹{fee})
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline block mx-auto pt-2"
            >
              Cancel Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

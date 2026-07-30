import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, CheckCircle2, ArrowLeft, Key, Lock } from 'lucide-react';

export const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password with Token
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setStep(2);
      setMessage('Password reset token detected from link.');
    }
  }, [location]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await authService.forgotPassword(email);
      setMessage(res.message || 'Reset token dispatched to your email.');
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
      setStep(2);
    } catch (err) {
      setError('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setError('Token and new password are required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.resetPassword({ token: resetToken, new_password: newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center mx-auto mb-2">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Reset Password' : 'Password Reset Complete!'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1
              ? 'Enter your registered email address to receive password reset token'
              : step === 2
              ? 'Enter the reset token sent to your email and your new password'
              : 'Your password has been successfully updated.'}
          </p>
        </div>

        {error && <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs rounded-xl text-center">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Dispatching Token...' : 'Request Reset Token'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            {message && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl text-center">
                {message}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reset Token</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter token UUID..."
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Confirm & Update Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Your password has been reset successfully!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl"
            >
              Log In Now
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

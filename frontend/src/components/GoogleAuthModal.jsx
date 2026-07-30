import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Chrome, UserCheck, Stethoscope, Settings } from 'lucide-react';

export const GoogleAuthModal = ({ onClose, onSuccess }) => {
  const { googleLogin } = useAuth();
  const [role, setRole] = useState('PATIENT');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = 'google-gsi-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && clientId && window.google?.accounts?.id) {
      const timer = setTimeout(() => {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                setLoading(true);
                setError('');
                const data = await googleLogin(response.credential, role);
                if (onSuccess) onSuccess(data);
              } catch (err) {
                console.error('Google login error:', err);
                setError(
                  err.response?.data?.detail ||
                  'Google authentication failed. Please try again.'
                );
              } finally {
                setLoading(false);
              }
            }
          });

          const btnContainer = document.getElementById('google-signin-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill'
            });
          }
        } catch (e) {
          console.error('Failed to initialize Google GSI:', e);
          setError('Google Sign-In failed to load. Check your Client ID configuration.');
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, clientId, role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Chrome className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Continue with Google</h3>
          <p className="text-xs text-slate-500">Sign in or register using your Google account</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Role Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Signing in as:
          </label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                role === 'PATIENT'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                role === 'DOCTOR'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor
            </button>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-3 py-3 text-center border-t border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticate as a <span className="font-bold text-brand-600 dark:text-brand-400">{role}</span> with your Google account:
          </p>

          {!clientId ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Settings className="w-4 h-4" /> Google OAuth Not Configured
              </div>
              <p className="text-[11px] leading-relaxed">
                Add <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">frontend/.env</code> file to enable Google Sign-In.
              </p>
            </div>
          ) : (
            <div id="google-signin-btn" className="flex justify-center min-h-[44px] items-center">
              {loading && (
                <div className="text-xs text-slate-400 animate-pulse py-2">Verifying with Google...</div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          By continuing, you agree to MediConnect's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

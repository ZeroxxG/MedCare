import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home as HomeIcon } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">The healthcare page or resource you requested could not be located.</p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
      >
        <HomeIcon className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
};

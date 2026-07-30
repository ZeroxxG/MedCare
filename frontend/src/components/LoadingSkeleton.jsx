import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  const renderItem = (index) => {
    if (type === 'card') {
      return (
        <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        </div>
      );
    }

    return (
      <div key={index} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse w-full mb-3"></div>
    );
  };

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
};

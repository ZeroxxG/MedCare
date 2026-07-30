import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { Stethoscope, Heart, Sparkles, Brain, Bone, Baby, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const ICON_MAP = {
  Heart: Heart,
  Sparkles: Sparkles,
  Baby: Baby,
  Brain: Brain,
  Bone: Bone,
  Stethoscope: Stethoscope,
};

export const Specialties = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorService.getSpecializations()
      .then((data) => setSpecializations(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          Medical Care & Specialties
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Find Doctors by Specialty
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Explore specialized medical departments and book online or in-clinic consultations with top-rated specialists.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading medical specialties...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializations.map((spec) => {
            const IconComponent = ICON_MAP[spec.icon_name] || Stethoscope;

            return (
              <div
                key={spec.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {spec.description || 'Comprehensive clinical diagnosis and personalized treatment options.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Verified Specialists
                  </span>
                  <Link
                    to={`/doctors?specialization=${spec.id}`}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all"
                  >
                    View Doctors <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

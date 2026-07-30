import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { RatingStars } from '../components/RatingStars';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { Search, MapPin, Calendar, ShieldCheck, HeartPulse, Award, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';

export const Home = () => {
  const [specializations, setSpecializations] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    doctorService.getSpecializations().then(setSpecializations);
    doctorService.getDoctors({ ordering: '-rating_avg' }).then((res) => {
      setTopDoctors((res.results || res).slice(0, 4));
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(searchCity)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-brand-500/10 via-slate-50 to-slate-50 dark:from-brand-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
              <HeartPulse className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Leading Healthcare Appointment Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your Health, <span className="bg-gradient-to-r from-brand-600 to-medical-500 bg-clip-text text-transparent">Our Priority.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Book in-clinic & online consultations with top-rated doctors across 30+ medical specialties. Instant slot confirmation & secure digital receipts.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="glass-card p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 max-w-3xl mx-auto">
              <div className="sm:col-span-5 relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Doctor, Specialty or Clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none dark:text-white"
                />
              </div>

              <div className="sm:col-span-4 relative border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0">
                <CityAutocomplete value={searchCity} onChange={setSearchCity} />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  Find Doctors
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">500+</p>
                <p className="text-xs text-slate-500">Verified Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">98%</p>
                <p className="text-xs text-slate-500">Positive Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">10k+</p>
                <p className="text-xs text-slate-500">Appointments Booked</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Grid */}
      <section id="specializations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Top Medical Specialties</h2>
            <p className="text-sm text-slate-500">Consult with specialists for any health concern</p>
          </div>
          <Link to="/doctors" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specializations.map((spec) => (
            <Link
              key={spec.id}
              to={`/doctors?specialization=${spec.id}`}
              className="glass-card p-5 rounded-2xl text-center hover:shadow-lg hover:-translate-y-1 transition-all group border border-slate-200/60 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {spec.name}
              </h3>
              <p className="text-[10px] text-slate-500 line-clamp-1">{spec.description || 'Specialized Care'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Top Rated Doctors</h2>
            <p className="text-sm text-slate-500">Book consultations with verified medical experts</p>
          </div>
          <Link to="/doctors" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            View All Doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-xl">
                    {doc.user?.first_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Dr. {doc.user?.first_name} {doc.user?.last_name}</h3>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{doc.specialization?.name}</p>
                    <RatingStars rating={doc.rating_avg} count={doc.reviews_count} />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <p className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> {doc.experience_years} Years Experience</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {doc.city}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fee</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">₹{doc.consultation_fee}</span>
                </div>
                <Link
                  to={`/doctors/${doc.id}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-slate-100 dark:bg-slate-900/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How MediConnect Works</h2>
            <p className="text-sm text-slate-500 mt-2">Book healthcare consultations in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300 font-bold text-lg flex items-center justify-center mx-auto">1</div>
              <h3 className="font-bold text-slate-900 dark:text-white">Search Doctors</h3>
              <p className="text-xs text-slate-500">Filter by specialization, location, consultation fee, and patient ratings.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300 font-bold text-lg flex items-center justify-center mx-auto">2</div>
              <h3 className="font-bold text-slate-900 dark:text-white">Select Slot & Pay</h3>
              <p className="text-xs text-slate-500">Choose a convenient date & time slot. Pay securely via Stripe or Razorpay.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300 font-bold text-lg flex items-center justify-center mx-auto">3</div>
              <h3 className="font-bold text-slate-900 dark:text-white">Consult & Get Receipt</h3>
              <p className="text-xs text-slate-500">Visit clinic or join online. Download your official medical receipt instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

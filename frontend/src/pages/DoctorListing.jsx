import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { RatingStars } from '../components/RatingStars';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CityAutocomplete } from '../components/CityAutocomplete';
import { Search, MapPin, Filter, Award, DollarSign, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const DoctorListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || '');
  const [ordering, setOrdering] = useState('-rating_avg');

  useEffect(() => {
    doctorService.getSpecializations().then(setSpecializations);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [searchParams, ordering]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || undefined,
        city: searchParams.get('city') || undefined,
        specialization: searchParams.get('specialization') || undefined,
        ordering: ordering,
      };
      const res = await doctorService.getDoctors(params);
      setDoctors(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (city) params.city = city;
    if (selectedSpec) params.specialization = selectedSpec;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setSelectedSpec('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find & Book Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">Browse verified medical practitioners and book instant appointments</p>
      </div>

      {/* Main Grid: Sidebar Filters + Doctor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter Doctors
            </h3>
            <button onClick={clearFilters} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              Reset All
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Doctor or Clinic name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <CityAutocomplete value={city} onChange={setCity} placeholder="City (e.g. Mumbai)" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Specialty</label>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">All Specialties</option>
                {specializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Doctor List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting Header */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
              Showing {doctors.length} Verified Doctors
            </span>

            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Sort By:</span>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="-rating_avg">Highest Rated</option>
                <option value="consultation_fee">Lowest Fee</option>
                <option value="-consultation_fee">Highest Fee</option>
                <option value="-experience_years">Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : doctors.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <p className="text-slate-400 font-semibold text-base">No doctors found matching your criteria.</p>
              <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">Clear search filters</button>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-2xl flex-shrink-0">
                      {doc.user?.first_name?.[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Dr. {doc.user?.first_name} {doc.user?.last_name}
                        </h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {doc.specialization?.name || 'General'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500">{doc.qualification}</p>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{doc.hospital_name} • {doc.city}</p>
                      
                      <div className="pt-1">
                        <RatingStars rating={doc.rating_avg} count={doc.reviews_count} />
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Consultation Fee</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{doc.consultation_fee}</span>
                    </div>

                    <Link
                      to={`/doctors/${doc.id}`}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                    >
                      Book Appointment
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

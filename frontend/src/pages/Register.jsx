import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { Activity, Mail, Lock, User, Phone, UserCheck, Stethoscope, Chrome, ShieldCheck, Award, FileText, CheckCircle2 } from 'lucide-react';

const DEFAULT_SPECIALIZATIONS = [
  { id: 'Cardiology', name: 'Cardiology' },
  { id: 'Dermatology', name: 'Dermatology' },
  { id: 'General Physician', name: 'General Physician' },
  { id: 'Neurology', name: 'Neurology' },
  { id: 'Orthopedics', name: 'Orthopedics' },
  { id: 'Pediatrics', name: 'Pediatrics' },
  { id: 'Gynecologist', name: 'Gynecologist' },
  { id: 'Psychiatrist', name: 'Psychiatrist' },
  { id: 'ENT Specialist', name: 'ENT Specialist' },
  { id: 'Ophthalmologist', name: 'Ophthalmologist' },
  { id: 'Dentist', name: 'Dentist' },
  { id: 'Pulmonologist', name: 'Pulmonologist' },
  { id: 'Oncologist', name: 'Oncologist' },
  { id: 'Gastroenterologist', name: 'Gastroenterologist' },
  { id: 'Urology', name: 'Urology' }
];

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('PATIENT');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [specializations, setSpecializations] = useState(DEFAULT_SPECIALIZATIONS);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    gender: '',
    date_of_birth: '',
    blood_group: '',
    // Doctor Specific Fields
    medical_registration_number: '',
    specialization_id: '',
    experience_years: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorService.getSpecializations().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setSpecializations(res);
      } else if (res?.results && Array.isArray(res.results) && res.results.length > 0) {
        setSpecializations(res.results);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('You must accept the Terms of Service & Privacy Policy to register.');
      return;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build clean payload without empty strings for optional fields
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: role,
      };

      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.gender) payload.gender = formData.gender;
      if (formData.date_of_birth) payload.date_of_birth = formData.date_of_birth;
      if (formData.blood_group) payload.blood_group = formData.blood_group;

      if (role === 'DOCTOR') {
        if (formData.medical_registration_number) payload.medical_registration_number = formData.medical_registration_number;
        if (formData.specialization_id) payload.specialization_id = formData.specialization_id;
        if (formData.experience_years) payload.experience_years = parseInt(formData.experience_years) || 0;
      }

      const data = await register(payload);
      if (role === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      console.error('[REGISTRATION ERROR]', err?.response?.data || err);
      const errData = err.response?.data;
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        const val = errData[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        setError(`${firstKey.replace('_', ' ')}: ${msg}`);
      } else {
        setError('Registration failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center mx-auto mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500">Join MediConnect as a Patient or Healthcare Practitioner</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => { setRole('PATIENT'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'PATIENT' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Patient Portal
          </button>
          <button
            type="button"
            onClick={() => { setRole('DOCTOR'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'DOCTOR' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Registration
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Account & Credentials */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1">
              Personal & Account Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="e.g. Rahul"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="e.g. Sharma"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="password_confirm"
                  required
                  placeholder="Re-enter password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Specific Fields */}
          {role === 'DOCTOR' ? (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-brand-600" /> Medical Professional Verification Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical Registration Number *</label>
                  <input
                    type="text"
                    name="medical_registration_number"
                    required={role === 'DOCTOR'}
                    placeholder="e.g. MCI-123456"
                    value={formData.medical_registration_number}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Years of Experience *</label>
                  <input
                    type="number"
                    name="experience_years"
                    required={role === 'DOCTOR'}
                    min={0}
                    max={60}
                    placeholder="e.g. 8"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Specialization *</label>
                  <select
                    name="specialization_id"
                    required={role === 'DOCTOR'}
                    value={formData.specialization_id}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      Select Specialization...
                    </option>
                    {specializations.map((spec) => (
                      <option 
                        key={spec.id || spec.name} 
                        value={spec.id || spec.name}
                        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1"
                      >
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender (Optional)</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select Gender...</option>
                    <option value="MALE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Male</option>
                    <option value="FEMALE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Female</option>
                    <option value="OTHER" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1">
                Patient Medical Profile (Optional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select...</option>
                    <option value="MALE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Male</option>
                    <option value="FEMALE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Female</option>
                    <option value="OTHER" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select...</option>
                    <option value="A+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">A+</option>
                    <option value="A-" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">A-</option>
                    <option value="B+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">B+</option>
                    <option value="B-" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">B-</option>
                    <option value="O+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">O+</option>
                    <option value="O-" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">O-</option>
                    <option value="AB+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">AB+</option>
                    <option value="AB-" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Terms and Conditions Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>
                I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-600 underline font-semibold">Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()} className="text-brand-600 underline font-semibold">Privacy Policy</a> of MediConnect.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'DOCTOR' ? 'Doctor' : 'Patient'}`}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 absolute">Or sign up with</span>
        </div>

        <button
          onClick={() => setShowGoogleModal(true)}
          type="button"
          className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Chrome className="w-4 h-4 text-blue-500" /> Google Register / Login
        </button>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already registered? <Link to="/login" className="text-brand-600 font-bold hover:underline">Log In</Link>
        </div>

        {showGoogleModal && (
          <GoogleAuthModal
            onClose={() => setShowGoogleModal(false)}
            onSuccess={(data) => {
              setShowGoogleModal(false);
              if (data.user?.role === 'DOCTOR') {
                navigate('/doctor-dashboard');
              } else {
                navigate('/patient-dashboard');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

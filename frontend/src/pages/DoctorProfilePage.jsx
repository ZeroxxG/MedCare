import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import { 
  User, Stethoscope, Building, Calendar, FileText, CheckCircle2, 
  AlertCircle, ShieldCheck, Upload, Save, Clock, Award, Globe, 
  Languages, DollarSign, Camera, Check, Plus, Trash2 
} from 'lucide-react';

export const DoctorProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    medical_registration_number: '',
    qualification: '',
    experience_years: 0,
    gender: '',
    hospital_name: '',
    clinic_address: '',
    city: '',
    consultation_fee: 500,
    online_consultation_fee: 400,
    consultation_duration_minutes: 30,
    bio: '',
    languages_spoken: '',
    services_offered: '',
    awards_certifications: '',
    specialization_id: '',
    secondary_specialization_id: '',
  });

  // Availability New Slot Form
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profData, specsData, availData] = await Promise.all([
        doctorService.getSelfProfile(),
        doctorService.getSpecializations(),
        doctorService.getAvailabilities(),
      ]);

      setProfile(profData);
      setSpecializations(specsData);
      setAvailabilities(availData.results || availData);

      setFormData({
        medical_registration_number: profData.medical_registration_number || '',
        qualification: profData.qualification || 'MBBS',
        experience_years: profData.experience_years || 0,
        gender: profData.gender || '',
        hospital_name: profData.hospital_name || '',
        clinic_address: profData.clinic_address || '',
        city: profData.city || '',
        consultation_fee: profData.consultation_fee || 500,
        online_consultation_fee: profData.online_consultation_fee || 400,
        consultation_duration_minutes: profData.consultation_duration_minutes || 30,
        bio: profData.bio || '',
        languages_spoken: profData.languages_spoken || 'English, Hindi',
        services_offered: profData.services_offered || '',
        awards_certifications: profData.awards_certifications || '',
        specialization_id: profData.specialization?.id || '',
        secondary_specialization_id: profData.secondary_specialization?.id || '',
      });
    } catch (err) {
      setError('Failed to load doctor profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const updated = await doctorService.updateSelfProfile(formData);
      setProfile(updated);
      setMessage('Doctor Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await doctorService.addAvailability(newSlot);
      const updatedAvail = await doctorService.getAvailabilities();
      setAvailabilities(updatedAvail.results || updatedAvail);
      setMessage('Weekly availability slot added!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to add availability slot.');
    } finally {
      setSaving(false);
    }
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-2xl shadow-inner">
            {user?.first_name?.[0] || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Dr. {user?.first_name} {user?.last_name}
              </h1>
              {profile?.verification_status === 'VERIFIED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Practitioner
                </span>
              ) : profile?.verification_status === 'REJECTED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Verification Rejected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.specialization?.name || 'General Practitioner'} • Reg No: <span className="font-mono text-slate-700 dark:text-slate-300">{profile?.medical_registration_number || 'N/A'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'personal', label: 'Personal & Bio', icon: User },
          { id: 'professional', label: 'Qualifications & Specializations', icon: Stethoscope },
          { id: 'practice', label: 'Clinic & Fees', icon: Building },
          { id: 'schedule', label: 'Weekly Schedule', icon: Calendar },
          { id: 'verification', label: 'License & Documents', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
        
        {/* TAB 1: Personal & Bio */}
        {activeTab === 'personal' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Personal Details & Biography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select Gender...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages Spoken</label>
                <input
                  type="text"
                  name="languages_spoken"
                  placeholder="e.g. English, Hindi, Marathi"
                  value={formData.languages_spoken}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Bio / About You</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your expertise, patient care philosophy, and background..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Qualifications & Specializations */}
        {activeTab === 'professional' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Medical Credentials & Specialties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical Registration Number</label>
                <input
                  type="text"
                  name="medical_registration_number"
                  value={formData.medical_registration_number}
                  onChange={handleChange}
                  placeholder="e.g. MCI-987654"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="experience_years"
                  min={0}
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Degrees & Qualifications</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Specialization</label>
                <select
                  name="specialization_id"
                  value={formData.specialization_id}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select Primary Specialization...</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Secondary Specialization (Optional)</label>
                <select
                  name="secondary_specialization_id"
                  value={formData.secondary_specialization_id}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select Secondary Specialization...</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Services Offered</label>
                <input
                  type="text"
                  name="services_offered"
                  placeholder="e.g. ECG, Echocardiogram, General Checkup"
                  value={formData.services_offered}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Awards & Certifications (Optional)</label>
              <textarea
                name="awards_certifications"
                rows={2}
                value={formData.awards_certifications}
                onChange={handleChange}
                placeholder="e.g. Gold Medalist in Cardiology 2018, Fellow of Indian College of Physicians"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Clinic & Fees */}
        {activeTab === 'practice' && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Clinic Location & Consultation Fees
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  placeholder="e.g. City Care Heart Hospital"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinic Address</label>
              <textarea
                name="clinic_address"
                rows={2}
                value={formData.clinic_address}
                onChange={handleChange}
                placeholder="Full address of clinic or hospital..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">In-Person Fee (₹)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Online Fee (₹)</label>
                <input
                  type="number"
                  name="online_consultation_fee"
                  value={formData.online_consultation_fee}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration per Appt (Mins)</label>
                <select
                  name="consultation_duration_minutes"
                  value={formData.consultation_duration_minutes}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Weekly Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Weekly Practice Schedule & Availability
            </h3>

            {/* Current Availability List */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Configured Active Slots</h4>
              {availabilities.length === 0 ? (
                <p className="text-slate-400 py-3 italic">No recurring availability slots added yet. Add a day schedule below.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availabilities.map((avail) => (
                    <div key={avail.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{avail.day_name}</span>
                        <p className="text-slate-500 text-[11px]">{avail.start_time?.slice(0,5)} - {avail.end_time?.slice(0,5)} ({avail.slot_duration_minutes}m slots)</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-bold">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Availability */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-brand-600" /> Add Practice Hours Slot
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Day of Week</label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {DAYS.map((d, idx) => (
                      <option key={idx} value={idx}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddAvailability}
                    disabled={saving}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Add Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Verification & Documents */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Medical Credentials & Verification Status
            </h3>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                <ShieldCheck className="w-5 h-5" /> Account Verification Status: {profile?.verification_status}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                MediConnect compliance team verifies medical licenses and registration numbers before granting verified badges to doctors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
                <Upload className="w-8 h-8 text-brand-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">Medical License Document</h4>
                <p className="text-slate-400 text-[11px]">Upload PDF or image of your Medical Council Registration Certificate</p>
                <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs">
                  Choose File...
                </button>
              </div>

              <div className="p-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-brand-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">Degree & Specialization Certificates</h4>
                <p className="text-slate-400 text-[11px]">Upload MBBS / MD / MS degree certificates for verification</p>
                <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs">
                  Choose File...
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};

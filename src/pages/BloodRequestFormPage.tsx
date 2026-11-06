import React, { useState, useEffect } from 'react';
import { AlertTriangle, Hospital, Phone, MapPin, Heart, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { BloodGroup, RequestUrgency } from '../types.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface BloodRequestFormPageProps {
  onNavigate: (page: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const CITIES = ['New York', 'Chicago', 'Houston', 'Los Angeles', 'Phoenix', 'Philadelphia', 'San Antonio', 'Dallas'];

export const BloodRequestFormPage: React.FC<BloodRequestFormPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsRequired, setUnitsRequired] = useState<number>(2);
  const [hospitalName, setHospitalName] = useState<string>('Mount Sinai Hospital, Emergency Center');
  const [city, setCity] = useState<string>('New York');
  const [urgency, setUrgency] = useState<RequestUrgency>('Emergency');
  const [contactNumber, setContactNumber] = useState<string>(user?.phone || '+1 (555) 019-2831');
  const [reason, setReason] = useState<string>('Acute trauma blood unit requirement during surgical intervention.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [compatibleCount, setCompatibleCount] = useState<number>(0);

  // Check matching donors count whenever blood group and city change
  useEffect(() => {
    async function checkAvailableCount() {
      try {
        const res = await api.get(`/donors?availability=Available&recipientBloodGroup=${bloodGroup}`);
        const count = res.data.filter((d: any) => d.isCompatible).length;
        setCompatibleCount(count);
      } catch (err) {
        // quiet
      }
    }
    checkAvailableCount();
  }, [bloodGroup, city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!hospitalName || !contactNumber || !city) {
      setError('Please fill in all hospital and contact information.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/requests', {
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        hospitalName: hospitalName.trim(),
        city: city.trim(),
        urgency,
        contactNumber: contactNumber.trim(),
        reason: reason.trim(),
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('requests');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit blood request');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
          <Heart className="w-3.5 h-3.5 fill-red-600" />
          <span>Clinical Request Submission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit a Blood Requirement Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect directly with compatible registered donors in your area. Emergency requests trigger immediate notifications.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header alert */}
        <div className={`p-4 text-xs font-semibold flex items-center justify-between gap-4 border-b ${
          urgency === 'Emergency'
            ? 'bg-red-50 text-red-900 border-red-200'
            : urgency === 'Urgent'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${urgency === 'Emergency' ? 'text-red-600' : urgency === 'Urgent' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span>
              {urgency === 'Emergency'
                ? 'High-Priority Emergency: Immediate broadcast sent to all compatible donors.'
                : urgency === 'Urgent'
                ? 'Urgent Request: Priority listing in donor matching queue.'
                : 'Standard Clinical Need: Displayed in regular request queue.'}
            </span>
          </div>

          <span className="text-[11px] font-bold">
            ~{compatibleCount} compatible donors nearby
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Blood request posted successfully! Redirecting to tracker...</span>
            </div>
          )}

          {/* Urgency Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Urgency Classification *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Normal', 'Urgent', 'Emergency'] as RequestUrgency[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    urgency === level
                      ? level === 'Emergency'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : level === 'Urgent'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{level}</span>
                  <span className="text-[10px] font-normal opacity-90">
                    {level === 'Emergency' ? '< 4 Hours' : level === 'Urgent' ? '< 24 Hours' : 'Scheduled'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Blood group & units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Patient Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-700"
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Units Required (Pints / Bags) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 tabular-nums"
              />
            </div>
          </div>

          {/* Hospital & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital / Transfusion Center Name *
              </label>
              <div className="relative">
                <Hospital className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Northwestern Memorial Hospital"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. New York, Chicago..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contact & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Diagnosis / Medical Context
              </label>
              <input
                type="text"
                placeholder="e.g. Scheduled surgery, trauma, leukemia..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>

          <MedicalDisclaimer compact={true} />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || success}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg text-white shadow-xs transition-colors cursor-pointer ${
                urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {loading ? 'Transmitting Request...' : 'Broadcast Blood Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

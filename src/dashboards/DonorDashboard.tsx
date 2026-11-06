import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Activity, Calendar, Clock, AlertTriangle, QrCode, Phone, CheckCircle2, User, RefreshCw } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IBloodRequest, IDonor, DonorAvailability } from '../types.js';
import { QRCodeModal } from '../components/QRCodeModal.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface DonorDashboardProps {
  onNavigate: (page: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { user, donor, updateDonorState } = useAuth();
  const [matchedRequests, setMatchedRequests] = useState<IBloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Cooldown calculation (56 days whole blood interval)
  const calculateCooldown = () => {
    if (!donor?.lastDonationDate) return { inCooldown: false, daysLeft: 0, percent: 100 };
    const lastDate = new Date(donor.lastDonationDate).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    const cooldownDays = 56;
    if (diffDays < cooldownDays) {
      const daysLeft = cooldownDays - diffDays;
      const percent = Math.min(100, Math.round((diffDays / cooldownDays) * 100));
      return { inCooldown: true, daysLeft, percent };
    }
    return { inCooldown: false, daysLeft: 0, percent: 100 };
  };

  const cooldown = calculateCooldown();

  const fetchMatchedRequests = async () => {
    if (!donor) return;
    try {
      setLoadingRequests(true);
      // Fetch pending requests that match this donor
      const res = await api.get(`/requests?status=Pending`);
      // Prioritize same city or emergency
      const filtered = res.data.filter((r: IBloodRequest) => {
        return r.bloodGroup === donor.bloodGroup || r.urgency === 'Emergency' || r.city.toLowerCase() === donor.city.toLowerCase();
      });
      setMatchedRequests(filtered);
    } catch (err) {
      console.error('Error loading matched requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMatchedRequests();
  }, [donor]);

  const handleAvailabilityChange = async (newAvailability: DonorAvailability) => {
    if (!donor) return;
    try {
      setUpdatingStatus(true);
      const res = await api.put('/donors/availability', { availability: newAvailability });
      updateDonorState(res.data.donor);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.post(`/requests/${requestId}/respond`, { action: 'accept' });
      alert('You have accepted this request! The requester has been notified with your contact details.');
      fetchMatchedRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error accepting request');
    }
  };

  if (!donor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Heart className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Complete Your Donor Profile</h2>
        <p className="text-xs text-slate-500">
          Your account is registered as a donor, but requires clinical profile setup to receive matching blood calls.
        </p>
        <button
          onClick={() => onNavigate('profile')}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Set Up Profile Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Donor Profile Header Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {donor.bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{donor.name}</h1>
              {donor.verified ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Donor
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Verification Pending
                </span>
              )}
            </div>
            {/* Unboxed metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{donor.city}</span>
              <span aria-hidden="true">·</span>
              <span>Age {donor.age}</span>
              <span aria-hidden="true">·</span>
              <span><strong className="text-slate-800 font-bold tabular-nums">{donor.totalDonations || 0}</strong> completed donations</span>
            </div>
          </div>
        </div>

        {/* Header Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            <span>Digital QR ID Badge</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Grid: Availability Tracker & Cooldown Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              Donor Availability Tracker
            </h3>
            <span className="text-xs font-bold text-red-600">
              Current: {donor.availability}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Set your current real-time readiness to receive emergency hospital blood calls.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['Available', 'Recently Donated', 'Unavailable'] as DonorAvailability[]).map((status) => (
              <button
                key={status}
                type="button"
                disabled={updatingStatus}
                onClick={() => handleAvailabilityChange(status)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                  donor.availability === status
                    ? status === 'Available'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : status === 'Recently Donated'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 56-Day Whole Blood Cooldown Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              56-Day Cooldown Tracker
            </h3>
            {cooldown.inCooldown ? (
              <span className="text-xs font-bold text-amber-600">
                {cooldown.daysLeft} days remaining
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600">
                Clinically Eligible to Donate
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Clinical guidelines recommend at least 8 weeks (56 days) between whole blood donations to replenish iron levels.
          </p>

          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  cooldown.inCooldown ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${cooldown.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Last: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'No prior record'}</span>
              <span>{cooldown.percent}% interval completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Blood Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Matching Urgent Blood Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hospital emergencies matching your blood group ({donor.bloodGroup}) or city ({donor.city})
            </p>
          </div>
          <button
            onClick={fetchMatchedRequests}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingRequests ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : matchedRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No pending blood requests matching your profile right now.
          </div>
        ) : (
          <div className="space-y-3">
            {matchedRequests.map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 font-extrabold flex flex-col items-center justify-center text-sm shrink-0">
                    <span>{req.bloodGroup}</span>
                    <span className="text-[10px] text-slate-600 font-normal">{req.unitsRequired}u</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{req.hospitalName}</h4>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        req.urgency === 'Emergency' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{req.city}</span>
                      <span>·</span>
                      <span>Requester: {req.requesterName}</span>
                    </div>
                    {req.reason && <p className="text-xs text-slate-600 italic mt-1">"{req.reason}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('requests')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req._id)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Accept Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MedicalDisclaimer compact={true} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        donor={donor}
      />
    </div>
  );
};

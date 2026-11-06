import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle2, User, Phone, MapPin, AlertTriangle, Search, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IBloodRequest, IDonor } from '../types.js';
import { ContactDonorModal } from '../components/ContactDonorModal.js';
import { QRCodeModal } from '../components/QRCodeModal.js';

interface RequesterDashboardProps {
  onNavigate: (page: string) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<IBloodRequest[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<IDonor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedContactDonor, setSelectedContactDonor] = useState<IDonor | null>(null);
  const [selectedQRDonor, setSelectedQRDonor] = useState<IDonor | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [reqRes, donorRes] = await Promise.all([
        api.get(`/requests?myRequests=true`),
        api.get(`/donors?city=${user.city}&availability=Available`),
      ]);
      setMyRequests(reqRes.data);
      setNearbyDonors(donorRes.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching requester dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Requester Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered City: <strong>{user?.city}</strong> · Emergency Contact: {user?.phone}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('request-blood')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Blood Request</span>
          </button>
          <button
            onClick={() => onNavigate('donors')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>Browse All Donors</span>
          </button>
        </div>
      </div>

      {/* Active Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Submitted Blood Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live tracking for hospital requirements posted by your account</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <p>You have not submitted any active blood requests yet.</p>
            <button
              onClick={() => onNavigate('request-blood')}
              className="text-red-600 font-bold hover:underline"
            >
              Post your first blood requirement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 font-extrabold flex flex-col items-center justify-center text-sm shrink-0">
                    <span>{req.bloodGroup}</span>
                    <span className="text-[10px] text-slate-600 font-normal">{req.unitsRequired}u</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{req.hospitalName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        req.urgency === 'Emergency' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.urgency}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        req.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        req.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {req.city} · Posted on {new Date(req.createdAt).toLocaleDateString()}
                    </p>

                    {req.matchedDonorName && (
                      <div className="text-xs text-emerald-800 font-bold mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Matched Volunteer: {req.matchedDonorName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('requests')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    View Status Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Donors in your City */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Registered Donors in {user?.city}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Verified local volunteers ready to respond to hospital emergencies</p>
          </div>
          <button
            onClick={() => onNavigate('donors')}
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nearbyDonors.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No active donors currently registered in {user?.city}. Browse all cities to locate regional donors.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyDonors.map((d) => (
              <div key={d._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-9 h-9 rounded-lg bg-red-100 text-red-700 font-extrabold flex items-center justify-center text-xs">
                      {d.bloodGroup}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {d.availability}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{d.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.city} · Age {d.age}</p>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedContactDonor(d)}
                    className="flex-1 py-1.5 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => setSelectedQRDonor(d)}
                    className="p-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="View QR"
                  >
                    <User className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactDonorModal
        isOpen={Boolean(selectedContactDonor)}
        onClose={() => setSelectedContactDonor(null)}
        donor={selectedContactDonor}
      />

      <QRCodeModal
        isOpen={Boolean(selectedQRDonor)}
        onClose={() => setSelectedQRDonor(null)}
        donor={selectedQRDonor}
      />
    </div>
  );
};

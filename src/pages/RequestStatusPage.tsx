import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle2, User, Phone, MapPin, RefreshCw, XCircle, ArrowRight, Eye, Shield, Heart } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IBloodRequest, RequestStatus } from '../types.js';

interface RequestStatusPageProps {
  onNavigate: (page: string) => void;
}

export const RequestStatusPage: React.FC<RequestStatusPageProps> = ({ onNavigate }) => {
  const { user, donor } = useAuth();
  const [requests, setRequests] = useState<IBloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterUrgency, setFilterUrgency] = useState<string>('All');
  const [onlyMyRequests, setOnlyMyRequests] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<IBloodRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterUrgency !== 'All') params.urgency = filterUrgency;
      if (onlyMyRequests && user) params.requesterId = user._id;

      const res = await api.get('/requests', { params });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterUrgency, onlyMyRequests]);

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/requests/${requestId}/respond`, { action });
      await fetchRequests();
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing response');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      setActionLoading(true);
      await api.put(`/requests/${requestId}/status`, { status: newStatus });
      await fetchRequests();
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Accepted':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Fulfilled':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Cancelled':
        return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-red-600 text-white font-bold';
      case 'Urgent':
        return 'bg-amber-100 text-amber-800 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Blood Request Coordination & Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track live hospital requirements, respond as an available donor, and monitor fulfillment progress.
          </p>
        </div>

        <button
          onClick={() => onNavigate('request-blood')}
          className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 w-fit cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Post New Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
              Status:
            </span>
            {['All', 'Pending', 'Accepted', 'Fulfilled', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Urgency and My Requests Checkbox */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Urgency:</span>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="All">All Levels</option>
                <option value="Emergency">🚨 Emergency Only</option>
                <option value="Urgent">⚠️ Urgent</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            {user && (
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyMyRequests}
                  onChange={(e) => setOnlyMyRequests(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>My Requests Only</span>
              </label>
            )}

            <button
              onClick={fetchRequests}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors ml-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-5 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No blood requests match this filter</h3>
            <p className="text-xs text-slate-500">Try changing the status tab or resetting the urgency filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isOwner = user && req.requesterId === user._id;
              const isAdmin = user && user.role === 'admin';
              const isDonor = user && user.role === 'donor';
              const canAccept = isDonor && req.status === 'Pending';

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Blood badge */}
                    <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-200 text-red-700 font-extrabold text-xl flex flex-col items-center justify-center shrink-0">
                      <span>{req.bloodGroup}</span>
                      <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                        {req.unitsRequired} {req.unitsRequired === 1 ? 'unit' : 'units'}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {req.hospitalName}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getUrgencyBadge(req.urgency)}`}>
                          {req.urgency}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      {/* Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {req.city}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Requester: <strong>{req.requesterName}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      {req.reason && (
                        <p className="text-xs text-slate-600 line-clamp-1 italic pt-0.5">
                          "{req.reason}"
                        </p>
                      )}

                      {req.matchedDonorName && (
                        <div className="text-xs text-emerald-800 font-semibold pt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Matched Volunteer: {req.matchedDonorName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Track Progress</span>
                    </button>

                    {canAccept && (
                      <button
                        onClick={() => handleRespond(req._id, 'accept')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Accept Request</span>
                      </button>
                    )}

                    {(isOwner || isAdmin) && req.status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Fulfilled')}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Fulfilled
                      </button>
                    )}

                    {(isOwner || isAdmin) && req.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Cancelled')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Lifecycle & Timeline</h3>
                <p className="text-xs text-slate-500">ID: {selectedRequest._id}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-red-700">{selectedRequest.bloodGroup} · {selectedRequest.unitsRequired} units</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-bold">{selectedRequest.hospitalName}</p>
              <p className="text-xs text-slate-600">Location: {selectedRequest.city} · Emergency Contact: {selectedRequest.contactNumber}</p>
              {selectedRequest.reason && (
                <p className="text-xs text-slate-500 italic">"{selectedRequest.reason}"</p>
              )}
            </div>

            {/* 4-Step Progress Timeline */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Fulfillment Protocol Progress
              </span>

              <div className="space-y-3 relative pl-6 border-l-2 border-slate-200">
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <h4 className="text-xs font-bold text-slate-900">01. Request Submitted</h4>
                  <p className="text-[11px] text-slate-500">
                    Logged at {new Date(selectedRequest.createdAt).toLocaleString()} by {selectedRequest.requesterName}.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    selectedRequest.status !== 'Pending' && selectedRequest.status !== 'Cancelled'
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`} />
                  <h4 className="text-xs font-bold text-slate-900">02. Donor Matched</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedRequest.matchedDonorName
                      ? `Accepted by volunteer ${selectedRequest.matchedDonorName}. Direct emergency contact confirmed.`
                      : 'Awaiting volunteer acceptance from compatible donors.'}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    selectedRequest.status === 'Fulfilled' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <h4 className="text-xs font-bold text-slate-900">03. Hospital Clinical Crossmatching</h4>
                  <p className="text-[11px] text-slate-500">
                    Donor reports to hospital blood laboratory for ABO crossmatch and safety screening.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    selectedRequest.status === 'Fulfilled' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <h4 className="text-xs font-bold text-slate-900">04. Transfusion Fulfilled</h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedRequest.status === 'Fulfilled'
                      ? 'Units successfully collected and delivered to attending medical team.'
                      : 'Pending final transfusion intake.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

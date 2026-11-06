import React, { useState, useEffect } from 'react';
import { Shield, Users, Heart, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Trash2, Ban, ShieldCheck, Database } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IPlatformStats } from '../types.js';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<IPlatformStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'donors' | 'analytics'>('users');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
      ]);
      setStats(dashRes.data.analytics);
      setUsers(usersRes.data);
    } catch (err: any) {
      console.error('Error loading admin console', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyDonor = async (donorId: string, currentVerified: boolean) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/donors/${donorId}/verify`, { verified: !currentVerified });
      setFeedbackMessage(`Donor verification status updated to ${!currentVerified ? 'Verified' : 'Unverified'}`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating verification');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      setFeedbackMessage(`User account status updated to ${nextStatus}`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user and their records?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/users/${userId}`);
      setFeedbackMessage('User account deleted');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Reset the database to initial seed demo data?')) return;
    try {
      setActionLoading(true);
      await api.post('/seed');
      setFeedbackMessage('Database re-seeded with demo records successfully.');
      await fetchAdminData();
    } catch (err: any) {
      alert('Error re-seeding demo data');
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <Shield className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Restricted Admin Access</h2>
        <p className="text-xs text-slate-500">
          This panel is restricted to verified BloodConnect system administrators.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  const donorUsers = users.filter((u) => u.role === 'donor' && u.donorProfile);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Admin Governance Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Audit user accounts, verify donor medical credentials, and oversee blood transfusion lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDemoData}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Reset and refresh sample demonstration records"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh All Data</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Total Registered Accounts</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
            {users.length}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Verified Donors</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block tabular-nums">
            {stats?.verifiedDonors || 0} / {stats?.totalDonors || 0}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Total Blood Requests</span>
          <span className="text-2xl font-extrabold text-red-600 mt-1 block tabular-nums">
            {stats?.totalRequests || 0}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Units Donated / Fulfilled</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
            {stats?.totalUnitsDonated || 0} Units ({stats?.fulfillmentRate || 0}%)
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Accounts Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'donors' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Donor Verification Queue ({donorUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Blood Group Distribution & Analytics
        </button>
      </div>

      {/* Tab 1: User Accounts Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        u.role === 'donor' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{u.city}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u.email !== 'admin@bloodconnect.org' && (
                        <>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.status)}
                            disabled={actionLoading}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={actionLoading}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Donor Verification Queue */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            Admins verify donor identification cards, clinical questionnaire validity, and contact suitability.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donorUsers.map((u) => {
                  const d = u.donorProfile;
                  return (
                    <tr key={d._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.name}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{d.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {d.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {d.age} yrs · {d.gender || 'Not specified'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{d.city}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {d.availability}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {d.verified ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleVerifyDonor(d._id, d.verified)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            d.verified
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {d.verified ? 'Revoke Verification' : 'Verify Profile'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Blood Group Distribution & Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Registered Donors by Blood Group
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of voluntary donors active in the registry by ABO/Rh group.
            </p>
            <div className="space-y-3 pt-2">
              {Object.entries(stats.bloodGroups || {}).map(([group, count]) => {
                const total = stats.totalDonors || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={group} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-red-700 w-10">{group}</span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {count} donors ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Blood Request Fulfillment Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Performance metrics for emergency coordination dispatch.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Pending Requests</span>
                  <span className="text-xl font-bold text-amber-600 tabular-nums">
                    {stats.pendingRequests}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Accepted & In Progress</span>
                  <span className="text-xl font-bold text-blue-600 tabular-nums">
                    {stats.acceptedRequests}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Completed & Fulfilled</span>
                  <span className="text-xl font-bold text-emerald-600 tabular-nums">
                    {stats.fulfilledRequests}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-900">Active High-Priority Emergencies</h4>
                  <p className="text-[11px] text-red-700 mt-0.5">Critical surgical cases requiring immediate attention</p>
                </div>
                <span className="text-2xl font-extrabold text-red-700 tabular-nums">
                  {stats.emergencyRequests}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

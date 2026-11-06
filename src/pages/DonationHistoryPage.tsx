import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Award, Hospital, CheckCircle2, Plus, Download, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { IDonationHistory, BloodGroup } from '../types.js';

interface DonationHistoryPageProps {
  onNavigate: (page: string) => void;
}

export const DonationHistoryPage: React.FC<DonationHistoryPageProps> = ({ onNavigate }) => {
  const { user, donor } = useAuth();
  const [histories, setHistories] = useState<IDonationHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCert, setSelectedCert] = useState<IDonationHistory | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New record form
  const [hospitalName, setHospitalName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donor?.bloodGroup || 'O+');
  const [units, setUnits] = useState(1);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [recipientName, setRecipientName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations');
      setHistories(res.data);
    } catch (err) {
      console.error('Error fetching donation history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  const openCertificate = (item: IDonationHistory) => {
    setSelectedCert(item);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName || !bloodGroup) return;

    try {
      setSubmitting(true);
      await api.post('/donations', {
        hospitalName,
        bloodGroup,
        units: Number(units),
        donationDate,
        recipientName,
        notes,
      });
      setSubmitting(false);
      setShowAddModal(false);
      fetchHistories();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error logging donation');
      setSubmitting(false);
    }
  };

  const totalUnits = histories.reduce((sum, h) => sum + (h.units || 1), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Donation History & Recognition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified records of voluntary blood contributions, hospital intakes, and donor certificates.
          </p>
        </div>

        {user && (user.role === 'donor' || user.role === 'admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 w-fit cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Completed Donation</span>
          </button>
        )}
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Total Donations Logged</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
            {histories.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Total Units Transfused</span>
          <span className="text-2xl font-extrabold text-red-600 mt-1 block tabular-nums">
            {totalUnits} Units
          </span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <span className="text-xs text-slate-500 font-medium block">Estimated Lives Impacted</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block tabular-nums">
            ~{totalUnits * 3} Patients
          </span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Donor Name</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Hospital / Clinic</th>
                <th className="py-3.5 px-4">Units</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading donation logs...
                  </td>
                </tr>
              ) : histories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No donation records logged yet.
                  </td>
                </tr>
              ) : (
                histories.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                      {new Date(h.donationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {h.donorName || 'Volunteer Donor'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                        {h.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {h.hospitalName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">
                      {h.units} unit{h.units > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {h.recipientName || 'Clinical Emergency'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        h.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {h.status === 'Completed' ? (
                        <button
                          onClick={() => openCertificate(h)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending intake</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-100 overflow-hidden p-8 text-center space-y-6">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-amber-700">
                Official Recognition of Service
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Certificate of Appreciation</h2>
              <p className="text-xs text-slate-500">BloodConnect National Donor Registry</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              This certificate is proudly awarded to{' '}
              <strong className="text-slate-900 text-sm block my-1 font-bold">{selectedCert.donorName || 'Volunteer Donor'}</strong>
              in gratitude for voluntary whole blood contribution of{' '}
              <strong className="text-red-700 font-bold">{selectedCert.units} unit(s) of {selectedCert.bloodGroup}</strong> blood at{' '}
              <strong className="text-slate-900 font-semibold">{selectedCert.hospitalName}</strong> on{' '}
              <span>{new Date(selectedCert.donationDate).toLocaleDateString()}</span>.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-around">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Certificate No.</span>
                <span className="font-mono text-slate-700 font-bold">BC-{selectedCert._id.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Verified Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Donation Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Completed Donation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mount Sinai Hospital"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donation Date *</label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Name / Ward (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Pediatric Ward / Trauma ER"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Platelet apheresis session, vitals nominal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

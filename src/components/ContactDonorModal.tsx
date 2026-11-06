import React, { useState } from 'react';
import { X, ShieldAlert, Phone, Mail, CheckCircle2, Lock } from 'lucide-react';
import { IDonor } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

interface ContactDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: IDonor | null;
}

export const ContactDonorModal: React.FC<ContactDonorModalProps> = ({ isOpen, onClose, donor }) => {
  const { user } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [sendingPing, setSendingPing] = useState(false);
  const [pingSent, setPingSent] = useState(false);

  if (!isOpen || !donor) return null;

  const handleReveal = async () => {
    if (!consentGiven) return;
    setRevealed(true);

    // Send in-app notification to donor that a verified patient reached out
    if (user) {
      try {
        setSendingPing(true);
        await api.post(`/notifications`, {
          userId: donor.userId,
          message: `Coordination inquiry: ${user.name} viewed your contact details for urgent blood requirement${hospitalName ? ` at ${hospitalName}` : ''}.`,
          type: 'request',
        });
        setPingSent(true);
      } catch (e) {
        // quiet
      } finally {
        setSendingPing(false);
      }
    }
  };

  const handleClose = () => {
    setConsentGiven(false);
    setRevealed(false);
    setHospitalName('');
    setPingSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Donor Contact Coordination</h3>
            <p className="text-xs text-slate-500">Protecting volunteer donor privacy & emergency protocol</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 font-extrabold flex items-center justify-center text-sm">
              {donor.bloodGroup}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{donor.name}</h4>
              <p className="text-xs text-slate-500">{donor.city} · Age {donor.age} · Status: {donor.availability}</p>
            </div>
          </div>

          {!revealed ? (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950">Ethical Coordination Terms</p>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Volunteer donors share their availability in good faith. You agree to contact this donor strictly for medical blood coordination and to never solicit commercial, unsolicited, or promotional inquiries.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hospital / Clinical Center (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Jude Hospital, ICU Ward 3"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  I confirm this is for a genuine blood requirement, and understand that crossmatching must be verified at the clinical facility.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!consentGiven}
                  onClick={handleReveal}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors ${
                    consentGiven ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Reveal Contact Number
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Contact Information</span>
                </div>
                
                <div className="bg-white p-3.5 rounded-lg border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Phone Number:
                    </span>
                    <a
                      href={`tel:${donor.phone}`}
                      className="font-bold text-red-700 hover:underline font-mono text-sm"
                    >
                      {donor.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Address:
                    </span>
                    <a
                      href={`mailto:${donor.email}`}
                      className="font-medium text-slate-800 hover:underline font-mono"
                    >
                      {donor.email}
                    </a>
                  </div>
                </div>

                {pingSent && (
                  <p className="text-[11px] text-emerald-700">
                    ✓ A notification ping has been sent to {donor.name} via BloodConnect.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

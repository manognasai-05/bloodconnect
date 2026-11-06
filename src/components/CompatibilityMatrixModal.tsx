import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { BloodGroup } from '../types.js';
import { MedicalDisclaimer } from './MedicalDisclaimer.js';

interface CompatibilityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const MATRIX: Record<BloodGroup, Record<BloodGroup, boolean>> = {
  'O-': { 'O-': true, 'O+': true, 'A-': true, 'A+': true, 'B-': true, 'B+': true, 'AB-': true, 'AB+': true },
  'O+': { 'O-': false, 'O+': true, 'A-': false, 'A+': true, 'B-': false, 'B+': true, 'AB-': false, 'AB+': true },
  'A-': { 'O-': false, 'O+': false, 'A-': true, 'A+': true, 'B-': false, 'B+': false, 'AB-': true, 'AB+': true },
  'A+': { 'O-': false, 'O+': false, 'A-': false, 'A+': true, 'B-': false, 'B+': false, 'AB-': false, 'AB+': true },
  'B-': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': true, 'B+': true, 'AB-': true, 'AB+': true },
  'B+': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': true, 'AB-': false, 'AB+': true },
  'AB-': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': true, 'AB+': true },
  'AB+': { 'O-': false, 'O+': false, 'A-': false, 'A+': false, 'B-': false, 'B+': false, 'AB-': false, 'AB+': true },
};

export const CompatibilityMatrixModal: React.FC<CompatibilityMatrixModalProps> = ({ isOpen, onClose }) => {
  const [selectedDonor, setSelectedDonor] = useState<BloodGroup>('O-');
  const [selectedRecipient, setSelectedRecipient] = useState<BloodGroup>('A+');

  if (!isOpen) return null;

  const isCompatible = MATRIX[selectedDonor][selectedRecipient];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Blood Group Compatibility Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Red Blood Cell (RBC) Transfusion Reference Guide</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Checker */}
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Quick Compatibility Evaluator
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Donor Blood Group</label>
              <select
                value={selectedDonor}
                onChange={(e) => setSelectedDonor(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Recipient Blood Group</label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-3 text-sm font-medium ${
            isCompatible
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {isCompatible ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Donor <strong>{selectedDonor}</strong> red blood cells are compatible with recipient <strong>{selectedRecipient}</strong>.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Donor <strong>{selectedDonor}</strong> red blood cells are <strong>NOT compatible</strong> with recipient <strong>{selectedRecipient}</strong>.</span>
              </>
            )}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-2.5 text-left font-semibold">Donor ↓ \ Recipient →</th>
                {BLOOD_GROUPS.map((g) => (
                  <th key={g} className="p-2 font-bold text-slate-900">{g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOOD_GROUPS.map((donorGroup) => (
                <tr key={donorGroup} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-2.5 text-left font-bold text-slate-900 bg-slate-50/60 border-r border-slate-200">
                    {donorGroup}
                  </td>
                  {BLOOD_GROUPS.map((recipientGroup) => {
                    const ok = MATRIX[donorGroup][recipientGroup];
                    return (
                      <td key={recipientGroup} className="p-2">
                        {ok ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-300 font-bold">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs text-slate-600">
          <div className="p-3 bg-red-50/60 border border-red-100 rounded-lg">
            <strong className="text-red-900 block mb-1">O- Negative: Universal Red Cell Donor</strong>
            O- blood lacks A, B, and Rh antigens, making it suitable in emergency transfusions for all blood types when crossmatch time is unavailable.
          </div>
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <strong className="text-blue-900 block mb-1">AB+ Positive: Universal Recipient</strong>
            Individuals with AB+ blood have A, B, and Rh antigens and can safely receive red cells from any ABO blood group.
          </div>
        </div>

        <MedicalDisclaimer compact={true} />

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

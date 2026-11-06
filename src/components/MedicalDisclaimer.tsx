import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Medical Verification Notice:</strong> BloodConnect facilitates donor discovery and request coordination. Donor eligibility, crossmatching, and blood safety must be certified by qualified medical professionals and licensed blood banks before any transfusion.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex flex-col sm:flex-row items-start gap-3.5">
      <div className="p-2 bg-amber-100 rounded-lg shrink-0 text-amber-700">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-amber-950 text-sm">Clinical Safety & Verification Advisory</h4>
        <p className="text-xs text-amber-800 leading-relaxed">
          BloodConnect is a peer discovery platform and does not perform medical decision-making or laboratory testing. Blood compatibility, Rh factor matching, and donor health suitability must always be independently tested and authorized by certified medical practitioners and accredited transfusion services.
        </p>
      </div>
    </div>
  );
};

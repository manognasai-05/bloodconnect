import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import api from '../services/api.js';
import { IBloodRequest } from '../types.js';

interface EmergencyBannerProps {
  onNavigate: (page: string) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onNavigate }) => {
  const [emergencyRequest, setEmergencyRequest] = useState<IBloodRequest | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkEmergencies() {
      try {
        const res = await api.get('/requests?urgency=Emergency&status=Pending');
        if (res.data && res.data.length > 0) {
          setEmergencyRequest(res.data[0]);
        } else {
          setEmergencyRequest(null);
        }
      } catch (err) {
        // quiet fallback
      }
    }
    checkEmergencies();
  }, []);

  if (!emergencyRequest || isDismissed) return null;

  return (
    <div className="bg-red-700 text-white px-4 py-2.5 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center gap-1 font-bold bg-white text-red-700 px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px] shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            Active Emergency
          </span>
          <p className="truncate">
            Urgent need for <strong>{emergencyRequest.unitsRequired} unit(s) of {emergencyRequest.bloodGroup}</strong> at{' '}
            <span>{emergencyRequest.hospitalName} ({emergencyRequest.city})</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('requests')}
            className="flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-red-100 transition-colors"
          >
            Respond Now <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

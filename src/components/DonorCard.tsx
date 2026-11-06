import React from 'react';
import { ShieldCheck, MapPin, QrCode, Phone, Heart } from 'lucide-react';
import { IDonor } from '../types.js';

interface DonorCardProps {
  donor: IDonor;
  onOpenQR: (donor: IDonor) => void;
  onRequestContact: (donor: IDonor) => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onOpenQR, onRequestContact }) => {
  const getAvailabilityClass = (avail: string) => {
    switch (avail) {
      case 'Available':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Recently Donated':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header of card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Blood Group Box */}
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-700 font-extrabold text-lg flex items-center justify-center shrink-0">
              {donor.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-base leading-snug">{donor.name}</h3>
                {donor.verified && (
                  <span title="Officially Verified Donor Profile" className="text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{donor.city}</span>
                <span aria-hidden="true">·</span>
                <span>Age {donor.age}</span>
              </div>
            </div>
          </div>

          {/* Availability status */}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getAvailabilityClass(donor.availability)}`}>
            {donor.availability}
          </span>
        </div>

        {/* Unboxed metadata row */}
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2 border-t border-b border-slate-100 my-3">
          <span>{donor.gender || 'Donor'}</span>
          <span aria-hidden="true">·</span>
          <span><strong className="font-semibold text-slate-800 tabular-nums">{donor.totalDonations || 0}</strong> completed donations</span>
          {donor.lastDonationDate && (
            <>
              <span aria-hidden="true">·</span>
              <span>Last: {new Date(donor.lastDonationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </>
          )}
        </div>

        {/* Bio */}
        {donor.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            "{donor.bio}"
          </p>
        )}

        {/* Smart Compatibility Assessment notice if present */}
        {donor.isCompatible !== undefined && donor.isCompatible !== null && (
          <div className={`p-2.5 rounded-lg text-xs mb-3 ${
            donor.isCompatible 
              ? 'bg-emerald-50/70 text-emerald-900 border border-emerald-100' 
              : 'bg-rose-50/70 text-rose-900 border border-rose-100'
          }`}>
            <p className="font-medium">{donor.compatibilityNote}</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onOpenQR(donor)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
          title="View Digital QR Badge"
        >
          <QrCode className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">QR Badge</span>
        </button>

        <button
          onClick={() => onRequestContact(donor)}
          disabled={donor.availability === 'Unavailable'}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            donor.availability === 'Unavailable'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Request Contact</span>
        </button>
      </div>
    </div>
  );
};

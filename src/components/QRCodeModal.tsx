import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Check, ShieldCheck, Copy } from 'lucide-react';
import { IDonor } from '../types.js';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: IDonor | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, donor }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!donor || !isOpen) return;

    // Generate unique verification payload for the donor
    const payload = JSON.stringify({
      system: 'BloodConnect Verified Donor Registry',
      id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      verified: donor.verified,
      totalDonations: donor.totalDonations,
      timestamp: new Date().toISOString(),
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#991b1b', // Deep crimson
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [donor, isOpen]);

  if (!isOpen || !donor) return null;

  const handleCopyLink = () => {
    const text = `BloodConnect Donor: ${donor.name} | Blood Group: ${donor.bloodGroup} | City: ${donor.city} | ID: ${donor._id}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `BloodConnect_QR_${donor.name.replace(/\s+/g, '_')}_${donor.bloodGroup}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-100">
              Official Digital Donor ID
            </span>
            {donor.verified && (
              <span className="flex items-center gap-1 text-[11px] bg-red-900/60 text-white px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Verified
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{donor.name}</h3>
          <p className="text-xs text-red-200 font-mono mt-0.5">ID: {donor._id}</p>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-block p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${donor.name}`}
                className="w-52 h-52 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                Generating QR Code...
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Group</span>
              <span className="font-bold text-red-700 text-base">{donor.bloodGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
              <span className="font-medium text-slate-800 truncate block">{donor.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Donations</span>
              <span className="font-semibold text-slate-800 tabular-nums">{donor.totalDonations || 0} times</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Scan this official QR badge at affiliated hospital transfusion registries to verify donor membership and access emergency contact credentials.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Copied' : 'Copy Card Data'}
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

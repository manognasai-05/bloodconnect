import React from 'react';
import { Heart, Phone, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenCompatibility: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCompatibility }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <span>BloodConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An online blood donor discovery and request coordination platform bridging voluntary blood donors with patients and clinics facing critical shortages.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verified Donor Registry</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('donors')} className="hover:text-white transition-colors">
                  Search Registered Donors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('requests')} className="hover:text-white transition-colors">
                  Urgent Blood Requests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('request-blood')} className="hover:text-white transition-colors">
                  Post Blood Need
                </button>
              </li>
              <li>
                <button onClick={onOpenCompatibility} className="hover:text-white transition-colors">
                  RBC Compatibility Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-white transition-colors">
                  Register as Volunteer Donor
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Compliance & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Doctor Verification Protocol</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>56-Day Cooldown Tracker</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Donor Privacy & Consent First</span>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="text-slate-300 hover:text-white transition-colors">
                  About Our Project Team
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Emergency Coordination
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-semibold text-slate-200">24/7 Helpline:</span>
                <span>1-800-RED-LIFE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>support@bloodconnect.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>National Blood Coordination Desk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer in Footer */}
        <div className="border-t border-slate-800 pt-6 pb-4">
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-4xl">
            <strong className="text-slate-300 font-semibold">Important Medical Notice:</strong> BloodConnect is an information discovery and request coordination tool designed for academic and humanitarian workflow demonstration. It does not replace medical diagnostics or clinical decision-making. All blood compatibility, crossmatching, donor health checks, infectious screening, and extraction procedures must be conducted by certified hematology laboratories and authorized blood banking authorities.
          </p>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} BloodConnect – Online Blood Donor Management System. College Training Project.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-200 transition-colors">
              About Project
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-200 transition-colors">
              Contact Desk
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

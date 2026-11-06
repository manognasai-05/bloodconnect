import React, { useEffect, useState } from 'react';
import { Heart, Search, UserPlus, Shield, Activity, Users, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { IPlatformStats, BloodGroup } from '../types.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenCompatibility: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenCompatibility }) => {
  const [stats, setStats] = useState<IPlatformStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        console.warn('Could not load homepage stats');
      }
    }
    fetchStats();
  }, []);

  const bloodGroupList: { group: BloodGroup; label: string; desc: string }[] = [
    { group: 'O-', label: 'Universal Red Cell Donor', desc: 'Can donate to any blood type. Crucial for emergency trauma response.' },
    { group: 'O+', label: 'Most Common Blood Type', desc: 'High clinical demand. Can donate to O+, A+, B+, and AB+ recipients.' },
    { group: 'A-', label: 'Rare Negative Rh Type', desc: 'Can donate to A-, A+, AB-, and AB+ patients.' },
    { group: 'A+', label: 'Second Most Prevalent', desc: 'Can donate to A+ and AB+ recipients in surgical and trauma wards.' },
    { group: 'B-', label: 'Rare Donor Type', desc: 'Supports B-, B+, AB-, and AB+ clinical transfusions.' },
    { group: 'B+', label: 'Vital Platelet & RBC Need', desc: 'Essential for cancer treatments, sickle cell disease, and surgery.' },
    { group: 'AB-', label: 'Rarest Blood Group', desc: 'Can receive all negative types. Highly sought after for plasma donation.' },
    { group: 'AB+', label: 'Universal Recipient', desc: 'Can receive red cells from all ABO blood types; universal plasma donor.' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Proposition & CTA */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full w-fit">
                <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                <span>Verified Online Blood Donor Network</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
                Donate Blood, <span className="text-red-600">Save Lives.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                BloodConnect accelerates life-saving connections between voluntary blood donors, patients, and hospital care teams. Discover compatible donors by blood group and city in seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('donors')}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Donors</span>
                </button>

                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-red-600" />
                  <span>Become a Donor</span>
                </button>

                <button
                  onClick={() => onNavigate('request-blood')}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request Blood</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Doctor Verified Donors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Smart RBC Compatibility</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Rapid Emergency Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-fidelity clinical photography */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 h-80 sm:h-96 lg:h-full min-h-[360px]">
                <img
                  src="/src/assets/images/hero_blood_donation_1793859472002.jpg"
                  alt="Voluntary blood donor with medical staff in a modern clinical setting"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <p className="text-xs uppercase tracking-wider font-bold text-red-400">
                    Community Impact
                  </p>
                  <p className="text-base font-semibold text-white/95 mt-1 leading-snug">
                    A single whole blood donation can help save up to 3 patient lives in acute clinical trauma.
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
                    <span>Clean clinical standards</span>
                    <span>·</span>
                    <span>56-day cooldown tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PLATFORM STATISTICS STRIP */}
        <div className="bg-slate-50 border-t border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {stats ? stats.totalDonors : '150+'}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1 block">
                  Registered Donors
                </span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-extrabold text-red-600 tabular-nums">
                  {stats ? `${stats.totalUnitsDonated} Units` : '320+ Units'}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1 block">
                  Blood Units Collected
                </span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
                  {stats ? `${stats.fulfillmentRate}%` : '94%'}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1 block">
                  Request Fulfillment Rate
                </span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  24 / 7
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1 block">
                  Emergency Coordination
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How BloodConnect Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A secure three-step coordination workflow connecting donors and hospitals with clinical transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 relative hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm border border-red-100">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Search or Post a Request</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search the verified donor registry by blood type and city, or submit an urgent blood request with hospital location and unit count.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 relative hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm border border-red-100">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Smart Compatibility Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Available donors receive immediate alerts. The system cross-references ABO/Rh compatibility rules for preliminary evaluation.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 relative hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm border border-red-100">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Hospital Crossmatch & Donation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The donor presents their digital QR ID badge at the certified hospital laboratory for standard clinical crossmatching and safe transfusion.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BLOOD GROUP AVAILABILITY MATRIX PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Blood Group Directory & Compatibility
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any blood group to browse registered voluntary donors in our registry.
            </p>
          </div>
          <button
            onClick={onOpenCompatibility}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open Compatibility Matrix</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bloodGroupList.map((item) => (
            <div
              key={item.group}
              onClick={() => onNavigate('donors')}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-700 font-extrabold flex items-center justify-center text-base group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {item.group}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-red-600 flex items-center gap-0.5">
                  Find Donors <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">{item.label}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MEDICAL SAFETY ADVISORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicalDisclaimer />
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Make a Life-Saving Impact?
            </h2>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              Register as a voluntary donor today. Receive immediate alerts when patients in your city need your blood type, with complete privacy controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 text-sm font-bold text-red-700 bg-white hover:bg-red-50 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Register as Donor
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-3 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              Contact Hospital Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

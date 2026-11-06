import React, { useState, useEffect } from 'react';
import { Search, Filter, Activity, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import { IDonor, BloodGroup } from '../types.js';
import { DonorCard } from '../components/DonorCard.js';
import { QRCodeModal } from '../components/QRCodeModal.js';
import { ContactDonorModal } from '../components/ContactDonorModal.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface SearchDonorsPageProps {
  onOpenCompatibility: () => void;
}

const BLOOD_GROUPS: (BloodGroup | 'All')[] = ['All', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const CITIES = ['All', 'New York', 'Chicago', 'Houston', 'Los Angeles', 'Phoenix', 'Philadelphia', 'San Antonio'];

export const SearchDonorsPage: React.FC<SearchDonorsPageProps> = ({ onOpenCompatibility }) => {
  const [donors, setDonors] = useState<IDonor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  
  // Smart recipient compatibility mode
  const [compatibilityMode, setCompatibilityMode] = useState<boolean>(false);
  const [recipientBloodGroup, setRecipientBloodGroup] = useState<BloodGroup>('A+');

  // Modal states
  const [selectedDonorForQR, setSelectedDonorForQR] = useState<IDonor | null>(null);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<IDonor | null>(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBloodGroup !== 'All') params.bloodGroup = selectedBloodGroup;
      if (selectedCity !== 'All') params.city = selectedCity;
      if (selectedAvailability !== 'All') params.availability = selectedAvailability;
      if (search.trim()) params.search = search.trim();
      if (compatibilityMode) params.recipientBloodGroup = recipientBloodGroup;

      const res = await api.get('/donors', { params });
      setDonors(res.data);
    } catch (err) {
      console.error('Error fetching donors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodGroup, selectedCity, selectedAvailability, compatibilityMode, recipientBloodGroup]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Registered Blood Donors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified voluntary blood donors by blood group, location, and real-time clinical availability.
          </p>
        </div>

        <button
          onClick={onOpenCompatibility}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors w-fit cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-red-600" />
          <span>RBC Compatibility Chart</span>
        </button>
      </div>

      {/* Smart Compatibility Matching Toggle Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="compatModeToggle"
              checked={compatibilityMode}
              onChange={(e) => setCompatibilityMode(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="compatModeToggle" className="cursor-pointer">
              <span className="text-xs font-bold text-slate-900 block">
                Enable Smart Recipient Matching
              </span>
              <span className="text-[11px] text-slate-500">
                Filter and evaluate registered donors for a specific patient recipient blood group.
              </span>
            </label>
          </div>

          {compatibilityMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Patient Blood Type:</span>
              <select
                value={recipientBloodGroup}
                onChange={(e) => setRecipientBloodGroup(e.target.value as BloodGroup)}
                className="px-3 py-1.5 text-xs font-bold bg-red-50 border border-red-200 text-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BLOOD_GROUPS.filter(g => g !== 'All').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by donor name, city, or blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Blood group pills (interactive filter controls) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-2">
              Blood Group:
            </span>
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedBloodGroup(g)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedBloodGroup === g
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* City and Availability filters */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Availability:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available Now</option>
                <option value="Recently Donated">In Cooldown / Donated</option>
                <option value="Unavailable">Temporarily Unavailable</option>
              </select>
            </div>

            {(selectedBloodGroup !== 'All' || selectedCity !== 'All' || selectedAvailability !== 'All' || search) && (
              <button
                onClick={() => {
                  setSelectedBloodGroup('All');
                  setSelectedCity('All');
                  setSelectedAvailability('All');
                  setSearch('');
                }}
                className="text-red-600 hover:text-red-700 font-semibold text-xs ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <MedicalDisclaimer compact={true} />

      {/* Donor Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 tabular-nums">{donors.length}</strong> registered donors
          </p>
          <button
            onClick={fetchDonors}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-16 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded" />
                <div className="w-full h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching donors found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your blood group filter or expanding your location to see more available donors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <DonorCard
                key={donor._id}
                donor={donor}
                onOpenQR={(d) => setSelectedDonorForQR(d)}
                onRequestContact={(d) => setSelectedDonorForContact(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <QRCodeModal
        isOpen={Boolean(selectedDonorForQR)}
        onClose={() => setSelectedDonorForQR(null)}
        donor={selectedDonorForQR}
      />

      <ContactDonorModal
        isOpen={Boolean(selectedDonorForContact)}
        onClose={() => setSelectedDonorForContact(null)}
        donor={selectedDonorForContact}
      />
    </div>
  );
};

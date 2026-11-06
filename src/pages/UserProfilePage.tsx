import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Lock, ShieldCheck, Heart, QrCode, CheckCircle2, Save, Download } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { BloodGroup, DonorAvailability } from '../types.js';
import { QRCodeModal } from '../components/QRCodeModal.js';

interface UserProfilePageProps {
  onNavigate: (page: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { user, donor, updateUserState, updateDonorState } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [password, setPassword] = useState('');

  // Donor fields
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donor?.bloodGroup || 'O+');
  const [age, setAge] = useState<number>(donor?.age || 26);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(donor?.gender || 'Prefer not to say');
  const [bio, setBio] = useState(donor?.bio || '');
  const [availability, setAvailability] = useState<DonorAvailability>(donor?.availability || 'Available');
  const [lastDonationDate, setLastDonationDate] = useState(donor?.lastDonationDate ? donor.lastDonationDate.split('T')[0] : '');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your profile</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      // 1. Update basic user account info
      const userRes = await api.put('/auth/profile', {
        name,
        phone,
        city,
        ...(password && { password }),
      });
      updateUserState(userRes.data.user);

      // 2. If donor, update donor profile
      if (user.role === 'donor') {
        const donorRes = await api.put('/donors/profile', {
          age: Number(age),
          bloodGroup,
          gender,
          city,
          phone,
          bio,
          availability,
          lastDonationDate: lastDonationDate || undefined,
        });
        updateDonorState(donorRes.data.donor);
      }

      setFeedback('Profile and medical settings updated successfully!');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-extrabold text-2xl flex items-center justify-center">
            {donor ? donor.bloodGroup : user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {user.role}
              </span>
              {donor?.verified && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Donor
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email} · Registered {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {donor && (
          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Digital QR ID</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage your contact credentials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Account ID)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Donor specific fields */}
        {user.role === 'donor' && (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Donor Profile & Medical Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Clinical details displayed to hospital coordinators</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-bold text-red-700"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (18-65)</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as DonorAvailability)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Recently Donated">Recently Donated</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Whole Blood Donation Date</label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Bio & Medical Notes</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Regular voluntary donor, non-smoker, ready for pediatric emergency calls..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        donor={donor}
      />
    </div>
  );
};

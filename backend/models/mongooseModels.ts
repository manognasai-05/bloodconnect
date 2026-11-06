import mongoose, { Schema } from 'mongoose';
import { IUser, IDonor, IBloodRequest, INotification, IDonationHistory } from './types.js';

// User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['donor', 'requester', 'admin'], default: 'donor' },
  city: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

// Donor Schema
const DonorSchema = new Schema<IDonor>({
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 70 },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
  availability: { type: String, enum: ['Available', 'Unavailable', 'Recently Donated'], default: 'Available' },
  lastDonationDate: { type: String },
  verified: { type: Boolean, default: false },
  totalDonations: { type: Number, default: 0 },
  bio: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

// Blood Request Schema
const BloodRequestSchema = new Schema<IBloodRequest>({
  requesterId: { type: String, required: true, ref: 'User' },
  requesterName: { type: String, required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  hospitalName: { type: String, required: true },
  city: { type: String, required: true },
  unitsRequired: { type: Number, required: true, min: 1 },
  urgency: { type: String, enum: ['Normal', 'Urgent', 'Emergency'], default: 'Normal' },
  contactNumber: { type: String, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Fulfilled', 'Cancelled'], default: 'Pending' },
  matchedDonorId: { type: String, ref: 'Donor' },
  matchedDonorName: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

// Notification Schema
const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, ref: 'User' },
  message: { type: String, required: true },
  type: { type: String, enum: ['request', 'status_change', 'verification', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// Donation History Schema
const DonationHistorySchema = new Schema<IDonationHistory>({
  donorId: { type: String, required: true, ref: 'Donor' },
  donorName: { type: String },
  requestId: { type: String, ref: 'BloodRequest' },
  hospitalName: { type: String, required: true },
  recipientName: { type: String },
  bloodGroup: { type: String, required: true },
  donationDate: { type: String, default: () => new Date().toISOString() },
  units: { type: Number, default: 1 },
  status: { type: String, enum: ['Completed', 'Scheduled'], default: 'Completed' },
  notes: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const DonorModel = mongoose.models.Donor || mongoose.model<IDonor>('Donor', DonorSchema);
export const BloodRequestModel = mongoose.models.BloodRequest || mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const DonationHistoryModel = mongoose.models.DonationHistory || mongoose.model<IDonationHistory>('DonationHistory', DonationHistorySchema);

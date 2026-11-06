export type UserRole = 'donor' | 'requester' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonorAvailability = 'Available' | 'Unavailable' | 'Recently Donated';
export type RequestUrgency = 'Normal' | 'Urgent' | 'Emergency';
export type RequestStatus = 'Pending' | 'Accepted' | 'Fulfilled' | 'Cancelled';
export type NotificationType = 'request' | 'status_change' | 'verification' | 'system';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  city: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface IDonor {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  bloodGroup: BloodGroup;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  availability: DonorAvailability;
  lastDonationDate?: string;
  verified: boolean;
  totalDonations: number;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IBloodRequest {
  _id: string;
  requesterId: string;
  requesterName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  city: string;
  unitsRequired: number;
  urgency: RequestUrgency;
  contactNumber: string;
  reason?: string;
  status: RequestStatus;
  matchedDonorId?: string;
  matchedDonorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface INotification {
  _id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IDonationHistory {
  _id: string;
  donorId: string;
  donorName?: string;
  requestId?: string;
  hospitalName: string;
  recipientName?: string;
  bloodGroup: BloodGroup;
  donationDate: string;
  units: number;
  status: 'Completed' | 'Scheduled';
  notes?: string;
  createdAt: string;
}

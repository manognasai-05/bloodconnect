import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { IUser, IDonor, IBloodRequest, INotification, IDonationHistory } from '../models/types.js';

interface DatabaseData {
  users: IUser[];
  donors: IDonor[];
  bloodRequests: IBloodRequest[];
  notifications: INotification[];
  donationHistories: IDonationHistory[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'bloodconnect_db.json');

// Memory store
let memoryDb: DatabaseData = {
  users: [],
  donors: [],
  bloodRequests: [],
  notifications: [],
  donationHistories: [],
};

let isMongoConnected = false;

// Generate MongoDB-like 24-char hex ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + random).substring(0, 24);
}

// Persist data file
function saveFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

// Load data file
function loadFile(): boolean {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.users && parsed.donors) {
        memoryDb = parsed;
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to read database file, starting clean:', err);
  }
  return false;
}

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB server at', mongoUri.replace(/\/\/.*@/, '//***@'));
    } catch (err: any) {
      console.warn('MongoDB connection failed or timed out:', err?.message || err);
      console.log('Falling back to built-in resilient document database store.');
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI set; using resilient embedded document database store.');
  }

  // Load from disk if exists, else seed initial data
  const hasLoaded = loadFile();
  if (!hasLoaded || memoryDb.users.length === 0) {
    await seedInitialData();
  }
}

export async function seedInitialData() {
  console.log('Seeding initial demonstration data for BloodConnect...');
  
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const donorPassword = await bcrypt.hash('Donor@123', salt);
  const requesterPassword = await bcrypt.hash('Requester@123', salt);

  const adminId = generateObjectId();
  const donor1UserId = generateObjectId();
  const donor2UserId = generateObjectId();
  const donor3UserId = generateObjectId();
  const donor4UserId = generateObjectId();
  const donor5UserId = generateObjectId();
  const donor6UserId = generateObjectId();
  const donor7UserId = generateObjectId();
  const requester1Id = generateObjectId();
  const requester2Id = generateObjectId();

  const users: IUser[] = [
    {
      _id: adminId,
      name: 'System Administrator',
      email: 'admin@bloodconnect.org',
      password: adminPassword,
      phone: '+1 (555) 019-2831',
      role: 'admin',
      city: 'New York',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      _id: donor1UserId,
      name: 'Dr. Marcus Vance',
      email: 'marcus.v@donor.org',
      password: donorPassword,
      phone: '+1 (555) 234-5678',
      role: 'donor',
      city: 'New York',
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      _id: donor2UserId,
      name: 'Sarah Jenkins',
      email: 'sarah.j@donor.org',
      password: donorPassword,
      phone: '+1 (555) 345-6789',
      role: 'donor',
      city: 'Chicago',
      status: 'active',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      _id: donor3UserId,
      name: 'David Miller',
      email: 'david.m@donor.org',
      password: donorPassword,
      phone: '+1 (555) 456-7890',
      role: 'donor',
      city: 'Houston',
      status: 'active',
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    },
    {
      _id: donor4UserId,
      name: 'Elena Rostova',
      email: 'elena.r@donor.org',
      password: donorPassword,
      phone: '+1 (555) 567-8901',
      role: 'donor',
      city: 'Los Angeles',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      _id: donor5UserId,
      name: 'Carlos Gomez',
      email: 'carlos.g@donor.org',
      password: donorPassword,
      phone: '+1 (555) 678-9012',
      role: 'donor',
      city: 'New York',
      status: 'active',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      _id: donor6UserId,
      name: 'Priya Sharma',
      email: 'priya.s@donor.org',
      password: donorPassword,
      phone: '+1 (555) 789-0123',
      role: 'donor',
      city: 'Chicago',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      _id: donor7UserId,
      name: 'Liam O’Connor',
      email: 'liam.o@donor.org',
      password: donorPassword,
      phone: '+1 (555) 890-1234',
      role: 'donor',
      city: 'Phoenix',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      _id: requester1Id,
      name: 'Rachel Green',
      email: 'requester@bloodconnect.org',
      password: requesterPassword,
      phone: '+1 (555) 901-2345',
      role: 'requester',
      city: 'New York',
      status: 'active',
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      _id: requester2Id,
      name: 'Thomas Wayne',
      email: 'thomas.w@requester.org',
      password: requesterPassword,
      phone: '+1 (555) 012-3456',
      role: 'requester',
      city: 'Chicago',
      status: 'active',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ];

  const donor1Id = generateObjectId();
  const donor2Id = generateObjectId();
  const donor3Id = generateObjectId();
  const donor4Id = generateObjectId();
  const donor5Id = generateObjectId();
  const donor6Id = generateObjectId();
  const donor7Id = generateObjectId();

  const donors: IDonor[] = [
    {
      _id: donor1Id,
      userId: donor1UserId,
      name: 'Dr. Marcus Vance',
      email: 'marcus.v@donor.org',
      phone: '+1 (555) 234-5678',
      city: 'New York',
      age: 32,
      bloodGroup: 'O-',
      gender: 'Male',
      availability: 'Available',
      lastDonationDate: new Date(Date.now() - 90 * 86400000).toISOString(),
      verified: true,
      totalDonations: 6,
      bio: 'Regular platelet and red cell voluntary donor. Certified physician passionate about community healthcare.',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      _id: donor2Id,
      userId: donor2UserId,
      name: 'Sarah Jenkins',
      email: 'sarah.j@donor.org',
      phone: '+1 (555) 345-6789',
      city: 'Chicago',
      age: 28,
      bloodGroup: 'A+',
      gender: 'Female',
      availability: 'Available',
      lastDonationDate: new Date(Date.now() - 75 * 86400000).toISOString(),
      verified: true,
      totalDonations: 4,
      bio: 'Committed to responding to pediatric hospital urgent emergencies.',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      _id: donor3Id,
      userId: donor3UserId,
      name: 'David Miller',
      email: 'david.m@donor.org',
      phone: '+1 (555) 456-7890',
      city: 'Houston',
      age: 35,
      bloodGroup: 'B+',
      gender: 'Male',
      availability: 'Available',
      lastDonationDate: new Date(Date.now() - 65 * 86400000).toISOString(),
      verified: true,
      totalDonations: 5,
      bio: 'Marathon runner and registered whole blood donor.',
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    },
    {
      _id: donor4Id,
      userId: donor4UserId,
      name: 'Elena Rostova',
      email: 'elena.r@donor.org',
      phone: '+1 (555) 567-8901',
      city: 'Los Angeles',
      age: 29,
      bloodGroup: 'AB+',
      gender: 'Female',
      availability: 'Available',
      lastDonationDate: new Date(Date.now() - 110 * 86400000).toISOString(),
      verified: true,
      totalDonations: 3,
      bio: 'Universal plasma donor. Always happy to assist local clinics.',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      _id: donor5Id,
      userId: donor5UserId,
      name: 'Carlos Gomez',
      email: 'carlos.g@donor.org',
      phone: '+1 (555) 678-9012',
      city: 'New York',
      age: 41,
      bloodGroup: 'O+',
      gender: 'Male',
      availability: 'Recently Donated',
      lastDonationDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      verified: true,
      totalDonations: 8,
      bio: 'Active donor since 2018. In cooldown period for whole blood donation.',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      _id: donor6Id,
      userId: donor6UserId,
      name: 'Priya Sharma',
      email: 'priya.s@donor.org',
      phone: '+1 (555) 789-0123',
      city: 'Chicago',
      age: 26,
      bloodGroup: 'A-',
      gender: 'Female',
      availability: 'Available',
      lastDonationDate: new Date(Date.now() - 85 * 86400000).toISOString(),
      verified: true,
      totalDonations: 2,
      bio: 'Registered rare negative RH blood donor ready for urgent surgical calls.',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      _id: donor7Id,
      userId: donor7UserId,
      name: 'Liam O’Connor',
      email: 'liam.o@donor.org',
      phone: '+1 (555) 890-1234',
      city: 'Phoenix',
      age: 38,
      bloodGroup: 'B-',
      gender: 'Male',
      availability: 'Unavailable',
      lastDonationDate: new Date(Date.now() - 120 * 86400000).toISOString(),
      verified: false,
      totalDonations: 1,
      bio: 'Traveling for business; currently set as temporarily unavailable.',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const req1Id = generateObjectId();
  const req2Id = generateObjectId();
  const req3Id = generateObjectId();
  const req4Id = generateObjectId();

  const bloodRequests: IBloodRequest[] = [
    {
      _id: req1Id,
      requesterId: requester1Id,
      requesterName: 'Rachel Green',
      bloodGroup: 'O-',
      hospitalName: 'Mount Sinai Hospital, Emergency Trauma Wing',
      city: 'New York',
      unitsRequired: 2,
      urgency: 'Emergency',
      contactNumber: '+1 (555) 901-2345',
      reason: 'Urgent whole blood required for emergency motor collision patient undergoing arterial vascular surgery.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      _id: req2Id,
      requesterId: requester2Id,
      requesterName: 'Thomas Wayne',
      bloodGroup: 'A+',
      hospitalName: 'Northwestern Memorial Hospital, Room 412',
      city: 'Chicago',
      unitsRequired: 1,
      urgency: 'Urgent',
      contactNumber: '+1 (555) 012-3456',
      reason: 'Scheduled cardiovascular bypass procedure. Backup unit needed before incision.',
      status: 'Accepted',
      matchedDonorId: donor2Id,
      matchedDonorName: 'Sarah Jenkins',
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      _id: req3Id,
      requesterId: requester1Id,
      requesterName: 'Rachel Green',
      bloodGroup: 'B+',
      hospitalName: 'Houston Methodist Hospital, Hematology Center',
      city: 'Houston',
      unitsRequired: 2,
      urgency: 'Normal',
      contactNumber: '+1 (555) 901-2345',
      reason: 'Routine scheduled transfusion for thalassemia major management.',
      status: 'Fulfilled',
      matchedDonorId: donor3Id,
      matchedDonorName: 'David Miller',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      _id: req4Id,
      requesterId: requester2Id,
      requesterName: 'Thomas Wayne',
      bloodGroup: 'AB+',
      hospitalName: 'UCLA Medical Center, Westwood Pavillion',
      city: 'Los Angeles',
      unitsRequired: 1,
      urgency: 'Normal',
      contactNumber: '+1 (555) 012-3456',
      reason: 'Orthopedic hip replacement preparation.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const donationHistories: IDonationHistory[] = [
    {
      _id: generateObjectId(),
      donorId: donor3Id,
      donorName: 'David Miller',
      requestId: req3Id,
      hospitalName: 'Houston Methodist Hospital',
      recipientName: 'Rachel Green',
      bloodGroup: 'B+',
      donationDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      units: 2,
      status: 'Completed',
      notes: 'Successfully collected 2 units packed red blood cells. Donor vitals nominal.',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      _id: generateObjectId(),
      donorId: donor1Id,
      donorName: 'Dr. Marcus Vance',
      hospitalName: 'New York Presbyterian Hospital',
      recipientName: 'Trauma Unit',
      bloodGroup: 'O-',
      donationDate: new Date(Date.now() - 90 * 86400000).toISOString(),
      units: 1,
      status: 'Completed',
      notes: 'Whole blood donation; screened and stored in blood bank.',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      _id: generateObjectId(),
      donorId: donor2Id,
      donorName: 'Sarah Jenkins',
      requestId: req2Id,
      hospitalName: 'Northwestern Memorial Hospital',
      recipientName: 'Thomas Wayne',
      bloodGroup: 'A+',
      donationDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      units: 1,
      status: 'Scheduled',
      notes: 'Appointment confirmed with hospital blood intake desk.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  const notifications: INotification[] = [
    {
      _id: generateObjectId(),
      userId: donor1UserId,
      message: '🚨 Emergency blood request: 2 units O- required at Mount Sinai Hospital, New York.',
      type: 'request',
      isRead: false,
      link: '/requests',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      _id: generateObjectId(),
      userId: requester2Id,
      message: 'Sarah Jenkins has accepted your blood request #req-2 at Northwestern Memorial Hospital!',
      type: 'status_change',
      isRead: false,
      link: '/requests',
      createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    },
    {
      _id: generateObjectId(),
      userId: donor2UserId,
      message: 'Your donor profile has been officially verified by the BloodConnect Medical Admin.',
      type: 'verification',
      isRead: true,
      link: '/profile',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      _id: generateObjectId(),
      userId: requester1Id,
      message: 'Your blood request at Houston Methodist Hospital has been marked Fulfilled. Thank you!',
      type: 'status_change',
      isRead: true,
      link: '/requests',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];

  memoryDb = {
    users,
    donors,
    bloodRequests,
    notifications,
    donationHistories,
  };

  saveFile();
  console.log(`Database seeded with ${users.length} users, ${donors.length} donors, ${bloodRequests.length} requests, ${notifications.length} notifications.`);
}

// Database helper functions
export const db = {
  // Users
  async findUsers(filter: Partial<IUser> = {}): Promise<IUser[]> {
    return memoryDb.users.filter(u => {
      for (const key of Object.keys(filter) as (keyof IUser)[]) {
        if (filter[key] !== undefined && u[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  async findUserById(id: string): Promise<IUser | null> {
    return memoryDb.users.find(u => u._id === id) || null;
  },

  async findUserByEmail(email: string): Promise<IUser | null> {
    return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    const newUser: IUser = {
      ...userData,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    };
    memoryDb.users.push(newUser);
    saveFile();
    return newUser;
  },

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const idx = memoryDb.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    memoryDb.users[idx] = { ...memoryDb.users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveFile();
    return memoryDb.users[idx];
  },

  async deleteUser(id: string): Promise<boolean> {
    const idx = memoryDb.users.findIndex(u => u._id === id);
    if (idx === -1) return false;
    memoryDb.users.splice(idx, 1);
    // Also remove matching donor record if any
    memoryDb.donors = memoryDb.donors.filter(d => d.userId !== id);
    saveFile();
    return true;
  },

  // Donors
  async findDonors(filter: { bloodGroup?: string; city?: string; availability?: string; search?: string } = {}): Promise<IDonor[]> {
    return memoryDb.donors.filter(d => {
      if (filter.bloodGroup && filter.bloodGroup !== 'All' && d.bloodGroup !== filter.bloodGroup) return false;
      if (filter.city && filter.city !== 'All' && d.city.toLowerCase() !== filter.city.toLowerCase()) return false;
      if (filter.availability && filter.availability !== 'All' && d.availability !== filter.availability) return false;
      if (filter.search) {
        const s = filter.search.toLowerCase();
        const matches = d.name.toLowerCase().includes(s) || d.city.toLowerCase().includes(s) || d.bloodGroup.toLowerCase().includes(s);
        if (!matches) return false;
      }
      return true;
    });
  },

  async findDonorById(id: string): Promise<IDonor | null> {
    return memoryDb.donors.find(d => d._id === id) || null;
  },

  async findDonorByUserId(userId: string): Promise<IDonor | null> {
    return memoryDb.donors.find(d => d.userId === userId) || null;
  },

  async createDonor(donorData: Omit<IDonor, '_id' | 'createdAt'>): Promise<IDonor> {
    const newDonor: IDonor = {
      ...donorData,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    };
    memoryDb.donors.push(newDonor);
    saveFile();
    return newDonor;
  },

  async updateDonor(id: string, updates: Partial<IDonor>): Promise<IDonor | null> {
    const idx = memoryDb.donors.findIndex(d => d._id === id);
    if (idx === -1) return null;
    memoryDb.donors[idx] = { ...memoryDb.donors[idx], ...updates, updatedAt: new Date().toISOString() };
    saveFile();
    return memoryDb.donors[idx];
  },

  async updateDonorByUserId(userId: string, updates: Partial<IDonor>): Promise<IDonor | null> {
    const idx = memoryDb.donors.findIndex(d => d.userId === userId);
    if (idx === -1) return null;
    memoryDb.donors[idx] = { ...memoryDb.donors[idx], ...updates, updatedAt: new Date().toISOString() };
    saveFile();
    return memoryDb.donors[idx];
  },

  // Blood Requests
  async findRequests(filter: { requesterId?: string; status?: string; urgency?: string; city?: string; bloodGroup?: string } = {}): Promise<IBloodRequest[]> {
    return memoryDb.bloodRequests
      .filter(r => {
        if (filter.requesterId && r.requesterId !== filter.requesterId) return false;
        if (filter.status && filter.status !== 'All' && r.status !== filter.status) return false;
        if (filter.urgency && filter.urgency !== 'All' && r.urgency !== filter.urgency) return false;
        if (filter.city && filter.city !== 'All' && r.city.toLowerCase() !== filter.city.toLowerCase()) return false;
        if (filter.bloodGroup && filter.bloodGroup !== 'All' && r.bloodGroup !== filter.bloodGroup) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findRequestById(id: string): Promise<IBloodRequest | null> {
    return memoryDb.bloodRequests.find(r => r._id === id) || null;
  },

  async createRequest(reqData: Omit<IBloodRequest, '_id' | 'createdAt'>): Promise<IBloodRequest> {
    const newReq: IBloodRequest = {
      ...reqData,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    };
    memoryDb.bloodRequests.unshift(newReq);
    saveFile();
    return newReq;
  },

  async updateRequest(id: string, updates: Partial<IBloodRequest>): Promise<IBloodRequest | null> {
    const idx = memoryDb.bloodRequests.findIndex(r => r._id === id);
    if (idx === -1) return null;
    memoryDb.bloodRequests[idx] = { ...memoryDb.bloodRequests[idx], ...updates, updatedAt: new Date().toISOString() };
    saveFile();
    return memoryDb.bloodRequests[idx];
  },

  // Notifications
  async findNotificationsByUserId(userId: string): Promise<INotification[]> {
    return memoryDb.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createNotification(notifData: Omit<INotification, '_id' | 'createdAt'>): Promise<INotification> {
    const notif: INotification = {
      ...notifData,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    };
    memoryDb.notifications.unshift(notif);
    saveFile();
    return notif;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const notif = memoryDb.notifications.find(n => n._id === id);
    if (!notif) return false;
    notif.isRead = true;
    saveFile();
    return true;
  },

  async markAllNotificationsRead(userId: string): Promise<number> {
    let count = 0;
    for (const n of memoryDb.notifications) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    }
    saveFile();
    return count;
  },

  // Donation History
  async findDonationHistories(filter: { donorId?: string } = {}): Promise<IDonationHistory[]> {
    return memoryDb.donationHistories
      .filter(h => {
        if (filter.donorId && h.donorId !== filter.donorId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
  },

  async createDonationHistory(data: Omit<IDonationHistory, '_id' | 'createdAt'>): Promise<IDonationHistory> {
    const history: IDonationHistory = {
      ...data,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    };
    memoryDb.donationHistories.unshift(history);
    saveFile();
    return history;
  },

  // Analytics & Stats
  async getAnalytics() {
    const totalDonors = memoryDb.donors.length;
    const verifiedDonors = memoryDb.donors.filter(d => d.verified).length;
    const availableDonors = memoryDb.donors.filter(d => d.availability === 'Available').length;
    const totalRequests = memoryDb.bloodRequests.length;
    const pendingRequests = memoryDb.bloodRequests.filter(r => r.status === 'Pending').length;
    const acceptedRequests = memoryDb.bloodRequests.filter(r => r.status === 'Accepted').length;
    const fulfilledRequests = memoryDb.bloodRequests.filter(r => r.status === 'Fulfilled').length;
    const emergencyRequests = memoryDb.bloodRequests.filter(r => r.urgency === 'Emergency' && r.status !== 'Fulfilled').length;
    
    // Total units donated
    const totalUnitsDonated = memoryDb.donationHistories
      .filter(h => h.status === 'Completed')
      .reduce((sum, h) => sum + (h.units || 1), 0);

    // Blood group distribution
    const bloodGroups: Record<string, number> = {
      'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0,
      'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0,
    };
    for (const d of memoryDb.donors) {
      if (bloodGroups[d.bloodGroup] !== undefined) {
        bloodGroups[d.bloodGroup]++;
      }
    }

    return {
      totalDonors,
      verifiedDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      fulfilledRequests,
      emergencyRequests,
      totalUnitsDonated,
      bloodGroups,
      fulfillmentRate: totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
    };
  },
};

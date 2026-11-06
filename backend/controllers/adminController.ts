import { Response } from 'express';
import { db } from '../utils/databaseStore.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const analytics = await db.getAnalytics();
    const recentRequests = await db.findRequests();
    const recentDonations = await db.findDonationHistories();
    const allUsers = await db.findUsers();

    return res.json({
      analytics,
      recentRequests: recentRequests.slice(0, 5),
      recentDonations: recentDonations.slice(0, 5),
      totalUsers: allUsers.length,
    });
  } catch (err: any) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ message: 'Error fetching admin dashboard analytics', error: err.message });
  }
}

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const users = await db.findUsers();
    const donors = await db.findDonors();

    // Attach donor data if available
    const enriched = users.map(user => {
      const { password: _, ...userSafe } = user;
      const donor = donors.find(d => d.userId === user._id);
      return {
        ...userSafe,
        donorProfile: donor || null,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    console.error('getUsers error:', err);
    return res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
}

export async function verifyDonor(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { verified = true } = req.body;

    const donor = await db.findDonorById(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const updated = await db.updateDonor(id, { verified: Boolean(verified) });

    // Send notification to donor
    await db.createNotification({
      userId: donor.userId,
      message: verified 
        ? '🎉 Congratulations! Your donor profile has been officially verified by the BloodConnect Medical Admin.' 
        : 'Your donor profile verification status has been updated by an administrator.',
      type: 'verification',
      isRead: false,
      link: '/profile',
    });

    return res.json({
      message: `Donor verification status set to ${verified ? 'Verified' : 'Unverified'}`,
      donor: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating donor verification', error: err.message });
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active or suspended.' });
    }

    // Do not allow suspending the main admin account
    const user = await db.findUserById(id);
    if (user?.email === 'admin@bloodconnect.org') {
      return res.status(400).json({ message: 'Cannot suspend primary system administrator.' });
    }

    const updated = await db.updateUser(id, { status });
    return res.json({
      message: `User account is now ${status}`,
      user: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating user status', error: err.message });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await db.findUserById(id);
    if (user?.email === 'admin@bloodconnect.org') {
      return res.status(400).json({ message: 'Cannot delete primary system administrator.' });
    }

    const success = await db.deleteUser(id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User and linked records successfully deleted' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
}

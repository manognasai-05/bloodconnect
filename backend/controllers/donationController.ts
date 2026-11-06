import { Response } from 'express';
import { db } from '../utils/databaseStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { BloodGroup } from '../models/types.js';

export async function getDonations(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { donorId } = req.query;

    if (req.user.role === 'donor') {
      const donor = await db.findDonorByUserId(req.user._id);
      if (!donor) return res.json([]);
      const histories = await db.findDonationHistories({ donorId: donor._id });
      return res.json(histories);
    } else if (req.user.role === 'admin') {
      const histories = await db.findDonationHistories(donorId ? { donorId: String(donorId) } : {});
      return res.json(histories);
    } else {
      // Requesters can see public / relevant histories or empty
      const histories = await db.findDonationHistories();
      return res.json(histories);
    }
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching donation history', error: err.message });
  }
}

export async function createDonationRecord(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { donorId, hospitalName, recipientName, bloodGroup, donationDate, units, notes } = req.body;

    if (!hospitalName || !bloodGroup) {
      return res.status(400).json({ message: 'Hospital name and blood group are required' });
    }

    let targetDonorId = donorId;
    let donorName = '';

    if (req.user.role === 'donor') {
      const myDonor = await db.findDonorByUserId(req.user._id);
      if (!myDonor) return res.status(404).json({ message: 'Donor profile not found' });
      targetDonorId = myDonor._id;
      donorName = myDonor.name;
    } else if (targetDonorId) {
      const d = await db.findDonorById(targetDonorId);
      if (d) donorName = d.name;
    }

    const record = await db.createDonationHistory({
      donorId: targetDonorId,
      donorName: donorName || req.user.name,
      hospitalName: hospitalName.trim(),
      recipientName: recipientName ? recipientName.trim() : undefined,
      bloodGroup: bloodGroup as BloodGroup,
      donationDate: donationDate || new Date().toISOString(),
      units: Number(units) || 1,
      status: 'Completed',
      notes: notes ? notes.trim() : '',
    });

    // Update donor count and availability
    if (targetDonorId) {
      const d = await db.findDonorById(targetDonorId);
      if (d) {
        await db.updateDonor(targetDonorId, {
          totalDonations: (d.totalDonations || 0) + (Number(units) || 1),
          lastDonationDate: donationDate || new Date().toISOString(),
          availability: 'Recently Donated',
        });
      }
    }

    return res.status(201).json({ message: 'Donation history logged successfully', record });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error recording donation', error: err.message });
  }
}

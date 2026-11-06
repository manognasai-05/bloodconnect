import { Request, Response } from 'express';
import { db } from '../utils/databaseStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { BloodGroup, DonorAvailability } from '../models/types.js';

// Blood compatibility mapping (Red Blood Cells compatibility)
// Donor blood group -> list of recipient blood groups that can safely receive it
export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal plasma donor / universal red cell recipient
};

// Recipient blood group -> list of donor blood groups they can receive from
export const CAN_RECEIVE_FROM: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
};

export async function getDonors(req: Request, res: Response) {
  try {
    const { bloodGroup, city, availability, search, recipientBloodGroup } = req.query;

    const donors = await db.findDonors({
      bloodGroup: bloodGroup ? String(bloodGroup) : undefined,
      city: city ? String(city) : undefined,
      availability: availability ? String(availability) : undefined,
      search: search ? String(search) : undefined,
    });

    // Annotate with compatibility information if recipientBloodGroup is supplied
    const results = donors.map(donor => {
      let isCompatible: boolean | null = null;
      let compatibilityNote = '';

      if (recipientBloodGroup && CAN_RECEIVE_FROM[recipientBloodGroup as BloodGroup]) {
        const allowedDonors = CAN_RECEIVE_FROM[recipientBloodGroup as BloodGroup];
        isCompatible = allowedDonors.includes(donor.bloodGroup);
        compatibilityNote = isCompatible
          ? `Compatible: ${donor.bloodGroup} red cells can be received by ${recipientBloodGroup} patients (subject to clinical crossmatching).`
          : `Incompatible: ${recipientBloodGroup} recipients cannot receive red cells from ${donor.bloodGroup} donors.`;
      }

      return {
        ...donor,
        isCompatible,
        compatibilityNote,
      };
    });

    return res.json(results);
  } catch (err: any) {
    console.error('getDonors error:', err);
    return res.status(500).json({ message: 'Error fetching donors', error: err.message });
  }
}

export async function getDonorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const donor = await db.findDonorById(id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    return res.json(donor);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error retrieving donor', error: err.message });
  }
}

export async function saveProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { age, bloodGroup, gender, city, bio, phone, lastDonationDate, availability } = req.body;

    let donor = await db.findDonorByUserId(req.user._id);

    if (donor) {
      // Update existing donor
      const updated = await db.updateDonor(donor._id, {
        ...(age && { age: Number(age) }),
        ...(bloodGroup && { bloodGroup: bloodGroup as BloodGroup }),
        ...(gender && { gender }),
        ...(city && { city: city.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(lastDonationDate !== undefined && { lastDonationDate }),
        ...(availability && { availability: availability as DonorAvailability }),
      });

      // Also update user record city/phone if modified
      if (city || phone) {
        await db.updateUser(req.user._id, {
          ...(city && { city: city.trim() }),
          ...(phone && { phone: phone.trim() }),
        });
      }

      return res.json({ message: 'Donor profile updated successfully', donor: updated });
    } else {
      // Create donor profile
      const newDonor = await db.createDonor({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: phone || req.user.phone,
        city: city || req.user.city,
        age: Number(age) || 25,
        bloodGroup: (bloodGroup as BloodGroup) || 'O+',
        gender: gender || 'Prefer not to say',
        availability: availability || 'Available',
        lastDonationDate: lastDonationDate || undefined,
        verified: false,
        totalDonations: 0,
        bio: bio || '',
      });

      return res.status(201).json({ message: 'Donor profile created successfully', donor: newDonor });
    }
  } catch (err: any) {
    console.error('saveProfile error:', err);
    return res.status(500).json({ message: 'Error updating donor profile', error: err.message });
  }
}

export async function updateAvailability(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { availability, lastDonationDate } = req.body;
    if (!availability) {
      return res.status(400).json({ message: 'Availability status is required' });
    }

    const donor = await db.findDonorByUserId(req.user._id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found for this account' });
    }

    const updated = await db.updateDonor(donor._id, {
      availability: availability as DonorAvailability,
      ...(lastDonationDate && { lastDonationDate }),
    });

    return res.json({
      message: `Availability updated to ${availability}`,
      donor: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating availability', error: err.message });
  }
}

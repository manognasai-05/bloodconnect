import { Response } from 'express';
import { db } from '../utils/databaseStore.js';
import { AuthRequest } from '../middleware/auth.js';
import { BloodGroup, RequestUrgency, RequestStatus } from '../models/types.js';
import { CAN_RECEIVE_FROM } from './donorController.js';

export async function createRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { bloodGroup, hospitalName, city, unitsRequired, urgency = 'Normal', contactNumber, reason } = req.body;

    if (!bloodGroup || !hospitalName || !city || !unitsRequired || !contactNumber) {
      return res.status(400).json({ message: 'Blood group, hospital name, city, units required, and contact number are required.' });
    }

    const newRequest = await db.createRequest({
      requesterId: req.user._id,
      requesterName: req.user.name,
      bloodGroup: bloodGroup as BloodGroup,
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      unitsRequired: Number(unitsRequired),
      urgency: urgency as RequestUrgency,
      contactNumber: contactNumber.trim(),
      reason: reason ? reason.trim() : '',
      status: 'Pending',
    });

    // Notify compatible donors in the same city or emergency broadcast
    const allDonors = await db.findDonors({ availability: 'Available' });
    const compatibleGroups = CAN_RECEIVE_FROM[bloodGroup as BloodGroup] || [bloodGroup];

    const matchedDonors = allDonors.filter(d => 
      compatibleGroups.includes(d.bloodGroup) && 
      (d.city.toLowerCase() === city.trim().toLowerCase() || urgency === 'Emergency')
    );

    for (const donor of matchedDonors) {
      const urgencyPrefix = urgency === 'Emergency' ? '🚨 EMERGENCY' : urgency === 'Urgent' ? '⚠️ URGENT' : '🩸';
      await db.createNotification({
        userId: donor.userId,
        message: `${urgencyPrefix} Blood Request: ${unitsRequired} unit(s) of ${bloodGroup} needed at ${hospitalName}, ${city}.`,
        type: 'request',
        isRead: false,
        link: `/requests`,
      });
    }

    return res.status(201).json({
      message: 'Blood request submitted successfully!',
      request: newRequest,
      matchedDonorsCount: matchedDonors.length,
    });
  } catch (err: any) {
    console.error('createRequest error:', err);
    return res.status(500).json({ message: 'Error submitting blood request', error: err.message });
  }
}

export async function getRequests(req: AuthRequest, res: Response) {
  try {
    const { requesterId, status, urgency, city, bloodGroup, myRequests } = req.query;

    const filter: any = {};
    if (requesterId) filter.requesterId = String(requesterId);
    if (myRequests === 'true' && req.user) filter.requesterId = req.user._id;
    if (status) filter.status = String(status);
    if (urgency) filter.urgency = String(urgency);
    if (city) filter.city = String(city);
    if (bloodGroup) filter.bloodGroup = String(bloodGroup);

    const requests = await db.findRequests(filter);
    return res.json(requests);
  } catch (err: any) {
    console.error('getRequests error:', err);
    return res.status(500).json({ message: 'Error fetching blood requests', error: err.message });
  }
}

export async function getRequestById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const request = await db.findRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Find smart matched donors
    const compatibleGroups = CAN_RECEIVE_FROM[request.bloodGroup] || [request.bloodGroup];
    const availableDonors = await db.findDonors({ availability: 'Available' });
    const matchedDonors = availableDonors.filter(d => 
      compatibleGroups.includes(d.bloodGroup)
    ).map(d => ({
      ...d,
      isSameCity: d.city.toLowerCase() === request.city.toLowerCase(),
    })).sort((a, b) => (b.isSameCity ? 1 : 0) - (a.isSameCity ? 1 : 0));

    return res.json({
      request,
      matchedDonors,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error retrieving blood request', error: err.message });
  }
}

export async function updateRequestStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, matchedDonorId, matchedDonorName } = req.body;

    const request = await db.findRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Only requester, matched donor, or admin can change status
    const isOwner = request.requesterId === req.user._id;
    const isAdmin = req.user.role === 'admin';
    const isMatchedDonor = request.matchedDonorId && req.user.role === 'donor';

    if (!isOwner && !isAdmin && !isMatchedDonor) {
      return res.status(403).json({ message: 'Not authorized to update this request status' });
    }

    const updates: any = { status: status as RequestStatus };
    if (matchedDonorId) updates.matchedDonorId = matchedDonorId;
    if (matchedDonorName) updates.matchedDonorName = matchedDonorName;

    const updated = await db.updateRequest(id, updates);

    // If fulfilled, log to donation history
    if (status === 'Fulfilled' && (matchedDonorId || request.matchedDonorId)) {
      const donorId = matchedDonorId || request.matchedDonorId;
      const donor = await db.findDonorById(donorId!);
      if (donor) {
        await db.createDonationHistory({
          donorId: donor._id,
          donorName: donor.name,
          requestId: request._id,
          hospitalName: request.hospitalName,
          recipientName: request.requesterName,
          bloodGroup: request.bloodGroup,
          donationDate: new Date().toISOString(),
          units: request.unitsRequired,
          status: 'Completed',
          notes: `Donation fulfilled at ${request.hospitalName}`,
        });

        // Increment donor's total donations count and set lastDonationDate
        await db.updateDonor(donor._id, {
          totalDonations: (donor.totalDonations || 0) + request.unitsRequired,
          lastDonationDate: new Date().toISOString(),
          availability: 'Recently Donated',
        });
      }
    }

    // Notify requester if status changed by someone else
    if (request.requesterId !== req.user._id) {
      await db.createNotification({
        userId: request.requesterId,
        message: `Your request at ${request.hospitalName} (${request.bloodGroup}) status was changed to: ${status}`,
        type: 'status_change',
        isRead: false,
        link: '/requests',
      });
    }

    return res.json({
      message: `Request status updated to ${status}`,
      request: updated,
    });
  } catch (err: any) {
    console.error('updateRequestStatus error:', err);
    return res.status(500).json({ message: 'Error updating request status', error: err.message });
  }
}

export async function respondToRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can accept or respond to requests' });
    }

    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const request = await db.findRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending' && action === 'accept') {
      return res.status(400).json({ message: `This request is already marked as ${request.status}` });
    }

    const donor = await db.findDonorByUserId(req.user._id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile required to accept' });
    }

    if (action === 'accept') {
      const updated = await db.updateRequest(id, {
        status: 'Accepted',
        matchedDonorId: donor._id,
        matchedDonorName: donor.name,
      });

      // Notify requester
      await db.createNotification({
        userId: request.requesterId,
        message: `🤝 Donor ${donor.name} (${donor.bloodGroup}) has accepted your blood request for ${request.hospitalName}!`,
        type: 'status_change',
        isRead: false,
        link: '/requests',
      });

      // Add scheduled donation history item
      await db.createDonationHistory({
        donorId: donor._id,
        donorName: donor.name,
        requestId: request._id,
        hospitalName: request.hospitalName,
        recipientName: request.requesterName,
        bloodGroup: donor.bloodGroup,
        donationDate: new Date().toISOString(),
        units: request.unitsRequired,
        status: 'Scheduled',
        notes: `Donor accepted blood request. Contact: ${donor.phone}`,
      });

      return res.json({
        message: 'You have accepted this blood donation request! The requester has been notified.',
        request: updated,
      });
    } else {
      // Decline: donor acknowledged and declined
      return res.json({ message: 'Request declined.' });
    }
  } catch (err: any) {
    console.error('respondToRequest error:', err);
    return res.status(500).json({ message: 'Error responding to request', error: err.message });
  }
}

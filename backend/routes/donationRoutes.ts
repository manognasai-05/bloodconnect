import { Router } from 'express';
import { getDonations, createDonationRecord } from '../controllers/donationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);
router.get('/', getDonations);
router.post('/', createDonationRecord);

export default router;

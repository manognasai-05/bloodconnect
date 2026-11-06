import { Router } from 'express';
import { getDonors, getDonorById, saveProfile, updateAvailability } from '../controllers/donorController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getDonors);
router.get('/:id', getDonorById);
router.post('/profile', verifyToken, saveProfile);
router.put('/profile', verifyToken, saveProfile);
router.put('/availability', verifyToken, updateAvailability);

export default router;

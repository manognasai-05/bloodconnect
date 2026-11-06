import { Router } from 'express';
import { getDashboardStats, getUsers, verifyDonor, toggleUserStatus, deleteUser } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require authenticated user with role 'admin'
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/donors/:id/verify', verifyDonor);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;

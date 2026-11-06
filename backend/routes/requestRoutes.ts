import { Router } from 'express';
import { createRequest, getRequests, getRequestById, updateRequestStatus, respondToRequest } from '../controllers/requestController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, createRequest);
router.get('/', verifyToken, getRequests);
router.get('/:id', verifyToken, getRequestById);
router.put('/:id/status', verifyToken, updateRequestStatus);
router.post('/:id/respond', verifyToken, respondToRequest);

export default router;

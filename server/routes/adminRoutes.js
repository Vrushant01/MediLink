import express from 'express';
import {
  getStats,
  getUsers,
  approveUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// Apply auth and admin-only role check to all admin routes
router.use(protect);
router.use(allowRoles('admin'));

// Admin statistics and analytics
router.get('/stats', getStats);

// Admin user management routes
router.get('/users', getUsers);
router.patch('/users/:id/approve', validateObjectId, approveUser);
router.delete('/users/:id', validateObjectId, deleteUser);

export default router;

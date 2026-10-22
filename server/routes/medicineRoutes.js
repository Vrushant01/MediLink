import express from 'express';
import { getMedicines, createMedicine } from '../controllers/medicineController.js';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

// Protected for all authenticated users
router.get('/', protect, getMedicines);

// Adding new medicines is restricted to admin and supplier
router.post('/', protect, allowRoles('admin', 'supplier'), createMedicine);

export default router;

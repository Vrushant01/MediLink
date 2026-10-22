import express from 'express';
import {
  getInventory,
  getInventorySummary,
  addInventoryBatch,
  updateInventoryBatch,
  deleteInventoryBatch,
  sellMedicineFefo,
  getInventoryAlerts,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All inventory operations require authentication and store role
router.use(protect);
router.use(allowRoles('store'));

// Specific sub-paths defined before parameterized /:id route
router.get('/summary', getInventorySummary);
router.get('/alerts', getInventoryAlerts);
router.post('/sell', sellMedicineFefo);

// Main collection and CRUD routes
router.get('/', getInventory);
router.post('/', addInventoryBatch);
router.put('/:id', validateObjectId, updateInventoryBatch);
router.delete('/:id', validateObjectId, deleteInventoryBatch);

export default router;

import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getStoreOrderSummary,
  getSupplierOrderSummary,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All order operations require authentication
router.use(protect);

// Specific summary endpoints defined BEFORE /:id to avoid param capture
router.get('/store-summary', allowRoles('store'), getStoreOrderSummary);
router.get('/supplier-summary', allowRoles('supplier'), getSupplierOrderSummary);

// Order creation and listing
router.post('/', allowRoles('store'), createOrder);
router.get('/', getOrders);

// Single order view and supplier status transitions
router.get('/:id', validateObjectId, getOrderById);
router.patch('/:id/status', allowRoles('supplier'), validateObjectId, updateOrderStatus);

export default router;

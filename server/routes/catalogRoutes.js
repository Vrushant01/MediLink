import express from 'express';
import {
  getMyCatalog,
  createCatalogListing,
  updateCatalogListing,
  deleteCatalogListing,
  browseCatalog,
  getApprovedSuppliers,
  compareMedicinePrices,
} from '../controllers/catalogController.js';
import { protect } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All catalog operations require authentication
router.use(protect);

// Store routes for discovery and comparison
router.get('/browse', allowRoles('store'), browseCatalog);
router.get('/suppliers', allowRoles('store'), getApprovedSuppliers);
router.get('/compare/:medicineId', allowRoles('store'), validateObjectId, compareMedicinePrices);

// Supplier routes for inventory and catalog management
router.get('/mine', allowRoles('supplier'), getMyCatalog);
router.post('/', allowRoles('supplier'), createCatalogListing);
router.put('/:id', allowRoles('supplier'), validateObjectId, updateCatalogListing);
router.delete('/:id', allowRoles('supplier'), validateObjectId, deleteCatalogListing);

export default router;

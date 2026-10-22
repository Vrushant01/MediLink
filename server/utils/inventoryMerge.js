import Inventory from '../models/Inventory.js';
import { getDaysLeft } from './expiry.js';

// Adds a batch to a store's inventory or merges quantity if the batch already exists
export const addOrMergeStoreBatch = async ({
  storeId,
  medicineId,
  batchNo,
  quantity,
  expiryDate,
  purchasePrice,
  mrp,
  reorderLevel,
  rack,
}) => {
  const numQty = Number(quantity);
  const cleanBatchNo = batchNo.trim();

  // Check if an existing batch exists for this store, medicine, and batch number
  let existingBatch = await Inventory.findOne({
    store: storeId,
    medicine: medicineId,
    batchNo: cleanBatchNo,
  });

  if (existingBatch) {
    // Merge quantity into existing batch
    existingBatch.quantity += numQty;
    if (purchasePrice !== undefined) existingBatch.purchasePrice = Number(purchasePrice);
    if (mrp !== undefined) existingBatch.mrp = Number(mrp);
    if (reorderLevel !== undefined) existingBatch.reorderLevel = Number(reorderLevel);
    if (rack !== undefined) existingBatch.rack = rack.trim();
    if (expiryDate) existingBatch.expiryDate = new Date(expiryDate);

    await existingBatch.save();
    return { batch: existingBatch, isNewBatch: false };
  }

  // Look for any existing batch of the same medicine to inherit its reorderLevel
  let resolvedReorderLevel = reorderLevel !== undefined ? Number(reorderLevel) : undefined;
  if (resolvedReorderLevel === undefined) {
    const anyBatch = await Inventory.findOne({ store: storeId, medicine: medicineId });
    resolvedReorderLevel = anyBatch?.reorderLevel || 20;
  }

  // Calculate default MRP (25% markup on purchase price) if not provided
  const resolvedPurchase = purchasePrice !== undefined ? Number(purchasePrice) : undefined;
  let resolvedMrp = mrp !== undefined ? Number(mrp) : undefined;
  if (resolvedMrp === undefined && resolvedPurchase !== undefined) {
    resolvedMrp = Math.round(resolvedPurchase * 1.25 * 100) / 100;
  }

  // Create new inventory batch
  const newBatch = await Inventory.create({
    store: storeId,
    medicine: medicineId,
    batchNo: cleanBatchNo,
    quantity: numQty,
    expiryDate: new Date(expiryDate),
    purchasePrice: resolvedPurchase,
    mrp: resolvedMrp,
    reorderLevel: resolvedReorderLevel,
    rack: rack ? rack.trim() : 'Unassigned',
  });

  return { batch: newBatch, isNewBatch: true };
};

/**
 * FEFO (First Expiry, First Out) Inventory Algorithm:
 * Sells medicine batches with the earliest expiry dates first to prevent wastage.
 * If an order quantity spans multiple batches, stock is drawn sequentially
 * until fulfilled, ensuring expired batches are never sold.
 */

import Inventory from '../models/Inventory.js';

// Deducts requested quantity from non-expired batches sorted by earliest expiry date
export const deductStockFefo = async (storeId, medicineId, quantityToSell) => {
  if (!quantityToSell || quantityToSell <= 0) {
    throw new Error('Quantity to sell must be greater than zero');
  }

  // Calculate start of today for expiry boundary
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all active, non-expired batches for this store and medicine, sorted earliest expiry first
  const batches = await Inventory.find({
    store: storeId,
    medicine: medicineId,
    quantity: { $gt: 0 },
    expiryDate: { $gte: today },
  }).sort({ expiryDate: 1 });

  // Calculate total non-expired stock available
  const totalAvailable = batches.reduce((sum, batch) => sum + batch.quantity, 0);

  if (totalAvailable < quantityToSell) {
    throw new Error(
      `Insufficient non-expired stock. Requested ${quantityToSell} units, but only ${totalAvailable} units available.`
    );
  }

  let remainingToDeduct = quantityToSell;
  const deductions = [];

  // Deduct sequentially from the earliest expiring batches
  for (const batch of batches) {
    if (remainingToDeduct === 0) break;

    const deductFromThisBatch = Math.min(batch.quantity, remainingToDeduct);
    batch.quantity -= deductFromThisBatch;
    remainingToDeduct -= deductFromThisBatch;

    await batch.save();

    deductions.push({
      batchNo: batch.batchNo,
      taken: deductFromThisBatch,
      remainingInBatch: batch.quantity,
      expiryDate: batch.expiryDate,
    });
  }

  return deductions;
};

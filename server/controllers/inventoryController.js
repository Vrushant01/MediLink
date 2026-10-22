import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDaysLeft, getExpiryStatus, CRITICAL_DAYS, WARNING_DAYS } from '../utils/expiry.js';
import { deductStockFefo } from '../utils/fefo.js';
import { addOrMergeStoreBatch } from '../utils/inventoryMerge.js';

// Helper to map and compute daysLeft, expiryStatus, and lowStock flags for inventory batches
const enrichBatch = (batch, totalStockMap) => {
  const daysLeft = getDaysLeft(batch.expiryDate);
  const expiryStatus = getExpiryStatus(batch.expiryDate);
  const medicineId = batch.medicine?._id ? batch.medicine._id.toString() : batch.medicine.toString();
  const totalStock = totalStockMap ? (totalStockMap.get(medicineId) || 0) : batch.quantity;
  const isLowStock = totalStock < (batch.reorderLevel || 20);

  const raw = batch.toObject ? batch.toObject() : batch;

  return {
    ...raw,
    daysLeft,
    expiryStatus,
    totalMedicineStock: totalStock,
    isLowStock,
  };
};

// Builds a map of { medicineId => totalNonExpiredQuantity } for the given store
const getNonExpiredStockMap = async (storeId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockAggregation = await Inventory.aggregate([
    {
      $match: {
        store: storeId,
        expiryDate: { $gte: today },
      },
    },
    {
      $group: {
        _id: '$medicine',
        totalQuantity: { $sum: '$quantity' },
      },
    },
  ]);

  const stockMap = new Map();
  stockAggregation.forEach((item) => {
    stockMap.set(item._id.toString(), item.totalQuantity);
  });

  return stockMap;
};

// Get store inventory with search, category, status, lowStock filtering, and pagination
export const getInventory = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    lowStock,
    sort = 'expiry',
    page = 1,
    limit = 20,
  } = req.query;

  // Build medicine filter if search or category is specified
  const medicineFilter = {};
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    medicineFilter.$or = [{ name: searchRegex }, { genericName: searchRegex }];
  }
  if (category && category.trim()) {
    medicineFilter.category = new RegExp(`^${category.trim()}$`, 'i');
  }

  // Pre-find matching medicine IDs if medicine filter is active
  let matchingMedicineIds = null;
  if (Object.keys(medicineFilter).length > 0) {
    const matchingMedicines = await Medicine.find(medicineFilter).select('_id');
    matchingMedicineIds = matchingMedicines.map((m) => m._id);
  }

  // Inventory query strictly scoped to logged-in store
  const inventoryQuery = { store: req.user._id };
  if (matchingMedicineIds !== null) {
    inventoryQuery.medicine = { $in: matchingMedicineIds };
  }

  // Fetch store batches populated with medicine details
  const batches = await Inventory.find(inventoryQuery)
    .populate('medicine')
    .sort({ expiryDate: 1 });

  // Get total non-expired stock map for computing isLowStock accurately
  const stockMap = await getNonExpiredStockMap(req.user._id);

  // Compute status and low stock flags for each batch
  let enrichedItems = batches.map((batch) => enrichBatch(batch, stockMap));

  // Filter by expiry status if requested (expired, critical, warning, safe)
  if (status && ['expired', 'critical', 'warning', 'safe'].includes(status)) {
    enrichedItems = enrichedItems.filter((item) => item.expiryStatus === status);
  }

  // Filter by low stock if requested
  if (lowStock === 'true' || lowStock === true) {
    enrichedItems = enrichedItems.filter((item) => item.isLowStock === true);
  }

  // Sort items according to sort parameter
  if (sort === 'name') {
    enrichedItems.sort((a, b) =>
      (a.medicine?.name || '').localeCompare(b.medicine?.name || '')
    );
  } else if (sort === 'quantity') {
    enrichedItems.sort((a, b) => a.quantity - b.quantity);
  } else {
    // Default to expiry date ascending
    enrichedItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }

  // Pagination calculation
  const total = enrichedItems.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const pages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = enrichedItems.slice(startIndex, startIndex + limitNum);

  res.status(200).json({
    items: paginatedItems,
    total,
    page: pageNum,
    pages,
  });
});

// Get inventory dashboard metrics for the logged-in medical store
export const getInventorySummary = asyncHandler(async (req, res) => {
  const storeId = req.user._id;

  const batches = await Inventory.find({ store: storeId });
  const stockMap = await getNonExpiredStockMap(storeId);

  const distinctMedicines = new Set(batches.map((b) => b.medicine.toString())).size;
  const totalBatches = batches.length;
  const totalUnits = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const stockValue = batches.reduce(
    (sum, b) => sum + (b.quantity || 0) * (b.purchasePrice || 0),
    0
  );

  let expiredCount = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let valueAtRisk = 0;

  batches.forEach((b) => {
    const days = getDaysLeft(b.expiryDate);
    const itemValue = (b.quantity || 0) * (b.purchasePrice || 0);

    if (days < 0) {
      expiredCount += 1;
      valueAtRisk += itemValue;
    } else if (days <= CRITICAL_DAYS) {
      criticalCount += 1;
      valueAtRisk += itemValue;
    } else if (days <= WARNING_DAYS) {
      warningCount += 1;
      valueAtRisk += itemValue;
    }
  });

  // Calculate distinct medicines whose total active stock is below reorderLevel
  const medicineReorderMap = new Map();
  batches.forEach((b) => {
    const medId = b.medicine.toString();
    if (!medicineReorderMap.has(medId)) {
      medicineReorderMap.set(medId, b.reorderLevel || 20);
    }
  });

  let lowStockCount = 0;
  medicineReorderMap.forEach((reorderLevel, medId) => {
    const activeStock = stockMap.get(medId) || 0;
    if (activeStock < reorderLevel) {
      lowStockCount += 1;
    }
  });

  res.status(200).json({
    totalMedicines: distinctMedicines,
    totalBatches,
    totalUnits,
    stockValue: Math.round(stockValue * 100) / 100,
    expiredCount,
    criticalCount,
    warningCount,
    lowStockCount,
    valueAtRisk: Math.round(valueAtRisk * 100) / 100,
  });
});

// Add a new batch to inventory, or merge quantity if same batch already exists
export const addInventoryBatch = asyncHandler(async (req, res) => {
  const {
    medicine,
    medicineId,
    batchNo,
    quantity,
    expiryDate,
    purchasePrice,
    mrp,
    reorderLevel,
    rack,
  } = req.body;

  const targetMedicineId = medicine || medicineId;

  // Manual validation of required fields
  if (!targetMedicineId || !batchNo || quantity === undefined || !expiryDate) {
    return res.status(400).json({
      message: 'Please provide medicine, batchNo, quantity, and expiryDate',
    });
  }

  const numQty = Number(quantity);
  if (isNaN(numQty) || numQty < 0) {
    return res.status(400).json({
      message: 'Quantity cannot be negative',
    });
  }

  const numPurchase = purchasePrice !== undefined ? Number(purchasePrice) : undefined;
  const numMrp = mrp !== undefined ? Number(mrp) : undefined;

  if (numPurchase !== undefined && numMrp !== undefined && numMrp < numPurchase) {
    return res.status(400).json({
      message: 'MRP cannot be lower than purchase price',
    });
  }

  // Check if medicine exists in master catalog
  const medExists = await Medicine.findById(targetMedicineId);
  if (!medExists) {
    return res.status(404).json({ message: 'Medicine not found in master database' });
  }

  const daysLeft = getDaysLeft(expiryDate);
  const isExpiredWarning = daysLeft < 0;

  const { batch, isNewBatch } = await addOrMergeStoreBatch({
    storeId: req.user._id,
    medicineId: targetMedicineId,
    batchNo,
    quantity: numQty,
    expiryDate,
    purchasePrice: numPurchase,
    mrp: numMrp,
    reorderLevel,
    rack,
  });

  const populated = await batch.populate('medicine');

  res.status(isNewBatch ? 201 : 200).json({
    message: isNewBatch
      ? 'Inventory batch added successfully'
      : 'Batch already exists. Quantity merged successfully.',
    isExpiredWarning,
    warning: isExpiredWarning ? 'Notice: This batch has already passed its expiry date.' : undefined,
    batch: enrichBatch(populated),
  });
});

// Edit an existing inventory batch belonging to the logged-in store
export const updateInventoryBatch = asyncHandler(async (req, res) => {
  const batch = await Inventory.findOne({
    _id: req.params.id,
    store: req.user._id,
  });

  if (!batch) {
    return res.status(404).json({ message: 'Inventory batch not found' });
  }

  const { quantity, expiryDate, purchasePrice, mrp, reorderLevel, rack, batchNo } = req.body;

  if (quantity !== undefined) {
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }
    batch.quantity = numQty;
  }

  if (purchasePrice !== undefined) batch.purchasePrice = Number(purchasePrice);
  if (mrp !== undefined) batch.mrp = Number(mrp);

  if (batch.purchasePrice !== undefined && batch.mrp !== undefined && batch.mrp < batch.purchasePrice) {
    return res.status(400).json({ message: 'MRP cannot be lower than purchase price' });
  }

  if (expiryDate) batch.expiryDate = new Date(expiryDate);
  if (reorderLevel !== undefined) batch.reorderLevel = Number(reorderLevel);
  if (rack !== undefined) batch.rack = rack.trim();
  if (batchNo !== undefined && batchNo.trim()) batch.batchNo = batchNo.trim();

  await batch.save();
  const populated = await batch.populate('medicine');

  res.status(200).json({
    message: 'Batch updated successfully',
    batch: enrichBatch(populated),
  });
});

// Delete an inventory batch belonging to the logged-in store
export const deleteInventoryBatch = asyncHandler(async (req, res) => {
  const batch = await Inventory.findOne({
    _id: req.params.id,
    store: req.user._id,
  });

  if (!batch) {
    return res.status(404).json({ message: 'Inventory batch not found' });
  }

  await batch.deleteOne();

  res.status(200).json({ message: 'Inventory batch removed successfully' });
});

// Sell medicine using FEFO algorithm, and trigger low-stock alert if stock drops below reorder level
export const sellMedicineFefo = asyncHandler(async (req, res) => {
  const { medicineId, quantity } = req.body;

  if (!medicineId || !quantity) {
    return res.status(400).json({
      message: 'Please provide both medicineId and quantity',
    });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({
      message: 'Quantity must be a positive number',
    });
  }

  // Deduct stock using the FEFO algorithm (earliest non-expired expiry first)
  const deductions = await deductStockFefo(req.user._id, medicineId, qty);

  // Check remaining total non-expired stock for this medicine in this store
  const stockMap = await getNonExpiredStockMap(req.user._id);
  const remainingStock = stockMap.get(medicineId.toString()) || 0;

  // Retrieve reorder level from any batch of this medicine
  const sampleBatch = await Inventory.findOne({
    store: req.user._id,
    medicine: medicineId,
  });
  const reorderLevel = sampleBatch?.reorderLevel || 20;

  let lowStockAlertTriggered = false;

  // If remaining stock has fallen below reorder level, alert the store
  if (remainingStock < reorderLevel) {
    const med = await Medicine.findById(medicineId);
    const medName = med?.name || 'Medicine';
    const alertMessage = `${medName}: Stock is low (${remainingStock} units remaining). Reorder level is ${reorderLevel}.`;

    // Avoid duplicate unread notification for the same message
    const existingNotif = await Notification.findOne({
      user: req.user._id,
      type: 'lowstock',
      read: false,
      message: alertMessage,
    });

    if (!existingNotif) {
      await Notification.create({
        user: req.user._id,
        message: alertMessage,
        type: 'lowstock',
        read: false,
      });
      lowStockAlertTriggered = true;
    }
  }

  res.status(200).json({
    message: 'Stock deducted successfully via FEFO',
    medicineId,
    requestedQuantity: qty,
    deductions,
    remainingStock,
    reorderLevel,
    lowStockAlertTriggered,
  });
});

// Get actionable inventory alerts: expired, expiring soon (critical + warning), and low stock
export const getInventoryAlerts = asyncHandler(async (req, res) => {
  const storeId = req.user._id;

  const batches = await Inventory.find({ store: storeId })
    .populate('medicine')
    .sort({ expiryDate: 1 });

  const stockMap = await getNonExpiredStockMap(storeId);
  const enrichedBatches = batches.map((b) => enrichBatch(b, stockMap));

  // 1. Expired batches (daysLeft < 0)
  const expired = enrichedBatches.filter((b) => b.daysLeft < 0);

  // 2. Expiring soon: critical (0-30 days) and warning (31-90 days), sorted soonest first
  const expiringSoon = enrichedBatches
    .filter((b) => b.daysLeft >= 0 && b.daysLeft <= WARNING_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // 3. Low stock medicines (grouped by medicine where total active stock < reorderLevel)
  const medicineGroup = new Map();

  batches.forEach((b) => {
    const medId = b.medicine?._id ? b.medicine._id.toString() : b.medicine.toString();
    if (!medicineGroup.has(medId)) {
      medicineGroup.set(medId, {
        medicine: b.medicine,
        reorderLevel: b.reorderLevel || 20,
        rack: b.rack,
        batchNo: b.batchNo,
        soonestDaysLeft: getDaysLeft(b.expiryDate),
      });
    }
  });

  const lowStock = [];
  medicineGroup.forEach((info, medId) => {
    const currentStock = stockMap.get(medId) || 0;
    if (currentStock < info.reorderLevel) {
      const suggestedReorderQty = Math.max(0, info.reorderLevel * 2 - currentStock);
      lowStock.push({
        medicine: info.medicine,
        batchNo: info.batchNo,
        quantity: currentStock,
        reorderLevel: info.reorderLevel,
        suggestedReorderQty,
        daysLeft: info.soonestDaysLeft,
        rack: info.rack,
      });
    }
  });

  res.status(200).json({
    expired,
    expiringSoon,
    lowStock,
  });
});

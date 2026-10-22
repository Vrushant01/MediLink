import Catalog from '../models/Catalog.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDaysLeft, getExpiryStatus } from '../utils/expiry.js';

// Helper to enrich a catalog listing with computed daysLeft and expiryStatus
const enrichCatalogItem = (item) => {
  const daysLeft = item.expiryDate ? getDaysLeft(item.expiryDate) : null;
  const expiryStatus = item.expiryDate ? getExpiryStatus(item.expiryDate) : 'safe';
  const raw = item.toObject ? item.toObject() : item;

  return {
    ...raw,
    daysLeft,
    expiryStatus,
  };
};

// Returns the authenticated supplier's own catalog listings
export const getMyCatalog = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  let medicineIds = null;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    const matchedMeds = await Medicine.find({
      $or: [{ name: regex }, { genericName: regex }],
    }).select('_id');
    medicineIds = matchedMeds.map((m) => m._id);
  }

  const query = { supplier: req.user._id };
  if (medicineIds !== null) {
    query.medicine = { $in: medicineIds };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const total = await Catalog.countDocuments(query);
  const items = await Catalog.find(query)
    .populate('medicine')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const enrichedItems = items.map(enrichCatalogItem);

  res.status(200).json({
    items: enrichedItems,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

// Add a new medicine listing to the supplier's catalog
export const createCatalogListing = asyncHandler(async (req, res) => {
  const { medicine, price, stock, minOrderQty = 1, batchNo, expiryDate } = req.body;

  if (!medicine || price === undefined || stock === undefined) {
    return res.status(400).json({
      message: 'Please provide medicine, price, and stock',
    });
  }

  const numPrice = Number(price);
  const numStock = Number(stock);
  const numMoq = Number(minOrderQty);

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ message: 'Price must be greater than zero' });
  }

  if (isNaN(numStock) || numStock < 0) {
    return res.status(400).json({ message: 'Stock cannot be negative' });
  }

  if (isNaN(numMoq) || numMoq < 1) {
    return res.status(400).json({ message: 'Minimum order quantity must be at least 1' });
  }

  // Check if medicine exists
  const medExists = await Medicine.findById(medicine);
  if (!medExists) {
    return res.status(404).json({ message: 'Medicine not found in master catalog' });
  }

  // Prevent duplicate listing for the same medicine by the same supplier
  const existingListing = await Catalog.findOne({
    supplier: req.user._id,
    medicine,
  });

  if (existingListing) {
    return res.status(400).json({
      message: 'Already in your catalog, edit it instead',
    });
  }

  const listing = await Catalog.create({
    supplier: req.user._id,
    medicine,
    price: numPrice,
    stock: numStock,
    minOrderQty: numMoq,
    batchNo: batchNo ? batchNo.trim() : undefined,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
  });

  const populated = await listing.populate('medicine');

  res.status(201).json({
    message: 'Catalog listing created successfully',
    listing: enrichCatalogItem(populated),
  });
});

// Edit an existing catalog listing belonging to the authenticated supplier
export const updateCatalogListing = asyncHandler(async (req, res) => {
  const listing = await Catalog.findOne({
    _id: req.params.id,
    supplier: req.user._id,
  });

  if (!listing) {
    return res.status(404).json({ message: 'Catalog listing not found' });
  }

  const { price, stock, minOrderQty, batchNo, expiryDate } = req.body;

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'Price must be greater than zero' });
    }
    listing.price = numPrice;
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }
    listing.stock = numStock;
  }

  if (minOrderQty !== undefined) {
    const numMoq = Number(minOrderQty);
    if (isNaN(numMoq) || numMoq < 1) {
      return res.status(400).json({ message: 'Minimum order quantity must be at least 1' });
    }
    listing.minOrderQty = numMoq;
  }

  if (batchNo !== undefined) listing.batchNo = batchNo.trim();
  if (expiryDate) listing.expiryDate = new Date(expiryDate);

  await listing.save();
  const populated = await listing.populate('medicine');

  res.status(200).json({
    message: 'Catalog listing updated successfully',
    listing: enrichCatalogItem(populated),
  });
});

// Delete a catalog listing belonging to the authenticated supplier
export const deleteCatalogListing = asyncHandler(async (req, res) => {
  const listing = await Catalog.findOne({
    _id: req.params.id,
    supplier: req.user._id,
  });

  if (!listing) {
    return res.status(404).json({ message: 'Catalog listing not found' });
  }

  await listing.deleteOne();

  res.status(200).json({ message: 'Catalog listing removed successfully' });
});

// Browse catalog listings across all approved suppliers for medical stores
export const browseCatalog = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    supplierId,
    sort = 'price',
    page = 1,
    limit = 20,
  } = req.query;

  // Find all approved suppliers
  const approvedSuppliers = await User.find({
    role: 'supplier',
    approved: true,
  }).select('_id');
  const approvedSupplierIds = approvedSuppliers.map((s) => s._id);

  // If specific supplier requested, ensure they are approved
  let targetSupplierIds = approvedSupplierIds;
  if (supplierId) {
    targetSupplierIds = approvedSupplierIds.filter(
      (id) => id.toString() === supplierId.toString()
    );
  }

  // Filter medicines by search and category
  const medicineFilter = {};
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    medicineFilter.$or = [{ name: regex }, { genericName: regex }];
  }
  if (category && category.trim()) {
    medicineFilter.category = new RegExp(`^${category.trim()}$`, 'i');
  }

  let matchingMedicineIds = null;
  if (Object.keys(medicineFilter).length > 0) {
    const matchedMeds = await Medicine.find(medicineFilter).select('_id');
    matchingMedicineIds = matchedMeds.map((m) => m._id);
  }

  // Query catalog: approved suppliers, in-stock, and non-expired
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = {
    supplier: { $in: targetSupplierIds },
    stock: { $gt: 0 },
    $or: [{ expiryDate: { $gte: today } }, { expiryDate: null }],
  };

  if (matchingMedicineIds !== null) {
    query.medicine = { $in: matchingMedicineIds };
  }

  const listings = await Catalog.find(query)
    .populate('medicine')
    .populate('supplier', 'businessName city phone name email');

  let enrichedItems = listings.map(enrichCatalogItem);

  // Sort items
  if (sort === 'name') {
    enrichedItems.sort((a, b) =>
      (a.medicine?.name || '').localeCompare(b.medicine?.name || '')
    );
  } else if (sort === 'expiry') {
    enrichedItems.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  } else {
    // Default sort by lowest price
    enrichedItems.sort((a, b) => a.price - b.price);
  }

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

// Returns list of approved suppliers with contact info and number of stocked items
export const getApprovedSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await User.find({
    role: 'supplier',
    approved: true,
  }).select('businessName city phone name');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count active in-stock listings for each supplier
  const supplierList = await Promise.all(
    suppliers.map(async (supplier) => {
      const itemsCount = await Catalog.countDocuments({
        supplier: supplier._id,
        stock: { $gt: 0 },
        $or: [{ expiryDate: { $gte: today } }, { expiryDate: null }],
      });

      return {
        _id: supplier._id,
        businessName: supplier.businessName || supplier.name,
        city: supplier.city,
        phone: supplier.phone,
        itemsCount,
      };
    })
  );

  res.status(200).json(supplierList);
});

// Compare prices for a single medicine across all approved suppliers (sorted lowest price first)
export const compareMedicinePrices = asyncHandler(async (req, res) => {
  const { medicineId } = req.params;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const approvedSuppliers = await User.find({
    role: 'supplier',
    approved: true,
  }).select('_id');
  const approvedIds = approvedSuppliers.map((s) => s._id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const listings = await Catalog.find({
    medicine: medicineId,
    supplier: { $in: approvedIds },
    stock: { $gt: 0 },
    $or: [{ expiryDate: { $gte: today } }, { expiryDate: null }],
  })
    .populate('supplier', 'businessName city phone name')
    .populate('medicine')
    .sort({ price: 1 });

  const enriched = listings.map(enrichCatalogItem);

  res.status(200).json({
    medicine,
    offers: enriched,
  });
});

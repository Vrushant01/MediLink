import Medicine from '../models/Medicine.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get list of medicines with optional search across name and genericName
export const getMedicines = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { genericName: searchRegex },
    ];
  }

  const medicines = await Medicine.find(filter).sort({ name: 1 });
  res.status(200).json(medicines);
});

// Add a new medicine to the master database (admin and supplier only)
export const createMedicine = asyncHandler(async (req, res) => {
  const { name, genericName, category, manufacturer, strength, form } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'Medicine name is required',
    });
  }

  const medicine = await Medicine.create({
    name: name.trim(),
    genericName: genericName ? genericName.trim() : undefined,
    category: category ? category.trim() : undefined,
    manufacturer: manufacturer ? manufacturer.trim() : undefined,
    strength: strength ? strength.trim() : undefined,
    form: form || 'Tablet',
  });

  res.status(201).json(medicine);
});

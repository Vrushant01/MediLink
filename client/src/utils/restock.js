// Algorithmic selection and quantity calculation for the automated restock helper

// Selects the cheapest supplier listing prioritizing batches with >= 180 days (6 months) shelf life
export function selectBestSupplierOffer(offers = []) {
  if (!offers || offers.length === 0) return null;

  // Filter listings with at least 180 days of shelf life remaining
  const healthyShelfLifeOffers = offers.filter((o) => (o.daysLeft ?? 365) >= 180);

  // Pick lowest price among healthy shelf-life batches, or fall back to absolute lowest price
  const candidatePool = healthyShelfLifeOffers.length > 0 ? healthyShelfLifeOffers : offers;

  return [...candidatePool].sort((a, b) => a.price - b.price)[0];
}

// Computes suggested restock order quantity clamped to MOQ and live supplier stock
export function calculateRestockQuantity(suggestedReorderQty = 0, minOrderQty = 1, supplierStock = 0) {
  const targetQty = Math.max(suggestedReorderQty, minOrderQty);
  return Math.min(supplierStock, targetQty);
}

// Builds full restock suggestions for an array of low stock items and their competitor listings
export function buildRestockPlan(lowStockItems = [], compareResults = []) {
  const available = [];
  const unavailable = [];

  lowStockItems.forEach((item, idx) => {
    const medicine = item.medicine;
    const offers = compareResults[idx]?.offers || [];
    const bestOffer = selectBestSupplierOffer(offers);

    if (bestOffer) {
      const quantity = calculateRestockQuantity(
        item.suggestedReorderQty,
        bestOffer.minOrderQty,
        bestOffer.stock
      );

      available.push({
        id: bestOffer._id,
        catalogId: bestOffer._id,
        medicineId: medicine._id,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        supplierId: bestOffer.supplier._id,
        supplierName: bestOffer.supplier.businessName || bestOffer.supplier.name,
        supplierCity: bestOffer.supplier.city,
        price: bestOffer.price,
        quantity,
        minOrderQty: bestOffer.minOrderQty || 1,
        stock: bestOffer.stock,
        expiryDate: bestOffer.expiryDate,
        batchNo: bestOffer.batchNo,
        daysLeft: bestOffer.daysLeft,
        expiryStatus: bestOffer.expiryStatus,
        cost: bestOffer.price * quantity,
        selected: true,
      });
    } else {
      unavailable.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
      });
    }
  });

  return { available, unavailable };
}

import Order from '../models/Order.js';
import Catalog from '../models/Catalog.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDaysLeft } from '../utils/expiry.js';
import { addOrMergeStoreBatch } from '../utils/inventoryMerge.js';

// Helper to generate chronological 6-month buckets for analytics
const getSixMonthBuckets = () => {
  const buckets = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    buckets.push({ month, start, end, amount: 0 });
  }

  return buckets;
};

// Create a new B2B purchase order from a store to a single supplier
export const createOrder = asyncHandler(async (req, res) => {
  const { supplierId, items, note } = req.body;

  if (!supplierId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Please provide a supplierId and at least one item',
    });
  }

  // Validate supplier exists and is approved
  const supplier = await User.findOne({
    _id: supplierId,
    role: 'supplier',
    approved: true,
  });

  if (!supplier) {
    return res.status(400).json({
      message: 'Supplier not found or not approved for B2B trade',
    });
  }

  let totalAmount = 0;
  const orderItems = [];
  const warnings = [];

  // Validate each item against supplier's live catalog
  for (const item of items) {
    const { catalogId, quantity } = item;
    const numQty = Number(quantity);

    if (!catalogId || isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({
        message: 'Invalid catalog item or quantity requested',
      });
    }

    const listing = await Catalog.findOne({
      _id: catalogId,
      supplier: supplierId,
    }).populate('medicine');

    if (!listing) {
      return res.status(400).json({
        message: `Catalog listing ${catalogId} does not exist for this supplier`,
      });
    }

    const medName = listing.medicine?.name || 'Selected medicine';

    if (numQty < (listing.minOrderQty || 1)) {
      return res.status(400).json({
        message: `${medName}: minimum order quantity is ${listing.minOrderQty}`,
      });
    }

    if (numQty > listing.stock) {
      return res.status(400).json({
        message: `${medName}: requested quantity (${numQty}) exceeds available stock (${listing.stock})`,
      });
    }

    // Check shelf life warning if expiry is less than 180 days (6 months) away
    if (listing.expiryDate) {
      const daysLeft = getDaysLeft(listing.expiryDate);
      if (daysLeft < 180) {
        const monthsLeft = Math.max(1, Math.round(daysLeft / 30));
        warnings.push(
          `${medName} from this supplier has only ${monthsLeft} months of shelf life (${daysLeft} days)`
        );
      }
    }

    // Always use verified price from catalog
    const itemTotal = listing.price * numQty;
    totalAmount += itemTotal;

    orderItems.push({
      medicine: listing.medicine._id,
      quantity: numQty,
      price: listing.price,
      batchNo: listing.batchNo,
      expiryDate: listing.expiryDate,
    });
  }

  totalAmount = Math.round(totalAmount * 100) / 100;

  // Create order
  const order = await Order.create({
    store: req.user._id,
    supplier: supplierId,
    items: orderItems,
    totalAmount,
    status: 'placed',
    note: note ? note.trim() : undefined,
  });

  // Notify supplier of incoming order
  const storeName = req.user.businessName || req.user.name;
  await Notification.create({
    user: supplierId,
    message: `New order #${order._id.toString().slice(-6).toUpperCase()} from ${storeName}, ${orderItems.length} items, ₹${totalAmount.toLocaleString('en-IN')}`,
    type: 'order',
    read: false,
  });

  const populated = await order.populate([
    { path: 'supplier', select: 'businessName city phone name' },
    { path: 'items.medicine', select: 'name genericName strength form category' },
  ]);

  res.status(201).json({
    message: 'Order placed successfully',
    order: populated,
    warnings,
  });
});

// Get orders list filtered by role, status, and pagination
export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (req.user.role === 'store') {
    query.store = req.user._id;
  } else if (req.user.role === 'supplier') {
    query.supplier = req.user._id;
  }

  if (status && ['placed', 'accepted', 'dispatched', 'delivered', 'rejected'].includes(status)) {
    query.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('store', 'businessName city phone name')
    .populate('supplier', 'businessName city phone name')
    .populate('items.medicine', 'name genericName strength form category')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    orders,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

// Get detailed view of an order (accessible only to participating store or supplier)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('store', 'businessName city phone name address')
    .populate('supplier', 'businessName city phone name address')
    .populate('items.medicine');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const isStore = order.store._id.equals(req.user._id);
  const isSupplier = order.supplier._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isStore && !isSupplier && !isAdmin) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.status(200).json(order);
});

// Update order status with stock changes and notification alerts (supplier only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide status' });
  }

  const order = await Order.findById(req.params.id).populate('items.medicine');

  // Verify ownership: order must exist and belong to the logged-in supplier
  if (!order || !order.supplier.equals(req.user._id)) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const currentStatus = order.status;
  const newStatus = status.toLowerCase();

  // Validate allowed state transitions
  const validTransitions = {
    placed: ['accepted', 'rejected'],
    accepted: ['dispatched'],
    dispatched: ['delivered'],
    delivered: [],
    rejected: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return res.status(400).json({
      message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${
        validTransitions[currentStatus]?.join(', ') || 'none'
      }`,
    });
  }

  /**
   * STEP-BY-STEP STOCK MANAGEMENT & STATE TRANSITION:
   * 1. If transitioning to "accepted":
   *    - Verify catalog stock is still sufficient for each ordered item.
   *    - If insufficient, abort with 400 and keep status as "placed".
   *    - Deduct ordered quantity from supplier's catalog stock.
   * 2. If transitioning to "rejected":
   *    - Require a rejection reason and record in order note.
   * 3. If transitioning to "dispatched":
   *    - Simply update the order status.
   * 4. If transitioning to "delivered":
   *    - Add stock to the store's inventory, merging into existing batches or creating new batches.
   * 5. Send real-time notification alert to the ordering store.
   */

  if (newStatus === 'accepted') {
    // 1. Check stock for every item
    for (const item of order.items) {
      const listing = await Catalog.findOne({
        supplier: req.user._id,
        medicine: item.medicine._id,
      });

      if (!listing || listing.stock < item.quantity) {
        const medName = item.medicine?.name || 'Medicine';
        return res.status(400).json({
          message: `Cannot accept order: Insufficient stock for ${medName} (available: ${
            listing?.stock || 0
          }, required: ${item.quantity})`,
        });
      }
    }

    // 2. Deduct quantity from supplier catalog
    for (const item of order.items) {
      await Catalog.updateOne(
        { supplier: req.user._id, medicine: item.medicine._id },
        { $inc: { stock: -item.quantity } }
      );
    }
  } else if (newStatus === 'rejected') {
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: 'Please provide a reason for rejecting the order',
      });
    }
    const cleanReason = reason.trim();
    order.note = order.note ? `${order.note} | Rejected: ${cleanReason}` : `Rejected: ${cleanReason}`;
  } else if (newStatus === 'delivered') {
    // Add stock to the store's inventory as batches
    for (const item of order.items) {
      await addOrMergeStoreBatch({
        storeId: order.store,
        medicineId: item.medicine._id,
        batchNo: item.batchNo || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        quantity: item.quantity,
        expiryDate: item.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        purchasePrice: item.price,
        mrp: Math.round(item.price * 1.25 * 100) / 100,
        rack: 'Unassigned',
      });
    }
  }

  // Update order status
  order.status = newStatus;
  await order.save();

  // Create human notification for the store
  const supplierName = req.user.businessName || req.user.name;
  const orderTag = `#${order._id.toString().slice(-6).toUpperCase()}`;

  let storeMessage = '';
  switch (newStatus) {
    case 'accepted':
      storeMessage = `Order ${orderTag} has been accepted by ${supplierName}.`;
      break;
    case 'rejected':
      storeMessage = `Order ${orderTag} was rejected by ${supplierName}. Reason: ${reason.trim()}`;
      break;
    case 'dispatched':
      storeMessage = `Order ${orderTag} has been dispatched by ${supplierName}.`;
      break;
    case 'delivered':
      storeMessage = `Order ${orderTag} has been delivered and added to your inventory.`;
      break;
  }

  await Notification.create({
    user: order.store,
    message: storeMessage,
    type: 'order',
    read: false,
  });

  res.status(200).json({
    message: `Order status updated to ${newStatus}`,
    order,
  });
});

// Dashboard metrics and 6-month spend history for store
export const getStoreOrderSummary = asyncHandler(async (req, res) => {
  const storeId = req.user._id;

  const orders = await Order.find({ store: storeId });

  let ordersPlaced = 0;
  let ordersInTransit = 0;
  let ordersDelivered = 0;
  let totalSpent = 0;

  const spendBuckets = getSixMonthBuckets();

  orders.forEach((order) => {
    if (order.status === 'placed') {
      ordersPlaced++;
    } else if (order.status === 'accepted' || order.status === 'dispatched') {
      ordersInTransit++;
    } else if (order.status === 'delivered') {
      ordersDelivered++;
      totalSpent += order.totalAmount || 0;

      // Map to monthly spend bucket
      const orderDate = new Date(order.createdAt);
      spendBuckets.forEach((bucket) => {
        if (orderDate >= bucket.start && orderDate <= bucket.end) {
          bucket.amount += order.totalAmount || 0;
        }
      });
    }
  });

  const spendByMonth = spendBuckets.map((b) => ({
    month: b.month,
    amount: Math.round(b.amount * 100) / 100,
  }));

  res.status(200).json({
    ordersPlaced,
    ordersInTransit,
    ordersDelivered,
    totalSpent: Math.round(totalSpent * 100) / 100,
    spendByMonth,
  });
});

// Dashboard metrics, 6-month revenue, top stores, and low catalog alerts for supplier
export const getSupplierOrderSummary = asyncHandler(async (req, res) => {
  const supplierId = req.user._id;

  const orders = await Order.find({ supplier: supplierId }).populate(
    'store',
    'businessName city'
  );

  let newOrders = 0;
  let inProgress = 0;
  let delivered = 0;
  let totalRevenue = 0;

  const revenueBuckets = getSixMonthBuckets();
  const storeSpendMap = new Map();

  orders.forEach((order) => {
    if (order.status === 'placed') {
      newOrders++;
    } else if (order.status === 'accepted' || order.status === 'dispatched') {
      inProgress++;
    } else if (order.status === 'delivered') {
      delivered++;
      totalRevenue += order.totalAmount || 0;

      // Revenue by month
      const orderDate = new Date(order.createdAt);
      revenueBuckets.forEach((bucket) => {
        if (orderDate >= bucket.start && orderDate <= bucket.end) {
          bucket.amount += order.totalAmount || 0;
        }
      });

      // Top stores tracking
      const storeObj = order.store;
      const sId = storeObj?._id ? storeObj._id.toString() : 'unknown';
      if (!storeSpendMap.has(sId)) {
        storeSpendMap.set(sId, {
          storeId: sId,
          businessName: storeObj?.businessName || 'Medical Store',
          city: storeObj?.city || 'Gujarat',
          totalSpent: 0,
          ordersCount: 0,
        });
      }
      const entry = storeSpendMap.get(sId);
      entry.totalSpent += order.totalAmount || 0;
      entry.ordersCount += 1;
    }
  });

  const revenueByMonth = revenueBuckets.map((b) => ({
    month: b.month,
    amount: Math.round(b.amount * 100) / 100,
  }));

  const topStores = Array.from(storeSpendMap.values())
    .map((s) => ({ ...s, totalSpent: Math.round(s.totalSpent * 100) / 100 }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Catalog items with stock < 20
  const lowStockListings = await Catalog.find({
    supplier: supplierId,
    stock: { $lt: 20 },
  }).populate('medicine', 'name strength form category');

  res.status(200).json({
    newOrders,
    inProgress,
    delivered,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenueByMonth,
    topStores,
    lowStockListings,
  });
});

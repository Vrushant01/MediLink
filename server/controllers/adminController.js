import User from '../models/User.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Retrieve high-level platform statistics and 6-month order trends
export const getStats = asyncHandler(async (req, res) => {
  const [totalStores, totalSuppliers, pendingApprovals, totalOrders, deliveredOrders] =
    await Promise.all([
      User.countDocuments({ role: 'store' }),
      User.countDocuments({ role: 'supplier' }),
      User.countDocuments({ approved: false, role: { $in: ['store', 'supplier'] } }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'delivered' }),
    ]);

  // Aggregate platform gross volume from successfully delivered wholesale orders
  const volumeResult = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const platformVolume = volumeResult[0]?.total || 0;

  // Build 6-month monthly order timeline
  const buckets = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toLocaleString('en-US', { month: 'short' });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    buckets.push({ month, start, end, count: 0 });
  }

  const sixMonthsAgo = buckets[0].start;
  const recentOrders = await Order.find({ createdAt: { $gte: sixMonthsAgo } }, 'createdAt');
  for (const order of recentOrders) {
    const oDate = new Date(order.createdAt);
    const bucket = buckets.find((b) => oDate >= b.start && oDate <= b.end);
    if (bucket) bucket.count++;
  }

  const ordersByMonth = buckets.map((b) => ({ month: b.month, count: b.count }));

  res.status(200).json({
    totalStores,
    totalSuppliers,
    pendingApprovals,
    totalOrders,
    deliveredOrders,
    platformVolume,
    ordersByMonth,
  });
});

// Retrieve paginated users with role, approval status, and search filters
export const getUsers = asyncHandler(async (req, res) => {
  const { role, approved, search } = req.query;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;

  const filter = {};

  if (role && role !== 'all') {
    filter.role = role;
  }

  if (approved !== undefined && approved !== 'all' && approved !== '') {
    filter.approved = approved === 'true';
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { businessName: { $regex: s, $options: 'i' } },
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    users,
    total,
    page,
    pages,
  });
});

// Approve a registered pharmacy store or wholesale supplier account
export const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.approved = true;
  await user.save();

  res.status(200).json({
    message: 'User approved successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      approved: user.approved,
    },
  });
});

// Remove a user account from the system (prevents removing admin accounts)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin' || user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete an administrator account' });
  }

  await user.deleteOne();

  res.status(200).json({
    message: 'User removed successfully',
  });
});

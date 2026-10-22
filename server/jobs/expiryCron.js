import cron from 'node-cron';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import { getDaysLeft, CRITICAL_DAYS } from '../utils/expiry.js';

// Scans inventory across all approved stores and generates expiry and low-stock alerts
export const checkExpiryAndStock = async () => {
  try {
    const approvedStores = await User.find({ role: 'store', approved: true });
    let createdCount = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const store of approvedStores) {
      const batches = await Inventory.find({ store: store._id }).populate('medicine');

      // 1. Check critical and recently expired batches
      for (const batch of batches) {
        const daysLeft = getDaysLeft(batch.expiryDate);
        const medName = batch.medicine?.name || 'Medicine';
        const rackInfo = batch.rack ? `Rack ${batch.rack}` : 'No rack specified';

        let message = null;

        if (daysLeft < 0 && daysLeft >= -7) {
          // Expired within the last 7 days
          message = `${medName} (Batch ${batch.batchNo}): ${batch.quantity} units expired ${Math.abs(daysLeft)} days ago. ${rackInfo}`;
        } else if (daysLeft < 0) {
          // Already expired
          message = `${medName} (Batch ${batch.batchNo}): ${batch.quantity} units expired on ${new Date(batch.expiryDate).toLocaleDateString('en-IN')}. ${rackInfo}`;
        } else if (daysLeft <= CRITICAL_DAYS) {
          // Critical: 0 to 30 days left
          message = `${medName} (Batch ${batch.batchNo}): ${batch.quantity} units expire in ${daysLeft} days. ${rackInfo}`;
        }

        if (message) {
          // Prevent duplicates created in the last 7 days
          const duplicate = await Notification.findOne({
            user: store._id,
            message,
            createdAt: { $gte: sevenDaysAgo },
          });

          if (!duplicate) {
            await Notification.create({
              user: store._id,
              message,
              type: 'expiry',
              read: false,
            });
            createdCount++;
          }
        }
      }

      // 2. Check low-stock medicines for this store (summing non-expired stock)
      const stockByMedicine = new Map();
      const reorderLevelByMedicine = new Map();

      batches.forEach((b) => {
        const medId = b.medicine?._id ? b.medicine._id.toString() : b.medicine.toString();
        const days = getDaysLeft(b.expiryDate);

        if (!reorderLevelByMedicine.has(medId)) {
          reorderLevelByMedicine.set(medId, {
            name: b.medicine?.name || 'Medicine',
            reorderLevel: b.reorderLevel || 20,
          });
        }

        if (days >= 0) {
          const current = stockByMedicine.get(medId) || 0;
          stockByMedicine.set(medId, current + (b.quantity || 0));
        }
      });

      for (const [medId, info] of reorderLevelByMedicine.entries()) {
        const totalStock = stockByMedicine.get(medId) || 0;
        if (totalStock < info.reorderLevel) {
          const message = `${info.name}: Low stock alert (${totalStock} units remaining). Reorder level is ${info.reorderLevel}.`;

          const duplicate = await Notification.findOne({
            user: store._id,
            message,
            createdAt: { $gte: sevenDaysAgo },
          });

          if (!duplicate) {
            await Notification.create({
              user: store._id,
              message,
              type: 'lowstock',
              read: false,
            });
            createdCount++;
          }
        }
      }
    }

    console.log(`[ExpiryCron] Created ${createdCount} notification alerts across ${approvedStores.length} stores.`);
  } catch (error) {
    console.error('[ExpiryCron] Error running daily expiry check:', error.message);
  }
};

// Schedules daily cron job at 8:00 AM and executes an immediate check at server startup
export const startExpiryCron = () => {
  // Run once immediately on startup
  checkExpiryAndStock();

  // Schedule daily run at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('[ExpiryCron] Running scheduled daily 8:00 AM stock check...');
    checkExpiryAndStock();
  });
};

import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Store reference is required'],
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required'],
    },
    batchNo: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    mrp: {
      type: Number,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20,
      min: 0,
    },
    rack: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for finding batches by store and medicine, and sorting by expiry date
inventorySchema.index({ store: 1, medicine: 1 });
inventorySchema.index({ store: 1, expiryDate: 1 });

export default mongoose.model('Inventory', inventorySchema);

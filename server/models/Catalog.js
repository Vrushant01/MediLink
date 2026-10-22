import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier reference is required'],
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    batchNo: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a supplier has only one catalog entry per medicine
catalogSchema.index({ supplier: 1, medicine: 1 }, { unique: true });

export default mongoose.model('Catalog', catalogSchema);

import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    strength: {
      type: String,
      trim: true,
    },
    form: {
      type: String,
      enum: ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment'],
      default: 'Tablet',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Medicine', medicineSchema);

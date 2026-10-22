import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['store', 'supplier', 'admin'],
      required: [true, 'Role is required'],
    },
    businessName: {
      type: String,
      trim: true,
      // Required for stores and suppliers, optional for system admin
      validate: {
        validator: function (value) {
          if (this.role === 'store' || this.role === 'supplier') {
            return Boolean(value && value.trim().length > 0);
          }
          return true;
        },
        message: 'Business name is required for store and supplier accounts',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
      // Drug license number required for pharmacies and pharma distributors
      validate: {
        validator: function (value) {
          if (this.role === 'store' || this.role === 'supplier') {
            return Boolean(value && value.trim().length > 0);
          }
          return true;
        },
        message: 'Drug license number is required for store and supplier accounts',
      },
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash user password before saving if modified, and auto-approve admin accounts
userSchema.pre('save', async function (next) {
  if (this.role === 'admin') {
    this.approved = true;
  }

  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain text password with stored bcrypt hash
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model('User', userSchema);

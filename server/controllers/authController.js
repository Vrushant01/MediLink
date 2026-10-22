import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper function to generate a 7-day JWT token with user id and role
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register a new store or supplier account (requires admin approval)
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    businessName,
    phone,
    address,
    city,
    licenseNumber,
  } = req.body;

  // Validate basic required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: 'Please provide name, email, password, and role',
    });
  }

  // Prevent self-registration as admin
  if (role !== 'store' && role !== 'supplier') {
    return res.status(400).json({
      message: 'Role must be either "store" or "supplier"',
    });
  }

  // Business name and drug license are mandatory for pharmacy ops
  if (!businessName || !licenseNumber) {
    return res.status(400).json({
      message: 'Business name and drug license number are required for store and supplier accounts',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  // Check if an account already exists with this email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      message: 'An account with this email already exists',
    });
  }

  // Create new user (approved is false by default)
  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    businessName,
    phone,
    address,
    city,
    licenseNumber,
    approved: false,
  });

  res.status(201).json({
    message: 'Registration successful. Your account is waiting for admin approval.',
    userId: newUser._id,
  });
});

// Authenticate user, check approval status, and return JWT token
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials input
  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide both email and password',
    });
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  // Check password match
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  // Gate access if account is pending admin approval
  if (!user.approved) {
    return res.status(403).json({
      message: 'Your account is waiting for admin approval.',
    });
  }

  // Generate 7-day token
  const token = generateToken(user);

  // Exclude password from user payload in response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
    phone: user.phone,
    address: user.address,
    city: user.city,
    licenseNumber: user.licenseNumber,
    approved: user.approved,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json({
    token,
    user: userResponse,
  });
});

// Return currently authenticated user profile
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

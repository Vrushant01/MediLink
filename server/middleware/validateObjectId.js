import mongoose from 'mongoose';

// Middleware validating that route parameters containing an ID are valid MongoDB ObjectIds
export const validateObjectId = (req, res, next) => {
  for (const [key, value] of Object.entries(req.params)) {
    if ((key === 'id' || key.toLowerCase().endsWith('id')) && !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
  }
  next();
};

export default validateObjectId;

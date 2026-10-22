// Simple wrapper to catch errors in async route handlers and forward them to Express error handler
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

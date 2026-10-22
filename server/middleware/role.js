// Restricts route access to specified user roles
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access forbidden: insufficient role permissions',
      });
    }
    next();
  };
};

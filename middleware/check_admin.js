const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin only access this" });
  }
  next();
};

module.exports = isAdmin;

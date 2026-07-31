// middleware/adminMiddleware.js
const admin = (req, res, next) => {
    // Check if the user exists (from authMiddleware) and if they are an Admin
    if (req.user && req.user.role === 'Admin') {
        next(); // Allow access
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' }); // 403 Forbidden
    }
};

module.exports = admin;
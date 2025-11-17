const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

// JWT Authentication Middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid authentication' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
};

// Permission checker
const checkPermission = (permission) => {
    return (req, res, next) => {
        const rolePermissions = {
            admin: ['full_access'],
            main_teacher: ['create', 'read', 'update', 'delete', 'transfer'],
            assistant_teacher: ['read', 'update_limited'],
            subject_teacher: ['read', 'mark_attendance', 'enter_marks']
        };

        const userPermissions = rolePermissions[req.user.role] || [];
        
        if (userPermissions.includes('full_access') || userPermissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ message: 'Insufficient permissions' });
        }
    };
};

module.exports = { authenticate, authorize, checkPermission };

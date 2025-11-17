const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Admin = require('../models/adminSchema');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '8h',
            issuer: 'bis-noc-school-system',
            audience: 'school-users'
        }
    );
};

// User Registration (Admin creates users)
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role, assignedClasses, assignedSubjects, schoolId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            assignedClasses: assignedClasses || [],
            assignedSubjects: assignedSubjects || [],
            school: schoolId,
            isActive: true
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).populate('school', 'schoolName');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update login history
        user.lastLogin = new Date();
        user.loginHistory.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        
        // Keep only last 10 login records
        if (user.loginHistory.length > 10) {
            user.loginHistory = user.loginHistory.slice(-10);
        }
        
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        // Prepare response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.loginHistory;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Admin Login (existing admin system)
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // For now, direct password comparison (should use bcrypt in production)
        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(admin._id, 'admin');

        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.json({
            message: 'Admin login successful',
            token,
            admin: adminResponse
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get Current User Profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('assignedClasses', 'sclassName')
            .populate('assignedSubjects', 'subName')
            .populate('school', 'schoolName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout (client-side token removal, but we can track it)
const logout = async (req, res) => {
    try {
        // In a more advanced setup, you could blacklist the token here
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    adminLogin,
    getCurrentUser,
    logout,
    changePassword
};

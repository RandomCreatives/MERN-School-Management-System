const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');

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

        const { data: existingUser } = await supabase
            .from('users')
            .select('id, email, username')
            .or(`email.eq.${email},username.eq.${username}`)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            const msg = existingUser[0].email === email ? 'Email already exists' : 'Username already exists';
            return res.status(400).json({ message: msg });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                role,
                assigned_classes: assignedClasses || [],
                assigned_subjects: assignedSubjects || [],
                school_id: schoolId,
                is_active: true
            }])
            .select('id, username, email, role, is_active, school_id')
            .single();

        if (error) return res.status(500).json({ message: error.message });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

        const token = generateToken(user.id, user.role);
        const { password: _pw, login_history, ...userResponse } = user;

        res.json({ message: 'Login successful', token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin.id, 'admin');
        const { password: _pw, ...adminResponse } = admin;

        res.json({ message: 'Admin login successful', token, admin: adminResponse });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get Current User Profile
const getCurrentUser = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, role, is_active, assigned_classes, assigned_subjects, school_id, last_login')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const { data: user } = await supabase
            .from('users')
            .select('password')
            .eq('id', req.user.id)
            .single();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ message: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        await supabase.from('users').update({ password: hashed }).eq('id', req.user.id);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, adminLogin, getCurrentUser, logout, changePassword };

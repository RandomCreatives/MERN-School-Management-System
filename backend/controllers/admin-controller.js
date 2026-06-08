const bcrypt = require('bcrypt');
const supabase = require('../supabaseClient');

const adminRegister = async (req, res) => {
    try {
        console.log('📝 Admin registration request received:', req.body.email);

        const { data: existingEmail } = await supabase
            .from('admins')
            .select('id')
            .eq('email', req.body.email)
            .single();

        if (existingEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const { data: existingSchool } = await supabase
            .from('admins')
            .select('id')
            .eq('school_name', req.body.schoolName)
            .single();

        if (existingSchool) {
            return res.send({ message: 'School name already exists' });
        }

        const { data: admin, error } = await supabase
            .from('admins')
            .insert([{
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                school_name: req.body.schoolName,
                role: 'Admin'
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Admin registration error:', error);
            return res.status(500).json({ message: error.message });
        }

        const result = { ...admin, password: undefined };
        console.log('✅ Admin registered successfully:', admin.email);
        res.send(result);
    } catch (err) {
        console.error('❌ Admin registration error:', err);
        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.send({ message: 'Email and password are required' });
    }

    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', req.body.email)
            .single();

        if (error || !admin) {
            return res.send({ message: 'User not found' });
        }

        if (req.body.password !== admin.password) {
            return res.send({ message: 'Invalid password' });
        }

        const result = { ...admin, password: undefined };
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAdminDetail = async (req, res) => {
    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !admin) {
            return res.send({ message: 'No admin found' });
        }

        res.send({ ...admin, password: undefined });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail };

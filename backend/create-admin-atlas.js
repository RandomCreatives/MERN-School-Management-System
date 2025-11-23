const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// MongoDB Atlas connection string
const MONGO_URL = "mongodb+srv://mike_fikadu:MsIYXiWexqEODVUg@schoolmanagement.fdvv8jd.mongodb.net/school-management?retryWrites=true&w=majority";

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "Admin" },
    schoolName: { type: String }
}, { timestamps: true });

const Admin = mongoose.model("admin", adminSchema);

async function createAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB Atlas');

        // Admin details - CHANGE THESE IF YOU WANT
        const adminData = {
            name: "Mike Fikadu",
            email: "admin@bisnoc.edu",
            password: "admin123",
            schoolName: "BIS NOC Gerji Campus",
            role: "Admin"
        };

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Name:', existingAdmin.name);
            console.log('\n💡 Try logging in with:');
            console.log('   Email:', adminData.email);
            console.log('   Password: (the one you set)');
            process.exit(0);
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create admin
        const admin = new Admin({
            ...adminData,
            password: hashedPassword
        });

        console.log('💾 Saving admin to database...');
        await admin.save();

        console.log('\n✅ Admin account created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('👤 Name:', adminData.name);
        console.log('🏫 School:', adminData.schoolName);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Login at: https://mern-school-management-system-js92.vercel.app/admin-login');
        console.log('\nOr locally at: http://localhost:3000/admin-login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 11000) {
            console.log('\n💡 This email is already registered. Try logging in or use a different email.');
        }
        process.exit(1);
    }
}

createAdmin();

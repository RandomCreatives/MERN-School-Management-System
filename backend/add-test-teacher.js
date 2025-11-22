// Script to add a test teacher to the database
// Run with: node add-test-teacher.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');
const Admin = require('./models/adminSchema');

async function addTestTeacher() {
    try {
        console.log('🔍 Checking for admin...\n');

        // Get first admin
        const admin = await Admin.findOne();
        
        if (!admin) {
            console.log('❌ No admin found! Please create an admin first.');
            process.exit(1);
        }

        console.log(`✅ Found admin: ${admin.name}\n`);

        // Check if test teacher already exists
        const existingTeacher = await Teacher.findOne({ teacherId: 'TCH001' });
        
        if (existingTeacher) {
            console.log('⚠️  Test teacher (TCH001) already exists!');
            console.log(`   Name: ${existingTeacher.name}`);
            console.log(`   Email: ${existingTeacher.email}`);
            console.log(`   Teacher ID: ${existingTeacher.teacherId}\n`);
            
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            readline.question('Do you want to create another teacher? (yes/no): ', async (answer) => {
                readline.close();
                if (answer.toLowerCase() !== 'yes') {
                    console.log('Exiting...');
                    process.exit(0);
                }
                await createTeacher(admin._id);
            });
        } else {
            await createTeacher(admin._id);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function createTeacher(adminId) {
    try {
        // Count existing teachers to generate ID
        const teacherCount = await Teacher.countDocuments();
        const teacherId = `TCH${String(teacherCount + 1).padStart(3, '0')}`;
        const password = `${teacherId}@bis`;

        console.log('📝 Creating test teacher...\n');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create teacher
        const teacher = new Teacher({
            name: 'Test Teacher',
            teacherId: teacherId,
            email: `${teacherId.toLowerCase()}@bisnoc.edu`,
            password: hashedPassword,
            role: 'Teacher',
            teacherType: 'main_teacher',
            school: adminId
        });

        await teacher.save();

        console.log('✅ Test teacher created successfully!\n');
        console.log('📋 Login Credentials:');
        console.log(`   Teacher ID: ${teacherId}`);
        console.log(`   Email: ${teacher.email}`);
        console.log(`   Password: ${password}`);
        console.log('\n💡 Use these credentials to login at the Teacher Portal\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating teacher:', error.message);
        process.exit(1);
    }
}

// Run the script
addTestTeacher();

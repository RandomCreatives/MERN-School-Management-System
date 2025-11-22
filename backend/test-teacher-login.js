// Quick script to test teacher login functionality
// Run with: node test-teacher-login.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');

async function testTeacherLogin() {
    try {
        console.log('🔍 Checking teachers in database...\n');

        // Get all teachers
        const teachers = await Teacher.find().select('name email teacherId role teacherType');
        
        if (teachers.length === 0) {
            console.log('❌ No teachers found in database!');
            console.log('💡 Add teachers via Admin Dashboard → Teachers Management\n');
            process.exit(0);
        }

        console.log(`✅ Found ${teachers.length} teacher(s):\n`);
        
        teachers.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name}`);
            console.log(`   Email: ${teacher.email}`);
            console.log(`   Teacher ID: ${teacher.teacherId || 'Not set'}`);
            console.log(`   Role: ${teacher.role}`);
            console.log(`   Type: ${teacher.teacherType}`);
            console.log('');
        });

        // Test login with first teacher
        if (teachers[0]) {
            console.log('🧪 Testing login functionality...\n');
            
            const testTeacher = await Teacher.findById(teachers[0]._id);
            
            // Test with a common password
            const testPasswords = ['test123', 'password', 'TCH001@bis', teachers[0].teacherId + '@bis'];
            
            console.log('Testing common passwords:');
            for (const pwd of testPasswords) {
                const isValid = await bcrypt.compare(pwd, testTeacher.password);
                if (isValid) {
                    console.log(`✅ Password found: "${pwd}"`);
                    console.log(`\n📋 Login Credentials:`);
                    console.log(`   Teacher ID: ${testTeacher.teacherId || testTeacher.email}`);
                    console.log(`   Password: ${pwd}`);
                    break;
                }
            }
        }

        console.log('\n✨ Test complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
testTeacherLogin();

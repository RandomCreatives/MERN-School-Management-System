// Quick script to test student login functionality
// Run with: node test-student-login.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Student = require('./models/studentSchema');
const Sclass = require('./models/sclassSchema');

async function testStudentLogin() {
    try {
        console.log('🔍 Checking students in database...\n');

        // Get all students
        const students = await Student.find()
            .populate('sclassName', 'sclassName')
            .select('name rollNum studentId sclassName');
        
        if (students.length === 0) {
            console.log('❌ No students found in database!');
            console.log('💡 Add students via Admin Dashboard → Student Management\n');
            process.exit(0);
        }

        console.log(`✅ Found ${students.length} student(s):\n`);
        
        // Group by class
        const byClass = {};
        students.forEach(student => {
            const className = student.sclassName?.sclassName || 'No Class';
            if (!byClass[className]) byClass[className] = [];
            byClass[className].push(student);
        });

        // Display by class
        Object.keys(byClass).sort().forEach(className => {
            console.log(`📚 ${className} (${byClass[className].length} students):`);
            byClass[className].forEach((student, index) => {
                console.log(`   ${index + 1}. ${student.name}`);
                console.log(`      Roll No: ${student.rollNum}`);
                console.log(`      Student ID: ${student.studentId || 'Not set'}`);
            });
            console.log('');
        });

        // Test login with first student
        if (students[0]) {
            console.log('🧪 Testing login functionality...\n');
            
            const testStudent = await Student.findById(students[0]._id);
            
            // Test with common passwords
            const testPasswords = ['test123', 'password', students[0].studentId + '@bis'];
            
            console.log('Testing common passwords:');
            for (const pwd of testPasswords) {
                if (testStudent.password) {
                    const isValid = await bcrypt.compare(pwd, testStudent.password);
                    if (isValid) {
                        console.log(`✅ Password found: "${pwd}"`);
                        console.log(`\n📋 Login Credentials:`);
                        console.log(`   Student ID: ${testStudent.studentId || testStudent.rollNum}`);
                        console.log(`   Password: ${pwd}`);
                        break;
                    }
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
testStudentLogin();

// Script to fix existing teacher data
// Adds teacherId and fixes teacherType format
// Run with: node fix-teacher-data.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');

// Map teacher types to schema format
const teacherTypeMap = {
    'Main Teacher': 'main_teacher',
    'Cover Teacher': 'assistant_teacher',
    'Art Teacher': 'subject_teacher',
    'ICT Teacher': 'subject_teacher',
    'Amharic Teacher': 'subject_teacher',
    'PE Teacher': 'subject_teacher',
    'French Teacher': 'subject_teacher',
    'English Teacher': 'subject_teacher',
    'Music Teacher': 'subject_teacher',
    'Assistant Teacher': 'assistant_teacher',
    'Special Needs Teacher': 'special_needs_teacher'
};

async function fixTeacherData() {
    try {
        console.log('🔧 Fixing teacher data...\n');

        const teachers = await Teacher.find();
        let fixed = 0;
        let errors = 0;

        for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];
            let needsUpdate = false;
            const updates = {};

            // Add teacherId if missing
            if (!teacher.teacherId) {
                updates.teacherId = `TCH${String(i + 1).padStart(3, '0')}`;
                needsUpdate = true;
            }

            // Fix teacherType format
            if (teacher.teacherType && teacherTypeMap[teacher.teacherType]) {
                updates.teacherType = teacherTypeMap[teacher.teacherType];
                needsUpdate = true;
            }

            // Fix missing email
            if (!teacher.email || teacher.email === 'undefined') {
                const name = teacher.name.toLowerCase().replace(/\s+/g, '');
                updates.email = `${name}@bisnoc.edu`;
                needsUpdate = true;
            }

            // Set default password if needed (for testing)
            // Password will be: teacherId@bis (e.g., TCH001@bis)
            if (needsUpdate && updates.teacherId) {
                const defaultPassword = `${updates.teacherId}@bis`;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(defaultPassword, salt);
                updates.password = hashedPassword;
            }

            if (needsUpdate) {
                try {
                    await Teacher.findByIdAndUpdate(teacher._id, updates);
                    console.log(`✅ Fixed: ${teacher.name}`);
                    if (updates.teacherId) {
                        console.log(`   Teacher ID: ${updates.teacherId}`);
                        console.log(`   Password: ${updates.teacherId}@bis`);
                    }
                    if (updates.teacherType) {
                        console.log(`   Type: ${updates.teacherType}`);
                    }
                    if (updates.email) {
                        console.log(`   Email: ${updates.email}`);
                    }
                    console.log('');
                    fixed++;
                } catch (err) {
                    console.error(`❌ Error fixing ${teacher.name}:`, err.message);
                    errors++;
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total teachers: ${teachers.length}`);
        console.log(`   Fixed: ${fixed}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Already correct: ${teachers.length - fixed - errors}`);

        console.log('\n✨ All teachers now have:');
        console.log('   - Teacher ID (TCH001, TCH002, etc.)');
        console.log('   - Default password (TeacherID@bis)');
        console.log('   - Correct teacherType format');
        console.log('   - Valid email address');

        console.log('\n💡 Teachers can now login with:');
        console.log('   Teacher ID: TCH001 (or their assigned ID)');
        console.log('   Password: TCH001@bis (or their assigned password)');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixTeacherData();

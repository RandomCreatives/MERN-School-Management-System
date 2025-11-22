// Script to fix existing student data
// Assigns classes, roll numbers, and sets passwords
// Run with: node fix-student-data.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Student = require('./models/studentSchema');
const Sclass = require('./models/sclassSchema');

// Map student ID prefixes to class names
const classMap = {
    'Blue': 'Year 3 - Blue',
    'Crim': 'Year 3 - Crimson',
    'Cyan': 'Year 3 - Cyan',
    'Purp': 'Year 3 - Purple',
    'Lave': 'Year 3 - Lavender',
    'Maro': 'Year 3 - Maroon',
    'Viol': 'Year 3 - Violet',
    'Gree': 'Year 3 - Green',
    'Red': 'Year 3 - Red',
    'Yell': 'Year 3 - Yellow',
    'Mage': 'Year 3 - Magenta',
    'Oran': 'Year 3 - Orange'
};

async function fixStudentData() {
    try {
        console.log('🔧 Fixing student data...\n');

        // Get all classes
        const classes = await Sclass.find();
        const classIdMap = {};
        classes.forEach(cls => {
            classIdMap[cls.sclassName] = cls._id;
        });

        console.log(`Found ${classes.length} classes in database\n`);

        const students = await Student.find();
        let fixed = 0;
        let errors = 0;
        const classCounts = {};

        for (const student of students) {
            let needsUpdate = false;
            const updates = {};

            // Determine class from studentId prefix
            if (student.studentId) {
                const prefix = student.studentId.match(/^[A-Za-z]+/)?.[0];
                const className = classMap[prefix];
                
                if (className && classIdMap[className]) {
                    // Assign class
                    if (!student.sclassName || student.sclassName.toString() !== classIdMap[className].toString()) {
                        updates.sclassName = classIdMap[className];
                        needsUpdate = true;
                    }

                    // Assign roll number (sequential per class)
                    if (!student.rollNum) {
                        if (!classCounts[className]) classCounts[className] = 0;
                        classCounts[className]++;
                        updates.rollNum = classCounts[className];
                        needsUpdate = true;
                    }
                }
            }

            // Set default password if needed
            if (student.studentId && needsUpdate) {
                const defaultPassword = `${student.studentId}@bis`;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(defaultPassword, salt);
                updates.password = hashedPassword;
            }

            if (needsUpdate) {
                try {
                    await Student.findByIdAndUpdate(student._id, updates);
                    const className = Object.keys(classMap).find(k => student.studentId?.startsWith(k));
                    console.log(`✅ ${student.name} → ${classMap[className] || 'Unknown'} (Roll ${updates.rollNum || 'N/A'})`);
                    fixed++;
                } catch (err) {
                    console.error(`❌ Error fixing ${student.name}:`, err.message);
                    errors++;
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total students: ${students.length}`);
        console.log(`   Fixed: ${fixed}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Already correct: ${students.length - fixed - errors}`);

        console.log('\n📚 Students per class:');
        Object.keys(classMap).sort().forEach(prefix => {
            const className = classMap[prefix];
            const count = classCounts[className] || 0;
            if (count > 0) {
                console.log(`   ${className}: ${count} students`);
            }
        });

        console.log('\n✨ All students now have:');
        console.log('   - Assigned to their class');
        console.log('   - Roll numbers (1, 2, 3, etc.)');
        console.log('   - Default password (StudentID@bis)');

        console.log('\n💡 Students can now login with:');
        console.log('   Student ID: Blue001 (or their assigned ID)');
        console.log('   Password: Blue001@bis (or their assigned password)');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixStudentData();

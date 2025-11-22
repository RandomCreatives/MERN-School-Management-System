// Script to assign teachers to their classes and populate students
// Run with: node assign-teachers-and-students.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');
const Student = require('./models/studentSchema');
const Sclass = require('./models/sclassSchema');

// Teacher to Class mapping (using exact names from database)
const teacherClassMap = {
    'Abigia Alemayehu': 'Year 3 - Magenta',
    'Abigiya Tadele': 'Year 3 - Violet',
    'Deginet Engida': 'Year 3 - Green',
    'Denebe Abu': 'Year 3 - Red',
    'Mariamawit Belay': 'Year 3 - Cyan',
    'Mekdelawit Abate': 'Year 3 - Maroon',
    'Mekdelawit Nigusu': 'Year 3 - Yellow',
    'Meron Abebe': 'Year 3 - Orange',
    'Mulugeta Jemberu': 'Year 3 - Blue',
    'Selam Goyte': 'Year 3 - Lavender',
    'Simegn Yilma': 'Year 3 - Crimson',
    'Yeabsira Amdie': 'Year 3 - Purple'
};

// Student names pool
const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
    'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Elijah', 'Sofia', 'Logan'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
];

// Class configurations with student ID prefixes
const classConfigs = [
    { prefix: 'Blue', name: 'Year 3 - Blue', count: 26 },
    { prefix: 'Crim', name: 'Year 3 - Crimson', count: 25 },
    { prefix: 'Cyan', name: 'Year 3 - Cyan', count: 24 },
    { prefix: 'Purp', name: 'Year 3 - Purple', count: 26 },
    { prefix: 'Lave', name: 'Year 3 - Lavender', count: 25 },
    { prefix: 'Maro', name: 'Year 3 - Maroon', count: 24 },
    { prefix: 'Viol', name: 'Year 3 - Violet', count: 26 },
    { prefix: 'Gree', name: 'Year 3 - Green', count: 25 },
    { prefix: 'Red', name: 'Year 3 - Red', count: 24 },
    { prefix: 'Yell', name: 'Year 3 - Yellow', count: 26 },
    { prefix: 'Mage', name: 'Year 3 - Magenta', count: 25 },
    { prefix: 'Oran', name: 'Year 3 - Orange', count: 24 }
];

function getRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}

async function assignTeachersAndStudents() {
    try {
        console.log('🎓 Assigning teachers to classes and populating students...\n');

        // Get or create school
        const SchoolModel = mongoose.model('school', new mongoose.Schema({
            schoolName: String
        }), 'schools');
        
        let school = await SchoolModel.findOne();
        if (!school) {
            console.log('Creating default school...');
            school = new SchoolModel({
                schoolName: 'British International School - NOC Gerji'
            });
            await school.save();
            console.log('✅ School created\n');
        }

        // Get all classes or create them
        let classes = await Sclass.find();
        
        if (classes.length === 0) {
            console.log('No classes found. Creating Year 3 classes...\n');
            
            for (const config of classConfigs) {
                const newClass = new Sclass({
                    sclassName: config.name,
                    school: school._id
                });
                await newClass.save();
                classes.push(newClass);
                console.log(`✅ Created ${config.name}`);
            }
            console.log('');
        }

        const classMap = {};
        classes.forEach(cls => {
            classMap[cls.sclassName] = cls._id;
        });

        console.log(`Found ${classes.length} classes\n`);

        // Step 1: Assign teachers to their classes
        console.log('👨‍🏫 Assigning teachers to classes...\n');
        
        let teachersAssigned = 0;
        let teachersNotFound = 0;

        for (const [teacherName, className] of Object.entries(teacherClassMap)) {
            const teacher = await Teacher.findOne({ name: teacherName });
            
            if (!teacher) {
                console.log(`⚠️  Teacher not found: ${teacherName}`);
                teachersNotFound++;
                continue;
            }

            const classId = classMap[className];
            if (!classId) {
                console.log(`⚠️  Class not found: ${className}`);
                continue;
            }

            // Update teacher with class assignment
            await Teacher.findByIdAndUpdate(teacher._id, {
                teachSclass: classId,
                homeroomClass: classId,
                teacherType: 'main_teacher'
            });

            console.log(`✅ ${teacherName} → ${className}`);
            teachersAssigned++;
        }

        console.log(`\n📊 Teachers: ${teachersAssigned} assigned, ${teachersNotFound} not found\n`);

        // Step 2: Populate students for each class
        console.log('👨‍🎓 Populating students...\n');

        let totalCreated = 0;
        let totalSkipped = 0;

        // Get school ID from first class
        const schoolId = classes[0].school;

        for (const config of classConfigs) {
            const classId = classMap[config.name];
            
            if (!classId) {
                console.log(`⚠️  Class not found: ${config.name}`);
                continue;
            }

            console.log(`📚 ${config.name}:`);

            for (let i = 1; i <= config.count; i++) {
                const studentId = `${config.prefix}${String(i).padStart(3, '0')}`;
                
                // Check if student already exists
                const existing = await Student.findOne({ studentId });
                if (existing) {
                    totalSkipped++;
                    continue;
                }

                const name = getRandomName();
                const email = `${studentId.toLowerCase()}@bisnoc.edu`;
                const password = `${studentId}@bis`;

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Create student
                const student = new Student({
                    name,
                    rollNum: i,
                    studentId,
                    password: hashedPassword,
                    email,
                    sclassName: classId,
                    school: schoolId,
                    role: 'Student'
                });

                await student.save();
                totalCreated++;
            }

            console.log(`   ✅ Created ${config.count} students`);
        }

        console.log(`\n📊 Students Summary:`);
        console.log(`   Total created: ${totalCreated}`);
        console.log(`   Total skipped (already exist): ${totalSkipped}`);

        // Step 3: Display summary by teacher
        console.log('\n\n👥 Teacher-Class-Student Summary:\n');
        
        for (const [teacherName, className] of Object.entries(teacherClassMap)) {
            const teacher = await Teacher.findOne({ name: teacherName });
            if (!teacher) continue;

            const classId = classMap[className];
            const studentCount = await Student.countDocuments({ sclassName: classId });
            
            console.log(`✅ ${teacherName}`);
            console.log(`   Class: ${className}`);
            console.log(`   Students: ${studentCount}`);
            console.log(`   Teacher ID: ${teacher.teacherId}`);
            console.log(`   Password: ${teacher.teacherId}@bis\n`);
        }

        console.log('\n✨ Setup complete!');
        console.log('\n💡 Login Information:');
        console.log('   Teachers: Use Teacher ID (e.g., TCH001) and password (TCH001@bis)');
        console.log('   Students: Use Student ID (e.g., Blue001) and password (Blue001@bis)');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

assignTeachersAndStudents();

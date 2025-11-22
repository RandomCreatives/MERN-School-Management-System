// Script to populate sample students for all classes
// Run with: node populate-students.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Student = require('./models/studentSchema');
const Sclass = require('./models/sclassSchema');
const Admin = require('./models/adminSchema');

// Student names pool
const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
    'Emily', 'Daniel', 'Elizabeth', 'Matthew'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
];

// Class configurations
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

async function populateStudents() {
    try {
        console.log('🎓 Populating students for all classes...\n');

        // Get the first admin/school (or create a default one)
        let admin = await Admin.findOne();
        let school;
        
        if (!admin) {
            console.log('⚠️  No admin found. Creating default admin and school...');
            
            // Create default school
            const SchoolModel = mongoose.model('school', new mongoose.Schema({
                schoolName: String
            }));
            
            const defaultSchool = new SchoolModel({
                schoolName: 'British International School - NOC Gerji'
            });
            await defaultSchool.save();
            school = defaultSchool._id;
            
            console.log('✅ Default school created\n');
        } else {
            school = admin.school;
        }

        // Get or create all classes
        let classes = await Sclass.find({ school });
        
        if (classes.length === 0) {
            console.log('⚠️  No classes found. Creating classes...');
            
            for (const config of classConfigs) {
                const newClass = new Sclass({
                    sclassName: config.name,
                    school: school
                });
                await newClass.save();
                classes.push(newClass);
            }
            
            console.log(`✅ Created ${classes.length} classes\n`);
        }

        console.log(`Found ${classes.length} classes\n`);

        let totalCreated = 0;
        let totalSkipped = 0;

        for (const config of classConfigs) {
            // Find the class
            const sclass = classes.find(c => c.sclassName === config.name);
            
            if (!sclass) {
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
                    sclassName: sclass._id,
                    school: admin.school,
                    role: 'Student'
                });

                await student.save();
                totalCreated++;
            }

            console.log(`   ✅ Created ${config.count} students`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total created: ${totalCreated}`);
        console.log(`   Total skipped (already exist): ${totalSkipped}`);

        console.log('\n✨ Students created successfully!');
        console.log('\n💡 Login format:');
        console.log('   Student ID: Blue001, Crim001, etc.');
        console.log('   Password: Blue001@bis, Crim001@bis, etc.');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

populateStudents();

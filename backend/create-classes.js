// Script to create all Year 3 classes
// Run with: node create-classes.js

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Sclass = require('./models/sclassSchema');
const Admin = require('./models/adminSchema');

const classNames = [
    'Year 3 - Blue',
    'Year 3 - Crimson',
    'Year 3 - Cyan',
    'Year 3 - Purple',
    'Year 3 - Lavender',
    'Year 3 - Maroon',
    'Year 3 - Violet',
    'Year 3 - Green',
    'Year 3 - Red',
    'Year 3 - Yellow',
    'Year 3 - Magenta',
    'Year 3 - Orange'
];

async function createClasses() {
    try {
        console.log('🏫 Creating Year 3 classes...\n');

        // Get first admin
        const admin = await Admin.findOne();
        
        if (!admin) {
            console.log('❌ No admin found! Please create an admin first.');
            process.exit(1);
        }

        let created = 0;
        let existing = 0;

        for (const className of classNames) {
            const existingClass = await Sclass.findOne({ sclassName: className });
            
            if (existingClass) {
                console.log(`⏭️  ${className} already exists`);
                existing++;
            } else {
                const newClass = new Sclass({
                    sclassName: className,
                    school: admin._id
                });
                await newClass.save();
                console.log(`✅ Created ${className}`);
                created++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Already existed: ${existing}`);
        console.log(`   Total classes: ${created + existing}`);

        console.log('\n✨ All Year 3 classes are now ready!');
        console.log('💡 Run "node fix-student-data.js" to assign students to classes');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createClasses();

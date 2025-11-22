const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

const Sclass = require('./models/sclassSchema');

setTimeout(async () => {
    try {
        // Find Magenta class
        const magentaClass = await Sclass.findOne({ sclassName: 'Year 3 - Magenta' });
        
        if (!magentaClass) {
            console.log('❌ Magenta class not found');
            process.exit(1);
        }

        // Generate password
        const password = 'TCH001@bis';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update directly in the database
        const result = await mongoose.connection.db.collection('teachers').updateOne(
            { name: 'Abigia Alemayehu' },
            {
                $set: {
                    teacherId: 'TCH001',
                    teacherType: 'main_teacher',
                    teachSclass: magentaClass._id,
                    homeroomClass: magentaClass._id,
                    teachClasses: [magentaClass._id],
                    password: hashedPassword,
                    email: 'abigiaalemayehu@bisnoc.edu'
                }
            }
        );

        console.log('Update result:', result);
        
        // Verify
        const updated = await mongoose.connection.db.collection('teachers').findOne({ name: 'Abigia Alemayehu' });
        console.log('\nVerification:');
        console.log('  teacherId:', updated.teacherId);
        console.log('  teacherType:', updated.teacherType);
        console.log('  teachSclass:', updated.teachSclass);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}, 1000);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

setTimeout(async () => {
    try {
        const teacher = await Teacher.findOne({ name: 'Abigia Alemayehu' });
        
        if (!teacher) {
            console.log('❌ Teacher not found');
            process.exit(1);
        }

        console.log('Current state:');
        console.log('  teacherId:', teacher.teacherId);
        console.log('  teacherType:', teacher.teacherType);

        // Find Magenta class
        const magentaClass = await Sclass.findOne({ sclassName: 'Year 3 - Magenta' });

        // Generate password
        const password = 'TCH001@bis';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Direct update using updateOne to bypass validation temporarily
        await mongoose.connection.collection('teachers').updateOne(
            { _id: teacher._id },
            {
                $set: {
                    teacherId: 'TCH001',
                    teacherType: 'main_teacher',
                    teachSclass: magentaClass._id,
                    homeroomClass: magentaClass._id,
                    teachClasses: [magentaClass._id],
                    password: hashedPassword
                }
            }
        );

        console.log('\n✅ Updated successfully!');
        console.log('  Teacher ID: TCH001');
        console.log('  Password: TCH001@bis');
        console.log('  Class: Year 3 - Magenta');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}, 1000);

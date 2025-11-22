const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

const Teacher = require('./models/teacherSchema');

setTimeout(async () => {
    const teacher = await Teacher.findOne({ teacherId: 'TCH001' })
        .populate('teachSclass', 'sclassName')
        .populate('homeroomClass', 'sclassName');
    
    if (teacher) {
        console.log('Found TCH001:');
        console.log('  Name:', teacher.name);
        console.log('  teacherType:', JSON.stringify(teacher.teacherType));
        console.log('  teachSclass:', teacher.teachSclass?.sclassName);
        console.log('  homeroomClass:', teacher.homeroomClass?.sclassName);
    } else {
        console.log('❌ TCH001 not found');
        
        // Find by name
        const byName = await Teacher.findOne({ name: 'Abigia Alemayehu' });
        if (byName) {
            console.log('\nFound by name:');
            console.log('  Teacher ID:', byName.teacherId);
            console.log('  teacherType:', JSON.stringify(byName.teacherType));
        }
    }
    
    process.exit(0);
}, 1000);

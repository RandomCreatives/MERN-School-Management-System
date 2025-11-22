// Check all teacher class assignments
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

async function checkTeachers() {
    try {
        console.log('👨‍🏫 Checking all teacher assignments...\n');

        const teachers = await Teacher.find({ teacherType: 'main_teacher' })
            .populate('teachSclass', 'sclassName')
            .populate('homeroomClass', 'sclassName')
            .sort({ teacherId: 1 });

        console.log('Main Teachers:\n');
        
        teachers.forEach(teacher => {
            console.log(`${teacher.teacherId} - ${teacher.name}`);
            console.log(`  teachSclass: ${teacher.teachSclass?.sclassName || 'Not assigned'}`);
            console.log(`  homeroomClass: ${teacher.homeroomClass?.sclassName || 'Not assigned'}`);
            console.log('');
        });

        console.log('\n📊 Summary:');
        console.log(`Total main teachers: ${teachers.length}`);
        console.log(`Assigned to classes: ${teachers.filter(t => t.teachSclass || t.homeroomClass).length}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTeachers();

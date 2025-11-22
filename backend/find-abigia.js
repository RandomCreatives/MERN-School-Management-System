const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

setTimeout(async () => {
    const teacher = await Teacher.findOne({ name: /Abigia/i })
        .populate('teachSclass', 'sclassName')
        .populate('homeroomClass', 'sclassName');
    
    if (teacher) {
        console.log('Found:', teacher.name);
        console.log('Teacher ID:', teacher.teacherId);
        console.log('teacherType:', teacher.teacherType);
        console.log('teachSclass:', teacher.teachSclass?.sclassName);
        console.log('homeroomClass:', teacher.homeroomClass?.sclassName);
        
        // Assign to Magenta if not assigned
        if (!teacher.teachSclass || teacher.teachSclass.sclassName !== 'Year 3 - Magenta') {
            console.log('\n📝 Assigning to Year 3 - Magenta...');
            const magentaClass = await Sclass.findOne({ sclassName: 'Year 3 - Magenta' });
            await Teacher.findByIdAndUpdate(teacher._id, {
                teacherType: 'main_teacher',
                teachSclass: magentaClass._id,
                homeroomClass: magentaClass._id,
                teachClasses: [magentaClass._id]
            });
            console.log('✅ Assigned!');
        }
    } else {
        console.log('❌ Teacher not found');
    }
    
    process.exit(0);
}, 1000);

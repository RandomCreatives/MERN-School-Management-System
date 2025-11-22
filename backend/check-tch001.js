const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

setTimeout(async () => {
    const teacher = await Teacher.findOne({ teacherId: 'TCH001' })
        .populate('teachSclass', 'sclassName')
        .populate('homeroomClass', 'sclassName');
    
    console.log('TCH001:', teacher?.name);
    console.log('teacherType:', teacher?.teacherType);
    console.log('teachSclass:', teacher?.teachSclass?.sclassName);
    console.log('homeroomClass:', teacher?.homeroomClass?.sclassName);
    
    // Fix if needed
    if (teacher && teacher.teacherType !== 'main_teacher') {
        console.log('\nFixing teacher type...');
        const magentaClass = await Sclass.findOne({ sclassName: 'Year 3 - Magenta' });
        await Teacher.findByIdAndUpdate(teacher._id, {
            teacherType: 'main_teacher',
            teachSclass: magentaClass._id,
            homeroomClass: magentaClass._id
        });
        console.log('✅ Fixed!');
    }
    
    process.exit(0);
}, 1000);

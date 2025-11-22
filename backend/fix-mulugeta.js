// Fix Mulugeta Jemberu's class assignment
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

async function fixMulugeta() {
    try {
        console.log('🔧 Fixing Mulugeta Jemberu\'s class assignment...\n');

        // Find Mulugeta
        const teacher = await Teacher.findOne({ name: 'Mulugeta Jemberu' })
            .populate('teachSclass', 'sclassName')
            .populate('homeroomClass', 'sclassName');
        
        if (!teacher) {
            console.log('❌ Teacher not found');
            process.exit(1);
        }

        console.log('Current data:');
        console.log('  Name:', teacher.name);
        console.log('  Teacher ID:', teacher.teacherId);
        console.log('  teachClasses:', teacher.teachClasses);
        console.log('  teachSclass:', teacher.teachSclass?.sclassName);
        console.log('  homeroomClass:', teacher.homeroomClass?.sclassName);

        // Find Blue class
        const blueClass = await Sclass.findOne({ sclassName: 'Year 3 - Blue' });
        
        if (!blueClass) {
            console.log('❌ Blue class not found');
            process.exit(1);
        }

        console.log('\n📝 Updating to Year 3 - Blue...');

        // Update teacher - teachClasses is an array of class IDs
        await Teacher.findByIdAndUpdate(teacher._id, {
            teachClasses: [blueClass._id],
            teachSclass: blueClass._id,
            homeroomClass: blueClass._id,
            teacherType: 'main_teacher'
        });

        console.log('✅ Updated successfully!');
        
        // Verify
        const updated = await Teacher.findById(teacher._id)
            .populate('teachSclass', 'sclassName')
            .populate('homeroomClass', 'sclassName');
        
        console.log('\nNew data:');
        console.log('  Name:', updated.name);
        console.log('  Teacher ID:', updated.teacherId);
        console.log('  teachClasses:', updated.teachClasses);
        console.log('  teachSclass:', updated.teachSclass?.sclassName);
        console.log('  homeroomClass:', updated.homeroomClass?.sclassName);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixMulugeta();

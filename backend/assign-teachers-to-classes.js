// Script to assign main teachers to their homeroom classes
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Teacher = require('./models/teacherSchema');
const Sclass = require('./models/sclassSchema');

// Map teachers to classes
const teacherClassMap = {
    'TCH001': 'Year 3 - Blue',
    'TCH002': 'Year 3 - Crimson',
    'TCH003': 'Year 3 - Cyan',
    'TCH004': 'Year 3 - Purple',
    'TCH005': 'Year 3 - Lavender',
    'TCH006': 'Year 3 - Maroon',
    'TCH007': 'Year 3 - Violet',
    'TCH008': 'Year 3 - Green',
    'TCH009': 'Year 3 - Red',
    'TCH010': 'Year 3 - Yellow',
    'TCH011': 'Year 3 - Magenta',
    'TCH012': 'Year 3 - Orange'
};

async function assignTeachersToClasses() {
    try {
        console.log('🔗 Assigning teachers to classes...\n');

        // Get all classes
        const classes = await Sclass.find();
        const classMap = {};
        classes.forEach(cls => {
            classMap[cls.sclassName] = cls._id;
        });

        let assigned = 0;
        let errors = 0;

        for (const [teacherId, className] of Object.entries(teacherClassMap)) {
            try {
                const teacher = await Teacher.findOne({ teacherId });
                
                if (!teacher) {
                    console.log(`❌ Teacher ${teacherId} not found`);
                    errors++;
                    continue;
                }

                const classId = classMap[className];
                if (!classId) {
                    console.log(`❌ Class ${className} not found`);
                    errors++;
                    continue;
                }

                // Update teacher with homeroom class
                await Teacher.findByIdAndUpdate(teacher._id, {
                    homeroomClass: classId,
                    teachSclass: classId, // Legacy field
                    teacherType: 'main_teacher'
                });

                console.log(`✅ ${teacher.name} (${teacherId}) → ${className}`);
                assigned++;

            } catch (err) {
                console.error(`❌ Error assigning ${teacherId}:`, err.message);
                errors++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Assigned: ${assigned}`);
        console.log(`   Errors: ${errors}`);
        console.log(`\n✨ Teacher-class assignments complete!`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

assignTeachersToClasses();

// Test if students API is working
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Student = require('./models/studentSchema');
const Sclass = require('./models/sclassSchema');

async function testAPI() {
    try {
        console.log('🔍 Testing Students API...\n');

        const students = await Student.find().populate("sclassName", "sclassName");
        
        console.log(`✅ Found ${students.length} students\n`);

        // Group by class
        const byClass = {};
        students.forEach(student => {
            const className = student.sclassName?.sclassName || 'No Class';
            if (!byClass[className]) byClass[className] = [];
            byClass[className].push(student);
        });

        console.log('📚 Students by class:\n');
        Object.keys(byClass).sort().forEach(className => {
            console.log(`${className}: ${byClass[className].length} students`);
        });

        console.log('\n✨ API test complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAPI();

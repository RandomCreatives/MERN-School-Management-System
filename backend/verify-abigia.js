const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/school');

setTimeout(async () => {
    // Query directly from MongoDB collection
    const result = await mongoose.connection.collection('teachers').findOne({ name: 'Abigia Alemayehu' });
    
    console.log('Direct MongoDB query:');
    console.log('  Name:', result.name);
    console.log('  teacherId:', result.teacherId);
    console.log('  teacherType:', result.teacherType);
    console.log('  teachSclass:', result.teachSclass);
    console.log('  homeroomClass:', result.homeroomClass);
    
    process.exit(0);
}, 1000);

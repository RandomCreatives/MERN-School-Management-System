// Test student login API
const axios = require('axios');

async function testStudentLogin() {
    console.log('🧪 Testing Student Login API...\n');

    // Test 1: Login with studentId
    console.log('Test 1: Login with studentId (Blue001)');
    try {
        const response = await axios.post('http://localhost:5000/StudentLogin', {
            rollNum: 'Blue001',
            password: 'Blue001@bis'
        });
        
        if (response.data._id) {
            console.log('✅ SUCCESS - Student logged in');
            console.log(`   Name: ${response.data.name}`);
            console.log(`   Class: ${response.data.sclassName?.sclassName}`);
            console.log(`   Student ID: ${response.data.studentId}`);
        } else {
            console.log('❌ FAILED:', response.data.message);
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n');

    // Test 2: Wrong password
    console.log('Test 2: Wrong password');
    try {
        const response = await axios.post('http://localhost:5000/StudentLogin', {
            rollNum: 'Blue001',
            password: 'wrongpassword'
        });
        
        if (response.data._id) {
            console.log('❌ FAILED - Should not login with wrong password');
        } else {
            console.log('✅ SUCCESS - Correctly rejected:', response.data.message);
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n');

    // Test 3: Non-existent student
    console.log('Test 3: Non-existent student');
    try {
        const response = await axios.post('http://localhost:5000/StudentLogin', {
            rollNum: 'INVALID999',
            password: 'password'
        });
        
        if (response.data._id) {
            console.log('❌ FAILED - Should not find student');
        } else {
            console.log('✅ SUCCESS - Correctly rejected:', response.data.message);
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n✨ Test complete!');
}

testStudentLogin();

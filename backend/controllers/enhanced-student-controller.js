const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema');

// Transfer Student to Another Class
const transferStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { toClassId, reason } = req.body;
        const transferredBy = req.user.id;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const fromClassId = student.sclassName;

        // Add to transfer history
        student.transferHistory.push({
            fromClass: fromClassId,
            toClass: toClassId,
            transferredBy,
            transferredAt: new Date(),
            reason: reason || 'Class transfer'
        });

        // Update current class
        student.sclassName = toClassId;

        await student.save();

        const updatedStudent = await Student.findById(studentId)
            .populate('sclassName', 'sclassName')
            .populate('transferHistory.fromClass', 'sclassName')
            .populate('transferHistory.toClass', 'sclassName')
            .populate('transferHistory.transferredBy', 'username');

        res.json({
            message: 'Student transferred successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Transfer student error:', error);
        res.status(500).json({ message: 'Error transferring student' });
    }
};

// Get Transfer History
const getTransferHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .populate('transferHistory.fromClass', 'sclassName')
            .populate('transferHistory.toClass', 'sclassName')
            .populate('transferHistory.transferredBy', 'username')
            .select('name studentId transferHistory');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            student: {
                name: student.name,
                studentId: student.studentId
            },
            transferHistory: student.transferHistory
        });
    } catch (error) {
        console.error('Get transfer history error:', error);
        res.status(500).json({ message: 'Error fetching transfer history' });
    }
};

// Update Special Needs Information
const updateSpecialNeeds = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { hasSpecialNeeds, category, accommodations, notes } = req.body;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.specialNeeds = {
            hasSpecialNeeds,
            category: hasSpecialNeeds ? category : 'none',
            accommodations: accommodations || [],
            notes: notes || ''
        };

        await student.save();

        res.json({
            message: 'Special needs information updated',
            student
        });
    } catch (error) {
        console.error('Update special needs error:', error);
        res.status(500).json({ message: 'Error updating special needs' });
    }
};

// Get Students with Special Needs
const getSpecialNeedsStudents = async (req, res) => {
    try {
        const { schoolId, classId, category } = req.query;

        const query = {
            school: schoolId,
            'specialNeeds.hasSpecialNeeds': true
        };

        if (classId) {
            query.sclassName = classId;
        }

        if (category) {
            query['specialNeeds.category'] = category;
        }

        const students = await Student.find(query)
            .populate('sclassName', 'sclassName')
            .select('name studentId rollNum specialNeeds sclassName')
            .sort({ 'sclassName': 1, rollNum: 1 });

        // Get statistics
        const stats = {
            total: students.length,
            byCategory: {}
        };

        students.forEach(student => {
            const cat = student.specialNeeds.category;
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
        });

        res.json({ students, stats });
    } catch (error) {
        console.error('Get special needs students error:', error);
        res.status(500).json({ message: 'Error fetching special needs students' });
    }
};

// Enhanced Student Registration with studentId
const registerStudentEnhanced = async (req, res) => {
    try {
        const {
            studentId,
            name,
            rollNum,
            password,
            sclassName,
            adminID,
            parentContact,
            specialNeeds
        } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [
                { studentId },
                { rollNum, school: adminID, sclassName }
            ]
        });

        if (existingStudent) {
            return res.status(400).json({
                message: existingStudent.studentId === studentId
                    ? 'Student ID already exists'
                    : 'Roll Number already exists in this class'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const student = new Student({
            studentId,
            name,
            rollNum,
            password: hashedPass,
            sclassName,
            school: adminID,
            parentContact: parentContact || {},
            specialNeeds: specialNeeds || {
                hasSpecialNeeds: false,
                category: 'none'
            },
            active: true
        });

        await student.save();

        const studentResponse = student.toObject();
        delete studentResponse.password;

        res.status(201).json({
            message: 'Student registered successfully',
            student: studentResponse
        });
    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({ message: 'Error registering student' });
    }
};

// Get Student Profile with Complete Information
const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .populate('school', 'schoolName')
            .populate('sclassName', 'sclassName')
            .populate('transferHistory.fromClass', 'sclassName')
            .populate('transferHistory.toClass', 'sclassName')
            .populate('transferHistory.transferredBy', 'username')
            .select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({ message: 'Error fetching student profile' });
    }
};

// Bulk Student Import
const bulkImportStudents = async (req, res) => {
    try {
        const { students } = req.body;

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const studentData of students) {
            try {
                const existingStudent = await Student.findOne({
                    $or: [
                        { studentId: studentData.studentId },
                        { 
                            rollNum: studentData.rollNum,
                            school: studentData.adminID,
                            sclassName: studentData.sclassName
                        }
                    ]
                });

                if (existingStudent) {
                    results.failed++;
                    results.errors.push({
                        studentId: studentData.studentId,
                        error: 'Student already exists'
                    });
                    continue;
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(studentData.password, salt);

                const student = new Student({
                    ...studentData,
                    school: studentData.adminID,
                    password: hashedPass,
                    active: true
                });

                await student.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    studentId: studentData.studentId,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Bulk import completed',
            results
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ message: 'Error during bulk import' });
    }
};

module.exports = {
    transferStudent,
    getTransferHistory,
    updateSpecialNeeds,
    getSpecialNeedsStudents,
    registerStudentEnhanced,
    getStudentProfile,
    bulkImportStudents
};

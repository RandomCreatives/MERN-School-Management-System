const Marksheet = require('../models/marksheetSchema');
const Student = require('../models/studentSchema');
const Subject = require('../models/subjectSchema');

// Create or Update Marksheet
const upsertMarksheet = async (req, res) => {
    try {
        const { studentId, subjectId, term, marks, maxMarks, classId } = req.body;
        const enteredBy = req.user.id;
        const schoolId = req.user.school;

        // Check if marksheet exists
        let marksheet = await Marksheet.findOne({
            student: studentId,
            subject: subjectId,
            term
        });

        if (marksheet) {
            // Update existing marksheet
            marksheet.marks = new Map(Object.entries(marks));
            marksheet.maxMarks = maxMarks || marksheet.maxMarks;
            marksheet.enteredBy = enteredBy;
            marksheet.lastUpdated = new Date();
        } else {
            // Create new marksheet
            marksheet = new Marksheet({
                student: studentId,
                subject: subjectId,
                term,
                marks: new Map(Object.entries(marks)),
                maxMarks: maxMarks || 100,
                enteredBy,
                class: classId,
                school: schoolId
            });
        }

        await marksheet.save();

        const populatedMarksheet = await Marksheet.findById(marksheet._id)
            .populate('student', 'name rollNum studentId')
            .populate('subject', 'subName subCode')
            .populate('enteredBy', 'username');

        res.status(200).json({
            message: 'Marksheet saved successfully',
            marksheet: populatedMarksheet
        });
    } catch (error) {
        console.error('Upsert marksheet error:', error);
        res.status(500).json({ message: 'Error saving marksheet' });
    }
};

// Get Marksheets by Class and Term
const getMarksheetsByClassAndTerm = async (req, res) => {
    try {
        const { classId, term, subjectId } = req.query;

        const query = {
            class: classId,
            term
        };

        if (subjectId) {
            query.subject = subjectId;
        }

        const marksheets = await Marksheet.find(query)
            .populate('student', 'name rollNum studentId')
            .populate('subject', 'subName subCode')
            .populate('enteredBy', 'username')
            .sort({ 'student.rollNum': 1 });

        res.json({ marksheets });
    } catch (error) {
        console.error('Get marksheets error:', error);
        res.status(500).json({ message: 'Error fetching marksheets' });
    }
};

// Get Student Marksheet
const getStudentMarksheet = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term, subjectId } = req.query;

        const query = { student: studentId };

        if (term) {
            query.term = term;
        }

        if (subjectId) {
            query.subject = subjectId;
        }

        const marksheets = await Marksheet.find(query)
            .populate('subject', 'subName subCode')
            .populate('enteredBy', 'username')
            .sort({ term: 1 });

        // Calculate overall statistics
        const stats = {
            totalSubjects: marksheets.length,
            averagePercentage: 0,
            overallGrade: ''
        };

        if (marksheets.length > 0) {
            const totalPercentage = marksheets.reduce((sum, m) => sum + m.percentage, 0);
            stats.averagePercentage = (totalPercentage / marksheets.length).toFixed(2);
            
            // Calculate overall grade
            const avgPercent = parseFloat(stats.averagePercentage);
            if (avgPercent >= 90) stats.overallGrade = 'A+';
            else if (avgPercent >= 80) stats.overallGrade = 'A';
            else if (avgPercent >= 70) stats.overallGrade = 'B+';
            else if (avgPercent >= 60) stats.overallGrade = 'B';
            else if (avgPercent >= 50) stats.overallGrade = 'C';
            else if (avgPercent >= 40) stats.overallGrade = 'D';
            else stats.overallGrade = 'F';
        }

        res.json({ marksheets, stats });
    } catch (error) {
        console.error('Get student marksheet error:', error);
        res.status(500).json({ message: 'Error fetching student marksheet' });
    }
};

// Get Academic Analytics
const getAcademicAnalytics = async (req, res) => {
    try {
        const { classId, term, subjectId, schoolId } = req.query;

        const matchQuery = {
            school: schoolId,
            term
        };

        if (classId) {
            matchQuery.class = classId;
        }

        if (subjectId) {
            matchQuery.subject = subjectId;
        }

        // Grade distribution
        const gradeDistribution = await Marksheet.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$grade',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Subject-wise average
        const subjectAverages = await Marksheet.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$subject',
                    averagePercentage: { $avg: '$percentage' },
                    averageTotal: { $avg: '$totalMarks' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $sort: { averagePercentage: -1 } }
        ]);

        // Class-wise performance
        const classPerformance = await Marksheet.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$class',
                    averagePercentage: { $avg: '$percentage' },
                    totalStudents: { $addToSet: '$student' }
                }
            },
            {
                $lookup: {
                    from: 'sclasses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    averagePercentage: 1,
                    studentCount: { $size: '$totalStudents' },
                    classInfo: 1
                }
            }
        ]);

        // Top performers
        const topPerformers = await Marksheet.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$student',
                    averagePercentage: { $avg: '$percentage' },
                    totalMarks: { $sum: '$totalMarks' }
                }
            },
            { $sort: { averagePercentage: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            }
        ]);

        res.json({
            gradeDistribution,
            subjectAverages,
            classPerformance,
            topPerformers
        });
    } catch (error) {
        console.error('Get academic analytics error:', error);
        res.status(500).json({ message: 'Error fetching academic analytics' });
    }
};

// Delete Marksheet
const deleteMarksheet = async (req, res) => {
    try {
        const { id } = req.params;

        const marksheet = await Marksheet.findByIdAndDelete(id);

        if (!marksheet) {
            return res.status(404).json({ message: 'Marksheet not found' });
        }

        res.json({ message: 'Marksheet deleted successfully' });
    } catch (error) {
        console.error('Delete marksheet error:', error);
        res.status(500).json({ message: 'Error deleting marksheet' });
    }
};

// Bulk Import Marksheets
const bulkImportMarksheets = async (req, res) => {
    try {
        const { marksheets } = req.body;
        const enteredBy = req.user.id;
        const schoolId = req.user.school;

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const data of marksheets) {
            try {
                const { studentId, subjectId, term, marks, maxMarks, classId } = data;

                let marksheet = await Marksheet.findOne({
                    student: studentId,
                    subject: subjectId,
                    term
                });

                if (marksheet) {
                    marksheet.marks = new Map(Object.entries(marks));
                    marksheet.maxMarks = maxMarks || marksheet.maxMarks;
                    marksheet.enteredBy = enteredBy;
                } else {
                    marksheet = new Marksheet({
                        student: studentId,
                        subject: subjectId,
                        term,
                        marks: new Map(Object.entries(marks)),
                        maxMarks: maxMarks || 100,
                        enteredBy,
                        class: classId,
                        school: schoolId
                    });
                }

                await marksheet.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    data,
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
    upsertMarksheet,
    getMarksheetsByClassAndTerm,
    getStudentMarksheet,
    getAcademicAnalytics,
    deleteMarksheet,
    bulkImportMarksheets
};

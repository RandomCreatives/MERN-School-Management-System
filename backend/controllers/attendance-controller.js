const Attendance = require('../models/attendanceSchema');
const Student = require('../models/studentSchema');
const Subject = require('../models/subjectSchema');

// Mark Attendance (Bulk or Single)
const markAttendance = async (req, res) => {
    try {
        const { attendanceRecords, date, classId, attendanceType, subjectId } = req.body;
        const markedBy = req.user.id;
        const schoolId = req.user.school;

        const attendanceData = [];

        for (const record of attendanceRecords) {
            const { studentId, status, reason } = record;

            // Check if attendance already exists
            const existingAttendance = await Attendance.findOne({
                student: studentId,
                date: new Date(date),
                class: classId,
                attendanceType,
                ...(subjectId && { subject: subjectId })
            });

            if (existingAttendance) {
                // Update existing attendance
                existingAttendance.status = status;
                existingAttendance.reason = reason || '';
                existingAttendance.markedBy = markedBy;
                await existingAttendance.save();
                attendanceData.push(existingAttendance);
            } else {
                // Create new attendance record
                const attendance = new Attendance({
                    student: studentId,
                    date: new Date(date),
                    status,
                    reason: reason || '',
                    markedBy,
                    subject: subjectId || null,
                    attendanceType,
                    class: classId,
                    school: schoolId
                });
                await attendance.save();
                attendanceData.push(attendance);
            }
        }

        res.status(201).json({
            message: 'Attendance marked successfully',
            count: attendanceData.length,
            attendance: attendanceData
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
};

// Get Attendance by Class and Date
const getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, date, attendanceType, subjectId } = req.query;

        const query = {
            class: classId,
            date: new Date(date),
            attendanceType
        };

        if (subjectId) {
            query.subject = subjectId;
        }

        const attendance = await Attendance.find(query)
            .populate('student', 'name rollNum studentId')
            .populate('markedBy', 'username')
            .populate('subject', 'subName')
            .sort({ 'student.rollNum': 1 });

        res.json({ attendance });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

// Get Student Attendance History
const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, subjectId } = req.query;

        const query = { student: studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (subjectId) {
            query.subject = subjectId;
        }

        const attendance = await Attendance.find(query)
            .populate('subject', 'subName')
            .populate('markedBy', 'username')
            .sort({ date: -1 });

        // Calculate statistics
        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'P').length,
            late: attendance.filter(a => a.status === 'L').length,
            absent: attendance.filter(a => a.status === 'A').length,
            absentWithPermission: attendance.filter(a => a.status === 'AP').length
        };

        stats.attendancePercentage = stats.total > 0 
            ? ((stats.present + stats.late) / stats.total * 100).toFixed(2)
            : 0;

        res.json({ attendance, stats });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({ message: 'Error fetching student attendance' });
    }
};

// Get Attendance Analytics
const getAttendanceAnalytics = async (req, res) => {
    try {
        const { classId, startDate, endDate, schoolId } = req.query;

        const matchQuery = {
            school: schoolId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (classId) {
            matchQuery.class = classId;
        }

        // Daily distribution
        const dailyStats = await Attendance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Class-wise comparison
        const classStats = await Attendance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        class: '$class',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'sclasses',
                    localField: '_id.class',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            }
        ]);

        // Absence reasons breakdown
        const reasonStats = await Attendance.aggregate([
            { 
                $match: { 
                    ...matchQuery,
                    status: { $in: ['A', 'AP'] },
                    reason: { $exists: true, $ne: '' }
                } 
            },
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            dailyStats,
            classStats,
            reasonStats
        });
    } catch (error) {
        console.error('Get attendance analytics error:', error);
        res.status(500).json({ message: 'Error fetching attendance analytics' });
    }
};

// Delete Attendance Record
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const attendance = await Attendance.findByIdAndDelete(id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ message: 'Error deleting attendance' });
    }
};

module.exports = {
    markAttendance,
    getAttendanceByClassAndDate,
    getStudentAttendance,
    getAttendanceAnalytics,
    deleteAttendance
};

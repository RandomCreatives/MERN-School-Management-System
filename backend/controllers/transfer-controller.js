const Student = require('../models/studentSchema');
const Attendance = require('../models/attendanceSchema');
const Marksheet = require('../models/marksheetSchema');
const Library = require('../models/librarySchema');
const Clinic = require('../models/clinicSchema');

// Transfer student with complete data migration
const transferStudentWithData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { toClassId, reason, transferDate, migrateData } = req.body;
        const transferredBy = req.user.id;

        const student = await Student.findById(studentId).populate('sclassName', 'sclassName');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const fromClassId = student.sclassName._id;
        const transferResults = { student: null, attendance: { updated: 0 }, marksheets: { updated: 0 }, library: { updated: 0 }, clinic: { updated: 0 } };

        student.transferHistory.push({ fromClass: fromClassId, toClass: toClassId, transferredBy, transferredAt: transferDate || new Date(), reason: reason || 'Class transfer' });
        student.sclassName = toClassId;
        await student.save();

        if (migrateData?.attendance !== false) {
            const result = await Attendance.updateMany({ student: studentId, class: fromClassId }, { $set: { class: toClassId } });
            transferResults.attendance.updated = result.modifiedCount;
        }
        if (migrateData?.marksheets !== false) {
            const result = await Marksheet.updateMany({ student: studentId, class: fromClassId }, { $set: { class: toClassId } });
            transferResults.marksheets.updated = result.modifiedCount;
        }
        if (migrateData?.library !== false) {
            const result = await Library.updateMany({ student: studentId, class: fromClassId }, { $set: { class: toClassId } });
            transferResults.library.updated = result.modifiedCount;
        }
        if (migrateData?.clinic !== false) {
            const result = await Clinic.updateMany({ student: studentId, class: fromClassId }, { $set: { class: toClassId } });
            transferResults.clinic.updated = result.modifiedCount;
        }

        const updatedStudent = await Student.findById(studentId).populate('sclassName', 'sclassName').populate('transferHistory.fromClass', 'sclassName').populate('transferHistory.toClass', 'sclassName').populate('transferHistory.transferredBy', 'username');

        res.json({ message: 'Student transferred successfully', student: updatedStudent, migratedRecords: { attendance: transferResults.attendance.updated, marksheets: transferResults.marksheets.updated, library: transferResults.library.updated, clinic: transferResults.clinic.updated } });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Error transferring student' });
    }
};

module.exports = { transferStudentWithData };

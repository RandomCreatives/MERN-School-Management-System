const Clinic = require('../models/clinicSchema');
const Student = require('../models/studentSchema');
const User = require('../models/userSchema');

// Record clinic visit
const recordClinicVisit = async (req, res) => {
    try {
        const {
            studentId,
            visitDate,
            visitTime,
            chiefComplaint,
            incidentType,
            incidentDetails,
            symptoms,
            vitalSigns,
            diagnosis,
            treatment,
            outcome,
            leaveRequest,
            parentNotification,
            followUp,
            classId,
            confidential
        } = req.body;

        const attendedBy = req.user.id;
        const schoolId = req.user.school;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create clinic record
        const clinicRecord = new Clinic({
            student: studentId,
            visitDate: visitDate || new Date(),
            visitTime,
            chiefComplaint,
            incidentType,
            incidentDetails,
            symptoms: symptoms || [],
            vitalSigns: vitalSigns || {},
            diagnosis,
            treatment,
            outcome,
            leaveRequest: leaveRequest || { required: false },
            parentNotification: parentNotification || { notified: false },
            followUp: followUp || { required: false },
            attendedBy,
            class: classId,
            school: schoolId,
            confidential: confidential || false
        });

        // Generate case report if leave is requested
        if (leaveRequest && leaveRequest.required) {
            clinicRecord.caseReport = clinicRecord.generateCaseReport();
        }

        await clinicRecord.save();

        const populatedRecord = await Clinic.findById(clinicRecord._id)
            .populate('student', 'name studentId rollNum parentContact')
            .populate('attendedBy', 'username')
            .populate('class', 'sclassName');

        res.status(201).json({
            message: 'Clinic visit recorded successfully',
            record: populatedRecord
        });
    } catch (error) {
        console.error('Record clinic visit error:', error);
        res.status(500).json({ message: 'Error recording clinic visit' });
    }
};

// Get student's clinic history
const getStudentClinicHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, incidentType } = req.query;

        const query = { student: studentId };

        if (startDate && endDate) {
            query.visitDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (incidentType) {
            query.incidentType = incidentType;
        }

        const records = await Clinic.find(query)
            .populate('attendedBy', 'username')
            .populate('leaveRequest.approvedBy', 'username')
            .sort({ visitDate: -1 });

        // Calculate statistics
        const stats = {
            totalVisits: records.length,
            byIncidentType: {},
            pendingLeaveRequests: records.filter(r => 
                r.leaveRequest.required && r.leaveRequest.status === 'pending'
            ).length,
            followUpRequired: records.filter(r => 
                r.followUp.required && !r.followUp.completed
            ).length
        };

        records.forEach(record => {
            stats.byIncidentType[record.incidentType] = 
                (stats.byIncidentType[record.incidentType] || 0) + 1;
        });

        res.json({ records, stats });
    } catch (error) {
        console.error('Get clinic history error:', error);
        res.status(500).json({ message: 'Error fetching clinic history' });
    }
};

// Get all clinic visits
const getAllClinicVisits = async (req, res) => {
    try {
        const { schoolId, classId, startDate, endDate, incidentType } = req.query;

        const query = { school: schoolId };

        if (classId) {
            query.class = classId;
        }

        if (startDate && endDate) {
            query.visitDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (incidentType) {
            query.incidentType = incidentType;
        }

        const records = await Clinic.find(query)
            .populate('student', 'name studentId rollNum')
            .populate('class', 'sclassName')
            .populate('attendedBy', 'username')
            .sort({ visitDate: -1 });

        res.json({ records, count: records.length });
    } catch (error) {
        console.error('Get clinic visits error:', error);
        res.status(500).json({ message: 'Error fetching clinic visits' });
    }
};

// Get pending leave requests
const getPendingLeaveRequests = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const records = await Clinic.find({
            school: schoolId,
            'leaveRequest.required': true,
            'leaveRequest.status': 'pending'
        })
            .populate('student', 'name studentId rollNum parentContact')
            .populate('class', 'sclassName')
            .populate('attendedBy', 'username')
            .sort({ visitDate: -1 });

        res.json({ records, count: records.length });
    } catch (error) {
        console.error('Get pending leave requests error:', error);
        res.status(500).json({ message: 'Error fetching leave requests' });
    }
};

// Approve/Reject leave request (Admin only)
const processLeaveRequest = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { status, adminNotes } = req.body;
        const approvedBy = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const record = await Clinic.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: 'Clinic record not found' });
        }

        if (!record.leaveRequest.required) {
            return res.status(400).json({ message: 'No leave request for this record' });
        }

        if (record.leaveRequest.status !== 'pending') {
            return res.status(400).json({ 
                message: `Leave request already ${record.leaveRequest.status}` 
            });
        }

        // Update leave request
        record.leaveRequest.status = status;
        record.leaveRequest.approvedBy = approvedBy;
        record.leaveRequest.approvalDate = new Date();
        record.leaveRequest.adminNotes = adminNotes;

        await record.save();

        const populatedRecord = await Clinic.findById(record._id)
            .populate('student', 'name studentId rollNum parentContact')
            .populate('attendedBy', 'username')
            .populate('leaveRequest.approvedBy', 'username')
            .populate('class', 'sclassName');

        res.json({
            message: `Leave request ${status}`,
            record: populatedRecord
        });
    } catch (error) {
        console.error('Process leave request error:', error);
        res.status(500).json({ message: 'Error processing leave request' });
    }
};

// Update follow-up status
const updateFollowUp = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { completed, notes } = req.body;

        const record = await Clinic.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: 'Clinic record not found' });
        }

        if (!record.followUp.required) {
            return res.status(400).json({ message: 'No follow-up required for this record' });
        }

        record.followUp.completed = completed;
        if (notes) {
            record.followUp.notes = (record.followUp.notes || '') + '\n' + notes;
        }

        await record.save();

        res.json({
            message: 'Follow-up updated successfully',
            record
        });
    } catch (error) {
        console.error('Update follow-up error:', error);
        res.status(500).json({ message: 'Error updating follow-up' });
    }
};

// Clinic analytics
const getClinicAnalytics = async (req, res) => {
    try {
        const { schoolId, startDate, endDate } = req.query;

        const matchQuery = {
            school: schoolId
        };

        if (startDate && endDate) {
            matchQuery.visitDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Total visits
        const totalVisits = await Clinic.countDocuments(matchQuery);

        // Visits by incident type
        const incidentTypeStats = await Clinic.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$incidentType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Visits by severity
        const severityStats = await Clinic.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$incidentDetails.severity',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Visits by outcome
        const outcomeStats = await Clinic.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$outcome',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Daily visit trends
        const dailyTrends = await Clinic.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Leave request statistics
        const leaveStats = {
            total: await Clinic.countDocuments({ 
                school: schoolId, 
                'leaveRequest.required': true 
            }),
            pending: await Clinic.countDocuments({ 
                school: schoolId, 
                'leaveRequest.status': 'pending' 
            }),
            approved: await Clinic.countDocuments({ 
                school: schoolId, 
                'leaveRequest.status': 'approved' 
            }),
            rejected: await Clinic.countDocuments({ 
                school: schoolId, 
                'leaveRequest.status': 'rejected' 
            })
        };

        // Most frequent visitors
        const frequentVisitors = await Clinic.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$student',
                    visitCount: { $sum: 1 }
                }
            },
            { $sort: { visitCount: -1 } },
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
            totalVisits,
            incidentTypeStats,
            severityStats,
            outcomeStats,
            dailyTrends,
            leaveStats,
            frequentVisitors
        });
    } catch (error) {
        console.error('Clinic analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

// Generate detailed case report
const generateCaseReport = async (req, res) => {
    try {
        const { recordId } = req.params;

        const record = await Clinic.findById(recordId)
            .populate('student', 'name studentId rollNum parentContact')
            .populate('class', 'sclassName')
            .populate('attendedBy', 'username')
            .populate('leaveRequest.approvedBy', 'username');

        if (!record) {
            return res.status(404).json({ message: 'Clinic record not found' });
        }

        const caseReport = `
DETAILED CLINIC CASE REPORT
===========================

STUDENT INFORMATION:
Name: ${record.student.name}
Student ID: ${record.student.studentId}
Roll Number: ${record.student.rollNum}
Class: ${record.class.sclassName}

PARENT/GUARDIAN CONTACT:
Phone: ${record.student.parentContact?.phone || 'N/A'}
Email: ${record.student.parentContact?.email || 'N/A'}
Emergency Contact: ${record.student.parentContact?.emergencyContact || 'N/A'}

VISIT DETAILS:
Date: ${record.visitDate.toLocaleDateString()}
Time: ${record.visitTime}
Attended By: ${record.attendedBy.username}

INCIDENT INFORMATION:
Type: ${record.incidentType.toUpperCase()}
Location: ${record.incidentDetails.location || 'N/A'}
Severity: ${record.incidentDetails.severity.toUpperCase()}
Witnesses: ${record.incidentDetails.witnesses?.join(', ') || 'None'}

Description:
${record.incidentDetails.description}

CHIEF COMPLAINT:
${record.chiefComplaint}

SYMPTOMS OBSERVED:
${record.symptoms.join(', ') || 'None recorded'}

VITAL SIGNS:
Temperature: ${record.vitalSigns.temperature || 'N/A'}°C
Blood Pressure: ${record.vitalSigns.bloodPressure || 'N/A'}
Heart Rate: ${record.vitalSigns.heartRate || 'N/A'} bpm
Respiratory Rate: ${record.vitalSigns.respiratoryRate || 'N/A'} breaths/min
Oxygen Saturation: ${record.vitalSigns.oxygenSaturation || 'N/A'}%

DIAGNOSIS:
${record.diagnosis}

TREATMENT PROVIDED:
${record.treatment.description}

${record.treatment.medications?.length > 0 ? `
Medications Administered:
${record.treatment.medications.map(med => 
    `- ${med.name} (${med.dosage}) - ${med.frequency} for ${med.duration}`
).join('\n')}
` : ''}

${record.treatment.procedures?.length > 0 ? `
Procedures Performed:
${record.treatment.procedures.map(proc => `- ${proc}`).join('\n')}
` : ''}

${record.treatment.firstAid?.length > 0 ? `
First Aid Provided:
${record.treatment.firstAid.map(aid => `- ${aid}`).join('\n')}
` : ''}

OUTCOME:
${record.outcome}

${record.parentNotification.notified ? `
PARENT NOTIFICATION:
Notified: Yes
Time: ${record.parentNotification.notificationTime?.toLocaleString() || 'N/A'}
Method: ${record.parentNotification.notificationMethod || 'N/A'}
Parent Response: ${record.parentNotification.parentResponse || 'N/A'}
` : 'Parent Notification: Not required'}

${record.leaveRequest.required ? `
LEAVE REQUEST:
Duration: ${record.leaveRequest.duration}
Reason: ${record.leaveRequest.reason}
Status: ${record.leaveRequest.status.toUpperCase()}
${record.leaveRequest.status !== 'pending' ? `
Approved/Rejected By: ${record.leaveRequest.approvedBy?.username || 'N/A'}
Date: ${record.leaveRequest.approvalDate?.toLocaleString() || 'N/A'}
Admin Notes: ${record.leaveRequest.adminNotes || 'None'}
` : ''}
` : 'Leave Request: Not required'}

${record.followUp.required ? `
FOLLOW-UP:
Required: Yes
Date: ${record.followUp.date?.toLocaleDateString() || 'To be scheduled'}
Status: ${record.followUp.completed ? 'Completed' : 'Pending'}
Notes: ${record.followUp.notes || 'None'}
` : 'Follow-up: Not required'}

CONFIDENTIALITY: ${record.confidential ? 'CONFIDENTIAL' : 'Standard'}

Report Generated: ${new Date().toLocaleString()}
Generated By: ${req.user.username}

---
This is an official medical record of British International School NOC - Gerji Campus
        `.trim();

        res.json({
            caseReport,
            record
        });
    } catch (error) {
        console.error('Generate case report error:', error);
        res.status(500).json({ message: 'Error generating case report' });
    }
};

module.exports = {
    recordClinicVisit,
    getStudentClinicHistory,
    getAllClinicVisits,
    getPendingLeaveRequests,
    processLeaveRequest,
    updateFollowUp,
    getClinicAnalytics,
    generateCaseReport
};

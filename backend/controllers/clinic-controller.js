const supabase = require('../supabaseClient');

const recordClinicVisit = async (req, res) => {
    try {
        const { studentId, visitDate, visitTime, chiefComplaint, incidentType, incidentDetails, symptoms, vitalSigns, diagnosis, treatment, outcome, leaveRequest, parentNotification, followUp, classId, confidential } = req.body;
        const attendedBy = req.user.id;
        const schoolId = req.user.school_id;

        const { data, error } = await supabase.from('clinic')
            .insert([{
                student_id: studentId,
                visit_date: visitDate || new Date().toISOString(),
                visit_time: visitTime,
                chief_complaint: chiefComplaint,
                incident_type: incidentType,
                incident_details: incidentDetails,
                symptoms: symptoms || [],
                vital_signs: vitalSigns || {},
                diagnosis,
                treatment,
                outcome,
                leave_request: leaveRequest || { required: false },
                parent_notification: parentNotification || { notified: false },
                follow_up: followUp || { required: false },
                attended_by: attendedBy,
                class_id: classId,
                school_id: schoolId,
                confidential: confidential || false
            }])
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.status(201).json({ message: 'Clinic visit recorded successfully', record: data });
    } catch (error) {
        res.status(500).json({ message: 'Error recording clinic visit' });
    }
};

const getStudentClinicHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, incidentType } = req.query;

        let query = supabase.from('clinic').select('*').eq('student_id', studentId).order('visit_date', { ascending: false });
        if (startDate) query = query.gte('visit_date', startDate);
        if (endDate) query = query.lte('visit_date', endDate);
        if (incidentType) query = query.eq('incident_type', incidentType);

        const { data: records, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        const stats = { totalVisits: records.length, byIncidentType: {}, pendingLeaveRequests: 0, followUpRequired: 0 };
        records.forEach(r => {
            stats.byIncidentType[r.incident_type] = (stats.byIncidentType[r.incident_type] || 0) + 1;
            if (r.leave_request?.required && r.leave_request?.status === 'pending') stats.pendingLeaveRequests++;
            if (r.follow_up?.required && !r.follow_up?.completed) stats.followUpRequired++;
        });

        res.json({ records, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clinic history' });
    }
};

const getAllClinicVisits = async (req, res) => {
    try {
        const { schoolId, classId, startDate, endDate, incidentType } = req.query;

        let query = supabase.from('clinic')
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .eq('school_id', schoolId).order('visit_date', { ascending: false });

        if (classId) query = query.eq('class_id', classId);
        if (startDate) query = query.gte('visit_date', startDate);
        if (endDate) query = query.lte('visit_date', endDate);
        if (incidentType) query = query.eq('incident_type', incidentType);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ records: data, count: data.length });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clinic visits' });
    }
};

const getPendingLeaveRequests = async (req, res) => {
    try {
        const { schoolId } = req.query;
        const { data, error } = await supabase.from('clinic')
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .eq('school_id', schoolId)
            .contains('leave_request', { required: true, status: 'pending' })
            .order('visit_date', { ascending: false });

        if (error) return res.status(500).json({ message: error.message });
        res.json({ records: data, count: data.length });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests' });
    }
};

const processLeaveRequest = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { status, adminNotes } = req.body;
        const approvedBy = req.user.id;

        if (!['approved', 'rejected'].includes(status))
            return res.status(400).json({ message: 'Invalid status' });

        const { data: record } = await supabase.from('clinic').select('leave_request').eq('id', recordId).single();
        if (!record) return res.status(404).json({ message: 'Clinic record not found' });
        if (!record.leave_request?.required) return res.status(400).json({ message: 'No leave request for this record' });
        if (record.leave_request?.status !== 'pending') return res.status(400).json({ message: `Leave request already ${record.leave_request.status}` });

        const updatedLeaveRequest = { ...record.leave_request, status, approved_by: approvedBy, approval_date: new Date().toISOString(), admin_notes: adminNotes };

        const { data, error } = await supabase.from('clinic')
            .update({ leave_request: updatedLeaveRequest })
            .eq('id', recordId).select(`*, students(name, student_id, roll_num)`).single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: `Leave request ${status}`, record: data });
    } catch (error) {
        res.status(500).json({ message: 'Error processing leave request' });
    }
};

const updateFollowUp = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { completed, notes } = req.body;

        const { data: record } = await supabase.from('clinic').select('follow_up').eq('id', recordId).single();
        if (!record) return res.status(404).json({ message: 'Clinic record not found' });

        const updatedFollowUp = { ...record.follow_up, completed, notes: (record.follow_up?.notes || '') + (notes ? '\n' + notes : '') };

        const { data, error } = await supabase.from('clinic')
            .update({ follow_up: updatedFollowUp }).eq('id', recordId).select().single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Follow-up updated successfully', record: data });
    } catch (error) {
        res.status(500).json({ message: 'Error updating follow-up' });
    }
};

const getClinicAnalytics = async (req, res) => {
    try {
        const { schoolId, startDate, endDate } = req.query;

        let query = supabase.from('clinic').select('incident_type, outcome, visit_date, leave_request, follow_up').eq('school_id', schoolId);
        if (startDate) query = query.gte('visit_date', startDate);
        if (endDate) query = query.lte('visit_date', endDate);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ totalVisits: data.length, records: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

const generateCaseReport = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { data: record, error } = await supabase.from('clinic')
            .select(`*, students(name, student_id, roll_num, parent_contact), sclasses(sclass_name)`)
            .eq('id', recordId).single();

        if (error || !record) return res.status(404).json({ message: 'Clinic record not found' });

        const caseReport = `CLINIC VISIT REPORT\n===================\nDate: ${record.visit_date}\nTime: ${record.visit_time}\nStudent: ${record.students?.name}\nClass: ${record.sclasses?.sclass_name}\n\nINCIDENT: ${record.incident_type}\nDiagnosis: ${record.diagnosis}\nOutcome: ${record.outcome}\n\nReport Generated: ${new Date().toLocaleString()}`;

        res.json({ caseReport, record });
    } catch (error) {
        res.status(500).json({ message: 'Error generating case report' });
    }
};

module.exports = { recordClinicVisit, getStudentClinicHistory, getAllClinicVisits, getPendingLeaveRequests, processLeaveRequest, updateFollowUp, getClinicAnalytics, generateCaseReport };

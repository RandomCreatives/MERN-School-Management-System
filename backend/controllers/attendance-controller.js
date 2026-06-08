const supabase = require('../supabaseClient');

const markAttendance = async (req, res) => {
    try {
        const { attendanceRecords, date, classId, attendanceType, subjectId } = req.body;
        const markedBy = req.user.id;
        const schoolId = req.user.school_id;

        const results = [];
        for (const record of attendanceRecords) {
            const { studentId, status, reason } = record;

            // Check if exists
            let query = supabase.from('attendance')
                .select('id')
                .eq('student_id', studentId)
                .eq('date', date)
                .eq('class_id', classId)
                .eq('attendance_type', attendanceType);
            if (subjectId) query = query.eq('subject_id', subjectId);

            const { data: existing } = await query.single();

            if (existing) {
                const { data } = await supabase.from('attendance')
                    .update({ status, reason: reason || '', marked_by: markedBy })
                    .eq('id', existing.id)
                    .select().single();
                results.push(data);
            } else {
                const { data } = await supabase.from('attendance')
                    .insert([{
                        student_id: studentId,
                        date,
                        status,
                        reason: reason || '',
                        marked_by: markedBy,
                        subject_id: subjectId || null,
                        attendance_type: attendanceType,
                        class_id: classId,
                        school_id: schoolId
                    }])
                    .select().single();
                results.push(data);
            }
        }

        res.status(201).json({ message: 'Attendance marked successfully', count: results.length, attendance: results });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
};

const getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, date, attendanceType, subjectId } = req.query;

        let query = supabase.from('attendance')
            .select(`*, students(name, roll_num, student_id), subjects(sub_name)`)
            .eq('class_id', classId)
            .eq('date', date)
            .eq('attendance_type', attendanceType);

        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ attendance: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, subjectId } = req.query;

        let query = supabase.from('attendance')
            .select(`*, subjects(sub_name)`)
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data: attendance, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'P').length,
            late: attendance.filter(a => a.status === 'L').length,
            absent: attendance.filter(a => a.status === 'A').length,
            absentWithPermission: attendance.filter(a => a.status === 'AP').length
        };
        stats.attendancePercentage = stats.total > 0
            ? (((stats.present + stats.late) / stats.total) * 100).toFixed(2) : 0;

        res.json({ attendance, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student attendance' });
    }
};

const getAttendanceAnalytics = async (req, res) => {
    try {
        const { classId, startDate, endDate, schoolId } = req.query;

        let query = supabase.from('attendance')
            .select('date, status, class_id')
            .eq('school_id', schoolId);

        if (classId) query = query.eq('class_id', classId);
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ attendance: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance analytics' });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase.from('attendance')
            .delete().eq('id', req.params.id).select().single();

        if (error) return res.status(404).json({ message: 'Attendance record not found' });
        res.json({ message: 'Attendance record deleted successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attendance' });
    }
};

module.exports = { markAttendance, getAttendanceByClassAndDate, getStudentAttendance, getAttendanceAnalytics, deleteAttendance };

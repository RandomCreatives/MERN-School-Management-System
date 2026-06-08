const supabase = require('../supabaseClient');

const transferStudentWithData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { toClassId, reason, transferDate, migrateData } = req.body;
        const transferredBy = req.user.id;

        const { data: student } = await supabase.from('students')
            .select('sclass_id, transfer_history, name').eq('id', studentId).single();

        if (!student) return res.status(404).json({ message: 'Student not found' });

        const fromClassId = student.sclass_id;
        const transferHistory = [...(student.transfer_history || []), {
            fromClass: fromClassId,
            toClass: toClassId,
            transferredBy,
            transferredAt: transferDate || new Date().toISOString(),
            reason: reason || 'Class transfer'
        }];

        await supabase.from('students').update({ sclass_id: toClassId, transfer_history: transferHistory }).eq('id', studentId);

        const results = { attendance: 0, marksheets: 0, library: 0, clinic: 0 };

        if (migrateData?.attendance !== false) {
            const { data } = await supabase.from('attendance').update({ class_id: toClassId }).eq('student_id', studentId).eq('class_id', fromClassId).select();
            results.attendance = data?.length || 0;
        }
        if (migrateData?.marksheets !== false) {
            const { data } = await supabase.from('marksheets').update({ class_id: toClassId }).eq('student_id', studentId).eq('class_id', fromClassId).select();
            results.marksheets = data?.length || 0;
        }
        if (migrateData?.library !== false) {
            const { data } = await supabase.from('library').update({ class_id: toClassId }).eq('student_id', studentId).eq('class_id', fromClassId).select();
            results.library = data?.length || 0;
        }
        if (migrateData?.clinic !== false) {
            const { data } = await supabase.from('clinic').update({ class_id: toClassId }).eq('student_id', studentId).eq('class_id', fromClassId).select();
            results.clinic = data?.length || 0;
        }

        const { data: updatedStudent } = await supabase.from('students')
            .select(`*, sclasses(sclass_name)`).eq('id', studentId).single();

        res.json({ message: 'Student transferred successfully', student: updatedStudent, migratedRecords: results });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Error transferring student' });
    }
};

module.exports = { transferStudentWithData };

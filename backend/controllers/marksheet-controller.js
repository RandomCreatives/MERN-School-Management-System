const supabase = require('../supabaseClient');

const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

const upsertMarksheet = async (req, res) => {
    try {
        const { studentId, subjectId, term, marks, maxMarks, classId } = req.body;
        const enteredBy = req.user.id;
        const schoolId = req.user.school_id;

        const totalMarks = Object.values(marks).reduce((sum, v) => sum + v, 0);
        const max = maxMarks || 100;
        const percentage = (totalMarks / max) * 100;
        const grade = calculateGrade(percentage);

        const { data: existing } = await supabase.from('marksheets')
            .select('id').eq('student_id', studentId).eq('subject_id', subjectId).eq('term', term).single();

        let data, error;
        if (existing) {
            ({ data, error } = await supabase.from('marksheets')
                .update({ marks, total_marks: totalMarks, max_marks: max, percentage, grade, entered_by: enteredBy, last_updated: new Date().toISOString() })
                .eq('id', existing.id)
                .select(`*, students(name, roll_num, student_id), subjects(sub_name, sub_code)`)
                .single());
        } else {
            ({ data, error } = await supabase.from('marksheets')
                .insert([{ student_id: studentId, subject_id: subjectId, term, marks, total_marks: totalMarks, max_marks: max, percentage, grade, entered_by: enteredBy, class_id: classId, school_id: schoolId }])
                .select(`*, students(name, roll_num, student_id), subjects(sub_name, sub_code)`)
                .single());
        }

        if (error) return res.status(500).json({ message: error.message });
        res.status(200).json({ message: 'Marksheet saved successfully', marksheet: data });
    } catch (error) {
        res.status(500).json({ message: 'Error saving marksheet' });
    }
};

const getMarksheetsByClassAndTerm = async (req, res) => {
    try {
        const { classId, term, subjectId } = req.query;

        let query = supabase.from('marksheets')
            .select(`*, students(name, roll_num, student_id), subjects(sub_name, sub_code)`)
            .eq('class_id', classId).eq('term', term);

        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ marksheets: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marksheets' });
    }
};

const getStudentMarksheet = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term, subjectId } = req.query;

        let query = supabase.from('marksheets')
            .select(`*, subjects(sub_name, sub_code)`)
            .eq('student_id', studentId);

        if (term) query = query.eq('term', term);
        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data: marksheets, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        const stats = { totalSubjects: marksheets.length, averagePercentage: 0, overallGrade: '' };
        if (marksheets.length > 0) {
            const avg = marksheets.reduce((s, m) => s + m.percentage, 0) / marksheets.length;
            stats.averagePercentage = avg.toFixed(2);
            stats.overallGrade = calculateGrade(avg);
        }

        res.json({ marksheets, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student marksheet' });
    }
};

const getAcademicAnalytics = async (req, res) => {
    try {
        const { classId, term, subjectId, schoolId } = req.query;

        let query = supabase.from('marksheets').select('grade, percentage, subject_id, class_id, student_id').eq('school_id', schoolId).eq('term', term);
        if (classId) query = query.eq('class_id', classId);
        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ marksheets: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching academic analytics' });
    }
};

const deleteMarksheet = async (req, res) => {
    try {
        const { data, error } = await supabase.from('marksheets').delete().eq('id', req.params.id).select().single();
        if (error) return res.status(404).json({ message: 'Marksheet not found' });
        res.json({ message: 'Marksheet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting marksheet' });
    }
};

const bulkImportMarksheets = async (req, res) => {
    try {
        const { marksheets } = req.body;
        const enteredBy = req.user.id;
        const schoolId = req.user.school_id;
        const results = { success: 0, failed: 0, errors: [] };

        for (const d of marksheets) {
            try {
                const totalMarks = Object.values(d.marks).reduce((s, v) => s + v, 0);
                const max = d.maxMarks || 100;
                const percentage = (totalMarks / max) * 100;
                const grade = calculateGrade(percentage);

                const { data: existing } = await supabase.from('marksheets')
                    .select('id').eq('student_id', d.studentId).eq('subject_id', d.subjectId).eq('term', d.term).single();

                if (existing) {
                    await supabase.from('marksheets').update({ marks: d.marks, total_marks: totalMarks, max_marks: max, percentage, grade, entered_by: enteredBy }).eq('id', existing.id);
                } else {
                    await supabase.from('marksheets').insert([{ student_id: d.studentId, subject_id: d.subjectId, term: d.term, marks: d.marks, total_marks: totalMarks, max_marks: max, percentage, grade, entered_by: enteredBy, class_id: d.classId, school_id: schoolId }]);
                }
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ data: d, error: err.message });
            }
        }

        res.json({ message: 'Bulk import completed', results });
    } catch (error) {
        res.status(500).json({ message: 'Error during bulk import' });
    }
};

module.exports = { upsertMarksheet, getMarksheetsByClassAndTerm, getStudentMarksheet, getAcademicAnalytics, deleteMarksheet, bulkImportMarksheets };

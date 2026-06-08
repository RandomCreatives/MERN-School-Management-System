const bcrypt = require('bcrypt');
const supabase = require('../supabaseClient');

const transferStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { toClassId, reason } = req.body;
        const transferredBy = req.user.id;

        const { data: student } = await supabase.from('students').select('sclass_id, transfer_history').eq('id', studentId).single();
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const transferHistory = [...(student.transfer_history || []), {
            fromClass: student.sclass_id,
            toClass: toClassId,
            transferredBy,
            transferredAt: new Date().toISOString(),
            reason: reason || 'Class transfer'
        }];

        const { data, error } = await supabase.from('students')
            .update({ sclass_id: toClassId, transfer_history: transferHistory })
            .eq('id', studentId)
            .select(`*, sclasses(sclass_name)`)
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Student transferred successfully', student: data });
    } catch (error) {
        res.status(500).json({ message: 'Error transferring student' });
    }
};

const getTransferHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { data: student, error } = await supabase.from('students')
            .select('name, student_id, transfer_history')
            .eq('id', studentId)
            .single();

        if (error || !student) return res.status(404).json({ message: 'Student not found' });

        res.json({ student: { name: student.name, studentId: student.student_id }, transferHistory: student.transfer_history || [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transfer history' });
    }
};

const updateSpecialNeeds = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { hasSpecialNeeds, category, accommodations, notes } = req.body;

        const specialNeeds = {
            hasSpecialNeeds,
            category: hasSpecialNeeds ? category : 'none',
            accommodations: accommodations || [],
            notes: notes || ''
        };

        const { data, error } = await supabase.from('students')
            .update({ special_needs: specialNeeds })
            .eq('id', studentId)
            .select().single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Special needs information updated', student: data });
    } catch (error) {
        res.status(500).json({ message: 'Error updating special needs' });
    }
};

const getSpecialNeedsStudents = async (req, res) => {
    try {
        const { schoolId, classId, category } = req.query;

        let query = supabase.from('students')
            .select('name, student_id, roll_num, special_needs, sclasses(sclass_name)')
            .eq('school_id', schoolId)
            .eq('special_needs->>hasSpecialNeeds', 'true');

        if (classId) query = query.eq('sclass_id', classId);

        const { data: students, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        const stats = { total: students.length, byCategory: {} };
        students.forEach(s => {
            const cat = s.special_needs?.category;
            if (cat) stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
        });

        res.json({ students, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching special needs students' });
    }
};

const registerStudentEnhanced = async (req, res) => {
    try {
        const { studentId, name, rollNum, password, sclassName, adminID, parentContact, specialNeeds } = req.body;

        const { data: existing } = await supabase.from('students').select('id')
            .or(`student_id.eq.${studentId},and(roll_num.eq.${rollNum},school_id.eq.${adminID},sclass_id.eq.${sclassName})`)
            .limit(1);

        if (existing && existing.length > 0) {
            return res.status(400).json({ message: 'Student ID or Roll Number already exists in this class' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const { data, error } = await supabase.from('students')
            .insert([{
                student_id: studentId,
                name,
                roll_num: rollNum,
                password: hashedPass,
                sclass_id: sclassName,
                school_id: adminID,
                parent_contact: parentContact || {},
                special_needs: specialNeeds || { hasSpecialNeeds: false, category: 'none' },
                active: true,
                role: 'Student'
            }])
            .select().single();

        if (error) return res.status(500).json({ message: error.message });
        res.status(201).json({ message: 'Student registered successfully', student: { ...data, password: undefined } });
    } catch (error) {
        res.status(500).json({ message: 'Error registering student' });
    }
};

const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { data: student, error } = await supabase.from('students')
            .select(`*, sclasses(sclass_name), admins(school_name)`)
            .eq('id', studentId)
            .single();

        if (error || !student) return res.status(404).json({ message: 'Student not found' });
        res.json({ student: { ...student, password: undefined } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student profile' });
    }
};

const bulkImportStudents = async (req, res) => {
    try {
        const { students } = req.body;
        const results = { success: 0, failed: 0, errors: [] };

        for (const studentData of students) {
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(studentData.password, salt);

                const { error } = await supabase.from('students').insert([{
                    ...studentData,
                    school_id: studentData.adminID,
                    sclass_id: studentData.sclassName,
                    password: hashedPass,
                    active: true,
                    role: 'Student'
                }]);

                if (error) { results.failed++; results.errors.push({ studentId: studentData.studentId, error: error.message }); }
                else results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ studentId: studentData.studentId, error: err.message });
            }
        }

        res.json({ message: 'Bulk import completed', results });
    } catch (error) {
        res.status(500).json({ message: 'Error during bulk import' });
    }
};

module.exports = { transferStudent, getTransferHistory, updateSpecialNeeds, getSpecialNeedsStudents, registerStudentEnhanced, getStudentProfile, bulkImportStudents };

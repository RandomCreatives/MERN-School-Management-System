const bcrypt = require('bcrypt');
const supabase = require('../supabaseClient');

const studentRegister = async (req, res) => {
    try {
        console.log('📝 Student registration request:', req.body.name);

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const { data: existing } = await supabase
            .from('students')
            .select('id')
            .eq('roll_num', req.body.rollNum)
            .eq('school_id', req.body.adminID)
            .eq('sclass_id', req.body.sclassName)
            .single();

        if (existing) {
            return res.send({ message: 'Roll Number already exists' });
        }

        const studentId = req.body.studentId ||
            `BIS${new Date().getFullYear()}${String(req.body.rollNum).padStart(4, '0')}`;

        const { data: student, error } = await supabase
            .from('students')
            .insert([{
                student_id: studentId,
                name: req.body.name,
                roll_num: req.body.rollNum,
                password: hashedPass,
                sclass_id: req.body.sclassName,
                school_id: req.body.adminID,
                role: 'Student',
                active: true
            }])
            .select(`*, sclasses(sclass_name), admins(school_name)`)
            .single();

        if (error) {
            console.error('❌ Student registration error:', error);
            return res.status(500).json({ message: error.message });
        }

        console.log('✅ Student registered successfully:', student.name);
        res.send({ ...student, password: undefined });
    } catch (err) {
        console.error('❌ Student registration error:', err);
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        console.log('🔐 Student login attempt:', req.body);

        let query = supabase
            .from('students')
            .select(`*, sclasses(sclass_name), admins(school_name)`);

        if (req.body.studentId) {
            query = query.eq('student_id', req.body.studentId);
        } else if (req.body.rollNum) {
            query = query.eq('roll_num', parseInt(req.body.rollNum));
        } else {
            return res.send({ message: 'Student not found' });
        }

        const { data: students, error } = await query.limit(1);

        if (error || !students || students.length === 0) {
            return res.send({ message: 'Student not found' });
        }

        const student = students[0];
        const validated = await bcrypt.compare(req.body.password, student.password);

        if (!validated) {
            return res.send({ message: 'Invalid password' });
        }

        res.send({ ...student, password: undefined, exam_result: undefined, attendance: undefined });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json(err);
    }
};

const getAllStudents = async (req, res) => {
    try {
        console.log('📚 Fetching all students...');
        const { data: students, error } = await supabase
            .from('students')
            .select(`*, sclasses(sclass_name)`);

        if (error) return res.status(500).json({ message: error.message });

        if (!students || students.length === 0) {
            return res.send({ message: 'No students found' });
        }

        console.log(`✅ Found ${students.length} students`);
        res.send(students.map(s => ({ ...s, password: undefined })));
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select(`*, sclasses(sclass_name)`)
            .eq('school_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });

        if (!students || students.length === 0) {
            return res.send({ message: 'No students found' });
        }

        res.send(students.map(s => ({ ...s, password: undefined })));
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select(`*, sclasses(sclass_name), admins(school_name)`)
            .eq('id', req.params.id)
            .single();

        if (error || !student) {
            return res.send({ message: 'No student found' });
        }

        res.send({ ...student, password: undefined });
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('school_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) {
            return res.send({ message: 'No students found to delete' });
        }
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('sclass_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) {
            return res.send({ message: 'No students found to delete' });
        }
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        const { data, error } = await supabase
            .from('students')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send({ ...data, password: undefined });
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;
    try {
        // Get existing exam results
        const { data: student } = await supabase
            .from('students')
            .select('exam_result')
            .eq('id', req.params.id)
            .single();

        if (!student) return res.send({ message: 'Student not found' });

        let examResult = student.exam_result || [];
        const existingIndex = examResult.findIndex(r => r.subName === subName);

        if (existingIndex >= 0) {
            examResult[existingIndex].marksObtained = marksObtained;
        } else {
            examResult.push({ subName, marksObtained });
        }

        const { data, error } = await supabase
            .from('students')
            .update({ exam_result: examResult })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('attendance')
            .eq('id', req.params.id)
            .single();

        if (!student) return res.send({ message: 'Student not found' });

        let attendance = student.attendance || [];
        const existingIndex = attendance.findIndex(
            a => new Date(a.date).toDateString() === new Date(date).toDateString() &&
                a.subName === subName
        );

        if (existingIndex >= 0) {
            attendance[existingIndex].status = status;
        } else {
            attendance.push({ date, status, subName });
        }

        const { data, error } = await supabase
            .from('students')
            .update({ attendance })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;
    try {
        const { data: students } = await supabase
            .from('students')
            .select('id, attendance');

        for (const student of students || []) {
            const filtered = (student.attendance || []).filter(a => a.subName !== subName);
            await supabase.from('students').update({ attendance: filtered }).eq('id', student.id);
        }

        res.send({ message: 'Attendance cleared for subject' });
    } catch (err) {
        res.status(500).json(err);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .update({ attendance: [] })
            .eq('school_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subId = req.body.subId;
    try {
        const { data: student } = await supabase
            .from('students')
            .select('attendance')
            .eq('id', studentId)
            .single();

        const filtered = (student?.attendance || []).filter(a => a.subName !== subId);

        const { data, error } = await supabase
            .from('students')
            .update({ attendance: filtered })
            .eq('id', studentId)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const removeStudentAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .update({ attendance: [] })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getAllStudents,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};

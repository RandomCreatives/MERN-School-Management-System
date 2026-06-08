const bcrypt = require('bcrypt');
const supabase = require('../supabaseClient');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass, teacherType, teacherId } = req.body;
    try {
        console.log('📝 Teacher registration request:', email);

        const { data: existing } = await supabase
            .from('teachers')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.send({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        let generatedTeacherId = teacherId;
        if (!generatedTeacherId) {
            const { count } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
            generatedTeacherId = `TCH${String((count || 0) + 1).padStart(3, '0')}`;
        }

        const { data: teacher, error } = await supabase
            .from('teachers')
            .insert([{
                name,
                email,
                teacher_id: generatedTeacherId,
                password: hashedPass,
                role: role || 'Teacher',
                school_id: school,
                teach_subject_id: teachSubject,
                teach_sclass_id: teachSclass,
                teacher_type: teacherType || 'main_teacher',
                homeroom_class_id: teacherType === 'main_teacher' ? teachSclass : null,
                primary_subject_id: teacherType === 'subject_teacher' ? teachSubject : null
            }])
            .select(`*, subjects(sub_name), sclasses(sclass_name), admins(school_name)`)
            .single();

        if (error) {
            console.error('❌ Teacher registration error:', error);
            return res.status(500).json({ message: error.message });
        }

        // Update subject with teacher reference
        if (teachSubject) {
            await supabase.from('subjects').update({ teacher_id: teacher.id }).eq('id', teachSubject);
        }

        console.log('✅ Teacher registered successfully:', teacher.email);
        res.send({ ...teacher, password: undefined });
    } catch (err) {
        console.error('❌ Teacher registration error:', err);
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        const loginField = req.body.email || req.body.teacherId;
        const password = req.body.password;

        if (!loginField || !password) {
            return res.send({ message: 'Credentials are required' });
        }

        // Try email first, then teacher_id
        let teacher = null;

        const { data: byEmail } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', loginField)
            .limit(1);

        if (byEmail && byEmail.length > 0) {
            teacher = byEmail[0];
        } else {
            const { data: byId } = await supabase
                .from('teachers')
                .select('*')
                .eq('teacher_id', loginField)
                .limit(1);

            if (byId && byId.length > 0) {
                teacher = byId[0];
            }
        }

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const validated = await bcrypt.compare(password, teacher.password);
        if (!validated) {
            return res.send({ message: 'Invalid password' });
        }

        // Fetch related data separately if needed
        const result = { ...teacher, password: undefined };
        res.send(result);
    } catch (err) {
        console.error('Teacher login error:', err);
        res.status(500).json({ message: err.message });
    }
};

const getTeachers = async (req, res) => {
    try {
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select(`*, subjects(sub_name), sclasses(sclass_name)`)
            .eq('school_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });
        if (!teachers || teachers.length === 0) return res.send({ message: 'No teachers found' });

        res.send(teachers.map(t => ({ ...t, password: undefined })));
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAllTeachers = async (req, res) => {
    try {
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select(`*, subjects(sub_name), sclasses(sclass_name)`);

        if (error) return res.status(500).json({ message: error.message });
        if (!teachers || teachers.length === 0) return res.send({ message: 'No teachers found' });

        res.send(teachers.map(t => ({ ...t, password: undefined })));
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        const { data: teacher, error } = await supabase
            .from('teachers')
            .select(`*, subjects(sub_name, sessions), sclasses(sclass_name), admins(school_name)`)
            .eq('id', req.params.id)
            .single();

        if (error || !teacher) return res.send({ message: 'No teacher found' });

        res.send({ ...teacher, password: undefined });
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const { data: teacher, error } = await supabase
            .from('teachers')
            .update({ teach_subject_id: teachSubject })
            .eq('id', teacherId)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });

        await supabase.from('subjects').update({ teacher_id: teacher.id }).eq('id', teachSubject);

        res.send(teacher);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { data: teacher } = await supabase.from('teachers').select('teach_subject_id').eq('id', req.params.id).single();

        const { data, error } = await supabase.from('teachers').delete().eq('id', req.params.id).select().single();

        if (error) return res.status(500).json({ message: error.message });

        if (teacher?.teach_subject_id) {
            await supabase.from('subjects').update({ teacher_id: null }).eq('id', teacher.teach_subject_id);
        }

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('school_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No teachers found to delete' });

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .delete()
            .eq('teach_sclass_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No teachers found to delete' });

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;
    try {
        const { data: teacher } = await supabase
            .from('teachers')
            .select('attendance')
            .eq('id', req.params.id)
            .single();

        if (!teacher) return res.send({ message: 'Teacher not found' });

        let attendance = teacher.attendance || [];
        const existingIndex = attendance.findIndex(
            a => new Date(a.date).toDateString() === new Date(date).toDateString()
        );

        if (existingIndex >= 0) {
            attendance[existingIndex].status = status;
        } else {
            attendance.push({ date, status });
        }

        const { data, error } = await supabase
            .from('teachers')
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

const updateTeacher = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teachers')
            .update(req.body)
            .eq('id', req.params.id)
            .select(`*, sclasses(sclass_name), subjects(sub_name, sub_code)`)
            .single();

        if (error) return res.status(404).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getAllTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    updateTeacher,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};

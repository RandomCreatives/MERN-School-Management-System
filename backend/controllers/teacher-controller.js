const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass, teacherType, teacherId } = req.body;
    try {
        console.log('📝 Teacher registration request:', email);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            console.log('❌ Email already exists');
            return res.send({ message: 'Email already exists' });
        }

        // Generate teacherId if not provided
        let generatedTeacherId = teacherId;
        if (!generatedTeacherId) {
            const teacherCount = await Teacher.countDocuments();
            generatedTeacherId = `TCH${String(teacherCount + 1).padStart(3, '0')}`;
        }

        // Create teacher with both old and new schema fields for backward compatibility
        const teacherData = {
            name,
            email,
            teacherId: generatedTeacherId,
            password: hashedPass,
            role,
            school,
            teachSubject, // Legacy field
            teachSclass, // Legacy field
            teacherType: teacherType || 'main_teacher' // Default to main_teacher
        };

        // Add new schema fields based on teacher type
        if (teacherType === 'main_teacher') {
            teacherData.homeroomClass = teachSclass;
            teacherData.teachSubjects = teachSubject ? [{ subject: teachSubject, classes: [teachSclass] }] : [];
        } else if (teacherType === 'subject_teacher') {
            teacherData.primarySubject = teachSubject;
            teacherData.teachClasses = [teachSclass];
        }

        const teacher = new Teacher(teacherData);
        
        console.log('💾 Saving teacher to database...');
        let result = await teacher.save();
        
        // Update subject with teacher reference
        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
        }
        
        result.password = undefined;
        console.log('✅ Teacher registered successfully:', result.email);
        res.send(result);
    } catch (err) {
        console.error('❌ Teacher registration error:', err);
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        // Support login with either email or teacherId
        const loginField = req.body.email || req.body.teacherId;
        let teacher = await Teacher.findOne({ 
            $or: [
                { email: loginField },
                { teacherId: loginField }
            ]
        });
        
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAllTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find()
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName")
            .select('-password');
        
        if (teachers.length > 0) {
            res.send(teachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const updateData = req.body;
        
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateData,
            { new: true }
        ).populate('homeroomClass', 'sclassName')
         .populate('primarySubject', 'subName subCode')
         .populate('teachClasses', 'sclassName')
         .populate('teachSubjects.subject', 'subName subCode')
         .populate('teachSubjects.classes', 'sclassName');

        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.send(updatedTeacher);
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json(error);
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
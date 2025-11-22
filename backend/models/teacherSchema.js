const mongoose = require("mongoose")

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    teacherId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Teacher"
    },
    teacherType: {
        type: String,
        enum: ['main_teacher', 'subject_teacher', 'assistant_teacher', 'special_needs_teacher'],
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    // Main teachers: homeroom class they manage
    homeroomClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    },
    // Multiple subjects a teacher can teach (for main teachers teaching 4 subjects)
    teachSubjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        },
        classes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass'
        }]
    }],
    // For subject teachers who teach across all classes
    primarySubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    },
    // All classes this teacher teaches (for subject teachers)
    teachClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    // For special needs teachers
    specialization: {
        type: String,
        enum: ['learning', 'physical', 'behavioral', 'medical', 'general']
    },
    assignedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        presentCount: {
            type: String,
        },
        absentCount: {
            type: String,
        }
    }],
    // Legacy fields for backward compatibility
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    },
    teachSclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
    }
}, { timestamps: true });

// Index for efficient queries
teacherSchema.index({ school: 1, teacherType: 1 });
teacherSchema.index({ homeroomClass: 1 });
teacherSchema.index({ primarySubject: 1 });

module.exports = mongoose.model("teacher", teacherSchema)
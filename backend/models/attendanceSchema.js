const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['P', 'L', 'A', 'AP'], // Present, Late, Absent, Absent with Permission
        required: true
    },
    reason: {
        type: String,
        required: function() {
            return ['A', 'AP'].includes(this.status);
        }
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    },
    attendanceType: {
        type: String,
        enum: ['homeroom', 'subject'],
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

// Compound index for efficient queries
attendanceSchema.index({ student: 1, date: 1, subject: 1 });
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ date: 1, school: 1 });

module.exports = mongoose.model('attendance', attendanceSchema);

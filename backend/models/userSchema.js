const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'main_teacher', 'assistant_teacher', 'subject_teacher'],
        required: true
    },
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    assignedSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);

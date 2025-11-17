const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        unique: true,
        required: false // Made optional for backward compatibility
    },
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    parentContact: {
        phone: String,
        email: String,
        emergencyContact: String
    },
    specialNeeds: {
        hasSpecialNeeds: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ['learning', 'physical', 'behavioral', 'medical', 'other', 'none']
        },
        accommodations: [String],
        notes: String
    },
    transferHistory: [{
        fromClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass'
        },
        toClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass'
        },
        transferredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        transferredAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }],
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("student", studentSchema);
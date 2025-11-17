const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    visitDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    visitTime: {
        type: String,
        required: true
    },
    chiefComplaint: {
        type: String,
        required: true
    },
    incidentType: {
        type: String,
        enum: [
            'illness',
            'injury',
            'accident',
            'emergency',
            'routine_checkup',
            'medication',
            'first_aid',
            'other'
        ],
        required: true
    },
    incidentDetails: {
        location: String, // Where the incident occurred
        description: {
            type: String,
            required: true
        },
        witnesses: [String], // Names of witnesses
        severity: {
            type: String,
            enum: ['minor', 'moderate', 'severe', 'critical'],
            default: 'minor'
        }
    },
    symptoms: [String],
    vitalSigns: {
        temperature: Number, // in Celsius
        bloodPressure: String, // e.g., "120/80"
        heartRate: Number, // beats per minute
        respiratoryRate: Number, // breaths per minute
        oxygenSaturation: Number // percentage
    },
    diagnosis: {
        type: String,
        required: true
    },
    treatment: {
        description: {
            type: String,
            required: true
        },
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String
        }],
        procedures: [String],
        firstAid: [String]
    },
    outcome: {
        type: String,
        enum: [
            'returned_to_class',
            'sent_home',
            'referred_to_hospital',
            'parent_contacted',
            'observation_required',
            'follow_up_needed'
        ],
        required: true
    },
    leaveRequest: {
        required: {
            type: Boolean,
            default: false
        },
        duration: String, // e.g., "rest of day", "2 days", "1 week"
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        approvalDate: Date,
        adminNotes: String
    },
    parentNotification: {
        notified: {
            type: Boolean,
            default: false
        },
        notificationTime: Date,
        notificationMethod: {
            type: String,
            enum: ['phone', 'email', 'sms', 'in_person']
        },
        parentResponse: String
    },
    followUp: {
        required: {
            type: Boolean,
            default: false
        },
        date: Date,
        notes: String,
        completed: {
            type: Boolean,
            default: false
        }
    },
    attachments: [{
        type: String, // URLs or file paths
        description: String
    }],
    attendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
    },
    caseReport: {
        type: String // Detailed case report for admin
    },
    confidential: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for efficient queries
clinicSchema.index({ student: 1, visitDate: -1 });
clinicSchema.index({ school: 1, visitDate: -1 });
clinicSchema.index({ 'leaveRequest.status': 1 });
clinicSchema.index({ incidentType: 1, visitDate: -1 });

// Method to generate case report
clinicSchema.methods.generateCaseReport = function() {
    return `
CLINIC VISIT REPORT
==================
Date: ${this.visitDate.toLocaleDateString()}
Time: ${this.visitTime}
Student: [Student Name]
Class: [Class Name]

INCIDENT DETAILS:
Type: ${this.incidentType}
Location: ${this.incidentDetails.location || 'N/A'}
Severity: ${this.incidentDetails.severity}
Description: ${this.incidentDetails.description}

CHIEF COMPLAINT:
${this.chiefComplaint}

SYMPTOMS:
${this.symptoms.join(', ')}

DIAGNOSIS:
${this.diagnosis}

TREATMENT PROVIDED:
${this.treatment.description}

OUTCOME:
${this.outcome}

${this.leaveRequest.required ? `
LEAVE REQUEST:
Duration: ${this.leaveRequest.duration}
Reason: ${this.leaveRequest.reason}
Status: ${this.leaveRequest.status}
` : ''}

Attended By: [Nurse/Doctor Name]
Report Generated: ${new Date().toLocaleString()}
    `.trim();
};

module.exports = mongoose.model('clinic', clinicSchema);

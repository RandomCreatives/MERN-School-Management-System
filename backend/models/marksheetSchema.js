const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3', 'Final'],
        required: true
    },
    marks: {
        type: Map,
        of: Number,
        default: {}
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    maxMarks: {
        type: Number,
        default: 100
    },
    percentage: {
        type: Number,
        default: 0
    },
    grade: String,
    enteredBy: {
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
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Calculate grade based on percentage
marksheetSchema.methods.calculateGrade = function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

// Pre-save hook to calculate totals and grade
marksheetSchema.pre('save', function(next) {
    if (this.marks && this.marks.size > 0) {
        this.totalMarks = Array.from(this.marks.values()).reduce((sum, mark) => sum + mark, 0);
        this.percentage = (this.totalMarks / this.maxMarks) * 100;
        this.grade = this.calculateGrade();
    }
    this.lastUpdated = Date.now();
    next();
});

// Compound index for efficient queries
marksheetSchema.index({ student: 1, subject: 1, term: 1 }, { unique: true });
marksheetSchema.index({ class: 1, term: 1 });

module.exports = mongoose.model('marksheet', marksheetSchema);

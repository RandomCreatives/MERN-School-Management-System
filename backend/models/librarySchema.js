const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    bookTitle: {
        type: String,
        required: true
    },
    bookISBN: {
        type: String
    },
    bookAuthor: {
        type: String
    },
    bookCategory: {
        type: String,
        enum: ['Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Reference', 'Other']
    },
    borrowDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue', 'lost'],
        default: 'borrowed'
    },
    condition: {
        borrowed: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor'],
            default: 'good'
        },
        returned: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
        }
    },
    fine: {
        amount: {
            type: Number,
            default: 0
        },
        paid: {
            type: Boolean,
            default: false
        },
        reason: String
    },
    notes: String,
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    returnedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
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

// Index for efficient queries
librarySchema.index({ student: 1, status: 1 });
librarySchema.index({ status: 1, dueDate: 1 });
librarySchema.index({ school: 1, status: 1 });

// Method to check if book is overdue
librarySchema.methods.checkOverdue = function() {
    if (this.status === 'borrowed' && new Date() > this.dueDate) {
        this.status = 'overdue';
        return true;
    }
    return false;
};

// Method to calculate fine
librarySchema.methods.calculateFine = function(finePerDay = 5) {
    if (this.status === 'overdue' || (this.returnDate && this.returnDate > this.dueDate)) {
        const returnDate = this.returnDate || new Date();
        const daysLate = Math.ceil((returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
        if (daysLate > 0) {
            this.fine.amount = daysLate * finePerDay;
            this.fine.reason = `${daysLate} day(s) overdue`;
        }
    }
};

module.exports = mongoose.model('library', librarySchema);

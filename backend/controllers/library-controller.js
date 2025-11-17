const Library = require('../models/librarySchema');
const Student = require('../models/studentSchema');

// Issue a book to a student
const issueBook = async (req, res) => {
    try {
        const {
            studentId,
            bookTitle,
            bookISBN,
            bookAuthor,
            bookCategory,
            borrowDate,
            dueDate,
            condition,
            notes,
            classId
        } = req.body;

        const issuedBy = req.user.id;
        const schoolId = req.user.school;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student has overdue books
        const overdueBooks = await Library.find({
            student: studentId,
            status: { $in: ['borrowed', 'overdue'] }
        });

        if (overdueBooks.length >= 3) {
            return res.status(400).json({ 
                message: 'Student has reached maximum book limit (3 books)' 
            });
        }

        const hasOverdue = overdueBooks.some(book => book.status === 'overdue');
        if (hasOverdue) {
            return res.status(400).json({ 
                message: 'Student has overdue books. Please return them first.' 
            });
        }

        // Create library record
        const libraryRecord = new Library({
            student: studentId,
            bookTitle,
            bookISBN,
            bookAuthor,
            bookCategory,
            borrowDate: borrowDate || new Date(),
            dueDate,
            status: 'borrowed',
            condition: {
                borrowed: condition || 'good'
            },
            notes,
            issuedBy,
            class: classId,
            school: schoolId
        });

        await libraryRecord.save();

        const populatedRecord = await Library.findById(libraryRecord._id)
            .populate('student', 'name studentId rollNum')
            .populate('issuedBy', 'username')
            .populate('class', 'sclassName');

        res.status(201).json({
            message: 'Book issued successfully',
            record: populatedRecord
        });
    } catch (error) {
        console.error('Issue book error:', error);
        res.status(500).json({ message: 'Error issuing book' });
    }
};

// Return a book
const returnBook = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { returnCondition, notes } = req.body;
        const returnedTo = req.user.id;

        const record = await Library.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: 'Library record not found' });
        }

        if (record.status === 'returned') {
            return res.status(400).json({ message: 'Book already returned' });
        }

        // Update record
        record.returnDate = new Date();
        record.status = 'returned';
        record.condition.returned = returnCondition;
        record.returnedTo = returnedTo;
        if (notes) record.notes = (record.notes || '') + '\n' + notes;

        // Calculate fine if overdue
        record.calculateFine();

        await record.save();

        const populatedRecord = await Library.findById(record._id)
            .populate('student', 'name studentId rollNum')
            .populate('issuedBy', 'username')
            .populate('returnedTo', 'username')
            .populate('class', 'sclassName');

        res.json({
            message: 'Book returned successfully',
            record: populatedRecord,
            fine: record.fine.amount > 0 ? record.fine : null
        });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ message: 'Error returning book' });
    }
};

// Get student's borrowing history
const getStudentLibraryHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.query;

        const query = { student: studentId };
        if (status) {
            query.status = status;
        }

        const records = await Library.find(query)
            .populate('issuedBy', 'username')
            .populate('returnedTo', 'username')
            .sort({ borrowDate: -1 });

        // Calculate statistics
        const stats = {
            totalBorrowed: records.length,
            currentlyBorrowed: records.filter(r => r.status === 'borrowed').length,
            overdue: records.filter(r => r.status === 'overdue').length,
            returned: records.filter(r => r.status === 'returned').length,
            totalFines: records.reduce((sum, r) => sum + r.fine.amount, 0),
            unpaidFines: records.filter(r => r.fine.amount > 0 && !r.fine.paid)
                .reduce((sum, r) => sum + r.fine.amount, 0)
        };

        res.json({ records, stats });
    } catch (error) {
        console.error('Get library history error:', error);
        res.status(500).json({ message: 'Error fetching library history' });
    }
};

// Get all borrowed books (current)
const getCurrentBorrowedBooks = async (req, res) => {
    try {
        const { schoolId, classId } = req.query;

        const query = {
            school: schoolId,
            status: { $in: ['borrowed', 'overdue'] }
        };

        if (classId) {
            query.class = classId;
        }

        const records = await Library.find(query)
            .populate('student', 'name studentId rollNum')
            .populate('class', 'sclassName')
            .populate('issuedBy', 'username')
            .sort({ dueDate: 1 });

        // Check and update overdue status
        for (let record of records) {
            if (record.checkOverdue()) {
                await record.save();
            }
        }

        res.json({ records });
    } catch (error) {
        console.error('Get borrowed books error:', error);
        res.status(500).json({ message: 'Error fetching borrowed books' });
    }
};

// Get overdue books
const getOverdueBooks = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const records = await Library.find({
            school: schoolId,
            status: 'overdue'
        })
            .populate('student', 'name studentId rollNum parentContact')
            .populate('class', 'sclassName')
            .populate('issuedBy', 'username')
            .sort({ dueDate: 1 });

        res.json({ records, count: records.length });
    } catch (error) {
        console.error('Get overdue books error:', error);
        res.status(500).json({ message: 'Error fetching overdue books' });
    }
};

// Pay fine
const payFine = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { paymentMethod, notes } = req.body;

        const record = await Library.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: 'Library record not found' });
        }

        if (record.fine.amount === 0) {
            return res.status(400).json({ message: 'No fine to pay' });
        }

        record.fine.paid = true;
        record.notes = (record.notes || '') + `\nFine paid: ${record.fine.amount} ETB via ${paymentMethod}. ${notes || ''}`;

        await record.save();

        res.json({
            message: 'Fine paid successfully',
            record
        });
    } catch (error) {
        console.error('Pay fine error:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};

// Library analytics
const getLibraryAnalytics = async (req, res) => {
    try {
        const { schoolId, startDate, endDate } = req.query;

        const matchQuery = {
            school: schoolId
        };

        if (startDate && endDate) {
            matchQuery.borrowDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Total books borrowed
        const totalBorrowed = await Library.countDocuments(matchQuery);

        // Currently borrowed
        const currentlyBorrowed = await Library.countDocuments({
            school: schoolId,
            status: { $in: ['borrowed', 'overdue'] }
        });

        // Overdue books
        const overdueCount = await Library.countDocuments({
            school: schoolId,
            status: 'overdue'
        });

        // Popular books
        const popularBooks = await Library.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$bookTitle',
                    borrowCount: { $sum: 1 },
                    author: { $first: '$bookAuthor' },
                    category: { $first: '$bookCategory' }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 10 }
        ]);

        // Category distribution
        const categoryStats = await Library.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$bookCategory',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Total fines
        const fineStats = await Library.aggregate([
            { $match: { school: schoolId } },
            {
                $group: {
                    _id: null,
                    totalFines: { $sum: '$fine.amount' },
                    unpaidFines: {
                        $sum: {
                            $cond: [{ $eq: ['$fine.paid', false] }, '$fine.amount', 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            totalBorrowed,
            currentlyBorrowed,
            overdueCount,
            popularBooks,
            categoryStats,
            fineStats: fineStats[0] || { totalFines: 0, unpaidFines: 0 }
        });
    } catch (error) {
        console.error('Library analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

module.exports = {
    issueBook,
    returnBook,
    getStudentLibraryHistory,
    getCurrentBorrowedBooks,
    getOverdueBooks,
    payFine,
    getLibraryAnalytics
};

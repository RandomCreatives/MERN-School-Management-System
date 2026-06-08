const supabase = require('../supabaseClient');

const issueBook = async (req, res) => {
    try {
        const { studentId, bookTitle, bookISBN, bookAuthor, bookCategory, borrowDate, dueDate, condition, notes, classId } = req.body;
        const issuedBy = req.user.id;
        const schoolId = req.user.school_id;

        const { data: overdueBooks } = await supabase.from('library')
            .select('id, status').eq('student_id', studentId).in('status', ['borrowed', 'overdue']);

        if (overdueBooks && overdueBooks.length >= 3)
            return res.status(400).json({ message: 'Student has reached maximum book limit (3 books)' });

        if (overdueBooks && overdueBooks.some(b => b.status === 'overdue'))
            return res.status(400).json({ message: 'Student has overdue books. Please return them first.' });

        const { data, error } = await supabase.from('library')
            .insert([{
                student_id: studentId,
                book_title: bookTitle,
                book_isbn: bookISBN,
                book_author: bookAuthor,
                book_category: bookCategory,
                borrow_date: borrowDate || new Date().toISOString(),
                due_date: dueDate,
                status: 'borrowed',
                condition_borrowed: condition || 'good',
                notes,
                issued_by: issuedBy,
                class_id: classId,
                school_id: schoolId,
                fine_amount: 0,
                fine_paid: false
            }])
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.status(201).json({ message: 'Book issued successfully', record: data });
    } catch (error) {
        res.status(500).json({ message: 'Error issuing book' });
    }
};

const returnBook = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { returnCondition, notes } = req.body;
        const returnedTo = req.user.id;

        const { data: record } = await supabase.from('library').select('*').eq('id', recordId).single();
        if (!record) return res.status(404).json({ message: 'Library record not found' });
        if (record.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

        const returnDate = new Date().toISOString();
        const dueDate = new Date(record.due_date);
        const daysLate = Math.ceil((new Date(returnDate) - dueDate) / (1000 * 60 * 60 * 24));
        const fineAmount = daysLate > 0 ? daysLate * 5 : 0;

        const { data, error } = await supabase.from('library')
            .update({
                return_date: returnDate,
                status: 'returned',
                condition_returned: returnCondition,
                returned_to: returnedTo,
                fine_amount: fineAmount,
                fine_reason: fineAmount > 0 ? `${daysLate} day(s) overdue` : null,
                notes: record.notes ? record.notes + '\n' + (notes || '') : notes || ''
            })
            .eq('id', recordId)
            .select(`*, students(name, student_id, roll_num)`)
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Book returned successfully', record: data, fine: fineAmount > 0 ? { amount: fineAmount } : null });
    } catch (error) {
        res.status(500).json({ message: 'Error returning book' });
    }
};

const getStudentLibraryHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status } = req.query;

        let query = supabase.from('library').select('*').eq('student_id', studentId).order('borrow_date', { ascending: false });
        if (status) query = query.eq('status', status);

        const { data: records, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        const stats = {
            totalBorrowed: records.length,
            currentlyBorrowed: records.filter(r => r.status === 'borrowed').length,
            overdue: records.filter(r => r.status === 'overdue').length,
            returned: records.filter(r => r.status === 'returned').length,
            totalFines: records.reduce((s, r) => s + (r.fine_amount || 0), 0),
            unpaidFines: records.filter(r => r.fine_amount > 0 && !r.fine_paid).reduce((s, r) => s + r.fine_amount, 0)
        };

        res.json({ records, stats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching library history' });
    }
};

const getCurrentBorrowedBooks = async (req, res) => {
    try {
        const { schoolId, classId } = req.query;

        let query = supabase.from('library')
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .eq('school_id', schoolId)
            .in('status', ['borrowed', 'overdue'])
            .order('due_date', { ascending: true });

        if (classId) query = query.eq('class_id', classId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ message: error.message });

        res.json({ records: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowed books' });
    }
};

const getOverdueBooks = async (req, res) => {
    try {
        const { schoolId } = req.query;
        const { data, error } = await supabase.from('library')
            .select(`*, students(name, student_id, roll_num), sclasses(sclass_name)`)
            .eq('school_id', schoolId).eq('status', 'overdue').order('due_date', { ascending: true });

        if (error) return res.status(500).json({ message: error.message });
        res.json({ records: data, count: data.length });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching overdue books' });
    }
};

const payFine = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { paymentMethod, notes } = req.body;

        const { data: record } = await supabase.from('library').select('fine_amount, notes').eq('id', recordId).single();
        if (!record) return res.status(404).json({ message: 'Library record not found' });
        if (!record.fine_amount) return res.status(400).json({ message: 'No fine to pay' });

        const { data, error } = await supabase.from('library')
            .update({ fine_paid: true, notes: (record.notes || '') + `\nFine paid: ${record.fine_amount} ETB via ${paymentMethod}. ${notes || ''}` })
            .eq('id', recordId).select().single();

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Fine paid successfully', record: data });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment' });
    }
};

const getLibraryAnalytics = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const { data: all } = await supabase.from('library').select('status, book_title, book_author, book_category, fine_amount, fine_paid').eq('school_id', schoolId);

        const totalBorrowed = all?.length || 0;
        const currentlyBorrowed = all?.filter(r => ['borrowed', 'overdue'].includes(r.status)).length || 0;
        const overdueCount = all?.filter(r => r.status === 'overdue').length || 0;
        const totalFines = all?.reduce((s, r) => s + (r.fine_amount || 0), 0) || 0;
        const unpaidFines = all?.filter(r => r.fine_amount > 0 && !r.fine_paid).reduce((s, r) => s + r.fine_amount, 0) || 0;

        res.json({ totalBorrowed, currentlyBorrowed, overdueCount, fineStats: { totalFines, unpaidFines } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

module.exports = { issueBook, returnBook, getStudentLibraryHistory, getCurrentBorrowedBooks, getOverdueBooks, payFine, getLibraryAnalytics };

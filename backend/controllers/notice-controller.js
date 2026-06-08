const supabase = require('../supabaseClient');

const noticeCreate = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .insert([{
                title: req.body.title,
                details: req.body.details,
                date: req.body.date,
                school_id: req.body.adminID
            }])
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const noticeList = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('school_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No notices found' });

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteNotice = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteNotices = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .delete()
            .eq('school_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateNotice = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice };

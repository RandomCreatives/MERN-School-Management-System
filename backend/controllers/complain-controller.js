const supabase = require('../supabaseClient');

const complainCreate = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complains')
            .insert([{
                user_id: req.body.user,
                date: req.body.date,
                complaint: req.body.complaint,
                school_id: req.body.school
            }])
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complains')
            .select('*')
            .eq('school_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No complains found' });

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList };

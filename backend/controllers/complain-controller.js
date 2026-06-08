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

const complainReply = async (req, res) => {
    try {
        const { reply, status } = req.body;
        const result = await Complain.findByIdAndUpdate(
            req.params.id,
            {
                reply,
                status: status || 'reviewed',
                repliedAt: new Date()
            },
            { new: true }
        ).populate("user", "name email");

        if (!result) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainDelete = async (req, res) => {
    try {
        const result = await Complain.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainDeleteAll = async (req, res) => {
    try {
        const result = await Complain.deleteMany({ school: req.params.id });
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList, complainReply, complainDelete, complainDeleteAll };

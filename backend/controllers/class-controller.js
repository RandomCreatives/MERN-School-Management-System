const supabase = require('../supabaseClient');

const sclassCreate = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('sclasses')
            .select('id')
            .eq('sclass_name', req.body.sclassName)
            .eq('school_id', req.body.adminID)
            .single();

        if (existing) {
            return res.send({ message: 'Sorry this class name already exists' });
        }

        const { data, error } = await supabase
            .from('sclasses')
            .insert([{ sclass_name: req.body.sclassName, school_id: req.body.adminID }])
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .select('*')
            .eq('school_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No sclasses found' });

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .select(`*, admins(school_name)`)
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.send({ message: 'No class found' });
        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassStudents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('sclass_id', req.params.id);

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No students found' });

        res.send(data.map(s => ({ ...s, password: undefined })));
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSclass = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.send({ message: 'Class not found' });

        await supabase.from('students').delete().eq('sclass_id', req.params.id);
        await supabase.from('subjects').delete().eq('sclass_id', req.params.id);
        await supabase.from('teachers').delete().eq('teach_sclass_id', req.params.id);

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSclasses = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sclasses')
            .delete()
            .eq('school_id', req.params.id)
            .select();

        if (error) return res.status(500).json({ message: error.message });
        if (!data || data.length === 0) return res.send({ message: 'No classes found to delete' });

        await supabase.from('students').delete().eq('school_id', req.params.id);
        await supabase.from('subjects').delete().eq('school_id', req.params.id);
        await supabase.from('teachers').delete().eq('school_id', req.params.id);

        res.send(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents };

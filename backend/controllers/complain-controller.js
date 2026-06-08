const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain({
            ...req.body,
            userType: req.body.userType || 'student',
            status: 'pending'
        });
        const result = await complain.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id })
            .populate("user", "name email teacherId rollNum")
            .sort({ date: -1 });
        if (complains.length > 0) {
            res.send(complains);
        } else {
            res.send({ message: "No complains found" });
        }
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

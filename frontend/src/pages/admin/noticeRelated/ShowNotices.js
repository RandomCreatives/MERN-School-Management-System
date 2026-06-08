import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Typography, Card, CardContent, Chip, Button, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const ShowNotices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    const [editDialog, setEditDialog] = useState({ open: false, notice: null });
    const [editData, setEditData] = useState({ title: '', details: '', date: '' });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    const deleteHandler = async (deleteID, address) => {
        try {
            await axios.delete(`${API_BASE}/${address}/${deleteID}`);
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
            dispatch(getAllNotices(currentUser._id, "Notice"));
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
        }
    };

    const handleEdit = (notice) => {
        setEditData({
            title: notice.title,
            details: notice.details,
            date: new Date(notice.date).toISOString().split('T')[0]
        });
        setEditDialog({ open: true, notice });
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_BASE}/Notice/${editDialog.notice._id}`, editData);
            setEditDialog({ open: false, notice: null });
            setSnackbar({ open: true, message: 'Notice updated!', severity: 'success' });
            dispatch(getAllNotices(currentUser._id, "Notice"));
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        },
    ];

    const sortedNotices = Array.isArray(noticesList)
        ? [...noticesList].sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Notices</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Manage announcements visible to all teachers and students.
                    </Typography>
                </Box>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                    + Add Notice
                </GreenButton>
            </Box>

            {loading ? (
                <div>Loading...</div>
            ) : response || sortedNotices.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>No Notices</Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>Create your first notice.</Typography>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                        Add Notice
                    </GreenButton>
                </Paper>
            ) : (
                <>
                    {sortedNotices.map((notice) => {
                        const noticeDate = new Date(notice.date);
                        return (
                            <Card key={notice._id} sx={{ mb: 2, borderRadius: '12px', borderLeft: '4px solid #7f56da' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {notice.title}
                                            </Typography>
                                            <Chip
                                                label={noticeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                size="small" variant="outlined" sx={{ mt: 0.5, mb: 1 }}
                                            />
                                            <Typography variant="body1" sx={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                                                {notice.details}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                                            <IconButton size="small" onClick={() => handleEdit(notice)} sx={{ color: '#3b82f6' }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => deleteHandler(notice._id, "Notice")} sx={{ color: '#ef4444' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <SpeedDialTemplate actions={actions} />
                </>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, notice: null })}
                fullWidth maxWidth="sm">
                <DialogTitle>Edit Notice</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Title" value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        sx={{ mt: 1, mb: 2 }} required />
                    <TextField fullWidth label="Details" multiline rows={4} value={editData.details}
                        onChange={(e) => setEditData({ ...editData, details: e.target.value })}
                        sx={{ mb: 2 }} required />
                    <TextField fullWidth label="Date" type="date" value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        InputLabelProps={{ shrink: true }} required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, notice: null })}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}
                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6d28d9' } }}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ShowNotices;

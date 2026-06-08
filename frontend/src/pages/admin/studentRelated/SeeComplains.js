import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, CircularProgress, Card, CardContent, Chip, Button,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Avatar, Snackbar, Alert, Divider
} from '@mui/material';
import { Reply, Delete, CheckCircle, Schedule, Report } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const SeeComplains = () => {
    const { currentUser } = useSelector(state => state.user);
    const [complains, setComplains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyDialog, setReplyDialog] = useState({ open: false, complain: null });
    const [replyText, setReplyText] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchComplains = async () => {
        try {
            const res = await axios.get(`${API_BASE}/ComplainList/${currentUser._id}`);
            if (Array.isArray(res.data)) {
                setComplains(res.data);
            } else {
                setComplains([]);
            }
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplains();
    }, [currentUser._id]);

    const handleReply = async () => {
        if (!replyText.trim()) {
            setSnackbar({ open: true, message: 'Please enter a reply', severity: 'error' });
            return;
        }
        setSaving(true);
        try {
            await axios.put(`${API_BASE}/Complain/${replyDialog.complain._id}`, {
                reply: replyText.trim(),
                status: 'reviewed'
            });
            setReplyDialog({ open: false, complain: null });
            setReplyText('');
            setSnackbar({ open: true, message: 'Reply sent successfully!', severity: 'success' });
            fetchComplains();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await axios.put(`${API_BASE}/Complain/${id}`, { status: 'resolved' });
            setSnackbar({ open: true, message: 'Marked as resolved', severity: 'success' });
            fetchComplains();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/Complain/${id}`);
            setSnackbar({ open: true, message: 'Complaint deleted', severity: 'success' });
            fetchComplains();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
        }
    };

    const handleDeleteAll = async () => {
        try {
            await axios.delete(`${API_BASE}/Complains/${currentUser._id}`);
            setSnackbar({ open: true, message: 'All complaints deleted', severity: 'success' });
            fetchComplains();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'success';
            case 'reviewed': return 'info';
            default: return 'warning';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle sx={{ fontSize: 16 }} />;
            case 'reviewed': return <Reply sx={{ fontSize: 16 }} />;
            default: return <Schedule sx={{ fontSize: 16 }} />;
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    const pendingCount = complains.filter(c => c.status === 'pending').length;
    const reviewedCount = complains.filter(c => c.status === 'reviewed').length;
    const resolvedCount = complains.filter(c => c.status === 'resolved').length;

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Complaints</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        View and respond to complaints from teachers and students.
                    </Typography>
                </Box>
                {complains.length > 0 && (
                    <Button variant="outlined" color="error" startIcon={<Delete />}
                        onClick={handleDeleteAll} sx={{ textTransform: 'none' }}>
                        Clear All
                    </Button>
                )}
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip icon={<Schedule />} label={`Pending: ${pendingCount}`} color="warning" variant="outlined" />
                <Chip icon={<Reply />} label={`Reviewed: ${reviewedCount}`} color="info" variant="outlined" />
                <Chip icon={<CheckCircle />} label={`Resolved: ${resolvedCount}`} color="success" variant="outlined" />
                <Chip label={`Total: ${complains.length}`} variant="outlined" />
            </Box>

            {complains.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Report sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#6b7280' }}>No Complaints</Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>No complaints have been submitted yet.</Typography>
                </Paper>
            ) : (
                complains.map((complain) => (
                    <Card key={complain._id} sx={{
                        mb: 2, borderRadius: '12px',
                        borderLeft: `4px solid ${complain.status === 'pending' ? '#f59e0b' : complain.status === 'reviewed' ? '#3b82f6' : '#10b981'}`
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#7f56da', fontSize: '0.85rem' }}>
                                        {complain.user?.name?.charAt(0) || '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {complain.user?.name || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                            {complain.userType === 'teacher' ? 'Teacher' : 'Student'}
                                            {complain.user?.email ? ` • ${complain.user.email}` : ''}
                                            {' • '}
                                            {new Date(complain.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip icon={getStatusIcon(complain.status)}
                                        label={complain.status || 'pending'}
                                        color={getStatusColor(complain.status)}
                                        size="small" sx={{ textTransform: 'capitalize' }} />
                                </Box>
                            </Box>

                            <Typography variant="body1" sx={{ my: 2, color: '#374151', whiteSpace: 'pre-wrap' }}>
                                {complain.complaint}
                            </Typography>

                            {/* Admin Reply */}
                            {complain.reply && (
                                <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: '8px', mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                                        Admin Reply {complain.repliedAt ? `• ${new Date(complain.repliedAt).toLocaleDateString()}` : ''}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, color: '#374151' }}>
                                        {complain.reply}
                                    </Typography>
                                </Paper>
                            )}

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button size="small" startIcon={<Reply />}
                                    onClick={() => { setReplyDialog({ open: true, complain }); setReplyText(complain.reply || ''); }}
                                    sx={{ textTransform: 'none', color: '#3b82f6' }}>
                                    {complain.reply ? 'Edit Reply' : 'Reply'}
                                </Button>
                                {complain.status !== 'resolved' && (
                                    <Button size="small" startIcon={<CheckCircle />}
                                        onClick={() => handleResolve(complain._id)}
                                        sx={{ textTransform: 'none', color: '#10b981' }}>
                                        Resolve
                                    </Button>
                                )}
                                <IconButton size="small" onClick={() => handleDelete(complain._id)} sx={{ color: '#ef4444' }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Reply Dialog */}
            <Dialog open={replyDialog.open} onClose={() => setReplyDialog({ open: false, complain: null })}
                fullWidth maxWidth="sm">
                <DialogTitle>Reply to Complaint</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        From: <strong>{replyDialog.complain?.user?.name}</strong>
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f9fafb', mb: 2, borderRadius: '8px' }}>
                        <Typography variant="body2">{replyDialog.complain?.complaint}</Typography>
                    </Paper>
                    <TextField
                        fullWidth multiline rows={4}
                        label="Your Reply"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplyDialog({ open: false, complain: null })}>Cancel</Button>
                    <Button onClick={handleReply} variant="contained" disabled={saving}
                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6d28d9' } }}>
                        {saving ? 'Sending...' : 'Send Reply'}
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

export default SeeComplains;

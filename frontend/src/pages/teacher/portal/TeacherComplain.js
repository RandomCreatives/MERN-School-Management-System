import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, CircularProgress, Snackbar, Alert,
    Card, CardContent, Chip, Divider
} from '@mui/material';
import { Send, Report, CheckCircle, Schedule, Reply } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherComplain = () => {
    const [complaint, setComplaint] = useState('');
    const [saving, setSaving] = useState(false);
    const [myComplaints, setMyComplaints] = useState([]);
    const [loadingComplaints, setLoadingComplaints] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const teacherId = localStorage.getItem('teacherId');
    const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
    const schoolId = teacherData?.school?._id || teacherData?.school;

    const fetchMyComplaints = async () => {
        try {
            if (!schoolId) return;
            const res = await axios.get(`${API_BASE}/ComplainList/${schoolId}`);
            if (Array.isArray(res.data)) {
                // Filter to only show this teacher's complaints
                const mine = res.data.filter(c => c.user?._id === teacherId || c.user === teacherId);
                setMyComplaints(mine);
            }
        } catch (err) {
            console.error('Error fetching complaints:', err);
        } finally {
            setLoadingComplaints(false);
        }
    };

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!complaint.trim()) {
            setSnackbar({ open: true, message: 'Please enter your complaint or feedback', severity: 'error' });
            return;
        }

        if (!teacherId || !schoolId) {
            setSnackbar({ open: true, message: 'Authentication error. Please log in again.', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            await axios.post(`${API_BASE}/ComplainCreate`, {
                user: teacherId,
                userType: 'teacher',
                date: new Date().toISOString(),
                complaint: complaint.trim(),
                school: schoolId
            });
            setComplaint('');
            setSnackbar({ open: true, message: 'Your complaint has been submitted successfully!', severity: 'success' });
            fetchMyComplaints();
        } catch (err) {
            console.error('Complaint error:', err);
            setSnackbar({ open: true, message: 'Failed to submit complaint. Please try again.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'success';
            case 'reviewed': return 'info';
            default: return 'warning';
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Complaints & Feedback</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                Submit concerns or feedback. View admin responses to your previous submissions.
            </Typography>

            {/* Submit Form */}
            <Paper sx={{ p: 4, borderRadius: '12px', maxWidth: 700, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: '12px', bgcolor: '#fef2f2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Report sx={{ color: '#ef4444', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>New Complaint</Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            All submissions are reviewed by the administration.
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth multiline rows={4}
                        label="Describe your concern or feedback"
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder="Please provide details about your complaint or suggestion..."
                        sx={{ mb: 3 }}
                        required
                    />
                    <Button
                        type="submit" variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        disabled={saving}
                        sx={{
                            bgcolor: '#059669', '&:hover': { bgcolor: '#047857' },
                            px: 4, py: 1.5, fontWeight: 600, textTransform: 'none'
                        }}
                    >
                        {saving ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                </form>
            </Paper>

            {/* My Past Complaints */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>My Submissions</Typography>

            {loadingComplaints ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#059669' }} />
                </Box>
            ) : myComplaints.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ color: '#9ca3af' }}>
                        You haven't submitted any complaints yet.
                    </Typography>
                </Paper>
            ) : (
                myComplaints.map((c) => (
                    <Card key={c._id} sx={{
                        mb: 2, borderRadius: '12px',
                        borderLeft: `4px solid ${c.status === 'resolved' ? '#10b981' : c.status === 'reviewed' ? '#3b82f6' : '#f59e0b'}`
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                    {new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                                <Chip
                                    icon={c.status === 'resolved' ? <CheckCircle sx={{ fontSize: 14 }} /> :
                                        c.status === 'reviewed' ? <Reply sx={{ fontSize: 14 }} /> :
                                            <Schedule sx={{ fontSize: 14 }} />}
                                    label={c.status || 'pending'}
                                    color={getStatusColor(c.status)}
                                    size="small"
                                    sx={{ textTransform: 'capitalize' }}
                                />
                            </Box>
                            <Typography variant="body1" sx={{ color: '#374151', whiteSpace: 'pre-wrap' }}>
                                {c.complaint}
                            </Typography>

                            {/* Admin reply */}
                            {c.reply && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Paper sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: '8px' }}>
                                        <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600 }}>
                                            Admin Reply {c.repliedAt ? `• ${new Date(c.repliedAt).toLocaleDateString()}` : ''}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5, color: '#374151' }}>
                                            {c.reply}
                                        </Typography>
                                    </Paper>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}

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

export default TeacherComplain;

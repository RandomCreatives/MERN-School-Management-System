import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert, Card, CardContent, Chip
} from '@mui/material';
import { Announcement, CalendarMonth } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Get school ID from teacher data
                const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
                const schoolId = teacherData?.school?._id || teacherData?.school;

                if (!schoolId) {
                    setError('School information not available');
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${API_BASE}/NoticeList/${schoolId}`);
                if (Array.isArray(res.data)) {
                    setNotices(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
                } else {
                    setNotices([]);
                }
            } catch (err) {
                setError('Failed to load notices');
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Notices</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                View announcements and notices from the administration.
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {notices.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Announcement sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>No Notices</Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        There are no notices at this time.
                    </Typography>
                </Paper>
            ) : (
                notices.map((notice) => {
                    const noticeDate = new Date(notice.date);
                    const isRecent = (Date.now() - noticeDate.getTime()) < 3 * 24 * 60 * 60 * 1000; // 3 days
                    return (
                        <Card key={notice._id} sx={{
                            mb: 2, borderRadius: '12px',
                            borderLeft: `4px solid ${isRecent ? '#059669' : '#d1d5db'}`,
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                            transition: 'box-shadow 0.2s'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                                        {notice.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                                        {isRecent && <Chip label="New" size="small" color="success" />}
                                        <Chip
                                            icon={<CalendarMonth sx={{ fontSize: 16 }} />}
                                            label={noticeDate.toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="body1" sx={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                                    {notice.details}
                                </Typography>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </Box>
    );
};

export default TeacherNotices;

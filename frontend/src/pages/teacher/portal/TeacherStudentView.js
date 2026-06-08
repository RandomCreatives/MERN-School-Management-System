import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, CircularProgress, Alert, Button, Card, CardContent,
    Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar
} from '@mui/material';
import { ArrowBack, School } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherStudentView = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await axios.get(`${API_BASE}/Student/${studentId}`);
                if (res.data && !res.data.message) {
                    setStudent(res.data);
                } else {
                    setError(res.data?.message || 'Student not found');
                }
            } catch (err) {
                setError('Failed to load student details');
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
    }
    if (error) {
        return <Paper sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Paper>;
    }
    if (!student) return null;

    // Attendance calculations
    const attendance = student.attendance || [];
    const totalAtt = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = totalAtt - presentCount;
    const attPercent = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

    // Group attendance by subject
    const attBySubject = {};
    attendance.forEach(a => {
        const subName = a.subName?.subName || a.subName?._id || 'Unknown';
        if (!attBySubject[subName]) attBySubject[subName] = { present: 0, absent: 0, total: 0 };
        attBySubject[subName].total++;
        if (a.status === 'Present') attBySubject[subName].present++;
        else attBySubject[subName].absent++;
    });

    // Exam results
    const examResults = student.examResult || [];

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/teacher-portal/students')}
                sx={{ mb: 2, color: '#059669', textTransform: 'none' }}>
                Back to Students
            </Button>

            {/* Profile Card */}
            <Card sx={{ mb: 3, borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '1.8rem', fontWeight: 700 }}>
                            {student.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{student.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip label={`Roll #${student.rollNum}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                <Chip label={student.sclassName?.sclassName || 'N/A'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                    icon={<School sx={{ color: '#fff !important' }} />} />
                                {student.studentId && (
                                    <Chip label={`ID: ${student.studentId}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Attendance Summary */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Attendance</Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress variant="determinate" value={attPercent} size={100}
                                sx={{ color: attPercent >= 75 ? '#10b981' : attPercent >= 50 ? '#f59e0b' : '#ef4444' }} />
                            <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>{attPercent}%</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>{presentCount}</Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>Present</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>{absentCount}</Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>Absent</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalAtt}</Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>Total</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Attendance by Subject */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Attendance by Subject</Typography>
                        {Object.keys(attBySubject).length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No attendance records.</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>%</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(attBySubject).map(([sub, data]) => (
                                            <TableRow key={sub}>
                                                <TableCell>{sub}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={data.present} size="small" color="success" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={data.absent} size="small" color="error" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {data.total > 0 ? Math.round((data.present / data.total) * 100) : 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Exam Results */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Exam Results</Typography>
                        {examResults.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No exam results recorded.</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Marks</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {examResults.map((result, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{result.subName?.subName || result.subName || 'N/A'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={result.marksObtained} size="small"
                                                        color={result.marksObtained >= 50 ? 'success' : 'error'} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherStudentView;

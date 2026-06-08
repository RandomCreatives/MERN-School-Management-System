import { useState } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, InputLabel, Select, MenuItem, TextField, Avatar, Chip, Snackbar
} from '@mui/material';
import { CheckCircle, Cancel, Save } from '@mui/icons-material';
import axios from 'axios';
import useTeacherData from '../useTeacherData';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherAttendance = () => {
    const { teacher, students, subjects, classInfo, loading, error } = useTeacherData();
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
    }

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status) => {
        const map = {};
        students.forEach(s => { map[s._id] = status; });
        setAttendanceMap(map);
    };

    const handleSubmit = async () => {
        if (!selectedSubject) {
            setSnackbar({ open: true, message: 'Please select a subject', severity: 'error' });
            return;
        }
        if (!date) {
            setSnackbar({ open: true, message: 'Please select a date', severity: 'error' });
            return;
        }
        const unmarked = students.filter(s => !attendanceMap[s._id]);
        if (unmarked.length > 0) {
            setSnackbar({ open: true, message: `Please mark attendance for all students (${unmarked.length} remaining)`, severity: 'error' });
            return;
        }

        setSaving(true);
        let successCount = 0;
        let failCount = 0;

        for (const student of students) {
            try {
                await axios.put(`${API_BASE}/StudentAttendance/${student._id}`, {
                    subName: selectedSubject,
                    status: attendanceMap[student._id],
                    date: date
                });
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`Failed for ${student.name}:`, err);
            }
        }

        setSaving(false);
        if (failCount === 0) {
            setSnackbar({ open: true, message: `Attendance saved for ${successCount} students!`, severity: 'success' });
        } else {
            setSnackbar({ open: true, message: `Saved ${successCount}, failed ${failCount}`, severity: 'warning' });
        }
    };

    // Count
    const presentCount = Object.values(attendanceMap).filter(v => v === 'Present').length;
    const absentCount = Object.values(attendanceMap).filter(v => v === 'Absent').length;

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Take Attendance</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                {classInfo?.sclassName || 'Class'} — Mark attendance for your students.
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Controls */}
            <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel>Select Subject</InputLabel>
                        <Select
                            value={selectedSubject}
                            label="Select Subject"
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            {subjects.map(sub => (
                                <MenuItem key={sub._id} value={sub._id}>{sub.subName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 180 }}
                    />
                    <Box sx={{ flex: 1 }} />
                    <Button variant="outlined" onClick={() => markAll('Present')}
                        sx={{ borderColor: '#10b981', color: '#10b981', textTransform: 'none' }}>
                        Mark All Present
                    </Button>
                    <Button variant="outlined" onClick={() => markAll('Absent')}
                        sx={{ borderColor: '#ef4444', color: '#ef4444', textTransform: 'none' }}>
                        Mark All Absent
                    </Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip icon={<CheckCircle />} label={`Present: ${presentCount}`} color="success" variant="outlined" />
                    <Chip icon={<Cancel />} label={`Absent: ${absentCount}`} color="error" variant="outlined" />
                    <Chip label={`Unmarked: ${students.length - presentCount - absentCount}`} variant="outlined" />
                </Box>
            </Paper>

            {/* Students Table */}
            {students.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ color: '#9ca3af' }}>No students to mark attendance for.</Typography>
                </Paper>
            ) : (
                <Paper sx={{ borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Roll #</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student, i) => (
                                    <TableRow key={student._id} hover
                                        sx={{
                                            bgcolor: attendanceMap[student._id] === 'Present' ? '#f0fdf4'
                                                : attendanceMap[student._id] === 'Absent' ? '#fef2f2' : 'inherit'
                                        }}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#059669', fontSize: '0.8rem' }}>
                                                    {student.name?.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{student.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{student.rollNum}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant={attendanceMap[student._id] === 'Present' ? 'contained' : 'outlined'}
                                                    onClick={() => handleStatusChange(student._id, 'Present')}
                                                    sx={{
                                                        minWidth: 90, textTransform: 'none',
                                                        ...(attendanceMap[student._id] === 'Present'
                                                            ? { bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }
                                                            : { borderColor: '#d1d5db', color: '#6b7280' })
                                                    }}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant={attendanceMap[student._id] === 'Absent' ? 'contained' : 'outlined'}
                                                    onClick={() => handleStatusChange(student._id, 'Absent')}
                                                    sx={{
                                                        minWidth: 90, textTransform: 'none',
                                                        ...(attendanceMap[student._id] === 'Absent'
                                                            ? { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }
                                                            : { borderColor: '#d1d5db', color: '#6b7280' })
                                                    }}
                                                >
                                                    Absent
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Save Button */}
            {students.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSubmit}
                        disabled={saving}
                        sx={{
                            bgcolor: '#059669', '&:hover': { bgcolor: '#047857' },
                            px: 4, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherAttendance;

import { useState } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, InputLabel, Select, MenuItem, TextField, Avatar, Snackbar
} from '@mui/material';
import { Save, Grade } from '@mui/icons-material';
import axios from 'axios';
import useTeacherData from '../useTeacherData';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherGradebook = () => {
    const { students, subjects, classInfo, loading, error } = useTeacherData();
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marksMap, setMarksMap] = useState({});
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
    }

    const handleMarksChange = (studentId, marks) => {
        setMarksMap(prev => ({ ...prev, [studentId]: marks }));
    };

    const handleSubmit = async () => {
        if (!selectedSubject) {
            setSnackbar({ open: true, message: 'Please select a subject', severity: 'error' });
            return;
        }

        const entries = Object.entries(marksMap).filter(([_, v]) => v !== '' && v !== undefined);
        if (entries.length === 0) {
            setSnackbar({ open: true, message: 'Please enter marks for at least one student', severity: 'error' });
            return;
        }

        setSaving(true);
        let successCount = 0;
        let failCount = 0;

        for (const [studentId, marks] of entries) {
            try {
                await axios.put(`${API_BASE}/UpdateExamResult/${studentId}`, {
                    subName: selectedSubject,
                    marksObtained: Number(marks)
                });
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`Failed for ${studentId}:`, err);
            }
        }

        setSaving(false);
        if (failCount === 0) {
            setSnackbar({ open: true, message: `Marks saved for ${successCount} students!`, severity: 'success' });
        } else {
            setSnackbar({ open: true, message: `Saved ${successCount}, failed ${failCount}`, severity: 'warning' });
        }
    };

    const getGrade = (marks) => {
        const m = Number(marks);
        if (isNaN(m)) return '-';
        if (m >= 90) return 'A+';
        if (m >= 80) return 'A';
        if (m >= 70) return 'B+';
        if (m >= 60) return 'B';
        if (m >= 50) return 'C';
        if (m >= 40) return 'D';
        return 'F';
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A+': case 'A': return '#10b981';
            case 'B+': case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#f97316';
            case 'F': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Gradebook</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                {classInfo?.sclassName || 'Class'} — Enter and manage student exam marks.
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Subject Selection */}
            <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 250 }}>
                        <InputLabel>Select Subject</InputLabel>
                        <Select
                            value={selectedSubject}
                            label="Select Subject"
                            onChange={(e) => { setSelectedSubject(e.target.value); setMarksMap({}); }}
                        >
                            {subjects.map(sub => (
                                <MenuItem key={sub._id} value={sub._id}>
                                    {sub.subName} ({sub.subCode})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Enter marks (0-100) for each student, then save.
                    </Typography>
                </Box>
            </Paper>

            {/* Marks Table */}
            {students.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ color: '#9ca3af' }}>No students to grade.</Typography>
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
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Marks</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student, i) => {
                                    const marks = marksMap[student._id] ?? '';
                                    const grade = getGrade(marks);
                                    return (
                                        <TableRow key={student._id} hover>
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
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={marks}
                                                    onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                    inputProps={{ min: 0, max: 100 }}
                                                    sx={{ width: 100 }}
                                                    placeholder="0-100"
                                                    disabled={!selectedSubject}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2"
                                                    sx={{ fontWeight: 700, color: getGradeColor(grade) }}>
                                                    {grade}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
                        disabled={saving || !selectedSubject}
                        sx={{
                            bgcolor: '#059669', '&:hover': { bgcolor: '#047857' },
                            px: 4, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Marks'}
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

export default TeacherGradebook;

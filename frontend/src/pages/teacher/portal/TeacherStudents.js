import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, CircularProgress, Alert, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Button, Chip
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import useTeacherData from '../useTeacherData';

const TeacherStudents = () => {
    const { students, classInfo, loading, error } = useTeacherData();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#059669' }} />
            </Box>
        );
    }

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(s.rollNum).includes(search) ||
        s.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Students</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                {classInfo?.sclassName || 'Class'} — {students.length} student{students.length !== 1 ? 's' : ''}
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search students by name, roll number, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3, bgcolor: '#fff', borderRadius: '8px' }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9ca3af' }} /></InputAdornment>
                }}
            />

            {filtered.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
                    <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {students.length === 0 ? 'No Students Found' : 'No matching students'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {students.length === 0
                            ? 'There are no students assigned to your class yet.'
                            : 'Try adjusting your search.'}
                    </Typography>
                </Paper>
            ) : (
                <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Roll #</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((student) => (
                                    <TableRow key={student._id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#059669', fontSize: '0.85rem' }}>
                                                    {student.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {student.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{student.rollNum}</TableCell>
                                        <TableCell>
                                            <Chip label={student.studentId || 'N/A'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.active !== false ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={student.active !== false ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                onClick={() => navigate(`/teacher-portal/students/${student._id}`)}
                                                sx={{
                                                    borderColor: '#059669', color: '#059669',
                                                    '&:hover': { borderColor: '#047857', bgcolor: '#ecfdf5' },
                                                    textTransform: 'none'
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default TeacherStudents;

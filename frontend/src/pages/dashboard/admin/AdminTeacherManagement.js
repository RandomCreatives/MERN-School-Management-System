import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, InputAdornment, 
    MenuItem, Select, FormControl, InputLabel, Chip, Tooltip
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

const AdminTeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [teacherTypeFilter, setTeacherTypeFilter] = useState('all');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.TEACHERS_ALL);
            if (response.data && Array.isArray(response.data)) {
                setTeachers(response.data);
            }
        } catch (err) {
            console.error('Failed to load teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacherSearchTerm === '' || 
            teacher.name?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
            teacher.teacherId?.toLowerCase().includes(teacherSearchTerm.toLowerCase());
        
        const matchesType = teacherTypeFilter === 'all' || 
            teacher.teacherType === teacherTypeFilter;
        
        return matchesSearch && matchesType;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Teachers Management ({filteredTeachers.length} of {teachers.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                        bgcolor: '#f093fb',
                        '&:hover': { bgcolor: '#e082ea' },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '10px'
                    }}
                >
                    Add Teacher
                </Button>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, email, or teacher ID..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flex: 2 }}
                />
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                        value={teacherTypeFilter}
                        label="Filter by Type"
                        onChange={(e) => setTeacherTypeFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="main_teacher">Main Teacher</MenuItem>
                        <MenuItem value="subject_teacher">Subject Teacher</MenuItem>
                        <MenuItem value="assistant_teacher">Assistant Teacher</MenuItem>
                        <MenuItem value="special_needs_teacher">Special Needs Teacher</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Teachers Table */}
            {loading ? (
                <Typography>Loading teachers...</Typography>
            ) : filteredTeachers.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb', borderRadius: '16px' }}>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        No teachers found.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Teacher ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Assignment</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTeachers.map((teacher) => (
                                <TableRow key={teacher._id} hover>
                                    <TableCell>{teacher.teacherId || 'N/A'}</TableCell>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={teacher.teacherType?.replace('_', ' ').toUpperCase()} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: teacher.teacherType === 'main_teacher' ? '#dbeafe' : 
                                                        teacher.teacherType === 'subject_teacher' ? '#fef3c7' :
                                                        teacher.teacherType === 'special_needs_teacher' ? '#fce7f3' : '#f3f4f6',
                                                color: teacher.teacherType === 'main_teacher' ? '#1e40af' : 
                                                       teacher.teacherType === 'subject_teacher' ? '#92400e' :
                                                       teacher.teacherType === 'special_needs_teacher' ? '#9f1239' : '#374151'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {teacher.teacherType === 'main_teacher' && teacher.homeroomClass?.sclassName && (
                                            <Typography variant="body2">Class: {teacher.homeroomClass.sclassName}</Typography>
                                        )}
                                        {teacher.teacherType === 'subject_teacher' && teacher.primarySubject?.subName && (
                                            <Typography variant="body2">Subject: {teacher.primarySubject.subName}</Typography>
                                        )}
                                        {!teacher.homeroomClass && !teacher.primarySubject && (
                                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>Not assigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <Tooltip title="Edit Teacher">
                                                <Button size="small" sx={{ minWidth: 'auto', p: 0.5, color: '#3b82f6' }}>
                                                    <Edit fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete Teacher">
                                                <Button size="small" sx={{ minWidth: 'auto', p: 0.5, color: '#ef4444' }}>
                                                    <Delete fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AdminTeacherManagement;

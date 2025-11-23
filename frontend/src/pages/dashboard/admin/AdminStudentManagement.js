import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, InputAdornment, 
    MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, 
    DialogContent, DialogActions, Grid, Chip, Switch, FormControlLabel, 
    Divider, Alert, Tooltip
} from '@mui/material';
import { 
    Add, Search, Edit, Delete, SwapHoriz, Close, Phone, Email, 
    ContactPhone, Accessible 
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

const AdminStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [classes, setClasses] = useState([]);
    const [classesData, setClassesData] = useState([]);
    
    // Add Student Dialog states
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rollNum: '',
        password: '',
        studentId: '',
        sclassName: '',
        parentContact: {
            phone: '',
            email: '',
            emergencyContact: ''
        },
        specialNeeds: {
            hasSpecialNeeds: false,
            category: 'none',
            accommodations: [],
            notes: ''
        }
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.STUDENTS_ALL);
            if (response.data && Array.isArray(response.data)) {
                setStudents(response.data);
                
                const uniqueClasses = [...new Set(response.data
                    .filter(s => s.sclassName?.sclassName)
                    .map(s => s.sclassName.sclassName))];
                setClasses(uniqueClasses);
            }
        } catch (err) {
            console.error('Failed to load students:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.CLASSES_ALL);
            if (response.data && Array.isArray(response.data)) {
                setClassesData(response.data);
            }
        } catch (err) {
            console.error('Failed to load classes:', err);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' || 
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNum?.toString().includes(searchTerm) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesClass = classFilter === 'all' || 
            student.sclassName?.sclassName === classFilter;
        
        return matchesSearch && matchesClass;
    });

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setFormData({
            name: '',
            rollNum: '',
            password: '',
            studentId: '',
            sclassName: '',
            parentContact: { phone: '', email: '', emergencyContact: '' },
            specialNeeds: { hasSpecialNeeds: false, category: 'none', accommodations: [], notes: '' }
        });
        setFormErrors({});
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleParentContactChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            parentContact: { ...prev.parentContact, [field]: value }
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.rollNum) errors.rollNum = 'Roll number is required';
        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.sclassName) errors.sclassName = 'Class is required';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitStudent = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        setSubmitError('');
        
        try {
            const adminID = JSON.parse(localStorage.getItem('user'))?.schoolId || 
                           JSON.parse(localStorage.getItem('user'))?._id;
            
            const payload = {
                name: formData.name,
                rollNum: parseInt(formData.rollNum),
                password: formData.password,
                studentId: formData.studentId || undefined,
                sclassName: formData.sclassName,
                adminID: adminID,
                parentContact: formData.parentContact,
                specialNeeds: formData.specialNeeds.hasSpecialNeeds ? formData.specialNeeds : undefined
            };
            
            const response = await axios.post(API_ENDPOINTS.STUDENT_REGISTER, payload);
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseAddDialog();
                    fetchStudents();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to add student:', err);
            setSubmitError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Student Management ({filteredStudents.length} of {students.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAddDialog}
                    sx={{
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5568d3' },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '10px'
                    }}
                >
                    Add Student
                </Button>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, student ID, roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flex: 2 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Class</InputLabel>
                    <Select
                        value={classFilter}
                        label="Filter by Class"
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Classes</MenuItem>
                        {classes.map((className) => (
                            <MenuItem key={className} value={className}>
                                {className}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Students Table */}
            {loading ? (
                <Typography>Loading students...</Typography>
            ) : filteredStudents.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb', borderRadius: '16px' }}>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        No students found.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student._id} hover>
                                    <TableCell>{student.studentId}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.sclassName?.sclassName || 'N/A'}</TableCell>
                                    <TableCell>{student.parentContact?.email || 'N/A'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <Tooltip title="Edit Student">
                                                <Button size="small" sx={{ minWidth: 'auto', p: 0.5, color: '#3b82f6' }}>
                                                    <Edit fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete Student">
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

            {/* Add Student Dialog - Simplified version */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Student</Typography>
                        <Button onClick={handleCloseAddDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                            <Close />
                        </Button>
                    </Box>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>Student added successfully!</Alert>}
                    {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Full Name" name="name" value={formData.name} onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Roll Number" name="rollNum" type="number" value={formData.rollNum} onChange={handleInputChange} error={!!formErrors.rollNum} helperText={formErrors.rollNum} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Student ID (Optional)" name="studentId" value={formData.studentId} onChange={handleInputChange} helperText="Leave blank to auto-generate" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!formErrors.sclassName}>
                                <InputLabel>Class</InputLabel>
                                <Select name="sclassName" value={formData.sclassName} label="Class" onChange={handleInputChange}>
                                    {classesData.map((cls) => (
                                        <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth required label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} error={!!formErrors.password} helperText={formErrors.password || "Minimum 6 characters"} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Parent Phone" value={formData.parentContact.phone} onChange={(e) => handleParentContactChange('phone', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Parent Email" type="email" value={formData.parentContact.email} onChange={(e) => handleParentContactChange('email', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Emergency Contact" value={formData.parentContact.emergencyContact} onChange={(e) => handleParentContactChange('emergencyContact', e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseAddDialog} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitStudent} disabled={loading || submitSuccess} sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' }, textTransform: 'none', fontWeight: 600 }}>
                        {loading ? 'Adding...' : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminStudentManagement;


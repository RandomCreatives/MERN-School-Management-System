import React, { useState, useEffect } from 'react';
import { 
    Box, Tabs, Tab, Typography, Paper, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, InputAdornment, MenuItem, 
    Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, 
    DialogActions, Grid, Chip, Switch, FormControlLabel, Divider, Alert, Tooltip
} from '@mui/material';
import { 
    Dashboard, Schedule, School, Message, Assessment, People, Add, Search, 
    Close, Phone, Email, ContactPhone, Accessible, Edit, Delete, SwapHoriz
} from '@mui/icons-material';
import axios from 'axios';

// Tab Panel Component
function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const AdminDashboardNew = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [classes, setClasses] = useState([]);
    const [classesData, setClassesData] = useState([]); // Full class objects with IDs
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
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openTransferDialog, setOpenTransferDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [transferToClass, setTransferToClass] = useState('');
    const [transferReason, setTransferReason] = useState('');
    
    // Teachers Management State
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [openAddTeacherDialog, setOpenAddTeacherDialog] = useState(false);
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherFormData, setTeacherFormData] = useState({
        name: '',
        email: '',
        password: '',
        teacherId: '',
        teacherType: 'main_teacher',
        homeroomClass: '',
        teachSubjects: [],
        primarySubject: '',
        teachClasses: [],
        specialization: 'general',
        assignedStudents: []
    });
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [teacherTypeFilter, setTeacherTypeFilter] = useState('all');

    useEffect(() => {
        if (currentTab === 1) {
            fetchStudents();
        } else if (currentTab === 3) {
            fetchTeachers();
            fetchSubjects();
        }
    }, [currentTab]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/Students/all');
            if (response.data && Array.isArray(response.data)) {
                setStudents(response.data);
                
                // Extract unique classes
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
            const response = await axios.get('http://localhost:5000/Sclasses');
            if (response.data && Array.isArray(response.data)) {
                setClassesData(response.data);
            }
        } catch (err) {
            console.error('Failed to load classes:', err);
        }
    };

    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
        if (classesData.length === 0) {
            fetchClasses();
        }
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setFormData({
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
        setFormErrors({});
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleParentContactChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            parentContact: {
                ...prev.parentContact,
                [field]: value
            }
        }));
    };

    const handleSpecialNeedsChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            specialNeeds: {
                ...prev.specialNeeds,
                [field]: value
            }
        }));
    };

    const handleAccommodationAdd = (accommodation) => {
        if (accommodation && !formData.specialNeeds.accommodations.includes(accommodation)) {
            setFormData(prev => ({
                ...prev,
                specialNeeds: {
                    ...prev.specialNeeds,
                    accommodations: [...prev.specialNeeds.accommodations, accommodation]
                }
            }));
        }
    };

    const handleAccommodationRemove = (accommodation) => {
        setFormData(prev => ({
            ...prev,
            specialNeeds: {
                ...prev.specialNeeds,
                accommodations: prev.specialNeeds.accommodations.filter(a => a !== accommodation)
            }
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
        
        // Validate email format if provided
        if (formData.parentContact.email && !/\S+@\S+\.\S+/.test(formData.parentContact.email)) {
            errors.parentEmail = 'Invalid email format';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitStudent = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        setSubmitError('');
        
        try {
            // Get admin ID from localStorage
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
            
            const response = await axios.post('http://localhost:5000/StudentReg', payload);
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseAddDialog();
                    fetchStudents(); // Refresh the list
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to add student:', err);
            setSubmitError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Edit Student Handlers
    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            rollNum: student.rollNum,
            password: '',
            studentId: student.studentId,
            sclassName: student.sclassName?._id || student.sclassName,
            parentContact: student.parentContact || {
                phone: '',
                email: '',
                emergencyContact: ''
            },
            specialNeeds: student.specialNeeds || {
                hasSpecialNeeds: false,
                category: 'none',
                accommodations: [],
                notes: ''
            }
        });
        setOpenEditDialog(true);
        if (classesData.length === 0) {
            fetchClasses();
        }
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedStudent(null);
        setFormData({
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
        setFormErrors({});
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleUpdateStudent = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        setSubmitError('');
        
        try {
            const payload = {
                name: formData.name,
                rollNum: parseInt(formData.rollNum),
                studentId: formData.studentId,
                sclassName: formData.sclassName,
                parentContact: formData.parentContact,
                specialNeeds: formData.specialNeeds.hasSpecialNeeds ? formData.specialNeeds : undefined
            };
            
            // Add password only if it's being changed
            if (formData.password) {
                payload.password = formData.password;
            }
            
            const response = await axios.put(`http://localhost:5000/Student/${selectedStudent._id}`, payload);
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseEditDialog();
                    fetchStudents();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to update student:', err);
            setSubmitError(err.response?.data?.message || 'Failed to update student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Transfer Student Handlers
    const handleOpenTransfer = (student) => {
        setSelectedStudent(student);
        setTransferToClass('');
        setTransferReason('');
        setOpenTransferDialog(true);
        if (classesData.length === 0) {
            fetchClasses();
        }
    };

    const handleCloseTransferDialog = () => {
        setOpenTransferDialog(false);
        setSelectedStudent(null);
        setTransferToClass('');
        setTransferReason('');
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleTransferStudent = async () => {
        if (!transferToClass) {
            setSubmitError('Please select a class to transfer to');
            return;
        }
        
        setLoading(true);
        setSubmitError('');
        
        try {
            const response = await axios.put(`http://localhost:5000/Student/${selectedStudent._id}`, {
                sclassName: transferToClass,
                transferHistory: {
                    fromClass: selectedStudent.sclassName?._id,
                    toClass: transferToClass,
                    reason: transferReason
                }
            });
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseTransferDialog();
                    fetchStudents();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to transfer student:', err);
            setSubmitError(err.response?.data?.message || 'Failed to transfer student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete Student Handlers
    const handleOpenDelete = (student) => {
        setSelectedStudent(student);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedStudent(null);
        setSubmitError('');
    };

    const handleDeleteStudent = async () => {
        setLoading(true);
        setSubmitError('');
        
        try {
            const response = await axios.delete(`http://localhost:5000/Student/${selectedStudent._id}`);
            
            if (response.data.message && response.data.message.includes('error')) {
                setSubmitError(response.data.message);
            } else {
                handleCloseDeleteDialog();
                fetchStudents();
            }
        } catch (err) {
            console.error('Failed to delete student:', err);
            setSubmitError(err.response?.data?.message || 'Failed to delete student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Teachers Management Functions
    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/AllTeachers');
            if (response.data && Array.isArray(response.data)) {
                setTeachers(response.data);
            }
        } catch (err) {
            console.error('Failed to load teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const adminID = JSON.parse(localStorage.getItem('user'))?.schoolId || 
                           JSON.parse(localStorage.getItem('user'))?._id;
            const response = await axios.get(`http://localhost:5000/AllSubjects/${adminID}`);
            if (response.data && Array.isArray(response.data)) {
                setSubjects(response.data);
            }
        } catch (err) {
            console.error('Failed to load subjects:', err);
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

    const handleOpenAddTeacherDialog = () => {
        setOpenAddTeacherDialog(true);
        if (classesData.length === 0) fetchClasses();
        if (subjects.length === 0) fetchSubjects();
    };

    const handleCloseAddTeacherDialog = () => {
        setOpenAddTeacherDialog(false);
        setTeacherFormData({
            name: '',
            email: '',
            password: '',
            teacherId: '',
            teacherType: 'main_teacher',
            homeroomClass: '',
            teachSubjects: [],
            primarySubject: '',
            teachClasses: [],
            specialization: 'general',
            assignedStudents: []
        });
        setFormErrors({});
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleTeacherInputChange = (field, value) => {
        setTeacherFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateTeacherForm = () => {
        const errors = {};
        
        if (!teacherFormData.name.trim()) errors.name = 'Name is required';
        if (!teacherFormData.email.trim()) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(teacherFormData.email)) errors.email = 'Invalid email format';
        if (!teacherFormData.password || teacherFormData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!teacherFormData.teacherType) errors.teacherType = 'Teacher type is required';
        
        if (teacherFormData.teacherType === 'main_teacher' && !teacherFormData.homeroomClass) {
            errors.homeroomClass = 'Homeroom class is required for main teachers';
        }
        
        if (teacherFormData.teacherType === 'subject_teacher' && !teacherFormData.primarySubject) {
            errors.primarySubject = 'Primary subject is required for subject teachers';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitTeacher = async () => {
        if (!validateTeacherForm()) return;
        
        setLoading(true);
        setSubmitError('');
        
        try {
            const adminID = JSON.parse(localStorage.getItem('user'))?.schoolId || 
                           JSON.parse(localStorage.getItem('user'))?._id;
            
            const payload = {
                name: teacherFormData.name,
                email: teacherFormData.email,
                password: teacherFormData.password,
                teacherId: teacherFormData.teacherId || undefined,
                teacherType: teacherFormData.teacherType,
                adminID: adminID
            };
            
            if (teacherFormData.teacherType === 'main_teacher') {
                payload.homeroomClass = teacherFormData.homeroomClass;
            } else if (teacherFormData.teacherType === 'subject_teacher') {
                payload.primarySubject = teacherFormData.primarySubject;
                payload.teachClasses = teacherFormData.teachClasses;
            } else if (teacherFormData.teacherType === 'special_needs_teacher') {
                payload.specialization = teacherFormData.specialization;
            }
            
            const response = await axios.post('http://localhost:5000/TeacherReg', payload);
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseAddTeacherDialog();
                    fetchTeachers();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to add teacher:', err);
            setSubmitError(err.response?.data?.message || 'Failed to add teacher. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (teacherId) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return;
        
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/Teacher/${teacherId}`);
            fetchTeachers();
        } catch (err) {
            console.error('Failed to delete teacher:', err);
            alert('Failed to delete teacher. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignDialog = (teacher) => {
        setSelectedTeacher(teacher);
        
        // Pre-fill form with current assignments
        setTeacherFormData({
            name: teacher.name,
            email: teacher.email,
            password: '',
            teacherId: teacher.teacherId,
            teacherType: teacher.teacherType,
            homeroomClass: teacher.homeroomClass?._id || teacher.homeroomClass || '',
            teachSubjects: teacher.teachSubjects || [],
            primarySubject: teacher.primarySubject?._id || teacher.primarySubject || '',
            teachClasses: teacher.teachClasses?.map(c => c._id || c) || [],
            specialization: teacher.specialization || 'general',
            assignedStudents: teacher.assignedStudents || []
        });
        
        setOpenAssignDialog(true);
        if (classesData.length === 0) fetchClasses();
        if (subjects.length === 0) fetchSubjects();
    };

    const handleCloseAssignDialog = () => {
        setOpenAssignDialog(false);
        setSelectedTeacher(null);
        setTeacherFormData({
            name: '',
            email: '',
            password: '',
            teacherId: '',
            teacherType: 'main_teacher',
            homeroomClass: '',
            teachSubjects: [],
            primarySubject: '',
            teachClasses: [],
            specialization: 'general',
            assignedStudents: []
        });
        setFormErrors({});
        setSubmitError('');
        setSubmitSuccess(false);
    };

    const handleUpdateTeacherAssignment = async () => {
        setLoading(true);
        setSubmitError('');
        
        try {
            const payload = {
                teacherType: teacherFormData.teacherType
            };
            
            // Add assignments based on teacher type
            if (teacherFormData.teacherType === 'main_teacher') {
                if (!teacherFormData.homeroomClass) {
                    setSubmitError('Please select a homeroom class');
                    setLoading(false);
                    return;
                }
                payload.homeroomClass = teacherFormData.homeroomClass;
                payload.teachSubjects = teacherFormData.teachSubjects;
            } else if (teacherFormData.teacherType === 'subject_teacher') {
                if (!teacherFormData.primarySubject) {
                    setSubmitError('Please select a primary subject');
                    setLoading(false);
                    return;
                }
                payload.primarySubject = teacherFormData.primarySubject;
                payload.teachClasses = teacherFormData.teachClasses;
                
                // Update the subject's teacher field
                await axios.put('http://localhost:5000/TeacherSubject', {
                    teacherId: selectedTeacher._id,
                    teachSubject: teacherFormData.primarySubject
                });
            } else if (teacherFormData.teacherType === 'special_needs_teacher') {
                payload.specialization = teacherFormData.specialization;
                payload.assignedStudents = teacherFormData.assignedStudents;
            }
            
            // Update teacher with new assignments
            const response = await axios.put(`http://localhost:5000/Teacher/${selectedTeacher._id}`, payload);
            
            if (response.data.message) {
                setSubmitError(response.data.message);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    handleCloseAssignDialog();
                    fetchTeachers();
                }, 1500);
            }
        } catch (err) {
            console.error('Failed to update teacher assignment:', err);
            setSubmitError(err.response?.data?.message || 'Failed to update assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeachSubject = () => {
        const newSubject = {
            subject: '',
            classes: []
        };
        setTeacherFormData(prev => ({
            ...prev,
            teachSubjects: [...prev.teachSubjects, newSubject]
        }));
    };

    const handleRemoveTeachSubject = (index) => {
        setTeacherFormData(prev => ({
            ...prev,
            teachSubjects: prev.teachSubjects.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateTeachSubject = (index, field, value) => {
        setTeacherFormData(prev => {
            const updated = [...prev.teachSubjects];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return {
                ...prev,
                teachSubjects: updated
            };
        });
    };

    // Filter students based on search and class filter
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

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Admin Dashboard
            </Typography>

            <Paper sx={{ borderRadius: 3 }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<Dashboard />} label="Overview" iconPosition="start" />
                    <Tab icon={<People />} label="Student Management" iconPosition="start" />
                    <Tab icon={<Schedule />} label="School Timetable" iconPosition="start" />
                    <Tab icon={<School />} label="Teachers Management" iconPosition="start" />
                    <Tab icon={<Message />} label="Send Messages" iconPosition="start" />
                    <Tab icon={<Assessment />} label="Reports" iconPosition="start" />
                </Tabs>

                {/* Overview Tab */}
                <TabPanel value={currentTab} index={0}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Daily Overview</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total Attendance Today</Typography>
                            <Typography variant="h4" sx={{ color: '#10b981' }}>240/250 (96%)</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending Leave Requests</Typography>
                            <Typography variant="h4" sx={{ color: '#f59e0b' }}>3</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>New Messages</Typography>
                            <Typography variant="h4" sx={{ color: '#3b82f6' }}>7</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#fce7f3', borderLeft: '4px solid #ec4899' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending Reports</Typography>
                            <Typography variant="h4" sx={{ color: '#ec4899' }}>5</Typography>
                        </Paper>
                    </Box>
                </TabPanel>

                {/* Student Management Tab */}
                <TabPanel value={currentTab} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Student Management ({filteredStudents.length} of {students.length} students)
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAddDialog}
                            sx={{
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#333' },
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Add Student
                        </Button>
                    </Box>

                    {/* Search and Filter Bar */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by name, student ID, roll number, or email..."
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

                    {loading ? (
                        <Typography>Loading students...</Typography>
                    ) : filteredStudents.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb' }}>
                            <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                No students found matching your search criteria.
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
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
                                            <TableCell>{student.email || 'N/A'}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Edit Student">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleEditStudent(student)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                p: 0.5,
                                                                color: '#3b82f6',
                                                                '&:hover': { bgcolor: '#dbeafe' }
                                                            }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Transfer Class">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleOpenTransfer(student)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                p: 0.5,
                                                                color: '#f59e0b',
                                                                '&:hover': { bgcolor: '#fef3c7' }
                                                            }}
                                                        >
                                                            <SwapHoriz fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Remove Student">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleOpenDelete(student)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                p: 0.5,
                                                                color: '#ef4444',
                                                                '&:hover': { bgcolor: '#fee2e2' }
                                                            }}
                                                        >
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
                </TabPanel>

                {/* School Timetable Tab */}
                <TabPanel value={currentTab} index={2}>
                    <Typography variant="h6" sx={{ mb: 2 }}>School Timetable Management</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        View, navigate, edit, and assign timetables for each class
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Timetable editor will be implemented here.
                            Features: Create/Edit timetables, Assign teachers to periods, View by class
                        </Typography>
                    </Paper>
                </TabPanel>

                {/* Teachers Management Tab */}
                <TabPanel value={currentTab} index={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Teachers Management ({filteredTeachers.length} of {teachers.length} teachers)
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAddTeacherDialog}
                            sx={{
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#333' },
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Add Teacher
                        </Button>
                    </Box>

                    {/* Search and Filter Bar */}
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

                    {loading ? (
                        <Typography>Loading teachers...</Typography>
                    ) : filteredTeachers.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb' }}>
                            <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                No teachers found matching your search criteria.
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
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
                                                {teacher.teacherType === 'special_needs_teacher' && teacher.specialization && (
                                                    <Typography variant="body2">Spec: {teacher.specialization}</Typography>
                                                )}
                                                {!teacher.homeroomClass && !teacher.primarySubject && !teacher.specialization && (
                                                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Not assigned</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Assign/Edit">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleOpenAssignDialog(teacher)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                p: 0.5,
                                                                color: '#3b82f6',
                                                                '&:hover': { bgcolor: '#dbeafe' }
                                                            }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Remove Teacher">
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleDeleteTeacher(teacher._id)}
                                                            sx={{ 
                                                                minWidth: 'auto', 
                                                                p: 0.5,
                                                                color: '#ef4444',
                                                                '&:hover': { bgcolor: '#fee2e2' }
                                                            }}
                                                        >
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
                </TabPanel>

                {/* Send Messages Tab */}
                <TabPanel value={currentTab} index={4}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Send Messages</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        Compose and send messages to teachers and classes
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Message composer will be implemented here.
                            Features: Select recipients (individual teachers, multiple teachers, or entire classes), Compose message, Send
                        </Typography>
                    </Paper>
                </TabPanel>

                {/* Reports Tab */}
                <TabPanel value={currentTab} index={5}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Reports Management</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        View and download reports from teachers and classes
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Reports repository will be implemented here.
                            Features: View submitted reports, Download reports, Filter by class/teacher/date
                        </Typography>
                    </Paper>
                </TabPanel>
            </Paper>

            {/* Add Student Dialog */}
            <Dialog 
                open={openAddDialog} 
                onClose={handleCloseAddDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Student</Typography>
                    <Button onClick={handleCloseAddDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Student added successfully!
                        </Alert>
                    )}
                    
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Roll Number"
                                name="rollNum"
                                type="number"
                                value={formData.rollNum}
                                onChange={handleInputChange}
                                error={!!formErrors.rollNum}
                                helperText={formErrors.rollNum}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Student ID (Optional)"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleInputChange}
                                helperText="Leave blank to auto-generate"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!formErrors.sclassName}>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    name="sclassName"
                                    value={formData.sclassName}
                                    label="Class"
                                    onChange={handleInputChange}
                                >
                                    {classesData.map((cls) => (
                                        <MenuItem key={cls._id} value={cls._id}>
                                            {cls.sclassName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.sclassName && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {formErrors.sclassName}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                error={!!formErrors.password}
                                helperText={formErrors.password || "Minimum 6 characters"}
                            />
                        </Grid>

                        {/* Parent/Guardian Contact */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                                Parent/Guardian Contact
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.parentContact.phone}
                                onChange={(e) => handleParentContactChange('phone', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.parentContact.email}
                                onChange={(e) => handleParentContactChange('email', e.target.value)}
                                error={!!formErrors.parentEmail}
                                helperText={formErrors.parentEmail}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Emergency Contact"
                                value={formData.parentContact.emergencyContact}
                                onChange={(e) => handleParentContactChange('emergencyContact', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ContactPhone fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Special Needs */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                                Special Needs & Accommodations
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.specialNeeds.hasSpecialNeeds}
                                        onChange={(e) => handleSpecialNeedsChange('hasSpecialNeeds', e.target.checked)}
                                    />
                                }
                                label="Student has special needs"
                            />
                        </Grid>

                        {formData.specialNeeds.hasSpecialNeeds && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={formData.specialNeeds.category}
                                            label="Category"
                                            onChange={(e) => handleSpecialNeedsChange('category', e.target.value)}
                                        >
                                            <MenuItem value="learning">Learning Disability</MenuItem>
                                            <MenuItem value="physical">Physical Disability</MenuItem>
                                            <MenuItem value="behavioral">Behavioral</MenuItem>
                                            <MenuItem value="medical">Medical Condition</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Add Accommodation"
                                        placeholder="Press Enter to add"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAccommodationAdd(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Accessible fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {formData.specialNeeds.accommodations.map((acc, index) => (
                                            <Chip
                                                key={index}
                                                label={acc}
                                                onDelete={() => handleAccommodationRemove(acc)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Additional Notes"
                                        value={formData.specialNeeds.notes}
                                        onChange={(e) => handleSpecialNeedsChange('notes', e.target.value)}
                                        placeholder="Any additional information about accommodations or special needs..."
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseAddDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleSubmitStudent}
                        disabled={loading || submitSuccess}
                        sx={{
                            bgcolor: '#000',
                            '&:hover': { bgcolor: '#333' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog 
                open={openEditDialog} 
                onClose={handleCloseEditDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Student</Typography>
                    <Button onClick={handleCloseEditDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Student updated successfully!
                        </Alert>
                    )}
                    
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Same form fields as Add Student */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Roll Number"
                                name="rollNum"
                                type="number"
                                value={formData.rollNum}
                                onChange={handleInputChange}
                                error={!!formErrors.rollNum}
                                helperText={formErrors.rollNum}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Student ID"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleInputChange}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!formErrors.sclassName}>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    name="sclassName"
                                    value={formData.sclassName}
                                    label="Class"
                                    onChange={handleInputChange}
                                >
                                    {classesData.map((cls) => (
                                        <MenuItem key={cls._id} value={cls._id}>
                                            {cls.sclassName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="New Password (leave blank to keep current)"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                helperText="Only fill if you want to change the password"
                            />
                        </Grid>

                        {/* Parent Contact - Same as Add */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                                Parent/Guardian Contact
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.parentContact.phone}
                                onChange={(e) => handleParentContactChange('phone', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.parentContact.email}
                                onChange={(e) => handleParentContactChange('email', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Emergency Contact"
                                value={formData.parentContact.emergencyContact}
                                onChange={(e) => handleParentContactChange('emergencyContact', e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ContactPhone fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseEditDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleUpdateStudent}
                        disabled={loading || submitSuccess}
                        sx={{
                            bgcolor: '#3b82f6',
                            '&:hover': { bgcolor: '#2563eb' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Transfer Student Dialog */}
            <Dialog 
                open={openTransferDialog} 
                onClose={handleCloseTransferDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Transfer Student</Typography>
                    <Button onClick={handleCloseTransferDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Student transferred successfully!
                        </Alert>
                    )}
                    
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    {selectedStudent && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                Transferring: <strong>{selectedStudent.name}</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Current Class: <strong>{selectedStudent.sclassName?.sclassName || 'N/A'}</strong>
                            </Typography>
                        </Box>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Transfer to Class</InputLabel>
                        <Select
                            value={transferToClass}
                            label="Transfer to Class"
                            onChange={(e) => setTransferToClass(e.target.value)}
                        >
                            {classesData
                                .filter(cls => cls._id !== selectedStudent?.sclassName?._id)
                                .map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.sclassName}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason for Transfer (Optional)"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        placeholder="e.g., Academic performance, Behavioral issues, Parent request..."
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseTransferDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleTransferStudent}
                        disabled={loading || submitSuccess}
                        sx={{
                            bgcolor: '#f59e0b',
                            '&:hover': { bgcolor: '#d97706' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Transferring...' : 'Transfer Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Student Dialog */}
            <Dialog 
                open={openDeleteDialog} 
                onClose={handleCloseDeleteDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                        Remove Student
                    </Typography>
                    <Button onClick={handleCloseDeleteDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    {selectedStudent && (
                        <Box>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Are you sure you want to remove this student?
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {selectedStudent.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Student ID: {selectedStudent.studentId}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Class: {selectedStudent.sclassName?.sclassName || 'N/A'}
                                </Typography>
                            </Paper>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                This action cannot be undone. All student data including attendance and exam results will be permanently deleted.
                            </Alert>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseDeleteDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleDeleteStudent}
                        disabled={loading}
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Removing...' : 'Remove Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Teacher Dialog */}
            <Dialog 
                open={openAddTeacherDialog} 
                onClose={handleCloseAddTeacherDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Teacher</Typography>
                    <Button onClick={handleCloseAddTeacherDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Teacher added successfully!
                        </Alert>
                    )}
                    
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Full Name"
                                value={teacherFormData.name}
                                onChange={(e) => handleTeacherInputChange('name', e.target.value)}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Email"
                                type="email"
                                value={teacherFormData.email}
                                onChange={(e) => handleTeacherInputChange('email', e.target.value)}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Teacher ID (Optional)"
                                value={teacherFormData.teacherId}
                                onChange={(e) => handleTeacherInputChange('teacherId', e.target.value)}
                                helperText="Leave blank to auto-generate"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Password"
                                type="password"
                                value={teacherFormData.password}
                                onChange={(e) => handleTeacherInputChange('password', e.target.value)}
                                error={!!formErrors.password}
                                helperText={formErrors.password || "Minimum 6 characters"}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                                Role & Assignment
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth required error={!!formErrors.teacherType}>
                                <InputLabel>Teacher Type</InputLabel>
                                <Select
                                    value={teacherFormData.teacherType}
                                    label="Teacher Type"
                                    onChange={(e) => handleTeacherInputChange('teacherType', e.target.value)}
                                >
                                    <MenuItem value="main_teacher">Main Teacher (Homeroom)</MenuItem>
                                    <MenuItem value="subject_teacher">Subject Teacher</MenuItem>
                                    <MenuItem value="assistant_teacher">Assistant Teacher</MenuItem>
                                    <MenuItem value="special_needs_teacher">Special Needs Teacher</MenuItem>
                                </Select>
                                {formErrors.teacherType && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {formErrors.teacherType}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        {teacherFormData.teacherType === 'main_teacher' && (
                            <>
                                <Grid item xs={12}>
                                    <FormControl fullWidth required error={!!formErrors.homeroomClass}>
                                        <InputLabel>Homeroom Class</InputLabel>
                                        <Select
                                            value={teacherFormData.homeroomClass}
                                            label="Homeroom Class"
                                            onChange={(e) => handleTeacherInputChange('homeroomClass', e.target.value)}
                                        >
                                            {classesData.map((cls) => (
                                                <MenuItem key={cls._id} value={cls._id}>
                                                    {cls.sclassName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {formErrors.homeroomClass && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                {formErrors.homeroomClass}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Subjects to Teach (Optional, Max 4)
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={handleAddTeachSubject}
                                            disabled={teacherFormData.teachSubjects.length >= 4}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Add Subject
                                        </Button>
                                    </Box>
                                </Grid>

                                {teacherFormData.teachSubjects.map((teachSubject, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Subject {index + 1}</InputLabel>
                                                        <Select
                                                            value={teachSubject.subject}
                                                            label={`Subject ${index + 1}`}
                                                            onChange={(e) => handleUpdateTeachSubject(index, 'subject', e.target.value)}
                                                        >
                                                            {subjects.map((subject) => (
                                                                <MenuItem key={subject._id} value={subject._id}>
                                                                    {subject.subName} ({subject.subCode}) - {subject.sclassName?.sclassName || 'N/A'}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <Button
                                                        color="error"
                                                        onClick={() => handleRemoveTeachSubject(index)}
                                                        sx={{ minWidth: 'auto', p: 1 }}
                                                    >
                                                        <Delete />
                                                    </Button>
                                                </Box>
                                                <FormControl fullWidth>
                                                    <InputLabel>Classes to Teach This Subject</InputLabel>
                                                    <Select
                                                        multiple
                                                        value={teachSubject.classes || []}
                                                        label="Classes to Teach This Subject"
                                                        onChange={(e) => handleUpdateTeachSubject(index, 'classes', e.target.value)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => {
                                                                    const cls = classesData.find(c => c._id === value);
                                                                    return <Chip key={value} label={cls?.sclassName} size="small" />;
                                                                })}
                                                            </Box>
                                                        )}
                                                    >
                                                        {classesData.map((cls) => (
                                                            <MenuItem key={cls._id} value={cls._id}>
                                                                {cls.sclassName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </>
                        )}

                        {teacherFormData.teacherType === 'subject_teacher' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required error={!!formErrors.primarySubject}>
                                        <InputLabel>Primary Subject</InputLabel>
                                        <Select
                                            value={teacherFormData.primarySubject}
                                            label="Primary Subject"
                                            onChange={(e) => handleTeacherInputChange('primarySubject', e.target.value)}
                                        >
                                            {subjects.map((subject) => (
                                                <MenuItem key={subject._id} value={subject._id}>
                                                    {subject.subName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {formErrors.primarySubject && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                {formErrors.primarySubject}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Teach Classes</InputLabel>
                                        <Select
                                            multiple
                                            value={teacherFormData.teachClasses}
                                            label="Teach Classes"
                                            onChange={(e) => handleTeacherInputChange('teachClasses', e.target.value)}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const cls = classesData.find(c => c._id === value);
                                                        return <Chip key={value} label={cls?.sclassName} size="small" />;
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {classesData.map((cls) => (
                                                <MenuItem key={cls._id} value={cls._id}>
                                                    {cls.sclassName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        {teacherFormData.teacherType === 'special_needs_teacher' && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Specialization</InputLabel>
                                    <Select
                                        value={teacherFormData.specialization}
                                        label="Specialization"
                                        onChange={(e) => handleTeacherInputChange('specialization', e.target.value)}
                                    >
                                        <MenuItem value="general">General</MenuItem>
                                        <MenuItem value="learning">Learning Disabilities</MenuItem>
                                        <MenuItem value="physical">Physical Disabilities</MenuItem>
                                        <MenuItem value="behavioral">Behavioral Support</MenuItem>
                                        <MenuItem value="medical">Medical Support</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseAddTeacherDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleSubmitTeacher}
                        disabled={loading || submitSuccess}
                        sx={{
                            bgcolor: '#000',
                            '&:hover': { bgcolor: '#333' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Teacher'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Teacher Dialog */}
            <Dialog 
                open={openAssignDialog} 
                onClose={handleCloseAssignDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Assign Teacher</Typography>
                    <Button onClick={handleCloseAssignDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
                        <Close />
                    </Button>
                </DialogTitle>
                
                <DialogContent dividers>
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Teacher assignment updated successfully!
                        </Alert>
                    )}
                    
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {submitError}
                        </Alert>
                    )}

                    {selectedTeacher && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Teacher: <strong>{selectedTeacher.name}</strong> ({selectedTeacher.email})
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                        Type: <strong>{selectedTeacher.teacherType?.replace('_', ' ').toUpperCase()}</strong>
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Main Teacher Assignments */}
                            {teacherFormData.teacherType === 'main_teacher' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            Homeroom Class Assignment
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Homeroom Class</InputLabel>
                                            <Select
                                                value={teacherFormData.homeroomClass}
                                                label="Homeroom Class"
                                                onChange={(e) => handleTeacherInputChange('homeroomClass', e.target.value)}
                                            >
                                                {classesData.map((cls) => (
                                                    <MenuItem key={cls._id} value={cls._id}>
                                                        {cls.sclassName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Subjects to Teach (Max 4)
                                            </Typography>
                                            <Button
                                                size="small"
                                                startIcon={<Add />}
                                                onClick={handleAddTeachSubject}
                                                disabled={teacherFormData.teachSubjects.length >= 4}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Add Subject
                                            </Button>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>

                                    {teacherFormData.teachSubjects.map((teachSubject, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Subject {index + 1}</InputLabel>
                                                            <Select
                                                                value={teachSubject.subject}
                                                                label={`Subject ${index + 1}`}
                                                                onChange={(e) => handleUpdateTeachSubject(index, 'subject', e.target.value)}
                                                            >
                                                                {subjects.map((subject) => (
                                                                    <MenuItem key={subject._id} value={subject._id}>
                                                                        {subject.subName} ({subject.subCode}) - {subject.sclassName?.sclassName || 'N/A'}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                        <Button
                                                            color="error"
                                                            onClick={() => handleRemoveTeachSubject(index)}
                                                            sx={{ minWidth: 'auto', p: 1 }}
                                                        >
                                                            <Delete />
                                                        </Button>
                                                    </Box>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Classes to Teach This Subject</InputLabel>
                                                        <Select
                                                            multiple
                                                            value={teachSubject.classes || []}
                                                            label="Classes to Teach This Subject"
                                                            onChange={(e) => handleUpdateTeachSubject(index, 'classes', e.target.value)}
                                                            renderValue={(selected) => (
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {selected.map((value) => {
                                                                        const cls = classesData.find(c => c._id === value);
                                                                        return <Chip key={value} label={cls?.sclassName} size="small" />;
                                                                    })}
                                                                </Box>
                                                            )}
                                                        >
                                                            {classesData.map((cls) => (
                                                                <MenuItem key={cls._id} value={cls._id}>
                                                                    {cls.sclassName}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </>
                            )}

                            {/* Subject Teacher Assignments */}
                            {teacherFormData.teacherType === 'subject_teacher' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            Subject Assignment
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Primary Subject</InputLabel>
                                            <Select
                                                value={teacherFormData.primarySubject}
                                                label="Primary Subject"
                                                onChange={(e) => handleTeacherInputChange('primarySubject', e.target.value)}
                                            >
                                                {subjects.map((subject) => (
                                                    <MenuItem key={subject._id} value={subject._id}>
                                                        {subject.subName} ({subject.subCode})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Classes to Teach</InputLabel>
                                            <Select
                                                multiple
                                                value={teacherFormData.teachClasses}
                                                label="Classes to Teach"
                                                onChange={(e) => handleTeacherInputChange('teachClasses', e.target.value)}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const cls = classesData.find(c => c._id === value);
                                                            return <Chip key={value} label={cls?.sclassName} size="small" />;
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {classesData.map((cls) => (
                                                    <MenuItem key={cls._id} value={cls._id}>
                                                        {cls.sclassName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
                                            Select all classes where this teacher will teach {subjects.find(s => s._id === teacherFormData.primarySubject)?.subName || 'this subject'}
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            {/* Assistant Teacher Assignments */}
                            {teacherFormData.teacherType === 'assistant_teacher' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            Support Assignment
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Support Classes</InputLabel>
                                            <Select
                                                multiple
                                                value={teacherFormData.teachClasses}
                                                label="Support Classes"
                                                onChange={(e) => handleTeacherInputChange('teachClasses', e.target.value)}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const cls = classesData.find(c => c._id === value);
                                                            return <Chip key={value} label={cls?.sclassName} size="small" />;
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {classesData.map((cls) => (
                                                    <MenuItem key={cls._id} value={cls._id}>
                                                        {cls.sclassName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            {/* Special Needs Teacher Assignments */}
                            {teacherFormData.teacherType === 'special_needs_teacher' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                            Specialization
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Specialization</InputLabel>
                                            <Select
                                                value={teacherFormData.specialization}
                                                label="Specialization"
                                                onChange={(e) => handleTeacherInputChange('specialization', e.target.value)}
                                            >
                                                <MenuItem value="general">General</MenuItem>
                                                <MenuItem value="learning">Learning Disabilities</MenuItem>
                                                <MenuItem value="physical">Physical Disabilities</MenuItem>
                                                <MenuItem value="behavioral">Behavioral Support</MenuItem>
                                                <MenuItem value="medical">Medical Support</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Alert severity="info">
                                            Students with special needs will be automatically assigned based on their special needs category matching this teacher's specialization.
                                        </Alert>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseAssignDialog}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleUpdateTeacherAssignment}
                        disabled={loading || submitSuccess}
                        sx={{
                            bgcolor: '#3b82f6',
                            '&:hover': { bgcolor: '#2563eb' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Assignment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboardNew;

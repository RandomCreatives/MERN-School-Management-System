import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, CircularProgress, Alert, Button, TextField,
    Card, CardContent, Avatar, Chip, Divider, Snackbar, IconButton
} from '@mui/material';
import {
    Person, Email, School, Class, MenuBook, Badge, Edit, Save, Cancel,
    Lock, Visibility, VisibilityOff
} from '@mui/icons-material';
import axios from 'axios';
import useTeacherData from '../useTeacherData';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherProfile = () => {
    const { teacher, classInfo, loading, error, refetch } = useTeacherData();

    // Edit mode state
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });
    const [saving, setSaving] = useState(false);

    // Password change state
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (teacher) {
            setEditData({ name: teacher.name || '', email: teacher.email || '' });
        }
    }, [teacher]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#059669' }} /></Box>;
    }

    if (error || !teacher) {
        return <Paper sx={{ p: 4 }}><Alert severity="error">{error || 'Teacher not found'}</Alert></Paper>;
    }

    const handleSaveProfile = async () => {
        if (!editData.name.trim()) {
            setSnackbar({ open: true, message: 'Name is required', severity: 'error' });
            return;
        }
        if (!editData.email.trim()) {
            setSnackbar({ open: true, message: 'Email is required', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            const res = await axios.put(`${API_BASE}/Teacher/${teacher._id}`, {
                name: editData.name.trim(),
                email: editData.email.trim()
            });

            if (res.data && !res.data.message) {
                // Update localStorage
                localStorage.setItem('teacherName', editData.name.trim());
                localStorage.setItem('teacherEmail', editData.email.trim());
                const storedData = JSON.parse(localStorage.getItem('teacherData') || '{}');
                storedData.name = editData.name.trim();
                storedData.email = editData.email.trim();
                localStorage.setItem('teacherData', JSON.stringify(storedData));

                // Also update the Redux-compatible user store
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                if (userData._id) {
                    userData.name = editData.name.trim();
                    userData.email = editData.email.trim();
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                setEditing(false);
                setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
                refetch();
            } else {
                setSnackbar({ open: true, message: res.data?.message || 'Update failed', severity: 'error' });
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.newPassword) {
            setSnackbar({ open: true, message: 'Please enter a new password', severity: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 4) {
            setSnackbar({ open: true, message: 'Password must be at least 4 characters', severity: 'error' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
            return;
        }

        setSavingPassword(true);
        try {
            const res = await axios.put(`${API_BASE}/Teacher/${teacher._id}`, {
                password: passwordData.newPassword
            });

            if (res.data && !res.data.message) {
                setChangingPassword(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: res.data?.message || 'Password change failed', severity: 'error' });
            }
        } catch (err) {
            console.error('Password change error:', err);
            setSnackbar({ open: true, message: 'Failed to change password', severity: 'error' });
        } finally {
            setSavingPassword(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditData({ name: teacher.name || '', email: teacher.email || '' });
    };

    const InfoRow = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
            <Box sx={{ color: '#059669', mr: 2, display: 'flex' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>{label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{value || 'N/A'}</Typography>
            </Box>
        </Box>
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>My Profile</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                View and manage your profile information.
            </Typography>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '12px', textAlign: 'center', overflow: 'visible' }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            pt: 4, pb: 6, px: 3, position: 'relative'
                        }}>
                            <Avatar sx={{
                                width: 80, height: 80, mx: 'auto',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                fontSize: '2rem', fontWeight: 700,
                                border: '4px solid rgba(255,255,255,0.3)'
                            }}>
                                {teacher.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mt: 2 }}>
                                {teacher.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                {teacher.email}
                            </Typography>
                        </Box>
                        <CardContent sx={{ mt: -2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={teacher.role || 'Teacher'} color="primary" size="small" />
                                <Chip label={teacher.teacherType?.replace('_', ' ') || 'Teacher'} variant="outlined" size="small"
                                    sx={{ textTransform: 'capitalize' }} />
                            </Box>
                            {teacher.teacherId && (
                                <Typography variant="body2" sx={{ color: '#6b7280', mt: 2 }}>
                                    Teacher ID: <strong>{teacher.teacherId}</strong>
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Details */}
                <Grid item xs={12} md={8}>
                    {/* Info Section */}
                    <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
                            {!editing ? (
                                <Button startIcon={<Edit />} onClick={() => setEditing(true)}
                                    sx={{ color: '#059669', textTransform: 'none' }}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button startIcon={<Cancel />} onClick={handleCancelEdit}
                                        sx={{ color: '#6b7280', textTransform: 'none' }}>Cancel</Button>
                                    <Button startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                                        onClick={handleSaveProfile} disabled={saving} variant="contained"
                                        sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, textTransform: 'none' }}>
                                        Save
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {editing ? (
                            <Box>
                                <TextField fullWidth label="Name" value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    sx={{ mb: 2 }} required />
                                <TextField fullWidth label="Email" type="email" value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    required />
                            </Box>
                        ) : (
                            <Box>
                                <InfoRow icon={<Person />} label="Full Name" value={teacher.name} />
                                <InfoRow icon={<Email />} label="Email" value={teacher.email} />
                                <InfoRow icon={<Badge />} label="Teacher ID" value={teacher.teacherId} />
                                <InfoRow icon={<School />} label="School" value={teacher.school?.schoolName} />
                                <InfoRow icon={<Class />} label="Class" value={classInfo?.sclassName} />
                                <InfoRow icon={<MenuBook />} label="Subject" value={teacher.teachSubject?.subName} />
                            </Box>
                        )}
                    </Paper>

                    {/* Password Section */}
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Security</Typography>
                            {!changingPassword && (
                                <Button startIcon={<Lock />} onClick={() => setChangingPassword(true)}
                                    sx={{ color: '#059669', textTransform: 'none' }}>
                                    Change Password
                                </Button>
                            )}
                        </Box>

                        {changingPassword ? (
                            <Box>
                                <TextField
                                    fullWidth label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    }}
                                />
                                <TextField
                                    fullWidth label="Confirm New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button onClick={() => { setChangingPassword(false); setPasswordData({ newPassword: '', confirmPassword: '' }); }}
                                        sx={{ color: '#6b7280', textTransform: 'none' }}>Cancel</Button>
                                    <Button
                                        variant="contained"
                                        startIcon={savingPassword ? <CircularProgress size={16} /> : <Save />}
                                        onClick={handleChangePassword}
                                        disabled={savingPassword}
                                        sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, textTransform: 'none' }}
                                    >
                                        {savingPassword ? 'Saving...' : 'Update Password'}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Your password can be changed at any time. Use a strong password with at least 4 characters.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

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

export default TeacherProfile;

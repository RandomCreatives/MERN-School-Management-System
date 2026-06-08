import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box, Typography, Paper, Grid, Button, TextField, Card, CardContent,
    Avatar, Divider, Snackbar, Alert, IconButton, CircularProgress
} from '@mui/material';
import { Person, Email, School, Edit, Save, Cancel, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { updateUser } from '../../redux/userRelated/userHandle';
import { authSuccess } from '../../redux/userRelated/userSlice';

const AdminProfile = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        schoolName: currentUser?.schoolName || ''
    });
    const [saving, setSaving] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleSaveProfile = async () => {
        if (!editData.name.trim() || !editData.email.trim()) {
            setSnackbar({ open: true, message: 'Name and email are required', severity: 'error' });
            return;
        }
        setSaving(true);
        try {
            await dispatch(updateUser(
                { name: editData.name.trim(), email: editData.email.trim() },
                currentUser._id,
                'Admin'
            ));
            // Manually update Redux state with new info
            const updatedUser = { ...currentUser, name: editData.name.trim(), email: editData.email.trim() };
            dispatch(authSuccess(updatedUser));
            setEditing(false);
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.newPassword || passwordData.newPassword.length < 4) {
            setSnackbar({ open: true, message: 'Password must be at least 4 characters', severity: 'error' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
            return;
        }
        setSavingPassword(true);
        try {
            await dispatch(updateUser(
                { password: passwordData.newPassword },
                currentUser._id,
                'Admin'
            ));
            setChangingPassword(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to change password', severity: 'error' });
        } finally {
            setSavingPassword(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditData({ name: currentUser?.name || '', email: currentUser?.email || '', schoolName: currentUser?.schoolName || '' });
    };

    const InfoRow = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
            <Box sx={{ color: '#7f56da', mr: 2, display: 'flex' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>{label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{value || 'N/A'}</Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Admin Profile</Typography>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '12px', textAlign: 'center' }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #7f56da 0%, #9333ea 100%)',
                            pt: 4, pb: 6, px: 3
                        }}>
                            <Avatar sx={{
                                width: 80, height: 80, mx: 'auto',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                fontSize: '2rem', fontWeight: 700,
                                border: '4px solid rgba(255,255,255,0.3)'
                            }}>
                                {currentUser?.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mt: 2 }}>
                                {currentUser?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                {currentUser?.email}
                            </Typography>
                        </Box>
                        <CardContent sx={{ mt: -2 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                                School: <strong>{currentUser?.schoolName}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                Role: Administrator
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Details */}
                <Grid item xs={12} md={8}>
                    {/* Personal Info */}
                    <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
                            {!editing ? (
                                <Button startIcon={<Edit />} onClick={() => setEditing(true)}
                                    sx={{ color: '#7f56da', textTransform: 'none' }}>Edit</Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button startIcon={<Cancel />} onClick={handleCancelEdit}
                                        sx={{ color: '#6b7280', textTransform: 'none' }}>Cancel</Button>
                                    <Button startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                                        onClick={handleSaveProfile} disabled={saving} variant="contained"
                                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none' }}>Save</Button>
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
                                    sx={{ mb: 2 }} required />
                                <TextField fullWidth label="School Name" value={editData.schoolName} disabled
                                    helperText="School name cannot be changed" />
                            </Box>
                        ) : (
                            <Box>
                                <InfoRow icon={<Person />} label="Full Name" value={currentUser?.name} />
                                <InfoRow icon={<Email />} label="Email" value={currentUser?.email} />
                                <InfoRow icon={<School />} label="School Name" value={currentUser?.schoolName} />
                            </Box>
                        )}
                    </Paper>

                    {/* Password */}
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Security</Typography>
                            {!changingPassword && (
                                <Button startIcon={<Lock />} onClick={() => setChangingPassword(true)}
                                    sx={{ color: '#7f56da', textTransform: 'none' }}>Change Password</Button>
                            )}
                        </Box>

                        {changingPassword ? (
                            <Box>
                                <TextField fullWidth label="New Password"
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
                                    }} />
                                <TextField fullWidth label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button onClick={() => { setChangingPassword(false); setPasswordData({ newPassword: '', confirmPassword: '' }); }}
                                        sx={{ color: '#6b7280', textTransform: 'none' }}>Cancel</Button>
                                    <Button variant="contained"
                                        startIcon={savingPassword ? <CircularProgress size={16} /> : <Save />}
                                        onClick={handleChangePassword} disabled={savingPassword}
                                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none' }}>
                                        {savingPassword ? 'Saving...' : 'Update Password'}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Your password can be changed at any time. Use a strong password.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminProfile

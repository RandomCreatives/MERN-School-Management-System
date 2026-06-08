import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Switch, FormControlLabel, Divider, Button, Dialog,
    DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Logout, DarkMode, Notifications } from '@mui/icons-material';

const TeacherSettings = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('teacherAccess');
        localStorage.removeItem('teacherId');
        localStorage.removeItem('teacherName');
        localStorage.removeItem('teacherEmail');
        localStorage.removeItem('teacherRole');
        localStorage.removeItem('teacherData');
        localStorage.removeItem('user');
        navigate('/teacher-login');
    };

    const SettingItem = ({ icon, title, description, action }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <Box sx={{ color: '#059669', mr: 2, display: 'flex' }}>{icon}</Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>{description}</Typography>
            </Box>
            {action}
        </Box>
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Settings</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                Manage your preferences and account settings.
            </Typography>

            {/* Appearance */}
            <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Appearance</Typography>
                <Divider sx={{ mb: 1 }} />
                <SettingItem
                    icon={<DarkMode />}
                    title="Dark Mode"
                    description="Toggle dark theme (coming soon)"
                    action={
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} disabled />}
                            label=""
                        />
                    }
                />
            </Paper>

            {/* Notifications */}
            <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Notifications</Typography>
                <Divider sx={{ mb: 1 }} />
                <SettingItem
                    icon={<Notifications />}
                    title="Email Notifications"
                    description="Receive notifications via email"
                    action={
                        <FormControlLabel
                            control={<Switch checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />}
                            label=""
                        />
                    }
                />
            </Paper>

            {/* Account */}
            <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Account</Typography>
                <Divider sx={{ mb: 1 }} />
                <SettingItem
                    icon={<Logout />}
                    title="Logout"
                    description="Sign out of your teacher account"
                    action={
                        <Button variant="outlined" color="error" onClick={() => setLogoutDialogOpen(true)}
                            sx={{ textTransform: 'none' }}>
                            Logout
                        </Button>
                    }
                />
            </Paper>

            {/* Logout Dialog */}
            <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out of the Teacher Portal?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherSettings;

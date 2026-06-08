import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider,
    Badge
} from '@mui/material';
import {
    Home, Class, Assignment, Grade, People, CalendarMonth, Message,
    Settings, Logout, Menu as MenuIcon, Notifications,
    CheckCircle, School, Announcement, Report, Person
} from '@mui/icons-material';

// Import teacher pages
import TeacherHome from './portal/TeacherHome';
import TeacherClasses from './portal/TeacherClasses';
import TeacherAttendance from './portal/TeacherAttendance';
import TeacherGradebook from './portal/TeacherGradebook';
import TeacherStudents from './portal/TeacherStudents';
import TeacherStudentView from './portal/TeacherStudentView';
import TeacherProfile from './portal/TeacherProfile';
import TeacherSettings from './portal/TeacherSettings';
import TeacherNotices from './portal/TeacherNotices';
import TeacherComplain from './portal/TeacherComplain';

const drawerWidth = 260;

const TeacherPortalDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    // Get teacher data from localStorage
    const teacherData = useMemo(() => {
        try {
            const stored = localStorage.getItem('teacherData');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    }, []);

    const teacherName = teacherData?.name || localStorage.getItem('teacherName') || 'Teacher';
    const teacherEmail = teacherData?.email || localStorage.getItem('teacherEmail') || '';

    // Auth guard
    useEffect(() => {
        const access = localStorage.getItem('teacherAccess');
        if (!access) {
            navigate('/teacher-login');
        }
    }, [navigate]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);
    const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
    const handleNotificationClose = () => setNotificationAnchor(null);

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

    const menuItems = [
        { text: 'Home', icon: <Home />, path: '/teacher-portal/home' },
        { divider: true },
        { text: 'My Class', icon: <Class />, path: '/teacher-portal/class' },
        { text: 'Students', icon: <People />, path: '/teacher-portal/students' },
        { text: 'Attendance', icon: <CheckCircle />, path: '/teacher-portal/attendance' },
        { text: 'Gradebook', icon: <Grade />, path: '/teacher-portal/gradebook' },
        { divider: true },
        { text: 'Notices', icon: <Announcement />, path: '/teacher-portal/notices' },
        { text: 'Complain', icon: <Report />, path: '/teacher-portal/complain' },
        { divider: true },
        { text: 'Profile', icon: <Person />, path: '/teacher-portal/profile' },
        { text: 'Settings', icon: <Settings />, path: '/teacher-portal/settings' },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        bgcolor: '#059669', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff'
                    }}>T</Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Teacher Portal
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                            School Management System
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mt: 1 }}>
                    {getGreeting()}, {teacherName.split(' ')[0]}! 👋
                </Typography>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1.5, py: 2, overflow: 'auto' }}>
                {menuItems.map((item, index) => {
                    if (item.divider) return <Divider key={`d-${index}`} sx={{ my: 1 }} />;
                    const active = isActive(item.path);
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                sx={{
                                    borderRadius: '8px', py: 1,
                                    bgcolor: active ? '#ecfdf5' : 'transparent',
                                    '&:hover': { bgcolor: active ? '#d1fae5' : '#f5f5f5' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: active ? '#059669' : '#666' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: active ? 600 : 500,
                                        color: active ? '#059669' : '#333'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom */}
            <Divider />
            <Box sx={{ p: 1.5 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#fee2e2' } }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: '#dc2626' }}><Logout /></ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: '#fff', color: '#000',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    borderBottom: '1px solid #f0f0f0'
                }}
            >
                <Toolbar>
                    <IconButton edge="start" onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: '#000' }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', fontSize: '1rem', flexGrow: 1 }}>
                        Teacher Dashboard
                    </Typography>

                    {/* Notifications */}
                    <IconButton onClick={handleNotificationOpen} sx={{ mr: 1 }}>
                        <Badge badgeContent={0} color="error"><Notifications /></Badge>
                    </IconButton>
                    <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)}
                        onClose={handleNotificationClose}
                        PaperProps={{ sx: { borderRadius: '12px', minWidth: 280 } }}>
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Notifications</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleNotificationClose}>
                            <Typography variant="body2" sx={{ color: '#666' }}>No new notifications</Typography>
                        </MenuItem>
                    </Menu>

                    {/* Profile */}
                    <IconButton onClick={handleProfileMenuOpen}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#059669', fontWeight: 700 }}>
                            {teacherName.charAt(0)}
                        </Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}
                        PaperProps={{ sx: { borderRadius: '12px', minWidth: 200 } }}>
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{teacherName}</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>{teacherEmail}</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/teacher-portal/profile'); }}>
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>Profile
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/teacher-portal/settings'); }}>
                            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: '#dc2626' }}>
                            <ListItemIcon><Logout fontSize="small" sx={{ color: '#dc2626' }} /></ListItemIcon>Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
                    {drawer}
                </Drawer>
                <Drawer variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { width: drawerWidth, borderRight: '1px solid #f0f0f0' }
                    }} open>
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/teacher-portal/home" />} />
                    <Route path="/home" element={<TeacherHome />} />
                    <Route path="/class" element={<TeacherClasses />} />
                    <Route path="/students" element={<TeacherStudents />} />
                    <Route path="/students/:studentId" element={<TeacherStudentView />} />
                    <Route path="/attendance" element={<TeacherAttendance />} />
                    <Route path="/gradebook" element={<TeacherGradebook />} />
                    <Route path="/notices" element={<TeacherNotices />} />
                    <Route path="/complain" element={<TeacherComplain />} />
                    <Route path="/profile" element={<TeacherProfile />} />
                    <Route path="/settings" element={<TeacherSettings />} />
                    <Route path="*" element={<Navigate to="/teacher-portal/home" />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default TeacherPortalDashboard;

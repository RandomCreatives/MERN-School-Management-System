import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Button, Typography, Container, Grid, Card, CardContent, Avatar, 
    AppBar, Toolbar, IconButton, Menu, MenuItem, Dialog, DialogTitle, 
    DialogContent, TextField, Alert, Tabs, Tab 
} from '@mui/material';
import { ArrowForward, School, Menu as MenuIcon, Person, AdminPanelSettings, Close } from '@mui/icons-material';
import axios from 'axios';

function TabPanel({ children, value, index }) {
    return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

const Homepage = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [showAllTeachers, setShowAllTeachers] = useState(false);
    const [openTeacherLogin, setOpenTeacherLogin] = useState(false);
    const [loginTab, setLoginTab] = useState(0);
    const [loginData, setLoginData] = useState({ teacherId: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', teacherId: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/AllTeachers');
            if (response.data && Array.isArray(response.data)) {
                // Get all main teachers
                const mainTeachers = response.data
                    .filter(t => t.teacherType === 'main_teacher')
                    .sort((a, b) => (a.teacherId || '').localeCompare(b.teacherId || ''));
                setTeachers(mainTeachers);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleTeacherLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/TeacherLogin', loginData);
            
            if (response.data._id) {
                localStorage.setItem('teacherAccess', 'authenticated');
                localStorage.setItem('teacherId', response.data._id);
                localStorage.setItem('teacherName', response.data.name);
                localStorage.setItem('teacherEmail', response.data.email);
                localStorage.setItem('teacherRole', response.data.role);
                setOpenTeacherLogin(false);
                navigate('/teacher/dashboard');
            } else {
                setLoginError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setLoginError('Login failed. Please check your credentials.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
            {/* Header */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#fff'
                        }}>
                            B
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', display: { xs: 'none', sm: 'block' } }}>
                            BIS NOC
                        </Typography>
                    </Box>

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
                        <Button sx={{ color: '#000', textTransform: 'none', fontWeight: 500 }} href="#home">
                            Home
                        </Button>
                        <Button sx={{ color: '#666', textTransform: 'none', fontWeight: 500 }} href="#teachers">
                            Our Teachers
                        </Button>
                        <Button sx={{ color: '#666', textTransform: 'none', fontWeight: 500 }} href="#about">
                            About
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Person />}
                            onClick={() => setOpenTeacherLogin(true)}
                            sx={{
                                borderColor: '#000',
                                color: '#000',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: '8px',
                                '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            Teacher Login
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AdminPanelSettings />}
                            onClick={() => navigate('/admin-login')}
                            sx={{
                                bgcolor: '#000',
                                color: '#fff',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: '8px',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#333', boxShadow: 'none' }
                            }}
                        >
                            Admin
                        </Button>
                    </Box>

                    {/* Mobile Menu */}
                    <IconButton
                        sx={{ display: { xs: 'block', md: 'none' }, color: '#000' }}
                        onClick={handleMenuOpen}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); window.location.href = '#home'; }}>Home</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); window.location.href = '#teachers'; }}>Our Teachers</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); window.location.href = '#about'; }}>About</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); setOpenTeacherLogin(true); }}>Teacher Login</MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin-login'); }}>Admin Login</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box id="home" sx={{ 
                minHeight: '90vh', 
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 2px, transparent 0)',
                    backgroundSize: '50px 50px'
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontWeight: 800,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    color: '#000',
                                    mb: 2,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.2
                                }}
                            >
                                British International School
                            </Typography>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 400,
                                    color: '#666',
                                    mb: 4,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    fontSize: '1rem'
                                }}
                            >
                                NOC Gerji Campus
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#666',
                                    mb: 4,
                                    lineHeight: 1.8,
                                    fontSize: '1.125rem',
                                    maxWidth: 500
                                }}
                            >
                                Empowering young minds through excellence in education. 
                                A modern school management platform for seamless administration and communication.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/dashboard/home')}
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        background: '#000',
                                        color: '#fff',
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            background: '#333',
                                            boxShadow: 'none',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Get Started
                                </Button>

                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                width: '100%',
                                height: 400,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                            }}>
                                <School sx={{ fontSize: 150, color: 'rgba(255,255,255,0.9)' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Our Teachers Section */}
            <Box id="teachers" sx={{ py: 10, bgcolor: '#fff' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#000', mb: 2 }}>
                            Our Teachers
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', fontSize: '1.125rem', maxWidth: 600, mx: 'auto' }}>
                            Meet our dedicated team of educators committed to nurturing excellence
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {(showAllTeachers ? teachers : teachers.slice(0, 6)).map((teacher) => (
                            <Grid item xs={12} sm={6} md={4} key={teacher._id}>
                                <Card sx={{
                                    borderRadius: '16px',
                                    border: '1px solid #f0f0f0',
                                    boxShadow: 'none',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                bgcolor: '#000',
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                mx: 'auto',
                                                mb: 2
                                            }}
                                        >
                                            {teacher.name?.charAt(0)}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {teacher.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                            {teacher.teachSclass?.sclassName || teacher.homeroomClass?.sclassName || 'Main Teacher'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            {teacher.teacherId}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {!showAllTeachers && teachers.length > 6 && (
                        <Box sx={{ textAlign: 'center', mt: 6 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => setShowAllTeachers(true)}
                                sx={{
                                    borderColor: '#000',
                                    color: '#000',
                                    py: 1.5,
                                    px: 4,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    borderWidth: '2px',
                                    '&:hover': {
                                        borderWidth: '2px',
                                        borderColor: '#000',
                                        background: 'rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                View All {teachers.length} Teachers
                            </Button>
                        </Box>
                    )}
                    {showAllTeachers && (
                        <Box sx={{ textAlign: 'center', mt: 6 }}>
                            <Button
                                variant="text"
                                onClick={() => setShowAllTeachers(false)}
                                sx={{
                                    color: '#666',
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Show Less
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#000', color: '#fff', py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    background: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: '#000'
                                }}>
                                    B
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    BIS NOC
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#999', lineHeight: 1.8 }}>
                                British International School - NOC Gerji Campus
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Quick Links
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button sx={{ color: '#999', textTransform: 'none', justifyContent: 'flex-start', p: 0 }} href="#home">
                                    Home
                                </Button>
                                <Button sx={{ color: '#999', textTransform: 'none', justifyContent: 'flex-start', p: 0 }} href="#teachers">
                                    Our Teachers
                                </Button>
                                <Button sx={{ color: '#999', textTransform: 'none', justifyContent: 'flex-start', p: 0 }} onClick={() => setOpenTeacherLogin(true)}>
                                    Teacher Login
                                </Button>
                                <Button sx={{ color: '#999', textTransform: 'none', justifyContent: 'flex-start', p: 0 }} onClick={() => navigate('/admin-login')}>
                                    Admin Login
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Contact
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#999', lineHeight: 1.8 }}>
                                NOC Gerji Campus<br />
                                Addis Ababa, Ethiopia<br />
                                Email: info@bisnoc.edu<br />
                                Phone: +251 11 XXX XXXX
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box sx={{ borderTop: '1px solid #333', mt: 6, pt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            © 2024 British International School - NOC Gerji Campus. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Teacher Login Dialog */}
            <Dialog 
                open={openTeacherLogin} 
                onClose={() => setOpenTeacherLogin(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px' }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Teacher Access
                        </Typography>
                        <IconButton onClick={() => setOpenTeacherLogin(false)} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Tabs 
                        value={loginTab} 
                        onChange={(e, v) => setLoginTab(v)}
                        sx={{ 
                            mb: 3,
                            borderBottom: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Tab label="Login" sx={{ textTransform: 'none', fontWeight: 600 }} />
                        <Tab label="Sign Up" sx={{ textTransform: 'none', fontWeight: 600 }} />
                    </Tabs>

                    {/* Login Tab */}
                    <TabPanel value={loginTab} index={0}>
                        {loginError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {loginError}
                            </Alert>
                        )}
                        <form onSubmit={handleTeacherLogin}>
                            <TextField
                                fullWidth
                                label="Teacher ID"
                                value={loginData.teacherId}
                                onChange={(e) => setLoginData({ ...loginData, teacherId: e.target.value })}
                                sx={{ mb: 2 }}
                                required
                                helperText="e.g., TCH001"
                                InputProps={{ sx: { borderRadius: '10px' } }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                sx={{ mb: 3 }}
                                required
                                InputProps={{ sx: { borderRadius: '10px' } }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loginLoading}
                                sx={{
                                    bgcolor: '#000',
                                    color: '#fff',
                                    py: 1.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#333', boxShadow: 'none' }
                                }}
                            >
                                {loginLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </TabPanel>

                    {/* Sign Up Tab */}
                    <TabPanel value={loginTab} index={1}>
                        <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                            Please contact the administrator to create a teacher account.
                        </Alert>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={signupData.name}
                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            sx={{ mb: 2 }}
                            disabled
                            InputProps={{ sx: { borderRadius: '10px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            sx={{ mb: 2 }}
                            disabled
                            InputProps={{ sx: { borderRadius: '10px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            sx={{ mb: 3 }}
                            disabled
                            InputProps={{ sx: { borderRadius: '10px' } }}
                        />
                        <Button
                            variant="contained"
                            fullWidth
                            disabled
                            sx={{
                                bgcolor: '#ccc',
                                color: '#666',
                                py: 1.5,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none'
                            }}
                        >
                            Contact Administrator
                        </Button>
                    </TabPanel>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Homepage;

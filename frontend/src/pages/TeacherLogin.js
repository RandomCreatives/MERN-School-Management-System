import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { School } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherLogin = () => {
    const [loginData, setLoginData] = useState({ teacherId: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use the existing TeacherLogin endpoint - it accepts email or teacherId
            const response = await axios.post(`${API_BASE}/TeacherLogin`, {
                email: loginData.teacherId, // backend checks both email and teacherId
                password: loginData.password
            });

            if (response.data._id) {
                const teacherData = response.data;

                // Store in localStorage for persistence
                localStorage.setItem('teacherAccess', 'authenticated');
                localStorage.setItem('teacherId', teacherData._id);
                localStorage.setItem('teacherName', teacherData.name);
                localStorage.setItem('teacherEmail', teacherData.email);
                localStorage.setItem('teacherRole', teacherData.role || 'Teacher');
                localStorage.setItem('teacherData', JSON.stringify(teacherData));

                // Also store in the Redux user store for compatibility
                localStorage.setItem('user', JSON.stringify(teacherData));

                navigate('/teacher-portal/home');
            } else {
                setError(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            padding: '20px'
        }}>
            <Paper elevation={6} sx={{ maxWidth: 450, width: '100%', borderRadius: 3 }}>
                <Box sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
                    <School sx={{ fontSize: 60, color: '#059669', mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        Teacher Portal
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                        School Management System
                    </Typography>
                </Box>

                <Box sx={{ p: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email or Teacher ID"
                            value={loginData.teacherId}
                            onChange={(e) => setLoginData({ ...loginData, teacherId: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                            helperText="Use your email address or Teacher ID (e.g., TCH001)"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            sx={{ mb: 3 }}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                bgcolor: '#059669',
                                '&:hover': { bgcolor: '#047857' },
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                            Don't have credentials? Contact your administrator.
                        </Typography>
                        <Button
                            variant="text"
                            onClick={() => navigate('/')}
                            sx={{ color: '#6b7280' }}
                        >
                            ← Back to Homepage
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TeacherLogin;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Box, Button, TextField, Typography, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const Homepage = () => {
    const [showAccessGate, setShowAccessGate] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleStartHere = () => {
        // Directly navigate to dashboard - skip access gate and role selection
        navigate('/dashboard/home');
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
            <Container maxWidth="lg">
                <Grid container spacing={0} sx={{ minHeight: '100vh' }}>
                    <Grid item xs={12} md={6} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        p: 4
                    }}>
                        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
                            <Box sx={{ 
                                width: '100%', 
                                height: 300, 
                                bgcolor: '#e0e7ff', 
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <SchoolIcon sx={{ fontSize: 120, color: '#1e40af' }} />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        p: 4
                    }}>
                        <Box sx={{ maxWidth: 550, textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 70, color: '#1e40af', mb: 2 }} />
                            
                            <Typography variant="h5" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                Welcome to
                            </Typography>
                            
                            <Typography variant="h3" sx={{ color: '#1e40af', fontWeight: 700, mb: 1 }}>
                                British International School
                            </Typography>
                            
                            <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 600, mb: 3 }}>
                                NOC - Gerji Campus
                            </Typography>
                            
                            <Box sx={{ 
                                width: 80, 
                                height: 4, 
                                background: 'linear-gradient(90deg, #1e40af 0%, #fde047 100%)',
                                margin: '24px auto',
                                borderRadius: 2
                            }} />
                            
                            <Typography variant="body1" sx={{ color: '#6b7280', mb: 4, lineHeight: 1.6 }}>
                                Comprehensive school management system for streamlined administration,
                                attendance tracking, academic performance monitoring, and seamless communication
                                between teachers, students, and administrators.
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                                        ✓ Multi-role access control
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                                        ✓ Real-time attendance tracking
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                                        ✓ Academic performance analytics
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                                        ✓ Special needs accommodation
                                    </Typography>
                                </Grid>
                            </Grid>
                            
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleStartHere}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                    color: 'white',
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 14px rgba(30, 64, 175, 0.3)',
                                    mb: 3,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                                        boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Start Here
                            </Button>
                            
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                Powered by BIS NOC Management System
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Homepage;

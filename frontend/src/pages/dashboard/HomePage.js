import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { School, Person, Class, LocalLibrary, LocalHospital, TrendingUp } from '@mui/icons-material';

const HomePage = () => {
    const stats = [
        { title: 'Total Students', value: '250', icon: <Person sx={{ fontSize: 40 }} />, color: '#3b82f6' },
        { title: 'Total Teachers', value: '36', icon: <School sx={{ fontSize: 40 }} />, color: '#10b981' },
        { title: 'Total Classes', value: '12', icon: <Class sx={{ fontSize: 40 }} />, color: '#f59e0b' },
        { title: 'Library Books', value: '1,250', icon: <LocalLibrary sx={{ fontSize: 40 }} />, color: '#8b5cf6' },
        { title: 'Clinic Visits', value: '45', icon: <LocalHospital sx={{ fontSize: 40 }} />, color: '#ef4444' },
        { title: 'Attendance Rate', value: '96%', icon: <TrendingUp sx={{ fontSize: 40 }} />, color: '#06b6d4' },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Welcome to BIS NOC Dashboard
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)',
                                transition: 'all 0.3s ease'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Today's Summary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, borderLeft: '4px solid #10b981' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#065f46' }}>
                                    Attendance: 240/250 students present (96%)
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2, borderLeft: '4px solid #f59e0b' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                                    3 pending leave requests in clinic
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#dbeafe', borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af' }}>
                                    5 books due for return today
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#3b82f6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                → Mark Attendance
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#3b82f6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                → View Timetable
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#3b82f6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                → Check Messages
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#3b82f6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                → Generate Reports
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;

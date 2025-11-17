import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { LocalHospital, Assignment, Approval } from '@mui/icons-material';

const Clinic = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Clinic Management
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocalHospital sx={{ fontSize: 40, color: '#ef4444', mr: 2 }} />
                                <Typography variant="h6">Record Visit</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Record: Student/Teacher, Accident/Treatment details, Date
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Assignment sx={{ fontSize: 40, color: '#f59e0b', mr: 2 }} />
                                <Typography variant="h6">Leave Requests</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Students/Teachers can request sick leave
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Approval sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
                            <Typography variant="h6">Admin Approval</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Admin reviews and approves/denies leave requests
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Clinic;

import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { School } from '@mui/icons-material';

const TeachersPortal = () => {
    // Mock data - will be replaced with API calls
    const teachers = [
        { id: 1, name: 'John Smith', role: 'Main Teacher', class: 'Year 3 - Blue' },
        { id: 2, name: 'Jane Doe', role: 'Subject Teacher', subject: 'English' },
        { id: 3, name: 'Mike Johnson', role: 'Assistant Teacher', class: 'Year 3 - Crimson' },
        { id: 4, name: 'Sarah Williams', role: 'Special Needs Teacher' },
        { id: 5, name: 'David Brown', role: 'Main Teacher', class: 'Year 3 - Cyan' },
    ];

    const [selectedTeacher, setSelectedTeacher] = useState(null);

    if (selectedTeacher) {
        return (
            <Box>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                    {selectedTeacher.name} - Dashboard
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ color: '#3b82f6', cursor: 'pointer' }}
                        onClick={() => setSelectedTeacher(null)}
                    >
                        ← Back to Teachers List
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Role & Assignments</Typography>
                                <Typography variant="body2"><strong>Role:</strong> {selectedTeacher.role}</Typography>
                                {selectedTeacher.class && (
                                    <Typography variant="body2"><strong>Class:</strong> {selectedTeacher.class}</Typography>
                                )}
                                {selectedTeacher.subject && (
                                    <Typography variant="body2"><strong>Subject:</strong> {selectedTeacher.subject}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Subjects & Classes</Typography>
                                <Typography variant="body2">List of assigned subjects and classes</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Mark Sheets</Typography>
                                <Typography variant="body2">Mark sheets for each subject</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Timetable</Typography>
                                <Typography variant="body2">Teaching schedule</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Messages</Typography>
                                <Typography variant="body2">Messages from admin</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Teachers Portal
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
                Click on a teacher to view their dashboard
            </Typography>

            <Grid container spacing={3}>
                {teachers.map((teacher) => (
                    <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                        <Card sx={{ 
                            '&:hover': { 
                                boxShadow: 6, 
                                transform: 'translateY(-4px)',
                                transition: 'all 0.3s ease'
                            }
                        }}>
                            <CardActionArea onClick={() => setSelectedTeacher(teacher)}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <School sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6">{teacher.name}</Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                {teacher.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {teacher.class && (
                                        <Typography variant="caption" sx={{ color: '#10b981' }}>
                                            {teacher.class}
                                        </Typography>
                                    )}
                                    {teacher.subject && (
                                        <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                                            {teacher.subject}
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default TeachersPortal;

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import { Dashboard, Schedule, School, Message, Assessment } from '@mui/icons-material';

// Tab Panel Component
function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const AdminDashboardNew = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Admin Dashboard
            </Typography>

            <Paper sx={{ borderRadius: 3 }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<Dashboard />} label="Overview" iconPosition="start" />
                    <Tab icon={<Schedule />} label="School Timetable" iconPosition="start" />
                    <Tab icon={<School />} label="Teachers Management" iconPosition="start" />
                    <Tab icon={<Message />} label="Send Messages" iconPosition="start" />
                    <Tab icon={<Assessment />} label="Reports" iconPosition="start" />
                </Tabs>

                {/* Overview Tab */}
                <TabPanel value={currentTab} index={0}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Daily Overview</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total Attendance Today</Typography>
                            <Typography variant="h4" sx={{ color: '#10b981' }}>240/250 (96%)</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending Leave Requests</Typography>
                            <Typography variant="h4" sx={{ color: '#f59e0b' }}>3</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>New Messages</Typography>
                            <Typography variant="h4" sx={{ color: '#3b82f6' }}>7</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: '#fce7f3', borderLeft: '4px solid #ec4899' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending Reports</Typography>
                            <Typography variant="h4" sx={{ color: '#ec4899' }}>5</Typography>
                        </Paper>
                    </Box>
                </TabPanel>

                {/* School Timetable Tab */}
                <TabPanel value={currentTab} index={1}>
                    <Typography variant="h6" sx={{ mb: 2 }}>School Timetable Management</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        View, navigate, edit, and assign timetables for each class
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Timetable editor will be implemented here.
                            Features: Create/Edit timetables, Assign teachers to periods, View by class
                        </Typography>
                    </Paper>
                </TabPanel>

                {/* Teachers Management Tab */}
                <TabPanel value={currentTab} index={2}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Teachers Management</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        Add, remove, and assign teachers to classes and subjects
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Add New Teacher</Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Form to add new teachers with role assignment
                            </Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Assign Teachers</Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                • Assign to classes<br/>
                                • Assign to subjects<br/>
                                • Designate as Main Teacher, Assistant Teacher, Subject Teacher, or Special Needs Teacher
                            </Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Current Teachers</Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                List of all registered teachers with their assignments
                            </Typography>
                        </Paper>
                    </Box>
                </TabPanel>

                {/* Send Messages Tab */}
                <TabPanel value={currentTab} index={3}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Send Messages</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        Compose and send messages to teachers and classes
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Message composer will be implemented here.
                            Features: Select recipients (individual teachers, multiple teachers, or entire classes), Compose message, Send
                        </Typography>
                    </Paper>
                </TabPanel>

                {/* Reports Tab */}
                <TabPanel value={currentTab} index={4}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Reports Management</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                        View and download reports from teachers and classes
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
                        <Typography variant="body1">
                            Reports repository will be implemented here.
                            Features: View submitted reports, Download reports, Filter by class/teacher/date
                        </Typography>
                    </Paper>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default AdminDashboardNew;

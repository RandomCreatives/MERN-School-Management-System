import { Box, Typography, Grid, Card, CardContent, Paper, Avatar, Chip, LinearProgress, CircularProgress } from '@mui/material';
import { People, Assignment, CheckCircle, Schedule, Grade, Class } from '@mui/icons-material';
import useTeacherData from '../useTeacherData';

const TeacherHome = () => {
    const { teacher, students, subjects, classInfo, loading } = useTeacherData();
    const teacherName = teacher?.name || localStorage.getItem('teacherName') || 'Teacher';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#059669' }} />
            </Box>
        );
    }

    const subjectName = teacher?.teachSubject?.subName || 'N/A';
    const totalSessions = teacher?.teachSubject?.sessions || 0;

    // Calculate attendance stats from students
    let totalPresent = 0;
    let totalRecords = 0;
    students.forEach(s => {
        if (s.attendance) {
            s.attendance.forEach(a => {
                totalRecords++;
                if (a.status === 'Present') totalPresent++;
            });
        }
    });
    const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    const stats = [
        { title: 'Class Students', value: students.length, icon: <People />, color: '#3b82f6', bg: '#eff6ff' },
        { title: 'Subjects', value: subjects.length, icon: <Assignment />, color: '#10b981', bg: '#ecfdf5' },
        { title: 'Total Sessions', value: totalSessions, icon: <Schedule />, color: '#f59e0b', bg: '#fffbeb' },
        { title: 'Attendance Rate', value: `${attendanceRate}%`, icon: <CheckCircle />, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <Box>
            {/* Welcome */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {getGreeting()}, {teacherName.split(' ')[0]}! 👋
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    Here's an overview of your class and teaching activity.
                </Typography>
            </Box>

            {/* Info Card */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1.5rem' }}>
                            {teacherName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>{teacherName}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip label={classInfo?.sclassName || 'No Class'} size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                    icon={<Class sx={{ color: '#fff !important' }} />} />
                                <Chip label={subjectName} size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                    icon={<Grade sx={{ color: '#fff !important' }} />} />
                            </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {teacher?.school?.schoolName || 'School'}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                Teacher ID: {teacher?.teacherId || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, i) => (
                    <Grid item xs={6} md={3} key={i}>
                        <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: '12px', bgcolor: stat.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: stat.color, mx: 'auto', mb: 1.5
                                }}>{stat.icon}</Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>{stat.title}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Students Overview */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Class Students ({students.length})
                        </Typography>
                        {students.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No students in this class yet.</Typography>
                        ) : (
                            students.slice(0, 8).map((student, i) => (
                                <Box key={student._id || i} sx={{
                                    display: 'flex', alignItems: 'center', py: 1.5,
                                    borderBottom: i < Math.min(students.length, 8) - 1 ? '1px solid #f3f4f6' : 'none'
                                }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#059669', fontSize: '0.8rem', mr: 2 }}>
                                        {student.name?.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                            Roll: {student.rollNum} {student.studentId ? `• ID: ${student.studentId}` : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                        {students.length > 8 && (
                            <Typography variant="body2" sx={{ color: '#059669', mt: 1, fontWeight: 600 }}>
                                + {students.length - 8} more students
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Subjects */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Class Subjects
                        </Typography>
                        {subjects.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No subjects assigned yet.</Typography>
                        ) : (
                            subjects.map((sub, i) => (
                                <Box key={sub._id || i} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {sub.subName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            {sub.sessions} sessions
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(100, (parseInt(sub.sessions) || 0) * 3)}
                                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f3f4f6',
                                            '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 3 }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                        Code: {sub.subCode}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherHome;

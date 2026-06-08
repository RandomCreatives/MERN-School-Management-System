import { Box, Typography, Paper, Grid, Card, CardContent, Chip, CircularProgress, Divider } from '@mui/material';
import { People, MenuBook, School } from '@mui/icons-material';
import useTeacherData from '../useTeacherData';

const TeacherClasses = () => {
    const { teacher, students, subjects, classInfo, loading, error } = useTeacherData();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#059669' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>My Class</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                View your assigned class details, students, and subjects.
            </Typography>

            {/* Class Card */}
            <Card sx={{ mb: 3, borderRadius: '12px', border: '2px solid #059669' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '12px', bgcolor: '#ecfdf5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <School sx={{ fontSize: 32, color: '#059669' }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {classInfo?.sclassName || 'No Class Assigned'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {teacher?.school?.schoolName || 'School'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip icon={<People />} label={`${students.length} Students`} color="primary" variant="outlined" />
                        <Chip icon={<MenuBook />} label={`${subjects.length} Subjects`} color="success" variant="outlined" />
                        <Chip label={`Teacher: ${teacher?.name}`} variant="outlined" />
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Students */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Students ({students.length})
                        </Typography>
                        {students.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No students enrolled.</Typography>
                        ) : (
                            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                                {students.map((student, i) => (
                                    <Box key={student._id} sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        py: 1.5, borderBottom: i < students.length - 1 ? '1px solid #f3f4f6' : 'none'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: '50%', bgcolor: '#059669',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 600, fontSize: '0.85rem'
                                            }}>{student.name?.charAt(0)}</Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                                    Roll #{student.rollNum}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip label={student.studentId || `#${student.rollNum}`} size="small" variant="outlined" />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Subjects */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Subjects ({subjects.length})
                        </Typography>
                        {subjects.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No subjects assigned.</Typography>
                        ) : (
                            subjects.map((sub, i) => (
                                <Card key={sub._id} variant="outlined"
                                    sx={{ mb: 2, borderRadius: '8px', '&:last-child': { mb: 0 } }}>
                                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {sub.subName}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            Code: {sub.subCode} • Sessions: {sub.sessions}
                                        </Typography>
                                        {sub.teacher && (
                                            <Typography variant="caption" sx={{ display: 'block', color: '#059669', mt: 0.5 }}>
                                                Teacher assigned ✓
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherClasses;

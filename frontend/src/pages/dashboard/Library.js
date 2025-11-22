import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { LocalLibrary, Book } from '@mui/icons-material';

const Library = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                Library Management
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocalLibrary sx={{ fontSize: 40, color: '#8b5cf6', mr: 2 }} />
                                <Typography variant="h6">Borrow Book</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Record: Book Title, Borrower (Student/Teacher), Date Borrowed, Due Date
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Book sx={{ fontSize: 40, color: '#10b981', mr: 2 }} />
                                <Typography variant="h6">Return Book</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Mark books as returned and update records
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Borrowing Activity</Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            View all borrowing records and generate reports
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Library;

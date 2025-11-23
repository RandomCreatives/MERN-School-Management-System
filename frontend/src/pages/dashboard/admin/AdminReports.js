import { Box, Typography, Paper } from '@mui/material';

const AdminReports = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Reports
            </Typography>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="body1">
                    Reports and analytics will be displayed here...
                </Typography>
            </Paper>
        </Box>
    );
};

export default AdminReports;

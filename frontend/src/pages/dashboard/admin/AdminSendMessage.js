import { Box, Typography, Paper } from '@mui/material';

const AdminSendMessage = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Send Message
            </Typography>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="body1">
                    Message composer will be displayed here...
                </Typography>
            </Paper>
        </Box>
    );
};

export default AdminSendMessage;

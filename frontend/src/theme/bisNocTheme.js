import { createTheme } from '@mui/material/styles';

// BIS NOC Campus Color Scheme
const bisNocTheme = createTheme({
    palette: {
        primary: {
            main: '#1e40af', // Primary Blue
            light: '#3b82f6', // Secondary Blue
            dark: '#1e3a8a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#fde047', // Accent Lemon
            light: '#fef9c3', // Light Lemon
            dark: '#facc15',
            contrastText: '#1f2937',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1f2937', // Dark Text
            secondary: '#6b7280', // Light Text
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1f2937',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            color: '#1f2937',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#1f2937',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1f2937',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1f2937',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#1f2937',
        },
        body1: {
            fontSize: '1rem',
            color: '#1f2937',
        },
        body2: {
            fontSize: '0.875rem',
            color: '#6b7280',
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        ...Array(18).fill('none'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
    },
});

export default bisNocTheme;

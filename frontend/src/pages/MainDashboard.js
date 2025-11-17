import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Home, Dashboard, School, Person, Class, LocalLibrary, LocalHospital, ExpandLess, ExpandMore, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const classColors = [
    'Year 3 - Blue',
    'Year 3 - Crimson',
    'Year 3 - Cyan',
    'Year 3 - Purple',
    'Year 3 - Lavender',
    'Year 3 - Maroon',
    'Year 3 - Violet',
    'Year 3 - Green',
    'Year 3 - Red',
    'Year 3 - Yellow',
    'Year 3 - Magenta',
    'Year 3 - Orange'
];

const MainDashboard = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [classesOpen, setClassesOpen] = useState(false);
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleClassesClick = () => {
        setClassesOpen(!classesOpen);
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ bgcolor: '#1e40af', color: 'white' }}>
                <Typography variant="h6" noWrap component="div">
                    BIS NOC
                </Typography>
            </Toolbar>
            
            <List>
                {/* Home */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/home')}>
                        <ListItemIcon>
                            <Home />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>

                {/* Section 1: Portals */}
                <ListItem sx={{ bgcolor: '#f3f4f6', mt: 1 }}>
                    <ListItemText primary="PORTALS" primaryTypographyProps={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }} />
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/admin')}>
                        <ListItemIcon>
                            <Dashboard />
                        </ListItemIcon>
                        <ListItemText primary="Admin Dashboard" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/teachers')}>
                        <ListItemIcon>
                            <School />
                        </ListItemIcon>
                        <ListItemText primary="Teachers Portal" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/students')}>
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        <ListItemText primary="Students Portal" />
                    </ListItemButton>
                </ListItem>

                {/* Section 2: Classes */}
                <ListItem sx={{ bgcolor: '#f3f4f6', mt: 2 }}>
                    <ListItemText primary="CLASSES" primaryTypographyProps={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }} />
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={handleClassesClick}>
                        <ListItemIcon>
                            <Class />
                        </ListItemIcon>
                        <ListItemText primary="All Classes" />
                        {classesOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>

                <Collapse in={classesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {classColors.map((className, index) => (
                            <ListItemButton 
                                key={index} 
                                sx={{ pl: 4 }}
                                onClick={() => navigate(`/dashboard/class/${className.toLowerCase().replace(/\s+/g, '-')}`)}
                            >
                                <ListItemText 
                                    primary={className} 
                                    primaryTypographyProps={{ fontSize: 14 }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>

                {/* Section 3: Services */}
                <ListItem sx={{ bgcolor: '#f3f4f6', mt: 2 }}>
                    <ListItemText primary="SERVICES" primaryTypographyProps={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }} />
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/library')}>
                        <ListItemIcon>
                            <LocalLibrary />
                        </ListItemIcon>
                        <ListItemText primary="Library" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/dashboard/clinic')}>
                        <ListItemIcon>
                            <LocalHospital />
                        </ListItemIcon>
                        <ListItemText primary="Clinic" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: '#1f2937',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        British International School - NOC Gerji Campus
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    bgcolor: '#f9fafb',
                    minHeight: '100vh'
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default MainDashboard;

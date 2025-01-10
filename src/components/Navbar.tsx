import React, { useState } from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'Booking Summary', to: '/confirmation' },
        { label: 'Booking History', to: '/history' },
    ];

    const renderNavLinks = () =>
        navLinks.map(({ label, to }) => (
            <ListItem
                // button
                key={label}
                component={RouterLink}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                sx={{
                    color: location.pathname === to ? 'primary.main' : 'inherit',
                }}
            >
                <ListItemText primary={label} />
            </ListItem>
        ));

    return (
        <>
            <AppBar position="sticky">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}
                    >
                        WorkHub
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleMobileMenu}
                        sx={{ display: { xs: 'block', md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        {navLinks.map(({ label, to }) => (
                            <Typography
                                key={label}
                                component={RouterLink}
                                to={to}
                                sx={{
                                    textDecoration: 'none',
                                    color: location.pathname === to ? 'primary.light' : 'inherit',
                                    fontWeight: location.pathname === to ? 'bold' : 'normal',
                                }}
                            >
                                {label}
                            </Typography>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="right"
                open={isMobileMenuOpen}
                onClose={toggleMobileMenu}
                sx={{ '& .MuiDrawer-paper': { width: 250 } }}
            >
                <List>{renderNavLinks()}</List>
            </Drawer>
        </>
    );
};

export default Navbar;

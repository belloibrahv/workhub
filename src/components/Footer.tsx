import React from 'react';
import { Box, Typography, Link as MUILink, IconButton, Stack } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.dark',
                color: 'white',
                padding: 3,
                marginTop: 'auto',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h6" gutterBottom>
                        About Workhub
                    </Typography>
                    <Typography variant="body2">
                        Workhub provides premium workspace solutions across Lagos, allowing professionals to access tools and resources to enhance productivity.
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Quick Links
                    </Typography>
                    <Stack spacing={1}>
                        <MUILink href="/" underline="hover" color="inherit">
                            Home
                        </MUILink>
                        <MUILink href="/history" underline="hover" color="inherit">
                            Booking History
                        </MUILink>
                        <MUILink href="/tools" underline="hover" color="inherit">
                            Tools
                        </MUILink>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Follow Us
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            component="a"
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faFacebook} />
                        </IconButton>
                        <IconButton
                            component="a"
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faTwitter} />
                        </IconButton>
                        <IconButton
                            component="a"
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faLinkedin} />
                        </IconButton>
                        <IconButton
                            component="a"
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'white' }}
                        >
                            <FontAwesomeIcon icon={faInstagram} />
                        </IconButton>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                <Typography variant="body2">
                    &copy; {new Date().getFullYear()} Workhub. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;

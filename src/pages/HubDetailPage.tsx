import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardMedia, CardContent, Divider, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Hub } from '../types/Hub';

import ikeja_1 from '../assets/images/ikeja_1.jpg';
import ikeja_2 from '../assets/images/ikeja_2.jpg';
import sango_1 from '../assets/images/sango_1.jpg';

// Mock hub data (to be replaced with API calls if available)
const HUBS: Hub[] = [
    { id: 'lekki', name: 'Lekki Hub', location: 'Lekki, Lagos', price: 5000, imageUrl: ikeja_1 },
    { id: 'sango', name: 'Sango Hub', location: 'Sango, Lagos', price: 4500, imageUrl: ikeja_2 },
    { id: 'yaba', name: 'Yaba Hub', location: 'Yaba, Lagos', price: 4000, imageUrl: sango_1 },
];

const HubDetailPage: React.FC = () => {
    const { hubId } = useParams<{ hubId: string }>();
    const navigate = useNavigate();

    // Find the selected hub by ID
    const hub = HUBS.find((h) => h.id === hubId);

    useEffect(() => {
        if (hub) {
            // Update global state with selected hub details
            window.currentBookingInfo = {
                ...window.currentBookingInfo,
                hubDetails: {
                    id: hub.id,
                    name: hub.name,
                    price: hub.price,
                },
                isInFinalPage: false,
            };

            // Persist updated global state to sessionStorage
            sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));

            // Ensure booking results persist in sessionStorage
            const bookingResults = JSON.parse(sessionStorage.getItem('bookingResults') || '[]');
            sessionStorage.setItem('bookingResults', JSON.stringify(bookingResults));
        }
    }, [hub]);

    if (!hub) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h4" color="error" gutterBottom>
                    Hub not found
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Go Back to Home
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                padding: 4,
                maxWidth: 800,
                margin: 'auto',
            }}
        >
            <Card>
                <CardMedia
                    component="img"
                    image={hub.imageUrl}
                    alt={hub.name}
                    sx={{
                        height: 300,
                        objectFit: 'cover',
                    }}
                />
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {hub.name}
                    </Typography>
                    <Divider sx={{ my: 2 }}>
                        <Chip label="Hub Details" />
                    </Divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon color="primary" />
                        <Typography variant="body1" sx={{ ml: 1 }}>
                            <strong>Location:</strong> {hub.location}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="body1" sx={{ ml: 1 }}>
                            <strong>Access Fee:</strong> ₦{hub.price.toLocaleString()} per hour
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Button
                        component={Link}
                        to={`/checkin/${hub.id}`}
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Check In
                    </Button>
                </CardContent>
            </Card>
            <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </Button>
            </Box>
        </Box>
    );
};

export default HubDetailPage;

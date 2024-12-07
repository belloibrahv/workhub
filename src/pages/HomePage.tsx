import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Grid, CircularProgress, Alert } from '@mui/material';
import { Hub } from '../types/Hub';

import ikeja_1 from '../assets/images/ikeja_1.jpg';
import ikeja_2 from '../assets/images/ikeja_2.jpg';
import sango_1 from '../assets/images/sango_1.jpg';
import Ikeja from '../assets/images/ikeja_2.png';

const HomePage: React.FC = () => {
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize `window.currentBookingInfo` and synchronize with `sessionStorage`
    useEffect(() => {
        const initialBookingInfo = {
            isInFinalPage: false,
        };

        window.currentBookingInfo = initialBookingInfo;
        sessionStorage.setItem('currentBookingInfo', JSON.stringify(initialBookingInfo));
    }, []);

    useEffect(() => {
        // Mocking hub data. Replace with an API call if available.
        const fetchHubs = async () => {
            try {
                setLoading(true);
                // Simulated delay for loading
                await new Promise((resolve) => setTimeout(resolve, 500));
                const data: Hub[] = [
                    { id: 'lekki', name: 'Lekki Hub', location: 'Lekki, Lagos', price: 5000, imageUrl: ikeja_1 },
                    { id: 'sango', name: 'Sango Hub', location: 'Sango, Lagos', price: 4500, imageUrl: ikeja_2 },
                    { id: 'yaba', name: 'Yaba Hub', location: 'Yaba, Lagos', price: 4000, imageUrl: sango_1 },
                ];
                setHubs(data);
            } catch (err) {
                setError('Failed to load hubs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchHubs();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            {/* Banner Section */}
            <Box
                component="header"
                sx={{
                    backgroundImage: `url(${Ikeja})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    color: 'white',
                    textAlign: 'center',
                    padding: 6,
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Welcome to Workhub
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Your gateway to premium workspace solutions.
                </Typography>
                <Button
                    href="#hubs"
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 3 }}
                >
                    Explore Hubs
                </Button>
            </Box>

            {/* Features Section */}
            <Box
                component="section"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    padding: 4,
                    backgroundColor: 'background.default',
                }}
            >
                <Typography variant="body1" textAlign="center">
                    Access Premium Tools
                </Typography>
                <Typography variant="body1" textAlign="center">
                    Multiple Locations
                </Typography>
                <Typography variant="body1" textAlign="center">
                    Seamless Payments
                </Typography>
            </Box>

            {/* Hubs Section */}
            <Box
                component="section"
                id="hubs"
                sx={{
                    padding: 4,
                    backgroundColor: 'background.paper',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Available Work Hubs
                </Typography>
                <Grid container spacing={4}>
                    {hubs.map((hub) => (
                        <Grid item xs={12} sm={6} md={4} key={hub.id}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={hub.imageUrl}
                                    alt={hub.name}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {hub.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Location: {hub.location}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Price: ₦{hub.price.toLocaleString()} per hour
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        to={`/hub/${hub.id}`}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Book Now
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default HomePage;

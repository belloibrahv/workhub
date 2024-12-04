import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  CheckCircle as PaidIcon,
  PendingOutlined as PendingIcon,
  LocationOn as LocationIcon,
  DevicesOther as DevicesIcon,
} from '@mui/icons-material';
import { useBookingStore } from '../store/booking';

const BookingHistoryPage: React.FC = () => {
  const { bookingHistory } = useBookingStore();

  const [filter, setFilter] = useState({
    hubId: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Reset window.currentBookingInfo when the page loads
  useEffect(() => {
    window.currentBookingInfo = { isInFinalPage: false }; 
  }, []);

  const filteredBookings = useMemo(() => {
    const seen = new Set(); 
    
    return bookingHistory
      .filter((booking) => {
        const bookingId = booking.id || `${booking.timestamp}-${booking.hubDetails?.id}`;
        if (seen.has(bookingId)) return false; // Skip if already seen
        seen.add(bookingId); // Mark this booking as seen
        
        // Hub ID filter
        if (filter.hubId !== 'all' && booking.hubDetails?.id !== filter.hubId) return false;
        
        // Payment status filter
        const isPaid = booking.paymentDetails?.paymentMode?.payNow;
        if (
          filter.paymentStatus !== 'all' &&
          (filter.paymentStatus === 'Paid' ? !isPaid : isPaid)
        )
          return false;
        
        // Date range filter
        const bookingDate = new Date(booking.timestamp || Date.now());
        if (filter.startDate && bookingDate < new Date(filter.startDate)) return false;
        if (filter.endDate && bookingDate > new Date(filter.endDate)) return false;
  
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp || Date.now());
        const dateB = new Date(b.timestamp || Date.now());
        return dateB.getTime() - dateA.getTime();
      });
  }, [bookingHistory, filter]);
  

  const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFilter((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  const renderToolChips = (configDetails: any) => {
    if (!configDetails) return <Typography variant="body2" color="text.secondary">No configuration selected</Typography>;

    const tools = [
      { type: 'RAM', label: configDetails.ram },
      { type: 'Storage', label: configDetails.storage },
      { type: 'OS', label: configDetails.os }
    ].filter(tool => tool.label);

    return (
      <Grid container spacing={1}>
        {tools.map((tool, index) => (
          <Grid item key={index}>
            <Chip
              icon={<DevicesIcon />}
              label={`${tool.type}: ${tool.label}`}
              variant="outlined"
              size="small"
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Booking History
        </Typography>
        
        {/* Filter Section */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Hub Location</InputLabel>
                <Select
                  name="hubId"
                  value={filter.hubId}
                  label="Hub Location"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Hubs</MenuItem>
                  <MenuItem value={1}>Lekki Hub</MenuItem>
                  <MenuItem value={2}>Yaba Hub</MenuItem>
                  <MenuItem value={3}>Sango Hub</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  name="paymentStatus"
                  value={filter.paymentStatus}
                  label="Payment Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center', mt: 3 }}>
            No bookings found matching your filters.
          </Alert>
        ) : (
          filteredBookings.map((booking, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  {/* Hub Details */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="primary">
                      <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {booking.hubDetails?.name || 'Unknown Hub'}
                    </Typography>
                  </Grid>

                  {/* Payment Status */}
                  <Grid item xs={12} sm={6} textAlign="right">
                    <Chip
                      icon={booking.paymentDetails?.paymentMode?.payNow ? <PaidIcon /> : <PendingIcon />}
                      label={booking.paymentDetails?.paymentMode?.payNow ? 'Paid' : 'Pending'}
                      color={booking.paymentDetails?.paymentMode?.payNow ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Grid>

                  {/* User Details */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">User Details</Typography>
                    <Typography variant="body2">
                      Name: {booking.userDetails?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Email: {booking.userDetails?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {booking.userDetails?.phone || 'N/A'}
                    </Typography>
                  </Grid>

                  {/* Booking Details */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Booking Details</Typography>
                    <Typography variant="body2">
                      Date: {booking.bookingDetails?.bookDate || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Start Time: {booking.bookingDetails?.bookStartTime || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {booking.bookingDetails?.bookEndTime || 'N/A'}
                    </Typography>
                  </Grid>

                  {/* Payment Details */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Payment Details</Typography>
                    <Typography variant="body2">
                      Payment Mode: {booking.paymentDetails?.paymentMode?.payNow ? 'Pay Now' : 'Pay Later'}
                    </Typography>
                    <Typography variant="body2">
                      Payment Status: {booking.paymentDetails?.paymentMode?.payNow ? 'Completed' : 'Pending'}
                    </Typography>
                  </Grid>

                  {/* Configuration Details */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Configuration Details</Typography>
                    {renderToolChips(booking.configDetails)}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default BookingHistoryPage;

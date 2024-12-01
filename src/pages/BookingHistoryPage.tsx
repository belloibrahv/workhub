import React, { useState, useMemo } from 'react';
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
  Filter as FilterIcon,
  CalendarToday as CalendarIcon,
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

  // Filter and validate bookings
  const filteredBookings = useMemo(() => {
    return bookingHistory
      .filter((booking) => {
        const isValidBooking =
          booking?.timestamp &&
          booking?.formData?.hubId &&
          booking?.formData?.userDetails?.fullName &&
          booking?.formData?.userDetails?.visitDay &&
          booking?.formData?.userDetails?.startHour &&
          booking?.formData?.userDetails?.endHour;

        if (!isValidBooking) return false;

        const bookingDate = new Date(booking.timestamp);

        // Hub ID filter
        if (filter.hubId !== 'all' && booking.formData?.hubId !== filter.hubId) return false;

        // Payment status filter
        const isPaid = booking.formData?.paymentDetails?.paymentMode?.payNow;
        if (
          filter.paymentStatus !== 'all' &&
          (filter.paymentStatus === 'Paid' ? !isPaid : isPaid)
        )
          return false;

        // Date range filter
        if (filter.startDate && bookingDate < new Date(filter.startDate)) return false;
        if (filter.endDate && bookingDate > new Date(filter.endDate)) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder === 'newest'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
  }, [bookingHistory, filter, sortOrder]);

  const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFilter((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  const renderToolChips = (tools: any[] = []) => {
    if (!tools || tools.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No tools selected
        </Typography>
      );
    }

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
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Hub Location</InputLabel>
                <Select
                  name="hubId"
                  value={filter.hubId}
                  label="Hub Location"
                  onChange={handleFilterChange}
                  startAdornment={<LocationIcon />}
                >
                  <MenuItem value="all">All Hubs</MenuItem>
                  <MenuItem value="lekki">Lekki Hub</MenuItem>
                  <MenuItem value="yaba">Yaba Hub</MenuItem>
                  <MenuItem value="sango">Sango Hub</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
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

            <Grid item xs={12} sm={3}>
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

            <Grid item xs={12} sm={3}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filter.endDate}
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="primary">
                      <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {booking.formData?.hubId} Hub
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booked on: {new Date(booking.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} textAlign="right">
                    <Chip
                      icon={
                        booking.formData?.paymentDetails?.paymentMode?.payNow ? (
                          <PaidIcon />
                        ) : (
                          <PendingIcon />
                        )
                      }
                      label={
                        booking.formData?.paymentDetails?.paymentMode?.payNow
                          ? 'Paid'
                          : 'Pending'
                      }
                      color={
                        booking.formData?.paymentDetails?.paymentMode?.payNow
                          ? 'success'
                          : 'warning'
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">User Details</Typography>
                    <Typography variant="body2">
                      Name: {booking.formData?.userDetails?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Email: {booking.formData?.userDetails?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {booking.formData?.userDetails?.phone || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Booking Time</Typography>
                    <Typography variant="body2">
                      Visit Day: {booking.formData?.userDetails?.visitDay || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Start Time: {booking.formData?.userDetails?.startHour || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {booking.formData?.userDetails?.endHour || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Selected Tools</Typography>
                    {renderToolChips(booking.formData?.selectedTools)}
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

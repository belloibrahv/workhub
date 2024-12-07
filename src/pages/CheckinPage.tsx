import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';

const CheckinPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { updateCurrentBooking } = useBookingStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ageRange: '',
    visitDay: '',
    startHour: '',
    endHour: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hubId) {
      setError('Invalid hub selection. Please go back and select a hub.');
      return;
    }

    // Retrieve or initialize booking data
    const existingBooking = window.currentBookingInfo || {};
    const { userDetails = {}, bookingDetails = {}, hubDetails = {} } = existingBooking;

    setFormData({
      name: userDetails.name || '',
      email: userDetails.email || '',
      phone: userDetails.phone || '',
      ageRange: userDetails.ageRange || '',
      visitDay: bookingDetails.bookDate || '',
      startHour: bookingDetails.bookStartTime || '',
      endHour: bookingDetails.bookEndTime || '',
    });

    // Update session storage with hub details if not already present
    window.currentBookingInfo = {
      ...existingBooking,
      hubDetails: hubDetails.id ? hubDetails : { id: hubId, name: `Hub ${hubId}` },
    };

    // Sync with sessionStorage
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [hubId]);

  useEffect(() => {
    const { visitDay, startHour, endHour, ...userDetails } = formData;

    // Update global session variable with user details
    window.currentBookingInfo = {
      ...window.currentBookingInfo,
      userDetails: { ...userDetails },
      bookingDetails: {
        bookDate: formData.visitDay,
        bookStartTime: formData.startHour,
        bookEndTime: formData.endHour,
      },
      isInFinalPage: false,
    };

    // Sync with sessionStorage
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, email, phone, ageRange, visitDay, startHour, endHour } = formData;
    if (!name.trim()) return 'Full Name is required.';
    if (name.length < 3) return 'Full Name must be at least 3 characters.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return 'Enter a valid email address.';
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phone || !phoneRegex.test(phone)) return 'Phone must be 10-15 digits.';
    if (!ageRange) return 'Please select an age range.';
    if (!visitDay) return 'Visit Day is required.';
    if (!startHour) return 'Start Hour is required.';
    if (!endHour) return 'End Hour is required.';
    if (startHour >= endHour) return 'End Hour must be later than Start Hour.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    // Prepare and save updated booking information
    const updatedBooking = {
      ...window.currentBookingInfo,
      userDetails: { ...formData },
      bookingDetails: {
        bookDate: formData.visitDay,
        bookStartTime: formData.startHour,
        bookEndTime: formData.endHour,
      },
      isInFinalPage: false,
    };

    updateCurrentBooking(updatedBooking);
    window.currentBookingInfo = updatedBooking;

    // Sync with sessionStorage
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(updatedBooking));

    setLoading(false);
    navigate(`/tools/${hubId}`);
  };

  if (error) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ marginTop: 2 }} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Check In to Your Hub
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Age Range</InputLabel>
            <Select
              name="ageRange"
              value={formData.ageRange}
              onChange={handleInputChange}
              label="Age Range"
            >
              <MenuItem value="">Select Age Range</MenuItem>
              <MenuItem value="16-20">16-20</MenuItem>
              <MenuItem value="21-25">21-25</MenuItem>
              <MenuItem value="26-30">26-30</MenuItem>
              <MenuItem value="31+">31 and above</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Visit Day"
            name="visitDay"
            type="date"
            value={formData.visitDay}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Start Hour"
            name="startHour"
            type="time"
            value={formData.startHour}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            helperText="Enter your start time for the hub visit."
          />
          <TextField
            label="End Hour"
            name="endHour"
            type="time"
            value={formData.endHour}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            helperText="End time must be after the start time."
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Tools'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CheckinPage;

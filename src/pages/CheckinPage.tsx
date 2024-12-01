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
  FormHelperText,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';

const CheckinPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    visitDay: '',
    startHour: '',
    endHour: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentBooking?.formData?.userDetails) {
      setFormData({
        ...formData,
        ...currentBooking.formData.userDetails,
      });
    }
  }, [currentBooking]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, age, visitDay, startHour, endHour } = formData;

    if (!fullName.trim()) return 'Full Name is required.';
    if (fullName.length < 3) return 'Full Name must be at least 3 characters.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return 'Enter a valid email address.';
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phone || !phoneRegex.test(phone)) return 'Phone must be 10-15 digits.';
    if (!age) return 'Please select an age range.';
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

    const userDetails = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
      visitDay: formData.visitDay,
      startHour: formData.startHour,
      endHour: formData.endHour,
    };

    const bookingDetails = {
      hubId,
      userDetails,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      isInFinalPage: false,
    };

    // Update the global state
    updateCurrentBooking({
      formData: bookingDetails,
      currentStep: 'tools',
      isInFinalPage: false,
    });

    // Save the booking to bookingHistory and localStorage
    addBookingResult(bookingDetails);

    // Update the global variable for browser testing
    window.currentBookingInfo = bookingDetails;

    setLoading(false);
    navigate(`/tools/${hubId}`);
  };

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
            name="fullName"
            value={formData.fullName}
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
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              label="Age Range"
            >
              <MenuItem value="">Select Age Range</MenuItem>
              <MenuItem value="16-20">16-20</MenuItem>
              <MenuItem value="21-25">21-25</MenuItem>
              <MenuItem value="26-30">26-30</MenuItem>
              <MenuItem value="31+">31 and above</MenuItem>
            </Select>
            <FormHelperText>Age range is required.</FormHelperText>
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

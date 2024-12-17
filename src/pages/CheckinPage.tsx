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

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    ageRange?: string;
    visitDay?: string;
    startHour?: string;
    endHour?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0); // NEW: Total price state

  useEffect(() => {
    if (!hubId) {
      navigate('/');
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
  }, [hubId, navigate]);

  useEffect(() => {
    const { visitDay, startHour, endHour, ...userDetails } = formData;

    if (startHour && endHour) {
      const start = parseInt(startHour.split(':')[0], 10);
      const end = parseInt(endHour.split(':')[0], 10);
      const pricePerHour = window.currentBookingInfo?.hubDetails?.price || 0;

      if (start < end) {
        const hours = end - start;
        const total = hours * pricePerHour;
        setTotalPrice(total);

        // Update bookingDetails with total price
        window.currentBookingInfo = {
          ...window.currentBookingInfo,
          userDetails: { ...userDetails },
          bookingDetails: {
            bookDate: formData.visitDay,
            bookStartTime: formData.startHour,
            bookEndTime: formData.endHour,
            totalPrice: total,
          },
          isInFinalPage: false,
        };
        sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
      } else {
        setTotalPrice(0);
      }
    }
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [formData, formData.startHour, formData.endHour]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const { name, email, phone, ageRange, visitDay, startHour, endHour } = formData;

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else if (name.length < 3) {
      newErrors.name = 'Full Name must be at least 3 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // Phone validation (more flexible)
    const sanitizedPhone = phone.replace(/[^\d]/g, '');
    if (!phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      newErrors.phone = 'Phone number must be between 10-15 digits.';
    }

    // Age range validation
    if (!ageRange) {
      newErrors.ageRange = 'Please select an age range.';
    }

    // Visit day validation
    if (!visitDay) {
      newErrors.visitDay = 'Visit Day is required.';
    }

    // Start hour validation
    if (!startHour) {
      newErrors.startHour = 'Start Hour is required.';
    }

    // End hour validation
    if (!endHour) {
      newErrors.endHour = 'End Hour is required.';
    } else if (startHour && endHour && startHour >= endHour) {
      newErrors.endHour = 'End Hour must be later than Start Hour.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTime = (time: string) => {
    const match = time.match(/^([0-2][0-9]):00$/);
    return match ? match[0] : ""; // Return valid time or reset if invalid
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { visitDay, startHour, endHour, ...userDetails } = formData;

    // Prepare and save updated booking information
    const updatedBooking = {
      ...window.currentBookingInfo,
      userDetails: { ...userDetails },
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

  return (
    <Box sx={{ padding: 4, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Check In to Your Hub
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
            required
            error={!!errors.phone}
            helperText={errors.phone}
          />
          <FormControl 
            fullWidth 
            required 
            error={!!errors.ageRange}
          >
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
            {errors.ageRange && (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                {errors.ageRange}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Visit Day"
            name="visitDay"
            type="date"
            value={formData.visitDay || ''}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.visitDay}
            helperText={errors.visitDay}
            onFocus={(e) => {
              if (!formData.visitDay) {
                const frozenDate = '2024-01-01';
                setFormData((prev) => ({ ...prev, visitDay: frozenDate }));
                e.target.value = frozenDate; // Pre-fill the frozen date
              }
            }}
          />

          <TextField
            label="Start Hour"
            name="startHour"
            type="time"
            value={formData.startHour}
            onChange={(e) => {
              const validTime = validateTime(e.target.value);
              setFormData((prev) => ({ ...prev, startHour: validTime }));
              if (errors.startHour) {
                setErrors((prev) => ({ ...prev, startHour: undefined }));
              }
            }}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 3600, // Ensures dropdown picker increments by an hour
              pattern: "[0-2][0-9]:00", // Ensures manual input matches 24-hour format
            }}
            error={!!errors.startHour}
            helperText={errors.startHour || "Select the start time (hourly increments only)."}
          />

          <TextField
            label="End Hour"
            name="endHour"
            type="time"
            value={formData.endHour}
            onChange={(e) => {
              const validTime = validateTime(e.target.value);
              setFormData((prev) => ({ ...prev, endHour: validTime }));
              if (errors.endHour) {
                setErrors((prev) => ({ ...prev, endHour: undefined }));
              }
            }}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 3600,
              pattern: "[0-2][0-9]:00",
            }}
            error={!!errors.endHour}
            helperText={errors.endHour || "Select the end time (hourly increments only)."}
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

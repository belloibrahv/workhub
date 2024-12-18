import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
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
    visitDay: '',
    startHour: '',
    endHour: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    visitDay?: string;
    startHour?: string;
    endHour?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [totalBookHours, setTotalBookHours] = useState(0);
  const [totalBookPrice, setTotalBookPrice] = useState<number>(0);

  useEffect(() => {
    if (!hubId) {
      navigate('/');
      return;
    }

    // Retrieve or initialize booking data
    const existingBooking = window.currentBookingInfo || {};
    const { userDetails = {}, bookingDetails = {}, hubDetails = {} } = existingBooking;

    // Update form data from existing booking info
    setFormData({
      name: userDetails.name || '',
      email: userDetails.email || '',
      phone: userDetails.phone || '',
      visitDay: bookingDetails.bookDate || '',
      startHour: bookingDetails.bookStartTime || '',
      endHour: bookingDetails.bookEndTime || '',
    });

    // Update window.currentBookingInfo with hub details
    window.currentBookingInfo = {
      ...existingBooking,
      hubDetails: hubDetails.id ? hubDetails : { id: Number(hubId), name: `Hub ${hubId}` },
      isInFinalPage: false,
    };

    // Sync with sessionStorage
    sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
  }, [hubId, navigate]);

  useEffect(() => {
    const { visitDay, startHour, endHour } = formData;

    // Update window.currentBookingInfo for start and end hours independently
    if (startHour) {
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        bookingDetails: {
          ...window.currentBookingInfo.bookingDetails,
          bookStartTime: startHour,
        },
        isInFinalPage: false,
      };
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
    }

    if (endHour) {
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        bookingDetails: {
          ...window.currentBookingInfo.bookingDetails,
          bookEndTime: endHour,
        },
        isInFinalPage: false,
      };
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
    }

    // Calculate total book hours and price
    if (startHour && endHour) {
      const start = parseInt(startHour.split(':')[0], 10);
      const end = parseInt(endHour.split(':')[0], 10);
      const pricePerHour = window.currentBookingInfo?.bookingDetails?.bookPrice || 0;

      if (start < end) {
        const hours = end - start;
        const total = hours * pricePerHour;
        
        setTotalBookHours(hours);
        setTotalBookPrice(total);

        // Update window.currentBookingInfo with booking details
        window.currentBookingInfo = {
          ...window.currentBookingInfo,
          bookingDetails: {
            ...window.currentBookingInfo.bookingDetails,
            bookDate: visitDay,
            totalBookHours: `${hours}-hours`,
            totalBookPrice: total,
          },
          isInFinalPage: false,
        };

        // Sync with sessionStorage
        sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
      } else {
        setTotalBookHours(0);
        setTotalBookPrice(0);
      }
    }
  }, [formData.startHour, formData.endHour, formData.visitDay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update window.currentBookingInfo in real-time for each field
    if (name === 'name' || name === 'email' || name === 'phone') {
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        userDetails: {
          ...window.currentBookingInfo.userDetails,
          [name]: value
        }
      };
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
    }
    
    // Update bookDate (visitDay) in real-time
    if (name === 'visitDay') {
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        bookingDetails: {
          ...window.currentBookingInfo.bookingDetails,
          bookDate: value
        },
        isInFinalPage: false
      };
      sessionStorage.setItem('currentBookingInfo', JSON.stringify(window.currentBookingInfo));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    const { name, email, phone, visitDay, startHour, endHour } = formData;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Prepare and save updated booking information
    const updatedBooking = {
      ...window.currentBookingInfo,
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
          <Typography>Total Book Hours: {totalBookHours} Hours</Typography>
          <Typography variant="h6">Total Book Price: ₦{totalBookPrice}</Typography>
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

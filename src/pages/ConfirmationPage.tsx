import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  DevicesOther as DevicesIcon,
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import { BookingResult } from '@/types/booking';


// Helper function to format expiry date to MM/YY
const formatExpiryDate = (value: string) => {
  if (value.length === 2 && value.indexOf('/') === -1) {
    return value + '/';
  }
  if (value.length > 5) {
    return value.slice(0, 5);
  }
  return value;
};

const validateCardNumber = (cardNumber: string): boolean =>
  cardNumber.length >= 10 && cardNumber.length <= 20;

const isValidExpiryDate = (expiryDate: string): boolean => {
  return true;
};

const isValidCVV = (cvv: string): boolean => cvv.length === 3 || cvv.length === 4;

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, addBookingResult } = useBookingStore();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'later' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure valid booking information
    if (!currentBooking.hubDetails?.id) {
      navigate('/');
      return;
    }

    // Initialize global booking info with isInFinalPage set to false when landing
    window.currentBookingInfo = { ...currentBooking, isInFinalPage: false };
    const storedResults = JSON.parse(sessionStorage.getItem('bookingResults') || '[]');
    window.bookingResults = storedResults;
  }, [currentBooking, navigate]);

  const handlePaymentMethodSelect = (method: 'now' | 'later') => {
    setPaymentMethod(method);
    window.currentBookingInfo.paymentDetails = {
      paymentMode: { payNow: method === 'now', payLater: method === 'later' },
      cardDetails: method === 'now' ? {cardNumber: '', expiryDate: '', cvv: ''} : {cardNumber: '', expiryDate: '', cvv: ''},
    };
    // Set isInFinalPage to true when payment method is selected
    window.currentBookingInfo.isInFinalPage = true;
    setActiveStep(1);
  };

  const resetPaymentSelection = () => {
    setPaymentMethod(null);
    setActiveStep(0);
    // Reset isInFinalPage to false when going back to payment selection
    window.currentBookingInfo.isInFinalPage = false;
  };

  // Update the existing payment details change handler
  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === 'expiryDate' ? formatExpiryDate(value) : value;

    setPaymentDetails((prev) => ({ ...prev, [name]: updatedValue }));

    if (paymentMethod === 'now') {
      window.currentBookingInfo.paymentDetails.cardDetails = {
        ...window.currentBookingInfo.paymentDetails.cardDetails,
        [name]: updatedValue,
      };
    }
  };

  // Modify the back to payment methods button handler
  const handleBackToPaymentMethods = () => {
    resetPaymentSelection();
    // Additional cleanup if needed
    setPaymentDetails({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'now') {
      if (!validateCardNumber(paymentDetails.cardNumber)) return 'Invalid card number.';
      if (!isValidExpiryDate(paymentDetails.expiryDate)) return 'Invalid expiry date.';
      if (!isValidCVV(paymentDetails.cvv)) return 'Invalid CVV.';
    }
    return '';
  };

  const handlePaymentSubmit = () => {
    const validationError = validatePaymentDetails();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const bookingResult: BookingResult = {
      ...window.currentBookingInfo,
      paymentDetails: window.currentBookingInfo.paymentDetails,
    };

    // Remove unneeded fields
    // delete bookingResult.isInFinalPage;
    delete bookingResult.hubDetails.id;

    const existingResults = window.bookingResults || [];
    const isDuplicate = existingResults.some(
      (result: BookingResult) =>
        result.hubDetails?.name === bookingResult.hubDetails.name &&
        result.bookingDetails.bookDate === bookingResult.bookingDetails.bookDate &&
        result.bookingDetails.bookStartTime === bookingResult.bookingDetails.bookStartTime
    );

    if (!isDuplicate) {
      const updatedResults = [...existingResults, bookingResult];
      window.bookingResults = updatedResults;
      sessionStorage.setItem('bookingResults', JSON.stringify(updatedResults));
      addBookingResult(bookingResult);
    }

    setLoading(false);
    navigate('/history', { replace: true });
  };

  const renderToolConfiguration = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Chip icon={<DevicesIcon />} label={`RAM: ${currentBooking.configDetails.ram}`} variant="outlined" />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Chip icon={<DevicesIcon />} label={`Storage: ${currentBooking.configDetails.storage}`} variant="outlined" />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Chip icon={<DevicesIcon />} label={`OS: ${currentBooking.configDetails.os}`} variant="outlined" />
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Booking Confirmation
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {['Select Payment Method', 'Payment Details'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            {/* Go Back to Tool Selection */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/tools/${currentBooking.hubDetails.id}`)}
              >
                Back to Tool Selection
              </Button>
            </Box>

            {/* Hub Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <LocationOnIcon sx={{ mr: 1 }} />
                Hub Details
              </Typography>
              <Typography>{currentBooking.hubDetails.name} (ID: {currentBooking.hubDetails.id})</Typography>
            </Box>

            {/* User Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Typography>Name: {currentBooking.userDetails.name}</Typography>
              <Typography>Email: {currentBooking.userDetails.email}</Typography>
              <Typography>Phone: {currentBooking.userDetails.phone}</Typography>
              {/* <Typography>Age Range: {currentBooking.userDetails.ageRange}</Typography> */}
            </Box>

            {/* Booking Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              <Typography>Date: {currentBooking.bookingDetails.bookDate}</Typography>
              <Typography>Start Time: {currentBooking.bookingDetails.bookStartTime}</Typography>
              <Typography>End Time: {currentBooking.bookingDetails.bookEndTime}</Typography>
            </Box>

            {/* Tool Configuration */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <DevicesIcon sx={{ mr: 1 }} />
                Tool Configuration
              </Typography>
              {renderToolConfiguration()}
            </Box>

            {/* Payment Steps */}
            {paymentMethod === null && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={() => handlePaymentMethodSelect('now')}
                >
                  Pay Now
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ScheduleIcon />}
                  onClick={() => handlePaymentMethodSelect('later')}
                >
                  Pay Later
                </Button>
              </Box>
            )}

            {paymentMethod === 'now' && (
              <Box component="form" onSubmit={(e) => e.preventDefault()}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  <CreditCardIcon sx={{ mr: 1 }} />
                  Payment Details
                </Typography>
                {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
                <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handlePaymentDetailsChange}
                    required
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon 
                            color="action" 
                            titleAccess="Enter card number without spaces or hyphens"
                          />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter 16-digit card number (Visa, MasterCard, Amex, Discover)"
                  />
                </Grid>
                <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Format and validate the expiry date
                    const formattedValue = formatExpiryDate(value);
                    setPaymentDetails((prev) => ({
                      ...prev,
                      expiryDate: formattedValue,
                    }));
                    window.currentBookingInfo.paymentDetails.cardDetails.expiryDate = formattedValue;
                  }}
                  required
                  placeholder="MM/YY"
                  inputProps={{
                    maxLength: 5,
                    pattern: "(0[1-9]|1[0-2])/[0-9]{2}", // Enforces MM/YY format
                  }}
                  helperText="Enter expiry date in MM/YY format"
                />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handlePaymentDetailsChange}
                    required
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon 
                            color="action" 
                            titleAccess="3 or 4 digit security code"
                          />
                        </InputAdornment>
                      ),
                    }}
                    helperText="3-4 digit security code on card back"
                  />
                </Grid>
              </Grid> 
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleBackToPaymentMethods}>
                  Back to Payment Methods
                </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </Box>
              </Box>
            )}

            {paymentMethod === 'later' && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You've chosen to pay later. Your booking is pending.
                </Typography>
                <Button variant="outlined" onClick={handleBackToPaymentMethods}>
                  Back to Payment Methods
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2 }}
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  Confirm Booking
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ConfirmationPage;

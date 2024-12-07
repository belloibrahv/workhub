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


const validateCardNumber = (cardNumber: string): boolean =>
  cardNumber.length >= 10 && cardNumber.length <= 20;

const isValidExpiryDate = (expiryDate: string): boolean => {
  const FROZEN_DATE = new Date('2024-01-01');
  const [year, month] = expiryDate.split('-').map(Number);
  const expiry = new Date(year, month - 1);
  return expiry > FROZEN_DATE;
};

const isValidCVV = (cvv: string): boolean => cvv.length === 3 || cvv.length === 4;

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, addBookingResult } = useBookingStore();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'later' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentBooking.hubDetails?.id) {
      navigate('/');
      return;
    }
  
    // Sanitize booking info for storage, including hubDetails with the id
    const sanitizedBookingInfo = {
      ...currentBooking,
      userDetails: { ...currentBooking.userDetails },
      isInFinalPage: true,
    };
  
    // Initialize global variables
    window.currentBookingInfo = sanitizedBookingInfo;
  
    // Populate window.bookingResults from sessionStorage (id will be excluded from bookingResults)
    const storedBookingResults = JSON.parse(sessionStorage.getItem('bookingResults') || '[]');
    window.bookingResults = storedBookingResults;
  }, [currentBooking, navigate]);  

  const handlePaymentMethodSelect = (method: 'now' | 'later') => {
    setPaymentMethod(method);
    window.currentBookingInfo = {
      ...window.currentBookingInfo,
      paymentDetails: {
        paymentMode: { payNow: method === 'now', payLater: method === 'later' },
        ...(method === 'now' && { cardDetails: {} }),
      },
    };
    setActiveStep(1);
  };

  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));

    if (paymentMethod === 'now') {
      window.currentBookingInfo = {
        ...window.currentBookingInfo,
        paymentDetails: {
          ...window.currentBookingInfo.paymentDetails,
          cardDetails: {
            ...window.currentBookingInfo.paymentDetails?.cardDetails,
            [name]: value,
          },
        },
      };
    }
  };

  const validatePaymentDetails = (): boolean => {
    if (paymentMethod === 'now') {
      if (!validateCardNumber(paymentDetails.cardNumber)) {
        setErrorMessage('Please enter a valid card number.');
        return false;
      }
      if (!isValidExpiryDate(paymentDetails.expiryDate)) {
        setErrorMessage('Please enter a valid expiry date.');
        return false;
      }
      if (!isValidCVV(paymentDetails.cvv)) {
        setErrorMessage('Please enter a valid CVV.');
        return false;
      }
    }
    return true;
  };

  const handlePaymentSubmit = async () => {
    setErrorMessage('');
    setLoading(true);
  
    if (!validatePaymentDetails()) {
      setLoading(false);
      return;
    }
  
    const bookingResult: BookingResult = {
      ...window.currentBookingInfo,
      paymentDetails: window.currentBookingInfo.paymentDetails,
    };
    delete bookingResult.isInFinalPage;
    delete bookingResult.hubDetails.id;
    
    try {
      // Safely parse existing booking results
      const storedResults = sessionStorage.getItem('bookingResults');
      const existingResults: BookingResult[] = storedResults 
        ? JSON.parse(storedResults).map((result: any) => {
            const sanitizedResult = { ...result };
            delete sanitizedResult.userDetails?.visitDay;
            delete sanitizedResult.userDetails?.startHour;
            delete sanitizedResult.userDetails?.endHour;
            delete sanitizedResult.hubDetails?.location;
            delete sanitizedResult.hubDetails?.price;
            return sanitizedResult;
          })
        : [];
  
      // Filter out duplicate bookings
      const isDuplicateBooking = existingResults.some(
        (existingBooking) =>
          existingBooking &&
          existingBooking.hubDetails?.id === bookingResult.hubDetails.id &&
          existingBooking.bookingDetails.bookDate === bookingResult.bookingDetails.bookDate &&
          existingBooking.bookingDetails.bookStartTime === bookingResult.bookingDetails.bookStartTime
      );
  
      if (!isDuplicateBooking) {
        const updatedResults = [...existingResults, bookingResult];
        sessionStorage.setItem('bookingResults', JSON.stringify(updatedResults));
        addBookingResult(bookingResult);
      }
  
      setLoading(false);
      navigate('/history', { replace: true });
    } catch (error) {
      console.error('Error finalizing booking:', error);
      setErrorMessage('Failed to save booking. Please try again.');
      setLoading(false);
    }
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
              <Typography>Age Range: {currentBooking.userDetails.ageRange}</Typography>
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
                    type="month"
                    value={paymentDetails.expiryDate}
                    onChange={handlePaymentDetailsChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon 
                            color="action" 
                            titleAccess="Select a future expiry month and year"
                          />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Select expiry month and year"
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
                  <Button variant="outlined" onClick={() => setPaymentMethod(null)}>
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
                <Button variant="outlined" onClick={() => setPaymentMethod(null)}>
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

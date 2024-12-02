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
  Alert
} from '@mui/material';
import { 
  CreditCard as CreditCardIcon, 
  Payment as PaymentIcon, 
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  DevicesOther as DevicesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import { finalizeBooking } from '@/utils/finalizeBooking';
import { BookingResult } from '@/types/booking';

// Validation Utilities
const validateCardNumber = (cardNumber: string): boolean => {
  // Remove all non-digit characters
  const sanitizedNumber = cardNumber.replace(/\s|\-/g, '');
  
  // Check if the number is between 12 and 19 digits long
  return /^\d{12,19}$/.test(sanitizedNumber);
};

// Simplified expiry date validation
const isValidExpiryDate = (expiryDate: string): boolean => {
  const [year, month] = expiryDate.split('-').map(Number);
  const expiryDateObj = new Date(year, month - 1);
  return expiryDateObj > new Date();
};

// Simplified CVV validation
const isValidCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();
  
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
    // Ensure we have booking details, redirect if not
    if (!currentBooking.hubDetails.id) {
      navigate('/');
      return;
    }

    // Initialize window.currentBookingInfo with current booking
    window.currentBookingInfo = { ...currentBooking };
    
    // Ensure window.bookingResults exists
    if (!window.bookingResults) {
      window.bookingResults = [];
    }
  }, [currentBooking, navigate]);
  
  const handlePaymentMethodSelect = (method: 'now' | 'later') => {
    setPaymentMethod(method);
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  //   setErrorMessage('');
  //   setLoading(true);
  
  //   if (paymentMethod === 'now') {
  //     // Validate card details
  //     if (!validateCardNumber(paymentDetails.cardNumber)) {
  //       setErrorMessage('Invalid card number. Please check and try again.');
  //       setLoading(false);
  //       return;
  //     }
  //     const [year, month] = paymentDetails.expiryDate.split('-');
  //     const expiryDate = new Date(+year, +month - 1);
  //     if (expiryDate < new Date()) {
  //       setErrorMessage('Card has expired.');
  //       setLoading(false);
  //       return;
  //     }
  //     if (!/^\d{3}$/.test(paymentDetails.cvv)) {
  //       setErrorMessage('Invalid CVV.');
  //       setLoading(false);
  //       return;
  //     }
  //   }
  
  //   try {
  //     // Prepare booking result with the new structure
  //     const bookingResult: BookingResult = {
  //       ...currentBooking,
  //       paymentDetails: {
  //         paymentMode: {
  //           payNow: paymentMethod === 'now',
  //           payLater: paymentMethod === 'later'
  //         },
  //         ...(paymentMethod === 'now' && { 
  //           cardDetails: {
  //             cardNumber: paymentDetails.cardNumber,
  //             expiryDate: paymentDetails.expiryDate,
  //             cvv: paymentDetails.cvv
  //           } 
  //         })
  //       },
  //       isInFinalPage: true
  //     };
  
  //     // Finalize booking and add to results
  //     finalizeBooking(bookingResult);
  //     addBookingResult(bookingResult);
      
  //     // Update global window object
  //     window.currentBookingInfo = bookingResult;
      
  //     // Navigate to history page
  //     navigate('/history', { replace: true });
  //   } catch (error) {
  //     setErrorMessage('Failed to save booking. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePaymentSubmit = async () => {
  
    // Reset previous error states
    setErrorMessage('');
    setLoading(true);

    setErrorMessage('');
    setLoading(true);
    
    try {
      // Comprehensive validation of booking details
      if (!currentBooking.hubDetails?.id) {
        console.error('Missing hub details');
        setErrorMessage('Invalid booking: Hub details are missing');
        setLoading(false);
        return;
      }
  
      if (!currentBooking.configDetails) {
        console.error('Missing configuration details');
        setErrorMessage('Invalid booking: Tool configuration is incomplete');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'now') {
        // Validate card details
        if (!validateCardNumber(paymentDetails.cardNumber)) {
          setErrorMessage('Please enter a valid card number.');
          setLoading(false);
          return;
        }

        if (!isValidExpiryDate(paymentDetails.expiryDate)) {
          setErrorMessage('Please enter a valid expiry date.');
          setLoading(false);
          return;
        }

        if (!isValidCVV(paymentDetails.cvv)) {
          setErrorMessage('Please enter a valid CVV.');
          setLoading(false);
          return;
        }
      }
  
      // Prepare booking result
      const bookingResult: BookingResult = {
        ...currentBooking,
        paymentDetails: {
          paymentMode: {
            payNow: paymentMethod === 'now',
            payLater: paymentMethod === 'later'
          },
          ...(paymentMethod === 'now' && { 
            cardDetails: {
              cardNumber: paymentDetails.cardNumber,
              expiryDate: paymentDetails.expiryDate,
              cvv: paymentDetails.cvv
            } 
          })
        },
        isInFinalPage: true
      };
  
      // Additional logging
      console.log('Booking Result:', bookingResult);
  
      // Finalize booking
      try {
        await finalizeBooking(bookingResult);
        addBookingResult(bookingResult);
        
        // Update global window object
        window.currentBookingInfo = bookingResult;
        window.bookingResults = window.bookingResults || [];
        window.bookingResults.push(bookingResult);
  
        // Navigate to history page
        navigate('/history', { replace: true });
      } catch (finalizeError) {
        console.error('Finalize Booking Error:', finalizeError);
        setErrorMessage('Failed to save booking. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected Error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderToolConfiguration = () => {
    // This would need to be adjusted based on how tools are now stored in the new structure
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Chip 
            icon={<DevicesIcon />} 
            label={`RAM: ${currentBooking.configDetails.ram}`} 
            variant="outlined" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Chip 
            icon={<DevicesIcon />} 
            label={`Storage: ${currentBooking.configDetails.storage}`} 
            variant="outlined" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Chip 
            icon={<DevicesIcon />} 
            label={`OS: ${currentBooking.configDetails.os}`} 
            variant="outlined" 
          />
        </Grid>
      </Grid>
    );
  };

  const paymentSteps = ['Select Payment Method', 'Payment Details'];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Booking Confirmation
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {paymentSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <LocationOnIcon sx={{ mr: 1 }} />
                Hub Details
              </Typography>
              <Typography>{currentBooking.hubDetails.name} (ID: {currentBooking.hubDetails.id})</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Typography>Name: {currentBooking.userDetails.name}</Typography>
              <Typography>Email: {currentBooking.userDetails.email}</Typography>
              <Typography>Phone: {currentBooking.userDetails.phone}</Typography>
              <Typography>Age Range: {currentBooking.userDetails.ageRange}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              <Typography>Date: {currentBooking.bookingDetails.bookDate}</Typography>
              <Typography>Start Time: {currentBooking.bookingDetails.bookStartTime}</Typography>
              <Typography>End Time: {currentBooking.bookingDetails.bookEndTime}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <DevicesIcon sx={{ mr: 1 }} />
                Tool Configuration
              </Typography>
              {renderToolConfiguration()}
            </Box>

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
              <Box component="form" onSubmit={(e) => {
                e.preventDefault();
                handlePaymentSubmit();
              }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  <CreditCardIcon sx={{ mr: 1 }} />
                  Payment Details
                </Typography>
                
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentDetailsChange}
                      variant="outlined"
                      required
                      inputProps={{ maxLength: 16 }}
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
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentDetailsChange}
                      variant="outlined"
                      required
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setPaymentMethod(null)}
                  >
                    Back to Payment Methods
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Payment'}
                  </Button>
                </Box>
              </Box>
            )}

            {paymentMethod === 'later' && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You've chosen to pay later. Your booking is pending.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setPaymentMethod(null)}
                >
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

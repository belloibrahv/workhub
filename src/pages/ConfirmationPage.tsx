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

// Validation Utilities
const validateCardNumber = (cardNumber: string): boolean => {
  const sanitizedNumber = cardNumber.replace(/\s/g, '');
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'later' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (!currentBooking?.formData?.hubId) {
      navigate('/');
      return;
    }
  
    setBookingDetails(currentBooking.formData);
    
    if (!window.bookingResults) {
      window.bookingResults = [];
    }
    
    window.currentBookingInfo = {};
  }, [currentBooking, navigate]);
  
  const handlePaymentMethodSelect = (method: 'now' | 'later') => {
    setPaymentMethod(method);
    setActiveStep((prevStep) => prevStep + 1); // Correctly move to next step
  };
  
  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async () => {
    setErrorMessage('');
    setLoading(true);
  
    if (paymentMethod === 'now') {
      // Validate card details
      if (!validateCardNumber(paymentDetails.cardNumber)) {
        setErrorMessage('Invalid card number. Please check and try again.');
        setLoading(false);
        return;
      }
      const [year, month] = paymentDetails.expiryDate.split('-');
      const expiryDate = new Date(+year, +month - 1);
      if (expiryDate < new Date()) {
        setErrorMessage('Card has expired.');
        setLoading(false);
        return;
      }
      if (!/^\d{3}$/.test(paymentDetails.cvv)) {
        setErrorMessage('Invalid CVV.');
        setLoading(false);
        return;
      }
    }
  
    try {
      const bookingResult = {
        ...currentBooking,
        bookingId: crypto.randomUUID(),
        formData: {
          ...currentBooking.formData,
          paymentDetails: {
            paymentMode: {
              payNow: paymentMethod === 'now',
              payLater: paymentMethod === 'later',
            },
            ...(paymentMethod === 'now' && { cardDetails: paymentDetails }),
          },
        },
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        isInFinalPage: true,
      };
  
      finalizeBooking(bookingResult);
      addBookingResult(bookingResult);
      navigate('/history', { replace: true });
    } catch (error) {
      setErrorMessage('Failed to save booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderToolConfiguration = () => {
    const tools = bookingDetails?.selectedTools || [];
    
    return (
      <Grid container spacing={2}>
        {tools.map((tool: any, index: number) => (
          <Grid item xs={12} sm={4} key={index}>
            <Chip 
              icon={<DevicesIcon />} 
              label={`${tool.type}: ${tool.label}`} 
              variant="outlined" 
            />
          </Grid>
        ))}
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
              <Typography>{bookingDetails?.hubId}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <DevicesIcon sx={{ mr: 1 }} />
                Selected Tools
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

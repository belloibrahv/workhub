import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';
import {
  CreditCard,
  Calendar,
  KeySquare,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  CreditCard as PaymentIcon,
} from 'lucide-react';

const validateCardNumber = (cardNumber: string) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [payNow, setPayNow] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentBooking?.formData?.hubId) {
      alert('No booking details found. Redirecting to home.');
      navigate('/');
      return;
    }
    setBookingDetails(currentBooking.formData);

    // Ensure window.bookingResults contains the current list of bookings
    window.bookingResults = currentBooking.bookingHistory || [];
  }, [currentBooking, navigate]);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
  
    if (!validateCardNumber(paymentDetails.cardNumber)) {
      setErrorMessage('Invalid card number.');
      return;
    }
  
    const expiryDate = new Date(paymentDetails.expiryDate);
    const today = new Date();
    if (expiryDate < today) {
      setErrorMessage('Card has expired.');
      return;
    }
  
    if (!/^\d{3}$/.test(paymentDetails.cvv)) {
      setErrorMessage('Invalid CVV.');
      return;
    }
  
    const updatedBooking = {
      ...currentBooking,
      formData: {
        ...currentBooking.formData,
        payment: {
          ...paymentDetails,
          payNow: true,
        },
        // Only store confirmed tools
        selectedTools: currentBooking.formData.selectedTools || [],
      },
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      isInFinalPage: true,
    };
  
    // Update the global state and window.bookingResults
    updateCurrentBooking(updatedBooking);
    addBookingResult(updatedBooking);
  
    // Update the global variable for testing with specific structure
    window.bookingResults = (window.bookingResults || []).map(booking => ({
      user: {
        name: booking.formData?.userDetails?.fullName || '',
        email: booking.formData?.userDetails?.email || '',
      },
      configuration: {
        RAM: booking.formData?.selectedTools?.find(tool => tool.type === 'ram')?.label || '',
        Storage: booking.formData?.selectedTools?.find(tool => tool.type === 'storage')?.label || '',
        'Operating system': booking.formData?.selectedTools?.find(tool => tool.type === 'os')?.label || '',
      },
      PaymentMethod: {
        payNow: booking.formData?.payment?.payNow || false,
        payLater: !booking.formData?.payment?.payNow || false,
      },
      PaymentDetails: {
        'card number': booking.formData?.payment?.cardNumber || '',
        'expiry date': booking.formData?.payment?.expiryDate || '',
        cvv: booking.formData?.payment?.cvv || '',
      },
      IsFinalPage: booking.isInFinalPage || false,
    }));
  
    window.currentBookingInfo = {
      user: {
        name: updatedBooking.formData?.userDetails?.fullName || '',
        email: updatedBooking.formData?.userDetails?.email || '',
      },
      configuration: {
        RAM: updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'ram')?.label || '',
        Storage: updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'storage')?.label || '',
        'Operating system': updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'os')?.label || '',
      },
      PaymentMethod: {
        payNow: updatedBooking.formData?.payment?.payNow || false,
        payLater: !updatedBooking.formData?.payment?.payNow || false,
      },
      PaymentDetails: {
        'card number': updatedBooking.formData?.payment?.cardNumber || '',
        'expiry date': updatedBooking.formData?.payment?.expiryDate || '',
        cvv: updatedBooking.formData?.payment?.cvv || '',
      },
      IsFinalPage: updatedBooking.isInFinalPage || false,
    };
  
    alert('Payment successful! Booking confirmed.');
    navigate('/history');
  };

  const handlePayLater = () => {
    const updatedBooking = {
      ...currentBooking,
      formData: {
        ...currentBooking.formData,
        payment: null,
        // Only store confirmed tools
        selectedTools: currentBooking.formData.selectedTools || [],
      },
      status: 'pending',
      timestamp: new Date().toISOString(),
      isInFinalPage: true,
    };
  
    // Update the global state and window.bookingResults
    updateCurrentBooking(updatedBooking);
    addBookingResult(updatedBooking);
  
    // Update the global variable for testing with specific structure
    // Similar to handlePaymentSubmit logic
    window.bookingResults = (window.bookingResults || []).map(booking => ({
      user: {
        name: booking.formData?.userDetails?.fullName || '',
        email: booking.formData?.userDetails?.email || '',
      },
      configuration: {
        RAM: booking.formData?.selectedTools?.find(tool => tool.type === 'ram')?.label || '',
        Storage: booking.formData?.selectedTools?.find(tool => tool.type === 'storage')?.label || '',
        'Operating system': booking.formData?.selectedTools?.find(tool => tool.type === 'os')?.label || '',
      },
      PaymentMethod: {
        payNow: false,
        payLater: true,
      },
      PaymentDetails: {
        'card number': '',
        'expiry date': '',
        cvv: '',
      },
      IsFinalPage: booking.isInFinalPage || false,
    }));
  
    window.currentBookingInfo = {
      user: {
        name: updatedBooking.formData?.userDetails?.fullName || '',
        email: updatedBooking.formData?.userDetails?.email || '',
      },
      configuration: {
        RAM: updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'ram')?.label || '',
        Storage: updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'storage')?.label || '',
        'Operating system': updatedBooking.formData?.selectedTools?.find(tool => tool.type === 'os')?.label || '',
      },
      PaymentMethod: {
        payNow: false,
        payLater: true,
      },
      PaymentDetails: {
        'card number': '',
        'expiry date': '',
        cvv: '',
      },
      IsFinalPage: updatedBooking.isInFinalPage || false,
    };
  
    alert('Booking saved as pending. You can pay later.');
    navigate('/history');
  };

  const renderConfigurationDetails = (configurations: any[]) => {
    const formattedConfig = configurations.reduce((acc, config) => {
      acc[config.type] = config.label;
      return acc;
    }, {} as Record<string, string>);

    return (
      <div className="formatted-configuration">
        <p><strong>RAM:</strong> <span>{formattedConfig.ram || 'Not Selected'}</span></p>
        <p><strong>Storage:</strong> <span>{formattedConfig.storage || 'Not Selected'}</span></p>
        <p><strong>Operating System:</strong> <span>{formattedConfig.os || 'Not Selected'}</span></p>
      </div>
    );
  };

  if (!bookingDetails) {
    return (
      <div className="confirmation-page">
        <h1 className="page-title">Loading booking details...</h1>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <h1 className="page-title">Booking Confirmation</h1>
      <div className="confirmation-card">
        <div className="hub-details">
          <h2 className="section-title">
            <MapPin size={20} />
            Hub Details
          </h2>
          <div className="hub-location">{bookingDetails.hubId}</div>
        </div>

        <div className="configuration-section">
          <h2 className="section-title">
            <Package size={20} />
            Selected Configuration
          </h2>
          {bookingDetails.selectedTools && bookingDetails.selectedTools.length > 0 ? (
            renderConfigurationDetails(bookingDetails.selectedTools)
          ) : (
            <p className="no-config-message">No configuration selected.</p>
          )}
        </div>

        {payNow === null ? (
          <div className="pay-options">
            <button className="pay-now-btn" onClick={() => setPayNow(true)}>
              <PaymentIcon size={20} />
              Pay Now
            </button>
            <button className="pay-later-btn" onClick={handlePayLater}>
              <Clock size={20} />
              Pay Later
            </button>
          </div>
        ) : (
          <form className="payment-form" onSubmit={handlePaymentSubmit}>
            <h2 className="section-title">
              <CreditCard size={20} />
              Payment Details
            </h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={16} />
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                maxLength={16}
                value={paymentDetails.cardNumber}
                onChange={handlePaymentChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Expiry Date
              </label>
              <input
                type="month"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <KeySquare size={16} />
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                maxLength={3}
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              <CheckCircle size={20} />
              Confirm and Pay
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;

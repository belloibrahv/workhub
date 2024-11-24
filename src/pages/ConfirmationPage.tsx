import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';

// Luhn's Algorithm for card validation
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
  const { addBookingResult } = useBookingStore();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [payNow, setPayNow] = useState<boolean | null>(null); // Removed the step state for simplification

  useEffect(() => {
    const currentBooking = window.bookingResults || null;
    if (!currentBooking || !currentBooking.hubId) {
      alert('No booking details found. Redirecting to home.');
      navigate('/');
    } else {
      setBookingDetails(currentBooking);
    }
  }, [navigate]);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate card number
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
      ...bookingDetails,
      payment: {
        ...paymentDetails,
        payNow: true,
      },
      status: 'confirmed',
      timestamp: new Date().toISOString(),
    };

    window.currentBookingInfo = updatedBooking;
    window.bookingResults = updatedBooking;

    addBookingResult(updatedBooking);

    alert('Payment successful! Booking confirmed.');
    navigate('/history');
  };

  const handlePayLater = () => {
    const updatedBooking = {
      ...bookingDetails,
      payment: null,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    window.currentBookingInfo = updatedBooking;
    window.bookingResults = updatedBooking;

    addBookingResult(updatedBooking);

    alert('Booking saved as pending. You can pay later.');
    navigate('/history');
  };

  if (!bookingDetails) {
    return (
      <div className="confirmation-page">
        <h1>Loading booking details...</h1>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <h1>Booking Confirmation</h1>
      <div className="confirmation-card">
        <h2>Hub Details</h2>
        <p><strong>Location:</strong> {bookingDetails.hubId}</p>
        <h2>Configuration</h2>
        <ul>
          {bookingDetails.selectedConfiguration?.map((config: any) => (
            <li key={config.id}>
              {config.name} (Quantity: {config.selectedQuantity})
            </li>
          ))}
        </ul>

        <div className="pay-options">
          <button
            className="pay-now-btn"
            onClick={() => setPayNow(true)}
            style={{ display: payNow === null ? 'inline-block' : 'none' }}
          >
            Pay Now
          </button>
          <button
            className="pay-later-btn"
            onClick={handlePayLater}
            style={{ display: payNow === null ? 'inline-block' : 'none' }}
          >
            Pay Later
          </button>
        </div>

        {payNow !== null && (
          <form className="payment-form" onSubmit={handlePaymentSubmit}>
            <h2>Payment Details</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                maxLength={16}
                value={paymentDetails.cardNumber}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="month"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                maxLength={3}
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Confirm and Pay
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;

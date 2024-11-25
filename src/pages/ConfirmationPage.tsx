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
  const { addBookingResult } = useBookingStore();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [payNow, setPayNow] = useState<boolean | null>(null);

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
          {bookingDetails.selectedConfiguration && bookingDetails.selectedConfiguration.length > 0 ? (
            <ul className="configuration-list">
              {bookingDetails.selectedConfiguration.map((config: any) => (
                <li key={config.id} className="configuration-item">
                  <span className="item-name">{config.id}</span>
                  <span className="item-value">{config.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-config-message">No configuration selected.</p>
          )}
        </div>

        {payNow === null ? (
          <div className="pay-options">
            <button
              className="pay-now-btn"
              onClick={() => setPayNow(true)}
            >
              <PaymentIcon size={20} />
              Pay Now
            </button>
            <button
              className="pay-later-btn"
              onClick={handlePayLater}
            >
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
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
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

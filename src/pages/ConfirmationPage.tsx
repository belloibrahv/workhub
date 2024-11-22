import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Retrieve booking information
    const currentBooking = window.bookingResults;
    setBookingDetails(currentBooking);

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleCheckout = () => {
    // Simulate checkout process
    window.bookingResults = {
      ...window.bookingResults,
      status: 'checked_out',
      checkoutTime: new Date().toISOString()
    };
    navigate('/');
  };

  if (!bookingDetails) {
    return <div>No booking details found</div>;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <h1>Booking Confirmed</h1>
        <div className="booking-summary">
          <h2>Hub Details</h2>
          <p>Hub ID: {bookingDetails.hubId}</p>
          <p>Booking Time: {new Date(bookingDetails.timestamp).toLocaleString()}</p>

          <h2>Selected Tools</h2>
          {bookingDetails.selectedTools && Object.entries(bookingDetails.selectedTools)
            .filter(([_, quantity]) => quantity > 0)
            .map(([toolId, quantity]) => (
              <div key={toolId} className="tool-item">
                <span>{toolId}</span>
                <span>Quantity: {quantity}</span>
              </div>
            ))}
        </div>

        <div className="confirmation-actions">
          <button onClick={handleCheckout} className="checkout-btn">
            Check Out
          </button>
          <p>Auto-redirecting in {countdown} seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;

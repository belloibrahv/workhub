import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';

const ConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [payNow, setPayNow] = useState<boolean | null>(null); // Null until user decides
    const { addBookingResult } = useBookingStore();

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
        if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
            alert('Please fill in all payment details.');
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

        // Update global variables
        window.currentBookingInfo = {
            ...updatedBooking,
            isInFinalPage: true,
        };
        window.bookingResults = updatedBooking;

        // Update store
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

        // Update global variables
        window.currentBookingInfo = {
            ...updatedBooking,
            isInFinalPage: true,
        };
        window.bookingResults = updatedBooking;

        // Update store
        addBookingResult(updatedBooking);

        alert('You can make payment later. Booking saved as pending.');
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
                <div className="booking-summary">
                    <h2>Hub Details</h2>
                    <p><strong>Location:</strong> {bookingDetails.hubId}</p>
                    <h2>Selected Tools</h2>
                    <ul>
                        {bookingDetails.selectedTools.map((tool: any) => (
                            <li key={tool.id}>
                                {tool.name} (Quantity: {tool.selectedQuantity})
                            </li>
                        ))}
                    </ul>
                </div>
                {payNow === null ? (
                    <div className="pay-options">
                        <button
                            className="pay-now-btn"
                            onClick={() => setPayNow(true)}
                        >
                            Pay Now
                        </button>
                        <button
                            className="pay-later-btn"
                            onClick={handlePayLater}
                        >
                            Pay Later
                        </button>
                    </div>
                ) : payNow ? (
                    <form className="payment-form" onSubmit={handlePaymentSubmit}>
                        <h2>Payment Details</h2>
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
                ) : null}
            </div>
        </div>
    );
};

export default ConfirmationPage;

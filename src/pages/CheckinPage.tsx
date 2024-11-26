import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/booking';

const CheckinPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();

  const { currentBooking, updateCurrentBooking, addBookingResult } = useBookingStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    visitDay: '',
    startHour: '',
    endHour: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prepopulate the form if user details already exist
    if (currentBooking?.formData?.userDetails) {
      setFormData({
        ...formData,
        ...currentBooking.formData.userDetails,
      });
    }
  }, [currentBooking]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, age, visitDay, startHour, endHour } = formData;

    if (!fullName.trim()) return 'Full Name is required.';
    if (fullName.length < 3) return 'Full Name must be at least 3 characters long.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return 'Please enter a valid email address.';
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phone || !phoneRegex.test(phone)) return 'Phone Number must be between 10 and 15 digits.';
    if (!age) return 'Age range is required.';
    if (!visitDay) return 'Visit Day is required.';
    if (!startHour) return 'Start Hour is required.';
    if (!endHour) return 'End Hour is required.';
    if (startHour >= endHour) return 'End Hour must be later than Start Hour.';

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const userDetails = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      age: formData.age,
    };

    const bookingDetails = {
      hubId,
      userDetails,
      visitDay: formData.visitDay,
      startHour: formData.startHour,
      endHour: formData.endHour,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      isInFinalPage: false,
    };

    // Update the global state
    updateCurrentBooking({
      formData: { userDetails, ...bookingDetails },
      currentStep: 'tools',
      isInFinalPage: false,
    });

    // Save the booking to bookingHistory and localStorage
    addBookingResult(bookingDetails);

    // Update the global variable for browser testing
    window.currentBookingInfo = bookingDetails;

    navigate(`/tools/${hubId}`);
  };

  return (
    <div className="checkin-page">
      <h1>Check In to Your Hub</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="checkin-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Age</label>
          <select
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Age Range</option>
            <option value="16-20">16-20</option>
            <option value="21-25">21-25</option>
            <option value="26-30">26-30</option>
            <option value="31+">31 and above</option>
          </select>
        </div>
        <div className="form-group">
          <label>Visit Day</label>
          <input
            type="date"
            name="visitDay"
            value={formData.visitDay}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Start Hour</label>
          <input
            type="time"
            name="startHour"
            value={formData.startHour}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Hour</label>
          <input
            type="time"
            name="endHour"
            value={formData.endHour}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Proceed to Tools
        </button>
      </form>
    </div>
  );
};

export default CheckinPage;

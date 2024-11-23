// src/pages/CheckinPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CheckinPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, age, visitDay, startHour, endHour } = formData;
    if (!fullName || !email || !phone || !age || !visitDay || !startHour || !endHour) {
      return 'All fields are required.';
    }
    if (new Date(visitDay) < new Date()) {
      return 'Visit day cannot be in the past.';
    }
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

    // Save booking information to global variable for later use
    window.currentBookingInfo = {
      hubId,
      userDetails: formData,
      isInFinalPage: false,
    };

    navigate(`/tools/${hubId}`);
  };

  return (
    <div className="checkin-page">
      <h1>Check In to Your Hub</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="checkin-form">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Visit Day</label>
          <input type="date" name="visitDay" value={formData.visitDay} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Start Hour</label>
          <input type="time" name="startHour" value={formData.startHour} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>End Hour</label>
          <input type="time" name="endHour" value={formData.endHour} onChange={handleInputChange} required />
        </div>
        <button type="submit" className="submit-btn">Proceed to Tools</button>
      </form>
    </div>
  );
};

export default CheckinPage;

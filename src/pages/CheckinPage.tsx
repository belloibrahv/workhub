import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hub } from '../types/Hub';

interface CheckinFormData {
  name: string;
  email: string;
  occupation: string;
}

const HUBS: Hub[] = [
  {
    id: 'lekki',
    name: 'Lekki Hub',
    location: 'Lekki, Lagos',
    price: 5000,
    imageUrl: '/images/lekki-hub.jpg'
  },
  // Previous hubs...
];

const CheckinPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  
  const selectedHub = HUBS.find(hub => hub.id === hubId);

  const [formData, setFormData] = useState<CheckinFormData>({
    name: '',
    email: '',
    occupation: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate booking information for model training
    window.currentBookingInfo = {
      hub: selectedHub,
      userDetails: formData,
      isInFinalPage: true
    };

    // Simulate booking result
    window.bookingResults = {
      status: 'success',
      hubId: hubId,
      userDetails: formData,
      timestamp: new Date().toISOString()
    };

    // Navigate to tool selection page
    navigate(`/tools/${hubId}`);
  };

  if (!selectedHub) {
    return <div>Hub not found</div>;
  }

  return (
    <div className="checkin-page">
      <h1>Check-in to {selectedHub.name}</h1>
      <div className="checkin-container">
        <div className="hub-info">
          <h2>{selectedHub.name}</h2>
          <p>Location: {selectedHub.location}</p>
          <p>Access Fee: ₦{selectedHub.price}</p>
        </div>
        <form onSubmit={handleSubmit} className="checkin-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckinPage;

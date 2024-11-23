// src/pages/HubDetailPage.tsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Hub } from '../types/Hub';

import ikeja_1 from '../assets/images/ikeja_1.jpg';
import ikeja_2 from '../assets/images/ikeja_2.jpg';
import sango_1 from '../assets/images/sango_1.jpg';


// Mock hub data (to be replaced with API calls if available)
const HUBS: Hub[] = [
  { id: 'lekki', name: 'Lekki Hub', location: 'Lekki, Lagos', price: 5000, imageUrl: ikeja_1 },
  { id: 'sango', name: 'Sango Hub', location: 'Sango, Lagos', price: 4500, imageUrl: ikeja_2 },
  { id: 'yaba', name: 'Yaba Hub', location: 'Yaba, Lagos', price: 4000, imageUrl: sango_1 },
];

const HubDetailPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();

  // Find the selected hub by ID
  const hub = HUBS.find((h) => h.id === hubId);

  if (!hub) {
    return (
      <div className="hub-detail-page">
        <h1>Hub not found</h1>
        <button onClick={() => navigate('/')} className="back-btn">Go Back to Home</button>
      </div>
    );
  }

  return (
    <div className="hub-detail-page">
      <div className="hub-detail-container">
        <img src={hub.imageUrl} alt={hub.name} className="hub-image" />
        <div className="hub-info">
          <h1>{hub.name}</h1>
          <p><strong>Location:</strong> {hub.location}</p>
          <p><strong>Access Fee:</strong> ₦{hub.price.toLocaleString()} per hour</p>
          <Link to={`/checkin/${hub.id}`} className="book-btn">Check In</Link>
        </div>
      </div>
    </div>
  );
};

export default HubDetailPage;

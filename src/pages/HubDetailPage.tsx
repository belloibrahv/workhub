import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Hub } from '../types/Hub';

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

const HubDetailPage: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const hub = HUBS.find(h => h.id === hubId);

  if (!hub) {
    return <div>Hub not found</div>;
  }

  return (
    <div className="hub-detail-page">
      <div className="hub-detail-container">
        <img src={hub.imageUrl} alt={hub.name} className="hub-image" />
        <div className="hub-info">
          <h1>{hub.name}</h1>
          <p>Location: {hub.location}</p>
          <p>Access Fee: ₦{hub.price}</p>
          <Link to={`/checkin/${hub.id}`} className="book-btn">
            Book this Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HubDetailPage;

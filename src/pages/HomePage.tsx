import React from 'react';
import { Link } from 'react-router-dom';
import { Hub } from '../types/Hub';

const HUBS: Hub[] = [
  {
    id: 'lekki',
    name: 'Lekki Hub',
    location: 'Lekki, Lagos',
    price: 5000,
    imageUrl: '/images/lekki-hub.jpg'
  },
  {
    id: 'sango',
    name: 'Sango Hub',
    location: 'Sango, Lagos',
    price: 4500,
    imageUrl: '/images/sango-hub.jpg'
  },
  // Add other hub locations as specified
];

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Workhub Locations</h1>
      <div className="hub-grid">
        {HUBS.map(hub => (
          <div key={hub.id} className="hub-card">
            <img src={hub.imageUrl} alt={hub.name} />
            <h2>{hub.name}</h2>
            <p>Location: {hub.location}</p>
            <p>Price: ₦{hub.price}</p>
            <Link to={`/hub/${hub.id}`}>Select Hub</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

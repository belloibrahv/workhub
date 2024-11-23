import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hub } from '../types/Hub';

import ikeja_1 from '../assets/images/ikeja_1.jpg';
import ikeja_2 from '../assets/images/ikeja_2.jpg';
import sango_1 from '../assets/images/sango_1.jpg';


const HomePage: React.FC = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mocking hub data. Replace with an API call if available.
    const fetchHubs = async () => {
      try {
        setLoading(true);
        // Simulated delay for loading
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data: Hub[] = [
          { id: 'lekki', name: 'Lekki Hub', location: 'Lekki, Lagos', price: 5000, imageUrl: ikeja_1 },
          { id: 'sango', name: 'Sango Hub', location: 'Sango, Lagos', price: 4500, imageUrl: ikeja_2 },
          { id: 'yaba', name: 'Yaba Hub', location: 'Yaba, Lagos', price: 4000, imageUrl: sango_1 },
        ];
        setHubs(data);
      } catch (err) {
        setError('Failed to load hubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHubs();
  }, []);

  if (loading) return <div>Loading hubs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
      <div className="home-page">
          <header className="banner">
          <h1>Welcome to Workhub</h1>
          <p>Your gateway to premium workspace solutions.</p>
          <a href="#hubs" className="cta-btn">Explore Hubs</a>
      </header>
      <section className="features">
          <div className="feature-card">Access Premium Tools</div>
          <div className="feature-card">Multiple Locations</div>
          <div className="feature-card">Seamless Payments</div>
      </section>

      <h1>Available Work Hubs</h1>
      <div className="hub-grid">
        {hubs.map((hub) => (
          <div key={hub.id} className="hub-card">
            <img src={hub.imageUrl} alt={hub.name} />
            <h2>{hub.name}</h2>
            <p>Location: {hub.location}</p>
            <p>Price: ₦{hub.price.toLocaleString()} per hour</p>
            <Link to={`/hub/${hub.id}`} className="book-btn">
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
